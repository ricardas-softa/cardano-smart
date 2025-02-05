#!/usr/bin/env bash

kubectl scale deployment --namespace cardano-smart frontend-deployment --replicas 0
kubectl scale deployment --namespace cardano-smart private-gpt-deployment --replicas 0
sleep 5

# Delete PrivateGPT resources
kubectl delete deployment,svc,cronjob,role,serviceaccount --namespace cardano-smart \
  -l app=private-gpt --wait=false
echo "PrivateGPT resources are being deleted..."

# Delete Doc Scraper resources
kubectl delete cronjob --namespace cardano-smart doc-scraper-cronjob --wait=false
kubectl delete job --namespace cardano-smart init-doc-scraper --wait=false
echo "Doc Scraper resources are being deleted..."

# Delete Frontend resources
kubectl delete deployment,svc --namespace cardano-smart -l app=frontend --wait=false
echo "Frontend resources are being deleted..."

# Delete Storage
kubectl delete pvc --namespace cardano-smart cardano-smart-pvc --wait=false
kubectl delete pv cardano-smart-pv --wait=false
echo "Storage resources are being deleted..."

# Optionally wait for PVC to be deleted before deleting the namespace
echo "Waiting for PVC deletion..."
kubectl wait --for=delete pvc/cardano-smart-pvc --namespace cardano-smart --timeout=180s

# Delete Namespace
kubectl delete namespace cardano-smart
echo "Namespace cardano-smart deleted."

# Show remaining resources in the namespace (should show none)
kubectl get all --namespace cardano-smart
