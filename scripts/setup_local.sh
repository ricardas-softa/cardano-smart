#!/bin/bash

# Log start
echo "Starting local setup..."

# Get the directory of the current script
SCRIPT_DIR=$(cd $(dirname $0); pwd)

# Change to the project root directory
PROJECT_ROOT=$(cd $SCRIPT_DIR/..; pwd)
cd $PROJECT_ROOT

# Clone and configure the private-gpt repo
./scripts/clone_and_config_private_gpt.sh

# Log completion
echo "Setup complete. You can now run the project using 'docker-compose up'."