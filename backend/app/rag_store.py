# app/rag_store.py
import os
import glob
from dataclasses import dataclass
from typing import List, Optional

import numpy as np
from openai import OpenAI
from dotenv import load_dotenv
from pinecone import Pinecone  # NEW

# Load environment variables from .env if present
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY not set. Set it in your environment or .env file."
    )

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
if not PINECONE_API_KEY:
    raise RuntimeError(
        "PINECONE_API_KEY not set. Set it in your environment or .env file."
    )

# If you're using a serverless index, Pinecone console will show a "host" URL.
# Put that URL in your .env as PINECONE_INDEX_HOST.
PINECONE_INDEX_HOST = os.getenv("PINECONE_INDEX_HOST")
if not PINECONE_INDEX_HOST:
    raise RuntimeError(
        "PINECONE_INDEX_HOST not set. Get the host from Pinecone console and "
        "set PINECONE_INDEX_HOST in your environment or .env file."
    )

# Name is optional here but nice to have for logging
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "quiz-questions")

client = OpenAI(api_key=OPENAI_API_KEY)

# Pinecone client + index
pc = Pinecone(api_key=PINECONE_API_KEY)
kb_index = pc.Index(host=PINECONE_INDEX_HOST)

KB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge_base")

# Recommended OpenAI embedding model
EMBED_MODEL = "text-embedding-3-small"


@dataclass
class KBChunk:
    id: str
    source: str
    text: str
    embedding: Optional[np.ndarray] 
    course_id: Optional[str]


_BUILT = False


def embed_text(text: str) -> np.ndarray:
    """Get embedding vector for a piece of text using OpenAI embeddings."""
    resp = client.embeddings.create(
        model=EMBED_MODEL,
        input=text,
    )
    vec = np.array(resp.data[0].embedding, dtype="float32")
    return vec


def build_kb():
    """
    Load all course text files, chunk, embed, and upsert into Pinecone.

    This runs once per process (guarded by _BUILT).
    """
    global _BUILT
    if _BUILT:
        return

    if not os.path.isdir(KB_DIR):
        print(f"[RAG] No knowledge_base directory at {KB_DIR}, skipping.")
        _BUILT = True
        return

    print(f"[RAG] Building KB from {KB_DIR} into Pinecone index '{PINECONE_INDEX_NAME}' ...")

    # Tuned for small demo KB (~10 files)
    chunk_size = 1500          # bigger chunks → fewer total chunks
    overlap = 200              # small overlap to keep continuity
    max_chunks_per_file = 10   # hard cap per file for speed/cost

    total_chunks = 0
    total_files = 0

    for course_dir in os.listdir(KB_DIR):
        course_path = os.path.join(KB_DIR, course_dir)
        if not os.path.isdir(course_path):
            continue  # skip files at root

        course_id = course_dir  # e.g. "cs540"

        for path in glob.glob(os.path.join(course_path, "*.txt")):
            total_files += 1
            print(f"[RAG] Embedding file {total_files}: {path}")
            with open(path, "r", encoding="utf-8") as f:
                full_text = f.read()

            source_name = os.path.basename(path)

            start = 0
            idx = 0
            vectors_to_upsert = []

            while start < len(full_text) and idx < max_chunks_per_file:
                end = start + chunk_size
                chunk_text = full_text[start:end]

                if chunk_text.strip():
                    chunk_id = f"{course_id}-{source_name}-chunk-{idx}"
                    emb = embed_text(chunk_text)

                    vectors_to_upsert.append(
                        (
                            chunk_id,
                            emb.tolist(),
                            {
                                "course_id": course_id,
                                "source": source_name,
                                "text": chunk_text,
                            },
                        )
                    )

                    idx += 1
                    total_chunks += 1
                    if total_chunks % 10 == 0:
                        print(f"[RAG] Prepared {total_chunks} chunks so far...")

                # slide window with overlap
                start = end - overlap

            if vectors_to_upsert:
                kb_index.upsert(vectors=vectors_to_upsert)
                print(
                    f"[RAG] Upserted {len(vectors_to_upsert)} chunks from {source_name} to Pinecone."
                )

    print(f"[RAG] Built KB with {total_chunks} chunks from {total_files} files (Pinecone).")
    _BUILT = True


def search_kb(
    query: str,
    top_k: int = 5,
    course_id: Optional[str] = None,
) -> List[KBChunk]:
    """
    Return top_k KB chunks most similar to the query, using Pinecone.
    Optionally filter by course_id.
    """
    # Make sure we've loaded & indexed the KB
    build_kb()

    # Embed the query (lecture transcript or portion of it)
    q_emb = embed_text(query).tolist()

    # Filter by course_id if provided
    pinecone_filter = {"course_id": course_id} if course_id else None

    res = kb_index.query(
        vector=q_emb,
        top_k=top_k,
        include_metadata=True,
        filter=pinecone_filter,
    )

    # Depending on SDK version, res may be a dict or object; handle both.
    matches = getattr(res, "matches", None) or res.get("matches", [])

    chunks: List[KBChunk] = []
    for m in matches:
        # m.metadata may be dict or attribute; handle dict case
        md = getattr(m, "metadata", None) or {}
        chunks.append(
            KBChunk(
                id=getattr(m, "id", None) or md.get("id", ""),
                source=md.get("source", ""),
                text=md.get("text", ""),
                embedding=None,  # not needed downstream
                course_id=md.get("course_id"),
            )
        )

    return chunks
