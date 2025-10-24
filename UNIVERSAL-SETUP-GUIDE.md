# Universal Live Analytics Setup Guide

## 🚀 One Script for ALL Websites

This universal tracking script works for **any number of websites** with **different GTM IDs**. No need to create separate files!

## 📋 Quick Setup (3 Steps)

### Step 1: Add Script to Your Website
Add this to the `<head>` section of your website:

```html
<script src="https://web-production-19751.up.railway.app/tracking.js"></script>
<script>
window.LiveAnalyticsConfig = {
    gtmId: 'YOUR-GTM-ID-HERE',
    siteName: 'Your Website Name',
    siteUrl: 'https://your-website.com'
};
</script>
```

### Step 2: Replace Configuration
- `YOUR-GTM-ID-HERE` → Your actual GTM ID
- `Your Website Name` → Your website name
- `https://your-website.com` → Your website URL

### Step 3: Deploy and Test
- Deploy your website
- Submit test and real leads
- Check dashboard at: https://web-production-19751.up.railway.app

## 🎯 Real Examples

### Homesfy Test Website
```html
<script src="https://web-production-19751.up.railway.app/tracking.js"></script>
<script>
window.LiveAnalyticsConfig = {
    gtmId: 'GTM-5PHH5D6T',
    siteName: 'Homesfy Test Website',
    siteUrl: 'https://www.homesfytestwebsite.com'
};
</script>
```

### Green Reserve Noida
```html
<script src="https://web-production-19751.up.railway.app/tracking.js"></script>
<script>
window.LiveAnalyticsConfig = {
    gtmId: 'GTM-WLQ7HBKH',
    siteName: 'Green Reserve Noida',
    siteUrl: 'https://www.green-reserve-noida.in'
};
</script>
```

### Sewri New Launch
```html
<script src="https://web-production-19751.up.railway.app/tracking.js"></script>
<script>
window.LiveAnalyticsConfig = {
    gtmId: 'GTM-52V739V6',
    siteName: 'Sewri New Launch',
    siteUrl: 'https://www.sewri-newlaunch.com'
};
</script>
```

## 🧪 Test Lead vs Main Lead

### Test Lead Detection (Automatic)
The script automatically detects test leads based on:

**Keywords in form fields:**
- 'test', 'demo', 'sample', 'example', 'fake', 'dummy'

**Email patterns:**
- test@example.com, demo@test.com, etc.

**Phone patterns:**
- 1234567890, 0000000000, 1111111111, etc.

### Test Lead Behavior
- ✅ Counted separately in "Test Leads" section
- ⏰ Auto-disappears after 1 minute
- 🧪 Shows red notification to user
- 📊 Doesn't affect conversion rates

### Main Lead Behavior
- ✅ Counted in "Total Leads" section
- 🔄 Permanent tracking
- 📈 Affects conversion rates
- 💼 Real business metrics

## 📊 Dashboard Features

### Real-time Tracking
- **Page views** - Every page visit
- **Form submissions** - All form submissions
- **Button clicks** - Important button interactions
- **Device detection** - Mobile/tablet/desktop
- **Session tracking** - User session management

### Lead Management
- **Automatic separation** - Test vs main leads
- **Auto-cleanup** - Test leads disappear after 1 minute
- **Visual feedback** - User notifications
- **Conversion rates** - Based on real leads only

### Multi-site Support
- **Unlimited websites** - Add as many as needed
- **Independent tracking** - Each GTM ID tracked separately
- **Centralized dashboard** - All sites in one place

## 🔧 For 60-70 Websites

### Each website gets the same script:
```html
<script src="https://web-production-19751.up.railway.app/tracking.js"></script>
<script>
window.LiveAnalyticsConfig = {
    gtmId: 'GTM-UNIQUE-FOR-THIS-SITE',
    siteName: 'Website Name',
    siteUrl: 'https://website-url.com'
};
</script>
```

### Benefits:
- ✅ **One script** for all websites
- ✅ **Easy maintenance** - update once, affects all sites
- ✅ **Consistent functionality** across all sites
- ✅ **Smaller file size** per website
- ✅ **Version control** - update tracking logic centrally

## 🎯 Testing Guide

### Test Lead Testing
1. **Submit form with test data:**
   - Name: "test user"
   - Email: "test@example.com"
   - Phone: "1234567890"

2. **Expected behavior:**
   - Red notification: "🧪 Test Lead Submitted!"
   - Appears in "Test Leads" section
   - Disappears after 1 minute

### Main Lead Testing
1. **Submit form with real data:**
   - Name: "John Smith"
   - Email: "john.smith@gmail.com"
   - Phone: "9876543210"

2. **Expected behavior:**
   - Green notification: "✅ Lead Submitted Successfully!"
   - Appears in "Total Leads" section
   - Remains permanently tracked

## 📱 Dashboard URL
https://web-production-19751.up.railway.app

## 🚀 Deployment Checklist

- [ ] Add tracking script to website `<head>`
- [ ] Configure with correct GTM ID
- [ ] Configure with correct site name and URL
- [ ] Deploy website
- [ ] Test form submissions
- [ ] Verify dashboard shows website
- [ ] Test test/main lead separation
- [ ] Confirm test lead auto-cleanup

## 🎯 Expected Results

After setup, your dashboard should show:
1. **Your website** properly initialized
2. **Real-time tracking** of page views and form submissions
3. **Automatic lead separation** (test vs main)
4. **Test lead auto-cleanup** after 1 minute
5. **Accurate conversion rates** based on real leads only

## 🔧 Advanced Configuration

### Optional Configuration
```html
<script src="https://web-production-19751.up.railway.app/tracking.js"></script>
<script>
window.LiveAnalyticsConfig = {
    gtmId: 'GTM-XXXXXXX',
    siteName: 'Website Name',
    siteUrl: 'https://website-url.com',
    dashboardUrl: 'https://web-production-19751.up.railway.app' // Optional: custom dashboard URL
};
</script>
```

## 🆘 Troubleshooting

### Script Not Loading
- Check if Railway server is running
- Verify script URL is correct
- Check browser console for errors

### Data Not Appearing
- Verify GTM ID is correct
- Check if form submissions are working
- Verify dashboard URL is accessible

### Test Leads Not Detected
- Ensure form fields contain test keywords
- Check browser console for detection logs
- Verify test lead patterns are used

## 📞 Support

If you need help:
1. Check browser console for errors
2. Verify configuration is correct
3. Test with both test and real leads
4. Check dashboard for data updates

---

**🎉 That's it! One script works for all your websites with different GTM IDs!**
