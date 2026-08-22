"""
run_service.py -- Unified Service Launcher for Anvaya + Kimi Platform

WHAT: Single entrypoint to launch either the FastAPI REST microservice or the Streamlit Web Dashboard.

USAGE:
    # Launch FastAPI REST microservice (default port 8000):
    python -m ai.run_service --api

    # Launch Streamlit Interactive Web Workbench (default port 8501):
    python -m ai.run_service --ui

    # Run full batch enrichment CLI pipeline:
    python -m ai.run_service --cli
"""

import sys
import argparse
import subprocess


def main():
    parser = argparse.ArgumentParser(description="Anvaya AI Product Intelligence Service Runner")
    parser.add_argument("--api", action="store_true", help="Launch FastAPI REST Microservice on port 8000")
    parser.add_argument("--ui", action="store_true", help="Launch Streamlit Web Dashboard on port 8501")
    parser.add_argument("--cli", action="store_true", help="Run offline batch enrichment pipeline on data/raw/sample_1000_items.csv")
    parser.add_argument("--port", type=int, default=None, help="Custom port number")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host binding (default: 0.0.0.0)")

    args = parser.parse_args()

    if args.ui:
        port = args.port or 8501
        print(f"[*] Launching Anvaya Streamlit Dashboard on http://localhost:{port} ...")
        cmd = [sys.executable, "-m", "streamlit", "run", "ai/ui/dashboard.py", "--server.port", str(port), "--server.address", args.host]
        subprocess.run(cmd)

    elif args.cli:
        print("[*] Running Anvaya Batch Enrichment CLI Pipeline ...")
        from ai.enrichment.pipeline import main as pipeline_main
        pipeline_main()

    else:
        # Default to FastAPI API server
        port = args.port or 8000
        print(f"[*] Launching Anvaya FastAPI REST Microservice on http://localhost:{port} ...")
        print(f"[*] OpenAPI Docs available at http://localhost:{port}/docs")
        cmd = [sys.executable, "-m", "uvicorn", "ai.api.app:app", "--host", args.host, "--port", str(port), "--reload"]
        subprocess.run(cmd)


if __name__ == "__main__":
    main()
