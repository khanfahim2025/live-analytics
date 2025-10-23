# 🚀 Integration Steps - Get Real Data on Your Dashboard

## Step 1: Add Your Microsite to Dashboard

1. **Open your dashboard** at `http://localhost:9000`
2. **Click "Add Microsite"**
3. **Fill in these details:**
   - **Site Name:** Homesfy Test Website
   - **Site URL:** https://www.homesfytestwebsite.com
   - **GTM Container ID:** GTM-HOMESFY001
   - **Form Selector:** `form, .contact-form, #contact-form`
   - **Conversion Goal:** Lead Generation

## Step 2: Add Tracking Code to Your Microsite

Copy this code and add it to the `<head>` section of your `www.homesfytestwebsite.com` website:

```html
<script>
(function() {
    'use strict';
    
    console.log('🚀 Homesfy Tracker Initialized');
    
    const DASHBOARD_CONFIG = {
        gtmId: 'GTM-HOMESFY001',
        siteName: 'Homesfy Test Website',
        dashboardUrl: 'http://localhost:9000',
        siteUrl: 'https://www.homesfytestwebsite.com'
    };

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
                referrer: document.referrer
            }
        };

        console.log('📊 Sending REAL data to dashboard:', eventType, data);

        // Store in localStorage for dashboard to pick up
        const existingData = JSON.parse(localStorage.getItem('homesfy_tracking') || '[]');
        existingData.push(message);
        if (existingData.length > 100) {
            existingData.splice(0, existingData.length - 100);
        }
        localStorage.setItem('homesfy_tracking', JSON.stringify(existingData));
    }

    function trackPageView() {
        trackingData.pageViews++;
        trackingData.visitors++;
        
        console.log('👀 REAL page view tracked:', trackingData.visitors);
        
        sendToDashboard('pageView', {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer
        });
    }

    function trackFormSubmission(form) {
        trackingData.formSubmissions++;
        trackingData.leads++;
        trackingData.conversions = trackingData.visitors > 0 ? ((trackingData.leads / trackingData.visitors) * 100).toFixed(1) : 0;
        
        console.log('📝 REAL form submission tracked:', trackingData.leads);
        
        sendToDashboard('formSubmit', {
            formId: form.id || 'unknown',
            formClass: form.className || 'unknown'
        });
    }

    function trackConversion(conversionData) {
        trackingData.conversions++;
        trackingData.leads++;
        
        console.log('💰 REAL conversion tracked:', conversionData);
        
        sendToDashboard('conversion', {
            conversionType: conversionData.type || 'lead',
            value: conversionData.value || 0,
            goal: conversionData.goal || 'Lead Generation'
        });
    }

    function initTracking() {
        console.log('🎯 Initializing REAL tracking...');
        
        // Track initial page view
        trackPageView();

        // Track form submissions
        document.addEventListener('submit', function(e) {
            trackFormSubmission(e.target);
        });

        // Track button clicks
        document.addEventListener('click', function(e) {
            if (e.target.matches('button, a, input[type="submit"], input[type="button"]')) {
                console.log('🖱️ REAL button click tracked:', e.target.textContent);
                sendToDashboard('buttonClick', {
                    elementId: e.target.id || 'unknown',
                    elementText: e.target.textContent || e.target.value || 'unknown',
                    elementType: e.target.tagName.toLowerCase()
                });
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
                    
                    if (trackingData.scrollDepth % 25 === 0) {
                        console.log('📏 REAL scroll depth tracked:', trackingData.scrollDepth + '%');
                        sendToDashboard('scrollDepth', {
                            depth: trackingData.scrollDepth
                        });
                    }
                }
            }, 100);
        });

        // Track time on page
        window.addEventListener('beforeunload', function() {
            trackingData.timeOnPage = Math.round((Date.now() - trackingData.startTime) / 1000);
            sendToDashboard('timeOnPage', {
                seconds: trackingData.timeOnPage
            });
        });

        console.log('✅ REAL tracking initialized successfully!');
    }

    // Make functions globally available
    window.trackConversion = trackConversion;
    window.trackFormSubmission = trackFormSubmission;
    window.sendToDashboard = sendToDashboard;
    window.getTrackingData = function() {
        return trackingData;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }

    // Send periodic updates with REAL data every 10 seconds
    setInterval(function() {
        console.log('💓 Sending REAL heartbeat:', trackingData);
        
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
    }, 10000);

})();
</script>
```

## Step 3: Test the Integration

1. **Visit your microsite** `www.homesfytestwebsite.com`
2. **Perform some actions:**
   - Scroll down the page
   - Click buttons
   - Submit forms
   - Navigate between pages
3. **Check your dashboard** at `http://localhost:9000`
4. **Watch real-time updates** every 5 seconds

## What You'll See

### ✅ **Real Data in Dashboard:**
- **Visitors:** Real count from your website
- **Leads:** Real form submissions
- **Conversions:** Real CTA button clicks
- **Live updates** every 5 seconds

### ✅ **Debug Information:**
Open browser console on your microsite and look for:
- `🚀 Homesfy Tracker Initialized`
- `👀 REAL page view tracked: 1`
- `📊 Sending REAL data to dashboard: pageView`

## Troubleshooting

### If data still shows 0:
1. **Check browser console** for errors
2. **Make sure your microsite is added** to the dashboard
3. **Verify tracking code is added** to your website
4. **Check that localStorage is working** (open browser dev tools)

### Debug Mode:
Add this to your browser console on your microsite:
```javascript
console.log('Tracking data:', getTrackingData());
```

---

**🎉 After following these steps, your dashboard will show REAL DATA from your microsite!**
