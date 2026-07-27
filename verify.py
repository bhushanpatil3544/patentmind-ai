import os
import sys
import unittest
import json
from unittest.mock import MagicMock, patch

# Dynamically mock heavy packages if they are not installed in this environment
try:
    import torch
except ImportError:
    mock_torch = MagicMock()
    mock_torch.cuda.is_available.return_value = False
    sys.modules['torch'] = mock_torch

try:
    import sentence_transformers
except ImportError:
    mock_st = MagicMock()
    # Mock SentenceTransformer class to return mock embeddings
    class MockSentenceTransformer:
        def __init__(self, *args, **kwargs):
            pass
        def encode(self, texts, **kwargs):
            import numpy as np
            if isinstance(texts, list):
                return np.random.rand(len(texts), 384)
            return np.random.rand(384)
    mock_st.SentenceTransformer = MockSentenceTransformer
    sys.modules['sentence_transformers'] = mock_st

try:
    import qdrant_client
except ImportError:
    mock_qc = MagicMock()
    sys.modules['qdrant_client'] = mock_qc
    sys.modules['qdrant_client.models'] = MagicMock()

try:
    import chromadb
except ImportError:
    mock_chroma = MagicMock()
    # Mock PersistentClient
    mock_client = MagicMock()
    mock_chroma.PersistentClient.return_value = mock_client
    sys.modules['chromadb'] = mock_chroma
    sys.modules['chromadb.config'] = MagicMock()

try:
    import groq
except ImportError:
    mock_groq = MagicMock()
    sys.modules['groq'] = mock_groq

try:
    import paddleocr
except ImportError:
    mock_ocr = MagicMock()
    sys.modules['paddleocr'] = mock_ocr

try:
    import fitz  # PyMuPDF
except ImportError:
    mock_fitz = MagicMock()
    sys.modules['fitz'] = mock_fitz

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.config import Config
from app.ingestion import PatentModel, IngestionEngine
from app.processing import ProcessingEngine
from app.indexing import PatentChunker, PatentEmbedder
from app.vector_store import DualVectorStore
from app.rag import IntelligentRAGChain

class TestPatentMindAI(unittest.TestCase):
    
    def test_01_config(self):
        print("\n--- Running Test 1: Config Parameters Load ---")
        self.assertIsNotNone(Config.QDRANT_HOST)
        self.assertIsNotNone(Config.CHROMADB_DIR)
        device = Config.get_device()
        print(f"Calculated processing device: {device}")
        self.assertIn(device, ["cpu", "cuda", "mps"])
        print("[OK] Config check passed.")

    def test_02_validation_and_deduplication(self):
        print("\n--- Running Test 2: Ingestion & Validation ---")
        engine = IngestionEngine()
        
        # Test cleaning patent numbers
        raw_patent = {
            "patent_number": " us-11234567 - b2 ",
            "title": "Quantum Neural Node Optimizer",
            "abstract": "A system for quantum-enhanced neural calculations.",
            "document_date": "2026-07-25",
            "inventors": ["smith, john"],
            "ipc_cpc_codes": ["G06F17/30"],
            "source": "USPTO"
        }
        patent = PatentModel(**raw_patent)
        self.assertEqual(patent.patent_number, "US-11234567-B2")
        print(f"Validated patent number normalized to: {patent.patent_number}")
        
        # Check invalid date formats
        bad_patent = raw_patent.copy()
        bad_patent["document_date"] = "07-25-2026"
        with self.assertRaises(Exception):
            PatentModel(**bad_patent)
            
        print("[OK] Ingestion validation passed.")

    def test_03_processing_enrichment(self):
        print("\n--- Running Test 3: Processing & Text Cleaning ---")
        processor = ProcessingEngine()
        
        # Test text cleaning
        dirty_text = "Page 1 of 5\nUnited States Patent\n\n\nQuantum claim details\n\n\n\n123\n"
        clean = processor.clean_text(dirty_text)
        print("Cleaned text excerpt:", repr(clean))
        self.assertNotIn("Page 1 of 5", clean)
        self.assertNotIn("United States Patent", clean)
        self.assertIn("Quantum claim details", clean)

        # Test metadata enrichment
        raw_meta = {
            "ipc_cpc_codes": ["g06f17/30", "H04L 29/06 A"],
            "inventors": ["Smith, John", "Jane Doe"]
        }
        enriched = processor.enrich_metadata(raw_meta)
        print("Enriched metadata:", enriched)
        self.assertIn("G06F 17/30", enriched["ipc_cpc_codes"])
        self.assertIn("Smith, John", enriched["inventors"])
        self.assertIn("Doe, Jane", enriched["inventors"])
        print("[OK] Processing check passed.")

    def test_04_chunking(self):
        print("\n--- Running Test 4: Section & Claim Chunker ---")
        chunker = PatentChunker(chunk_size=100, chunk_overlap=10)
        patent = {
            "patent_number": "US-1234-A1",
            "title": "Mock Patent",
            "source": "WIPO",
            "abstract": "This abstract is short.",
            "description": "This is paragraph one of the description. It details the device setup.",
            "claims": ["Claim 1: An apparatus.", "Claim 2: The apparatus of claim 1."],
            "inventors": ["Doe, John"],
            "ipc_cpc_codes": ["G06F 17/30"]
        }
        chunks = chunker.chunk_patent(patent)
        self.assertTrue(len(chunks) >= 4)
        
        sections = [c["section"] for c in chunks]
        self.assertIn("Abstract", sections)
        self.assertIn("Description", sections)
        self.assertIn("Claims", sections)
        
        # Verify claim numbers exist
        claim_chunks = [c for c in chunks if c["section"] == "Claims"]
        self.assertEqual(claim_chunks[0]["claim_number"], 1)
        self.assertEqual(claim_chunks[1]["claim_number"], 2)
        print(f"Generated {len(chunks)} chunks across Abstract, Description, and Claims.")
        print("[OK] Chunker check passed.")

    def test_05_vector_store_fallback(self):
        print("\n--- Running Test 5: DualVectorStore Connection & Fallback ---")
        db = DualVectorStore()
        stats = db.get_stats()
        print(f"Vector Database connection stats: {stats}")
        self.assertIsNotNone(stats["active_database"])
        self.assertIn(stats["active_database"], ["Qdrant", "ChromaDB", "In-Memory Mock"])
        print("[OK] Vector Store failover sanity check passed.")

    def test_06_authentication(self):
        print("\n--- Running Test 6: Authentication & JWT Cryptography ---")
        from app.auth import hash_password, verify_password, create_access_token, verify_access_token
        
        # Test Password Encryption
        raw_pw = "patentmind123"
        hashed = hash_password(raw_pw)
        self.assertNotEqual(raw_pw, hashed)
        self.assertTrue(verify_password(raw_pw, hashed))
        self.assertFalse(verify_password("wrong_password", hashed))
        print("Password bcrypt hashing and verification succeeded.")

        # Test JWT Encoding & Decoding
        payload = {"sub": "developer"}
        token = create_access_token(payload)
        self.assertIsNotNone(token)
        
        decoded = verify_access_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded.get("sub"), "developer")
        print("JWT token signing and claim decryption succeeded.")
        print("[OK] Authentication check passed.")

    def test_07_database_manager(self):
        print("\n--- Running Test 7: DatabaseManager & Relational Storage ---")
        from app.database import DatabaseManager
        
        db_mgr = DatabaseManager()
        stats = db_mgr.get_stats()
        print(f"Initial Relational DB stats: {stats}")
        self.assertIsNotNone(stats["active_relational_db"])
        
        # Test User Insertion via DatabaseManager
        test_user = "test_db_user"
        test_pw = "hashed_pw_test_123"
        # Delete if exists (ignore result)
        success = db_mgr.register_user(test_user, test_pw)
        self.assertTrue(success or db_mgr.user_exists(test_user))
        self.assertTrue(db_mgr.user_exists(test_user))
        print("User registered and checked successfully in DatabaseManager.")
        
        # Test Patent Metadata Registration
        test_p_num = "US-TEST-9999"
        if not db_mgr.patent_meta_exists(test_p_num):
            reg_ok = db_mgr.register_patent_meta(
                patent_number=test_p_num,
                title="Relational Test Patent Title",
                abstract="Relational abstraction database validation.",
                document_date="2026-07-26",
                inventors=["Inventor, One", "Inventor, Two"],
                ipc_cpc_codes=["G06F 17/30"],
                source="USPTO"
            )
            self.assertTrue(reg_ok)
        
        self.assertTrue(db_mgr.patent_meta_exists(test_p_num))
        patents = db_mgr.list_patents_meta()
        p_nums = [p["patent_number"] for p in patents]
        self.assertIn(test_p_num, p_nums)
        print("Patent metadata logged and listed successfully in DatabaseManager.")

        # Test Search Logging
        log_ok = db_mgr.log_client_question(
            username="test_db_user",
            query="What is database scaling?",
            answer="Scaling requires partitioning.",
            active_llm="MockLLM",
            active_db="MockDB",
            latency_sec=0.125
        )
        self.assertTrue(log_ok)
        print("Client RAG question and response logged successfully.")
        
        new_stats = db_mgr.get_stats()
        print(f"Updated Relational DB stats: {new_stats}")
        self.assertTrue(new_stats["patents_metadata_count"] > 0)
        print("[OK] DatabaseManager check passed.")

    def test_08_admin_privileges(self):
        print("\n--- Running Test 8: Admin Privileges & User Management ---")
        from app.database import DatabaseManager
        from app.auth import hash_password, verify_password
        
        db_mgr = DatabaseManager()
        
        # Verify default seeded users exist
        self.assertTrue(db_mgr.user_exists("admin"))
        self.assertTrue(db_mgr.user_exists("client"))
        print("Default accounts ('admin' and 'client') verified in database.")
        
        # Verify list_users returns both admin and client
        users = db_mgr.list_users()
        self.assertIn("admin", users)
        self.assertIn("client", users)
        print(f"System users retrieved: {users}")
        
        # Test updating user password via DatabaseManager
        raw_new_pw = "new_client_pwd_123"
        hashed = hash_password(raw_new_pw)
        update_ok = db_mgr.update_user_password("client", hashed)
        self.assertTrue(update_ok)
        
        # Verify new password is correct
        saved_hash = db_mgr.get_user_password_hash("client")
        self.assertTrue(verify_password(raw_new_pw, saved_hash))
        print("User password reset and hash verification succeeded.")
        print("[OK] Admin Privileges check passed.")

    def test_09_chatbot_logic(self):
        print("\n--- Running Test 9: Conversational Chatbot Backend Logic ---")
        from fastapi.testclient import TestClient
        from app.main import app
        from app.auth import create_access_token
        
        client = TestClient(app)
        token = create_access_token({"sub": "client"})
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test 1: Empty messages
        response = client.post("/api/v1/chat", json={"messages": []}, headers=headers)
        self.assertEqual(response.status_code, 400)
        
        # Test 2: Multi-turn prompt request
        payload = {
            "messages": [
                {"role": "user", "content": "What is asymmetric error processing?"},
                {"role": "assistant", "content": "Asymmetric error processing corrects noise in quantum qubits."},
                {"role": "user", "content": "Does the system maintain client histories?"}
            ],
            "limit": 2
        }
        response = client.post("/api/v1/chat", json=payload, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("answer", data)
        self.assertIn("retrieved_chunks", data)
        self.assertIn("active_db", data)
        self.assertIn("active_llm", data)
        print("Chatbot endpoint request and schema validation succeeded.")
        print("[OK] Chatbot Backend check passed.")

if __name__ == "__main__":
    print("=" * 60)
    print(" PATENTMIND AI COMPONENT INTEGRATION TEST SYSTEM ")
    print("=" * 60)
    unittest.main()
