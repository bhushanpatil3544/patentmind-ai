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

if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    SQLITE_DB_PATH = "/tmp/users_and_metadata.db"
else:
    SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "storage", "users_and_metadata.db")
    try:
        os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
    except OSError:
        pass

class PooledConnectionWrapper:
    def __init__(self, conn, pool):
        self._conn = conn
        self._pool = pool
        
    def cursor(self, *args, **kwargs):
        return self._conn.cursor(*args, **kwargs)
        
    def commit(self):
        return self._conn.commit()
        
    def rollback(self):
        return self._conn.rollback()
        
    def close(self):
        try:
            self._conn.rollback()
        except Exception:
            pass
        self._pool._release_connection(self._conn)

class DatabaseManager:
    def __init__(self):
        self.host = Config.MYSQL_HOST
        self.port = Config.MYSQL_PORT
        self.user = Config.MYSQL_USER
        self.password = Config.MYSQL_PASSWORD
        self.database = Config.MYSQL_DATABASE

        self.is_mysql = False
        self._init_connection()
        
        # Connection Pool Initialization
        import queue
        import threading
        self._pool_lock = threading.Lock()
        self._pool_queue = queue.Queue(maxsize=15)
        self._pool_active_count = 0
        
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

    def _create_raw_connection(self):
        if self.is_mysql:
            return pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
                cursorclass=pymysql.cursors.DictCursor
            )
        else:
            conn = sqlite3.connect(SQLITE_DB_PATH, check_same_thread=False)
            conn.row_factory = sqlite3.Row
            return conn

    def _release_connection(self, raw_conn):
        import queue
        try:
            self._pool_queue.put_nowait(raw_conn)
        except queue.Full:
            try:
                raw_conn.close()
            except Exception:
                pass
            with self._pool_lock:
                self._pool_active_count -= 1

    def _get_connection(self):
        """
        Returns a connection object and cursor context based on active database.
        Usage: conn, cursor = self._get_connection()
        """
        import queue
        raw_conn = None
        try:
            raw_conn = self._pool_queue.get_nowait()
        except queue.Empty:
            with self._pool_lock:
                if self._pool_active_count < 15:
                    raw_conn = self._create_raw_connection()
                    self._pool_active_count += 1
            if not raw_conn:
                raw_conn = self._pool_queue.get(timeout=10.0)
                
        # Validate connection is alive
        if self.is_mysql:
            try:
                raw_conn.ping(reconnect=True)
            except Exception:
                pass
                
        return PooledConnectionWrapper(raw_conn, self), raw_conn.cursor()

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
            
            # Seed/Ensure BHUSHAN admin account exists with password '3544' and email 'bhushan3544@gmail.com'
            import bcrypt
            def hash_pwd(password: str) -> str:
                return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            bhushan_pw = hash_pwd("3544")
            
            # Check if BHUSHAN user exists
            cursor.execute("SELECT id FROM users WHERE LOWER(username) = %s" if self.is_mysql else "SELECT id FROM users WHERE LOWER(username) = ?", ("bhushan",))
            row = cursor.fetchone()
            if row:
                cursor.execute(
                    "UPDATE users SET password = %s, email = %s WHERE LOWER(username) = %s" if self.is_mysql else
                    "UPDATE users SET password = ?, email = ? WHERE LOWER(username) = ?",
                    (bhushan_pw, "bhushan3544@gmail.com", "bhushan")
                )
            else:
                cursor.execute(
                    "INSERT INTO users (username, password, email) VALUES (%s, %s, %s)" if self.is_mysql else
                    "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
                    ("BHUSHAN", bhushan_pw, "bhushan3544@gmail.com")
                )
            # Seed default system client accounts
            demo_users = [
                ("client_demo", hash_pwd("client123"), "client@patentmind.ai"),
                ("researcher_dev", hash_pwd("research123"), "researcher@patentmind.ai"),
                ("patent_analyst", hash_pwd("analyst123"), "analyst@patentmind.ai"),
                ("legal_advisor", hash_pwd("legal123"), "legal@patentmind.ai")
            ]
            for u_name, u_pwd, u_email in demo_users:
                cursor.execute("SELECT id FROM users WHERE LOWER(username) = %s" if self.is_mysql else "SELECT id FROM users WHERE LOWER(username) = ?", (u_name.lower(),))
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO users (username, password, email) VALUES (%s, %s, %s)" if self.is_mysql else
                        "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
                        (u_name, u_pwd, u_email)
                    )
            conn.commit()
            logger.info("Admin user 'BHUSHAN' and default client accounts (client_demo, researcher_dev, patent_analyst, legal_advisor) verified/seeded.")
            
            # Seed default patents if they don't exist
            cursor.execute("SELECT COUNT(*) FROM patents")
            row = cursor.fetchone()
            patents_count = row["COUNT(*)"] if self.is_mysql else row[0]
            if patents_count == 0:
                logger.info("Seeding default patent records for RAG search fallback...")
                default_patents = [
                    (
                        "LD-260715330V1",
                        "Xiaomi-Robotics-1: Scaling Vision-Language-Action Models with over 100K Hours of Real-World Trajectories",
                        "We present Xiaomi-Robotics-1, a foundational vision-language-action (VLA) model capable of (1) following diverse language instructions to perform a wide range of mobile manipulation tasks in unseen environments out-of-the-box, and (2) efficiently adapting to novel downstream tasks.",
                        "2026-07-26",
                        '["Xiaomi Robotics Team", "Jun Guo", "Piaopiao Jin", "Jason Li"]',
                        '["G06F 17/30"]',
                        "USPTO",
                        "s3://patentmind-vault/pdfs/LD-260715330V1.pdf"
                    ),
                    (
                        "LD-260710151V1",
                        "MC-RAG System: A Structure-Driven RAG System for Multi-Constraint Queries",
                        "MC-RAG System: A Structure-Driven RAG System for Multi-Constraint Queries. We propose a structure-driven Retrieval-Augmented Generation system that efficiently formats and optimizes multi-constraint database queries using structural parsing.",
                        "2026-07-26",
                        '["Xiao Zhang", "Yang Wan", "Yi Li", "Miao Xie", "Chunli Lv"]',
                        '["G06F 17/30"]',
                        "USPTO",
                        "s3://patentmind-vault/pdfs/LD-260710151V1.pdf"
                    ),
                    (
                        "LD-260707612V1",
                        "Towards Agentic AI Governance: A Preliminary Assessment",
                        "Artificial intelligence is rapidly evolving from generative systems to agentic AI capable of autonomously planning and executing complex, multi-step actions. This patent outlines preliminary compliance and governance metrics for autonomous agents.",
                        "2026-06-02",
                        '["Mr Mubarak Raji", "Masooda Bashir"]',
                        '["G06F 17/30"]',
                        "USPTO",
                        "s3://patentmind-vault/pdfs/LD-260707612V1.pdf"
                    )
                ]
                for p in default_patents:
                    cursor.execute(
                        """
                        INSERT INTO patents (patent_number, title, abstract, document_date, inventors, ipc_cpc_codes, source, s3_url)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """ if self.is_mysql else
                        """
                        INSERT INTO patents (patent_number, title, abstract, document_date, inventors, ipc_cpc_codes, source, s3_url)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        p
                    )
                conn.commit()
                logger.info("Default patents seeded successfully.")
                
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

    def delete_user(self, username: str) -> bool:
        username_clean = (username or "").strip().lower()
        if username_clean == "admin":
            return False  # Protect the default admin account
            
        conn, cursor = self._get_connection()
        try:
            cursor.execute(
                "DELETE FROM users WHERE LOWER(username) = %s" if self.is_mysql else
                "DELETE FROM users WHERE LOWER(username) = ?",
                (username_clean,)
            )
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to delete user {username}: {e}")
            return False
        finally:
            conn.close()

    def get_user_password_hash(self, username: str) -> Optional[str]:
        username_clean = (username or "").strip().lower()
        conn, cursor = self._get_connection()
        try:
            cursor.execute(
                "SELECT password FROM users WHERE LOWER(username) = %s" if self.is_mysql else
                "SELECT password FROM users WHERE LOWER(username) = ?",
                (username_clean,)
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

    def list_users_detailed(self) -> List[Dict[str, Any]]:
        """
        Lists detailed user records including email and id.
        """
        conn, cursor = self._get_connection()
        try:
            cursor.execute("SELECT id, username, email FROM users ORDER BY username ASC")
            rows = cursor.fetchall()
            results = []
            for r in rows:
                if self.is_mysql:
                    results.append({"id": r["id"], "username": r["username"], "email": r.get("email") or ""})
                else:
                    results.append({"id": r[0], "username": r[1], "email": r[2] if len(r) > 2 and r[2] else ""})
            return results
        except Exception as e:
            logger.error(f"Failed to list detailed users: {e}")
            return []
        finally:
            conn.close()

    def update_all_non_admin_passwords(self, hashed_pw: str) -> int:
        """
        Updates passwords for all non-admin users in bulk.
        """
        conn, cursor = self._get_connection()
        try:
            cursor.execute(
                "UPDATE users SET password = %s WHERE LOWER(username) NOT IN ('bhushan', 'admin')" if self.is_mysql else
                "UPDATE users SET password = ? WHERE LOWER(username) NOT IN ('bhushan', 'admin')",
                (hashed_pw,)
            )
            conn.commit()
            return cursor.rowcount
        except Exception as e:
            logger.error(f"Failed bulk password update: {e}")
            return 0
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

    def search_patents_by_keywords(self, keywords: List[str]) -> List[Dict[str, Any]]:
        if not keywords:
            return self.list_patents_meta()
            
        conn, cursor = self._get_connection()
        try:
            clauses = []
            params = []
            for kw in keywords:
                clauses.append("(LOWER(title) LIKE %s OR LOWER(abstract) LIKE %s)" if self.is_mysql else "(LOWER(title) LIKE ? OR LOWER(abstract) LIKE ?)")
                params.extend([f"%{kw.lower()}%", f"%{kw.lower()}%"])
                
            query = "SELECT * FROM patents WHERE " + " OR ".join(clauses) + " ORDER BY id DESC"
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            results = []
            for row in rows:
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
            logger.error(f"Failed to search patent metadata: {e}")
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

    def list_all_feedback(self) -> List[Dict[str, Any]]:
        """
        Retrieves all user feedback entries for admin review.
        """
        conn, cursor = self._get_connection()
        try:
            cursor.execute("SELECT id, username, rating, comments, created_at FROM user_feedback ORDER BY id DESC")
            rows = cursor.fetchall()
            results = []
            for r in rows:
                if self.is_mysql:
                    results.append({
                        "id": r["id"],
                        "username": r["username"],
                        "rating": r["rating"],
                        "comments": r["comments"],
                        "created_at": str(r["created_at"]) if r.get("created_at") else ""
                    })
                else:
                    results.append({
                        "id": r[0],
                        "username": r[1],
                        "rating": r[2],
                        "comments": r[3],
                        "created_at": str(r[4]) if len(r) > 4 and r[4] else ""
                    })
            return results
        except Exception as e:
            logger.error(f"Failed to list user feedback: {e}")
            return []
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

    def export_all_metadata(self) -> Dict[str, Any]:
        """Exports all table data for admin download."""
        conn, cursor = self._get_connection()
        export = {"users": [], "patents": [], "client_questions": [], "user_feedback": []}
        try:
            # Users (exclude password hashes for security)
            cursor.execute("SELECT id, username, email FROM users ORDER BY id")
            for row in cursor.fetchall():
                if self.is_mysql:
                    export["users"].append({"id": row["id"], "username": row["username"], "email": row.get("email", "")})
                else:
                    export["users"].append({"id": row[0], "username": row[1], "email": row[2] if len(row) > 2 else ""})

            # Patents
            cursor.execute("SELECT patent_number, title, abstract, document_date, inventors, ipc_cpc_codes, source, s3_url, created_at FROM patents ORDER BY id DESC")
            for row in cursor.fetchall():
                if self.is_mysql:
                    export["patents"].append({k: str(v) for k, v in row.items()})
                else:
                    export["patents"].append({
                        "patent_number": row[0], "title": row[1], "abstract": row[2],
                        "document_date": row[3], "inventors": row[4], "ipc_cpc_codes": row[5],
                        "source": row[6], "s3_url": row[7], "created_at": str(row[8]) if row[8] else ""
                    })

            # Client Questions
            cursor.execute("SELECT id, username, query, answer, active_llm, active_db, latency_sec, created_at FROM client_questions ORDER BY id DESC")
            for row in cursor.fetchall():
                if self.is_mysql:
                    export["client_questions"].append({k: str(v) for k, v in row.items()})
                else:
                    export["client_questions"].append({
                        "id": row[0], "username": row[1], "query": row[2], "answer": row[3],
                        "active_llm": row[4], "active_db": row[5], "latency_sec": row[6],
                        "created_at": str(row[7]) if row[7] else ""
                    })

            # User Feedback
            cursor.execute("SELECT id, username, rating, comments, created_at FROM user_feedback ORDER BY id DESC")
            for row in cursor.fetchall():
                if self.is_mysql:
                    export["user_feedback"].append({k: str(v) for k, v in row.items()})
                else:
                    export["user_feedback"].append({
                        "id": row[0], "username": row[1], "rating": row[2],
                        "comments": row[3], "created_at": str(row[4]) if row[4] else ""
                    })
        except Exception as e:
            logger.error(f"Error exporting metadata: {e}")
        finally:
            conn.close()
        return export
