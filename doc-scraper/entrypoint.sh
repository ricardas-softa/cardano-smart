#!/usr/bin/env sh
set -e

OUTPUT_PATH="${OUTPUT_PATH:-/app/data}"

mkdir -p "$OUTPUT_PATH"
chmod -R 777 "$OUTPUT_PATH" || true

exec /app/venv/bin/python run_spiders.py
