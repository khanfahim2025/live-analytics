# 🏠 Homesfy Test Website Integration Guide

This guide will help you integrate your `www.homesfytestwebsite.com` microsite with the Live Analytics Dashboard to get real-time data instead of demo data.

## 🚀 Quick Setup

### Step 1: Add Tracking Code to Your Microsite

Add this code to the `<head>` section of your `www.homesfytestwebsite.com` website:

```html

<!-- Live Analytics Dashboard Tracking -->
<script>
(function() {
    'use strict';
    
    // Configuration - UPDATE THESE VALUES
    const DASHBOARD_CONFIG = {
        gtmId: 'GTM-XXXXXXX', // Replace with your actual GTM Container ID
        siteName: 'Homesfy Test Website',
        dashboardUrl: 'http://localhost:9000', // Your dashboard URL
        siteUrl: 'https://www.homesfytestwebsite.com'
    };

    // Tracking data
    let trackingData = {
        visitors: 0,
        leads: 0,
        conversions: 0,
        pageViews: 0,
        formSubmissions: 0,
        buttonClicks: 0,
        scrollDepth: 0,
        timeOnPage: 0,
        startTime: Date.now()
    };

    // Send data to dashboard
    function sendToDashboard(eventType, data) {
        const message = {
            event: 'gtm.' + eventType,
            gtmId: DASHBOARD_CONFIG.gtmId,
            siteName: DASHBOARD_CONFIG.siteName,
            siteUrl: DASHBOARD_CONFIG.siteUrl,
            data: {
                ...data,
                timestamp: Date.now(),
                url: window.location.href,
                referrer: document.referrer,
                userAgent: navigator.userAgent
            }
        };

        // Send to parent window (if in iframe)
        if (window.parent !== window) {
            window.parent.postMessage(message, '*');
        }
        
        // Send to dashboard via fetch
        fetch(DASHBOARD_CONFIG.dashboardUrl + '/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        }).catch(error => {
            console.log('Dashboard not available:', error);
        });

        // Store locally for offline tracking
        storeTrackingData(message);
    }

    // Store tracking data locally
    function storeTrackingData(data) {
        const existingData = JSON.parse(localStorage.getItem('homesfy_tracking') || '[]');
        existingData.push(data);
        
        // Keep only last 100 entries
        if (existingData.length > 100) {
            existingData.splice(0, existingData.length - 100);
        }
        
        localStorage.setItem('homesfy_tracking', JSON.stringify(existingData));
    }

    // Track page view
    function trackPageView() {
        trackingData.pageViews++;
        trackingData.visitors++;
        
        sendToDashboard('pageView', {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: Date.now()
        });
    }

    // Track form submission
    function trackFormSubmission(form) {
        trackingData.formSubmissions++;
        trackingData.leads++;
        trackingData.conversions = ((trackingData.leads / trackingData.visitors) * 100).toFixed(1);
        
        sendToDashboard('formSubmit', {
            formId: form.id || 'unknown',
            formClass: form.className || 'unknown',
            formAction: form.action || 'unknown',
            formMethod: form.method || 'unknown'
        });
    }

    // Track button clicks
    function trackButtonClick(element) {
        trackingData.buttonClicks++;
        
        sendToDashboard('buttonClick', {
            elementId: element.id || 'unknown',
            elementClass: element.className || 'unknown',
            elementText: element.textContent || element.value || 'unknown',
            elementType: element.tagName.toLowerCase(),
            elementHref: element.href || null
        });
    }

    // Track conversions
    function trackConversion(conversionData) {
        trackingData.conversions++;
        trackingData.leads++;
        
        sendToDashboard('conversion', {
            conversionType: conversionData.type || 'lead',
            value: conversionData.value || 0,
            currency: conversionData.currency || 'USD',
            goal: conversionData.goal || 'Lead Generation'
        });
    }

    // Initialize tracking
    function initTracking() {
        // Track initial page view
        trackPageView();

        // Track form submissions
        document.addEventListener('submit', function(e) {
            trackFormSubmission(e.target);
        });

        // Track button clicks
        document.addEventListener('click', function(e) {
            if (e.target.matches('button, a, input[type="submit"], input[type="button"]')) {
                trackButtonClick(e.target);
            }
        });

        // Track scroll depth
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                
                if (scrollPercent > trackingData.scrollDepth) {
                    trackingData.scrollDepth = scrollPercent;
                    
                    if (trackingData.scrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                        sendToDashboard('scrollDepth', {
                            depth: trackingData.scrollDepth
                        });
                    }
                }
            }, 100);
        });

        // Track time on page before unload
        window.addEventListener('beforeunload', function() {
            trackingData.timeOnPage = Math.round((Date.now() - trackingData.startTime) / 1000);
            sendToDashboard('timeOnPage', {
                seconds: trackingData.timeOnPage
            });
        });
    }

    // Make functions globally available
    window.trackConversion = trackConversion;
    window.trackFormSubmission = trackFormSubmission;
    window.trackButtonClick = trackButtonClick;
    window.sendToDashboard = sendToDashboard;

    // Get current tracking data
    window.getTrackingData = function() {
        return trackingData;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }

    // Send periodic updates
    setInterval(function() {
        sendToDashboard('heartbeat', {
            visitors: trackingData.visitors,
            leads: trackingData.leads,
            conversions: trackingData.conversions,
            pageViews: trackingData.pageViews,
            formSubmissions: trackingData.formSubmissions,
            buttonClicks: trackingData.buttonClicks,
            scrollDepth: trackingData.scrollDepth,
            timeOnPage: trackingData.timeOnPage
        });
    }, 30000); // Send every 30 seconds

})();
</script>
```

### Step 2: Add Your Microsite to the Dashboard

1. **Open your dashboard** at `http://localhost:9000`
2. **Click "Add Microsite"**
3. **Fill in the details:**
   - **Site Name:** Homesfy Test Website
   - **Site URL:** https://www.homesfytestwebsite.com
   - **GTM Container ID:** Your actual GTM ID (GTM-XXXXXXX)
   - **Form Selector:** `form, .contact-form, #contact-form`
   - **Conversion Goal:** Lead Generation

### Step 3: Test the Integration

1. **Visit your microsite** `www.homesfytestwebsite.com`
2. **Perform some actions:**
   - Scroll down the page
   - Click buttons
   - Submit forms
   - Navigate between pages
3. **Check your dashboard** at `http://localhost:9000`
4. **Watch real-time updates** every 10 seconds

## 📊 What Gets Tracked

### Real-time Metrics:
- ✅ **Page Views** - Every time someone visits your site
- ✅ **Visitors** - Unique visitors to your site
- ✅ **Form Submissions** - When someone submits a form
- ✅ **Button Clicks** - CTA button interactions
- ✅ **Scroll Depth** - How far users scroll
- ✅ **Time on Page** - How long users stay
- ✅ **Conversions** - Lead generation events

### Dashboard Features:
- ✅ **Live Status** - Online/Offline monitoring
- ✅ **Response Time** - Site performance
- ✅ **Uptime** - Site availability
- ✅ **Conversion Rate** - Lead generation percentage
- ✅ **Real-time Updates** - Data updates every 10 seconds

## 🔧 Customization

### Track Custom Events

Add this to your microsite to track specific events:

```javascript
// Track when someone downloads a brochure
function downloadBrochure() {
    trackConversion({
        type: 'download',
        value: 25,
        goal: 'Brochure Download'
    });
}

// Track when someone requests a quote
function requestQuote() {
    trackConversion({
        type: 'quote_request',
        value: 100,
        goal: 'Quote Request'
    });
}

// Track when someone schedules a visit
function scheduleVisit() {
    trackConversion({
        type: 'visit_scheduled',
        value: 50,
        goal: 'Visit Scheduled'
    });
}
```

### Track Form Submissions

Add this to your forms:

```html
<form onsubmit="trackConversion({type: 'lead', value: 50})">
    <!-- Your form fields -->
    <button type="submit">Submit</button>
</form>
```

## 🚀 Production Deployment

### For Production Use:

1. **Update the dashboard URL** in the tracking code:
   ```javascript
   const DASHBOARD_CONFIG = {
       gtmId: 'GTM-XXXXXXX',
       siteName: 'Homesfy Test Website',
       dashboardUrl: 'https://yourusername.github.io/live-analytics', // Your deployed dashboard
       siteUrl: 'https://www.homesfytestwebsite.com'
   };
   ```

2. **Deploy your dashboard** to GitHub Pages (follow DEPLOYMENT_GUIDE.md)

3. **Update the dashboard URL** in your microsite tracking code

## 📈 Expected Results

After integration, you should see:

- ✅ **Real visitor counts** from your actual website
- ✅ **Live form submissions** when people contact you
- ✅ **Real-time button clicks** on your CTAs
- ✅ **Actual conversion rates** based on your traffic
- ✅ **Live website status** monitoring
- ✅ **Real performance metrics** from your site

## 🛠️ Troubleshooting

### If tracking isn't working:

1. **Check browser console** for errors
2. **Verify dashboard URL** is correct
3. **Test with local dashboard** first
4. **Check CORS settings** if needed
5. **Verify GTM ID** is correct

### Debug Mode:

Add this to your browser console on your microsite:
```javascript
console.log('Tracking data:', getTrackingData());
```

## 📞 Support

If you need help:

1. Check the browser console for errors
2. Verify all configuration steps
3. Test with the local dashboard first
4. Check that your microsite is accessible

---

**🎉 Your Homesfy Test Website will now send real-time data to your Live Analytics Dashboard!**
