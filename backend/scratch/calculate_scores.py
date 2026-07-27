import os
import sys
import io
import numpy as np

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Adjust path to import backend modules
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.append(backend_path)

try:
    import chromadb
    from app.indexing import PatentEmbedder
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

def cosine_similarity(v1, v2):
    dot = np.dot(v1, v2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    return dot / (norm1 * norm2)

def main():
    client = chromadb.PersistentClient(path=os.path.join(backend_path, "chroma_db"))
    collection = client.get_collection(name="patent_chunks")
    
    embedder = PatentEmbedder()
    query = "What model is used for autonomous fault detection in self-healing systems according to Chris Schneider?"
    query_vector = embedder.embed_query(query)
    
    # Retrieve all chunks for LD-150101501V1
    results = collection.get(
        where={"patent_number": "LD-150101501V1"},
        include=["documents", "metadatas", "embeddings"]
    )
    
    docs = results["documents"]
    metas = results["metadatas"]
    embeddings = results["embeddings"]
    
    print(f"Total chunks found for target patent: {len(docs)}")
    print("=" * 80)
    
    scored_chunks = []
    for doc, meta, emb in zip(docs, metas, embeddings):
        score = cosine_similarity(query_vector, emb)
        scored_chunks.append((score, doc, meta))
        
    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    
    print("Top 10 highest matching chunks for target patent:")
    print("-" * 80)
    for idx, (score, doc, meta) in enumerate(scored_chunks[:10]):
        print(f"[{idx+1}] Cosine Similarity Score: {score:.4f} | Section: {meta['section']}")
        print(f"    Excerpt: {doc[:300]}...")
        print("-" * 80)

if __name__ == "__main__":
    main()
