# Deploying to Render

This guide will help you deploy your Poll System backend to Render.

## Prerequisites

1. GitHub repository (already done ✓)
2. Render account - Sign up at [render.com](https://render.com)
3. MongoDB Atlas (already configured ✓)

## Step 1: Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `hussamshannan/poll-system`
4. Configure the service:

### Basic Settings
- **Name**: `poll-system-api` (or any name you prefer)
- **Region**: Choose closest to your users
- **Branch**: `master`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Advanced Settings
- **Instance Type**: Free (for testing) or Starter (for production)
- **Auto-Deploy**: Yes (recommended)

## Step 2: Set Environment Variables

In the Render dashboard, add these environment variables:

```
MONGODB_URI=mongodb+srv://hussamshannan5:hussam123@cluster0.zjcqxij.mongodb.net/poll
FRONTEND_URL=https://cbosra-poll.vercel.app
NODE_ENV=production
PORT=3001
```

**Note**: Render automatically provides a PORT environment variable, but you can specify 3001 if needed.

## Step 3: Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (2-5 minutes)
3. Once deployed, you'll get a URL like: `https://poll-system-api.onrender.com`

## Step 4: Update Frontend Environment Variable

### Option A: Update in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   ```
   VITE_API_URL=https://poll-system-api.onrender.com/api
   ```
5. **Important**: Make sure to include `/api` at the end!
6. Go to **Deployments** tab
7. Redeploy the latest deployment

### Option B: Update via Vercel CLI

```bash
cd client
vercel env add VITE_API_URL
# Enter: https://poll-system-api.onrender.com/api
vercel --prod
```

## Step 5: Update MongoDB Atlas Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Go to **Network Access**
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is necessary because Render uses dynamic IPs
5. Click **"Confirm"**

## Step 6: Test Your Deployment

### Test Backend Directly

```bash
# Health check
curl https://poll-system-api.onrender.com/health

# Get stats
curl https://poll-system-api.onrender.com/api/stats

# Submit a test vote
curl -X POST https://poll-system-api.onrender.com/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "1234567890",
    "answer": "Yes",
    "language": "en"
  }'
```

### Test Frontend

1. Visit your frontend: `https://cbosra-poll.vercel.app`
2. Try submitting a vote
3. Check the results page
4. Test the admin panel
5. Export a PDF

## Troubleshooting

### 404 Error on API Calls

**Problem**: Getting 404 errors like `GET /stats 404`

**Solution**: Make sure your `VITE_API_URL` includes `/api`:
```
VITE_API_URL=https://poll-system-api.onrender.com/api
```
NOT:
```
VITE_API_URL=https://poll-system-api.onrender.com
```

### CORS Errors

**Problem**: CORS errors in browser console

**Solutions**:
1. Check that `FRONTEND_URL` in Render matches your Vercel URL exactly
2. Make sure there's no trailing slash in `FRONTEND_URL`
3. Redeploy backend after changing environment variables

### MongoDB Connection Failed

**Problem**: Can't connect to MongoDB

**Solutions**:
1. Check MongoDB Atlas Network Access allows 0.0.0.0/0
2. Verify `MONGODB_URI` is correct in Render
3. Check MongoDB Atlas database user exists
4. Check Render logs: Click on your service → Logs

### Build Failed

**Problem**: Build fails on Render

**Solutions**:
1. Check that `Root Directory` is set to `server`
2. Verify `package.json` exists in server directory
3. Check Render build logs for specific errors
4. Make sure all dependencies are in `package.json`

### Fonts Not Loading (PDF)

**Problem**: PDF generation fails with font errors

**Solution**: Fonts are in the repo, but check:
```bash
server/src/assets/fonts/
├── Inter/
│   └── static/
│       ├── Inter_28pt-Regular.ttf
│       └── Inter_28pt-Bold.ttf
└── Rubik/
    └── static/
        ├── Rubik-Regular.ttf
        └── Rubik-Bold.ttf
```

## Render Free Tier Limitations

### Important Notes:

1. **Spin Down**: Free tier services spin down after 15 minutes of inactivity
2. **First Request**: May take 30-60 seconds to wake up
3. **Monthly Hours**: 750 hours/month (enough for one service)
4. **Bandwidth**: Limited to 100GB/month

### Recommendations:

- **Upgrade to Starter ($7/month)** for:
  - No spin down
  - More reliable performance
  - Better for production

- **Use Cron Job** to keep free tier awake:
  ```bash
  # Use a service like cron-job.org to ping your API every 10 minutes
  GET https://poll-system-api.onrender.com/health
  ```

## Monitoring

### Check Logs

1. Go to your Render service
2. Click on **"Logs"** tab
3. Monitor for errors

### Check Metrics

1. Click on **"Metrics"** tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Response times
   - HTTP status codes

## Custom Domain (Optional)

### Add Custom Domain

1. In Render dashboard, go to your service
2. Click **"Settings"**
3. Scroll to **"Custom Domain"**
4. Add your domain (e.g., `api.yourdomain.com`)
5. Follow DNS configuration instructions

### Update Environment Variables

After adding custom domain:
1. Update `VITE_API_URL` in Vercel to your custom domain
2. Redeploy frontend

## Automatic Deployments

Render automatically deploys when you push to GitHub:
- Push to `master` branch → Automatic deployment
- Can configure deploy hooks for manual control

## Cost Optimization

### Free Tier Strategy
- One backend on Render Free
- Frontend on Vercel Free
- MongoDB Atlas Free (M0)
- **Total Cost**: $0/month

### Production Strategy
- Backend on Render Starter ($7/month)
- Frontend on Vercel Pro ($20/month) - Optional
- MongoDB Atlas M2 ($9/month) - Optional
- **Total Cost**: $7-36/month

## Environment Variables Summary

### Render (Backend)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
FRONTEND_URL=https://cbosra-poll.vercel.app
NODE_ENV=production
PORT=3001
```

### Vercel (Frontend)
```env
VITE_API_URL=https://poll-system-api.onrender.com/api
```

## Quick Command Reference

```bash
# Check if backend is running
curl https://poll-system-api.onrender.com/health

# Test stats endpoint
curl https://poll-system-api.onrender.com/api/stats

# View Render logs (requires Render CLI)
render logs poll-system-api

# Trigger manual deployment (requires Render CLI)
render deploy poll-system-api
```

## Next Steps

1. ✓ Deploy backend to Render
2. ✓ Set environment variables
3. ✓ Update frontend API URL
4. ✓ Test all endpoints
5. ✓ Monitor logs for errors
6. Consider upgrading to paid tier for production
7. Set up monitoring and alerts
8. Configure backups for MongoDB

## Support

- **Render Support**: [render.com/docs](https://render.com/docs)
- **Render Community**: [community.render.com](https://community.render.com)
- **Project Issues**: [GitHub Issues](https://github.com/hussamshannan/poll-system/issues)

---

**Last Updated**: 2026-01-30
