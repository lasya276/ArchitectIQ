"""
Document Exporter Service Module.
Generates professional Microsoft Word (.docx) and PDF (.pdf) documents
for Architecture Blueprints, Software Designs, and Complete Documentation.
Renders Mermaid diagrams as high-resolution embedded images.
"""
import io
import re
import html
import base64
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from PIL import Image
import requests

# Word generation
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

# PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Table,
    TableStyle,
    Preformatted,
    Image as RLImage,
    KeepTogether,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

logger = logging.getLogger(__name__)

# Color Palette Constants
HEX_PRIMARY_NAVY = "0B1428"
HEX_ELECTRIC_BLUE = "287BFF"
HEX_CYAN = "38D9F5"
HEX_SLATE_DARK = "1E293B"
HEX_SLATE_TEXT = "334155"
HEX_SLATE_LIGHT = "64748B"
HEX_BORDER = "CBD5E1"
HEX_BG_LIGHT = "F8FAFC"
HEX_BG_ALT = "F1F5F9"

COLOR_NAVY = colors.HexColor(f"#{HEX_PRIMARY_NAVY}")
COLOR_BLUE = colors.HexColor(f"#{HEX_ELECTRIC_BLUE}")
COLOR_SLATE_DARK = colors.HexColor(f"#{HEX_SLATE_DARK}")
COLOR_SLATE_TEXT = colors.HexColor(f"#{HEX_SLATE_TEXT}")
COLOR_SLATE_LIGHT = colors.HexColor(f"#{HEX_SLATE_LIGHT}")
COLOR_BORDER = colors.HexColor(f"#{HEX_BORDER}")
COLOR_BG_LIGHT = colors.HexColor(f"#{HEX_BG_LIGHT}")
COLOR_BG_ALT = colors.HexColor(f"#{HEX_BG_ALT}")


def _esc(val: Any) -> str:
    """Safely escape arbitrary text for ReportLab XML paragraphs, preserving linebreaks."""
    if val is None:
        return ""
    text = html.escape(str(val))
    return text.replace("\r\n", "<br/>").replace("\n", "<br/>")


def sanitize_filename(project_title: str, doc_type: str, bp_ver: Optional[int] = None, sd_ver: Optional[int] = None, ext: str = "docx") -> str:
    """Produce clean, safe, professional filenames matching specifications."""
    clean_title = re.sub(r'[^a-zA-Z0-9_\s-]', '', project_title).strip()
    clean_title = re.sub(r'[\s-]+', '_', clean_title) or "Project"

    if doc_type == "blueprint":
        return f"ArchitectIQ_{clean_title}_Blueprint_v{bp_ver or 1}.{ext}"
    elif doc_type == "software_design":
        return f"ArchitectIQ_{clean_title}_Software_Design_v{sd_ver or 1}.{ext}"
    elif doc_type == "documentation":
        return f"ArchitectIQ_{clean_title}_Complete_Documentation_BP_v{bp_ver or 1}_SD_v{sd_ver or 1}.{ext}"
    return f"ArchitectIQ_{clean_title}_Document.{ext}"


def render_mermaid_diagram(mermaid_code: str, diagram_name: str) -> Optional[Tuple[bytes, int, int]]:
    """
    Renders Mermaid diagram code into an image (PNG/JPEG) using mermaid.ink service.
    Returns (image_bytes, width, height) on success, or raises RuntimeError if rendering fails.
    """
    if not mermaid_code or not mermaid_code.strip():
        logger.warning(f"Empty mermaid code for diagram '{diagram_name}'")
        return None

    code = mermaid_code.strip()
    # Normalize literal \n and \t if present in raw string
    code = code.replace("\\n", "\n").replace("\\t", "    ")
    # Remove markdown code fences if present
    if code.startswith("```"):
        lines = code.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        code = "\n".join(lines).strip()

    encoded = base64.urlsafe_b64encode(code.encode("utf-8")).decode("ascii")
    url = f"https://mermaid.ink/img/{encoded}?bgColor=FFFFFF"

    try:
        res = requests.get(url, timeout=20)
        if res.status_code != 200:
            logger.warning(
                f"Mermaid rendering service returned HTTP {res.status_code} for diagram '{diagram_name}'. "
                f"Details: {res.text[:200]}"
            )
            return None
        img_bytes = res.content
        pil_img = Image.open(io.BytesIO(img_bytes))
        width, height = pil_img.size
        logger.info(f"Successfully rendered Mermaid diagram '{diagram_name}': {width}x{height}px, {len(img_bytes)} bytes")
        return (img_bytes, width, height)
    except Exception as e:
        logger.warning(f"Failed to render Mermaid diagram '{diagram_name}': {str(e)}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# REPORTLAB CUSTOM NUMBERED CANVAS FOR PDF
# ─────────────────────────────────────────────────────────────────────────────

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass ReportLab Canvas that records total pages and prints running
    header, separator rules, and 'Page X of Y' on every page except the cover.
    """
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
            self.draw_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_decorations(self, page_count):
        if self._pageNumber > 1:
            self.saveState()
            self.setFont("Helvetica", 8)
            self.setFillColor(COLOR_SLATE_LIGHT)

            # Running Header
            self.drawString(54, 748, "ArchitectIQ  |  Systems Architecture & Engineering Specification")
            self.setStrokeColor(COLOR_BORDER)
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

            # Running Footer
            self.line(54, 46, 558, 46)
            self.drawString(54, 34, "CONFIDENTIAL  —  Internal Architecture Documentation")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 34, page_text)

            self.restoreState()


# ─────────────────────────────────────────────────────────────────────────────
# PDF EXPORT GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

class PdfExporter:
    """Generates professional PDF documentation using ReportLab."""

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._init_custom_styles()

    def _init_custom_styles(self):
        self.title_style = ParagraphStyle(
            "DocTitle",
            parent=self.styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=32,
            textColor=COLOR_NAVY,
            spaceAfter=8,
        )
        self.subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=self.styles["Normal"],
            fontName="Helvetica",
            fontSize=13,
            leading=18,
            textColor=COLOR_BLUE,
            spaceAfter=24,
        )
        self.h1_style = ParagraphStyle(
            "Heading1_Custom",
            parent=self.styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=COLOR_NAVY,
            spaceBefore=16,
            spaceAfter=8,
            keepWithNext=True,
        )
        self.h2_style = ParagraphStyle(
            "Heading2_Custom",
            parent=self.styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=COLOR_BLUE,
            spaceBefore=12,
            spaceAfter=6,
            keepWithNext=True,
        )
        self.h3_style = ParagraphStyle(
            "Heading3_Custom",
            parent=self.styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=14,
            textColor=COLOR_SLATE_DARK,
            spaceBefore=8,
            spaceAfter=4,
            keepWithNext=True,
        )
        self.body_style = ParagraphStyle(
            "Body_Custom",
            parent=self.styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=COLOR_SLATE_TEXT,
            spaceAfter=6,
        )
        self.callout_style = ParagraphStyle(
            "Callout_Custom",
            parent=self.styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=9,
            leading=13,
            textColor=COLOR_SLATE_DARK,
        )
        self.code_style = ParagraphStyle(
            "Code_Custom",
            parent=self.styles["Normal"],
            fontName="Courier",
            fontSize=7.5,
            leading=10,
            textColor=COLOR_SLATE_DARK,
        )
        self.caption_style = ParagraphStyle(
            "Caption_Custom",
            parent=self.styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8,
            leading=11,
            alignment=1,  # Centered
            textColor=COLOR_SLATE_LIGHT,
            spaceBefore=4,
            spaceAfter=12,
        )
        self.table_header_style = ParagraphStyle(
            "TH_Custom",
            parent=self.styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=colors.white,
        )
        self.table_cell_style = ParagraphStyle(
            "TD_Custom",
            parent=self.styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=COLOR_SLATE_TEXT,
        )

    def _build_cover_page(self, title: str, subtitle: str, metadata: List[Tuple[str, str]]) -> List[Any]:
        story = []
        story.append(Spacer(1, 40))
        # Brand Monogram / Header
        story.append(Paragraph("<b>ARCHITECTIQ</b>", ParagraphStyle(
            "BrandHeader", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=COLOR_BLUE, spaceAfter=20
        )))
        story.append(Paragraph(title, self.title_style))
        story.append(Paragraph(subtitle, self.subtitle_style))
        story.append(HRFlowable(width="100%", thickness=2, color=COLOR_BLUE, spaceBefore=0, spaceAfter=24))

        # Metadata Table
        meta_table_data = []
        for label, val in metadata:
            meta_table_data.append([
                Paragraph(f"<b>{label}</b>", self.body_style),
                Paragraph(val, self.body_style),
            ])
        t = Table(meta_table_data, colWidths=[160, 344])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), COLOR_BG_LIGHT),
            ("TEXTCOLOR", (0, 0), (-1, -1), COLOR_SLATE_TEXT),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("LINEBELOW", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(t)
        story.append(Spacer(1, 30))
        story.append(Paragraph(
            "This document is an authoritative engineering deliverable generated by ArchitectIQ. "
            "It captures exact architectural paradigms, design patterns, ADR decisions, schema structures, "
            "and rendered component diagrams.",
            self.callout_style
        ))
        story.append(PageBreak())
        return story

    def _render_image_flowable(self, img_bytes: bytes, width: int, height: int, caption: str) -> List[Any]:
        story = []
        max_w = 480
        max_h = 320
        scale = min(max_w / width, max_h / height, 1.0)
        disp_w = width * scale
        disp_h = height * scale

        flowable_img = RLImage(io.BytesIO(img_bytes), width=disp_w, height=disp_h)
        flowable_img.hAlign = "CENTER"
        story.append(KeepTogether([
            flowable_img,
            Paragraph(caption, self.caption_style)
        ]))
        return story

    def _build_blueprint_pdf_sections(self, project: Any, blueprint: Any, is_subpart: bool = False) -> List[Any]:
        story = []
        sec = blueprint.sections or {}
        prefix = "Part I — " if is_subpart else ""

        # HERO SECTION: Architecture Visualization Workspace
        story.append(Paragraph(f"{prefix}System Architecture Diagram", self.h1_style))
        vd = sec.get("visual_diagram", {}) or {}
        code = vd.get("mermaid_code", "")
        desc = vd.get("description", "")
        diag_type = vd.get("diagram_type", "")

        if diag_type:
            story.append(Paragraph(f"<b>Diagram Type:</b> {_esc(diag_type)}", self.body_style))
        if desc:
            story.append(Paragraph(f"<b>Architecture Boundary & Topology:</b> {_esc(desc)}", self.body_style))
        if code:
            clean_code = code.replace("\\n", "\n").replace("\\t", "    ").strip()
            rendered = render_mermaid_diagram(clean_code, "Component Boundary & Architecture Diagram")
            if rendered:
                img_b, w, h = rendered
                story.extend(self._render_image_flowable(img_b, w, h, "Figure 1: Component Boundary & Architecture Topology Diagram"))
            story.append(Spacer(1, 4))
            story.append(Paragraph("<b>Diagram Specification (Mermaid DSL):</b>", self.h3_style))
            story.append(Preformatted(clean_code, self.code_style))
        story.append(Spacer(1, 10))

        # 01. Executive Overview & Grounding Requirements
        story.append(Paragraph(f"{prefix}01. Executive Overview & Grounding Requirements", self.h1_style))
        ov = sec.get("overview", {}) or {}

        # 3-column Scope Matrix Table
        matrix_rows = [
            [
                Paragraph("<b>Industry Domain</b>", self.table_header_style),
                Paragraph("<b>Primary Architectural Focus</b>", self.table_header_style),
                Paragraph("<b>Deployment Scope Target</b>", self.table_header_style),
            ],
            [
                Paragraph(_esc(ov.get("domain", "N/A")), self.table_cell_style),
                Paragraph(_esc(ov.get("primary_focus", "N/A")), self.table_cell_style),
                Paragraph(_esc(ov.get("scope", "N/A")), self.table_cell_style),
            ]
        ]
        t_mat = Table(matrix_rows, colWidths=[168, 168, 168])
        t_mat.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), COLOR_NAVY),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(t_mat)
        story.append(Spacer(1, 6))

        if ov.get("summary"):
            story.append(Paragraph(f"<b>Architecture Summary:</b> {_esc(ov.get('summary'))}", self.body_style))
        if hasattr(project, "description") and project.description:
            story.append(Paragraph(f"<b>Project Description:</b> {_esc(project.description)}", self.body_style))

        # Grounding Workspace Specifications
        ws = getattr(project, "workspace", None)
        if ws:
            ws_items = []
            if getattr(ws, "vision", None):
                ws_items.append(("Product Vision & Scope", ws.vision))
            if getattr(ws, "problem_statement", None):
                ws_items.append(("Problem Statement & Objectives", ws.problem_statement))
            if getattr(ws, "requirements", None):
                ws_items.append(("Core Functional & Non-Functional Requirements", ws.requirements))
            if getattr(ws, "constraints", None):
                ws_items.append(("Technical, Timeline & Budget Constraints", ws.constraints))
            if getattr(ws, "business_goals", None):
                ws_items.append(("Primary Business Goals", ws.business_goals))
            if getattr(ws, "target_users", None):
                ws_items.append(("Target Users & Concurrency Scale", ws.target_users))
            if getattr(ws, "stakeholders", None):
                ws_items.append(("Key Stakeholders & Team Structure", ws.stakeholders))

            if ws_items:
                story.append(Spacer(1, 4))
                story.append(Paragraph("<b>Workspace Grounding Specifications:</b>", self.h3_style))
                for label, val in ws_items:
                    story.append(Paragraph(f"<b>{_esc(label)}:</b><br/>{_esc(val)}", self.body_style))
        story.append(Spacer(1, 10))

        # 02. Technology Stack & Ecosystem
        story.append(Paragraph(f"{prefix}02. Technology Stack & Ecosystem", self.h1_style))
        ts = sec.get("tech_stack", {}) or {}
        ts_rows = [[
            Paragraph("<b>Architecture Tier</b>", self.table_header_style),
            Paragraph("<b>Selected Frameworks, Platforms & Libraries</b>", self.table_header_style),
        ]]
        for layer, items in [
            ("Frontend / Client Tier", ts.get("frontend", [])),
            ("API & Backend Tier", ts.get("backend", [])),
            ("Database & Persistence Tier", ts.get("database", [])),
            ("DevOps & Cloud Infrastructure", ts.get("devops_infrastructure", [])),
            ("Third-Party Services & Integrations", ts.get("third_party_services", [])),
        ]:
            if items:
                items_str = ", ".join(items) if isinstance(items, list) else str(items)
                ts_rows.append([
                    Paragraph(f"<b>{_esc(layer)}</b>", self.table_cell_style),
                    Paragraph(_esc(items_str), self.table_cell_style),
                ])
        if len(ts_rows) > 1:
            t_ts = Table(ts_rows, colWidths=[150, 354])
            t_ts.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_NAVY),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            story.append(t_ts)
        story.append(Spacer(1, 10))

        # 03. Architecture Style & Design Patterns
        story.append(Paragraph(f"{prefix}03. Architecture Style & Design Patterns", self.h1_style))
        style_sec = sec.get("architecture_style", {}) or {}
        story.append(Paragraph(f"<b>Architectural Paradigm:</b> {_esc(style_sec.get('style_name', 'N/A'))}", self.body_style))
        story.append(Paragraph(f"<b>Design Pattern:</b> {_esc(style_sec.get('pattern_type', 'N/A'))}", self.body_style))
        story.append(Paragraph(f"<b>Justification & Trade-off Context:</b> {_esc(style_sec.get('justification', 'N/A'))}", self.body_style))
        story.append(Spacer(1, 10))

        # 04. Architecture Decision Records (ADR)
        story.append(Paragraph(f"{prefix}04. Architecture Decision Records (ADR)", self.h1_style))
        decisions = sec.get("decisions_and_rationale", []) or []
        if decisions and isinstance(decisions, list):
            # Summary Table
            adr_rows = [[
                Paragraph("<b>#</b>", self.table_header_style),
                Paragraph("<b>Decision Statement</b>", self.table_header_style),
                Paragraph("<b>Requirement Grounding</b>", self.table_header_style),
            ]]
            for idx, d in enumerate(decisions, start=1):
                if isinstance(d, dict):
                    adr_rows.append([
                        Paragraph(f"ADR-{idx:02d}", self.table_cell_style),
                        Paragraph(f"<b>{_esc(d.get('decision', ''))}</b>", self.table_cell_style),
                        Paragraph(_esc(d.get("grounded_requirement", "")), self.table_cell_style),
                    ])
            t_adr = Table(adr_rows, colWidths=[54, 250, 200])
            t_adr.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_NAVY),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            story.append(t_adr)
            story.append(Spacer(1, 6))

            # Detailed ADR Records
            for idx, d in enumerate(decisions, start=1):
                if isinstance(d, dict):
                    alts = ", ".join(d.get("alternatives_considered", [])) if isinstance(d.get("alternatives_considered"), list) else str(d.get("alternatives_considered", "None"))
                    story.append(Paragraph(f"<b>ADR-{idx:02d}: {_esc(d.get('decision', ''))}</b>", self.h3_style))
                    story.append(Paragraph(f"<b>Architectural Rationale:</b> {_esc(d.get('rationale', ''))}", self.body_style))
                    if d.get("grounded_requirement"):
                        story.append(Paragraph(f"<b>Requirement Grounding:</b> {_esc(d.get('grounded_requirement', ''))}", self.body_style))
                    if alts and alts != "None":
                        story.append(Paragraph(f"<b>Alternatives Considered & Rejected:</b> {_esc(alts)}", self.body_style))
                    story.append(Spacer(1, 4))
        story.append(Spacer(1, 10))

        # 05. System Components & Responsibilities
        story.append(Paragraph(f"{prefix}05. System Components & Responsibilities", self.h1_style))
        comps = sec.get("components", []) or []
        if comps and isinstance(comps, list):
            comp_rows = [[
                Paragraph("<b>Component</b>", self.table_header_style),
                Paragraph("<b>Type</b>", self.table_header_style),
                Paragraph("<b>Primary Responsibility</b>", self.table_header_style),
                Paragraph("<b>Interfaces & Protocols</b>", self.table_header_style),
            ]]
            for c in comps:
                if isinstance(c, dict):
                    ifaces = ", ".join(c.get("interfaces", [])) if isinstance(c.get("interfaces"), list) else str(c.get("interfaces", ""))
                    comp_rows.append([
                        Paragraph(f"<b>{_esc(c.get('name', ''))}</b>", self.table_cell_style),
                        Paragraph(_esc(c.get("type", "")), self.table_cell_style),
                        Paragraph(_esc(c.get("responsibility", "")), self.table_cell_style),
                        Paragraph(_esc(ifaces), self.table_cell_style),
                    ])
            t_comp = Table(comp_rows, colWidths=[110, 84, 210, 100])
            t_comp.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_NAVY),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            story.append(t_comp)
            story.append(Spacer(1, 6))

            # Detailed Component Breakdown
            for idx, c in enumerate(comps, start=1):
                if isinstance(c, dict):
                    ifaces = ", ".join(c.get("interfaces", [])) if isinstance(c.get("interfaces"), list) else str(c.get("interfaces", ""))
                    story.append(Paragraph(f"<b>{idx:02d}. {_esc(c.get('name', ''))} ({_esc(c.get('type', ''))})</b>", self.h3_style))
                    story.append(Paragraph(f"<b>Primary Responsibility:</b> {_esc(c.get('responsibility', ''))}", self.body_style))
                    if ifaces:
                        story.append(Paragraph(f"<b>Exposed Interfaces & Protocols:</b> {_esc(ifaces)}", self.body_style))
                    story.append(Spacer(1, 4))
        story.append(Spacer(1, 10))

        # 06. Interaction & Communication Flows
        story.append(Paragraph(f"{prefix}06. Interaction & Communication Flows", self.h1_style))
        rel = sec.get("component_relationships", []) or []
        if rel and isinstance(rel, list):
            rel_rows = [[
                Paragraph("<b>Source Component</b>", self.table_header_style),
                Paragraph("<b>Target Component</b>", self.table_header_style),
                Paragraph("<b>Interaction Description / Flow</b>", self.table_header_style),
                Paragraph("<b>Protocol</b>", self.table_header_style),
            ]]
            for r in rel:
                if isinstance(r, dict):
                    rel_rows.append([
                        Paragraph(f"<b>{_esc(r.get('source', ''))}</b>", self.table_cell_style),
                        Paragraph(f"<b>{_esc(r.get('target', ''))}</b>", self.table_cell_style),
                        Paragraph(_esc(r.get("interaction", "")), self.table_cell_style),
                        Paragraph(_esc(r.get("protocol", "")), self.table_cell_style),
                    ])
            t_rel = Table(rel_rows, colWidths=[110, 110, 194, 90])
            t_rel.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_NAVY),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            story.append(t_rel)
        story.append(Spacer(1, 10))

        # 07. Data Architecture & Persistence Strategy
        story.append(Paragraph(f"{prefix}07. Data Architecture & Persistence Strategy", self.h1_style))
        da = sec.get("data_architecture", {}) or {}
        storage_strat = da.get("storage_strategy") or da.get("data_storage_strategy", "N/A")
        data_flow = da.get("data_flow") or da.get("data_flow_overview", "N/A")
        story.append(Paragraph(f"<b>Storage Strategy & Model:</b> {_esc(storage_strat)}", self.body_style))
        stores = da.get("data_stores", [])
        if stores:
            stores_str = ", ".join(stores) if isinstance(stores, list) else str(stores)
            story.append(Paragraph(f"<b>Target Data Stores:</b> {_esc(stores_str)}", self.body_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph("<b>End-to-End Data Flow & Lifecycle:</b>", self.h3_style))
        story.append(Paragraph(_esc(data_flow), self.callout_style))
        story.append(Spacer(1, 10))

        # 08. External Integrations
        story.append(Paragraph(f"{prefix}08. External Integrations", self.h1_style))
        integ = sec.get("integrations", []) or []
        if integ and isinstance(integ, list):
            int_rows = [[
                Paragraph("<b>Service / Integration Name</b>", self.table_header_style),
                Paragraph("<b>Protocol / Interface</b>", self.table_header_style),
                Paragraph("<b>Purpose & Architectural Scope</b>", self.table_header_style),
            ]]
            for item in integ:
                if isinstance(item, dict):
                    int_rows.append([
                        Paragraph(f"<b>{_esc(item.get('name', ''))}</b>", self.table_cell_style),
                        Paragraph(_esc(item.get("protocol", "")), self.table_cell_style),
                        Paragraph(_esc(item.get("purpose", "")), self.table_cell_style),
                    ])
            t_int = Table(int_rows, colWidths=[140, 100, 264])
            t_int.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_NAVY),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            story.append(t_int)
        story.append(Spacer(1, 10))

        # 09. Security & Quality Considerations
        story.append(Paragraph(f"{prefix}09. Security & Quality Considerations", self.h1_style))
        sq = sec.get("security_and_quality", {}) or {}
        sec_ctrls = sq.get("security_controls", [])
        qual_attrs = sq.get("quality_attributes", [])
        comp_stds = sq.get("compliance", [])

        if sec_ctrls:
            story.append(Paragraph("<b>Security Controls & Hardening:</b>", self.h3_style))
            for ctrl in sec_ctrls:
                story.append(Paragraph(f"• {_esc(ctrl)}", self.body_style))
            story.append(Spacer(1, 4))

        if qual_attrs:
            story.append(Paragraph("<b>Quality Attributes & Non-Functional Guarantees:</b>", self.h3_style))
            for qa in qual_attrs:
                story.append(Paragraph(f"• {_esc(qa)}", self.body_style))
            story.append(Spacer(1, 4))

        if comp_stds:
            story.append(Paragraph("<b>Compliance & Industry Standards:</b>", self.h3_style))
            for cmp in comp_stds:
                story.append(Paragraph(f"• {_esc(cmp)}", self.body_style))
        story.append(Spacer(1, 10))

        # 10. Risks & Architectural Trade-offs
        story.append(Paragraph(f"{prefix}10. Risks & Architectural Trade-offs", self.h1_style))
        risks = sec.get("risks_and_tradeoffs", []) or []
        if risks and isinstance(risks, list):
            # Summary Risk Matrix Table
            risk_rows = [[
                Paragraph("<b>#</b>", self.table_header_style),
                Paragraph("<b>Identified Risk Statement</b>", self.table_header_style),
                Paragraph("<b>Severity / Impact</b>", self.table_header_style),
            ]]
            for idx, r in enumerate(risks, start=1):
                if isinstance(r, dict):
                    risk_rows.append([
                        Paragraph(f"RISK-{idx:02d}", self.table_cell_style),
                        Paragraph(f"<b>{_esc(r.get('risk', ''))}</b>", self.table_cell_style),
                        Paragraph(_esc(r.get("impact", "")), self.table_cell_style),
                    ])
            t_risk = Table(risk_rows, colWidths=[54, 250, 200])
            t_risk.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_NAVY),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            story.append(t_risk)
            story.append(Spacer(1, 6))

            # Detailed Risk Breakdown Records
            for idx, r in enumerate(risks, start=1):
                if isinstance(r, dict):
                    story.append(Paragraph(f"<b>RISK-{idx:02d}: {_esc(r.get('risk', ''))}</b>", self.h3_style))
                    story.append(Paragraph(f"<b>System Impact & Severity:</b> {_esc(r.get('impact', ''))}", self.body_style))
                    story.append(Paragraph(f"<b>Mitigation Strategy:</b> {_esc(r.get('mitigation', ''))}", self.body_style))
                    story.append(Paragraph(f"<b>Architectural Trade-Off:</b> {_esc(r.get('tradeoff', ''))}", self.body_style))
                    story.append(Spacer(1, 4))
        story.append(Spacer(1, 10))

        return story

    def generate_blueprint_pdf(self, project: Any, blueprint: Any) -> io.BytesIO:
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
        story = []

        # Cover page
        meta = [
            ("Project Name", project.title),
            ("Document Scope", "Architecture Blueprint Specification"),
            ("Blueprint Version", f"Version {blueprint.version}"),
            ("Generation Date", blueprint.created_at.strftime("%B %d, %Y at %H:%M UTC") if hasattr(blueprint.created_at, 'strftime') else str(blueprint.created_at)),
            ("Export Timestamp", datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")),
            ("Status", str(blueprint.status).upper()),
        ]
        story.extend(self._build_cover_page(
            title=f"Architecture Blueprint: {project.title}",
            subtitle=f"System Architecture & Engineering Specification — v{blueprint.version}",
            metadata=meta
        ))

        # Complete Blueprint body sections
        story.extend(self._build_blueprint_pdf_sections(project, blueprint, is_subpart=False))

        doc.build(story, canvasmaker=NumberedCanvas)
        buf.seek(0)
        return buf

    def generate_software_design_pdf(self, project: Any, software_design: Any) -> io.BytesIO:
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
        sec = software_design.sections
        story = []

        # Cover page
        meta = [
            ("Project Name", project.title),
            ("Document Scope", "Software Design Document (Low-Level Engineering Specification)"),
            ("Software Design Version", f"Version {software_design.version}"),
            ("Derived from Blueprint", f"Version {software_design.blueprint_version}"),
            ("Generation Date", software_design.created_at.strftime("%B %d, %Y at %H:%M UTC") if hasattr(software_design.created_at, 'strftime') else str(software_design.created_at)),
            ("Export Timestamp", datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")),
            ("Status", str(software_design.status).upper()),
        ]
        story.extend(self._build_cover_page(
            title=f"Software Design Document: {project.title}",
            subtitle=f"Detailed Engineering Specification — v{software_design.version} (Blueprint v{software_design.blueprint_version})",
            metadata=meta
        ))

        # 1. Overview
        story.append(Paragraph("1. System Design Overview", self.h1_style))
        ov = sec.get("overview", {})
        story.append(Paragraph(f"<b>Design Approach:</b> {ov.get('design_approach', '')}", self.body_style))
        story.append(Paragraph(f"<b>Application Type:</b> {ov.get('application_type', '')}", self.body_style))
        story.append(Paragraph(f"<b>Architecture Alignment:</b> {ov.get('architectural_style_alignment', '')}", self.body_style))
        story.append(Paragraph(f"<b>Database Approach:</b> {ov.get('database_approach', '')}", self.body_style))
        core_m = ", ".join(ov.get("core_modules", [])) if isinstance(ov.get("core_modules"), list) else str(ov.get("core_modules", ""))
        story.append(Paragraph(f"<b>Core Modules:</b> {core_m}", self.body_style))
        cons = "; ".join(ov.get("key_design_considerations", [])) if isinstance(ov.get("key_design_considerations"), list) else str(ov.get("key_design_considerations", ""))
        story.append(Paragraph(f"<b>Key Considerations:</b> {cons}", self.body_style))
        story.append(Spacer(1, 10))

        # 2. High-Level Design
        story.append(Paragraph("2. High-Level Design (HLD)", self.h1_style))
        hld = sec.get("high_level_design", {})
        story.append(Paragraph(hld.get("system_overview", ""), self.body_style))
        comps = hld.get("components", [])
        if comps and isinstance(comps, list):
            hld_rows = [[
                Paragraph("<b>Component</b>", self.table_header_style),
                Paragraph("<b>Layer</b>", self.table_header_style),
                Paragraph("<b>Responsibility</b>", self.table_header_style),
                Paragraph("<b>Interactions & Technology</b>", self.table_header_style),
            ]]
            for c in comps:
                if isinstance(c, dict):
                    inter = ", ".join(c.get("key_interactions", [])) if isinstance(c.get("key_interactions"), list) else str(c.get("key_interactions", ""))
                    hld_rows.append([
                        Paragraph(f"<b>{c.get('name', '')}</b>", self.table_cell_style),
                        Paragraph(c.get("layer", ""), self.table_cell_style),
                        Paragraph(c.get("responsibility", ""), self.table_cell_style),
                        Paragraph(f"Tech: {c.get('technology', '')}<br/>Interactions: {inter}", self.table_cell_style),
                    ])
            t = Table(hld_rows, colWidths=[110, 84, 170, 140])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_NAVY),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            story.append(t)
        story.append(Spacer(1, 10))

        # 3. Low-Level Design
        story.append(Paragraph("3. Low-Level Design (LLD)", self.h1_style))
        lld = sec.get("low_level_design", {})
        story.append(Paragraph(f"<b>Error Handling Strategy:</b> {lld.get('error_handling_strategy', '')}", self.body_style))
        pats = ", ".join(lld.get("design_patterns_applied", [])) if isinstance(lld.get("design_patterns_applied"), list) else ""
        story.append(Paragraph(f"<b>Applied Design Patterns:</b> {pats}", self.body_style))
        modules = lld.get("modules", [])
        if modules and isinstance(modules, list):
            for m in modules:
                if isinstance(m, dict):
                    methods = "; ".join(m.get("key_methods", [])) if isinstance(m.get("key_methods"), list) else str(m.get("key_methods", ""))
                    story.append(Paragraph(f"<b>{m.get('name', '')}</b> ({m.get('module_type', '')}) — Pattern: <i>{m.get('design_pattern', 'N/A')}</i>", self.h3_style))
                    story.append(Paragraph(f"<b>Responsibility:</b> {m.get('responsibility', '')}", self.body_style))
                    story.append(Paragraph(f"<b>Key Methods:</b> {methods}", self.body_style))
        story.append(Spacer(1, 10))

        # 4. Folder Structure
        story.append(Paragraph("4. Directory & Folder Structure", self.h1_style))
        fs = sec.get("folder_structure", {})
        story.append(Paragraph(fs.get("description", ""), self.body_style))
        tree = fs.get("structure_tree", "")
        if tree:
            story.append(Preformatted(tree, self.code_style))
        story.append(Spacer(1, 10))

        # 5. Database Design
        story.append(Paragraph("5. Database Design & Entity Models", self.h1_style))
        db_d = sec.get("database_design", {})
        story.append(Paragraph(f"<b>Database Technology:</b> {db_d.get('db_technology', '')}", self.body_style))
        story.append(Paragraph(f"<b>Schema Strategy:</b> {db_d.get('schema_strategy', '')}", self.body_style))
        entities = db_d.get("entities", [])
        if entities and isinstance(entities, list):
            for ent in entities:
                if isinstance(ent, dict):
                    story.append(Paragraph(f"<b>Entity: {ent.get('name', '')}</b> ({ent.get('entity_type', 'table')})", self.h3_style))
                    story.append(Paragraph(ent.get("description", ""), self.body_style))
                    fields = ent.get("fields", [])
                    if fields and isinstance(fields, list):
                        f_rows = [[
                            Paragraph("<b>Field Name</b>", self.table_header_style),
                            Paragraph("<b>Type</b>", self.table_header_style),
                            Paragraph("<b>Constraints</b>", self.table_header_style),
                            Paragraph("<b>Description</b>", self.table_header_style),
                        ]]
                        for f in fields:
                            if isinstance(f, dict):
                                f_rows.append([
                                    Paragraph(f.get("name", ""), self.table_cell_style),
                                    Paragraph(f.get("data_type", ""), self.table_cell_style),
                                    Paragraph(f.get("constraints", ""), self.table_cell_style),
                                    Paragraph(f.get("description", ""), self.table_cell_style),
                                ])
                        t = Table(f_rows, colWidths=[110, 80, 114, 200])
                        t.setStyle(TableStyle([
                            ("BACKGROUND", (0, 0), (-1, 0), COLOR_NAVY),
                            ("PADDING", (0, 0), (-1, -1), 4),
                            ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                            ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ]))
                        story.append(t)
                        story.append(Spacer(1, 6))
        story.append(Spacer(1, 10))

        # 6. API Specifications
        story.append(Paragraph("6. API Specifications & Contracts", self.h1_style))
        api = sec.get("api_specifications", {})
        story.append(Paragraph(f"<b>Base URL:</b> {api.get('base_url', '')}  |  <b>Auth:</b> {api.get('auth_mechanism', '')}", self.body_style))
        endpoints = api.get("endpoints", [])
        if endpoints and isinstance(endpoints, list):
            ep_rows = [[
                Paragraph("<b>Method & Path</b>", self.table_header_style),
                Paragraph("<b>Purpose</b>", self.table_header_style),
                Paragraph("<b>Auth</b>", self.table_header_style),
                Paragraph("<b>Response Contract</b>", self.table_header_style),
            ]]
            for ep in endpoints:
                if isinstance(ep, dict):
                    ep_rows.append([
                        Paragraph(f"<b>{ep.get('method', '')}</b> {ep.get('path', '')}", self.table_cell_style),
                        Paragraph(ep.get("purpose", ""), self.table_cell_style),
                        Paragraph("Yes" if ep.get("auth_required") else "No", self.table_cell_style),
                        Paragraph(f"<font face='Courier' size='7'>{ep.get('response_shape', '')[:100]}</font>", self.table_cell_style),
                    ])
            t = Table(ep_rows, colWidths=[140, 150, 44, 170])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_NAVY),
                ("PADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            story.append(t)
        story.append(Spacer(1, 10))

        # 7. Rendered Diagrams
        story.append(Paragraph("7. Technical Architecture Diagrams", self.h1_style))
        diag_sec = sec.get("diagrams", {})
        diag_items = []
        if isinstance(diag_sec, dict):
            for k in ["er_diagram", "class_diagram", "component_diagram"]:
                if k in diag_sec and isinstance(diag_sec[k], dict):
                    diag_items.append(diag_sec[k])
            if not diag_items and "diagrams" in diag_sec and isinstance(diag_sec["diagrams"], list):
                diag_items = diag_sec["diagrams"]

        for idx, d in enumerate(diag_items, start=1):
            title = d.get("title", f"Diagram {idx}")
            desc = d.get("description", "")
            code = d.get("mermaid_code", "")
            story.append(Paragraph(f"7.{idx} {title}", self.h2_style))
            if desc:
                story.append(Paragraph(desc, self.body_style))
            if code:
                rendered = render_mermaid_diagram(code, title)
                if rendered:
                    img_b, w, h = rendered
                    story.extend(self._render_image_flowable(img_b, w, h, f"Figure {idx}: {title}"))

        doc.build(story, canvasmaker=NumberedCanvas)
        buf.seek(0)
        return buf

    def generate_documentation_pdf(self, project: Any, blueprint: Any, software_design: Any) -> io.BytesIO:
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
        story = []

        # Cover Page
        meta = [
            ("Project Name", project.title),
            ("Document Scope", "Complete Systems Architecture & Engineering Specification"),
            ("Blueprint Version", f"Version {blueprint.version}"),
            ("Software Design Version", f"Version {software_design.version}"),
            ("Software Design Derivation", f"Derived from Blueprint v{software_design.blueprint_version}"),
            ("Export Timestamp", datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")),
        ]
        story.extend(self._build_cover_page(
            title=f"Complete Architecture Specification: {project.title}",
            subtitle=f"Unified Technical Deliverable — Blueprint v{blueprint.version} & Software Design v{software_design.version}",
            metadata=meta
        ))

        # Part I: Architecture Blueprint
        story.append(Paragraph("PART I — ARCHITECTURE BLUEPRINT", ParagraphStyle(
            "Part1Header", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=COLOR_BLUE, spaceBefore=10, spaceAfter=14
        )))
        story.append(Paragraph("This part contains high-level structural paradigms, ADR records, and system-level boundaries.", self.callout_style))
        story.append(Spacer(1, 10))

        # Inline complete Blueprint content
        story.extend(self._build_blueprint_pdf_sections(project, blueprint, is_subpart=True))

        story.append(PageBreak())

        # Part II: Software Design
        story.append(Paragraph("PART II — SOFTWARE DESIGN SPECIFICATION", ParagraphStyle(
            "Part2Header", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=COLOR_BLUE, spaceBefore=10, spaceAfter=14
        )))
        story.append(Paragraph("This part details implementation classes, API contracts, database schemas, and low-level component models.", self.callout_style))
        story.append(Spacer(1, 10))

        sd_sec = software_design.sections
        sd_ov = sd_sec.get("overview", {})
        story.append(Paragraph("1. Software Design Approach", self.h1_style))
        story.append(Paragraph(f"<b>Approach:</b> {sd_ov.get('design_approach', '')}", self.body_style))
        story.append(Paragraph(f"<b>Database Approach:</b> {sd_ov.get('database_approach', '')}", self.body_style))

        # Diagrams in Part II
        diag_sec = sd_sec.get("diagrams", {})
        diag_items = []
        if isinstance(diag_sec, dict):
            for k in ["er_diagram", "class_diagram", "component_diagram"]:
                if k in diag_sec and isinstance(diag_sec[k], dict):
                    diag_items.append(diag_sec[k])
            if not diag_items and "diagrams" in diag_sec and isinstance(diag_sec["diagrams"], list):
                diag_items = diag_sec["diagrams"]

        story.append(Paragraph("2. Software Diagrams", self.h1_style))
        for idx, d in enumerate(diag_items, start=1):
            title = d.get("title", f"Diagram {idx}")
            code = d.get("mermaid_code", "")
            if code:
                rendered = render_mermaid_diagram(code, title)
                if rendered:
                    img_b, w, h = rendered
                    story.extend(self._render_image_flowable(img_b, w, h, f"Figure {idx + 1}: {title}"))

        doc.build(story, canvasmaker=NumberedCanvas)
        buf.seek(0)
        return buf


# ─────────────────────────────────────────────────────────────────────────────
# MICROSOFT WORD (.DOCX) EXPORT GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

class DocxExporter:
    """Generates professional Microsoft Word documents (.docx) using python-docx."""

    def _set_cell_background(self, cell, hex_color: str):
        shd_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
        cell._tc.get_or_add_tcPr().append(parse_xml(shd_xml))

    def _set_table_borders(self, table, color: str = HEX_BORDER):
        tblPr = table._tbl.tblPr
        borders_xml = f"""
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color}"/>
            <w:right w:val="none"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
        """
        tblPr.append(parse_xml(borders_xml))

    def _format_table(self, table, col_widths: Optional[List[float]] = None):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        self._set_table_borders(table)

        # Style header row
        hdr_row = table.rows[0]
        # Repeat header on pages
        hdr_tr = hdr_row._tr.get_or_add_trPr()
        hdr_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
        hdr_tr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

        for cell in hdr_row.cells:
            self._set_cell_background(cell, HEX_PRIMARY_NAVY)
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(4)
                for r in p.runs:
                    r.font.name = "Calibri"
                    r.font.bold = True
                    r.font.size = Pt(9)
                    r.font.color.rgb = RGBColor(255, 255, 255)

        # Style data rows
        for r_idx, row in enumerate(table.rows[1:], start=1):
            row._tr.get_or_add_trPr().append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
            bg_color = HEX_BG_LIGHT if r_idx % 2 == 1 else "FFFFFF"
            for cell in row.cells:
                self._set_cell_background(cell, bg_color)
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(3)
                    p.paragraph_format.space_after = Pt(3)
                    for r in p.runs:
                        r.font.name = "Calibri"
                        r.font.size = Pt(8.5)
                        r.font.color.rgb = RGBColor(51, 65, 85)

        # Column widths
        if col_widths:
            for row in table.rows:
                for idx, w in enumerate(col_widths):
                    if idx < len(row.cells):
                        row.cells[idx].width = Inches(w)

    def _add_cover_page(self, doc: Document, title: str, subtitle: str, metadata: List[Tuple[str, str]]):
        # Section margins
        sec = doc.sections[0]
        sec.top_margin = Inches(1)
        sec.bottom_margin = Inches(1)
        sec.left_margin = Inches(1)
        sec.right_margin = Inches(1)
        sec.different_first_page_header_footer = True

        # Header for page 2 onwards
        header = sec.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("ArchitectIQ  |  Systems Architecture & Engineering Specification")
        hrun.font.name = "Calibri"
        hrun.font.size = Pt(8)
        hrun.font.color.rgb = RGBColor(100, 116, 139)

        # Footer for page 2 onwards
        footer = sec.footer
        fp = footer.paragraphs[0]
        frun = fp.add_run("CONFIDENTIAL  —  ArchitectIQ Engineering Documentation")
        frun.font.name = "Calibri"
        frun.font.size = Pt(8)
        frun.font.color.rgb = RGBColor(100, 116, 139)

        # Cover content
        p_logo = doc.add_paragraph()
        p_logo.paragraph_format.space_before = Pt(40)
        p_logo.paragraph_format.space_after = Pt(12)
        r_logo = p_logo.add_run("ARCHITECTIQ")
        r_logo.font.name = "Calibri"
        r_logo.font.bold = True
        r_logo.font.size = Pt(14)
        r_logo.font.color.rgb = RGBColor(40, 123, 255)

        p_title = doc.add_paragraph()
        p_title.paragraph_format.space_after = Pt(8)
        r_title = p_title.add_run(title)
        r_title.font.name = "Calibri"
        r_title.font.bold = True
        r_title.font.size = Pt(24)
        r_title.font.color.rgb = RGBColor(11, 20, 40)

        p_sub = doc.add_paragraph()
        p_sub.paragraph_format.space_after = Pt(24)
        r_sub = p_sub.add_run(subtitle)
        r_sub.font.name = "Calibri"
        r_sub.font.size = Pt(12)
        r_sub.font.color.rgb = RGBColor(40, 123, 255)

        # Metadata Table
        tbl = doc.add_table(rows=len(metadata), cols=2)
        for idx, (k, v) in enumerate(metadata):
            cell_k = tbl.rows[idx].cells[0]
            cell_v = tbl.rows[idx].cells[1]
            cell_k.text = k
            cell_v.text = v
            cell_k.paragraphs[0].runs[0].font.bold = True
            cell_k.paragraphs[0].runs[0].font.size = Pt(9.5)
            cell_v.paragraphs[0].runs[0].font.size = Pt(9.5)
        self._format_table(tbl, [2.0, 4.5])

        p_note = doc.add_paragraph()
        p_note.paragraph_format.space_before = Pt(36)
        r_note = p_note.add_run(
            "This document is an authoritative engineering deliverable generated by ArchitectIQ. "
            "It captures exact architectural paradigms, design patterns, ADR decisions, schema structures, "
            "and rendered component diagrams."
        )
        r_note.font.name = "Calibri"
        r_note.font.italic = True
        r_note.font.size = Pt(9)
        r_note.font.color.rgb = RGBColor(100, 116, 139)

        doc.add_page_break()

    def _add_heading(self, doc: Document, text: str, level: int):
        h = doc.add_heading(text, level=level)
        h.paragraph_format.keep_with_next = True
        run = h.runs[0]
        run.font.name = "Calibri"
        if level == 1:
            run.font.size = Pt(16)
            run.font.color.rgb = RGBColor(11, 20, 40)
            h.paragraph_format.space_before = Pt(16)
            h.paragraph_format.space_after = Pt(6)
        elif level == 2:
            run.font.size = Pt(13)
            run.font.color.rgb = RGBColor(40, 123, 255)
            h.paragraph_format.space_before = Pt(12)
            h.paragraph_format.space_after = Pt(4)
        else:
            run.font.size = Pt(11)
            run.font.color.rgb = RGBColor(30, 41, 59)
            h.paragraph_format.space_before = Pt(8)
            h.paragraph_format.space_after = Pt(2)

    def _add_para(self, doc: Document, text: str, bold_prefix: str = ""):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_b = p.add_run(bold_prefix)
            r_b.font.name = "Calibri"
            r_b.font.bold = True
            r_b.font.size = Pt(10)
            r_b.font.color.rgb = RGBColor(30, 41, 59)
        if text:
            r = p.add_run(text)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(51, 65, 85)

    def _add_code_block(self, doc: Document, code_text: str):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(code_text)
        r.font.name = "Consolas"
        r.font.size = Pt(8)
        r.font.color.rgb = RGBColor(30, 41, 59)
        shd = f'<w:shd {nsdecls("w")} w:fill="{HEX_BG_ALT}"/>'
        p._p.get_or_add_pPr().append(parse_xml(shd))

    def _add_diagram(self, doc: Document, mermaid_code: str, title: str, figure_label: str):
        if not mermaid_code or not mermaid_code.strip():
            return
        rendered = render_mermaid_diagram(mermaid_code, title)
        if not rendered:
            self._add_para(doc, "Diagram rendering unavailable via cloud service. Raw diagram specification:", bold_prefix="Note: ")
            self._add_code_block(doc, mermaid_code)
            return
        img_bytes, w, h = rendered

        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)

        # Max width 6.0 inches
        max_width_in = 6.0
        doc.add_picture(io.BytesIO(img_bytes), width=Inches(max_width_in))

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(12)
        r_cap = p_cap.add_run(figure_label)
        r_cap.font.name = "Calibri"
        r_cap.font.italic = True
        r_cap.font.size = Pt(8.5)
        r_cap.font.color.rgb = RGBColor(100, 116, 139)

    def _build_blueprint_docx_content(self, doc: Document, project: Any, blueprint: Any, is_subpart: bool = False):
        sec = blueprint.sections or {}
        prefix = "Part I — " if is_subpart else ""
        h_lvl = 2 if is_subpart else 1

        # HERO SECTION: Architecture Visualization Workspace
        self._add_heading(doc, f"{prefix}System Architecture Diagram", level=h_lvl)
        vd = sec.get("visual_diagram", {}) or {}
        code = vd.get("mermaid_code", "")
        desc = vd.get("description", "")
        diag_type = vd.get("diagram_type", "")

        if diag_type:
            self._add_para(doc, diag_type, bold_prefix="Diagram Type: ")
        if desc:
            self._add_para(doc, desc, bold_prefix="Architecture Boundary & Topology: ")
        if code:
            clean_code = code.replace("\\n", "\n").replace("\\t", "    ").strip()
            self._add_diagram(doc, clean_code, "Component Boundary & Architecture Diagram", "Figure 1: Component Boundary & Architecture Topology Diagram")
            self._add_heading(doc, "Diagram Specification (Mermaid DSL):", level=h_lvl + 1)
            self._add_code_block(doc, clean_code)

        # 01. Executive Overview & Grounding Requirements
        self._add_heading(doc, f"{prefix}01. Executive Overview & Grounding Requirements", level=h_lvl)
        ov = sec.get("overview", {}) or {}

        # 3-column Scope Matrix Table
        tbl_mat = doc.add_table(rows=2, cols=3)
        hdr_mat = tbl_mat.rows[0].cells
        hdr_mat[0].text = "Industry Domain"
        hdr_mat[1].text = "Primary Architectural Focus"
        hdr_mat[2].text = "Deployment Scope Target"
        row_mat = tbl_mat.rows[1].cells
        row_mat[0].text = str(ov.get("domain", "N/A"))
        row_mat[1].text = str(ov.get("primary_focus", "N/A"))
        row_mat[2].text = str(ov.get("scope", "N/A"))
        self._format_table(tbl_mat, [2.1, 2.2, 2.2])

        if ov.get("summary"):
            self._add_para(doc, ov.get("summary"), bold_prefix="Architecture Summary: ")
        if hasattr(project, "description") and project.description:
            self._add_para(doc, project.description, bold_prefix="Project Description: ")

        # Grounding Workspace Specifications
        ws = getattr(project, "workspace", None)
        if ws:
            ws_items = []
            if getattr(ws, "vision", None):
                ws_items.append(("Product Vision & Scope", ws.vision))
            if getattr(ws, "problem_statement", None):
                ws_items.append(("Problem Statement & Objectives", ws.problem_statement))
            if getattr(ws, "requirements", None):
                ws_items.append(("Core Functional & Non-Functional Requirements", ws.requirements))
            if getattr(ws, "constraints", None):
                ws_items.append(("Technical, Timeline & Budget Constraints", ws.constraints))
            if getattr(ws, "business_goals", None):
                ws_items.append(("Primary Business Goals", ws.business_goals))
            if getattr(ws, "target_users", None):
                ws_items.append(("Target Users & Concurrency Scale", ws.target_users))
            if getattr(ws, "stakeholders", None):
                ws_items.append(("Key Stakeholders & Team Structure", ws.stakeholders))

            if ws_items:
                self._add_heading(doc, "Workspace Grounding Specifications", level=h_lvl + 1)
                for label, val in ws_items:
                    self._add_para(doc, val, bold_prefix=f"{label}: ")

        # 02. Technology Stack & Ecosystem
        self._add_heading(doc, f"{prefix}02. Technology Stack & Ecosystem", level=h_lvl)
        ts = sec.get("tech_stack", {}) or {}
        ts_items = [
            ("Frontend / Client Tier", ts.get("frontend", [])),
            ("API & Backend Tier", ts.get("backend", [])),
            ("Database & Persistence Tier", ts.get("database", [])),
            ("DevOps & Cloud Infrastructure", ts.get("devops_infrastructure", [])),
            ("Third-Party Services & Integrations", ts.get("third_party_services", [])),
        ]
        valid_ts = [(layer, items) for layer, items in ts_items if items]
        if valid_ts:
            tbl_ts = doc.add_table(rows=len(valid_ts) + 1, cols=2)
            hdr_ts = tbl_ts.rows[0].cells
            hdr_ts[0].text = "Architecture Tier"
            hdr_ts[1].text = "Selected Frameworks, Platforms & Libraries"
            for idx, (layer, items) in enumerate(valid_ts, start=1):
                cells = tbl_ts.rows[idx].cells
                cells[0].text = layer
                cells[1].text = ", ".join(items) if isinstance(items, list) else str(items)
            self._format_table(tbl_ts, [2.2, 4.3])

        # 03. Architecture Style & Design Patterns
        self._add_heading(doc, f"{prefix}03. Architecture Style & Design Patterns", level=h_lvl)
        style_sec = sec.get("architecture_style", {}) or {}
        self._add_para(doc, style_sec.get("style_name", "N/A"), bold_prefix="Architectural Paradigm: ")
        self._add_para(doc, style_sec.get("pattern_type", "N/A"), bold_prefix="Design Pattern: ")
        self._add_para(doc, style_sec.get("justification", "N/A"), bold_prefix="Justification & Trade-off Context: ")

        # 04. Architecture Decision Records (ADR)
        self._add_heading(doc, f"{prefix}04. Architecture Decision Records (ADR)", level=h_lvl)
        decisions = sec.get("decisions_and_rationale", []) or []
        if decisions and isinstance(decisions, list):
            # Summary Table
            tbl_d = doc.add_table(rows=len(decisions) + 1, cols=3)
            hdr_d = tbl_d.rows[0].cells
            hdr_d[0].text = "#"
            hdr_d[1].text = "Decision Statement"
            hdr_d[2].text = "Requirement Grounding"
            for idx, d in enumerate(decisions, start=1):
                if isinstance(d, dict):
                    cells = tbl_d.rows[idx].cells
                    cells[0].text = f"ADR-{idx:02d}"
                    cells[1].text = d.get("decision", "")
                    cells[2].text = d.get("grounded_requirement", "")
            self._format_table(tbl_d, [0.8, 3.2, 2.5])

            # Detailed ADR Records
            for idx, d in enumerate(decisions, start=1):
                if isinstance(d, dict):
                    alts = ", ".join(d.get("alternatives_considered", [])) if isinstance(d.get("alternatives_considered"), list) else str(d.get("alternatives_considered", "None"))
                    self._add_heading(doc, f"ADR-{idx:02d}: {d.get('decision', '')}", level=h_lvl + 1)
                    self._add_para(doc, d.get("rationale", ""), bold_prefix="Architectural Rationale: ")
                    if d.get("grounded_requirement"):
                        self._add_para(doc, d.get("grounded_requirement", ""), bold_prefix="Requirement Grounding: ")
                    if alts and alts != "None":
                        self._add_para(doc, alts, bold_prefix="Alternatives Considered & Rejected: ")

        # 05. System Components & Responsibilities
        self._add_heading(doc, f"{prefix}05. System Components & Responsibilities", level=h_lvl)
        comps = sec.get("components", []) or []
        if comps and isinstance(comps, list):
            # Summary Table
            tbl_c = doc.add_table(rows=len(comps) + 1, cols=4)
            hdr_c = tbl_c.rows[0].cells
            hdr_c[0].text = "Component"
            hdr_c[1].text = "Type"
            hdr_c[2].text = "Primary Responsibility"
            hdr_c[3].text = "Interfaces & Protocols"
            for idx, c in enumerate(comps, start=1):
                if isinstance(c, dict):
                    cells = tbl_c.rows[idx].cells
                    cells[0].text = c.get("name", "")
                    cells[1].text = c.get("type", "")
                    cells[2].text = c.get("responsibility", "")
                    ifaces = ", ".join(c.get("interfaces", [])) if isinstance(c.get("interfaces"), list) else str(c.get("interfaces", ""))
                    cells[3].text = ifaces
            self._format_table(tbl_c, [1.4, 1.1, 2.7, 1.3])

            # Detailed Component Breakdown
            for idx, c in enumerate(comps, start=1):
                if isinstance(c, dict):
                    ifaces = ", ".join(c.get("interfaces", [])) if isinstance(c.get("interfaces"), list) else str(c.get("interfaces", ""))
                    self._add_heading(doc, f"{idx:02d}. {c.get('name', '')} ({c.get('type', '')})", level=h_lvl + 1)
                    self._add_para(doc, c.get("responsibility", ""), bold_prefix="Primary Responsibility: ")
                    if ifaces:
                        self._add_para(doc, ifaces, bold_prefix="Exposed Interfaces & Protocols: ")

        # 06. Interaction & Communication Flows
        self._add_heading(doc, f"{prefix}06. Interaction & Communication Flows", level=h_lvl)
        rel = sec.get("component_relationships", []) or []
        if rel and isinstance(rel, list):
            tbl_r = doc.add_table(rows=len(rel) + 1, cols=4)
            hdr_r = tbl_r.rows[0].cells
            hdr_r[0].text = "Source Component"
            hdr_r[1].text = "Target Component"
            hdr_r[2].text = "Interaction Description / Flow"
            hdr_r[3].text = "Protocol"
            for idx, r in enumerate(rel, start=1):
                if isinstance(r, dict):
                    cells = tbl_r.rows[idx].cells
                    cells[0].text = r.get("source", "")
                    cells[1].text = r.get("target", "")
                    cells[2].text = r.get("interaction", "")
                    cells[3].text = r.get("protocol", "")
            self._format_table(tbl_r, [1.3, 1.3, 2.7, 1.2])

        # 07. Data Architecture & Persistence Strategy
        self._add_heading(doc, f"{prefix}07. Data Architecture & Persistence Strategy", level=h_lvl)
        da = sec.get("data_architecture", {}) or {}
        storage_strat = da.get("storage_strategy") or da.get("data_storage_strategy", "N/A")
        data_flow = da.get("data_flow") or da.get("data_flow_overview", "N/A")
        self._add_para(doc, storage_strat, bold_prefix="Storage Strategy & Model: ")
        stores = da.get("data_stores", [])
        if stores:
            stores_str = ", ".join(stores) if isinstance(stores, list) else str(stores)
            self._add_para(doc, stores_str, bold_prefix="Target Data Stores: ")
        self._add_heading(doc, "End-to-End Data Flow & Lifecycle:", level=h_lvl + 1)
        self._add_code_block(doc, data_flow)

        # 08. External Integrations
        self._add_heading(doc, f"{prefix}08. External Integrations", level=h_lvl)
        integ = sec.get("integrations", []) or []
        if integ and isinstance(integ, list):
            tbl_i = doc.add_table(rows=len(integ) + 1, cols=3)
            hdr_i = tbl_i.rows[0].cells
            hdr_i[0].text = "Service / Integration Name"
            hdr_i[1].text = "Protocol / Interface"
            hdr_i[2].text = "Purpose & Architectural Scope"
            for idx, item in enumerate(integ, start=1):
                if isinstance(item, dict):
                    cells = tbl_i.rows[idx].cells
                    cells[0].text = item.get("name", "")
                    cells[1].text = item.get("protocol", "")
                    cells[2].text = item.get("purpose", "")
            self._format_table(tbl_i, [1.7, 1.4, 3.4])

        # 09. Security & Quality Considerations
        self._add_heading(doc, f"{prefix}09. Security & Quality Considerations", level=h_lvl)
        sq = sec.get("security_and_quality", {}) or {}
        sec_ctrls = sq.get("security_controls", [])
        qual_attrs = sq.get("quality_attributes", [])
        comp_stds = sq.get("compliance", [])

        if sec_ctrls:
            self._add_heading(doc, "Security Controls & Hardening", level=h_lvl + 1)
            for ctrl in sec_ctrls:
                self._add_para(doc, ctrl, bold_prefix="• ")

        if qual_attrs:
            self._add_heading(doc, "Quality Attributes & Non-Functional Guarantees", level=h_lvl + 1)
            for qa in qual_attrs:
                self._add_para(doc, qa, bold_prefix="• ")

        if comp_stds:
            self._add_heading(doc, "Compliance & Regulatory Standards", level=h_lvl + 1)
            for cmp in comp_stds:
                self._add_para(doc, cmp, bold_prefix="• ")

        # 10. Risks & Architectural Trade-offs
        self._add_heading(doc, f"{prefix}10. Risks & Architectural Trade-offs", level=h_lvl)
        risks = sec.get("risks_and_tradeoffs", []) or []
        if risks and isinstance(risks, list):
            # Summary Table
            tbl_rk = doc.add_table(rows=len(risks) + 1, cols=3)
            hdr_rk = tbl_rk.rows[0].cells
            hdr_rk[0].text = "#"
            hdr_rk[1].text = "Identified Risk Statement"
            hdr_rk[2].text = "Severity / Impact"
            for idx, r in enumerate(risks, start=1):
                if isinstance(r, dict):
                    cells = tbl_rk.rows[idx].cells
                    cells[0].text = f"RISK-{idx:02d}"
                    cells[1].text = r.get("risk", "")
                    cells[2].text = r.get("impact", "")
            self._format_table(tbl_rk, [0.8, 3.2, 2.5])

            # Detailed Risk Breakdown Records
            for idx, r in enumerate(risks, start=1):
                if isinstance(r, dict):
                    self._add_heading(doc, f"RISK-{idx:02d}: {r.get('risk', '')}", level=h_lvl + 1)
                    self._add_para(doc, r.get("impact", ""), bold_prefix="System Impact & Severity: ")
                    self._add_para(doc, r.get("mitigation", ""), bold_prefix="Mitigation Strategy: ")
                    self._add_para(doc, r.get("tradeoff", ""), bold_prefix="Architectural Trade-Off: ")

    def generate_blueprint_docx(self, project: Any, blueprint: Any) -> io.BytesIO:
        doc = Document()

        meta = [
            ("Project Name", project.title),
            ("Document Scope", "Architecture Blueprint Specification"),
            ("Blueprint Version", f"Version {blueprint.version}"),
            ("Generation Date", blueprint.created_at.strftime("%B %d, %Y at %H:%M UTC") if hasattr(blueprint.created_at, 'strftime') else str(blueprint.created_at)),
            ("Export Timestamp", datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")),
            ("Status", str(blueprint.status).upper()),
        ]
        self._add_cover_page(
            doc,
            title=f"Architecture Blueprint: {project.title}",
            subtitle=f"System Architecture & Engineering Specification — v{blueprint.version}",
            metadata=meta
        )

        self._build_blueprint_docx_content(doc, project, blueprint, is_subpart=False)

        buf = io.BytesIO()
        doc.save(buf)
        buf.seek(0)
        return buf

    def generate_software_design_docx(self, project: Any, software_design: Any) -> io.BytesIO:
        doc = Document()
        sec = software_design.sections

        meta = [
            ("Project Name", project.title),
            ("Document Scope", "Software Design Document (Low-Level Engineering Specification)"),
            ("Software Design Version", f"Version {software_design.version}"),
            ("Derived from Blueprint", f"Version {software_design.blueprint_version}"),
            ("Generation Date", software_design.created_at.strftime("%B %d, %Y at %H:%M UTC") if hasattr(software_design.created_at, 'strftime') else str(software_design.created_at)),
            ("Export Timestamp", datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")),
            ("Status", str(software_design.status).upper()),
        ]
        self._add_cover_page(
            doc,
            title=f"Software Design Document: {project.title}",
            subtitle=f"Detailed Engineering Specification — v{software_design.version} (Blueprint v{software_design.blueprint_version})",
            metadata=meta
        )

        # 1. Overview
        self._add_heading(doc, "1. System Design Overview", level=1)
        ov = sec.get("overview", {})
        self._add_para(doc, ov.get("design_approach", ""), bold_prefix="Design Approach: ")
        self._add_para(doc, ov.get("application_type", ""), bold_prefix="Application Type: ")
        self._add_para(doc, ov.get("architectural_style_alignment", ""), bold_prefix="Architecture Alignment: ")
        self._add_para(doc, ov.get("database_approach", ""), bold_prefix="Database Approach: ")
        core_m = ", ".join(ov.get("core_modules", [])) if isinstance(ov.get("core_modules"), list) else str(ov.get("core_modules", ""))
        self._add_para(doc, core_m, bold_prefix="Core Modules: ")
        cons = "; ".join(ov.get("key_design_considerations", [])) if isinstance(ov.get("key_design_considerations"), list) else str(ov.get("key_design_considerations", ""))
        self._add_para(doc, cons, bold_prefix="Key Considerations: ")

        # 2. High-Level Design
        self._add_heading(doc, "2. High-Level Design (HLD)", level=1)
        hld = sec.get("high_level_design", {})
        self._add_para(doc, hld.get("system_overview", ""))
        comps = hld.get("components", [])
        if comps and isinstance(comps, list):
            tbl = doc.add_table(rows=len(comps) + 1, cols=4)
            hdr = tbl.rows[0].cells
            hdr[0].text = "Component"
            hdr[1].text = "Layer"
            hdr[2].text = "Responsibility"
            hdr[3].text = "Interactions & Tech"
            for idx, c in enumerate(comps, start=1):
                if isinstance(c, dict):
                    cells = tbl.rows[idx].cells
                    cells[0].text = c.get("name", "")
                    cells[1].text = c.get("layer", "")
                    cells[2].text = c.get("responsibility", "")
                    inter = ", ".join(c.get("key_interactions", [])) if isinstance(c.get("key_interactions"), list) else str(c.get("key_interactions", ""))
                    cells[3].text = f"Tech: {c.get('technology', '')}\nInteractions: {inter}"
            self._format_table(tbl, [1.4, 1.1, 2.3, 1.7])

        # 3. Low-Level Design
        self._add_heading(doc, "3. Low-Level Design (LLD)", level=1)
        lld = sec.get("low_level_design", {})
        self._add_para(doc, lld.get("error_handling_strategy", ""), bold_prefix="Error Handling Strategy: ")
        pats = ", ".join(lld.get("design_patterns_applied", [])) if isinstance(lld.get("design_patterns_applied"), list) else ""
        self._add_para(doc, pats, bold_prefix="Design Patterns Applied: ")
        modules = lld.get("modules", [])
        if modules and isinstance(modules, list):
            for m in modules:
                if isinstance(m, dict):
                    self._add_heading(doc, f"{m.get('name', '')} ({m.get('module_type', '')})", level=2)
                    self._add_para(doc, m.get("responsibility", ""), bold_prefix="Responsibility: ")
                    self._add_para(doc, m.get("design_pattern", "N/A"), bold_prefix="Pattern: ")
                    methods = "; ".join(m.get("key_methods", [])) if isinstance(m.get("key_methods"), list) else str(m.get("key_methods", ""))
                    self._add_para(doc, methods, bold_prefix="Key Methods: ")

        # 4. Folder Structure
        self._add_heading(doc, "4. Directory & Folder Structure", level=1)
        fs = sec.get("folder_structure", {})
        self._add_para(doc, fs.get("description", ""))
        if fs.get("structure_tree"):
            self._add_code_block(doc, fs.get("structure_tree"))

        # 5. Database Design
        self._add_heading(doc, "5. Database Design & Entity Models", level=1)
        db_d = sec.get("database_design", {})
        self._add_para(doc, db_d.get("db_technology", ""), bold_prefix="Technology: ")
        self._add_para(doc, db_d.get("schema_strategy", ""), bold_prefix="Strategy: ")
        entities = db_d.get("entities", [])
        if entities and isinstance(entities, list):
            for ent in entities:
                if isinstance(ent, dict):
                    self._add_heading(doc, f"Entity: {ent.get('name', '')} ({ent.get('entity_type', 'table')})", level=2)
                    self._add_para(doc, ent.get("description", ""))
                    fields = ent.get("fields", [])
                    if fields and isinstance(fields, list):
                        tbl = doc.add_table(rows=len(fields) + 1, cols=4)
                        hdr = tbl.rows[0].cells
                        hdr[0].text = "Field"
                        hdr[1].text = "Type"
                        hdr[2].text = "Constraints"
                        hdr[3].text = "Description"
                        for f_idx, f in enumerate(fields, start=1):
                            if isinstance(f, dict):
                                c = tbl.rows[f_idx].cells
                                c[0].text = f.get("name", "")
                                c[1].text = f.get("data_type", "")
                                c[2].text = f.get("constraints", "")
                                c[3].text = f.get("description", "")
                        self._format_table(tbl, [1.4, 1.1, 1.5, 2.5])

        # 6. API Specifications
        self._add_heading(doc, "6. API Specifications & Contracts", level=1)
        api = sec.get("api_specifications", {})
        self._add_para(doc, f"{api.get('base_url', '')} (Auth: {api.get('auth_mechanism', '')})", bold_prefix="Base URL: ")
        endpoints = api.get("endpoints", [])
        if endpoints and isinstance(endpoints, list):
            tbl = doc.add_table(rows=len(endpoints) + 1, cols=4)
            hdr = tbl.rows[0].cells
            hdr[0].text = "Method & Path"
            hdr[1].text = "Purpose"
            hdr[2].text = "Auth"
            hdr[3].text = "Response Shape"
            for ep_idx, ep in enumerate(endpoints, start=1):
                if isinstance(ep, dict):
                    c = tbl.rows[ep_idx].cells
                    c[0].text = f"{ep.get('method', '')} {ep.get('path', '')}"
                    c[1].text = ep.get("purpose", "")
                    c[2].text = "Yes" if ep.get("auth_required") else "No"
                    c[3].text = ep.get("response_shape", "")[:120]
            self._format_table(tbl, [1.8, 1.8, 0.6, 2.3])

        # 7. Rendered Diagrams
        self._add_heading(doc, "7. Technical Architecture Diagrams", level=1)
        diag_sec = sec.get("diagrams", {})
        diag_items = []
        if isinstance(diag_sec, dict):
            for k in ["er_diagram", "class_diagram", "component_diagram"]:
                if k in diag_sec and isinstance(diag_sec[k], dict):
                    diag_items.append(diag_sec[k])
            if not diag_items and "diagrams" in diag_sec and isinstance(diag_sec["diagrams"], list):
                diag_items = diag_sec["diagrams"]

        for idx, d in enumerate(diag_items, start=1):
            title = d.get("title", f"Diagram {idx}")
            desc = d.get("description", "")
            code = d.get("mermaid_code", "")
            self._add_heading(doc, f"7.{idx} {title}", level=2)
            if desc:
                self._add_para(doc, desc)
            if code:
                self._add_diagram(doc, code, title, f"Figure {idx}: {title}")

        buf = io.BytesIO()
        doc.save(buf)
        buf.seek(0)
        return buf

    def generate_documentation_docx(self, project: Any, blueprint: Any, software_design: Any) -> io.BytesIO:
        doc = Document()

        meta = [
            ("Project Name", project.title),
            ("Document Scope", "Complete Systems Architecture & Engineering Specification"),
            ("Blueprint Version", f"Version {blueprint.version}"),
            ("Software Design Version", f"Version {software_design.version}"),
            ("Software Design Derivation", f"Derived from Blueprint v{software_design.blueprint_version}"),
            ("Export Timestamp", datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")),
        ]
        self._add_cover_page(
            doc,
            title=f"Complete Architecture Specification: {project.title}",
            subtitle=f"Unified Technical Deliverable — Blueprint v{blueprint.version} & Software Design v{software_design.version}",
            metadata=meta
        )

        # PART I: Architecture Blueprint
        self._add_heading(doc, "PART I — ARCHITECTURE BLUEPRINT", level=1)
        self._add_para(doc, "This part contains high-level structural paradigms, ADR records, and system-level boundaries.")
        self._build_blueprint_docx_content(doc, project, blueprint, is_subpart=True)

        doc.add_page_break()

        # PART II: Software Design
        self._add_heading(doc, "PART II — SOFTWARE DESIGN SPECIFICATION", level=1)
        sd_sec = software_design.sections
        sd_ov = sd_sec.get("overview", {})
        self._add_heading(doc, "1. Software Design Approach", level=2)
        self._add_para(doc, sd_ov.get("design_approach", ""), bold_prefix="Design Approach: ")
        self._add_para(doc, sd_ov.get("database_approach", ""), bold_prefix="Database Approach: ")

        # Diagrams
        diag_sec = sd_sec.get("diagrams", {})
        diag_items = []
        if isinstance(diag_sec, dict):
            for k in ["er_diagram", "class_diagram", "component_diagram"]:
                if k in diag_sec and isinstance(diag_sec[k], dict):
                    diag_items.append(diag_sec[k])
            if not diag_items and "diagrams" in diag_sec and isinstance(diag_sec["diagrams"], list):
                diag_items = diag_sec["diagrams"]

        self._add_heading(doc, "2. Software Diagrams", level=2)
        for idx, d in enumerate(diag_items, start=1):
            title = d.get("title", f"Diagram {idx}")
            code = d.get("mermaid_code", "")
            if code:
                self._add_diagram(doc, code, title, f"Figure {idx + 1}: {title}")

        buf = io.BytesIO()
        doc.save(buf)
        buf.seek(0)
        return buf


# Global Exporter Instances
pdf_exporter = PdfExporter()
docx_exporter = DocxExporter()
