#!/usr/bin/env bash

# Get the directory of the current script
SCRIPT_DIR=$(cd $(dirname $0); pwd)

# Change to the project root directory
PROJECT_ROOT=$(cd $SCRIPT_DIR/..; pwd)
cd $PROJECT_ROOT

# Navigate to the frontend project directory
cd frontend

# # Increment the version
# ./increment_version.sh

# # Read the new version from version.txt
# VERSION=$(cat version.txt)
VERSION=latest

echo "Building version $VERSION"

# Build the frontend docker image with the new version
docker build --no-cache -t softa/cardano-smart:$VERSION .

# Push the docker image to docker hub
docker push softa/cardano-smart:$VERSION

# Success message
echo "Frontend built successfully with version $VERSION!"