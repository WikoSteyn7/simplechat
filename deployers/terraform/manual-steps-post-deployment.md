# Manual Post-Deployment Steps for SimpleChat

After your Terraform deployment completes, you may need to perform these manual steps to fully configure your SimpleChat application.

## 1. Grant API Permissions (Admin Consent)

If the Terraform deployment failed at the delegated permission grant step, you need to manually grant admin consent:

### Steps:
1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Find your app registration: `superworker-dev-ar`
4. Click on **API permissions** in the left menu
5. You should see the following permissions listed:
   - Microsoft Graph: User.Read
   - Microsoft Graph: profile 
   - Microsoft Graph: email
   - Microsoft Graph: Group.Read.All
   - Microsoft Graph: offline_access
   - Microsoft Graph: openid

6. Click **Grant admin consent for [Your Directory]**
7. Click **Yes** to confirm

## 2. Configure Azure Search Indexes

Deploy the search index JSON files to Azure AI Search:

### Steps:
1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to your Azure AI Search service: `superworker-dev-search`
3. Click **Indexes** in the left menu
4. Click **Import data** or **Add index**
5. Upload and configure these index files:
   - `ai_search-index-group.json`
   - `ai_search-index-user.json`
   - `ai_search-index-public.json`

**Index files location:** `simplechat/deployers/terraform/artifacts/`

## 3. Configure Application Settings

1. Navigate to your web app URL: `https://superworker-dev-app.azurewebsites.net`
2. Sign in with your Azure AD account
3. Click **Admin** > **App Settings** to configure:
   - GPT endpoints and models
   - Embeddings endpoints
   - Image generation settings
   - Other application-specific settings

### Important Note for OpenAI Configuration:
When configuring GPT endpoints, if you encounter issues with "Fetch GPT Models":
1. Temporarily change the endpoint URL to use your OpenAI service name directly
2. Fetch the models and select required models
3. Revert the endpoint URL back to the original format

## 4. Test the Application

1. Navigate to your web app: `https://superworker-dev-app.azurewebsites.net`
2. Sign in and test all functionality:
   - Chat features
   - File uploads
   - Group workspaces
   - Admin settings

## Troubleshooting

If you encounter authentication issues:
- Verify that admin consent was granted successfully
- Check that the redirect URLs in your app registration match your web app URL
- Ensure your user account has appropriate roles assigned

## Next Steps

Your SimpleChat application should now be fully functional. Consider:
- Setting up monitoring and alerts
- Configuring backup strategies
- Planning for scaling if needed

