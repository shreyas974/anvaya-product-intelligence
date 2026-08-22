"""
tuner.py -- Hyperparameter Tuning Engine for Anvaya Embedding Models

WHAT: Systematically searches over learning rates, batch sizes, and triplet margins
      to find the optimal fine-tuning configuration.

WHY:  Ensures the model achieves peak convergence and separation accuracy without overfitting.

HOW:  Runs grid/search experiments across hyperparameter configurations and logs results.
"""

from typing import Dict, Any, List
from dataclasses import dataclass
from torch.utils.data import DataLoader

from ai.training.dataset import ContrastiveProductDataset
from ai.training.trainer import ProductEmbeddingTrainer


@dataclass
class TuningResult:
    best_config: Dict[str, Any]
    best_accuracy: float
    all_trials: List[Dict[str, Any]]


class HyperparameterTuner:
    """
    Hyperparameter search coordinator for product embedding fine-tuning.
    """

    def __init__(
        self,
        learning_rates: List[float] = [1e-5, 2e-5, 5e-5],
        margins: List[float] = [0.3, 0.5, 0.7],
        batch_sizes: List[int] = [8, 16],
        epochs_per_trial: int = 1,
    ):
        self.learning_rates = learning_rates
        self.margins = margins
        self.batch_sizes = batch_sizes
        self.epochs_per_trial = epochs_per_trial

    def tune(
        self,
        train_dataset: ContrastiveProductDataset,
        val_dataset: ContrastiveProductDataset,
    ) -> TuningResult:
        """
        Run hyperparameter search and return the top-performing configuration.
        """
        trials = []
        best_acc = -1.0
        best_config = {}

        for lr in self.learning_rates:
            for margin in self.margins:
                for bs in self.batch_sizes:
                    train_loader = DataLoader(train_dataset, batch_size=bs, shuffle=True)
                    val_loader = DataLoader(val_dataset, batch_size=bs, shuffle=False)

                    trainer = ProductEmbeddingTrainer(
                        learning_rate=lr,
                        margin=margin,
                    )

                    # Train for specified trial epochs
                    for _ in range(self.epochs_per_trial):
                        loss = trainer.train_epoch(train_loader)

                    # Evaluate on validation split
                    eval_res = trainer.evaluate(val_loader)
                    acc = eval_res["triplet_accuracy"]

                    trial_record = {
                        "learning_rate": lr,
                        "margin": margin,
                        "batch_size": bs,
                        "val_accuracy": acc,
                        "last_loss": loss,
                    }
                    trials.append(trial_record)

                    if acc > best_acc:
                        best_acc = acc
                        best_config = {
                            "learning_rate": lr,
                            "margin": margin,
                            "batch_size": bs,
                        }

        return TuningResult(
            best_config=best_config,
            best_accuracy=best_acc,
            all_trials=trials,
        )
