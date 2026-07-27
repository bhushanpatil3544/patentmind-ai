import os
import sys

# Adjust path to import backend modules
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.append(backend_path)

try:
    from app.database import DatabaseManager
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

def main():
    db_mgr = DatabaseManager()
    conn_info = db_mgr._get_connection()
    if not conn_info or not conn_info[0]:
        print("Could not connect to database.")
        return
        
    conn, cursor = conn_info
    try:
        # Exclude mock test patents from verify scripts
        cursor.execute("""
            SELECT patent_number, title, abstract 
            FROM patents 
            WHERE patent_number NOT LIKE '%TEST%' 
              AND patent_number NOT LIKE '%1000000%' 
            ORDER BY id DESC 
            LIMIT 6
        """)
        rows = cursor.fetchall()
        print(f"Fetched {len(rows)} real patents from MySQL:")
        print("=" * 80)
        for r in rows:
            print(f"Patent Number: {r['patent_number']}")
            print(f"Title: {r['title']}")
            print(f"Abstract Snippet: {r['abstract'][:250]}...")
            print("-" * 80)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
