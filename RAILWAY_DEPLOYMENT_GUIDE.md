# Railway Deployment Guide

## 🚀 Complete Live Deployment Setup

### Step 1: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Click "Deploy from GitHub repo"
4. Select your repository: `khanfahim2025/live-analytics`
5. Railway will automatically deploy your Node.js server
6. You'll get a URL like: `https://live-analytics-production-xxxx.up.railway.app`

### Step 2: Update Your Files

Once you have your Railway URL, update these files:

#### Update `homesfy-tracker-fixed.js`
Replace:
```javascript
dashboardUrl: 'https://your-railway-app.up.railway.app',
```
With:
```javascript
dashboardUrl: 'https://live-analytics-production-xxxx.up.railway.app',
```

#### Update `dashboard.js`
Replace:
```javascript
const response = await fetch('https://your-railway-app.up.railway.app/api/counts.json');
```
With:
```javascript
const response = await fetch('https://live-analytics-production-xxxx.up.railway.app/api/counts.json');
```

### Step 3: Push Changes

```bash
git add -A
git commit -m "Update with Railway URL"
git push origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository: https://github.com/khanfahim2025/live-analytics
2. Click **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** / **/ (root)**
5. Click **Save**

### Step 5: Your Live URLs

- **Dashboard**: https://khanfahim2025.github.io/live-analytics
- **API Server**: https://live-analytics-production-xxxx.up.railway.app

### Step 6: Update Your Microsite

Add this script to your microsite (https://www.homesfytestwebsite.com):

```html
<script src="https://khanfahim2025.github.io/live-analytics/homesfy-tracker-fixed.js"></script>
```

## ✅ What You'll Have

- ✅ Live dashboard accessible from anywhere
- ✅ Real-time tracking from any device (mobile, tablet, desktop)
- ✅ Accurate visitor and lead counting
- ✅ Form submission tracking
- ✅ No more localhost limitations

## 🔧 Troubleshooting

If you have issues:

1. **Check Railway logs**: Go to your Railway project → Deployments → View logs
2. **Verify URLs**: Make sure all URLs are updated correctly
3. **Test API**: Visit `https://your-railway-url/api/counts.json` to test the API
4. **Check browser console**: Look for any JavaScript errors

## 📱 Viral-Ready Features

Your dashboard now supports:
- 📱 Mobile devices from anywhere in the world
- 🌍 Global accessibility
- 📊 Real-time analytics
- 🎯 Accurate conversion tracking
- 🚀 Professional deployment
