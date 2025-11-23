# Quizmo

A full-stack quiz application built with React (frontend) and FastAPI (backend) for generating and taking interactive quizzes with multiple question types including multiple-choice, true/false, and multi-correct options.

## Features

- **AI-Powered Quiz Generation**: Generate quizzes from lecture text using Google's Gemini AI
- **Multiple Question Types**: Support for multiple-choice questions (single correct), true/false questions, and multiple-choice questions (multi-correct)
- **Difficulty Levels**: Easy, medium, and hard questions
- **Real-time Quiz Taking**: Interactive quiz interface with immediate feedback
- **Results Analytics**: Detailed performance breakdown by difficulty and question review
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Recharts** for data visualization
- **ESLint** for code quality

### Backend

- **FastAPI** for the REST API
- **Google Generative AI (Gemini)** for quiz generation
- **Pydantic** for data validation
- **RAG (Retrieval-Augmented Generation)** for context-aware quiz creation

## Project Structure

```
quizmo/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components (Home, Quiz, Results)
│   │   ├── services/    # API service functions
│   │   └── types/       # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── backend/           # FastAPI backend application
│   ├── app/
│   │   ├── main.py       # FastAPI application entry point
│   │   ├── schemas.py    # Pydantic models
│   │   ├── rag_store.py  # RAG implementation for knowledge base
│   │   └── agent/        # AI agent for quiz generation
│   │       └── quiz_agent.py
│   ├── requirements.txt  # Python dependencies
│   └── venv/            # Virtual environment (created locally)
└── README.md
```

## Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Google AI API Key** (for Gemini AI)

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
   Create a `.env` file in the project root or `backend/` directory with:

   ```
   GEMINI_API_KEY=your_google_ai_api_key_here
   ```

6. (Optional) Add course materials:
   Place text files in `backend/knowledge_base/` for RAG context.

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
        "difficulty": "easy"
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

## Development

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts

- `python -m uvicorn app.main:app --reload` - Start development server
- API documentation available at `http://localhost:8000/docs` (Swagger UI)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for hackathon purposes
- Uses Google's Gemini AI for intelligent quiz generation
- Inspired by modern educational technology trends
