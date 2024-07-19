#!/bin/bash

# Change ownership of the mounted directories
chown -R worker:nogroup /home/worker/app/local_data
chown -R worker:nogroup /home/worker/app/MATERIAL

# Ingest data if the directory exists
if [ -d /home/worker/app/MATERIAL ]; then
  su worker -c "python scripts/ingest_folder.py /home/worker/app/MATERIAL"
fi

# Run the main application as worker
exec su worker -c "python -m private_gpt"
