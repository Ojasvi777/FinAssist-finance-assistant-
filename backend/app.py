from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from rag_pipeline import answer_question

app = FastAPI(title="AmEx FinAssist")

# Allow your deployed frontend (and local dev) to call this API.
# Replace "*" with your actual Vercel URL once you have it, e.g.
# ["https://amex-finassist.vercel.app", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HistoryTurn(BaseModel):
    question: str
    answer: str


class Query(BaseModel):
    query: str
    history: Optional[List[HistoryTurn]] = []


@app.post("/ask")
def ask(payload: Query):
    history = [h.dict() for h in payload.history]
    answer, sources = answer_question(payload.query, history)
    return {"answer": answer, "sources": sources}


@app.get("/health")
def health():
    return {"status": "ok"}