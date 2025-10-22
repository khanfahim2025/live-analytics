# 🏢 Real Microsite Integration Guide

## For Your Actual Website: https://www.green-reserve-noida.in/

This guide shows you how to integrate live analytics tracking with your real microsite at [green-reserve-noida.in](https://www.green-reserve-noida.in/).

## 🎯 Integration Options

### Option 1: Direct Firebase Integration (Recommended)

Add this code to your website's `<head>` section:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js"></script>

<!-- Live Analytics Tracking Script -->
<script src="https://khanfahim2025.github.io/live-analytics/gtm-tracking.js"></script>

<script>
// Firebase configuration - Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "live-analytics-dashboard.firebaseapp.com",
    databaseURL: "https://live-analytics-dashboard-default-rtdb.firebaseio.com/",
    projectId: "live-analytics-dashboard",
    storageBucket: "live-analytics-dashboard.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize tracker for green-reserve-noida
const tracker = new RealMicrositeTracker({
    micrositeId: 'green-reserve-noida',
    debug: true
});
</script>
```

### Option 2: GTM Integration

If you're using Google Tag Manager, add this as a Custom HTML tag:

```html
<script>
// Firebase configuration
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "live-analytics-dashboard.firebaseapp.com",
    databaseURL: "https://live-analytics-dashboard-default-rtdb.firebaseio.com/",
    projectId: "live-analytics-dashboard",
    storageBucket: "live-analytics-dashboard.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize tracker
const tracker = new RealMicrositeTracker({
    micrositeId: 'green-reserve-noida',
    debug: true
});

// GTM dataLayer integration
dataLayer.push({
    'event': 'microsite_tracking_initialized',
    'microsite_id': 'green-reserve-noida'
});
</script>
```

## 🔧 Form Tracking Setup

### For Your Contact Forms

Add `data-track-lead="true"` to your form buttons:

```html
<!-- Example for your existing forms -->
<form id="contactForm">
    <input type="text" name="name" placeholder="Your Name" required>
    <input type="email" name="email" placeholder="Your Email" required>
    <input type="tel" name="phone" placeholder="Your Phone" required>
    <button type="submit" data-track-lead="true">Send Inquiry</button>
</form>
```

### For CTA Buttons

Add tracking to your call-to-action buttons:

```html
<!-- Examples based on your website -->
<button class="enquire-now" data-track-lead="true">Enquire Now</button>
<button class="register-now" data-track-lead="true">Register Now</button>
<button class="request-brochure" data-track-lead="true">Request Brochure</button>
<button class="download-brochure" data-track-lead="true">Download Brochure</button>
```

## 📊 What Gets Tracked Automatically

### Page Views
- ✅ Every page load
- ✅ Page refreshes
- ✅ Navigation between pages
- ✅ UTM parameters
- ✅ Referrer information

### Form Submissions
- ✅ Contact form submissions
- ✅ Brochure requests
- ✅ Registration forms
- ✅ Inquiry forms

### Button Clicks
- ✅ CTA buttons
- ✅ Enquiry buttons
- ✅ Download buttons
- ✅ Registration buttons

### User Information
- ✅ Device type
- ✅ Screen resolution
- ✅ Browser information
- ✅ Location (if available)

## 🎯 Specific Elements to Track on Your Site

Based on your website structure, here are the specific elements to add tracking to:

### 1. Main CTA Buttons
```html
<!-- Add data-track-lead="true" to these buttons -->
<button class="enquire-now" data-track-lead="true">Enquire Now</button>
<button class="register-now" data-track-lead="true">Register Now</button>
<button class="request-brochure" data-track-lead="true">Request Brochure</button>
```

### 2. Contact Forms
```html
<!-- Add data-track-lead="true" to form submit buttons -->
<form id="contactForm">
    <!-- Your existing form fields -->
    <button type="submit" data-track-lead="true">Send Inquiry</button>
</form>
```

### 3. Pricing Plan Buttons
```html
<!-- Add tracking to pricing buttons -->
<button class="enquire-now" data-track-lead="true">Enquire Now</button>
```

## 🔍 Testing Your Integration

### 1. Test Locally
1. Open `test-microsite.html` in your browser
2. Fill out the form and submit
3. Click the CTA buttons
4. Check the tracking status in the page

### 2. Test on Your Live Site
1. Add the tracking code to your website
2. Visit your website
3. Fill out forms and click buttons
4. Check your dashboard for real-time updates

### 3. Verify Data in Dashboard
1. Open your dashboard: `https://khanfahim2025.github.io/live-analytics`
2. Look for real-time updates
3. Check the microsite table for data

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Connection Error**:
   - Check your Firebase config
   - Verify database rules allow read/write
   - Ensure Realtime Database is enabled

2. **Tracking Not Working**:
   - Check browser console for errors
   - Verify Firebase config is correct
   - Test with debug mode enabled

3. **Forms Not Tracking**:
   - Ensure `data-track-lead="true"` is added to buttons
   - Check that forms have proper name attributes
   - Verify JavaScript is loading correctly

### Debug Mode

Enable debug mode to see tracking logs:

```javascript
const tracker = new RealMicrositeTracker({
    micrositeId: 'green-reserve-noida',
    debug: true  // This will show console logs
});
```

## 📈 Expected Results

Once integrated, you should see:

### In Your Dashboard:
- ✅ Real-time visitor count
- ✅ Lead generation tracking
- ✅ Conversion rate calculations
- ✅ Microsite performance metrics

### In Firebase Console:
- ✅ `visits` collection with page view data
- ✅ `leads` collection with form submissions
- ✅ `events` collection with all tracking events

## 🎯 Next Steps

1. **Add the tracking code** to your website
2. **Test the integration** with the test page
3. **Deploy to your live site**
4. **Monitor the dashboard** for real-time updates
5. **Optimize based on data** you collect

## 📞 Support

If you need help with the integration:

1. **Check the console** for error messages
2. **Verify Firebase config** is correct
3. **Test with debug mode** enabled
4. **Check your dashboard** for data updates

Your live analytics system will now track all visitor activity from your real microsite at [green-reserve-noida.in](https://www.green-reserve-noida.in/) and display it in real-time on your dashboard!
