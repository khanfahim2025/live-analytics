#!/usr/bin/env node

/**
 * Script to update Railway URL in your files
 * Usage: node update-railway-url.js YOUR_RAILWAY_URL
 */

const fs = require('fs');
const path = require('path');

// Get Railway URL from command line
const railwayUrl = process.argv[2];

if (!railwayUrl) {
    console.log('❌ Please provide your Railway URL');
    console.log('Usage: node update-railway-url.js https://your-app.up.railway.app');
    process.exit(1);
}

// Validate URL format
if (!railwayUrl.startsWith('https://') || !railwayUrl.includes('.up.railway.app')) {
    console.log('❌ Invalid Railway URL format');
    console.log('Expected format: https://your-app.up.railway.app');
    process.exit(1);
}

console.log('🚀 Updating files with Railway URL:', railwayUrl);

// Files to update
const filesToUpdate = [
    {
        file: 'homesfy-tracker-fixed.js',
        search: 'https://your-railway-app.up.railway.app',
        replace: railwayUrl
    },
    {
        file: 'dashboard.js',
        search: 'https://your-railway-app.up.railway.app',
        replace: railwayUrl
    }
];

// Update files
filesToUpdate.forEach(({ file, search, replace }) => {
    try {
        const filePath = path.join(__dirname, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes(search)) {
            content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated ${file}`);
        } else {
            console.log(`⚠️  ${file} - URL placeholder not found`);
        }
    } catch (error) {
        console.log(`❌ Error updating ${file}:`, error.message);
    }
});

console.log('🎉 URL update complete!');
console.log('📝 Next steps:');
console.log('1. git add -A');
console.log('2. git commit -m "Update with Railway URL"');
console.log('3. git push origin main');
