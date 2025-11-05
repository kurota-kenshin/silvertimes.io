# SilverTimes Deployment Guide

## Building for Production

To create a production-ready static build:

```bash
npm run build
```

This will:
1. Run TypeScript compilation to check for errors
2. Build the React app with Vite
3. Output optimized static files to the `dist/` directory

## Deploying to AWS S3

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- S3 bucket created for static website hosting

### Step 1: Create S3 Bucket

```bash
aws s3 mb s3://silvertimes.io
```

### Step 2: Enable Static Website Hosting

```bash
aws s3 website s3://silvertimes.io --index-document index.html --error-document index.html
```

### Step 3: Configure Bucket Policy

Create a file `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::silvertimes.io/*"
    }
  ]
}
```

Apply the policy:

```bash
aws s3api put-bucket-policy --bucket silvertimes.io --policy file://bucket-policy.json
```

### Step 4: Upload Files to S3

```bash
npm run build
aws s3 sync dist/ s3://silvertimes.io --delete
```

The `--delete` flag removes files from S3 that don't exist in your local `dist/` folder.

### Step 5: Configure CloudFront (Recommended)

For better performance, SSL, and caching, set up CloudFront:

1. Create a CloudFront distribution
2. Set the origin to your S3 bucket
3. Configure custom error responses: 404 -> /index.html (for SPA routing)
4. Add your custom domain
5. Request SSL certificate via AWS Certificate Manager

## Continuous Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to S3

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: aws s3 sync dist/ s3://silvertimes.io --delete

      - name: Invalidate CloudFront Cache
        run: aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Environment Variables

If you need environment variables for production:

1. Create `.env.production` file:
```
VITE_API_URL=https://api.silvertimes.io
```

2. Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## Performance Optimization

The build is already optimized with:
- Tree shaking
- Code splitting
- Minification
- Asset optimization

## Custom Domain

To use a custom domain:

1. Update S3 bucket name to match domain (e.g., `www.silvertimes.io`)
2. Configure Route53 or your DNS provider to point to S3/CloudFront
3. Set up SSL certificate in AWS Certificate Manager
4. Update CloudFront distribution with custom domain

## Local Preview

To preview the production build locally:

```bash
npm run preview
```

This serves the built files from `dist/` on http://localhost:4173
