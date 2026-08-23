"""
semantic_matcher.py -- Semantic Embedding & Similarity Engine for Anvaya

WHAT: Converts text into dense vector embeddings and computes cosine similarity
      to find the best semantic matches against candidate lists (categories,
      brands, taxonomies, LOVs).

WHY:  Exact string matching fails on noisy descriptions (e.g. "Milw 4\"x1/4\""
      vs "Milwaukee Electric Tool"). Semantic embeddings capture underlying
      meaning and context.

HOW:  Uses SentenceTransformers ('all-MiniLM-L6-v2') to compute normalized
      embeddings. Matrix dot-product computes cosine similarity instantaneously.
"""

import numpy as np
from dataclasses import dataclass
from typing import Sequence
from ai.models.loader import get_sentence_transformer


@dataclass
class SemanticMatch:
    """Represents the best matching target text with similarity score."""
    query: str
    target: str
    score: float           # Cosine similarity in range [0.0, 1.0]
    target_idx: int


class SemanticMatcher:
    """
    Encodes candidate targets and retrieves the closest semantic matches for queries.
    """

    def __init__(self, candidates: Sequence[str] | None = None, model_name: str = "all-MiniLM-L6-v2"):
        self.model = get_sentence_transformer(model_name)
        self.candidates: list[str] = []
        self.candidate_embeddings: np.ndarray | None = None
        if candidates:
            self.set_candidates(candidates)

    def set_candidates(self, candidates: Sequence[str]) -> None:
        """Encode and store a list of candidate strings."""
        self.candidates = list(candidates)
        if self.candidates:
            # normalize_embeddings=True ensures dot product equals cosine similarity
            self.candidate_embeddings = self.model.encode(
                self.candidates,
                batch_size=64,
                show_progress_bar=False,
                normalize_embeddings=True,
            )
        else:
            self.candidate_embeddings = None

    def match_one(self, query: str, top_k: int = 1) -> list[SemanticMatch]:
        """
        Find top_k closest candidates for a single query string.
        """
        if not self.candidates or self.candidate_embeddings is None:
            return []

        query_emb = self.model.encode([query], normalize_embeddings=True)[0]
        # Dot product with all candidates
        scores = np.dot(self.candidate_embeddings, query_emb)
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            results.append(SemanticMatch(
                query=query,
                target=self.candidates[idx],
                score=float(scores[idx]),
                target_idx=int(idx),
            ))
        return results

    def match_batch(self, queries: Sequence[str], top_k: int = 1) -> list[list[SemanticMatch]]:
        """
        Find top_k closest candidates for a batch of query strings.
        """
        if not self.candidates or self.candidate_embeddings is None:
            return [[] for _ in queries]

        query_embs = self.model.encode(
            list(queries),
            batch_size=64,
            show_progress_bar=False,
            normalize_embeddings=True,
        )
        # (N_queries, N_candidates) matrix multiplication
        sim_matrix = np.dot(query_embs, self.candidate_embeddings.T)

        all_results = []
        for i, q in enumerate(queries):
            scores = sim_matrix[i]
            top_indices = np.argsort(scores)[::-1][:top_k]
            row_matches = [
                SemanticMatch(
                    query=q,
                    target=self.candidates[idx],
                    score=float(scores[idx]),
                    target_idx=int(idx),
                )
                for idx in top_indices
            ]
            all_results.append(row_matches)
        return all_results
