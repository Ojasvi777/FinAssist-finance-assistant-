import os
import faiss
import pickle
from openai import OpenAI
from sentence_transformers import SentenceTransformer

# choose one: either OpenAI or local embedding model
USE_OPENAI = False  

DATA_DIR = "data/raw"
INDEX_PATH = "data/index/faiss.index"
META_PATH = "data/index/metadata.pkl"

os.makedirs("data/index", exist_ok=True)

def load_raw_files():
    texts = []
    for fname in os.listdir(DATA_DIR):
        if fname.endswith(".txt"):
            with open(os.path.join(DATA_DIR, fname), "r", encoding="utf-8") as f:
                texts.append(f.read())
    return texts

def chunk_text(text, max_len=500):
    words = text.split()
    chunks = []
    cur = []
    for w in words:
        cur.append(w)
        if len(cur) > max_len:
            chunks.append(" ".join(cur))
            cur = []
    if cur:
        chunks.append(" ".join(cur))
    return chunks

def build_index():
    texts = load_raw_files()
    chunks = []
    for txt in texts:
        chunks.extend(chunk_text(txt))

    if USE_OPENAI:
        client = OpenAI()
        vectors = [client.embeddings.create(input=c, model="text-embedding-3-small").data[0].embedding for c in chunks]
    else:
        model = SentenceTransformer("all-MiniLM-L6-v2")
        vectors = model.encode(chunks, show_progress_bar=True)

    dim = len(vectors[0])
    index = faiss.IndexFlatL2(dim)
    index.add(vectors)

    # save index + metadata
    faiss.write_index(index, INDEX_PATH)
    with open(META_PATH, "wb") as f:
        pickle.dump(chunks, f)

    print(f"✅ Index built with {len(chunks)} chunks")

if __name__ == "__main__":
    build_index()
