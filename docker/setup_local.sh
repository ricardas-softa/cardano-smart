#!/bin/bash

# Log start
echo "Starting local docker setup..."

# Parse command line arguments
COMPOSE_FILE="docker-compose.yaml"  # default to GPU
while [[ $# -gt 0 ]]; do
    case $1 in
        --cpu)
            COMPOSE_FILE="docker-compose-cpu.yaml"
            shift
            ;;
        --gpu)
            COMPOSE_FILE="docker-compose.yaml"
            shift
            ;;
        *)
            echo "Invalid argument: $1"
            echo "Usage: $0 [--cpu|--gpu]"
            exit 1
            ;;
    esac
done

# Get the directory of the current script
SCRIPT_DIR=$(cd $(dirname $0); pwd)

# Change to the project root directory
PROJECT_ROOT=$(cd $SCRIPT_DIR/..; pwd)
cd $PROJECT_ROOT

# Clone and configure the private-gpt repo
./docker/clone_and_config_private_gpt.sh

# Run docker compose with the selected configuration file
docker compose --file $COMPOSE_FILE up -d 

# Log completion
echo "Setup complete using $COMPOSE_FILE configuration."
