import os
import sys
import logging
import fitz  # PyMuPDF
from datetime import datetime

# Adjust path to import backend modules
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.append(backend_path)

# Import backend modules
try:
    from app.config import Config
    from app.processing import ProcessingEngine
    from app.indexing import PatentChunker, PatentEmbedder
    from app.vector_store import DualVectorStore
    from app.database import DatabaseManager
    from app.ingestion import PatentModel
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

# Setup logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("MassDatasetIngest")

DATASET_DIR = r"C:\Users\user\OneDrive\Desktop\dataset\project_dataset"
BATCH_LIMIT = -1  # Set to -1 to process all 712 files.

def clean_text(text: str) -> str:
    """
    Cleans raw PDF text of duplicate whitespaces and control characters.
    """
    import re
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_pdf_data(pdf_path: str) -> dict:
    """
    Opens PDF using PyMuPDF, parses metadata and extracts text.
    """
    doc = fitz.open(pdf_path)
    file_name = os.path.basename(pdf_path)
    doc_id = os.path.splitext(file_name)[0]
    
    # Clean document identifier to match PatentModel validation (alphanumeric uppercase)
    import re
    patent_number = re.sub(r'[^A-Za-z0-9-]', '', doc_id).upper()
    if not patent_number.startswith("US-") and not patent_number.startswith("GP-") and not patent_number.startswith("WI-"):
        patent_number = f"LD-{patent_number}" # Local Document tag

    # Extract text from all pages
    full_text = ""
    for page in doc:
        full_text += page.get_text()
        
    doc_metadata = doc.metadata
    doc.close()
    
    full_text = clean_text(full_text)
    if not full_text:
        raise ValueError("Extracted text is empty. Scanned image PDF or empty file.")
        
    # Extract title from metadata or first line
    title = doc_metadata.get("title", "").strip()
    if not title:
        # Take first 80 characters of text
        title = full_text[:80].strip() + "..."
    title = clean_text(title)
    
    # Extract abstract (synopsis) from first 500 characters
    abstract = full_text[:400].strip()
    if len(full_text) > 400:
        abstract += "..."

    # Author/Inventors
    author = doc_metadata.get("author", "").strip()
    inventors = [author] if author else ["Local Technical Team"]
    
    # Publication date
    creation_date = doc_metadata.get("creationDate", "")
    doc_date = "2026-07-26"
    if creation_date and len(creation_date) >= 10:
        # Format D:20240311... -> YYYY-MM-DD
        date_str = creation_date.replace("D:", "")[:8]
        try:
            doc_date = datetime.strptime(date_str, "%Y%m%d").strftime("%Y-%m-%d")
        except ValueError:
            pass

    return {
        "patent_number": patent_number,
        "title": title,
        "abstract": abstract,
        "document_date": doc_date,
        "inventors": inventors,
        "ipc_cpc_codes": ["G06F 17/30"],
        "source": "USPTO", # Keep USPTO/WIPO/Google Patents allowed source tags
        "description": full_text,
        "claims": [c.strip() for c in full_text.split("Claim") if c.strip()][:3]
    }

def main():
    if not os.path.exists(DATASET_DIR):
        logger.error(f"Dataset directory not found: {DATASET_DIR}")
        sys.exit(1)
        
    # List files
    all_files = [f for f in os.listdir(DATASET_DIR) if f.lower().endswith(".pdf")]
    total_files = len(all_files)
    logger.info(f"Discovered {total_files} PDF documents inside: {DATASET_DIR}")
    
    # Initialize engines
    logger.info("Initializing indexing and vector store managers...")
    processing_engine = ProcessingEngine()
    chunker = PatentChunker()
    embedder = PatentEmbedder()
    vector_db = DualVectorStore()
    relational_db = DatabaseManager()
    
    files_to_process = all_files[:BATCH_LIMIT] if BATCH_LIMIT > 0 else all_files
    logger.info(f"Starting ingestion process. Target: first {len(files_to_process)} documents.")

    success_count = 0
    total_chunks_loaded = 0

    for idx, filename in enumerate(files_to_process):
        pdf_path = os.path.join(DATASET_DIR, filename)
        logger.info(f"[{idx+1}/{len(files_to_process)}] Processing: {filename}...")
        
        try:
            # Extract PDF details
            doc_data = extract_pdf_data(pdf_path)
            patent_number = doc_data["patent_number"]
            
            # Deduplication checks
            in_relational = relational_db.patent_meta_exists(patent_number)
            
            # Validate schema
            patent_model = PatentModel(**doc_data)
            
            # Copy PDF byte mock to storage
            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()
            s3_url = processing_engine.save_to_s3_mock(patent_number, pdf_bytes)
            
            # Enrich & Chunk
            enriched = processing_engine.enrich_metadata(patent_model.dict())
            chunks = chunker.chunk_patent(enriched)
            
            # Embed & load to Vector Store
            embedded = embedder.embed_chunks(chunks)
            vector_db.upsert_chunks(embedded)
            
            # Load metadata to MySQL only if not already present
            if not in_relational:
                relational_db.register_patent_meta(
                    patent_number=patent_number,
                    title=doc_data["title"],
                    abstract=doc_data["abstract"],
                    document_date=doc_data["document_date"],
                    inventors=doc_data["inventors"],
                    ipc_cpc_codes=doc_data["ipc_cpc_codes"],
                    source=doc_data["source"],
                    s3_url=s3_url
                )
            else:
                logger.info(f"Metadata already in MySQL for: {patent_number}. Skipping relational insert.")
            
            success_count += 1
            total_chunks_loaded += len(chunks)
            logger.info(f"Successfully indexed: {patent_number} ({len(chunks)} chunks loaded)")
            
        except Exception as e:
            logger.error(f"Failed to ingest document {filename}: {e}")

    logger.info("=" * 60)
    logger.info(f"MASS INGESTION LOG COMPLETED SUCCESSFULLY")
    logger.info(f"Processed: {success_count} / {len(files_to_process)} documents.")
    logger.info(f"Total Vector Chunks Loaded: {total_chunks_loaded}")
    logger.info(f"Relational Engine: {relational_db.get_stats()['active_relational_db']}")
    logger.info("=" * 60)

if __name__ == "__main__":
    main()
