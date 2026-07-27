import logging
import random
from typing import List, Dict, Any
from app.config import Config

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    class SentenceTransformer:
        def __init__(self, model_name, device=None):
            pass
        def encode(self, texts, batch_size=32, show_progress_bar=False, convert_to_numpy=True):
            # Return list of mock 384-dimension vectors
            if isinstance(texts, list):
                return [[random.random() for _ in range(384)] for _ in texts]
            return [random.random() for _ in range(384)]

logger = logging.getLogger("Indexing")

class PatentChunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_patent(self, patent: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Splits patent content into section-aware and claim-aware chunks.
        Each chunk is returned as a dict with text, patent_number, source, section, and metadata.
        """
        chunks = []
        p_num = patent.get("patent_number", "UNKNOWN")
        source = patent.get("source", "UNKNOWN")
        title = patent.get("title", "Untitled")
        ipc_cpc = patent.get("ipc_cpc_codes", [])
        inventors = patent.get("inventors", [])

        base_metadata = {
            "patent_number": p_num,
            "title": title,
            "source": source,
            "ipc_cpc_codes": ipc_cpc,
            "inventors": inventors
        }

        # 1. Chunk Abstract (typically short enough for a single chunk)
        abstract = patent.get("abstract", "")
        if abstract:
            chunks.append({
                "text": f"Abstract: {abstract}",
                "section": "Abstract",
                **base_metadata
            })

        # 2. Chunk Description (long text, needs character split with overlap)
        description = patent.get("description", "")
        if description:
            desc_chunks = self._split_text(description, "Description")
            for chunk_text in desc_chunks:
                chunks.append({
                    "text": chunk_text,
                    "section": "Description",
                    **base_metadata
                })

        # 3. Chunk Claims (claim-aware chunking)
        claims = patent.get("claims", [])
        for idx, claim in enumerate(claims, start=1):
            if claim.strip():
                # Keep claims intact or split them if they are extremely long
                # Typically, one claim is kept as a single logical unit
                chunks.append({
                    "text": f"Claim {idx}: {claim.strip()}",
                    "section": "Claims",
                    "claim_number": idx,
                    **base_metadata
                })

        logger.info(f"Generated {len(chunks)} chunks for patent {p_num}")
        return chunks

    def _split_text(self, text: str, section_name: str) -> List[str]:
        """
        Splits text into chunks of character size chunk_size with chunk_overlap.
        """
        words = text.split()
        chunks = []
        
        # Word-based chunking is more robust than absolute character splitting
        # Let's target ~150 words (around 1000 characters) with 30 words overlap
        words_per_chunk = int(self.chunk_size / 6)
        overlap_words = int(self.chunk_overlap / 6)
        
        if len(words) <= words_per_chunk:
            return [f"{section_name}: {text}"]

        i = 0
        while i < len(words):
            chunk_words = words[i:i + words_per_chunk]
            chunk_text = " ".join(chunk_words)
            chunks.append(f"{section_name}: {chunk_text}")
            i += (words_per_chunk - overlap_words)
            
        return chunks


class PatentEmbedder:
    def __init__(self):
        self.device = Config.get_device()
        self.model_name = Config.EMBEDDING_MODEL_NAME
        logger.info(f"Loading sentence-transformer model '{self.model_name}' on device '{self.device}'...")
        self.model = SentenceTransformer(self.model_name, device=self.device)

    def embed_chunks(self, chunks: List[Dict[str, Any]], batch_size: int = 32) -> List[Dict[str, Any]]:
        """
        Generates embeddings for a list of patent chunks.
        Adds the "embedding" key to each chunk dict containing the list of floats.
        """
        if not chunks:
            return []

        texts = [chunk["text"] for chunk in chunks]
        logger.info(f"Generating embeddings for {len(texts)} chunks in batches of {batch_size}...")
        
        # Compute embeddings
        embeddings = self.model.encode(
            texts, 
            batch_size=batch_size, 
            show_progress_bar=False, 
            convert_to_numpy=True
        )

        for chunk, emb in zip(chunks, embeddings):
            if hasattr(emb, "tolist"):
                chunk["embedding"] = emb.tolist()
            else:
                chunk["embedding"] = list(emb)

        return chunks

    def embed_query(self, query: str) -> List[float]:
        """
        Generates embedding for a single text query.
        """
        emb = self.model.encode(query, show_progress_bar=False, convert_to_numpy=True)
        if hasattr(emb, "tolist"):
            return emb.tolist()
        return list(emb)
