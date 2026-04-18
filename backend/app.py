from fastapi import FastAPI
from pydantic import BaseModel
from .retrieval import retrieve_answer

app = FastAPI(title="AmEx FinAssist")

class Query(BaseModel):
    query: str

@app.post("/ask")
def ask(query: Query):
    answer, sources = retrieve_answer(query.query)
    return {"answer": answer, "sources": sources}
