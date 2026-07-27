import logging
import json
import uuid
import random
from typing import List, Dict, Any, Optional

# Defensive imports for Qdrant and ChromaDB
try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
except ImportError:
    QdrantClient = None
    Distance = None
    VectorParams = None
    PointStruct = None
    Filter = None
    FieldCondition = None
    MatchValue = None

try:
    import chromadb
    from chromadb.config import Settings
except ImportError:
    chromadb = None

from app.config import Config

logger = logging.getLogger("VectorStore")
COLLECTION_NAME = "patent_chunks"

class DualVectorStore:
    def __init__(self):
        self.qdrant_host = Config.QDRANT_HOST
        self.qdrant_port = Config.QDRANT_PORT
        self.chroma_dir = Config.CHROMADB_DIR

        self.qdrant_client = None
        self.chroma_client = None
        self.chroma_collection = None
        
        # In-Memory database mock fallback if both DBs are absent
        self.mock_store = []

        # State flags
        self.is_qdrant_active = False
        self.fallback_count = 0

        self._init_databases()

    def _init_databases(self):
        # 1. Attempt to initialize Qdrant
        if QdrantClient is not None:
            try:
                logger.info(f"Connecting to Qdrant at {self.qdrant_host}:{self.qdrant_port}...")
                self.qdrant_client = QdrantClient(host=self.qdrant_host, port=self.qdrant_port, timeout=2.0)
                
                # Test connection
                self.qdrant_client.get_collections()
                self.is_qdrant_active = True
                logger.info("Successfully connected to Qdrant (Primary).")
                
                # Setup collection
                self._setup_qdrant_collection()
            except Exception as e:
                logger.warning(f"Failed to connect to Qdrant: {e}. Falling back to ChromaDB.")
                self.is_qdrant_active = False
        else:
            logger.warning("QdrantClient module is not installed. Skipping Qdrant connection.")
            self.is_qdrant_active = False

        # 2. Initialize ChromaDB as local failover or primary
        if chromadb is not None:
            try:
                logger.info(f"Initializing local ChromaDB at {self.chroma_dir}...")
                self.chroma_client = chromadb.PersistentClient(path=self.chroma_dir)
                self.chroma_collection = self.chroma_client.get_or_create_collection(
                    name=COLLECTION_NAME,
                    metadata={"hnsw:space": "cosine"}
                )
                logger.info("ChromaDB initialized successfully.")
            except Exception as e:
                logger.critical(f"Failed to initialize ChromaDB: {e}. Falling back to In-Memory store.")
                self.chroma_collection = None
        else:
            logger.warning("chromadb module is not installed. Falling back to In-Memory store.")
            self.chroma_collection = None

    def _setup_qdrant_collection(self):
        if not self.qdrant_client:
            return
        try:
            collections = self.qdrant_client.get_collections().collections
            collection_names = [col.name for col in collections]
            if COLLECTION_NAME not in collection_names:
                logger.info(f"Creating Qdrant collection: {COLLECTION_NAME}")
                self.qdrant_client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
                )
        except Exception as e:
            logger.error(f"Error setting up Qdrant collection: {e}")
            self.is_qdrant_active = False

    def upsert_chunks(self, chunks: List[Dict[str, Any]]):
        """
        Upsert chunks to Qdrant (primary) if active. Automatically fallback to ChromaDB if Qdrant fails.
        """
        if not chunks:
            return

        # Prepare records
        if self.is_qdrant_active and self.qdrant_client:
            try:
                points = []
                for idx, chunk in enumerate(chunks):
                    payload = {
                        "text": chunk["text"],
                        "patent_number": chunk["patent_number"],
                        "title": chunk["title"],
                        "source": chunk["source"],
                        "section": chunk["section"],
                        "ipc_cpc_codes": chunk["ipc_cpc_codes"],
                        "inventors": chunk["inventors"],
                        "claim_number": chunk.get("claim_number", -1)
                    }
                    pt_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{chunk['patent_number']}_{idx}"))
                    points.append(PointStruct(id=pt_id, vector=chunk["embedding"], payload=payload))

                self.qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)
                logger.info(f"Upserted {len(chunks)} chunks to Qdrant.")
                
                # Sync ChromaDB if available
                if self.chroma_collection:
                    self._upsert_chroma(chunks)
                return
            except Exception as e:
                logger.error(f"Qdrant upsert failed: {e}. Fallback to ChromaDB.")
                self.is_qdrant_active = False
                self.fallback_count += 1

        # Fallback to ChromaDB if available
        if self.chroma_collection:
            try:
                self._upsert_chroma(chunks)
                return
            except Exception as e:
                logger.error(f"ChromaDB upsert also failed: {e}. Fallback to In-Memory.")
                self.fallback_count += 1

        # Final Fallback to In-Memory DB
        for chunk in chunks:
            # Check duplicate in mock store
            exists = any(c["text"] == chunk["text"] and c["patent_number"] == chunk["patent_number"] for c in self.mock_store)
            if not exists:
                self.mock_store.append(chunk)
        logger.info(f"Upserted {len(chunks)} chunks to local In-Memory Store (Active count: {len(self.mock_store)}).")

    def _upsert_chroma(self, chunks: List[Dict[str, Any]]):
        if not self.chroma_collection:
            return
        ids = []
        embeddings = []
        documents = []
        metadatas = []

        for idx, chunk in enumerate(chunks):
            ids.append(str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{chunk['patent_number']}_{idx}")))
            embeddings.append(chunk["embedding"])
            documents.append(chunk["text"])
            
            meta = {
                "patent_number": chunk["patent_number"],
                "title": chunk["title"],
                "source": chunk["source"],
                "section": chunk["section"],
                "ipc_cpc_codes": json.dumps(chunk["ipc_cpc_codes"]),
                "inventors": json.dumps(chunk["inventors"]),
                "claim_number": chunk.get("claim_number", -1)
            }
            metadatas.append(meta)

        self.chroma_collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        logger.info(f"Upserted {len(chunks)} chunks to ChromaDB.")

    def search(self, query_vector: List[float], filter_metadata: Optional[Dict[str, Any]] = None, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search vector database using hybrid filter.
        """
        # Try Qdrant search
        if self.is_qdrant_active and self.qdrant_client:
            try:
                q_filter = None
                if filter_metadata:
                    conditions = []
                    for key, val in filter_metadata.items():
                        if val:
                            conditions.append(FieldCondition(key=key, match=MatchValue(value=val)))
                    if conditions:
                        q_filter = Filter(must=conditions)

                search_result = self.qdrant_client.search(
                    collection_name=COLLECTION_NAME,
                    query_vector=query_vector,
                    query_filter=q_filter,
                    limit=limit
                )

                results = []
                for item in search_result:
                    payload = item.payload
                    results.append({
                        "text": payload.get("text", ""),
                        "score": item.score,
                        "metadata": {
                            "patent_number": payload.get("patent_number"),
                            "title": payload.get("title"),
                            "source": payload.get("source"),
                            "section": payload.get("section"),
                            "ipc_cpc_codes": payload.get("ipc_cpc_codes", []),
                            "inventors": payload.get("inventors", []),
                            "claim_number": payload.get("claim_number")
                        }
                    })
                logger.info(f"Qdrant returned {len(results)} search results.")
                return results
            except Exception as e:
                logger.error(f"Qdrant search failed: {e}. Falling back to ChromaDB search.")
                self.is_qdrant_active = False
                self.fallback_count += 1

        # Try ChromaDB search
        if self.chroma_collection:
            try:
                return self._search_chroma(query_vector, filter_metadata, limit)
            except Exception as e:
                logger.error(f"ChromaDB search failed: {e}. Falling back to In-Memory search.")
                self.fallback_count += 1

        # In-Memory Search Fallback (Zero dependencies)
        logger.info("Executing search query in local In-Memory Mock Store...")
        results = []
        for chunk in self.mock_store:
            # Check filter
            match = True
            if filter_metadata:
                for k, v in filter_metadata.items():
                    if v and chunk.get(k) != v:
                        match = False
                        break
            if not match:
                continue

            # Compute cosine similarity (dot product of normalized embeddings)
            score = 0.0
            if "embedding" in chunk and len(chunk["embedding"]) == len(query_vector):
                # Calculate dot product
                score = sum(a * b for a, b in zip(chunk["embedding"], query_vector))
            else:
                score = random.uniform(0.5, 0.9)  # Fallback score if embedding length mismatch

            results.append({
                "text": chunk["text"],
                "score": score,
                "metadata": {
                    "patent_number": chunk["patent_number"],
                    "title": chunk["title"],
                    "source": chunk["source"],
                    "section": chunk["section"],
                    "ipc_cpc_codes": chunk["ipc_cpc_codes"],
                    "inventors": chunk["inventors"],
                    "claim_number": chunk.get("claim_number", -1)
                }
            })

        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]

    def _search_chroma(self, query_vector: List[float], filter_metadata: Optional[Dict[str, Any]] = None, limit: int = 5) -> List[Dict[str, Any]]:
        if not self.chroma_collection:
            return []
        chroma_filter = {}
        if filter_metadata:
            for key, val in filter_metadata.items():
                if val:
                    chroma_filter[key] = val

        results = self.chroma_collection.query(
            query_embeddings=[query_vector],
            n_results=limit,
            where=chroma_filter if chroma_filter else None
        )

        formatted_results = []
        if results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results["distances"][0] if "distances" in results else [0.0] * len(docs)

            for doc, meta, dist in zip(docs, metas, distances):
                similarity_score = 1.0 - dist if dist is not None else 0.0
                try:
                    ipc_codes = json.loads(meta.get("ipc_cpc_codes", "[]"))
                except:
                    ipc_codes = [meta.get("ipc_cpc_codes")] if meta.get("ipc_cpc_codes") else []
                
                try:
                    inventors = json.loads(meta.get("inventors", "[]"))
                except:
                    inventors = [meta.get("inventors")] if meta.get("inventors") else []

                formatted_results.append({
                    "text": doc,
                    "score": similarity_score,
                    "metadata": {
                        "patent_number": meta.get("patent_number"),
                        "title": meta.get("title"),
                        "source": meta.get("source"),
                        "section": meta.get("section"),
                        "ipc_cpc_codes": ipc_codes,
                        "inventors": inventors,
                        "claim_number": int(meta.get("claim_number", -1))
                    }
                })
        logger.info(f"ChromaDB returned {len(formatted_results)} search results.")
        return formatted_results

    def get_stats(self) -> Dict[str, Any]:
        """
        Retrieves database status and statistics.
        """
        qdrant_count = 0
        if self.is_qdrant_active and self.qdrant_client:
            try:
                col_info = self.qdrant_client.get_collection(collection_name=COLLECTION_NAME)
                qdrant_count = col_info.points_count
            except:
                pass

        chroma_count = 0
        if self.chroma_collection:
            try:
                chroma_count = self.chroma_collection.count()
            except:
                pass

        active_db = "Qdrant"
        if not self.is_qdrant_active:
            active_db = "ChromaDB" if self.chroma_collection else "In-Memory Mock"

        return {
            "primary_active": self.is_qdrant_active,
            "qdrant_count": qdrant_count,
            "chroma_count": chroma_count if self.chroma_collection else len(self.mock_store),
            "fallback_count": self.fallback_count,
            "active_database": active_db
        }
