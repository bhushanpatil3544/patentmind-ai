import os
import sys
import logging

# Adjust path to import backend modules
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.append(backend_path)

try:
    from app.rag import IntelligentRAGChain
    from app.vector_store import DualVectorStore
    from app.indexing import PatentEmbedder
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

logging.basicConfig(level=logging.INFO)

def main():
    db = DualVectorStore()
    embedder = PatentEmbedder()
    rag = IntelligentRAGChain(db, embedder)
    
    query = "What model is used for autonomous fault detection in self-healing systems according to Chris Schneider?"
    print(f"Executing RAG Search for: '{query}'")
    print("=" * 70)
    
    result = rag.execute_rag(query, limit=3)
    
    print("\n" + "=" * 70)
    print("RAG Results:")
    print("=" * 70)
    print(f"Active DB: {result['active_db']}")
    print(f"Active LLM: {result['active_llm']}")
    print(f"Latency: {result['latency_sec']}s")
    print(f"Answer:\n{result['answer']}")
    print("\nMatched Chunks count:", len(result['retrieved_chunks']))
    for idx, c in enumerate(result['retrieved_chunks']):
        print(f"[{idx+1}] Patent: {c['metadata']['patent_number']} (Score: {c['score']:.4f})")
        print(f"    Title: {c['metadata']['title']}")
        print(f"    Text: {c['text'][:150]}...")

if __name__ == "__main__":
    main()
