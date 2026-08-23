from datetime import datetime
from typing import Any, Optional
import json

from sqlalchemy import DateTime, Integer, Float, String, Text, ForeignKey, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.database import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )
    workspace_id: Mapped[str] = mapped_column(
        String(100),
        default="ws-default",
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        index=True,
    )
    file_name: Mapped[str] = mapped_column(
        String(255),
    )
    file_size_bytes: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )
    file_format: Mapped[str] = mapped_column(
        String(50),  # CSV, XLSX, JSON, TSV
        default="CSV",
    )
    row_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )
    column_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="UPLOADED",  # UPLOADED, PROFILED, PROCESSING, PROCESSED, ERROR
        index=True,
    )
    version: Mapped[str] = mapped_column(
        String(50),
        default="v1.0",
    )
    uploaded_by: Mapped[str] = mapped_column(
        String(150),
        default="Devin Vance",
    )
    profiling_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default="{}",
    )
    column_mapping_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default="{}",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    products: Mapped[list["Product"]] = relationship(
        "Product",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )
    review_items: Mapped[list["ReviewItem"]] = relationship(
        "ReviewItem",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )

    @property
    def profiling(self) -> dict[str, Any]:
        if not self.profiling_json:
            return {}
        try:
            return json.loads(self.profiling_json)
        except Exception:
            return {}

    @property
    def column_mapping(self) -> dict[str, Any]:
        if not self.column_mapping_json:
            return {}
        try:
            return json.loads(self.column_mapping_json)
        except Exception:
            return {}


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    dataset_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    workspace_id: Mapped[str] = mapped_column(
        String(100),
        default="ws-default",
        index=True,
    )

    # Raw Ingested Fields
    mfg_part_num: Mapped[str] = mapped_column(
        String(150),
        index=True,
    )
    part_desc: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    part_manuf: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        index=True,
    )
    e1_brand: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )
    unilog_brand: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )
    dib_brand: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )
    raw_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default="{}",
    )

    # AI Enriched & Canonical Fields
    cleaned_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )
    canonical_brand: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
        index=True,
    )
    manufacturer_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        index=True,
    )
    category: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
        index=True,
    )
    subcategory: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
        index=True,
    )
    product_type: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    # Dense Specifications & Descriptions (Stored as JSON string)
    attributes_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default="{}",
    )
    descriptions_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default="{}",
    )

    # Scores & Statuses
    completeness_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
    )
    confidence_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
    )
    enrichment_status: Mapped[str] = mapped_column(
        String(50),
        default="RAW",  # RAW, ENRICHED, PARTIAL, FAILED
        index=True,
    )
    validation_status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",  # PASS, WARNING, ERROR, REVIEW_REQUIRED
        index=True,
    )
    review_status: Mapped[str] = mapped_column(
        String(50),
        default="NONE",  # NONE, PENDING_REVIEW, APPROVED, REJECTED, EDITED
        index=True,
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    dataset: Mapped[Optional["Dataset"]] = relationship(
        "Dataset",
        back_populates="products",
    )
    provenance_records: Mapped[list["ProvenanceRecord"]] = relationship(
        "ProvenanceRecord",
        back_populates="product",
        cascade="all, delete-orphan",
    )
    validation_issues: Mapped[list["ValidationIssue"]] = relationship(
        "ValidationIssue",
        back_populates="product",
        cascade="all, delete-orphan",
    )
    review_items: Mapped[list["ReviewItem"]] = relationship(
        "ReviewItem",
        back_populates="product",
        cascade="all, delete-orphan",
    )

    @property
    def raw_data(self) -> dict[str, Any]:
        if not self.raw_json:
            return {}
        try:
            return json.loads(self.raw_json)
        except Exception:
            return {}

    @property
    def attributes(self) -> dict[str, Any]:
        if not self.attributes_json:
            return {}
        try:
            return json.loads(self.attributes_json)
        except Exception:
            return {}

    @property
    def descriptions(self) -> dict[str, Any]:
        if not self.descriptions_json:
            return {}
        try:
            return json.loads(self.descriptions_json)
        except Exception:
            return {}


class ProvenanceRecord(Base):
    __tablename__ = "provenance_records"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        index=True,
    )
    field_name: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )
    value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    source: Mapped[str] = mapped_column(
        String(100),  # e.g., "raw_description", "part_number", "ai_inferred", "normalized"
    )
    evidence: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    method: Mapped[str] = mapped_column(
        String(100),  # "rule_extraction", "regex", "brand_matcher", "ml_classifier", "llm"
    )
    confidence: Mapped[float] = mapped_column(
        Float,
        default=1.0,
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="provenance_records",
    )


class ValidationIssue(Base):
    __tablename__ = "validation_issues"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        index=True,
    )
    dataset_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )
    field_name: Mapped[str] = mapped_column(
        String(100),
    )
    rule_name: Mapped[str] = mapped_column(
        String(100),
    )
    severity: Mapped[str] = mapped_column(
        String(50),  # "CRITICAL", "WARNING", "INFO", "REVIEW_REQUIRED"
        index=True,
    )
    message: Mapped[str] = mapped_column(
        Text,
    )
    is_resolved: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="validation_issues",
    )


class ReviewItem(Base):
    __tablename__ = "review_items"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )
    product_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    dataset_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    sku: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )
    cleaned_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    raw_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    reason: Mapped[str] = mapped_column(
        Text,
    )
    field_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    current_value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    suggested_value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",  # PENDING, APPROVED, REJECTED, EDITED
        index=True,
    )
    reviewer_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    product: Mapped[Optional["Product"]] = relationship(
        "Product",
        back_populates="review_items",
    )
    dataset: Mapped[Optional["Dataset"]] = relationship(
        "Dataset",
        back_populates="review_items",
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )
    dataset_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )
    entity_type: Mapped[str] = mapped_column(
        String(100),
    )
    entity_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    description: Mapped[str] = mapped_column(
        Text,
    )
    details_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )