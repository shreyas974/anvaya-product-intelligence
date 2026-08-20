"""
dataset.py -- Contrastive Dataset Builder for Product Embedding Training

WHAT: Constructs paired and triplet training datasets from catalog records:
      (Anchor description, Positive canonical path, Hard negative path).

WHY:  Enables fine-tuning SentenceTransformers to align noisy distributor product
      descriptions with standardized B2B master catalog taxonomies.

HOW:  Extracts paired samples, generates negative pairs across distinct departments/classes,
      and packages them as PyTorch Datasets.
"""

from typing import List, Tuple, Dict, Any
import random
import pandas as pd
import torch
from torch.utils.data import Dataset


class ContrastiveProductDataset(Dataset):
    """
    PyTorch Dataset for Contrastive Product Embedding Training.

    Yields:
        anchor (str): Raw dirty distributor description.
        positive (str): Canonical taxonomy path / standardized category.
        negative (str): Unrelated negative category / description.
    """

    def __init__(self, triplets: List[Tuple[str, str, str]]):
        self.triplets = triplets

    def __len__(self) -> int:
        return len(self.triplets)

    def __getitem__(self, idx: int) -> Dict[str, str]:
        anchor, positive, negative = self.triplets[idx]
        return {
            "anchor": anchor,
            "positive": positive,
            "negative": negative,
        }


def build_contrastive_dataset(
    df: pd.DataFrame,
    desc_col: str = "Part_Desc",
    taxonomy_col: str = "Classpath",
) -> ContrastiveProductDataset:
    """
    Builds contrastive triplets from a catalog DataFrame.

    If taxonomy_col is missing or partially filled, infers from product name / Dept.
    """
    records: List[Tuple[str, str]] = []
    for _, row in df.iterrows():
        desc = str(row.get(desc_col, "")).strip()
        if not desc or desc.lower() == "nan":
            continue

        target = row.get(taxonomy_col)
        if not target or pd.isna(target) or str(target).lower() == "nan":
            # Fallback to Dept > Fine or Product Name
            dept = row.get("Dept", "General")
            fine = row.get("Fine", "General")
            p_name = row.get("Product Name", "")
            target = f"{dept} > {fine} > {p_name}".strip(" >")

        records.append((desc, str(target)))

    if not records:
        # Provide minimal synthetic baseline if empty
        records = [
            ("Dishwasher SS Built-in 24 inch", "Appliances > Dishwashers"),
            ("Diablo Sanding Belt 6pc", "Tools > Abrasives > Belts"),
        ]

    # Collect all unique positive categories for negative sampling
    all_positives = list(set([r[1] for r in records]))
    if len(all_positives) < 2:
        all_positives.append("Hardware > Fasteners")

    triplets: List[Tuple[str, str, str]] = []
    for anchor, pos in records:
        # Pick a hard negative from a different category
        neg_candidates = [c for c in all_positives if c != pos]
        negative = random.choice(neg_candidates) if neg_candidates else "Miscellaneous"
        triplets.append((anchor, pos, negative))

    return ContrastiveProductDataset(triplets)
