# Cafe Bot - RAG-Powered Chatbot

FastAPI-based chatbot service that uses RAG (Retrieval-Augmented Generation) to answer questions about the cafe menu.

## Features

- **RAG Architecture**: Uses FAISS vector search + Gemini LLM
- **Streaming Responses**: Real-time streaming for better UX
- **Session Management**: Maintains conversation context per user
- **Constraint Extraction**: Understands user queries (price, diet, category)

## Local Development

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Run the Service**
   ```bash
   python main.py
   # Or use uvicorn directly:
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Test the API**
   - API Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/docs

## API Endpoints

- `POST /chat/stream` - Stream chat responses
  ```json
  {
    "message": "I want something under 200 rupees",
    "session_id": "user_123"
  }
  ```

- `POST /chat/clear` - Clear session history
  ```json
  {
    "session_id": "user_123"
  }
  ```

## Deployment on Render

See `DEPLOYMENT.md` for detailed deployment instructions.

## Project Structure

```
cafe-bot/
├── app/
│   ├── main.py              # FastAPI app definition
│   └── features/
│       └── cafe_chatbot/
│           ├── chatbot.py   # Main orchestrator
│           ├── llm/         # Gemini LLM integration
│           ├── retrieval/   # FAISS vector search
│           └── query_understanding/  # Constraint extraction
├── storage/
│   └── cafe_faiss/         # FAISS index files
├── scripts/                # Utility scripts
├── requirements.txt
├── main.py                 # Entry point for Render
└── render.yaml            # Render deployment config
```

## Environment Variables

- `GEMINI_API_KEY` (required): Google Gemini API key
- `PORT` (optional): Server port (default: 8000)
