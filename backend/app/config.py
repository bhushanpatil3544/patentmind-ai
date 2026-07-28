import os
from pathlib import Path
from dotenv import load_dotenv

# Try importing torch, fallback to None if not present
try:
    import torch
except ImportError:
    torch = None

# Base directories (backend folder)
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from backend/.env explicitly
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

class Config:
    # Vector Database Settings
    QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
    
    # Resolve CHROMADB_DIR relative to BASE_DIR if it is relative
    raw_chroma_dir = os.getenv("CHROMADB_DIR", "./chroma_db")
    if not os.path.isabs(raw_chroma_dir):
        CHROMADB_DIR = str((BASE_DIR / raw_chroma_dir).resolve())
    else:
        CHROMADB_DIR = raw_chroma_dir

    # MySQL Database Settings
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "patentmind_db")

    # LLM Configurations
    OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

    # Gmail SMTP Configurations
    GMAIL_USER = os.getenv("GMAIL_USER", os.getenv("GMAIL_SENDER_EMAIL", "patilbhushan3544@gmail.com"))
    GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "lptg uerw ofaz gkgv")
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

    # Resolve S3_MOCK_DIR relative to BASE_DIR if it is relative
    raw_s3_dir = os.getenv("S3_MOCK_DIR", "./storage/s3_mock")
    if not os.path.isabs(raw_s3_dir):
        S3_MOCK_DIR = str((BASE_DIR / raw_s3_dir).resolve())
    else:
        S3_MOCK_DIR = raw_s3_dir

    # Server Settings
    PORT = int(os.getenv("PORT", 8000))
    HOST = os.getenv("HOST", "0.0.0.0")

    # Embeddings
    EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
    
    # Device setup for torch/embeddings
    @classmethod
    def get_device(cls) -> str:
        if torch and torch.cuda.is_available():
            return "cuda"
        elif torch and hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            return "mps"
        return "cpu"

# Ensure directories exist
os.makedirs(Config.S3_MOCK_DIR, exist_ok=True)
os.makedirs(Config.CHROMADB_DIR, exist_ok=True)
