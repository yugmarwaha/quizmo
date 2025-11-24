# Quizmo

A full-stack AI-powered quiz application built with React (frontend) and FastAPI (backend) for generating and taking interactive quizzes with multiple question types including multiple-choice, true/false, and multi-correct options.

## Features

- **AI-Powered Quiz Generation**: Generate quizzes from lecture text using OpenAI's GPT-5.1
- **RAG-Enhanced Generation**: Uses Pinecone vector database for context-aware quiz creation from knowledge base
- **Multiple Question Types**: Support for multiple-choice questions (single correct), true/false questions, and multiple-choice questions (multi-correct)
- **Difficulty Levels**: Easy, medium, and hard questions
- **Real-time Quiz Taking**: Interactive quiz interface with progress tracking and time analytics
- **Personalized Recommendations**: AI-generated study recommendations based on quiz performance
- **Results Analytics**: Detailed performance breakdown by difficulty with visual charts
- **User Quiz Management**: Save quizzes to DynamoDB profile and retrieve them later
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Axios** for API communication
- **Recharts** for data visualization
- **ESLint** for code quality

### Backend

- **FastAPI** for the REST API
- **OpenAI GPT-5.1** for quiz generation and personalized recommendations
- **Pydantic** for data validation
- **Pinecone** for vector database and semantic search
- **RAG (Retrieval-Augmented Generation)** for context-aware quiz creation
- **AWS DynamoDB** for user quiz storage
- **Boto3** for AWS integration

## Project Structure

```
quizmo/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components (Analytics)
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── GenerateQuiz.tsx
│   │   │   ├── QuizPage.tsx
│   │   │   └── ResultsPage.tsx
│   │   ├── services/      # API service functions
│   │   │   ├── api.ts
│   │   │   └── mockData.ts
│   │   └── types/         # TypeScript type definitions
│   │       └── quiz.ts
│   ├── package.json
│   └── vite.config.ts
├── backend/               # FastAPI backend application
│   ├── app/
│   │   ├── main.py        # FastAPI application entry point
│   │   ├── schemas.py     # Pydantic models
│   │   ├── auth.py        # User authentication (demo mode)
│   │   ├── rag_store.py   # RAG implementation with Pinecone
│   │   ├── agent/         # AI agent for quiz generation
│   │   │   └── quiz_agent.py
│   │   ├── db/            # Database layer
│   │   │   └── quizzes_db.py  # DynamoDB operations
│   │   └── game/          # Game state management
│   │       └── state.py
│   ├── knowledge_base/    # Course materials for RAG
│   │   ├── cs540/         # Computer Science course
│   │   └── soc125/        # Sociology course
│   └── requirements.txt   # Python dependencies
└── README.md
```

## Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **OpenAI API Key** (for GPT-5.1)
- **Pinecone API Key** (for vector database)
- **AWS Account** (for DynamoDB storage)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:

   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   Create a `.env` file in the `backend/` directory with:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX_HOST=your_pinecone_index_host_here
   PINECONE_INDEX_NAME=quiz-questions
   AWS_REGION=us-east-2
   DDB_QUIZZES_TABLE=UserQuizzes
   ```

6. Set up Pinecone:

   - Create a Pinecone account at https://www.pinecone.io/
   - Create a new index named `quiz-questions` with dimension 1536 (for OpenAI embeddings)
   - Copy the index host URL to your `.env` file

7. Set up AWS DynamoDB:

   - Create a DynamoDB table named `UserQuizzes`
   - Set partition key as `userId` (String) and sort key as `quizId` (String)
   - Configure AWS credentials on your system

8. (Optional) Add course materials:
   Place text files in `backend/knowledge_base/<course_id>/` for RAG context. Example:
   - `backend/knowledge_base/cs540/lec01.txt`
   - `backend/knowledge_base/soc125/lec01.txt`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Running the Application

1. Start the backend server:

   ```bash
   cd backend
   source venv/bin/activate  # Activate virtual environment
   python -m uvicorn app.main:app --reload
   ```

2. Start the frontend (in a separate terminal):

   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Generate Quiz

- **POST** `/api/generate_quiz`
- **Body**:
  ```json
  {
    "lectureText": "Your lecture content here...",
    "courseId": "optional-course-identifier",
    "numQuestions": 10
  }
  ```
- **Response**: Quiz object with questions of different types:
  ```json
  {
    "id": "quiz-123",
    "title": "Generated Quiz",
    "questions": [
      {
        "id": "q1",
        "type": "mcq",
        "question": "What is the capital of France?",
        "options": ["London", "Paris", "Berlin", "Madrid"],
        "answer": "Paris",
        "difficulty": "easy",
        "explanation": "Paris is the capital city of France."
      },
      {
        "id": "q2",
        "type": "tf",
        "question": "Paris is the capital of France.",
        "options": null,
        "answer": "True",
        "difficulty": "easy"
      },
      {
        "id": "q3",
        "type": "mcq_multi",
        "question": "Which of these are programming languages?",
        "options": ["Python", "HTML", "JavaScript", "CSS"],
        "answer": ["Python", "JavaScript"],
        "difficulty": "medium"
      }
    ]
  }
  ```

**Question Types:**

- `mcq`: Multiple choice with single correct answer
- `tf`: True/False questions
- `mcq_multi`: Multiple choice with multiple correct answers (select all that apply)

### Generate Recommendations

- **POST** `/api/generate_recommendations`
- **Body**:
  ```json
  {
    "performanceData": {
      "quiz": { "id": "...", "title": "...", "questions": [...] },
      "userAnswers": [
        {
          "questionId": "q1",
          "selectedAnswer": "Paris",
          "isCorrect": true,
          "timeSpent": 15
        }
      ],
      "totalTime": 300,
      "scorePercentage": 75.0
    }
  }
  ```
- **Response**: Personalized recommendations:
  ```json
  {
    "recommendations": [
      {
        "type": "study_focus",
        "title": "Focus on Hard Questions",
        "description": "You struggled with hard questions...",
        "priority": "high"
      }
    ],
    "overallAssessment": "Good performance with room for improvement...",
    "improvementAreas": ["Time management", "Hard question practice"]
  }
  ```

### User Quiz Management

- **POST** `/api/quizzes` - Save a quiz to user profile
- **GET** `/api/quizzes` - List all quizzes for current user
- **GET** `/api/quizzes/{quiz_id}` - Get a specific quiz by ID

## Key Features Explained

### RAG (Retrieval-Augmented Generation)

The application uses RAG to enhance quiz generation with relevant course content:

1. **Knowledge Base**: Course materials are stored in `backend/knowledge_base/` organized by course ID
2. **Text Chunking**: Lecture files are automatically chunked (1500 chars with 200 char overlap)
3. **Embeddings**: Each chunk is embedded using OpenAI's `text-embedding-3-small` model
4. **Vector Storage**: Embeddings are stored in Pinecone for fast semantic search
5. **Context Retrieval**: When generating a quiz, relevant chunks are retrieved and provided to GPT-5.1

### Personalized Recommendations

After completing a quiz, users receive AI-generated recommendations:

- **Performance Analysis**: Analyzes scores by difficulty level and question types
- **Time Management**: Evaluates time spent per question
- **Study Focus Areas**: Identifies weak topics and suggests improvement strategies
- **Learning Strategies**: Provides actionable study tips tailored to performance
- **Priority Levels**: Recommendations are categorized as high, medium, or low priority

### Quiz Flow

1. **Generate**: User inputs lecture text → System queries knowledge base → GPT-5.1 generates questions
2. **Take Quiz**: Interactive interface with progress tracking and time analytics
3. **View Results**: Detailed breakdown with performance charts, correct answers, and explanations
4. **Get Recommendations**: AI analyzes performance and provides personalized study guidance
5. **Save Progress**: Quizzes can be saved to user profile in DynamoDB

## Development

### Frontend Scripts

- `npm run dev` - Start development server (default: http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts

- `python -m uvicorn app.main:app --reload` - Start development server
- API documentation available at `http://localhost:8000/docs` (Swagger UI)
- Interactive API docs at `http://localhost:8000/redoc` (ReDoc)

### Configuration

**Frontend** (`frontend/src/services/api.ts`):

- `API_BASE`: Backend API URL (default: `http://localhost:8000`)
- `USE_MOCK`: Toggle between mock and real API (default: `false`)

**Backend** (`backend/app/agent/quiz_agent.py`):

- `MODEL_NAME`: OpenAI model for quiz generation (default: `gpt-5.1-chat-latest`)
- `EMBED_MODEL`: OpenAI embedding model (default: `text-embedding-3-small`)

**RAG Configuration** (`backend/app/rag_store.py`):

- `chunk_size`: 1500 characters per chunk
- `overlap`: 200 characters between chunks
- `max_chunks_per_file`: 10 chunks per file
- `top_k`: 5 relevant chunks retrieved per query

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Environment Variables Reference

### Backend Required Variables

| Variable              | Description                | Example                                      |
| --------------------- | -------------------------- | -------------------------------------------- |
| `OPENAI_API_KEY`      | OpenAI API key for GPT-5.1 | `sk-...`                                     |
| `PINECONE_API_KEY`    | Pinecone API key           | `your-pinecone-key`                          |
| `PINECONE_INDEX_HOST` | Pinecone index host URL    | `https://quiz-questions-xxx.svc.pinecone.io` |
| `PINECONE_INDEX_NAME` | Pinecone index name        | `quiz-questions`                             |
| `AWS_REGION`          | AWS region for DynamoDB    | `us-east-2`                                  |
| `DDB_QUIZZES_TABLE`   | DynamoDB table name        | `UserQuizzes`                                |

## Acknowledgments

- Built for hackathon purposes
- Uses OpenAI's GPT-5.1 for intelligent quiz generation and personalized recommendations
- Leverages Pinecone for vector search and RAG implementation
- Inspired by modern educational technology trends
