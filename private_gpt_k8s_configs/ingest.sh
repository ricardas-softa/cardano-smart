#!/bin/bash

# Define constants
dirA="/mnt/shared/ingestive"
dirB="/home/worker/app/docs"
reportFile="/home/worker/app/docs/report.json"  # Write to the shared volume

# Run diff_report.py
echo "Generating diff report..."
python diff_report.py "$dirA" "$dirB" "$reportFile"

# Check if diff_report.py was successful
if [ $? -ne 0 ]; then
    echo "Error: diff_report.py failed. Exiting."
    exit 1
fi

echo "Diff report generated successfully."

# Run prepare_ingest.sh
echo "Preparing ingest..."
bash prepare_ingest.sh "$dirA" "$dirB"

# Check if prepare_ingest.sh was successful
if [ $? -ne 0 ]; then
    echo "Error: prepare_ingest.sh failed. Exiting."
    exit 1
fi

echo "Ingest preparation completed successfully."
echo "Process finished. Check $reportFile for the diff report."
