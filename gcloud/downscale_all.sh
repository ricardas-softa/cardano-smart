#!/usr/bin/env zsh

kubectl scale deployment frontend-deployment --replicas=0 -n default
sleep 10
kubectl scale deployment private-gpt-deployment --replicas=0 -n default
sleep 10
kubectl scale deployment ollama-deployment --replicas=0 -n default