const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Data storage
let trackingData = [];

// Site counts - server-side counting (dynamically handles multiple sites)
let siteCounts = {};

// PERSISTENT STORAGE FUNCTIONS
const DATA_FILE = path.join(__dirname, 'data', 'siteCounts.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Load existing data on server start
function loadPersistentData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            siteCounts = JSON.parse(data);
            console.log('📊 Loaded persistent data:', Object.keys(siteCounts).length, 'sites');
        } else {
            console.log('📊 No existing data found, starting fresh');
        }
    } catch (error) {
        console.error('❌ Error loading persistent data:', error);
        siteCounts = {};
    }
}

// Save data to file
function savePersistentData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(siteCounts, null, 2));
        console.log('💾 Saved persistent data');
    } catch (error) {
        console.error('❌ Error saving persistent data:', error);
    }
}

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
        savePersistentData(); // Save immediately when new site is added
    }
}

// Load persistent data on startup
loadPersistentData();

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
                    
                    // Save data after each update
                    savePersistentData();
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

    // Enhanced status checking endpoints
    if (pathname === '/api/check-status' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const url = data.url;
                
                console.log('🔍 Server-side status check for:', url);
                
                // Use Node.js to check the URL
                const https = require('https');
                const http = require('http');
                const { URL } = require('url');
                
                const urlObj = new URL(url);
                const client = urlObj.protocol === 'https:' ? https : http;
                
                const startTime = Date.now();
                
                const request = client.request({
                    hostname: urlObj.hostname,
                    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                    path: urlObj.pathname + urlObj.search,
                    method: 'HEAD',
                    timeout: 5000
                }, (response) => {
                    const responseTime = Date.now() - startTime;
                    
                    let status = 'offline';
                    let uptime = 0;
                    
                    if (response.statusCode >= 200 && response.statusCode < 400) {
                        status = 'online';
                        uptime = 99.9;
                    } else if (response.statusCode >= 400 && response.statusCode < 500) {
                        status = 'warning';
                        uptime = 95.0;
                    }
                    
                    console.log(`✅ Server check result: ${status} (${response.statusCode}) in ${responseTime}ms`);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: status,
                        responseTime: responseTime,
                        uptime: uptime,
                        httpStatus: response.statusCode,
                        method: 'server'
                    }));
                });
                
                request.on('error', (error) => {
                    console.error('❌ Server check failed:', error.message);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'offline',
                        responseTime: 0,
                        uptime: 0,
                        error: error.message,
                        method: 'server'
                    }));
                });
                
                request.on('timeout', () => {
                    console.error('⏰ Server check timeout');
                    request.destroy();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'offline',
                        responseTime: 5000,
                        uptime: 0,
                        error: 'timeout',
                        method: 'server'
                    }));
                });
                
                request.end();
                
            } catch (error) {
                console.error('❌ Server status check error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
        return;
    }

    if (pathname === '/api/check-forms' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const url = data.url;
                
                console.log('🔍 Server-side form check for:', url);
                
                // Use Node.js to fetch and analyze HTML
                const https = require('https');
                const http = require('http');
                const { URL } = require('url');
                
                const urlObj = new URL(url);
                const client = urlObj.protocol === 'https:' ? https : http;
                
                const request = client.request({
                    hostname: urlObj.hostname,
                    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                    path: urlObj.pathname + urlObj.search,
                    method: 'GET',
                    timeout: 10000
                }, (response) => {
                    let html = '';
                    
                    response.on('data', (chunk) => {
                        html += chunk;
                    });
                    
                    response.on('end', () => {
                        // Analyze HTML for form elements
                        const hasForms = html.includes('<form') || html.includes('form-') || html.includes('contact-form');
                        const hasSubmitButtons = html.includes('type="submit"') || html.includes('submit') || html.includes('button');
                        const hasInputs = html.includes('<input') || html.includes('input-') || html.includes('name=');
                        const hasTextareas = html.includes('<textarea') || html.includes('textarea');
                        const hasContactForm = html.includes('contact') || html.includes('enquiry') || html.includes('lead');
                        const hasEmailInput = html.includes('type="email"') || html.includes('email');
                        const hasPhoneInput = html.includes('type="tel"') || html.includes('phone') || html.includes('mobile');
                        
                        let formStatus = 'error';
                        
                        if (hasForms && hasSubmitButtons && (hasInputs || hasTextareas)) {
                            if (hasContactForm && (hasEmailInput || hasPhoneInput)) {
                                formStatus = 'working';
                            } else {
                                formStatus = 'warning';
                            }
                        } else if (hasForms || hasSubmitButtons || hasInputs) {
                            formStatus = 'warning';
                        }
                        
                        console.log(`✅ Form check result: ${formStatus}`);
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            formStatus: formStatus,
                            analysis: {
                                hasForms, hasSubmitButtons, hasInputs, hasTextareas,
                                hasContactForm, hasEmailInput, hasPhoneInput
                            },
                            method: 'server'
                        }));
                    });
                });
                
                request.on('error', (error) => {
                    console.error('❌ Server form check failed:', error.message);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        formStatus: 'error',
                        error: error.message,
                        method: 'server'
                    }));
                });
                
                request.end();
                
            } catch (error) {
                console.error('❌ Server form check error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
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
    console.log(`💾 Persistent data file: ${DATA_FILE}`);
});
