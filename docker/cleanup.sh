#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR=$(cd $(dirname $0); pwd)

# Change to the project root directory
PROJECT_ROOT=$(cd $SCRIPT_DIR/..; pwd)
cd $PROJECT_ROOT

# Stop and remove all containers from the docker-compose project
echo "Stopping and removing containers..."
docker compose --file docker-compose-cpu.yaml down

# Remove all images used by the services
echo "Removing images..."
docker rmi ollama/ollama:latest
docker rmi alpine:latest
docker image rm cardano-smart-repo-frontend-service:latest
docker image rm cardano-smart-repo-private-gpt-service:latest
docker image rm cardano-smart-repo-doc-scraper:latest

# Optional: Remove the private network (though docker-compose down usually handles this)
echo "Removing network..."
docker network rm private-network

rm -rf private-gpt
rm -rf shared-data/*
rm -rf models/*

echo "Cleanup complete!" 