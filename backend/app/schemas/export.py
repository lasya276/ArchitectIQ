"""
Export Request and Metadata Schemas for Document Generation.
Supports Word (.docx) and PDF (.pdf) exports for Blueprint, Software Design,
and Complete Architecture Documentation.
"""
from typing import Literal
from pydantic import BaseModel, Field


class BlueprintExportRequest(BaseModel):
    blueprint_version: int = Field(..., description="Specific Architecture Blueprint version to export", ge=1)
    format: Literal["docx", "pdf"] = Field("docx", description="Target document format")


class SoftwareDesignExportRequest(BaseModel):
    software_design_version: int = Field(..., description="Specific Software Design version to export", ge=1)
    format: Literal["docx", "pdf"] = Field("docx", description="Target document format")


class DocumentationExportRequest(BaseModel):
    blueprint_version: int = Field(..., description="Specific Architecture Blueprint version to export", ge=1)
    software_design_version: int = Field(..., description="Specific Software Design version to export", ge=1)
    format: Literal["docx", "pdf"] = Field("docx", description="Target document format")
