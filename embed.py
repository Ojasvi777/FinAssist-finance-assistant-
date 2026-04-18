from transformers import pipeline
import faiss, pickle
from sentence_transformers import SentenceTransformer

# -----------------------------
# Load FAISS index + metadata
# -----------------------------
index = faiss.read_index("data/faiss_index/docs.index")
with open("data/faiss_index/metadata.pkl", "rb") as f:
    metadata = pickle.load(f)

# Embedding model (same one used in embed.py)
embed_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Extractive QA model (grabs short spans from docs)
qa_model = pipeline("question-answering", model="deepset/roberta-base-squad2")

# Generative model (rewrites short spans into natural sentences)
gen_model = pipeline("text2text-generation", model="google/flan-t5-base")

# -----------------------------
# Helper functions
# -----------------------------
def search_docs(query, k=3):
    """Search top-k most relevant docs for a query"""
    query_vec = embed_model.encode([query])
    scores, indices = index.search(query_vec, k)
    return [metadata[i] for i in indices[0]]

def ask_question_free(query):
    """Answer a question using FAISS + QA + Rephraser"""
    docs = search_docs(query, k=3)
    context = "\n\n".join(docs)

    # Step 1: extract raw answer
    result = qa_model({"question": query, "context": context})
    raw_answer = result["answer"]

    # Step 2: rephrase into natural reply
    prompt = f"Answer this question clearly and helpfully:\nQuestion: {query}\nExtracted Answer: {raw_answer}"
    refined = gen_model(prompt, max_length=120)[0]['generated_text']

    return refined

# -----------------------------
# Main interactive loop
# -----------------------------
if __name__ == "__main__":
    while True:
        query = input("\n❓ Ask a question (or type 'exit'): ")
        if query.lower().strip() == "exit":
            break
        if not query.strip():
            print("\n⚠️ Please enter a valid question.\n")
            continue
        answer = ask_question_free(query)
        print(f"\n💡 Answer: {answer}\n")
