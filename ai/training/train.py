"""
train.py -- End-to-End Training and Fine-Tuning CLI Runner

WHAT: Loads catalog datasets, creates contrastive pairs, tunes hyperparameters,
      trains the model on GPU, and saves production model weights.

USAGE:
    # Run standard model fine-tuning (3 epochs):
    python -m ai.training.train --epochs 3 --batch-size 16

    # Run hyperparameter tuning first, then train with best config:
    python -m ai.training.train --tune --epochs 3
"""

import os
import argparse
import pandas as pd
from torch.utils.data import DataLoader, random_split

from ai.enrichment.loader import load_raw, load_expected
from ai.training.dataset import build_contrastive_dataset
from ai.training.trainer import ProductEmbeddingTrainer
from ai.training.tuner import HyperparameterTuner


def run_training_pipeline(
    epochs: int = 3,
    batch_size: int = 16,
    learning_rate: float = 2e-5,
    margin: float = 0.5,
    do_tune: bool = False,
    output_dir: str = "ai/models/weights/anvaya_product_embedder",
):
    print("=" * 65)
    print(" 🚀 Anvaya AI Model Training & Fine-Tuning Pipeline")
    print("=" * 65)

    # 1. Load Data
    raw_df = load_raw()
    print(f"[*] Loaded raw dataset: {len(raw_df)} records")

    # 2. Build Contrastive Dataset
    full_dataset = build_contrastive_dataset(raw_df)
    total_triplets = len(full_dataset)
    print(f"[*] Generated {total_triplets} contrastive training triplets.")

    # 80/20 Train/Val Split
    val_size = max(int(total_triplets * 0.2), 1)
    train_size = total_triplets - val_size
    train_ds, val_ds = random_split(full_dataset, [train_size, val_size])
    print(f"[*] Split: {len(train_ds)} train samples, {len(val_ds)} val samples.")

    # 3. Optional Hyperparameter Tuning
    if do_tune:
        print("\n[*] Starting Hyperparameter Search across learning rates & margins...")
        tuner = HyperparameterTuner(
            learning_rates=[1e-5, 2e-5, 5e-5],
            margins=[0.3, 0.5],
            batch_sizes=[8, 16],
            epochs_per_trial=1,
        )
        tune_res = tuner.tune(train_ds, val_ds)
        print(f"[✓] Best Tuning Config: {tune_res.best_config} (Val Acc: {tune_res.best_accuracy:.1%})")
        learning_rate = tune_res.best_config.get("learning_rate", learning_rate)
        margin = tune_res.best_config.get("margin", margin)
        batch_size = tune_res.best_config.get("batch_size", batch_size)

    # 4. Final Training
    print(f"\n[*] Training final model with lr={learning_rate}, margin={margin}, bs={batch_size} for {epochs} epochs...")
    trainer = ProductEmbeddingTrainer(
        learning_rate=learning_rate,
        margin=margin,
    )

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    for ep in range(1, epochs + 1):
        loss = trainer.train_epoch(train_loader)
        eval_metrics = trainer.evaluate(val_loader)
        print(f"  [Epoch {ep}/{epochs}] Loss: {loss:.4f} | Val Triplet Accuracy: {eval_metrics['triplet_accuracy']:.1%}")

    # 5. Save Model Checkpoint
    trainer.save_model(output_dir)
    print(f"\n[✓] Training Complete! Production weights saved to: {output_dir}")


def main():
    parser = argparse.ArgumentParser(description="Anvaya AI Model Training CLI")
    parser.add_argument("--epochs", type=int, default=2, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size for training")
    parser.add_argument("--lr", type=float, default=2e-5, help="Learning rate")
    parser.add_argument("--margin", type=float, default=0.5, help="Triplet margin")
    parser.add_argument("--tune", action="store_true", help="Run hyperparameter tuning before final training")
    parser.add_argument("--output-dir", type=str, default="ai/models/weights/anvaya_product_embedder", help="Output path")

    args = parser.parse_args()
    run_training_pipeline(
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        margin=args.margin,
        do_tune=args.tune,
        output_dir=args.output_dir,
    )


if __name__ == "__main__":
    main()
