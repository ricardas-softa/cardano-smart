#!/usr/bin/env bash

# Get the directory of the current script
SCRIPT_DIR=$(cd $(dirname $0); pwd)

# Change to the project root directory
PROJECT_ROOT=$(cd $SCRIPT_DIR/..; pwd)
cd $PROJECT_ROOT

# Set default model and allow override through command line argument
MODEL=${1:-"llama3.2:1b"}
# VERSION="0.6.2.12"
VERSION=latest
# Initialize and update the submodule
echo "Initializing and updating submodules..."
git submodule update --init --recursive

# Apply custom configurations
cp private_gpt_k8s_configs/settings-docker.yaml private-gpt/settings-docker.yaml
cp private_gpt_k8s_configs/settings.yaml private-gpt/settings.yaml
cp private_gpt_k8s_configs/Dockerfile private-gpt/Dockerfile
cp local_configs/entrypoint.sh private-gpt/entrypoint.sh
cp private_gpt_k8s_configs/ingest.sh private-gpt/ingest.sh
cp private_gpt_k8s_configs/prepare_ingest.sh private-gpt/prepare_ingest.sh
cp private_gpt_k8s_configs/diff_report.py private-gpt/diff_report.py

# Update the model in settings-docker.yaml
sed -i "s/llm_model: \".*\"/llm_model: \"$MODEL\"/" private-gpt/settings-docker.yaml

# Log completion and model being used
echo "PrivateGPT configured successfully with model: $MODEL"

# Navigate to the private-gpt project directory
cd private-gpt

echo "Building private-gpt version $VERSION with model $MODEL"

# Build the private-gpt docker image with the new version
docker build --no-cache -t softa/private-gpt-ollama:$VERSION .

# Push the docker image to docker hub
docker push softa/private-gpt-ollama:$VERSION

# Success message
echo "private-gpt built successfully with version $VERSION and model $MODEL!"
