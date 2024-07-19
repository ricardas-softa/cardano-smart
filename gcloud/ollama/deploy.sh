#!/bin/bash

# Set the namespace
NAMESPACE=default

# Delete old resources if they exist
kubectl delete deployment ollama-deployment -n $NAMESPACE
kubectl delete service ollama-service -n $NAMESPACE
kubectl delete pvc ollama-pvc -n $NAMESPACE

# Apply new configurations
kubectl apply -f pvc.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

echo "Deployment, Service, and PVC applied successfully!"
