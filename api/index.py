# Vercel Serverless Function Handler
import os, sys, logging
os.environ["VERCEL"] = "1"

# Ensure backend directory is in python path
backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app
except Exception as err:
    logging.error(f"Failed to import FastAPI app: {err}")
    from fastapi import FastAPI
    app = FastAPI(title="PatentMind AI Fallback")
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    def fallback_catch_all(path: str):
        return {"status": "fallback", "message": f"Backend initialization notice: {str(err)}"}
