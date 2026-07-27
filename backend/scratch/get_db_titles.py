import os
import sys
import logging

# Adjust path to import backend modules
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.append(backend_path)

try:
    from app.database import DatabaseManager
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

# Setup logger
logging.basicConfig(level=logging.ERROR)

def main():
    db_mgr = DatabaseManager()
    patents = db_mgr.list_patents_meta()
    
    print(f"Total patents in MySQL: {len(patents)}")
    print("=" * 60)
    for idx, p in enumerate(patents[:5]):
        print(f"[{idx+1}] Patent Number: {p['patent_number']}")
        print(f"    Title: {p['title']}")
        print(f"    Abstract Excerpt: {p['abstract'][:250]}...")
        print("-" * 60)

if __name__ == "__main__":
    main()
