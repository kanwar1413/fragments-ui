# Fragments-ui

This repository contains the Fragments Frontend, a lightweight web client for the Fragments API Server.
It allows authenticated users to log in with Amazon Cognito, then create, retrieve, update, download, and delete fragments (text, JSON, Markdown, HTML, and images).
This project works together with the Fragments Backend (https://github.com/kanwar1413/fragments) .
Make sure both are running for full functionality.

---
## Features

- Authentication via Amazon Cognito (OIDC login/logout)
- CRUD operations on fragments (create, read, update, delete)
- Upload images as fragments
- Download with conversion (e.g., Markdown → HTML, PNG → JPEG)
- Metadata view (/info endpoint support)
- Simple vanilla JavaScript UI with HTML forms (no React required)

---
## Tech Stack

- HTML + Parcel 
- OIDC Client (oidc-client-ts) for Cognito authentication
- Fetch API for communicating with Fragments backend
- Docker (optional containerized deployment)

---
## Getting Started

### 1. Clone the repository
```bash
  git clone https://github.com/kanwar1413/fragments-frontend.git
  cd fragments-frontend
```
### 2. Install dependencies

This project uses plain JavaScript in the browser.
For authentication, you’ll need the oidc-client-ts package installed:
```bash 
  npm install oidc-client-ts
  npm install
```
### 3. Setup environment variables

Create a .env file in the root with:

```
# .env

# fragments microservice API URL (make sure this is the right port for you)
API_URL= http://fragments-lb-1173807981.us-east-1.elb.amazonaws.com

# AWS Amazon Cognito User Pool ID (use your User Pool ID)
AWS_COGNITO_POOL_ID=""

# AWS Amazon Cognito Client App ID (use your Client App ID)
AWS_COGNITO_CLIENT_ID=""

# OAuth Sign-In Redirect URL (use the port for your fragments-ui web app)
# Be careful with http vs. https and trailing slashes: match what's in Cogntio's config.
OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
```


⚠️ These values must match your Cognito App Client settings.

### 4. Run locally
```bash
npm start
```

Frontend will be available at:
http://localhost:1234
 (or wherever your server runs)

---
## Testing

- Login/Logout with Cognito
- Create text/image fragments using the forms
- Retrieve/update/download/delete fragments
- Verify API requests/responses in browser DevTools (Network tab)

### Run with Docker
Build image
```bash 
docker build -t fragments-frontend .
```

Run container
```bash
docker run -p 3000:80 fragments-frontend
```

Then visit 👉 http://localhost:3000

---
## Deployment (AWS S3 + CloudFront)

1. Host the frontend files (index.html, src/) in an S3 bucket
2. Enable static website hosting
3. Use CloudFront for HTTPS + caching

---

## UI Overview

- Login / Logout (Amazon Cognito)
- GET fragments (by ID / all / expanded)
- POST new fragments (text or image upload)
- PUT update existing fragment
- DELETE remove a fragment
- DOWNLOAD fragment in original or converted format
