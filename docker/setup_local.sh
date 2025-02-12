#!/bin/bash

# Log start
echo "Starting local docker setup..."

# Parse command line arguments
COMPOSE_FILE="docker-compose.yaml"  # default to GPU
MODEL=""  # default empty, will use yaml default
SKIP_SCRAPING=false

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
        --model)
            if [ -n "$2" ]; then
                MODEL=$2
                shift 2
            else
                echo "Error: --model requires a value"
                exit 1
            fi
            ;;
        --model=*)
            MODEL="${1#*=}"
            shift
            ;;
        --skip-scraping)
            SKIP_SCRAPING=true
            shift
            ;;
        *)
            echo "Invalid argument: $1"
            echo "Usage: $0 [--cpu|--gpu] [--model MODEL_NAME] [--skip-scraping]"
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

# If a model was specified, update the YAML file
if [ -n "$MODEL" ]; then
    chmod +x ./docker/update_yaml_model.sh
    ./docker/update_yaml_model.sh private_gpt_docker_configs/settings-docker.yaml "$MODEL"
fi

# Modify compose file if skipping scraping
if [ "$SKIP_SCRAPING" = true ]; then
    if [[ $COMPOSE_FILE == *"-cpu.yaml" ]]; then
        COMPOSE_FILE="docker-compose-cpu-no-scraper.yaml"
    else
        COMPOSE_FILE="docker-compose-no-scraper.yaml"
    fi
fi

# Run docker compose with the selected configuration file
docker compose --file $COMPOSE_FILE up -d 

# Log completion
echo "Setup complete using $COMPOSE_FILE configuration."
if [ -n "$MODEL" ]; then
    echo "Using model: $MODEL"
fi
if [ "$SKIP_SCRAPING" = true ]; then
    echo "Skipping document scraping process"
fi
