"""
classifier.py -- CategoryClassifier for Anvaya Enrichment Pipeline

WHAT: Classifies raw product descriptions into Dept, Class, Fine, and Classpath.

WHY:  Every catalog item requires a 3-level taxonomy hierarchy:
      - Dept (e.g. "Appliances", "Tools & Hardware", "Lighting")
      - Class (e.g. "Large Appliances", "Power Tools", "Fixtures")
      - Fine (e.g. "Dishwashers", "Sanding & Grinding", "Chandeliers")
      - Classpath (e.g. "Appliances & Consumer Electronics>Kitchen Appliances>Built-In Dishwashers")

HOW:  Uses semantic embeddings via SemanticMatcher to match the product's
      description against a structured taxonomy ontology.
"""

from dataclasses import dataclass
from typing import Sequence
import pandas as pd
from ai.embeddings.semantic_matcher import SemanticMatcher


@dataclass
class TaxonomyNode:
    """Represents a full branch in the taxonomy hierarchy."""
    dept: str
    class_name: str
    fine: str
    classpath: str


# Reference taxonomy tree representing industry standard catalog hierarchy
DEFAULT_TAXONOMY: list[TaxonomyNode] = [
    TaxonomyNode(
        dept="Appliances",
        class_name="Large Appliances",
        fine="Dishwashers",
        classpath="Appliances & Consumer Electronics>Kitchen Appliances>Built-In Dishwashers",
    ),
    TaxonomyNode(
        dept="Appliances",
        class_name="Kitchen Appliances",
        fine="Microwaves",
        classpath="Appliances & Consumer Electronics>Kitchen Appliances>Microwave Ovens",
    ),
    TaxonomyNode(
        dept="Appliances",
        class_name="Large Appliances",
        fine="Refrigerators",
        classpath="Appliances & Consumer Electronics>Kitchen Appliances>Refrigerators",
    ),
    TaxonomyNode(
        dept="Tools & Hardware",
        class_name="Abrasives",
        fine="Sanding Belts & Discs",
        classpath="Tools & Hardware>Abrasives & Polishing>Sanding Belts & Discs",
    ),
    TaxonomyNode(
        dept="Tools & Hardware",
        class_name="Abrasives",
        fine="Grinding Wheels",
        classpath="Tools & Hardware>Abrasives & Polishing>Grinding & Cut-Off Wheels",
    ),
    TaxonomyNode(
        dept="Tools & Hardware",
        class_name="Power Tools",
        fine="Blowers & Vacuums",
        classpath="Tools & Hardware>Power Tools>Blowers & Sweepers",
    ),
    TaxonomyNode(
        dept="Tools & Hardware",
        class_name="Power Tools",
        fine="Saws & Blades",
        classpath="Tools & Hardware>Power Tools>Power Saws",
    ),
    TaxonomyNode(
        dept="Tools & Hardware",
        class_name="Measuring & Layout",
        fine="Levels & Lasers",
        classpath="Tools & Hardware>Hand Tools>Measuring & Layout Tools>Laser Levels",
    ),
    TaxonomyNode(
        dept="Lighting & Ceiling Fans",
        class_name="Indoor Lighting",
        fine="Chandeliers & Pendants",
        classpath="Lighting & Electrical>Light Fixtures>Chandeliers & Pendants",
    ),
    TaxonomyNode(
        dept="Lighting & Ceiling Fans",
        class_name="Commercial Lighting",
        fine="Wrap & Strip Lights",
        classpath="Lighting & Electrical>Light Fixtures>LED Wrap & Linear Fixtures",
    ),
    TaxonomyNode(
        dept="Lighting & Ceiling Fans",
        class_name="Light Bulbs",
        fine="LED Bulbs",
        classpath="Lighting & Electrical>Light Bulbs>LED Bulbs",
    ),
    TaxonomyNode(
        dept="Building Materials",
        class_name="Decking & Railing",
        fine="Composite Decking",
        classpath="Building Materials>Decking & Porch>Composite & PVC Decking",
    ),
    TaxonomyNode(
        dept="Building Materials",
        class_name="Decking & Railing",
        fine="Railing Kits",
        classpath="Building Materials>Decking & Porch>Railing Kits & Balusters",
    ),
    TaxonomyNode(
        dept="Electrical",
        class_name="Boxes & Covers",
        fine="Weatherproof Box Covers",
        classpath="Electrical>Boxes Enclosures & Covers>Outlet & Switch Covers",
    ),
    TaxonomyNode(
        dept="Electrical",
        class_name="Fittings & Conduit",
        fine="Cord Grips & Connectors",
        classpath="Electrical>Conduit & Fittings>Cord Grips & Connectors",
    ),
]


@dataclass
class ClassificationResult:
    """Output of category classification for a single product."""
    dept: str
    class_name: str
    fine: str
    classpath: str
    confidence: float
    rule: str

    @property
    def status(self) -> str:
        return "AUTO_APPROVED" if self.confidence >= 0.70 else "HUMAN_REVIEW_REQUIRED"


class CategoryClassifier:
    """
    Classifies product text into standard taxonomy categories using semantic embeddings.
    """

    def __init__(self, taxonomy: list[TaxonomyNode] | None = None):
        self.taxonomy = taxonomy or DEFAULT_TAXONOMY
        # Build candidate search strings combining dept, fine, and classpath for rich semantic representation
        self.candidate_texts = [
            f"{node.fine} ({node.dept} - {node.class_name}): {node.classpath}"
            for node in self.taxonomy
        ]
        self.matcher = SemanticMatcher(candidates=self.candidate_texts)

    def classify_one(self, part_desc: str, product_name: str | None = None) -> ClassificationResult:
        """
        Classify a single product description into taxonomy fields.
        """
        query = f"{product_name or ''} {part_desc}".strip()
        matches = self.matcher.match_one(query, top_k=1)
        if not matches:
            return ClassificationResult(
                dept="", class_name="", fine="", classpath="",
                confidence=0.0, rule="classification_no_match"
            )

        best = matches[0]
        node = self.taxonomy[best.target_idx]
        return ClassificationResult(
            dept=node.dept,
            class_name=node.class_name,
            fine=node.fine,
            classpath=node.classpath,
            confidence=best.score,
            rule="semantic_embedding_classification",
        )

    def classify_batch(self, descriptions: Sequence[str], product_names: Sequence[str | None] | None = None) -> list[ClassificationResult]:
        """
        Classify a batch of descriptions efficiently.
        """
        if product_names is None:
            queries = [d.strip() for d in descriptions]
        else:
            queries = [
                f"{pn or ''} {d}".strip()
                for d, pn in zip(descriptions, product_names)
            ]

        match_batches = self.matcher.match_batch(queries, top_k=1)
        results = []
        for matches in match_batches:
            if not matches:
                results.append(ClassificationResult(
                    dept="", class_name="", fine="", classpath="",
                    confidence=0.0, rule="classification_no_match"
                ))
            else:
                best = matches[0]
                node = self.taxonomy[best.target_idx]
                results.append(ClassificationResult(
                    dept=node.dept,
                    class_name=node.class_name,
                    fine=node.fine,
                    classpath=node.classpath,
                    confidence=best.score,
                    rule="semantic_embedding_classification",
                ))
        return results
