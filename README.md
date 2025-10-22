# 🚀 Live Analytics Dashboard - GitHub Pages

A real-time analytics dashboard for tracking microsite performance, built for GitHub Pages deployment.

**Live Demo**: https://khanfahim2025.github.io/live-analytics

## ✨ Features

- **Real-time Tracking**: Live visitor and lead tracking with instant dashboard updates
- **Firebase Integration**: Direct client-side Firebase connection (no serverless functions needed)
- **GitHub Pages Ready**: Optimized for static hosting
- **Multi-microsite Support**: Track multiple properties simultaneously
- **UTM Parameter Tracking**: Full campaign attribution and source tracking
- **Beautiful Dashboard**: Modern, responsive interface with real-time updates

## 🚀 Quick Start

### 1. Fork or Clone this Repository

```bash
git clone https://github.com/khanfahim2025/live-analytics.git
cd live-analytics
```

### 2. Configure Firebase

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Realtime Database

2. **Get Firebase Configuration**:
   - Go to Project Settings → General → Your apps
   - Add a web app and copy the config

3. **Update Firebase Config**:
   - Edit `index.html` and `sample-microsite.html`
   - Replace the Firebase config with your actual values:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

4. **Set Firebase Database Rules**:
   - Go to Firebase Console → Realtime Database → Rules
   - Set rules to allow read/write:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 3. Deploy to GitHub Pages

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Your dashboard will be live at**:
   ```
   https://khanfahim2025.github.io/live-analytics
   ```

## 📊 How to Use

### Dashboard
- **Main Dashboard**: `https://khanfahim2025.github.io/live-analytics`
- **Sample Microsite**: `https://khanfahim2025.github.io/live-analytics/sample-microsite.html`

### Tracking Implementation

Add this to your microsite HTML:

```html
<!-- Include Firebase and tracking script -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js"></script>
<script src="https://khanfahim2025.github.io/live-analytics/tracking.js"></script>

<script>
// Initialize Firebase with your config
firebase.initializeApp(firebaseConfig);

// Initialize tracker
const tracker = new MicrositeTracker({
    micrositeId: 'your-microsite-id',
    debug: true
});
</script>
```

### Form Tracking

Add `data-track-lead="true"` to buttons and forms:

```html
<form>
    <input type="text" name="name" placeholder="Your Name" required>
    <input type="email" name="email" placeholder="Your Email" required>
    <button type="submit" data-track-lead="true">Send Inquiry</button>
</form>
```

## 🎯 Real-time Features

- ✅ **Page View Tracking**: Automatic tracking on page load
- ✅ **Form Submission Tracking**: Track leads and conversions
- ✅ **Real-time Dashboard**: Updates instantly when new data is tracked
- ✅ **UTM Parameter Tracking**: Campaign attribution
- ✅ **Device Information**: Screen resolution, user agent tracking
- ✅ **Engagement Tracking**: Scroll depth, time on page

## 🔧 Customization

### Adding New Microsites

1. **Update the dashboard** in `index.html`:
   ```javascript
   // Add your microsite to the list
   const microsites = [
       { id: 'green-reserve-noida', name: 'Green Reserve Noida' },
       { id: 'your-new-microsite', name: 'Your New Microsite' }
   ];
   ```

2. **Update tracking script** with your microsite ID:
   ```javascript
   const tracker = new MicrositeTracker({
       micrositeId: 'your-microsite-id',
       debug: true
   });
   ```

### Styling

- **Dashboard Styles**: Edit the `<style>` section in `index.html`
- **Microsite Styles**: Edit `sample-microsite.html` for your microsite design

## 📈 Analytics Data Structure

The system tracks the following data in Firebase:

- **visits**: Page view events
- **leads**: Form submissions and lead conversions
- **events**: All tracking events
- **microsites**: Microsite configuration and status

## 🚀 Deployment Options

### GitHub Pages (Current)
- ✅ Free hosting
- ✅ Custom domain support
- ✅ Automatic HTTPS
- ✅ Easy deployment

### Alternative Hosting
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop deployment
- **Firebase Hosting**: `firebase deploy`

## 🛠️ Development

### Local Development

1. **Clone the repository**
2. **Open `index.html` in your browser**
3. **Update Firebase config** for local testing
4. **Test tracking functionality**

### Testing

- **Test Page Views**: Use the test buttons in the dashboard
- **Test Lead Generation**: Fill out the sample microsite form
- **Check Real-time Updates**: Open dashboard in another tab

## 📝 License

MIT License - feel free to use this for your projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or support, please open an issue in the GitHub repository.

---

**Built with ❤️ for real-time analytics tracking**