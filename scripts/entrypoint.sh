#!/bin/bash

# Change ownership of the mounted directories
chown -R worker:nogroup /home/worker/app/local_data
chown -R worker:nogroup /home/worker/app/docs

./ingest.sh

# Ingest data if the directory exists
if [ -d /mnt/shared/ingestive ]; then
  su worker -c "python scripts/utils.py wipe"
  su worker -c "python scripts/ingest_folder.py /mnt/shared/ingestive"
fi

# Run the main application as worker
exec su worker -c "python -m private_gpt"
