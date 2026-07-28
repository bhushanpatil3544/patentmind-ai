# Vercel Serverless Function: FastAPI Backend Handler
# This file exposes the FastAPI app as a Vercel serverless function.
# All /api/* requests are routed here by vercel.json

import os
# Signal to database.py that we're on Vercel (use SQLite in /tmp)
os.environ["VERCEL"] = "1"

import sys
# Add backend directory to Python path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
