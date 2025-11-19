#!/bin/bash

# SilverTimes S3 Deployment Script
# This script builds and deploys the project to AWS S3

set -e  # Exit on error

echo "🚀 Starting SilverTimes deployment..."

# AWS credentials should be set in your environment or AWS CLI config
# export AWS_ACCESS_KEY_ID=your_access_key_here
# export AWS_SECRET_ACCESS_KEY=your_secret_key_here
export AWS_DEFAULT_REGION=ap-southeast-1

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
