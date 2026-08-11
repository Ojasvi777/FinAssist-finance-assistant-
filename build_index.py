import os
import json
import faiss
import pickle
from sentence_transformers import SentenceTransformer

DATA_DIR = "data/raw"
MANIFEST_PATH = os.path.join(DATA_DIR, "manifest.json")
INDEX_PATH = "data/index/faiss.index"
META_PATH = "data/index/metadata.pkl"

os.makedirs("data/index", exist_ok=True)


def chunk_text(text, chunk_size=300, overlap=50):
    """Split text into overlapping word chunks so context isn't lost at boundaries."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        start = end - overlap  # step back by the overlap amount
        if start <= 0 and end >= len(words):
            break
    return chunks


def load_manifest_entries():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def build_index():
    entries = load_manifest_entries()

    metadata = []
    for entry in entries:
        file_path = os.path.join(DATA_DIR, entry["file"])
        if not os.path.exists(file_path):
            continue
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()

        for chunk in chunk_text(text):
            if len(chunk.strip()) < 20:
                continue
            metadata.append({
                "text": chunk,
                "url": entry["url"],
                "title": entry["title"],
            })

    if not metadata:
        print("No chunks found. Did you run crawl.py first?")
        return

    print(f"Embedding {len(metadata)} chunks...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    vectors = model.encode(
        [m["text"] for m in metadata],
        show_progress_bar=True,
        convert_to_numpy=True,
    )

    # Normalize so we can use cosine similarity via inner product
    faiss.normalize_L2(vectors)

    dim = vectors.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(vectors)

    faiss.write_index(index, INDEX_PATH)
    with open(META_PATH, "wb") as f:
        pickle.dump(metadata, f)

    print(f"Index built with {len(metadata)} chunks -> {INDEX_PATH}")


if __name__ == "__main__":
    build_index()