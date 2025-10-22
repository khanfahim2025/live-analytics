# 🚀 GitHub Pages Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Create GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `live-analytics`
3. **Description**: `Real-time analytics dashboard for microsite tracking`
4. **Make it Public** (required for free GitHub Pages)
5. **Click "Create repository"**

### 2. Upload Your Files

**Option A: Using GitHub Web Interface**
1. Go to your new repository
2. Click "uploading an existing file"
3. Drag and drop all files from your local folder
4. Commit with message: "Initial commit"

**Option B: Using Git Command Line**
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/khanfahim2025/live-analytics.git

# Push to GitHub
git push -u origin main
```

### 3. Configure Firebase

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create New Project**:
   - Project name: `live-analytics-dashboard`
   - Enable Google Analytics (optional)
   - Click "Create project"

3. **Enable Realtime Database**:
   - Go to "Realtime Database" in the left menu
   - Click "Create Database"
   - Choose "Start in test mode"
   - Select a location (choose closest to your users)

4. **Get Firebase Config**:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Add app" → Web app
   - Register app with name: "Live Analytics"
   - Copy the config object

5. **Update Firebase Config**:
   - Edit `index.html` and `sample-microsite.html`
   - Replace the placeholder config with your actual Firebase config

6. **Set Database Rules**:
   - Go to Realtime Database → Rules
   - Replace the rules with:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   - Click "Publish"

### 4. Enable GitHub Pages

1. **Go to Repository Settings**:
   - Click "Settings" tab in your repository
   - Scroll down to "Pages" section

2. **Configure Pages**:
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"
   - Click "Save"

3. **Wait for Deployment**:
   - GitHub will build and deploy your site
   - This usually takes 1-2 minutes
   - You'll see a green checkmark when ready

### 5. Access Your Live Dashboard

Your dashboard will be available at:
```
https://khanfahim2025.github.io/live-analytics
```

### 6. Test the System

1. **Open the Dashboard**: https://khanfahim2025.github.io/live-analytics
2. **Test Page Views**: Click "Test Page View" button
3. **Test Lead Generation**: Click "Test Lead Generation" button
4. **Check Real-time Updates**: Watch the numbers update instantly
5. **Test Sample Microsite**: https://khanfahim2025.github.io/live-analytics/sample-microsite.html

## 🔧 Configuration Files

### Firebase Config Template
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "live-analytics-dashboard.firebaseapp.com",
    databaseURL: "https://live-analytics-dashboard-default-rtdb.firebaseio.com/",
    projectId: "live-analytics-dashboard",
    storageBucket: "live-analytics-dashboard.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

### Tracking Implementation
```html
<!-- Add to your microsite HTML -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js"></script>
<script src="https://khanfahim2025.github.io/live-analytics/tracking.js"></script>

<script>
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize tracker
const tracker = new MicrositeTracker({
    micrositeId: 'your-microsite-id',
    debug: true
});
</script>
```

## 🎯 Next Steps

1. **Customize Your Dashboard**:
   - Edit `index.html` to match your branding
   - Update colors, fonts, and layout
   - Add your company logo

2. **Add More Microsites**:
   - Update the microsite list in the dashboard
   - Create tracking for each microsite
   - Set up different tracking IDs

3. **Set Up Custom Domain** (Optional):
   - Go to repository Settings → Pages
   - Add your custom domain
   - Update DNS records

4. **Monitor Performance**:
   - Check Firebase Console for data
   - Monitor real-time updates
   - Set up alerts for important metrics

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Connection Error**:
   - Check your Firebase config
   - Verify database rules allow read/write
   - Ensure Realtime Database is enabled

2. **GitHub Pages Not Loading**:
   - Check repository is public
   - Verify Pages is enabled in settings
   - Wait a few minutes for deployment

3. **Tracking Not Working**:
   - Check browser console for errors
   - Verify Firebase config is correct
   - Test with debug mode enabled

### Getting Help

- **GitHub Issues**: Open an issue in your repository
- **Firebase Support**: Check Firebase documentation
- **GitHub Pages**: Check GitHub Pages documentation

## ✅ Success Checklist

- [ ] GitHub repository created
- [ ] Files uploaded to GitHub
- [ ] Firebase project created
- [ ] Firebase config updated
- [ ] Database rules set
- [ ] GitHub Pages enabled
- [ ] Dashboard accessible
- [ ] Tracking working
- [ ] Real-time updates working

## 🎉 Congratulations!

Your live analytics dashboard is now deployed and ready to track microsite performance in real-time!

**Dashboard URL**: https://khanfahim2025.github.io/live-analytics
**Sample Microsite**: https://khanfahim2025.github.io/live-analytics/sample-microsite.html
