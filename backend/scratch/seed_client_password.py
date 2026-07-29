import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.database import DatabaseManager
from app.auth import hash_password

db = DatabaseManager()
hashed = hash_password("3544")

conn, cursor = db._get_connection()
try:
    if db.is_mysql:
        cursor.execute("UPDATE users SET password = %s, email = %s WHERE LOWER(username) = 'bhushan'", (hashed, "bhushan3544@gmail.com"))
        if cursor.rowcount == 0:
            cursor.execute("INSERT INTO users (username, password, email) VALUES ('BHUSHAN', %s, %s)", (hashed, "bhushan3544@gmail.com"))
    else:
        cursor.execute("UPDATE users SET password = ?, email = ? WHERE LOWER(username) = 'bhushan'", (hashed, "bhushan3544@gmail.com"))
        if cursor.rowcount == 0:
            cursor.execute("INSERT INTO users (username, password, email) VALUES ('BHUSHAN', ?, ?)", (hashed, "bhushan3544@gmail.com"))
    conn.commit()
    print("SUCCESSFULLY SEEDED BHUSHAN ADMIN USER IN DATABASE!")
except Exception as e:
    print("SEED ERROR:", e)
finally:
    conn.close()
