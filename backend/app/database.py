import os
import json
import logging
import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime

# Import driver
try:
    import pymysql
except ImportError:
    pymysql = None

from app.config import Config

logger = logging.getLogger("DatabaseManager")

# Local SQLite fallback path (Writable /tmp for Vercel serverless functions)
if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    SQLITE_DB_PATH = "/tmp/users_and_metadata.db"
else:
    SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "storage", "users_and_metadata.db")
    os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)

class DatabaseManager:
    def __init__(self):
        self.host = Config.MYSQL_HOST
        self.port = Config.MYSQL_PORT
        self.user = Config.MYSQL_USER
        self.password = Config.MYSQL_PASSWORD
        self.database = Config.MYSQL_DATABASE

        self.is_mysql = False
        self._init_connection()
        self._create_tables()

    def _init_connection(self):
        if os.environ.get("VERCEL") or pymysql is None:
            self.is_mysql = False
            return
            logger.warning("PyMySQL driver is not installed. Defaulting to local SQLite fallback database.")
            self.is_mysql = False
            return

        try:
            logger.info(f"Attempting connection to MySQL server at {self.host}:{self.port}...")
            # Connect to MySQL server without database first to ensure database exists
            conn = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                connect_timeout=2
            )
            cursor = conn.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.database}")
            conn.commit()
            conn.close()

            # Reconnect with target database
            self.is_mysql = True
            logger.info(f"Successfully connected to MySQL database '{self.database}' (Primary).")
        except Exception as e:
            logger.warning(f"Failed to connect to MySQL: {e}. Falling back to SQLite database.")
            self.is_mysql = False

    def _get_connection(self):
        """
        Returns a connection object and cursor context based on active database.
        Usage: conn, cursor = self._get_connection()
        """
        if self.is_mysql:
            conn = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
                cursorclass=pymysql.cursors.DictCursor
            )
            return conn, conn.cursor()
        else:
            conn = sqlite3.connect(SQLITE_DB_PATH)
            # Make sqlite3 return dictionaries instead of tuples
            conn.row_factory = sqlite3.Row
            return conn, conn.cursor()

    def _create_tables(self):
        conn, cursor = self._get_connection()
        try:
            if self.is_mysql:
                # 1. Users Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(128) UNIQUE NOT NULL,
                        password VARCHAR(256) NOT NULL,
                        email VARCHAR(256) NULL
                    )
                """)
                # 2. Patents Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS patents (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        patent_number VARCHAR(64) UNIQUE NOT NULL,
                        title VARCHAR(512) NOT NULL,
                        abstract TEXT NOT NULL,
                        document_date VARCHAR(16) NOT NULL,
                        inventors TEXT NOT NULL,
                        ipc_cpc_codes TEXT NOT NULL,
                        source VARCHAR(64) NOT NULL,
                        s3_url VARCHAR(512) NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                # 3. Client Questions & Answers Log Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS client_questions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(128) NOT NULL,
                        query TEXT NOT NULL,
                        answer TEXT NOT NULL,
                        active_llm VARCHAR(128) NOT NULL,
                        active_db VARCHAR(128) NOT NULL,
                        latency_sec DOUBLE NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                # 4. User Feedback Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_feedback (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(128) NOT NULL,
                        rating INT NOT NULL,
                        comments TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
            else:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        email TEXT NULL
                    )
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS patents (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        patent_number TEXT UNIQUE NOT NULL,
                        title TEXT NOT NULL,
                        abstract TEXT NOT NULL,
                        document_date TEXT NOT NULL,
                        inventors TEXT NOT NULL,
                        ipc_cpc_codes TEXT NOT NULL,
                        source TEXT NOT NULL,
                        s3_url TEXT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS client_questions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT NOT NULL,
                        query TEXT NOT NULL,
                        answer TEXT NOT NULL,
                        active_llm TEXT NOT NULL,
                        active_db TEXT NOT NULL,
                        latency_sec REAL NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_feedback (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT NOT NULL,
                        rating INTEGER NOT NULL,
                        comments TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
            conn.commit()
            
            # Migration check: Ensure email column exists on existing users table
            try:
                if self.is_mysql:
                    cursor.execute("ALTER TABLE users ADD COLUMN email VARCHAR(256) NULL")
                else:
                    cursor.execute("ALTER TABLE users ADD COLUMN email TEXT NULL")
                conn.commit()
                logger.info("Migrated users table: added email column.")
            except Exception:
                pass # Column already exists
            
            # Seed default users if they don't exist
            cursor.execute("SELECT COUNT(*) FROM users WHERE username = %s" if self.is_mysql else "SELECT COUNT(*) FROM users WHERE username = ?", ("admin",))
            row = cursor.fetchone()
            admin_exists = (row["COUNT(*)"] if self.is_mysql else row[0]) > 0
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE username = %s" if self.is_mysql else "SELECT COUNT(*) FROM users WHERE username = ?", ("client",))
            row = cursor.fetchone()
            client_exists = (row["COUNT(*)"] if self.is_mysql else row[0]) > 0
            
            if not admin_exists or not client_exists:
                import bcrypt
                def hash_pwd(password: str) -> str:
                    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                
                if not admin_exists:
                    logger.info("Admin user missing. Seeding admin account...")
                    admin_pw = hash_pwd("adminpassword")
                    cursor.execute(
                        "INSERT INTO users (username, password) VALUES (%s, %s)" if self.is_mysql else
                        "INSERT INTO users (username, password) VALUES (?, ?)",
                        ("admin", admin_pw)
                    )
                if not client_exists:
                    logger.info("Client user missing. Seeding client account...")
                    client_pw = hash_pwd("clientpassword")
                    cursor.execute(
                        "INSERT INTO users (username, password) VALUES (%s, %s)" if self.is_mysql else
                        "INSERT INTO users (username, password) VALUES (?, ?)",
                        ("client", client_pw)
                    )
                conn.commit()
                logger.info("Default user accounts verified/seeded.")
                
            logger.info("Relational tables validated/created successfully.")
        except Exception as e:
            logger.error(f"Error creating relational tables: {e}")
        finally:
            conn.close()

    # --- DATABASE OPERATIONS INTERFACE ---

    def register_user(self, username: str, hashed_pw: str, email: Optional[str] = None) -> bool:
        conn, cursor = self._get_connection()
        try:
            cursor.execute(
                "INSERT INTO users (username, password, email) VALUES (%s, %s, %s)" if self.is_mysql else
                "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
                (username, hashed_pw, email)
            )
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to insert user {username}: {e}")
            return False
        finally:
            conn.close()

    def get_user_password_hash(self, username: str) -> Optional[str]:
        conn, cursor = self._get_connection()
        try:
            cursor.execute(
                "SELECT password FROM users WHERE username = %s" if self.is_mysql else
                "SELECT password FROM users WHERE username = ?",
                (username,)
            )
            row = cursor.fetchone()
            if row:
                return row["password"] if self.is_mysql else row[0]
            return None
        except Exception as e:
            logger.error(f"Failed to fetch user password hash {username}: {e}")
            return None
        finally:
            conn.close()

    def user_exists(self, username: str) -> bool:
        return self.get_user_password_hash(username) is not None

    def list_users(self) -> List[str]:
        """
        Lists all registered usernames.
        """
        conn, cursor = self._get_connection()
        try:
            cursor.execute("SELECT username FROM users ORDER BY username ASC")
            rows = cursor.fetchall()
            if self.is_mysql:
                return [row["username"] for row in rows]
            else:
                return [row[0] for row in rows]
        except Exception as e:
            logger.error(f"Failed to list usernames: {e}")
            return []
        finally:
            conn.close()

    def update_user_password(self, username: str, hashed_pw: str) -> bool:
        """
        Updates target user password hash.
        """
        conn, cursor = self._get_connection()
        try:
            cursor.execute(
                "UPDATE users SET password = %s WHERE username = %s" if self.is_mysql else
                "UPDATE users SET password = ? WHERE username = ?",
                (hashed_pw, username)
            )
            conn.commit()
            return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Failed to update password for user {username}: {e}")
            return False
        finally:
            conn.close()

    def get_user_by_email(self, email: str) -> Optional[dict]:
        """
        Fetches user profile by registered email address.
        """
        conn, cursor = self._get_connection()
        try:
            cursor.execute(
                "SELECT username, password, email FROM users WHERE email = %s" if self.is_mysql else
                "SELECT username, password, email FROM users WHERE email = ?",
                (email.strip(),)
            )
            row = cursor.fetchone()
            if row:
                if self.is_mysql:
                    return {"username": row["username"], "password": row["password"], "email": row["email"]}
                else:
                    return {"username": row[0], "password": row[1], "email": row[2]}
            return None
        except Exception as e:
            logger.error(f"Failed to fetch user by email {email}: {e}")
            return None
        finally:
            conn.close()

    def update_user_password_by_email(self, email: str, hashed_pw: str) -> bool:
        """
        Updates user password hash by registered email.
        """
        conn, cursor = self._get_connection()
        try:
            cursor.execute(
                "UPDATE users SET password = %s WHERE email = %s" if self.is_mysql else
                "UPDATE users SET password = ? WHERE email = ?",
                (hashed_pw, email.strip())
            )
            conn.commit()
            return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Failed to update password for email {email}: {e}")
            return False
        finally:
            conn.close()

    def register_patent_meta(self, patent_number: str, title: str, abstract: str, 
                              document_date: str, inventors: List[str], ipc_cpc_codes: List[str], 
                              source: str, s3_url: Optional[str] = None) -> bool:
        """
        Saves patent metadata details into patents table.
        """
        conn, cursor = self._get_connection()
        # Serialize lists to JSON string
        inventors_json = json.dumps(inventors)
        ipc_json = json.dumps(ipc_cpc_codes)
        
        try:
            cursor.execute(
                """
                INSERT INTO patents (patent_number, title, abstract, document_date, inventors, ipc_cpc_codes, source, s3_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """ if self.is_mysql else
                """
                INSERT INTO patents (patent_number, title, abstract, document_date, inventors, ipc_cpc_codes, source, s3_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (patent_number, title, abstract, document_date, inventors_json, ipc_json, source, s3_url)
            )
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to register patent metadata for {patent_number}: {e}")
            return False
        finally:
            conn.close()

    def patent_meta_exists(self, patent_number: str) -> bool:
        conn, cursor = self._get_connection()
        try:
            cursor.execute(
                "SELECT id FROM patents WHERE patent_number = %s" if self.is_mysql else
                "SELECT id FROM patents WHERE patent_number = ?",
                (patent_number,)
            )
            return cursor.fetchone() is not None
        except Exception as e:
            logger.error(f"Failed to check patent presence: {e}")
            return False
        finally:
            conn.close()

    def list_patents_meta(self) -> List[Dict[str, Any]]:
        conn, cursor = self._get_connection()
        try:
            cursor.execute("SELECT * FROM patents ORDER BY id DESC")
            rows = cursor.fetchall()
            results = []
            
            for row in rows:
                if self.is_mysql:
                    # Row is already dict
                    inventors = json.loads(row["inventors"])
                    ipc = json.loads(row["ipc_cpc_codes"])
                    results.append({
                        "patent_number": row["patent_number"],
                        "title": row["title"],
                        "abstract": row["abstract"],
                        "document_date": row["document_date"],
                        "inventors": inventors,
                        "ipc_cpc_codes": ipc,
                        "source": row["source"],
                        "s3_url": row["s3_url"]
                    })
                else:
                    # SQLite Row needs index access or conversion
                    # Row can act as dict if using Row factory
                    inventors = json.loads(row["inventors"])
                    ipc = json.loads(row["ipc_cpc_codes"])
                    results.append({
                        "patent_number": row["patent_number"],
                        "title": row["title"],
                        "abstract": row["abstract"],
                        "document_date": row["document_date"],
                        "inventors": inventors,
                        "ipc_cpc_codes": ipc,
                        "source": row["source"],
                        "s3_url": row["s3_url"]
                    })
            return results
        except Exception as e:
            logger.error(f"Failed to list patent metadata: {e}")
            return []
        finally:
            conn.close()

    def log_client_question(self, username: str, query: str, answer: str, 
                            active_llm: str, active_db: str, latency_sec: float) -> bool:
        """
        Logs RAG query history details into client_questions table.
        """
        conn, cursor = self._get_connection()
        try:
            cursor.execute(
                """
                INSERT INTO client_questions (username, query, answer, active_llm, active_db, latency_sec)
                VALUES (%s, %s, %s, %s, %s, %s)
                """ if self.is_mysql else
                """
                INSERT INTO client_questions (username, query, answer, active_llm, active_db, latency_sec)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (username, query, answer, active_llm, active_db, latency_sec)
            )
            conn.commit()
            logger.info(f"Logged search history details for user {username}")
            return True
        except Exception as e:
            logger.error(f"Failed to log client query to DB: {e}")
            return False
        finally:
            conn.close()

    def log_user_feedback(self, username: str, rating: int, comments: str) -> bool:
        """
        Logs user feedback into user_feedback table.
        """
        conn, cursor = self._get_connection()
        try:
            cursor.execute(
                """
                INSERT INTO user_feedback (username, rating, comments)
                VALUES (%s, %s, %s)
                """ if self.is_mysql else
                """
                INSERT INTO user_feedback (username, rating, comments)
                VALUES (?, ?, ?)
                """,
                (username, rating, comments)
            )
            conn.commit()
            logger.info(f"Logged user feedback from {username}")
            return True
        except Exception as e:
            logger.error(f"Failed to log user feedback to DB: {e}")
            return False
        finally:
            conn.close()

    def get_stats(self) -> Dict[str, Any]:
        """
        Retrieves table count distributions.
        """
        conn, cursor = self._get_connection()
        users_count = 0
        patents_count = 0
        questions_count = 0
        try:
            cursor.execute("SELECT COUNT(*) as count FROM users" if self.is_mysql else "SELECT COUNT(*) FROM users")
            row = cursor.fetchone()
            users_count = row["count"] if self.is_mysql else row[0]

            cursor.execute("SELECT COUNT(*) as count FROM patents" if self.is_mysql else "SELECT COUNT(*) FROM patents")
            row = cursor.fetchone()
            patents_count = row["count"] if self.is_mysql else row[0]

            cursor.execute("SELECT COUNT(*) as count FROM client_questions" if self.is_mysql else "SELECT COUNT(*) FROM client_questions")
            row = cursor.fetchone()
            questions_count = row["count"] if self.is_mysql else row[0]
        except Exception as e:
            logger.error(f"Error checking stats in relational DB: {e}")
        finally:
            conn.close()

        return {
            "active_relational_db": "MySQL" if self.is_mysql else "SQLite Fallback",
            "users_count": users_count,
            "patents_metadata_count": patents_count,
            "questions_logged_count": questions_count
        }
