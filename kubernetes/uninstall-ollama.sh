#!/usr/bin/env bash

kubectl delete deployments --namespace ollama ollama-deployment
kubectl delete service --namespace ollama ollama-service
kubectl delete ingress --namespace ollama ollama-ingress
kubectl delete namespace ollama