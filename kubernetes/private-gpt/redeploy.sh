#!/usr/bin/env bash

kubectl delete deployments.apps --namespace cardano-smart private-gpt-deployment

sleep 5

kubectl apply -f deployment.yaml

kubectl get pods --namespace cardano-smart -w
