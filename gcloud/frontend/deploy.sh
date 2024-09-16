#!/bin/bash

# Navigate to the frontend project directory
cd ../../frontend/

# Increment the version
./increment_version.sh

# Read the new version from version.txt
VERSION=$(cat version.txt)

echo "Deploying version $VERSION"

# Downscale the frontend deployment to 0
kubectl scale deployment frontend-deployment --replicas=0

# Wait a little bit for the deployment to be downscaled
sleep 5

# Delete the frontend deployment
kubectl delete deployment frontend-deployment

# Wait a little bit for the deployment to be deleted
sleep 5

# Build the frontend docker image with the new version
docker build --no-cache -t softa/cardano-smart:$VERSION .

# Push the docker image to docker hub
docker push softa/cardano-smart:$VERSION

# Wait a little bit for the image to be available
sleep 5

# Go back to the gcloud/frontend directory
cd ../gcloud/frontend/

# Update the deployment.yaml file with the new version
sed -i "s/softa\/cardano-smart:.*/softa\/cardano-smart:$VERSION/" deployment.yaml

# Deploy the docker image to Google Kubernetes Engine
kubectl apply -f deployment.yaml

# Wait a little bit for the deployment to be ready
sleep 10

# Report the status of the deployment
kubectl get pods

# Success message
echo "Frontend deployed successfully with version $VERSION!"