# Deployment Guide

This guide will walk you through deploying the Poll System to Vercel.

## Prerequisites

1. GitHub account (already done ✓)
2. Vercel account - Sign up at [vercel.com](https://vercel.com)
3. MongoDB Atlas account - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

## Step 1: Set up MongoDB Atlas (if not already done)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with username and password
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel deployment
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

## Step 2: Deploy Backend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `hussamshannan/poll-system`
4. Configure the backend:
   - **Project Name**: `poll-system-backend` (or any name you prefer)
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/poll
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

   Note: You can add a placeholder for `FRONTEND_URL` now and update it after deploying the frontend.

6. Click **Deploy**

7. Once deployed, copy your backend URL (e.g., `https://poll-system-backend.vercel.app`)

## Step 3: Deploy Frontend to Vercel

1. Go back to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"** again
3. Import the same GitHub repository: `hussamshannan/poll-system`
4. Configure the frontend:
   - **Project Name**: `poll-system-frontend` (or any name you prefer)
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```
   Replace `your-backend-url.vercel.app` with the actual backend URL from Step 2.

6. Click **Deploy**

7. Once deployed, copy your frontend URL (e.g., `https://poll-system-frontend.vercel.app`)

## Step 4: Update Backend Environment Variable

1. Go to your backend project in Vercel Dashboard
2. Go to **Settings** → **Environment Variables**
3. Edit the `FRONTEND_URL` variable
4. Set it to your frontend URL from Step 3
5. Click **Save**
6. Go to **Deployments** tab
7. Click the three dots on the latest deployment and select **Redeploy**

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Try submitting a vote
3. Check the admin panel
4. Try exporting a PDF

## Quick Deploy with Vercel CLI (Alternative)

If you prefer using the command line:

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy Backend
```bash
cd server
vercel --prod
# Follow the prompts and add environment variables when asked
```

### Deploy Frontend
```bash
cd client
vercel --prod
# Follow the prompts and add environment variables when asked
```

## Environment Variables Summary

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
FRONTEND_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

## Troubleshooting

### Backend Issues

**Error: Cannot connect to MongoDB**
- Check your MongoDB connection string
- Ensure IP whitelist includes 0.0.0.0/0 in MongoDB Atlas
- Verify database user credentials

**Error: CORS issues**
- Make sure `FRONTEND_URL` in backend matches your actual frontend URL
- Check that the frontend URL doesn't have a trailing slash

### Frontend Issues

**Error: Cannot connect to API**
- Verify `VITE_API_URL` is set correctly
- Make sure it includes `/api` at the end
- Check that backend is deployed and running

**Build fails**
- Clear cache and redeploy
- Check for any console errors in build logs

## Custom Domain (Optional)

### Add Custom Domain to Frontend
1. Go to your frontend project in Vercel
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow Vercel's instructions to update DNS records

### Add Custom Domain to Backend
1. Go to your backend project in Vercel
2. Click **Settings** → **Domains**
3. Add your custom domain for the API
4. Update the `VITE_API_URL` in your frontend environment variables
5. Redeploy the frontend

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- Push to `master` branch → Production deployment
- Push to other branches → Preview deployment

## Monitoring

Monitor your deployments:
1. Go to your project in Vercel Dashboard
2. Click on **Analytics** to see traffic and performance
3. Click on **Logs** to see runtime logs
4. Set up error alerts in Settings

## Support

If you encounter issues:
- Check Vercel logs for errors
- Review environment variables
- Contact Vercel support at [vercel.com/support](https://vercel.com/support)

## Next Steps

- Set up a custom domain
- Configure analytics
- Set up monitoring and alerts
- Add CI/CD workflows
- Implement staging environments
