import time
import logging
import requests
import os
from typing import List, Dict, Any, Tuple, Optional

try:
    from groq import Groq
except ImportError:
    Groq = None

from app.config import Config
from app.indexing import PatentEmbedder
from app.vector_store import DualVectorStore

logger = logging.getLogger("RAGPipeline")

SYSTEM_PROMPT = """You are an expert technical assistant and Patent Analyst for the PatentMind AI platform.
You analyze provided patent context to answer the user's questions.
Follow these guidelines:
1. If the user's query relates to patents in the context, base your answer on the provided context, citing patent numbers, titles, and claims.
2. If the user's query is a general greeting or general question (like "hi", "hello", "what is Python?"), answer directly, comprehensively, and politely as a helpful AI assistant.
3. Be precise, technical, and detail-oriented in all responses.
"""

class IntelligentRAGChain:
    def __init__(self, vector_store: DualVectorStore, embedder: PatentEmbedder):
        self.db = vector_store
        self.embedder = embedder
        self.ollama_host = Config.OLLAMA_HOST
        self.groq_key = Config.GROQ_API_KEY
        self.ollama_model = "qwen2.5:latest"
        # High-speed model with higher daily token limits on Groq free tier
        self.groq_models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"]

    def execute_rag(self, query: str, filter_metadata: Optional[Dict[str, Any]] = None, limit: int = 5, target_language: Optional[str] = None) -> Dict[str, Any]:
        start_time = time.time()
        query_vector = None
        retrieved_chunks = []
        try:
            query_vector = self.embedder.embed_query(query)
            self.db._last_query_text = query
            retrieved_chunks = self.db.search(query_vector, filter_metadata=filter_metadata, limit=limit)
        except Exception as e:
            logger.error(f"Failed to generate query embedding or search DB: {e}")

        db_stats = self.db.get_stats()
        active_db = db_stats.get("active_database", "In-Memory Vector Search")

        context_str = ""
        for idx, chunk in enumerate(retrieved_chunks, start=1):
            meta = chunk.get("metadata", {}) if isinstance(chunk, dict) else {}
            pnum = meta.get("patent_number", f"US-PATENT-{idx}")
            title = meta.get("title", "Patent Specification")
            sec = meta.get("section", "Claims")
            context_str += f"[{idx}] Patent: {pnum} | Title: {title} | Section: {sec}\n"
            if meta.get("claim_number"):
                context_str += f"Claim Number: {meta['claim_number']}\n"
            context_str += f"Text Content: {chunk.get('text', '')}\n"
            context_str += "-" * 50 + "\n"

        lang_instruction = f"\nIMPORTANT: Respond in {target_language} language." if target_language and target_language.lower() != "english" else ""
        answer = ""
        active_llm = "Ollama (Local)"
        fallback_occurred = False

        try:
            logger.info("Attempting local Ollama inference...")
            url = f"{self.ollama_host}/api/generate"
            payload = {
                "model": self.ollama_model,
                "prompt": f"{SYSTEM_PROMPT}{lang_instruction}\nContext:\n{context_str}\n\nQuestion: {query}\n\nAnswer:",
                "stream": False,
                "options": {"temperature": 0.2, "num_predict": 300, "num_ctx": 2048}
            }
            timeout_val = 1.0 if os.environ.get("VERCEL") else 10.0
            response = requests.post(url, json=payload, timeout=timeout_val)
            if response.status_code == 200:
                answer = response.json().get("response", "").strip()
                logger.info("Ollama inference succeeded.")
            else:
                raise Exception(f"Ollama returned status code: {response.status_code}")
        except Exception as ollama_err:
            logger.warning(f"Ollama inference unavailable ({ollama_err}). Falling back to Groq Cloud...")
            fallback_occurred = True
            active_llm = "Groq Cloud (Llama-3.1-8b)"

            if self.groq_key:
                groq_url = "https://api.groq.com/openai/v1/chat/completions"
                groq_headers = {
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                }
                messages_payload = [{"role": "system", "content": SYSTEM_PROMPT + lang_instruction}]
                if context_str.strip():
                    messages_payload.append({"role": "user", "content": f"Context:\n{context_str}\n\nQuestion: {query}"})
                else:
                    messages_payload.append({"role": "user", "content": query})

                # Cycle through Groq models in case one hits rate limit
                for g_model in self.groq_models:
                    try:
                        groq_payload = {
                            "model": g_model,
                            "messages": messages_payload,
                            "temperature": 0.2,
                            "max_tokens": 1024
                        }
                        resp = requests.post(groq_url, headers=groq_headers, json=groq_payload, timeout=10.0)
                        if resp.status_code == 200:
                            res_json = resp.json()
                            answer = res_json['choices'][0]['message']['content'].strip()
                            active_llm = f"Groq Cloud ({g_model})"
                            logger.info(f"Groq Cloud HTTP inference succeeded using model {g_model}.")
                            break
                        else:
                            logger.warning(f"Groq model {g_model} status {resp.status_code}: {resp.text}")
                    except Exception as g_err:
                        logger.warning(f"Groq model {g_model} error: {g_err}")

                if not answer:
                    answer = self._generate_graceful_text_fallback(query, retrieved_chunks)
                    active_llm = "Static Vector Matching Engine"
            else:
                logger.warning("Groq API key not set.")
                answer = self._generate_graceful_text_fallback(query, retrieved_chunks)
                active_llm = "Static Vector Matching Engine"

        latency = round(time.time() - start_time, 3)
        return {
            "answer": answer,
            "retrieved_chunks": retrieved_chunks,
            "active_db": active_db,
            "active_llm": active_llm,
            "latency_sec": latency,
            "fallback_occurred": fallback_occurred
        }

    def _generate_graceful_text_fallback(self, query: str, chunks: List[Dict[str, Any]]) -> str:
        if not chunks:
            return "Hello! I am **PatentMind AI Assistant**. How can I assist you with patent vector search, prior-art analysis, or claim comparison today?"
        fallback_msg = "Below is the parsed details of the top matched patent clauses:\n\n"
        for idx, chunk in enumerate(chunks[:3], start=1):
            meta = chunk.get("metadata", {})
            pnum = meta.get("patent_number", f"US-PATENT-{idx}")
            title = meta.get("title", "Patent Specification")
            sec = meta.get("section", "Claims")
            score = chunk.get("score", 0.95)
            text = chunk.get("text", "")
            fallback_msg += f"**{idx}. Patent {pnum} (Match Score: {score:.3f})**\n- **Title**: {title}\n- **Section**: {sec}\n"
            if meta.get("claim_number"):
                fallback_msg += f"- **Claim**: #{meta['claim_number']}\n"
            fallback_msg += f"- **Excerpt**: *{text}*\n\n"
        return fallback_msg