"""
AmEx FinAssist - RAG pipeline.
Loads a prebuilt FAISS index (built once via crawl.py + build_index.py) and
answers questions using Gemini. No training or crawling happens at query time.

Run directly for a terminal chat: python rag_pipeline.py
Or import answer_question() from backend/app.py for the API.
"""

import os
import faiss
import pickle
from sentence_transformers import SentenceTransformer
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
GEMINI_MODEL = "gemini-2.5-flash"

INDEX_PATH = "data/index/faiss.index"
META_PATH = "data/index/metadata.pkl"

index = faiss.read_index(INDEX_PATH)
with open(META_PATH, "rb") as f:
    metadata = pickle.load(f)  # list of {"text":..., "url":..., "title":...}

embed_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def _gen(prompt: str) -> str:
    response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
    return response.text.strip()


def search_docs(query: str, k: int = 4):
    query_vec = embed_model.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(query_vec)  # must match how the index was built (cosine via IP)
    scores, indices = index.search(query_vec, k)
    results = []
    for i in indices[0]:
        if i == -1:
            continue
        entry = metadata[i]
        # Backward-compat: if metadata.pkl is stale (old plain-string format),
        # wrap it so downstream code doesn't crash. Rebuild the index to fix properly.
        if isinstance(entry, str):
            entry = {"text": entry, "url": "", "title": "Unknown"}
        results.append(entry)
    return results


def condense_question(history: list, question: str) -> str:
    """Rewrite a follow-up question into a standalone one using recent history."""
    if not history:
        return question

    history_text = "\n".join(
        f"User: {h['question']}\nAssistant: {h['answer']}" for h in history[-3:]
    )
    prompt = f"""Given this conversation history and a follow-up question, rewrite the
follow-up as a standalone question that includes any needed context. Only output
the rewritten question, nothing else.

History:
{history_text}

Follow-up question: {question}

Standalone question:"""

    return _gen(prompt)


def answer_question(query: str, history: list):
    standalone_query = condense_question(history, query)
    chunks = search_docs(standalone_query, k=4)

    context = "\n\n---\n\n".join(
        f"[Source: {c.get('title', 'Unknown')} - {c.get('url', '')}]\n{c['text']}"
        for c in chunks
    )

    history_text = "\n".join(
        f"User: {h['question']}\nAssistant: {h['answer']}" for h in history[-3:]
    )

    prompt = f"""You are AmEx FinAssist, a helpful assistant answering questions about
American Express products using ONLY the context below. If the context doesn't
contain the answer, say so clearly instead of guessing. Structure your answer
with short paragraphs or bullet points where helpful.

Conversation so far:
{history_text}

Context:
{context}

Question: {query}

Answer:"""

    answer = _gen(prompt)
    sources = list({c.get("url", "") for c in chunks if c.get("url")})
    return answer, sources


def main():
    print("AmEx FinAssist — ask a question (type 'exit' to quit)\n")
    history = []

    while True:
        query = input("You: ").strip()
        if not query:
            continue
        if query.lower() in ("exit", "quit"):
            break

        answer, sources = answer_question(query, history)

        print(f"\nAssistant: {answer}")
        if sources:
            print("\nSources:")
            for s in sources:
                print(f"  - {s}")
        print()

        history.append({"question": query, "answer": answer})


if __name__ == "__main__":
    main()