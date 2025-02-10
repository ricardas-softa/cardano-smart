#!/usr/bin/env bash

# Get the directory of the current script
SCRIPT_DIR=$(cd $(dirname $0); pwd)

# Change to the project root directory
PROJECT_ROOT=$(cd $SCRIPT_DIR/..; pwd)
cd $PROJECT_ROOT

# Navigate to the doc-scraper project directory
cd doc-scraper

# Build the docker image
docker build -t softa/cardano-smart-scraper:latest .

# Push the docker image to docker hub
docker push softa/cardano-smart-scraper:latest

# Success message
echo "Doc scraper built successfull"