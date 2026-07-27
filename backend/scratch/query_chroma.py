import os
import sys

# Adjust path to import backend modules
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.append(backend_path)

try:
    import chromadb
except ImportError as e:
    print(f"Error importing chromadb: {e}")
    sys.exit(1)

def main():
    from app.config import Config
    print(f"Connecting to ChromaDB at: {Config.CHROMADB_DIR}")
    client = chromadb.PersistentClient(path=Config.CHROMADB_DIR)
    
    collection = client.get_collection(name="patent_chunks")
    print(f"Total points in collection: {collection.count()}")
    
    # Query by patent number filter
    results = collection.get(
        where={"patent_number": "LD-150101501V1"},
        limit=5
    )
    
    print("\nSearch results for 'LD-150101501V1':")
    print("=" * 60)
    if results and results["documents"]:
        print(f"Found {len(results['documents'])} chunks in database.")
        for idx, doc in enumerate(results["documents"]):
            meta = results["metadatas"][idx]
            print(f"[{idx+1}] Patent: {meta['patent_number']} | Title: {meta['title']}")
            print(f"    Text: {doc[:200]}...")
            print("-" * 60)
    else:
        print("No chunks found in database for LD-150101501V1!")

if __name__ == "__main__":
    main()
