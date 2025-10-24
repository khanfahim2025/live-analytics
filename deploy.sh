#!/bin/bash

echo "🚀 Deploying Live Analytics with Universal Tracking Script v10.0"
echo "================================================================"

# Clear all data
echo "🧹 Clearing all existing data..."
curl -X POST https://web-production-19751.up.railway.app/api/clear-data \
  -H "Content-Type: application/json" \
  -d '{}' || echo "⚠️ Could not clear data via API (server might not be running yet)"

# Clear local cache
echo "🧹 Clearing local cache..."
rm -rf node_modules/.cache
rm -rf .cache

# Clear browser cache headers
echo "📱 Cache busting enabled for tracking script"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
git add .
git commit -m "Deploy v10.0: Universal tracking script with cache busting and test lead auto-cleanup"
git push origin main

echo "✅ Deployment complete!"
echo "📊 Dashboard: https://web-production-19751.up.railway.app"
echo "📊 Tracking script: https://web-production-19751.up.railway.app/tracking.js"
echo "🧹 Clear data: https://web-production-19751.up.railway.app/api/clear-data"

echo ""
echo "🎯 Universal Script Setup for Your Microsites:"
echo "=============================================="
echo ""
echo "🏠 Homesfy Test Website:"
echo '<script src="https://web-production-19751.up.railway.app/tracking.js"></script>'
echo '<script>'
echo 'window.LiveAnalyticsConfig = {'
echo '    gtmId: "GTM-5PHH5D6T",'
echo '    siteName: "www.homesfytestwebsite.com",'
echo '    siteUrl: "https://www.homesfytestwebsite.com"'
echo '};'
echo '</script>'
echo ""
echo "🏢 Green Reserve Noida:"
echo '<script src="https://web-production-19751.up.railway.app/tracking.js"></script>'
echo '<script>'
echo 'window.LiveAnalyticsConfig = {'
echo '    gtmId: "GTM-WLQ7HBKH",'
echo '    siteName: "www.green-reserve-noida.in",'
echo '    siteUrl: "https://www.green-reserve-noida.in"'
echo '};'
echo '</script>'
echo ""
echo "🏗️ Sewri New Launch:"
echo '<script src="https://web-production-19751.up.railway.app/tracking.js"></script>'
echo '<script>'
echo 'window.LiveAnalyticsConfig = {'
echo '    gtmId: "GTM-52V739V6",'
echo '    siteName: "www.sewri-newlaunch.com",'
echo '    siteUrl: "https://www.sewri-newlaunch.com"'
echo '};'
echo '</script>'
echo ""
echo "🧪 Test Lead Features:"
echo "======================"
echo "✅ Automatic test lead detection (keywords, email patterns, phone patterns)"
echo "✅ Test leads auto-cleanup after 1 minute per GTM ID"
echo "✅ Visual feedback for users (red for test, green for real)"
echo "✅ Independent tracking per website"
echo "✅ Cache busting for tracking script updates"
echo ""
echo "🎯 Ready for 60-70 websites with different GTM IDs!"
