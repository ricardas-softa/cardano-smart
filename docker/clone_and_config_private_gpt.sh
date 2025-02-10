#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR=$(cd $(dirname $0); pwd)

# Change to the project root directory
PROJECT_ROOT=$(cd $SCRIPT_DIR/..; pwd)
cd $PROJECT_ROOT

# Initialize and update the submodule
echo "Initializing and updating submodules..."
git submodule update --init --recursive

# Apply custom configurations
cp local_configs/settings.yaml private-gpt/settings.yaml
cp local_configs/diff_report.py private-gpt/diff_report.py
cp local_configs/ingest.sh private-gpt/ingest.sh
cp local_configs/prepare_ingest.sh private-gpt/prepare_ingest.sh
cp private_gpt_docker_configs/settings-docker.yaml private-gpt/settings-docker.yaml
cp private_gpt_docker_configs/Dockerfile private-gpt/Dockerfile
cp local_configs/entrypoint.sh private-gpt/entrypoint.sh

# Log completion
echo "PrivateGPT configured successfully."
