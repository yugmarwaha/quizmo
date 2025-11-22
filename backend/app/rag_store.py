# app/rag_store.py
import os
import glob
from dataclasses import dataclass
from typing import List, Optional

import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

# Configure Gemini client with API key from env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY not set. Set it in your environment or .env file."
    )

genai.configure(api_key=GEMINI_API_KEY)

KB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge_base")

# You can also use "text-embedding-004" if available on your account
EMBED_MODEL = "models/embedding-001"


@dataclass
class KBChunk:
    id: str
    source: str
    text: str
    embedding: np.ndarray
    course_id: Optional[str]


_KB: List[KBChunk] = []
_BUILT = False


def embed_text(text: str) -> np.ndarray:
    """Get embedding vector for a piece of text using Gemini."""
    # For long text, you might want to truncate or summarize first,
    # but for now we just send the whole chunk.
    result = genai.embed_content(
        model=EMBED_MODEL,
        content=text,
        task_type="retrieval_document",
    )
    # google-generativeai returns a dict with "embedding" = list[float]
    vec = np.array(result["embedding"], dtype="float32")
    return vec


def build_kb():
    """Load all course text files, chunk, embed, and cache in memory."""
    global _KB, _BUILT
    if _BUILT:
        return

    if not os.path.isdir(KB_DIR):
        print(f"[RAG] No knowledge_base directory at {KB_DIR}, skipping.")
        _BUILT = True
        return

    print(f"[RAG] Building KB from {KB_DIR} ...")

    chunk_size = 800
    overlap = 200

    # Loop over course directories (e.g. knowledge_base/cs540/*.txt)
    for course_dir in os.listdir(KB_DIR):
        course_path = os.path.join(KB_DIR, course_dir)
        if not os.path.isdir(course_path):
            continue  # skip files at root

        course_id = course_dir  # e.g. "cs540"

        for path in glob.glob(os.path.join(course_path, "*.txt")):
            with open(path, "r", encoding="utf-8") as f:
                full_text = f.read()

            source_name = os.path.basename(path)

            start = 0
            idx = 0
            while start < len(full_text):
                end = start + chunk_size
                chunk_text = full_text[start:end]
                if chunk_text.strip():
                    chunk_id = f"{course_id}-{source_name}-chunk-{idx}"
                    emb = embed_text(chunk_text)
                    _KB.append(
                        KBChunk(
                            id=chunk_id,
                            source=source_name,
                            text=chunk_text,
                            embedding=emb,
                            course_id=course_id,
                        )
                    )
                    idx += 1
                start = end - overlap  # slide window with overlap

    print(f"[RAG] Built KB with {len(_KB)} chunks.")
    _BUILT = True


def search_kb(query: str, top_k: int = 5, course_id: Optional[str] = None) -> List[KBChunk]:
    """Return top_k KB chunks most similar to the query, optionally filtered by course."""
    build_kb()

    # Filter chunks by course_id if provided
    if course_id:
        candidates = [c for c in _KB if c.course_id == course_id]
    else:
        candidates = _KB

    if not candidates:
        return []

    q_emb = embed_text(query)

    kb_matrix = np.stack([c.embedding for c in candidates], axis=0)
    q_norm = np.linalg.norm(q_emb) + 1e-8
    kb_norms = np.linalg.norm(kb_matrix, axis=1) + 1e-8
    sims = (kb_matrix @ q_emb) / (kb_norms * q_norm)

    top_idx = np.argsort(-sims)[:top_k]

    return [candidates[i] for i in top_idx]
