import os
import sys
import logging

# Adjust path to import backend modules
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.append(backend_path)

try:
    from app.ingestion import IngestionEngine
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

logging.basicConfig(level=logging.INFO)

def main():
    engine = IngestionEngine()
    print("Testing connection to patents.google.com live query endpoint...")
    query = "quantum error correction"
    
    # Test Google Patents Scraper
    results = engine.fetch_from_google_patents(query, limit=3)
    
    print("\n" + "=" * 60)
    print(f"Google Patents Scraper returned {len(results)} results:")
    print("=" * 60)
    for idx, p in enumerate(results):
        print(f"[{idx+1}] Patent Number: {p['patent_number']}")
        print(f"    Title: {p['title']}")
        print(f"    Date: {p['document_date']}")
        print(f"    Abstract Snippet: {p['abstract'][:200]}...")
        print("-" * 60)

    # Test USPTO Scraper
    print("\nTesting connection to USPTO PatentsView live API...")
    uspto_results = engine.fetch_from_uspto(query, limit=3)
    print("\n" + "=" * 60)
    print(f"USPTO Scraper returned {len(uspto_results)} results:")
    print("=" * 60)
    for idx, p in enumerate(uspto_results):
        print(f"[{idx+1}] Patent Number: {p['patent_number']}")
        print(f"    Title: {p['title']}")
        print(f"    Date: {p['document_date']}")
        print(f"    Abstract Snippet: {p['abstract'][:200]}...")
        print("-" * 60)

if __name__ == "__main__":
    main()
