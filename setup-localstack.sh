#!/bin/bash
set -e 

echo "--- [Iniciando provisionamento] ---"

BUCKET_NAME="files"

# Criar Buckets S3
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

echo "--- [Provisionamento concluído!] ---"