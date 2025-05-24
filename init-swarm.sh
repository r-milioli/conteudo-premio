#!/bin/bash

# Inicializa o Swarm se ainda não estiver inicializado
if ! docker info | grep -q "Swarm: active"; then
    echo "Initializing Docker Swarm..."
    docker swarm init
fi

echo "Swarm is ready!" 