import os
import sys
import io

# Force stdout to use UTF-8 encoding to prevent Windows cp1252 character map crashes
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Adjust path to import backend modules
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.append(backend_path)

try:
    from app.vector_store import DualVectorStore
    from app.indexing import PatentEmbedder
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

def main():
    db = DualVectorStore()
    embedder = PatentEmbedder()
    
    queries = [
        "Autonomous Fault Detection in Self-Healing Systems using Restricted Boltzmann Machines",
        "Chris Schneider Restricted Boltzmann Machines",
        "What model does Chris Schneider use for fault detection?"
    ]
    
    for query in queries:
        print("\n" + "=" * 80)
        print(f"Query: {query}")
        print("=" * 80)
        
        query_vector = embedder.embed_query(query)
        results = db.search(query_vector, limit=5)
        
        print(f"Top 5 search results:")
        print("-" * 80)
        for idx, c in enumerate(results):
            meta = c["metadata"]
            print(f"[{idx+1}] Score: {c['score']:.4f} | Patent: {meta['patent_number']} | Title: {meta['title']}")
            print(f"    Snippet: {c['text'][:150]}...")
            print("-" * 80)

if __name__ == "__main__":
    main()
