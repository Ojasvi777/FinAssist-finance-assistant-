FinAssist – RAG Finance Assistant

A Retrieval-Augmented Generation (RAG) system designed to answer finance-related queries using real-time scraped data, semantic search, and LLM-based response generation.

Overview

Traditional language models often produce inaccurate or outdated answers due to lack of domain-specific context.

FinAssist addresses this by:

Scraping real-world financial data
Converting it into semantic embeddings
Retrieving relevant context using FAISS
Generating grounded responses using an LLM
How It Works


Web Scraping → Data Cleaning → Chunking → Embedding → FAISS Index
                                              ↓
                                         User Query
                                              ↓
                                      Query Embedding
                                              ↓
                                 Similarity Search (FAISS)
                                              ↓
                           Retrieve Relevant Context Chunks
                                              ↓
                          LLM Response Generation
Tech Stack
Python
FAISS (vector similarity search)
Playwright (dynamic web scraping)
Transformer-based embeddings
OpenAI API (response generation)

Key Features
Semantic search over unstructured financial data
Fast retrieval using FAISS indexing
Context-aware response generation
Supports dynamic web scraping via Playwright
Modular pipeline design for scalability
Why RAG
Reduces hallucinations in LLM outputs
Improves factual accuracy
Enables domain-specific querying
Scales efficiently with large datasets
Setup Instructions
git clone https://github.com/YOUR_USERNAME/FinAssist-rag-finance-assistant-.git
cd FinAssist-rag-finance-assistant-

pip install -r requirements.txt
Run the Pipeline
python crawl.py
python embed.py
python build_index.py
python rag_pipeline.py
Example

User Query:
Why did stock prices fall recently?

System:

Retrieves relevant financial data
Passes context to LLM
Generates a grounded response
Limitations
Dependent on embedding quality
Limited by LLM context window
Retrieval may miss edge cases
Latency due to retrieval and generation

Future Improvements
Hybrid search (keyword + vector)
Result re-ranking
Response caching
API deployment using FastAPI

Author

Ojasvi
B.Tech CSE with Business Systems, VIT Vellore
