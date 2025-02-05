#!/usr/bin/env bash

kubectl create namespace ollama
kubectl apply -f ollama/deployment.yaml
kubectl apply -f ollama/service.yaml
kubectl apply -f ollama/ingress.yaml