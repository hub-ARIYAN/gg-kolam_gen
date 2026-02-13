# 🚀 Complete Setup Guide: Render + Appwrite Deployment

This guide will walk you through deploying your Kolam Codex Math application using:
- **Render** for the FastAPI backend
- **Appwrite** for frontend hosting (or alternative static hosting)

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account

1. **Go to Render**
   - Visit [render.com](https://render.com)
   - Click "Get Started for Free"
   - Sign up with GitHub (recommended) or email

2. **Verify Email**
   - Check your email for verification link
   - Click to verify your account

### Step 2: Connect GitHub Repository

1. **Access Dashboard**
   - Log in to [dashboard.render.com](https://dashboard.render.com)
   - You'll see the main dashboard

2. **Create New Web Service**
   - Click "New +" button (top right)
   - Select "Web Service"

3. **Connect GitHub**
   - If first time: Click "Connect GitHub"
   - Authorize Render to access your GitHub account
   - Select "All repositories" or "Only select repositories"
   - If selecting specific repos, choose `hub-ARIYAN/gg-kolam_gen`

4. **Select Repository**
   - Find `gg-kolam_gen` in the list
   - Click "Connect"

### Step 3: Configure Web Service

Render will show a configuration form. Fill it out as follows:

1. **Basic Settings**
   - **Name**: `kolam-backend` (or your preferred name)
   - **Region**: Choose closest to your target users (e.g., Oregon USA, Frankfurt EU, Singapore)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: `Python 3`

2. **Build & Deploy Settings**
   
   Render should auto-detect from your `render.yaml`, but verify:
   
   - **Build Command**: 
     ```bash
     pip install -r requirements-backend.txt
     ```
   
   - **Start Command**:
     ```bash
     uvicorn backend.app:app --host 0.0.0.0 --port $PORT
     ```

3. **Advanced Settings** (Click "Advanced")
   
   Add Environment Variables:
   - Click "Add Environment Variable"
   - Add these variables:
   
   | Key | Value |
   |-----|-------|
   | `PYTHON_VERSION` | `3.11` |
   | `RESULTS_DIR` | `/tmp/results` |

4. **Health Check Path**
   - **Health Check Path**: `/`
   - This uses the health check endpoint we created

5. **Plan Selection**
   - Select **"Free"** plan
   - Free tier includes:
     - 750 hours/month
     - 512 MB RAM
     - Spins down after 15 min inactivity

6. **Create Web Service**
   - Review all settings
   - Click "Create Web Service"

### Step 4: Monitor Deployment

1. **Watch Build Logs**
   - Render will automatically start building
   - You'll see real-time logs
   - Look for:
     ```
     Installing dependencies from requirements-backend.txt...
     Successfully installed fastapi uvicorn...
     Starting service...
     ```

2. **Wait for "Live" Status**
   - Deployment typically takes 2-5 minutes
   - Status will change from "Building" → "Deploying" → "Live"
   - Green indicator means success!

3. **Get Your Backend URL**
   - Once live, you'll see your URL at the top
   - Format: `https://kolam-backend-xxxx.onrender.com`
   - **Copy this URL** - you'll need it for frontend configuration

### Step 5: Test Backend Deployment

1. **Test Health Check**
   - Click on your backend URL or visit in browser
   - You should see JSON response:
     ```json
     {
       "status": "healthy",
       "service": "Kolam Codex Math API",
       "version": "1.0.0",
       "endpoints": {...}
     }
     ```

2. **Test API Endpoints**
   
   Open a terminal and test:
   
   ```bash
   # Replace with your actual URL
   curl https://kolam-backend-xxxx.onrender.com/
   
   # Test kolam patterns endpoint
   curl https://kolam-backend-xxxx.onrender.com/kolam/patterns
   ```
   
   You should get JSON responses with pattern data.

3. **Check Logs**
   - In Render dashboard, click "Logs" tab
   - Verify no errors
   - You should see uvicorn startup messages

---

## Part 2: Deploy Frontend to Appwrite

### Option A: Appwrite Cloud (Recommended)

#### Step 1: Create Appwrite Account

1. **Sign Up**
   - Go to [cloud.appwrite.io](https://cloud.appwrite.io)
   - Click "Get Started"
   - Sign up with GitHub, Google, or email

2. **Verify Email**
   - Check email for verification
   - Complete verification

#### Step 2: Create New Project

1. **Create Project**
   - Click "Create Project"
   - **Project Name**: `Kolam Codex Math`
   - **Project ID**: Auto-generated (or customize)
   - Click "Create"

2. **Note Project Details**
   - You'll see your project dashboard
   - Note the **Project ID** (you'll need it)

#### Step 3: Update Frontend Configuration

Before deploying, update your frontend to use the deployed backend:

1. **Edit `.env.production`**
   
   Open the file and update:
   ```bash
   VITE_API_URL=https://kolam-backend-xxxx.onrender.com
   ```
   Replace `xxxx` with your actual Render backend URL.

2. **Rebuild Frontend**
   
   ```bash
   npm run build
   ```
   
   This creates an optimized production build in the `dist` folder.

3. **Commit Changes**
   
   ```bash
   git add .env.production
   git commit -m "Update production API URL"
   git push origin main
   ```

#### Step 4: Deploy to Appwrite

**Method 1: Using Appwrite CLI (Recommended)**

1. **Install Appwrite CLI**
   
   ```bash
   npm install -g appwrite-cli
   ```

2. **Login to Appwrite**
   
   ```bash
   appwrite login
   ```
   
   - Enter your Appwrite email
   - Enter your password
   - Select your project

3. **Initialize Deployment**
   
   ```bash
   cd d:\kolam-codex-math
   appwrite init function
   ```
   
   Follow prompts:
   - Select your project
   - Choose "Static Website"

4. **Deploy**
   
   ```bash
   appwrite deploy
   ```
   
   - Select the `dist` folder when prompted
   - Wait for upload to complete

**Method 2: Manual Upload via Dashboard**

1. **Go to Storage**
   - In Appwrite dashboard, click "Storage"
   - Create a new bucket: `frontend`
   - Set permissions to "Public"

2. **Upload Files**
   - Upload all files from your `dist` folder
   - This includes `index.html`, `assets/`, etc.

3. **Configure Static Hosting**
   - Enable "Static Website Hosting" for the bucket
   - Set `index.html` as the index document
   - Set `index.html` as the error document (for SPA routing)

4. **Get Your URL**
   - Appwrite will provide a URL like:
   - `https://[project-id].appwrite.global`

---

## Part 3: Alternative - Deploy Frontend to Vercel (Easier Option)

If Appwrite is complex, Vercel is simpler for static sites:

### Step 1: Create Vercel Account

1. **Sign Up**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up"
   - Sign up with GitHub (recommended)

### Step 2: Import Project

1. **Import Repository**
   - Click "Add New..." → "Project"
   - Select `hub-ARIYAN/gg-kolam_gen` repository
   - Click "Import"

2. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://kolam-backend-xxxx.onrender.com`
   - Click "Add"

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - You'll get a URL like: `https://gg-kolam-gen.vercel.app`

---

## Part 4: Alternative - Deploy Frontend to Netlify

### Step 1: Create Netlify Account

1. **Sign Up**
   - Go to [netlify.com](https://netlify.com)
   - Click "Sign Up"
   - Sign up with GitHub

### Step 2: Deploy Site

1. **Import from Git**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Select `hub-ARIYAN/gg-kolam_gen`

2. **Configure Build**
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

3. **Add Environment Variables**
   - Click "Site settings" → "Environment variables"
   - Add:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://kolam-backend-xxxx.onrender.com`

4. **Deploy**
   - Click "Deploy site"
   - Wait 1-2 minutes
   - You'll get a URL like: `https://gg-kolam-gen.netlify.app`

---

## Part 5: Final Verification

### Test Your Deployed Application

1. **Visit Frontend URL**
   - Open your deployed frontend in a browser
   - You should see the Kolam application

2. **Test Image Analysis**
   - Upload a kolam image
   - Verify analysis results appear
   - Check that files can be downloaded

3. **Test Kolam Generator**
   - Navigate to `/generator` route
   - Generate a kolam pattern
   - Verify pattern displays correctly
   - Test export functionality (SVG/PNG)

4. **Check Browser Console**
   - Press F12 to open developer tools
   - Check Console tab for errors
   - Check Network tab for API calls
   - Verify no CORS errors

### Troubleshooting

**Backend Issues:**

- **Service won't start**: Check Render logs for Python errors
- **API returns 404**: Verify start command is correct
- **Slow first request**: Normal on free tier (cold start after 15 min)

**Frontend Issues:**

- **API calls fail**: Check `VITE_API_URL` is set correctly
- **CORS errors**: Verify backend CORS includes your frontend domain
- **404 on routes**: Ensure SPA routing is configured (`_redirects` for Netlify)

**Common Fixes:**

```bash
# Rebuild frontend after changing env vars
npm run build

# Check backend logs in Render dashboard
# Go to your service → Logs tab

# Test backend directly
curl https://your-backend.onrender.com/kolam/patterns
```

---

## Part 6: Post-Deployment Configuration

### Update CORS for Production (Recommended)

Once you know your frontend URL, restrict CORS:

1. **Edit `backend/app.py`**
   
   ```python
   allow_origins=[
       "https://your-frontend-domain.com",  # Your actual frontend URL
       "http://localhost:5173",  # Keep for local development
       # Remove the "*" wildcard for security
   ],
   ```

2. **Commit and Push**
   
   ```bash
   git add backend/app.py
   git commit -m "Restrict CORS to production domain"
   git push origin main
   ```

3. **Render Auto-Deploys**
   - Render will automatically detect the push
   - It will rebuild and redeploy your backend

### Set Up Custom Domain (Optional)

**For Render:**
- Go to your service → Settings → Custom Domain
- Add your domain and follow DNS instructions

**For Vercel/Netlify:**
- Go to Domain settings
- Add custom domain
- Update DNS records as instructed

---

## Summary

### Your Deployed URLs

- **Backend API**: `https://kolam-backend-xxxx.onrender.com`
- **Frontend App**: 
  - Appwrite: `https://[project-id].appwrite.global`
  - Vercel: `https://gg-kolam-gen.vercel.app`
  - Netlify: `https://gg-kolam-gen.netlify.app`

### What You've Accomplished

✅ Backend deployed to Render with auto-scaling  
✅ Frontend deployed to static hosting  
✅ Environment variables configured  
✅ CORS properly set up  
✅ Health checks enabled  
✅ Production build optimized  

### Next Steps

1. Test all features thoroughly
2. Share your app with users
3. Monitor usage in Render/Vercel/Netlify dashboards
4. Consider upgrading to paid tier for production use
5. Implement cloud storage for uploaded files (AWS S3, Cloudinary)

---

## Need Help?

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Appwrite Docs**: [appwrite.io/docs](https://appwrite.io/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)

**Congratulations! Your Kolam application is now live! 🎉**
