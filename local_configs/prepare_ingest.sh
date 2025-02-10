#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <dir_a> <dir_b>"
    exit 1
fi

# Assign arguments to variables
dir_a="$1"
dir_b="$2"

# Check if both directories exist
if [ ! -d "$dir_a" ] || [ ! -d "$dir_b" ]; then
    echo "Error: Both arguments must be valid directories."
    exit 1
fi

# Remove all contents from dir_a
echo "Removing contents from $dir_a..."
rm -rf "$dir_a"/*

# Copy all contents from dir_b to dir_a
echo "Copying contents from $dir_b to $dir_a..."
cp -R "$dir_b"/* "$dir_a"

echo "Sync complete. $dir_a now contains the contents of $dir_b."
