# Bloomzon Backend

## Project Overview

Bloomzon is a comprehensive e-commerce platform backend built with Node.js, Express, and MySQL.

## Features

- User Authentication & Management
- Product Catalog & Management
- Shopping Cart & Wishlist
- Order Processing
- Payment Integration
- Notification System
- Reviews & Ratings
- Admin Dashboard

## Tech Stack

- Node.js
- Express.js
- MySQL
- Cloudinary (for image uploads)
- JWT (for authentication)
- Stripe (for payments)

## Deployment for Render

This project is configured for deployment on Render. See `README_RENDER.md` for detailed instructions.

## Environment Variables

The application requires the following environment variables:

- `PORT`: Port number for the server (provided by Render)
- `DB_HOST`: Database host
- `DB_USER`: Database username
- `DB_PASS`: Database password
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT tokens
- `EMAIL_USER`: Email address for sending emails
- `EMAIL_HOST`: SMTP host
- `EMAIL_PASSWORD`: SMTP password
- `EMAIL_PORT`: SMTP port
- `NODE_ENV`: Environment (development/production)
- `CRYPTER_KEY`: Encryption key
- `cloudinaryName`: Cloudinary cloud name
- `cloudinaryAPI_KEY`: Cloudinary API key
- `cloudinaryAPI_SECRET`: Cloudinary API secret

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Run the application: `npm run dev`

## Deployment

This project can be deployed to various platforms including Render, Heroku, or AWS.

## API Endpoints

All API endpoints are prefixed with `/api/v1`.

## Render Deployment Configuration

This project includes:
- `render.yaml` - Render deployment configuration
- `Dockerfile` - Containerization for Render deployment
- Updated `package.json` with proper start command for production
- Proper PORT handling for Render environment