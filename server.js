const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Data storage
let trackingData = [];

// Site counts - server-side counting (dynamically handles multiple sites)
let siteCounts = {};

// Function to initialize a new site if it doesn't exist
function initializeSite(gtmId, siteName, siteUrl) {
    if (!siteCounts[gtmId]) {
        siteCounts[gtmId] = {
            siteName: siteName,
            siteUrl: siteUrl,
            visitors: 0,
            leads: 0,
            conversions: 0,
            pageViews: 0,
            formSubmissions: 0,
            buttonClicks: 0,
            conversionRate: '0.0',
            lastUpdated: new Date().toISOString()
        };
        console.log('🆕 Initialized new site:', siteName, 'with GTM ID:', gtmId);
    }
}

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API endpoints
    if (pathname === '/api/receive' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                trackingData.push({
                    timestamp: new Date().toISOString(),
                    data: data
                });
                
                // Keep only last 1000 entries
                if (trackingData.length > 1000) {
                    trackingData = trackingData.slice(-1000);
                }
                
                // Count events on server side
                const gtmId = data.gtmId;
                
                // Initialize site if it doesn't exist
                initializeSite(gtmId, data.siteName, data.siteUrl);
                
                if (siteCounts[gtmId]) {
                    switch (data.event) {
                        case 'gtm.pageView':
                            siteCounts[gtmId].visitors++;
                            siteCounts[gtmId].pageViews++;
                            break;
                        case 'gtm.formSubmit':
                            // Only count formSubmit as lead
                            siteCounts[gtmId].leads++;
                            siteCounts[gtmId].formSubmissions++;
                            break;
                        case 'gtm.conversion':
                            // Only count conversion if it's NOT from a form submit
                            // Skip if this conversion has form-related data or isFormSubmission flag
                            if (!data.data.formId && !data.data.formClass && !data.data.formType && !data.data.isFormSubmission) {
                                siteCounts[gtmId].leads++;
                                siteCounts[gtmId].conversions++;
                                console.log('✅ Conversion counted - standalone conversion');
                            } else {
                                console.log('🚫 Skipping conversion - appears to be from form submit');
                            }
                            break;
                        case 'gtm.buttonClick':
                            siteCounts[gtmId].buttonClicks++;
                            break;
                    }
                    
                    // Update conversion rate
                    if (siteCounts[gtmId].visitors > 0) {
                        siteCounts[gtmId].conversionRate = ((siteCounts[gtmId].leads / siteCounts[gtmId].visitors) * 100).toFixed(1);
                    }
                    
                    siteCounts[gtmId].lastUpdated = new Date().toISOString();
                    
                    console.log('📊 Updated counts for', data.siteName, ':', {
                        visitors: siteCounts[gtmId].visitors,
                        leads: siteCounts[gtmId].leads,
                        conversionRate: siteCounts[gtmId].conversionRate
                    });
                }
                
                console.log('📊 Received tracking data:', data.event, data.siteName);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', message: 'Data received' }));
            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    if (pathname === '/api/data.json' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(trackingData));
        return;
    }

    if (pathname === '/api/counts.json' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(siteCounts));
        return;
    }

    // Serve static files
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);
    
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API endpoint: /api/receive`);
    console.log(`📊 Data endpoint: /api/data.json`);
    console.log(`📊 Counts endpoint: /api/counts.json`);
});
