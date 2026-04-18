from transformers import pipeline
import faiss, pickle, os

from sentence_transformers import SentenceTransformer

# Load FAISS index
index = faiss.read_index("data/faiss_index/docs.index")
with open("data/faiss_index/metadata.pkl", "rb") as f:
    metadata = pickle.load(f)

# Embedding model (same as embed.py)
embed_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Free HuggingFace QA model
qa_model = pipeline("question-answering", model="deepset/roberta-base-squad2")

def load_doc_content(meta_entry):
    """Load text if metadata is a file path, else return the string directly"""
    if os.path.exists(meta_entry):
        with open(meta_entry, "r", encoding="utf-8") as f:
            return f.read()
    return meta_entry

def search_docs(query, k=3):
    query_vec = embed_model.encode([query])
    scores, indices = index.search(query_vec, k)
    return [load_doc_content(metadata[i]) for i in indices[0]]

def ask_question_free(query):
    docs = search_docs(query, k=3)
    context = "\n\n".join(docs)

    result = qa_model(question=query, context=context)

    return result["answer"]


if __name__ == "__main__":
    while True:
        query = input("\n❓ Ask a question (or type 'exit'): ").strip()
        if not query:  # user just pressed enter
            print("⚠️ Please enter a question or type 'exit'")
            continue
        if query.lower() == "exit":
            break
        answer = ask_question_free(query)
        print(f"\n💡 Answer: {answer}\n")
