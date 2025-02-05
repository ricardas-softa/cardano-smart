#!/usr/bin/env bash

# Load configuration from config.yaml without external dependencies
CONFIG_FILE="config.yaml"
SERVICE_TYPE=$(grep '^serviceType:' "$CONFIG_FILE" | awk '{print $2}' | tr -d ' ')
LOAD_BALANCER_IP=$(grep '^loadBalancerIP:' "$CONFIG_FILE" | awk '{print $2}' | tr -d ' ')

# Apply Namespace
kubectl apply -f namespace/namespace.yaml

# Apply Storage configurationsc
kubectl apply -f storage/pv.yaml
kubectl apply -f storage/pvc.yaml
# Explicitly wait for the PVC to be bound
kubectl wait --for=condition=Bound pvc/cardano-smart-pvc --timeout=60s -n cardano-smart

# Deploy Frontend
kubectl apply -f frontend/deployment.yaml
if [ "$SERVICE_TYPE" == "NodePort" ]; then
    kubectl apply -f frontend/service.yaml
else
    if [ -n "$LOAD_BALANCER_IP" ]; then
        kubectl apply -f <(sed "s|192.168.0.201|$LOAD_BALANCER_IP|" frontend/service-load-balancer.yaml)
    else
        kubectl apply -f frontend/service-load-balancer.yaml
    fi
fi
# Wait for the frontend deployment to be available
kubectl wait --for=condition=available deployment/frontend-deployment --timeout=60s -n cardano-smart

# Deploy Doc Scraper
kubectl apply -f doc-scraper/cronjob.yaml

# Run initial scraping job
kubectl apply -f doc-scraper/init-doc-scraper.yaml
echo "Waiting for the initial scraping job to complete..."
kubectl wait --for=condition=complete job/init-doc-scraper --timeout=2400s -n cardano-smart

# Deploy PrivateGPT
kubectl apply -f private-gpt/deployment.yaml
kubectl apply -f private-gpt/service.yaml
kubectl apply -f private-gpt/service-account.yaml
kubectl apply -f private-gpt/role-binding.yaml
kubectl apply -f private-gpt/cronjob.yaml
# Optionally wait for PrivateGPT deployment to be ready
kubectl wait --for=condition=available deployment/private-gpt-deployment --timeout=60s -n cardano-smart

# Display the deployment status
kubectl get all -n cardano-smart