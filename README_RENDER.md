# Bloomzon Backend - Render Deployment Guide

## Deploying to Render

This guide explains how to deploy your Bloomzon backend to Render.

### Prerequisites

- A Render account (sign up at [https://render.com](https://render.com))
- Your repository hosted on GitHub, GitLab, or Bitbucket

### Steps to Deploy

1. **Connect your repository**
   - Go to your Render dashboard
   - Click "New +" and select "Web Service"
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your Bloomzon backend repository

2. **Configure the environment**
   - **Environment**: Node.js
   - **Branch**: main (or your primary branch)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set environment variables**
   Add the following environment variables in the "Advanced" section:

   ```
   DB_HOST=[your_database_host]
   DB_USER=[your_database_username]
   DB_PASS=[your_database_password]
   DB_NAME=[your_database_name]
   DB_PORT=[your_database_port]
   JWT_SECRET=[your_jwt_secret]
   EMAIL_USER=[your_email_user]
   EMAIL_HOST=[your_email_host]
   EMAIL_PASSWORD=[your_email_password]
   EMAIL_PORT=[your_email_port]
   NODE_ENV=production
   CRYPTER_KEY=[your_crypter_key]
   cloudinaryName=[your_cloudinary_name]
   cloudinaryAPI_KEY=[your_cloudinary_api_key]
   cloudinaryAPI_SECRET=[your_cloudinary_api_secret]
   ```

4. **Configure the instance**
   - **Name**: Choose a unique name for your service
   - **Region**: Select a region close to your users
   - **Plan**: Choose either Free or Paid plan based on your needs

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your application automatically
   - Monitor the build logs to ensure everything works correctly

### Port Configuration

The application will automatically use the port assigned by Render through the `$PORT` environment variable.

### Database Connection

Make sure your database is accessible from external sources if it's self-hosted, or use a managed database service like Render's PostgreSQL add-on.

### Health Checks

Your API endpoints will be available at:
- Base URL: `https://[service-name].onrender.com`
- API Root: `https://[service-name].onrender.com/api/v1`

### Troubleshooting

- Check the deployment logs in your Render dashboard for any build errors
- Ensure all required environment variables are set
- Verify your database connection settings are correct
- Confirm your database allows connections from Render's IP ranges