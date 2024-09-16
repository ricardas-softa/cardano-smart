#!/bin/bash

# Navigate to the private-gpt project directory
cd ../../private-gpt/

# Set the version (you can modify this part if you want to implement automatic versioning)
VERSION="1.0.3"

echo "Deploying private-gpt version $VERSION"

# Downscale the private-gpt deployment to 0
kubectl scale deployment private-gpt-deployment --replicas=0

# Wait a little bit for the deployment to be downscaled
sleep 10

# Delete the private-gpt deployment
kubectl delete deployment private-gpt-deployment

# Wait a little bit for the deployment to be deleted
sleep 10

# Build the private-gpt docker image with the new version
docker build --no-cache -t softa/private-gpt-ollama:$VERSION .

# Push the docker image to docker hub
docker push softa/private-gpt-ollama:$VERSION

# Wait a little bit for the image to be available
sleep 10

# Go back to the gcloud/private-gpt directory
cd ../gcloud/private-gpt/

# Update the deployment.yaml file with the new version
sed -i "s/softa\/private-gpt-ollama:.*/softa\/private-gpt-ollama:$VERSION/" deployment.yaml

# Deploy the docker image to Google Kubernetes Engine
kubectl apply -f deployment.yaml

# Wait a little bit for the deployment to be ready
sleep 20

# Report the status of the deployment
kubectl get pods

# Success message
echo "private-gpt deployed successfully with version $VERSION!"
