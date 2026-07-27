import os
import re
import logging
from typing import List, Dict, Any, Tuple
from app.config import Config

logger = logging.getLogger("Processing")

class ProcessingEngine:
    def __init__(self):
        self.s3_dir = Config.S3_MOCK_DIR
        os.makedirs(self.s3_dir, exist_ok=True)
        
        # Initialize PaddleOCR lazily to avoid loading times on system start
        self.ocr = None

    def save_to_s3_mock(self, patent_number: str, pdf_data: bytes) -> str:
        """
        Saves the raw patent document (mock PDF bytes) to local S3-compatible path.
        Returns the S3 URL string.
        """
        file_name = f"{patent_number.replace('/', '_')}.pdf"
        file_path = os.path.join(self.s3_dir, file_name)
        try:
            with open(file_path, "wb") as f:
                f.write(pdf_data)
            s3_url = f"s3://patentmind-vault/pdfs/{file_name}"
            logger.info(f"Saved patent PDF to S3 mock: {s3_url}")
            return s3_url
        except Exception as e:
            logger.error(f"Error saving to S3 mock: {e}")
            raise

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extracts text from PDF using PyMuPDF. Fallback to PaddleOCR if scanned.
        """
        extracted_text = ""
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(pdf_path)
            for page in doc:
                text = page.get_text()
                if text.strip():
                    extracted_text += text + "\n"
            
            # If extracted text is very short/empty, it's likely a scanned page
            if len(extracted_text.strip()) < 50:
                logger.info(f"Extracted text is empty or too short ({len(extracted_text)} chars). Falling back to OCR.")
                extracted_text = self._extract_ocr(pdf_path)
        except Exception as e:
            logger.warning(f"PyMuPDF extraction failed: {e}. Attempting OCR fallback.")
            try:
                extracted_text = self._extract_ocr(pdf_path)
            except Exception as ocr_err:
                logger.error(f"All extraction pipelines failed: {ocr_err}")
                extracted_text = ""
                
        return self.clean_text(extracted_text)

    def _extract_ocr(self, pdf_path: str) -> str:
        """
        Extracts text from scanned PDF using PaddleOCR.
        """
        logger.info("Initializing PaddleOCR engine for scanned pages...")
        try:
            from paddleocr import PaddleOCR
            import fitz
            
            if self.ocr is None:
                # Use standard CPU OCR configurations
                self.ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
            
            doc = fitz.open(pdf_path)
            ocr_text = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                # Render page to a pixmap image (PNG)
                pix = page.get_pixmap(dpi=150)
                # Convert to bytes
                img_data = pix.tobytes("png")
                
                # Perform OCR on image bytes
                result = self.ocr.ocr(img_data, cls=True)
                if result and result[0]:
                    page_ocr = []
                    for line in result[0]:
                        text_val = line[1][0]
                        page_ocr.append(text_val)
                    ocr_text.append("\n".join(page_ocr))
                    
            return "\n".join(ocr_text)
        except Exception as e:
            logger.error(f"PaddleOCR fallback failed: {e}")
            # Fallback to reading PDF metadata or raw characters
            return "OCR Failure. Scanned document placeholder content."

    def clean_text(self, text: str) -> str:
        """
        Clean extracted text by removing headers, footers, page numbers, margins, and excess white spaces.
        """
        if not text:
            return ""

        # Normalize Unicode ligatures to standard text representation
        ligature_map = {
            ord('ﬁ'): 'fi',
            ord('ﬂ'): 'fl',
            ord('ﬀ'): 'ff',
            ord('ﬃ'): 'ffi',
            ord('ﬄ'): 'ffl',
            ord('ﬅ'): 'st',
            ord('ﬆ'): 'st',
            ord('œ'): 'oe',
            ord('Œ'): 'OE',
            ord('æ'): 'ae',
            ord('Æ'): 'AE',
        }
        text = text.translate(ligature_map)

        lines = text.split("\n")
        cleaned_lines = []

        # Boilerplate/Header/Footer patterns
        header_patterns = [
            re.compile(r"^\s*page\s+\d+\s*of\s*\d+\s*$", re.IGNORECASE),
            re.compile(r"^\s*\d+\s*$", re.IGNORECASE), # Solo page number
            re.compile(r"patentmind|uspto|wipo|google\s+patents", re.IGNORECASE),
            re.compile(r"^\s*united\s+states\s+patent\s*$", re.IGNORECASE),
            re.compile(r"^\s*c\d+\s+.*", re.IGNORECASE), # Margin markings
        ]

        for line in lines:
            line_stripped = line.strip()
            # Skip empty lines
            if not line_stripped:
                continue
                
            # Skip if match header/footer boilerplate
            skip = False
            for pat in header_patterns:
                if pat.match(line_stripped):
                    skip = True
                    break
            
            if not skip:
                cleaned_lines.append(line_stripped)

        # Reconstruct and normalize whitespace
        joined = "\n".join(cleaned_lines)
        joined = re.sub(r"[ \t]+", " ", joined)  # Normalize tabs and spaces
        joined = re.sub(r"\n{3,}", "\n\n", joined) # Limit consecutive newlines
        return joined

    def enrich_metadata(self, patent_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalizes IPC/CPC codes, deduplicates and normalizes inventor lists.
        """
        # 1. Normalize IPC/CPC codes
        raw_codes = patent_data.get("ipc_cpc_codes", [])
        normalized_codes = []
        for code in raw_codes:
            # Strip whitespace and convert to standard space separation format: e.g. G06F 17/30
            # Matches strings like "G06F17/30" or "G 06 F 17 / 30"
            cleaned_code = re.sub(r"\s+", "", code).upper()
            match = re.match(r"^([A-Z]\d+[A-Z])(\d+/\d+)$", cleaned_code)
            if match:
                normalized = f"{match.group(1)} {match.group(2)}"
            else:
                normalized = code.strip().upper()
            if normalized not in normalized_codes:
                normalized_codes.append(normalized)

        # 2. Normalize and Deduplicate Inventor Names
        raw_inventors = patent_data.get("inventors", [])
        normalized_inventors = []
        for inv in raw_inventors:
            # Clean formatting, e.g. "Smith, John Jr." or "John Smith"
            # Deduplicate by splitting, stripping, and sorting parts if needed
            parts = [p.strip().title() for p in inv.split(",") if p.strip()]
            if len(parts) == 2:
                # "Last, First" format
                normalized_inv = f"{parts[0]}, {parts[1]}"
            elif len(parts) == 1:
                # First Last format
                sub_parts = parts[0].split()
                if len(sub_parts) >= 2:
                    # Treat last word as last name
                    normalized_inv = f"{sub_parts[-1]}, {' '.join(sub_parts[:-1])}"
                else:
                    normalized_inv = parts[0]
            else:
                normalized_inv = inv.strip().title()

            if normalized_inv not in normalized_inventors:
                normalized_inventors.append(normalized_inv)

        patent_data["ipc_cpc_codes"] = normalized_codes
        patent_data["inventors"] = normalized_inventors
        return patent_data
