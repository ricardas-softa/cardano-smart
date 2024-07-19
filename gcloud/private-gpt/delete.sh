#!/bin/bash

# Set the namespace
NAMESPACE=default

# Delete old resources if they exist
kubectl delete deployment private-gpt-deployment -n $NAMESPACE
kubectl delete service private-gpt-service -n $NAMESPACE
kubectl delete pvc private-gpt-pvc -n $NAMESPACE

echo "Deployment, Service, and PVC deleted successfully!"
