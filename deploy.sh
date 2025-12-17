#!/bin/bash

# SilverTimes S3 Deployment Script
# This script builds and deploys the project to AWS S3

set -e  # Exit on error

echo "🚀 Starting SilverTimes deployment..."

# Load AWS credentials from .env file
if [ -f .env ]; then
    export $(cat .env | xargs)
    echo "✅ Loaded AWS credentials from .env"
else
    echo "❌ .env file not found!"
    exit 1
fi

# S3 bucket name
BUCKET_NAME="silvertimes.io"

echo "📦 Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "☁️  Uploading to S3 bucket: $BUCKET_NAME..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "🌐 Your site is now live at: http://$BUCKET_NAME"
    echo ""
    echo "📊 Checking deployed files..."
    aws s3 ls s3://$BUCKET_NAME/ --recursive --human-readable --summarize
else
    echo "❌ Deployment failed!"
    exit 1
fi
