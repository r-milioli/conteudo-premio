#!/bin/bash

# Carrega variáveis de ambiente
source .env

# Deploy da stack
echo "Deploying stack..."
docker stack deploy -c stack.yml content-hub

echo "Stack deployed!"
echo "You can check the status with: docker stack ps content-hub" 