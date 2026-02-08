#!/bin/bash
set -e 

echo "--- [Iniciando provisionamento customizado] ---"

if getent hosts host.docker.internal > /dev/null 2>&1; then
  TARGET_HOST="host.docker.internal"
  echo ">>> Detectado ambiente Windows/Mac (usando host.docker.internal)"
else
  # Fallback para Linux nativo (Gateway padrão do Docker)
  TARGET_HOST="172.17.0.1"
  echo ">>> Detectado ambiente Linux (usando 172.17.0.1)"
fi

# Permite que você force uma URL via docker-compose se quiser, senão usa a detectada
BASE_API_URL="${API_URL:-http://$TARGET_HOST:8080}"

# Definir variáveis
BUCKET_NAME="files"
S3_ENDPOINT_URL="http://localstack:4566"
REGION="us-east-1" 
API_URL=$BASE_API_URL  

# Criar os Buckets S3
echo "Criando bucket: $BUCKET_NAME"
awslocal s3 mb s3://$BUCKET_NAME

# Configurar CORS
echo "Configurando CORS para aceitar qualquer origem no bucket '$BUCKET_NAME'..."
awslocal s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
      }
    ]
  }'

echo "--- [Provisionamento customizado concluído!] ---"