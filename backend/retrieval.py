def retrieve_answer(query: str):
    # dummy retrieval for starter
    # later we integrate FAISS + embeddings
    answer = f"Mock answer for: {query}"
    sources = ["https://www.americanexpress.com/"]
    return answer, sources
