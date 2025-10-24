# Live Analytics Setup Guide

## 🚀 Deployment Instructions

### 1. Deploy to Railway
Your analytics dashboard is already deployed at: `https://web-production-19751.up.railway.app`

### 2. Add Tracking Scripts to Your Microsites

#### For Homesfy Test Website (https://www.homesfytestwebsite.com)
Add this script to the `<head>` section:

```html
<script>
(function() {
    'use strict';
    
    const DASHBOARD_CONFIG = {
        gtmId: 'GTM-5PHH5D6T',
        siteName: 'Homesfy Test Website',
        dashboardUrl: 'https://web-production-19751.up.railway.app',
        siteUrl: 'https://www.homesfytestwebsite.com'
    };

    // Test lead detection keywords
    const TEST_KEYWORDS = ['test', 'demo', 'sample', 'example', 'fake', 'dummy'];
    
    // Initialize tracking
    function initTracking() {
        console.log('🚀 Homesfy Analytics Tracking Initialized');
        trackPageView();
        setupFormTracking();
        setupButtonTracking();
    }
    
    // Track page view
    function trackPageView() {
        const payload = {
            gtmId: DASHBOARD_CONFIG.gtmId,
            siteName: DASHBOARD_CONFIG.siteName,
            siteUrl: DASHBOARD_CONFIG.siteUrl,
            eventType: 'gtm.pageView',
            timestamp: Date.now(),
            url: window.location.href,
            referrer: document.referrer,
            sessionId: getSessionId(),
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            deviceType: getDeviceType(),
            userAgent: navigator.userAgent,
            data: {
                pageTitle: document.title,
                pagePath: window.location.pathname,
                pageSearch: window.location.search,
                pageHash: window.location.hash
            }
        };
        
        sendToDashboard(payload);
    }
    
    // Set up form tracking
    function setupFormTracking() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach((form, index) => {
            form.addEventListener('submit', function(event) {
                const formData = new FormData(form);
                const data = {};
                
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                
                const isTestLead = isTestSubmission(data);
                
                const payload = {
                    gtmId: DASHBOARD_CONFIG.gtmId,
                    siteName: DASHBOARD_CONFIG.siteName,
                    siteUrl: DASHBOARD_CONFIG.siteUrl,
                    eventType: 'gtm.formSubmit',
                    timestamp: Date.now(),
                    url: window.location.href,
                    referrer: document.referrer,
                    sessionId: getSessionId(),
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    deviceType: getDeviceType(),
                    userAgent: navigator.userAgent,
                    data: {
                        ...data,
                        formId: form.id || `form-${index}`,
                        formClass: form.className,
                        formType: 'contact',
                        isFormSubmission: true,
                        isTestLead: isTestLead
                    }
                };
                
                sendToDashboard(payload);
                
                if (isTestLead) {
                    showTestLeadFeedback();
                } else {
                    showRealLeadFeedback();
                }
            });
        });
    }
    
    // Set up button click tracking
    function setupButtonTracking() {
        const buttons = document.querySelectorAll('button[type="submit"], .btn-submit, .contact-btn, .enquiry-btn, .lead-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(event) {
                const payload = {
                    gtmId: DASHBOARD_CONFIG.gtmId,
                    siteName: DASHBOARD_CONFIG.siteName,
                    siteUrl: DASHBOARD_CONFIG.siteUrl,
                    eventType: 'gtm.buttonClick',
                    timestamp: Date.now(),
                    url: window.location.href,
                    referrer: document.referrer,
                    sessionId: getSessionId(),
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    deviceType: getDeviceType(),
                    userAgent: navigator.userAgent,
                    data: {
                        buttonText: button.textContent || button.innerText,
                        buttonId: button.id,
                        buttonClass: button.className,
                        buttonType: button.type
                    }
                };
                
                sendToDashboard(payload);
            });
        });
    }
    
    // Check if submission is a test lead
    function isTestSubmission(data) {
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                const lowerValue = value.toLowerCase();
                for (const keyword of TEST_KEYWORDS) {
                    if (lowerValue.includes(keyword)) {
                        console.log('🧪 Test lead detected:', { field: key, value: value, keyword: keyword });
                        return true;
                    }
                }
            }
        }
        
        if (data.email) {
            const email = data.email.toLowerCase();
            if (email.includes('test') || email.includes('demo') || email.includes('example') || 
                email.includes('@test.') || email.includes('@demo.') || email.includes('@example.')) {
                console.log('🧪 Test email detected:', email);
                return true;
            }
        }
        
        if (data.phone) {
            const phone = data.phone.toString();
            if (phone.includes('1234567890') || phone.includes('0000000000') || 
                phone.includes('1111111111') || phone.includes('9999999999') ||
                phone.match(/^(\d)\1{9}$/)) {
                console.log('🧪 Test phone detected:', phone);
                return true;
            }
        }
        
        return false;
    }
    
    // Send data to dashboard
    function sendToDashboard(payload) {
        fetch(`${DASHBOARD_CONFIG.dashboardUrl}/api/receive`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(result => {
            console.log('📊 Homesfy data sent to dashboard:', result);
        })
        .catch(error => {
            console.error('❌ Error sending Homesfy data:', error);
        });
    }
    
    // Get session ID
    function getSessionId() {
        let sessionId = sessionStorage.getItem('homesfyAnalyticsSessionId');
        if (!sessionId) {
            sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('homesfyAnalyticsSessionId', sessionId);
        }
        return sessionId;
    }
    
    // Get device type
    function getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            return 'mobile';
        } else if (/iPad/i.test(userAgent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }
    
    // Show test lead feedback
    function showTestLeadFeedback() {
        const feedback = document.createElement('div');
        feedback.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #ff6b6b; color: white; padding: 15px; border-radius: 8px; z-index: 10000; font-family: Arial, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <strong>🧪 Test Lead Submitted!</strong><br>
                <small>This will disappear from dashboard after 1 minute</small>
            </div>
        `;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 5000);
    }
    
    // Show real lead feedback
    function showRealLeadFeedback() {
        const feedback = document.createElement('div');
        feedback.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px; border-radius: 8px; z-index: 10000; font-family: Arial, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <strong>✅ Lead Submitted Successfully!</strong><br>
                <small>Thank you for your interest in Homesfy</small>
            </div>
        `;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 5000);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }
    
})();
</script>
```

#### For Green Reserve Noida (https://www.green-reserve-noida.in)
Use the same script but change the configuration:

```javascript
const DASHBOARD_CONFIG = {
    gtmId: 'GTM-WLQ7HBKH',
    siteName: 'Green Reserve Noida',
    dashboardUrl: 'https://web-production-19751.up.railway.app',
    siteUrl: 'https://www.green-reserve-noida.in'
};
```

#### For Sewri New Launch (https://www.sewri-newlaunch.com)
Use the same script but change the configuration:

```javascript
const DASHBOARD_CONFIG = {
    gtmId: 'GTM-52V739V6',
    siteName: 'Sewri New Launch',
    dashboardUrl: 'https://web-production-19751.up.railway.app',
    siteUrl: 'https://www.sewri-newlaunch.com'
};
```

## 🧪 Test Lead vs Main Lead Logic

### Test Lead Detection
The system automatically detects test leads based on:

1. **Keywords in form fields**: 'test', 'demo', 'sample', 'example', 'fake', 'dummy'
2. **Email patterns**: test@example.com, demo@test.com, etc.
3. **Phone patterns**: 1234567890, 0000000000, 1111111111, etc.

### Test Lead Behavior
- ✅ Counted separately in "Test Leads" section
- ⏰ Auto-disappears after 1 minute
- 🧪 Shows test lead feedback to user
- 📊 Doesn't affect conversion rates

### Main Lead Behavior
- ✅ Counted in "Total Leads" section
- 🔄 Permanent tracking
- 📈 Affects conversion rates
- 💼 Real business metrics

## 📊 Dashboard Features

### Real-time Tracking
- Page views
- Form submissions
- Button clicks
- Device type detection
- Session tracking

### Lead Management
- Automatic test/main lead separation
- Test lead auto-cleanup (1 minute)
- Visual feedback for users
- Conversion rate calculations

### Multi-site Support
- Homesfy Test Website (GTM-5PHH5D6T)
- Green Reserve Noida (GTM-WLQ7HBKH)
- Sewri New Launch (GTM-52V739V6)

## 🔧 Testing

### Test Lead Submission
1. Use keywords like "test", "demo" in form fields
2. Use test email patterns like test@example.com
3. Use test phone numbers like 1234567890
4. Submit form - will show test lead feedback
5. Check dashboard - appears in "Test Leads" section
6. Wait 1 minute - test lead disappears automatically

### Main Lead Submission
1. Use real data in form fields
2. Use real email addresses
3. Use real phone numbers
4. Submit form - will show success feedback
5. Check dashboard - appears in "Total Leads" section
6. Lead remains permanently tracked

## 🚀 Deployment Checklist

- [ ] Deploy server.js to Railway
- [ ] Add tracking script to Homesfy website
- [ ] Add tracking script to Green Reserve website
- [ ] Add tracking script to Sewri website
- [ ] Test form submissions on each site
- [ ] Verify dashboard shows all three sites
- [ ] Test test/main lead separation
- [ ] Confirm test lead auto-cleanup works

## 📱 Dashboard URL
https://web-production-19751.up.railway.app

## 🎯 Expected Results

After setup, your dashboard should show:
1. **Three microsites** properly initialized
2. **Real-time tracking** of page views and form submissions
3. **Automatic lead separation** (test vs main)
4. **Test lead auto-cleanup** after 1 minute
5. **Accurate conversion rates** based on real leads only
