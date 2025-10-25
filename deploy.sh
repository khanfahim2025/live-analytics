#!/bin/bash

echo "🚀 Deploying Live Analytics - FRESH DEPLOYMENT v11.0"
echo "===================================================="

# FORCE FRESH DEPLOYMENT - Clear all data
echo "🧹 FORCING FRESH DEPLOYMENT - Clearing ALL existing data..."
rm -rf data/siteCounts.json
rm -rf data/siteCounts.json.backup
echo "{}" > data/siteCounts.json
echo "✅ All historical data cleared - starting completely fresh"

# Clear local cache
echo "🧹 Clearing local cache..."
rm -rf node_modules/.cache
rm -rf .cache

# Clear browser cache headers
echo "📱 Cache busting enabled for tracking script"

# Deploy to Railway
echo "🚀 Deploying FRESH to Railway..."
git add .
git commit -m "FRESH DEPLOY v11.0: Complete data reset - starting fresh with no historical data"
git push origin main

echo "✅ Deployment complete!"
echo "📊 Dashboard: https://web-production-19751.up.railway.app"
echo "📊 Tracking script: https://web-production-19751.up.railway.app/tracking.js"
echo "🧹 Clear data: https://web-production-19751.up.railway.app/api/dashboard-clear (from dashboard only)"

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
