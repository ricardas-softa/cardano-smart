#!/bin/bash

# Read the current version
version=$(cat version.txt)

# Split the version into major, minor, and patch numbers
IFS='.' read -ra VERSION_PARTS <<< "$version"
major=${VERSION_PARTS[0]}
minor=${VERSION_PARTS[1]}
patch=${VERSION_PARTS[2]}

# Increment the patch version
patch=$((patch + 1))

# Construct the new version string
new_version="$major.$minor.$patch"

# Write the new version back to the file
echo $new_version > version.txt

echo "Version updated to $new_version"
