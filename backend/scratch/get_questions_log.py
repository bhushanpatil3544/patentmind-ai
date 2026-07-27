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

logging.basicConfig(level=logging.ERROR)

def main():
    db_mgr = DatabaseManager()
    
    # Query database directly for questions
    conn_info = db_mgr._get_connection()
    if not conn_info or not conn_info[0]:
        print("Could not connect to MySQL database.")
        return
        
    conn, cursor = conn_info
        
    try:
        cursor.execute("SELECT id, username, query, answer, active_llm, active_db, created_at FROM client_questions ORDER BY created_at DESC LIMIT 5")
        rows = cursor.fetchall()
        print(f"Recent {len(rows)} Questions Logged in MySQL (client_questions table):")
        print("=" * 80)
        for r in rows:
            # When dict cursor is active, rows are dicts
            if isinstance(r, dict):
                print(f"ID: {r['id']} | User: {r['username']} | Time: {r['created_at']}")
                print(f"Query: {r['query']}")
                print(f"LLM: {r['active_llm']} | DB: {r['active_db']}")
                print(f"Answer: {r['answer']}")
            else:
                print(f"ID: {r[0]} | User: {r[1]} | Time: {r[6]}")
                print(f"Query: {r[2]}")
                print(f"LLM: {r[4]} | DB: {r[5]}")
                print(f"Answer: {r[3]}")
            print("-" * 80)
    except Exception as e:
        print(f"Error reading questions log: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
