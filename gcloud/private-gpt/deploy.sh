#!/bin/bash

# Set the namespace
NAMESPACE=default

# Delete old resources if they exist
kubectl delete deployment private-gpt-deployment -n $NAMESPACE
kubectl delete service private-gpt-service -n $NAMESPACE
kubectl delete pvc private-gpt-pvc -n $NAMESPACE

# Apply new configurations
kubectl apply -f pvc.yaml
# kubectl apply -f config.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

echo "Deployment, Service, and PVC applied successfully!"
