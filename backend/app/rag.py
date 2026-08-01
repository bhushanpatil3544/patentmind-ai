import time
import logging
import requests
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
You should analyze any provided patent context to answer the user's questions.
Follow these guidelines:
1. If the user's query relates to patents in the context, prefer basing your answer on the provided context, citing patent numbers, titles, and claims.
2. If the user's query is a general knowledge question (like "What is Python?", coding queries, or general topics) not covered by the patent context, use your pre-trained LLM knowledge to answer the question directly, comprehensively, and politely.
3. Be precise, technical, and detail-oriented in all responses.
"""

class IntelligentRAGChain:
    def __init__(self, vector_store: DualVectorStore, embedder: PatentEmbedder):
        self.db = vector_store
        self.embedder = embedder
        self.ollama_host = Config.OLLAMA_HOST
        self.groq_key = Config.GROQ_API_KEY
        
        # Primary model name in Ollama
        self.ollama_model = "qwen2.5:latest"
        # Fallback model in Groq
        self.groq_model = "llama-3.3-70b-versatile"

    def execute_rag(self, query: str, filter_metadata: Optional[Dict[str, Any]] = None, limit: int = 5, target_language: Optional[str] = None) -> Dict[str, Any]:
        """
        Runs hybrid search and attempts dual LLM execution.
        """
        start_time = time.time()
        
        # 1. Generate query embedding
        try:
            query_vector = self.embedder.embed_query(query)
        except Exception as e:
            logger.error(f"Failed to generate query embedding: {e}")
            return {
                "answer": "Error generating query embeddings. Please check backend model logs.",
                "retrieved_chunks": [],
                "active_db": "None",
                "active_llm": "None",
                "latency_sec": round(time.time() - start_time, 3),
                "fallback_occurred": False
            }

        # 2. Search Database
        self.db._last_query_text = query
        retrieved_chunks = self.db.search(query_vector, filter_metadata=filter_metadata, limit=limit)
        db_stats = self.db.get_stats()
        active_db = db_stats["active_database"]

        # 3. Construct Prompt Context safely
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
        prompt = f"{SYSTEM_PROMPT}{lang_instruction}\nContext:\n{context_str}\n\nQuestion: {query}\n\nAnswer:"

        # 4. LLM Generation with Fallback
        answer = ""
        active_llm = "Ollama (Local)"
        fallback_occurred = False

        # Attempt Ollama (Primary)
        try:
            logger.info("Attempting local Ollama inference...")
            url = f"{self.ollama_host}/api/generate"
            payload = {
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "num_predict": 250,
                    "num_ctx": 2048
                }
            }
            # Give local model loading time locally, but fail fast on Vercel serverless to prevent 504
            import os
            timeout_val = 1.0 if os.environ.get("VERCEL") else 15.0
            response = requests.post(url, json=payload, timeout=timeout_val)
            if response.status_code == 200:
                answer = response.json().get("response", "").strip()
                logger.info("Ollama inference succeeded.")
            else:
                raise Exception(f"Ollama returned non-200 code: {response.status_code}")
        except Exception as ollama_err:
            logger.warning(f"Ollama local inference failed: {ollama_err}. Falling back to Groq Cloud...")
            fallback_occurred = True
            active_llm = "Groq Cloud (Fallback)"
            
            # Attempt Groq (Fallback)
            if Groq is not None and self.groq_key:
                try:
                    client = Groq(api_key=self.groq_key)
                    completion = client.chat.completions.create(
                        messages=[
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": f"Context:\n{context_str}\n\nQuestion: {query}"}
                        ],
                        model=self.groq_model,
                        temperature=0.2,
                        max_tokens=1024,
                        timeout=10.0
                    )
                    answer = completion.choices[0].message.content.strip()
                    logger.info("Groq inference succeeded.")
                except Exception as groq_err:
                    logger.error(f"Groq API call also failed: {groq_err}")
                    answer = self._generate_graceful_text_fallback(query, retrieved_chunks)
                    active_llm = "Static Engine Fallback"
            else:
                logger.warning("Groq API key not set. Skipping Groq fallback.")
                answer = self._generate_graceful_text_fallback(query, retrieved_chunks)
                active_llm = "Static Engine Fallback"

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
        """
        Creates a clean structured response from retrieved patent claims directly
        if both local LLM and remote Groq API fail.
        """
        if not chunks:
            return "No matching patents were found in the database. Both LLM inference chains are currently offline."

        fallback_msg = (
            "⚠️ **Notice: Both primary (Ollama) and secondary (Groq) LLM services are currently offline.** "
            "However, direct semantic retrieval was successful. Below is the parsed details of the top matched patent clauses:\n\n"
        )
        
        for idx, chunk in enumerate(chunks[:3], start=1):
            meta = chunk["metadata"]
            fallback_msg += (
                f"**{idx}. Patent {meta['patent_number']} (Score: {chunk['score']:.3f})**\n"
                f"- **Title**: {meta['title']}\n"
                f"- **Section**: {meta['section']}\n"
            )
            if meta.get("claim_number"):
                fallback_msg += f"- **Claim**: #{meta['claim_number']}\n"
            fallback_msg += f"- **Excerpt**: *{chunk['text']}*\n\n"
            
        return fallback_msg
