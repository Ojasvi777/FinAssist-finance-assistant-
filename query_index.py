"""
AmEx FinAssist - CLI Query Tool.
Usage:
    python query_index.py "What are the benefits of the Platinum card?"
"""

import sys
import os
from rag_pipeline import answer_question

def main():
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "What are the benefits of the Platinum Card?"
        
    print(f"Querying AmEx FinAssist RAG Pipeline: '{query}'\n")
    answer, sources = answer_question(query, [])
    
    print("=== ANSWER ===")
    print(answer)
    print("\n=== RETRIEVED SOURCES ===")
    for idx, s in enumerate(sources, 1):
        print(f"[{idx}] {s.get('title')} (Confidence: {s.get('confidence')}%, Score: {s.get('score')})")
        print(f"    URL: {s.get('url')}")
        print(f"    Snippet: {s.get('text')[:150]}...\n")

if __name__ == "__main__":
    main()
