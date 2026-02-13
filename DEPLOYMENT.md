# 🚀 Deployment Guide: Kolam Codex Math Application

This guide walks you through deploying your Kolam Codex Math application to production using Render for the backend and your choice of static hosting for the frontend.

## 📋 Prerequisites

- GitHub account with your code repository
- Render account (free tier available at [render.com](https://render.com))
- Your choice of:
  - Render account for static site hosting, OR
  - Vercel account ([vercel.com](https://vercel.com)), OR
  - Netlify account ([netlify.com](https://netlify.com))

## 🔧 Part 1: Deploy Backend to Render

### Step 1: Push Your Code to GitHub

Ensure all your latest changes are committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Render Web Service

1. **Log in to Render Dashboard**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"

2. **Connect Your Repository**
   - Click "Connect account" if not already connected
   - Select your `kolam-codex-math` repository
   - Click "Connect"

3. **Configure Service**
   - **Name**: `kolam-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave blank
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements-backend.txt`
   - **Start Command**: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**
   - Click "Advanced" → "Add Environment Variable"
   - Add:
     - `PYTHON_VERSION` = `3.11`
     - `RESULTS_DIR` = `/tmp/results`

5. **Select Plan**
   - Choose "Free" plan
   - Click "Create Web Service"

### Step 3: Wait for Deployment

- Render will automatically build and deploy your backend
- This typically takes 2-5 minutes
- Watch the logs for any errors
- Once complete, you'll see "Live" status with a green indicator

### Step 4: Note Your Backend URL

- Your backend URL will be: `https://kolam-backend-xxxx.onrender.com`
- Copy this URL - you'll need it for frontend configuration
- Test the health check: Visit `https://kolam-backend-xxxx.onrender.com/` in your browser
- You should see a JSON response with service status

### Step 5: Test Backend Endpoints

```bash
# Test health check
curl https://your-backend-url.onrender.com/

# Test kolam patterns endpoint
curl https://your-backend-url.onrender.com/kolam/patterns
```

## 🎨 Part 2: Deploy Frontend

### Step 1: Update Environment Variables

1. **Edit `.env.production`**
   ```bash
   # Replace with your actual Render backend URL
   VITE_API_URL=https://kolam-backend-xxxx.onrender.com
   ```

2. **Commit the change**
   ```bash
   git add .env.production
   git commit -m "Update production API URL"
   git push origin main
   ```

### Step 2: Choose Your Deployment Platform

#### Option A: Render Static Site

1. **Create New Static Site**
   - In Render Dashboard, click "New +" → "Static Site"
   - Connect your repository
   - Configure:
     - **Name**: `kolam-frontend`
     - **Branch**: `main`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **Add Environment Variable**
   - Click "Advanced" → "Add Environment Variable"
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com`

3. **Deploy**
   - Click "Create Static Site"
   - Wait for build to complete

#### Option B: Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Dashboard**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variable:
     - `VITE_API_URL` = `https://your-backend-url.onrender.com`
   - Click "Deploy"

3. **Or Deploy via CLI**
   ```bash
   cd d:\kolam-codex-math
   vercel --prod
   ```

#### Option C: Netlify

1. **Deploy via Dashboard**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository
   - Configure:
     - **Build Command**: `npm run build`
     - **Publish Directory**: `dist`
   - Add Environment Variable:
     - `VITE_API_URL` = `https://your-backend-url.onrender.com`
   - Click "Deploy site"

2. **Or Deploy via CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

## ✅ Part 3: Verify Deployment

### Backend Verification

1. **Check Service Status**
   - Visit Render dashboard
   - Ensure service shows "Live" status
   - Check logs for any errors

2. **Test API Endpoints**
   ```bash
   # Health check
   curl https://your-backend-url.onrender.com/

   # Kolam patterns
   curl https://your-backend-url.onrender.com/kolam/patterns
   ```

### Frontend Verification

1. **Visit Your Deployed Site**
   - Open your frontend URL in a browser
   - Check browser console for errors (F12)

2. **Test Image Analysis**
   - Upload a kolam image
   - Verify analysis results appear
   - Check that files can be downloaded

3. **Test Kolam Generator**
   - Navigate to `/generator` route
   - Generate a kolam pattern
   - Verify pattern displays correctly
   - Test export functionality

### CORS Verification

1. **Open Browser Developer Tools** (F12)
2. **Perform API Requests**
   - Upload an image or generate a pattern
   - Check Network tab for API calls
   - Verify no CORS errors in Console

## 🔒 Part 4: Security Hardening (Recommended)

### Update CORS Settings

After deployment, restrict CORS to only your frontend domain:

1. **Edit `backend/app.py`**
   ```python
   allow_origins=[
       "https://your-frontend-domain.com",  # Your actual frontend URL
       "http://localhost:5173",  # Keep for local development
       # Remove the "*" wildcard
   ],
   ```

2. **Commit and push**
   ```bash
   git add backend/app.py
   git commit -m "Restrict CORS to production domain"
   git push origin main
   ```

3. **Render will auto-deploy** the updated backend

## 📊 Monitoring and Maintenance

### Render Free Tier Limitations

> **⚠️ Important**: Render's free tier has these limitations:
> - Services spin down after 15 minutes of inactivity
> - First request after spin-down takes 30-60 seconds
> - Filesystem is ephemeral (uploaded files are deleted on restart)

### Recommendations

1. **For Production Use**
   - Upgrade to paid tier for always-on service
   - Implement cloud storage (AWS S3, Cloudinary) for file uploads

2. **Monitor Your Services**
   - Check Render dashboard regularly
   - Set up email notifications for deployment failures
   - Review logs for errors

## 🐛 Troubleshooting

### Backend Issues

**Service won't start**
- Check Render logs for Python errors
- Verify `requirements-backend.txt` has all dependencies
- Ensure Python version is 3.11

**API returns 404**
- Verify start command: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`
- Check that `backend/app.py` exists

**File upload fails**
- Ensure `RESULTS_DIR` environment variable is set to `/tmp/results`
- Check backend logs for permission errors

### Frontend Issues

**API calls fail with CORS errors**
- Verify backend CORS settings include your frontend domain
- Check that `VITE_API_URL` environment variable is set correctly
- Ensure backend is running and accessible

**Environment variables not working**
- Rebuild the frontend after changing `.env.production`
- Verify environment variables are set in hosting platform dashboard
- Check that variable names start with `VITE_`

**404 on routes**
- Add redirect rules for SPA routing:
  - **Netlify**: Create `_redirects` file: `/* /index.html 200`
  - **Vercel**: Automatically handled
  - **Render**: Add `routes` in `render.yaml`

## 🎉 Success!

Your Kolam Codex Math application is now live! Share your deployment URLs:

- **Backend API**: `https://your-backend.onrender.com`
- **Frontend App**: `https://your-frontend-domain.com`

### Next Steps

- Share your app with users
- Monitor usage and performance
- Consider implementing analytics
- Set up custom domain (optional)
- Implement cloud storage for production use

---

**Need Help?**
- Render Documentation: [docs.render.com](https://docs.render.com)
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Netlify Documentation: [docs.netlify.com](https://docs.netlify.com)
