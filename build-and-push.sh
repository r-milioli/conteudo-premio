#!/bin/bash

# Definindo variáveis
IMAGE_NAME="automacaodebaixocusto/conteudo-premio"
VERSION=$(node -p "require('./package.json').version")
COMMIT_HASH=$(git rev-parse --short HEAD)
DATE=$(date +%Y%m%d)

# Construindo a imagem
echo "Building Docker image..."
docker build \
  --build-arg NODE_ENV=production \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$COMMIT_HASH \
  --build-arg VERSION=$VERSION \
  -t $IMAGE_NAME:latest \
  -t $IMAGE_NAME:$VERSION \
  -t $IMAGE_NAME:$DATE-$COMMIT_HASH \
  .

# Fazendo push das imagens
echo "Pushing Docker images..."
docker push $IMAGE_NAME:latest
docker push $IMAGE_NAME:$VERSION
docker push $IMAGE_NAME:$DATE-$COMMIT_HASH

echo "Build and push completed successfully!" 