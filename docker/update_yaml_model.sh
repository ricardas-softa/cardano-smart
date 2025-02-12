#!/bin/bash

# Check if both arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <yaml_file> <model_name>"
    exit 1
fi

YAML_FILE=$1
MODEL_NAME=$2

# Use sed to replace the model in the YAML file
# Note: using different delimiters (|) since model name might contain slashes
sed -i "s|llm_model: \".*\"|llm_model: \"$MODEL_NAME\"|" "$YAML_FILE"