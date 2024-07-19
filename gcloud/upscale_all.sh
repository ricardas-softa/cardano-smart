#!/usr/bin/env zsh

kubectl scale deployment ollama-deployment --replicas=1 -n default
sleep 30
kubectl scale deployment private-gpt-deployment --replicas=1 -n default
sleep 30
kubectl scale deployment frontend-deployment --replicas=1 -n default