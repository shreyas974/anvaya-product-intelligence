"""
loader.py -- Shared Model Loader & Device Manager for Anvaya AI Components

WHAT: Centralized utility to load and cache NLP/embedding models on GPU/CPU.

WHY:  Loading deep learning models from disk to GPU takes time and memory.
      By caching loaded models, all pipeline stages (embeddings, classification,
      description generation) can share the exact same model instances.

HOW:  Checks for CUDA availability (using the RTX 5060 Ti GPU) and provides
      cached getters for SentenceTransformer and HuggingFace pipelines.
"""

import torch
from functools import lru_cache
from typing import Any


def get_device() -> torch.device:
    """Return 'cuda' if GPU is available, else 'cpu'."""
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


@lru_cache(maxsize=4)
def get_sentence_transformer(model_name: str = "all-MiniLM-L6-v2") -> Any:
    """
    Load and cache a SentenceTransformer model on the active device.
    
    Args:
        model_name: HuggingFace model identifier.
                   Defaults to 'all-MiniLM-L6-v2' (fast, lightweight, 384-d).
    """
    from sentence_transformers import SentenceTransformer
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = SentenceTransformer(model_name, device=device)
    return model
