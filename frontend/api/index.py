# Vercel Serverless Function: FastAPI Backend Handler
# This file exposes the FastAPI app as a Vercel serverless function.

import os
import sys

# Signal to database.py that we're on Vercel (use SQLite in /tmp)
os.environ["VERCEL"] = "1"

# Add backend directory to Python path so imports work
backend_path = os.path.join(os.path.dirname(__file__), "..", "..", "backend")
sys.path.insert(0, backend_path)

from app.main import app
