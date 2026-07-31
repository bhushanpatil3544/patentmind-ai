import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#71717A"))
        
        # Running Header
        self.drawString(54, 750, "PatentMind AI \u2014 Production Architecture & Technical Specifications")
        self.setStrokeColor(colors.HexColor("#E4E4E7"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)
        
        # Running Footer
        self.line(54, 52, 558, 52)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 38, page_str)
        self.drawString(54, 38, "Developer: Bhushan Patil \u2014 Contact: +91 93590 83546")
        self.restoreState()

def build_pdf(filename="PatentMind_AI_Project_Report.pdf"):
    # Target page width = 612, margin = 54 (0.75 in), content width = 504
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette Style Definitions
    c_primary = colors.HexColor("#0A0A0A")
    c_accent = colors.HexColor("#7C3AED")
    c_highlight = colors.HexColor("#22D3EE")
    c_text_dark = colors.HexColor("#18181B")
    c_text_muted = colors.HexColor("#71717A")
    
    # Custom Paragraph Styles
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=c_accent,
        spaceAfter=15,
        alignment=0
    )
    
    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_text_muted,
        spaceAfter=40,
        alignment=0
    )
    
    style_h1 = ParagraphStyle(
        'Header1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=c_primary,
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )
    
    style_h2 = ParagraphStyle(
        'Header2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_accent,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    style_body = ParagraphStyle(
        'BodyDark',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=c_text_dark,
        spaceAfter=8
    )

    style_bullet = ParagraphStyle(
        'BulletDark',
        parent=style_body,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    story = []

    # ==========================================
    # PAGE 1: COVER PAGE & EXECUTIVE SUMMARY
    # ==========================================
    story.append(Spacer(1, 40))
    story.append(Paragraph("PATENTMIND AI", style_cover_title))
    story.append(Paragraph("Enterprise-Grade Legal Knowledge Retrieval & Strategy Platform", style_cover_subtitle))
    
    # Metadata Table
    meta_data = [
        [Paragraph("<b>Author / Developer</b>", style_body), Paragraph("Bhushan Patil (+91 93590 83546)", style_body)],
        [Paragraph("<b>Role</b>", style_body), Paragraph("System Architect & Full-Stack AI Engineer", style_body)],
        [Paragraph("<b>Tech Stack</b>", style_body), Paragraph("FastAPI, React (Vite, Framer Motion), MySQL, SQLite, Groq Cloud API", style_body)],
        [Paragraph("<b>Repository</b>", style_body), Paragraph("<u>github.com/bhushanpatil3544/patentmind-ai</u>", style_body)],
        [Paragraph("<b>Live URL</b>", style_body), Paragraph("<u>patentmind-ai-p6qx.vercel.app</u>", style_body)]
    ]
    meta_table = Table(meta_data, colWidths=[150, 354])
    meta_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#E4E4E7")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 40))
    
    story.append(Paragraph("Executive Summary", style_h1))
    story.append(Paragraph(
        "PatentMind AI is a production-ready, highly optimized Knowledge Management and Patent Strategy platform. "
        "It leverages a dual-database routing design (MySQL primary, SQLite thread-safe fallback) and a hybrid "
        "Retrieval-Augmented Generation (RAG) architecture to search, index, and analyze complex patent specifications. "
        "The interface has been fully polished with dynamic Vercel-style aesthetics and micro-animations using Framer Motion. "
        "The backend is optimized for resource-constrained, high-throughput serverless environments.",
        style_body
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 2: SYSTEM ARCHITECTURE & WORKFLOW
    # ==========================================
    story.append(Paragraph("1. Architecture Overview", style_h1))
    story.append(Paragraph(
        "The system follows a classic decoupled client-server architecture. The frontend is built as a Single Page "
        "Application (SPA) using React, styled with Tailwind CSS, and compiled using Vite. The backend is an asynchronous "
        "API service built with Python FastAPI. The application uses a modular layout to separate processing tasks "
        "from the main web requests.",
        style_body
    ))
    
    # Architecture Table
    arch_data = [
        [Paragraph("<b>Layer</b>", style_body), Paragraph("<b>Component</b>", style_body), Paragraph("<b>Responsibility</b>", style_body)],
        [Paragraph("Client Layer", style_body), Paragraph("React SPA", style_body), Paragraph("Renders floating sidebar, search queries, dynamic chatbot, and PDF uploads.", style_body)],
        [Paragraph("API Gateway", style_body), Paragraph("FastAPI Web Layer", style_body), Paragraph("Ingests documents, runs auth rules, manages sessions, and forwards queries.", style_body)],
        [Paragraph("RAG Orchestrator", style_body), Paragraph("IntelligentRAGChain", style_body), Paragraph("Constructs prompts, queries indices, handles local Ollama vs. Groq failovers.", style_body)],
        [Paragraph("Storage Layer", style_body), Paragraph("Dual Relational DB", style_body), Paragraph("MySQL (primary cloud hosting) / SQLite (read-only container fallback).", style_body)],
        [Paragraph("Vector Store", style_body), Paragraph("DualVectorStore", style_body), Paragraph("ChromaDB vector embedding indexer with a keyword SQL search fallback.", style_body)]
    ]
    arch_table = Table(arch_data, colWidths=[100, 120, 284])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F4F4F5")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E4E4E7")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("System Execution Workflow", style_h2))
    story.append(Paragraph("The interaction process flows as follows:", style_body))
    story.append(Paragraph("&bull; <b>Authentication:</b> Users register using Gmail OTP codes. Access tokens are generated as secure, signature-validated JWT tokens.", style_bullet))
    story.append(Paragraph("&bull; <b>Document Ingestion:</b> Patented PDFs are uploaded, parsed (via PyMuPDF or PaddleOCR), chunked by section, and indexed.", style_bullet))
    story.append(Paragraph("&bull; <b>RAG Query Flow:</b> When a query is made, it generates a text embedding (or uses keyword SQL fallback) to retrieve patent abstracts.", style_bullet))
    story.append(Paragraph("&bull; <b>LLM Generation:</b> The prompt is compiled with relevant chunks and sent to the LLM (primary local Ollama, fallback Groq API).", style_bullet))
    story.append(PageBreak())

    # ==========================================
    # PAGE 3: TECH STACK, MODEL DETAILS & APIs
    # ==========================================
    story.append(Paragraph("2. Technology Stack & AI Models", style_h1))
    story.append(Paragraph(
        "To ensure high scalability and cost efficiency, the AI models and inference engines are split "
        "between a local development stack and a fast, low-latency fallback cloud setup.",
        style_body
    ))
    
    # Models table
    model_data = [
        [Paragraph("<b>Component</b>", style_body), Paragraph("<b>Primary Model</b>", style_body), Paragraph("<b>Cloud Fallback / Alternative</b>", style_body), Paragraph("<b>Rationale</b>", style_body)],
        [Paragraph("<b>Embeddings</b>", style_body), Paragraph("SentenceTransformers (all-MiniLM-L6-v2)", style_body), Paragraph("Relational SQLite Keyword Search (SQL LIKE)", style_body), Paragraph("MiniLM provides fast local vectors. SQL FTS bypasses memory caps in serverless environments.", style_body)],
        [Paragraph("<b>Llama Engine</b>", style_body), Paragraph("Ollama (Llama 3.1 8B)", style_body), Paragraph("Groq Cloud (LLaMA3-8B-8192)", style_body), Paragraph("Local Llama keeps data private. Groq API is lightning-fast and has 0% hosting costs.", style_body)],
        [Paragraph("<b>OCR Extraction</b>", style_body), Paragraph("PyMuPDF (fitz)", style_body), Paragraph("PaddleOCR (scanned pages)", style_body), Paragraph("PyMuPDF extracts digital text layouts immediately. PaddleOCR scans image layers.", style_body)]
    ]
    model_table = Table(model_data, colWidths=[90, 130, 130, 154])
    model_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F4F4F5")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E4E4E7")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    story.append(model_table)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("Why We Chose This Architecture:", style_h2))
    story.append(Paragraph(
        "<b>Ollama vs. Groq Cloud:</b> Locally, Ollama allows complete data ownership (no patent leaks). "
        "However, cloud serverless hosts (like Vercel) have tight execution timeouts (15s) and lack GPU nodes. "
        "Integrating the Groq API key allows the cloud-deployed version to respond to RAG questions in under 1 second, "
        "making the project production-viable and blazing fast for users.",
        style_body
    ))
    story.append(Paragraph(
        "<b>SentenceTransformers vs. SQL Keyword Search:</b> Loading PyTorch and local models requires ~2GB of RAM, "
        "which exceeds the limits of free serverless web hosting tiers. To prevent the cloud app from failing, we "
        "implemented a smart database search fallback that parses the query for terms and performs optimized queries on "
        "the database metadata, ensuring 100% service availability.",
        style_body
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 4: TECHNICAL CHALLENGES & RESOLUTIONS
    # ==========================================
    story.append(Paragraph("3. Production Engineering & Challenges", style_h1))
    story.append(Paragraph(
        "Transforming the prototype into a production-grade application required resolving several technical and architectural challenges:",
        style_body
    ))
    
    # Table of issues
    issue_data = [
        [Paragraph("<b>Challenge Faced</b>", style_body), Paragraph("<b>Why It Occurred</b>", style_body), Paragraph("<b>Resolution Implemented</b>", style_body)],
        [Paragraph("<b>1. Vercel Serverless Function Crash</b>", style_body), Paragraph("FastAPI tried to create database directories on startup, but Vercel containers have a read-only filesystem.", style_body), Paragraph("Redirected SQLite storage path to '/tmp/users_and_metadata.db' and wrapped directory creations in safe check blocks.", style_body)],
        [Paragraph("<b>2. 504 Gateway Timeout Errors</b>", style_body), Paragraph("FastAPI waited 45s trying to connect to local Ollama on Vercel before timing out (Vercel kills functions after 15s).", style_body), Paragraph("Optimized local Ollama connection timeout to 1s when in Vercel. Connect timeouts fail fast and redirect to Groq instantly.", style_body)],
        [Paragraph("<b>3. Single-Connection DB Overhead</b>", style_body), Paragraph("Creating and closing raw TCP socket connections on every database query caused latency spikes and socket pool exhaustion.", style_body), Paragraph("Implemented PooledConnectionWrapper and a thread-safe Queue connection pool, recycling DB handles automatically.", style_body)],
        [Paragraph("<b>4. In-Memory Search Freezes</b>", style_body), Paragraph("The search fallback originally pulled all database patents into memory to loop through keywords, blocking the web loop.", style_body), Paragraph("Wrote an optimized search_patents_by_keywords database routine executing SQL LIKE filters directly on the database engine.", style_body)],
        [Paragraph("<b>5. Persistent Cache Stale UI</b>", style_body), Paragraph("Vite js/css chunks were aggressively cached by browsers, preventing users from seeing frontend updates.", style_body), Paragraph("Configured Vercel-level cache-invalidation headers ('no-store, no-cache') on index.html within vercel.json.", style_body)]
    ]
    issue_table = Table(issue_data, colWidths=[120, 180, 204])
    issue_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F4F4F5")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E4E4E7")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    story.append(issue_table)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("System Hardening Details:", style_h2))
    story.append(Paragraph(
        "By resolving these bottlenecks, the app compiles, runs, and serves requests securely. "
        "Passwords are saved using salted bcrypt hashes, session tokens use signature-verified JWT structures, "
        "and SQL parameters are fully bound to block SQL injection attacks.",
        style_body
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 5: RESUME SHOWCASE & TELEMETRY
    # ==========================================
    story.append(Paragraph("4. Resume Showcase Strategy & Metrics", style_h1))
    story.append(Paragraph(
        "To make this project stand out in technical interviews and on your resume, emphasize the following architectural decisions:",
        style_body
    ))
    
    story.append(Paragraph("Key Highlights to Mention on Your Resume:", style_h2))
    story.append(Paragraph("&bull; <b>Hybrid Multi-Model Engine:</b> Configured a fallback pipeline that automatically routes queries between local Ollama instances and Groq Cloud endpoints based on latency and network availability.", style_bullet))
    story.append(Paragraph("&bull; <b>Thread-Safe Connection Pool:</b> Designed a custom connection pool manager using proxy patterns that keeps socket usage low and improves response speeds under concurrent loads.", style_bullet))
    story.append(Paragraph("&bull; <b>Cross-Database Compatibility:</b> Coded a fallback pipeline that moves from MySQL (production) to local SQLite storage based on active configurations.", style_bullet))
    story.append(Paragraph("&bull; <b>Secure JWT Authentication:</b> Implemented a complete registration and login pipeline using Gmail OTP codes and signature-verified JWT tokens.", style_bullet))
    
    story.append(Spacer(1, 15))
    story.append(Paragraph("Example Interview Q&A:", style_h2))
    
    story.append(Paragraph("<i>Q: How does the application scale to support multiple users on serverless environments?</i>", style_body))
    story.append(Paragraph(
        "<b>A:</b> On serverless environments, database and model loading present cold-start issues. We resolved this by: "
        "(1) Moving vector embedding queries to SQLite-level LIKE queries to avoid loading 2GB models, "
        "(2) Using connection pooling to reuse active database links, and "
        "(3) Routing LLM prompts to Groq API endpoints, which complete generations in under 0.5 seconds.",
        style_body
    ))
    
    story.append(Paragraph("<i>Q: Why did you choose SQLite as a database fallback instead of using only MySQL?</i>", style_body))
    story.append(Paragraph(
        "<b>A:</b> SQLite provides a zero-dependency, local file-based store. If cloud MySQL links go down or are "
        "blocked by corporate firewalls, the application automatically switches to SQLite in '/tmp', allowing "
        "seamless off-grid usage without crashing.",
        style_body
    ))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>End of Specifications Report</b>", style_body))

    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == "__main__":
    build_pdf()
    print("SUCCESS: PatentMind_AI_Project_Report.pdf generated.")
