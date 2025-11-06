# Appwrite OAuth Setup Guide

## Enable Google OAuth in Appwrite

To use Google Sign-In, you need to enable the Google OAuth provider in your Appwrite Console.

### Steps:

1. **Go to Appwrite Console**
   - Navigate to: https://cloud.appwrite.io/console
   - Or your Appwrite instance URL

2. **Select Your Project**
   - Click on your project: **CAPS Tutor** (ID: `690a39bf0011810ee554`)

3. **Navigate to Authentication**
   - In the left sidebar, click **Authentication**
   - Click on **Providers** tab

4. **Enable Google Provider**
   - Find **Google** in the list of providers
   - Toggle it to **Enabled**
   - Click **Save**

5. **Configure Google OAuth** (if required)
   - You may need to add:
     - **Client ID** from Google Cloud Console
     - **Client Secret** from Google Cloud Console
   - For development, Appwrite may provide a default configuration

### Google Cloud Console Setup (if needed)

If you need to set up Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - `https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/690a39bf0011810ee554`
     - (Replace with your Appwrite endpoint and project ID)
6. Copy the **Client ID** and **Client Secret**
7. Add them to Appwrite Console → Authentication → Providers → Google

### Verify Setup

After enabling:
1. Restart your dev server
2. Try Google Sign-In again
3. You should be redirected to Google's login page

### Troubleshooting

**Error 412: Provider is disabled**
- Make sure Google provider is enabled in Appwrite Console
- Check that you're using the correct project ID

**Redirect URI mismatch**
- Verify the redirect URI in Google Cloud Console matches Appwrite's callback URL
- Format: `https://[YOUR_APPWRITE_ENDPOINT]/v1/account/sessions/oauth2/callback/google/[PROJECT_ID]`

**Still not working?**
- Check Appwrite Console logs for more details
- Verify your Appwrite project settings
- Make sure you're using the correct endpoint and project ID


