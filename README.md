# InboxFlow

You can visit the app here:  
https://www.getinboxflow.org

## Overview
InboxFlow is a web app that helps organize your Gmail inbox by sorting emails into folders using filters and priority.

## Authentication
Google OAuth is used for login.

- Set up OAuth in Google Cloud
- Added authorized origins (domain only)
- Added redirect URI: /api/auth/google/callback
- Stored credentials in Azure:
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - GOOGLE_REDIRECT_URI

## Testing Access (Important)
This app is currently in testing mode, so only approved users can sign in.

For security reasons, Google OAuth is set to "Testing", which restricts access.

How this was set up:
- In Google Cloud Console → OAuth consent screen
- App status is set to "Testing"
- My email was added under "Test users"

Because of this, only listed test users can log in. Public access would require submitting the app for Google verification.

## Database
Used PostgreSQL (Neon).

Tables:
- users
- settings
- folders
- filters
- emails
- oauth_tokens
- session
- sync_log

## Deployment
Deployed on Azure App Service.

Configured environment variables:
- DATABASE_URL
- SESSION_SECRET
- TOKEN_ENCRYPTION_KEY
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI

Startup command:
node server/index.js

## Custom Domain
Connected using Namecheap and Azure.

- Added CNAME (www → azurewebsites.net)
- Added TXT record for verification
- Enabled SSL

## Result
Users can:
- Sign in with Google (test users only)
- Sync Gmail
- Automatically organize emails

## Tech Stack
- Node.js
- PostgreSQL (Neon)
- Azure
- Google OAuth
