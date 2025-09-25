# SimpleChat Deployment Guide - Microsoft's Intended Approach

Based on the official documentation and GitHub Actions workflows, here's Microsoft's intended approach for deploying and updating SimpleChat images to Azure Container Registry (ACR).

## Overview

Microsoft designed SimpleChat with a **GitHub Actions-based CI/CD pipeline** for automated Docker image building and deployment to ACR. The process involves:

1. **Initial Setup**: Use `Initialize-AzureEnvironment.ps1` to create ACR and get credentials
2. **GitHub Secrets Configuration**: Store ACR credentials as GitHub repository secrets
3. **Automated Builds**: GitHub Actions automatically build and push images on code changes
4. **Manual Deployment**: Use GitHub Actions workflow dispatch for on-demand builds

## Step-by-Step Process

### 1. Initial Azure Environment Setup

First, run the initialization script to create your ACR and get credentials:

```powershell
# Navigate to the deployers directory
cd simplechat/deployers

# Run the initialization script
./Initialize-AzureEnvironment.ps1 -ResourceGroupName "SuperWorkerRG" -AzureRegion "australiaeast" -ACRName "superworkervideoacr" -OpenAiName "azopenai-auseast"
```

This script will output the ACR credentials you need for GitHub secrets:
- `ACR_LOGIN_SERVER`
- `ACR_USERNAME` 
- `ACR_PASSWORD`

### 2. Configure GitHub Repository Secrets

In your GitHub repository, add these secrets:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Add the following repository secrets:
   - `ACR_LOGIN_SERVER`: `superworkervideoacr.azurecr.io`
   - `ACR_USERNAME`: `superworkervideoacr`
   - `ACR_PASSWORD`: `[Your ACR password from step 1]`

### 3. GitHub Actions Workflows

Microsoft provides three GitHub Actions workflows:

#### Main Production Workflow
- **File**: `.github/workflows/docker_image_publish.yml`
- **Triggers**: Push to `main` branch or manual dispatch
- **Image**: `simple-chat:YYYY-MM-DD_BUILD_NUMBER` and `simple-chat:latest`

#### Development Workflow  
- **File**: `.github/workflows/docker_image_publish_dev.yml`
- **Triggers**: Push to `Development` branch
- **Image**: `simple-chat-dev:YYYY-MM-DD_BUILD_NUMBER` and `simple-chat-dev:latest`

#### Feature Branch Workflow
- **File**: `.github/workflows/docker_image_publish_nadoyle.yml`
- **Triggers**: Push to `nadoyle` branch
- **Image**: `simple-chat-dev:YYYY-MM-DD_BUILD_NUMBER` and `simple-chat-dev:latest`

### 4. How to Deploy New Images

#### Option A: Automatic Deployment (Recommended)
1. Make your code changes
2. Commit and push to the appropriate branch:
   - `main` → Production image (`simple-chat:latest`)
   - `Development` → Development image (`simple-chat-dev:latest`)
3. GitHub Actions automatically builds and pushes the new image

#### Option B: Manual Deployment
1. Go to your GitHub repository
2. Navigate to **Actions** tab
3. Select "SimpleChat Docker Image Publish"
4. Click **Run workflow**
5. Choose your branch and click **Run workflow**

### 5. Build Process Details

The GitHub Actions workflow performs these steps:

1. **Authentication**: Login to ACR using stored secrets
2. **Checkout**: Get the latest code
3. **Node.js Setup**: Install Node.js 20
4. **Dependencies**: Install AJV for JSON schema validation
5. **Schema Generation**: Generate standalone JSON validators
6. **Docker Build**: Build the image using `application/single_app/Dockerfile`
7. **Tagging**: Tag with both timestamp and `latest`
8. **Push**: Push both tags to ACR

### 6. Image Naming Convention

Microsoft uses this naming pattern:
- **Timestamped**: `simple-chat:2025-09-25_123`
- **Latest**: `simple-chat:latest`

### 7. Terraform Integration

Your Terraform configuration should reference the correct image:

```hcl
# In terraform.tfvars
image_name = "simple-chat:latest"
```

### 8. App Service Updates

After pushing a new image, your App Service will automatically pull the latest image on restart, or you can force an update:

```bash
# Restart the App Service to pull latest image
az webapp restart --name superworker-dev-app --resource-group superworker-dev-rg
```

## Troubleshooting

### Common Issues:

1. **Authentication Failed**: Verify GitHub secrets are correctly set
2. **Image Not Found**: Ensure the workflow completed successfully
3. **App Service Not Updating**: Restart the App Service after new image push

### Verify Image Exists:
```bash
az acr repository show-tags --name superworkervideoacr --repository simple-chat
```

## Manual Local Build (Not Recommended)

If you must build locally (not Microsoft's intended approach):

```bash
# Login to ACR
az acr login --name superworkervideoacr

# Build and push
docker build -t superworkervideoacr.azurecr.io/simple-chat:latest -f application/single_app/Dockerfile .
docker push superworkervideoacr.azurecr.io/simple-chat:latest
```

## Summary

Microsoft's intended approach prioritizes:
- **Automation**: GitHub Actions handle building and pushing
- **Consistency**: Standardized build environment and process  
- **Security**: Credentials managed through GitHub secrets
- **Versioning**: Automatic timestamped tags plus latest
- **Reliability**: Repeatable, tested build process

Always use the GitHub Actions workflows for production deployments to maintain consistency with Microsoft's design.
