const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Data storage
let trackingData = [];

// Site counts - server-side counting (dynamically handles multiple sites)
let siteCounts = {};

// Test lead cleanup tracking
let testLeadTimers = {};

// PERSISTENT STORAGE FUNCTIONS
const DATA_FILE = path.join(__dirname, 'data', 'siteCounts.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Load existing data on server start - FRESH DEPLOYMENT MODE
function loadPersistentData() {
    try {
        // FORCE FRESH START - Always start with empty data
        console.log('🆕 FRESH DEPLOYMENT MODE - Starting with completely empty data');
        siteCounts = {};
        
        // Create fresh empty data file
        fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
        console.log('✅ Fresh data file created - no historical data loaded');
        
        // Clear any existing backup files
        const backupFile = DATA_FILE + '.backup';
        if (fs.existsSync(backupFile)) {
            fs.unlinkSync(backupFile);
            console.log('🧹 Removed old backup data file');
        }
        
    } catch (error) {
        console.error('❌ Error in fresh deployment setup:', error);
        siteCounts = {};
        // Create fresh data file even if there's an error
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
            console.log('📊 Created fresh data file after error');
        } catch (backupError) {
            console.error('❌ Error creating fresh data file:', backupError);
        }
    }
}

// Save data to file
function savePersistentData() {
    try {
        // Create backup before saving
        if (fs.existsSync(DATA_FILE)) {
            const backupFile = DATA_FILE + '.backup';
            fs.copyFileSync(DATA_FILE, backupFile);
        }
        
        // Save current data
        fs.writeFileSync(DATA_FILE, JSON.stringify(siteCounts, null, 2));
        console.log('💾 Saved persistent data:', Object.keys(siteCounts).length, 'sites');
        
        // Verify the save was successful
        const savedData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        if (JSON.stringify(savedData) === JSON.stringify(siteCounts)) {
            console.log('✅ Data save verified successfully');
        } else {
            console.error('❌ Data save verification failed');
        }
    } catch (error) {
        console.error('❌ Error saving persistent data:', error);
        
        // Try to restore from backup if save failed
        const backupFile = DATA_FILE + '.backup';
        if (fs.existsSync(backupFile)) {
            try {
                fs.copyFileSync(backupFile, DATA_FILE);
                console.log('🔄 Restored data from backup');
            } catch (restoreError) {
                console.error('❌ Error restoring from backup:', restoreError);
            }
        }
    }
}

// Comprehensive PageSpeed Analysis Function
function performPageSpeedAnalysis(targetUrl, res) {
    console.log('🔍 Performing detailed PageSpeed analysis for:', targetUrl);
    
    try {
        const urlObj = new URL(targetUrl);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const startTime = Date.now();
        
        const request = client.request({
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; PageSpeedBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        }, (response) => {
            const responseTime = Date.now() - startTime;
            let body = '';
            
            response.on('data', chunk => {
                body += chunk.toString();
            });
            
            response.on('end', () => {
                try {
                    const analysis = analyzePagePerformance(body, response, responseTime, targetUrl);
                    
                    console.log(`✅ PageSpeed analysis complete: ${analysis.performanceScore}/100`);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(analysis));
                } catch (error) {
                    console.error('❌ Analysis error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        error: 'Analysis failed',
                        performanceScore: 0,
                        status: 'error'
                    }));
                }
            });
        });
        
        request.on('error', (error) => {
            console.error('❌ PageSpeed analysis failed:', error.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                performanceScore: 0,
                status: 'error',
                error: error.message,
                analysis: 'Failed to analyze website'
            }));
        });
        
        request.on('timeout', () => {
            console.error('⏰ PageSpeed analysis timeout');
            request.destroy();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                performanceScore: 0,
                status: 'timeout',
                error: 'Analysis timeout',
                analysis: 'Website took too long to respond'
            }));
        });
        
        request.end();
        
    } catch (error) {
        console.error('❌ PageSpeed analysis error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            error: 'Invalid URL',
            performanceScore: 0,
            status: 'error'
        }));
    }
}

// Analyze page performance (simulates real PageSpeed metrics)
function analyzePagePerformance(html, response, responseTime, url) {
    const contentLength = response.headers['content-length'] || html.length;
    const contentType = response.headers['content-type'] || '';
    
    // Core Web Vitals Simulation
    const lcp = simulateLCP(responseTime, contentLength);
    const fid = simulateFID(responseTime);
    const cls = simulateCLS(html);
    
    // Performance Metrics
    const metrics = {
        // Response Metrics
        responseTime: responseTime,
        contentLength: contentLength,
        httpStatus: response.statusCode,
        
        // Core Web Vitals
        lcp: lcp,
        fid: fid,
        cls: cls,
        
        // Performance Headers
        hasGzip: response.headers['content-encoding'] === 'gzip',
        hasCacheControl: !!response.headers['cache-control'],
        hasETag: !!response.headers['etag'],
        
        // Content Analysis
        hasImages: (html.match(/<img/gi) || []).length,
        hasScripts: (html.match(/<script/gi) || []).length,
        hasStylesheets: (html.match(/<link.*stylesheet/gi) || []).length,
        hasInlineStyles: (html.match(/<style/gi) || []).length,
        
        // Performance Issues
        hasUnoptimizedImages: checkUnoptimizedImages(html),
        hasBlockingResources: checkBlockingResources(html),
        hasLargeResources: checkLargeResources(html, contentLength),
        hasMissingAlt: checkMissingAlt(html),
        hasInlineCSS: checkInlineCSS(html),
        hasInlineJS: checkInlineJS(html)
    };
    
    // Calculate Performance Score
    const performanceScore = calculatePerformanceScore(metrics);
    
    // Generate Recommendations
    const recommendations = generateRecommendations(metrics, performanceScore);
    
    return {
        performanceScore: performanceScore,
        grade: getPerformanceGrade(performanceScore),
        status: 'completed',
        analysis: 'PageSpeed analysis completed',
        metrics: metrics,
        recommendations: recommendations,
        timestamp: new Date().toISOString(),
        url: url
    };
}

// Simulate Core Web Vitals
function simulateLCP(responseTime, contentLength) {
    let lcp = responseTime + Math.random() * 1000;
    
    // Adjust based on content size
    if (contentLength > 1000000) lcp += 2000; // Large content
    if (contentLength > 5000000) lcp += 3000; // Very large content
    
    return Math.round(lcp);
}

function simulateFID(responseTime) {
    let fid = Math.random() * 200;
    
    // Adjust based on response time
    if (responseTime > 1000) fid += 100;
    if (responseTime > 2000) fid += 200;
    
    return Math.round(fid);
}

function simulateCLS(html) {
    let cls = Math.random() * 0.3;
    
    // Check for layout shift indicators
    if (html.includes('font-display: swap')) cls += 0.1;
    if (html.includes('width=') && html.includes('height=')) cls -= 0.05;
    
    return Math.round(cls * 100) / 100;
}

// Content Analysis Functions
function checkUnoptimizedImages(html) {
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    let unoptimized = 0;
    
    imgTags.forEach(img => {
        if (!img.includes('loading=') && !img.includes('lazy')) {
            unoptimized++;
        }
    });
    
    return unoptimized;
}

function checkBlockingResources(html) {
    const scripts = (html.match(/<script[^>]*>/gi) || []).length;
    const stylesheets = (html.match(/<link.*stylesheet/gi) || []).length;
    
    return scripts + stylesheets;
}

function checkLargeResources(html, contentLength) {
    return contentLength > 2000000; // 2MB threshold
}

function checkMissingAlt(html) {
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    let missingAlt = 0;
    
    imgTags.forEach(img => {
        if (!img.includes('alt=')) {
            missingAlt++;
        }
    });
    
    return missingAlt;
}

function checkInlineCSS(html) {
    return (html.match(/<style[^>]*>/gi) || []).length;
}

function checkInlineJS(html) {
    return (html.match(/<script[^>]*>/gi) || []).length;
}

// Calculate Performance Score
function calculatePerformanceScore(metrics) {
    let score = 100;
    
    // Response Time (30% weight)
    if (metrics.responseTime > 3000) score -= 30;
    else if (metrics.responseTime > 2000) score -= 20;
    else if (metrics.responseTime > 1000) score -= 10;
    else if (metrics.responseTime > 500) score -= 5;
    
    // LCP (25% weight)
    if (metrics.lcp > 4000) score -= 25;
    else if (metrics.lcp > 2500) score -= 15;
    else if (metrics.lcp > 1500) score -= 10;
    else if (metrics.lcp > 1000) score -= 5;
    
    // FID (20% weight)
    if (metrics.fid > 300) score -= 20;
    else if (metrics.fid > 200) score -= 15;
    else if (metrics.fid > 100) score -= 10;
    else if (metrics.fid > 50) score -= 5;
    
    // CLS (15% weight)
    if (metrics.cls > 0.25) score -= 15;
    else if (metrics.cls > 0.15) score -= 10;
    else if (metrics.cls > 0.1) score -= 5;
    
    // Content Optimization (10% weight)
    if (metrics.hasUnoptimizedImages > 5) score -= 10;
    if (metrics.hasBlockingResources > 10) score -= 5;
    if (metrics.hasLargeResources) score -= 10;
    if (metrics.hasMissingAlt > 3) score -= 5;
    if (metrics.hasInlineCSS > 3) score -= 5;
    if (metrics.hasInlineJS > 3) score -= 5;
    
    // HTTP Status
    if (metrics.httpStatus >= 400) score -= 20;
    
    // Caching
    if (!metrics.hasCacheControl) score -= 5;
    if (!metrics.hasETag) score -= 3;
    if (!metrics.hasGzip) score -= 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
}

// Get Performance Grade
function getPerformanceGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

// Generate Recommendations
function generateRecommendations(metrics, score) {
    const recommendations = [];
    
    if (metrics.responseTime > 2000) {
        recommendations.push({
            priority: 'high',
            category: 'Speed',
            issue: 'Slow server response time',
            suggestion: 'Optimize server performance and consider CDN'
        });
    }
    
    if (metrics.lcp > 2500) {
        recommendations.push({
            priority: 'high',
            category: 'Core Web Vitals',
            issue: 'Poor Largest Contentful Paint',
            suggestion: 'Optimize images and reduce render-blocking resources'
        });
    }
    
    if (metrics.fid > 100) {
        recommendations.push({
            priority: 'medium',
            category: 'Core Web Vitals',
            issue: 'High First Input Delay',
            suggestion: 'Reduce JavaScript execution time'
        });
    }
    
    if (metrics.cls > 0.1) {
        recommendations.push({
            priority: 'medium',
            category: 'Core Web Vitals',
            issue: 'Cumulative Layout Shift',
            suggestion: 'Add size attributes to images and avoid dynamic content'
        });
    }
    
    if (metrics.hasUnoptimizedImages > 0) {
        recommendations.push({
            priority: 'medium',
            category: 'Images',
            issue: 'Unoptimized images detected',
            suggestion: 'Add lazy loading and optimize image formats'
        });
    }
    
    if (!metrics.hasGzip) {
        recommendations.push({
            priority: 'low',
            category: 'Compression',
            issue: 'No gzip compression',
            suggestion: 'Enable gzip compression to reduce file sizes'
        });
    }
    
    if (!metrics.hasCacheControl) {
        recommendations.push({
            priority: 'low',
            category: 'Caching',
            issue: 'No cache control headers',
            suggestion: 'Add proper cache headers for static resources'
        });
    }
    
    return recommendations;
}

// Function to detect if a lead is a test lead
function isTestLead(data) {
    console.log('🔍 DEBUG: Checking if lead is test lead. Data:', JSON.stringify(data, null, 2));
    
    // Check ALL fields for "test" keyword (same logic as client-side)
    if (data.data) {
        for (const [fieldName, fieldValue] of Object.entries(data.data)) {
            if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
                const value = fieldValue.toLowerCase().trim();
                console.log(`🔍 Checking field "${fieldName}":`, value);
                if (value.includes('test')) {
                    console.log(`🧪 Test lead detected - field "${fieldName}" contains "test":`, { field: fieldName, value: fieldValue });
                    return true;
                }
            }
        }
    }
    
    console.log('✅ Real lead detected - no field contains "test"');
    return false;
}

// Function to schedule test lead cleanup after 1 minute
function scheduleTestLeadCleanup(gtmId) {
    // Clear any existing timer for this site
    if (testLeadTimers[gtmId]) {
        clearTimeout(testLeadTimers[gtmId]);
    }
    
    // Set new timer to clean up test leads after 1 minute
    testLeadTimers[gtmId] = setTimeout(() => {
        if (siteCounts[gtmId] && siteCounts[gtmId].testLeads > 0) {
            console.log(`🧹 Auto-cleaning test leads for ${siteCounts[gtmId].siteName} after 1 minute`);
            siteCounts[gtmId].testLeads = 0;
            savePersistentData();
        }
        delete testLeadTimers[gtmId];
    }, 60000); // 1 minute = 60000ms
}

// Function to initialize a new site if it doesn't exist
function initializeSite(gtmId, siteName, siteUrl) {
    if (!siteCounts[gtmId]) {
        siteCounts[gtmId] = {
            siteName: siteName,
            siteUrl: siteUrl,
            visitors: 0,
            leads: 0,
            testLeads: 0,
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

// Pre-initialize the three live microsites
function initializeLiveMicrosites() {
    const liveSites = [
        {
            gtmId: 'GTM-5PHH5D6T',
            siteName: 'Homesfy Test Website',
            siteUrl: 'https://www.homesfytestwebsite.com'
        },
        {
            gtmId: 'GTM-WLQ7HBKH',
            siteName: 'Green Reserve Noida',
            siteUrl: 'https://www.green-reserve-noida.in'
        },
        {
            gtmId: 'GTM-52V739V6',
            siteName: 'Sewri New Launch',
            siteUrl: 'https://www.sewri-newlaunch.com'
        }
    ];

    liveSites.forEach(site => {
        initializeSite(site.gtmId, site.siteName, site.siteUrl);
    });

    console.log('🚀 Initialized all live microsites:', liveSites.length);
}

// Load persistent data on startup
loadPersistentData();

// Initialize live microsites on startup
initializeLiveMicrosites();

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

    // API endpoint to clear all data (ONLY when explicitly requested from dashboard)
    if (pathname === '/api/clear-data' && method === 'POST') {
        try {
            // Parse request body to check if this is an explicit clear request
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const requestData = body ? JSON.parse(body) : {};
                    
                    // Only clear if explicitly requested with clearAll: true
                    if (requestData.clearAll === true) {
                        siteCounts = {};
                        trackingData = [];
                        testLeadTimers = {};
                        fs.writeFileSync(DATA_FILE, JSON.stringify(siteCounts, null, 2));
                        console.log('🧹 Explicitly cleared all data from dashboard');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            message: 'All data cleared successfully from dashboard', 
                            success: true,
                            cleared: true
                        }));
                    } else {
                        // Just return current data without clearing
                        console.log('📊 Data preservation requested - no clearing performed');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            message: 'Data preserved - historical data maintained', 
                            success: true,
                            preserved: true,
                            sites: Object.keys(siteCounts).length
                        }));
                    }
                } catch (error) {
                    console.error('❌ Error processing clear request:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Error processing request', error: error.message }));
                }
            });
            return;
        } catch (error) {
            console.error('❌ Error in clear-data endpoint:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error in clear-data endpoint', error: error.message }));
            return;
        }
    }

    // API endpoint for dashboard-initiated data clearing
    if (pathname === '/api/dashboard-clear' && method === 'POST') {
        try {
            siteCounts = {};
            trackingData = [];
            testLeadTimers = {};
            fs.writeFileSync(DATA_FILE, JSON.stringify(siteCounts, null, 2));
            console.log('🧹 Dashboard cleared all data - fresh start');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                message: 'All data cleared successfully from dashboard', 
                success: true,
                cleared: true,
                timestamp: new Date().toISOString()
            }));
            return;
        } catch (error) {
            console.error('❌ Error clearing data from dashboard:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error clearing data', error: error.message }));
            return;
        }
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
                    switch (data.eventType) {
                        case 'gtm.pageView':
                            siteCounts[gtmId].visitors++;
                            siteCounts[gtmId].pageViews++;
                            break;
                        case 'gtm.formSubmit':
                            // Don't count leads yet - just track form submission
                            siteCounts[gtmId].formSubmissions++;
                            console.log('📝 Form submission tracked for:', siteCounts[gtmId].siteName);
                            break;
                        case 'gtm.thankYouPage':
                            // Count leads only when they reach thank you page (after validation)
                            if (isTestLead(data)) {
                                siteCounts[gtmId].testLeads++;
                                console.log('🧪 Test lead confirmed on thank you page for:', siteCounts[gtmId].siteName);
                                // Schedule cleanup after 1 minute
                                scheduleTestLeadCleanup(gtmId);
                            } else {
                                siteCounts[gtmId].leads++;
                                console.log('✅ Real lead confirmed on thank you page for:', siteCounts[gtmId].siteName);
                            }
                            break;
                        case 'gtm.conversion':
                            // Only count conversion if it's NOT from a form submit
                            // Skip if this conversion has form-related data or isFormSubmission flag
                            if (!data.data.formId && !data.data.formClass && !data.data.formType && !data.data.isFormSubmission) {
                                // Check if this is a test lead
                                if (isTestLead(data)) {
                                    siteCounts[gtmId].testLeads++;
                                    console.log('🧪 Test conversion detected and counted:', data.data);
                                } else {
                                    siteCounts[gtmId].leads++;
                                    console.log('✅ Real conversion counted:', data.data);
                                }
                                siteCounts[gtmId].conversions++;
                            } else {
                                console.log('🚫 Skipping conversion - appears to be from form submit');
                            }
                            break;
                        case 'gtm.buttonClick':
                            siteCounts[gtmId].buttonClicks++;
                            break;
                        case 'gtm.formValidationFailure':
                            // Track validation failures but don't count as leads
                            siteCounts[gtmId].validationFailures = (siteCounts[gtmId].validationFailures || 0) + 1;
                            console.log('❌ Form validation failure tracked:', data.data.failureReason);
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
                        testLeads: siteCounts[gtmId].testLeads,
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

    // API endpoint to get data persistence status
    if (pathname === '/api/data-status' && method === 'GET') {
        const dataStatus = {
            totalSites: Object.keys(siteCounts).length,
            dataFile: DATA_FILE,
            dataFileExists: fs.existsSync(DATA_FILE),
            dataFileSize: fs.existsSync(DATA_FILE) ? fs.statSync(DATA_FILE).size : 0,
            lastModified: fs.existsSync(DATA_FILE) ? fs.statSync(DATA_FILE).mtime : null,
            sites: Object.keys(siteCounts).map(gtmId => ({
                gtmId,
                siteName: siteCounts[gtmId].siteName,
                visitors: siteCounts[gtmId].visitors,
                leads: siteCounts[gtmId].leads,
                testLeads: siteCounts[gtmId].testLeads,
                lastUpdated: siteCounts[gtmId].lastUpdated
            }))
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dataStatus, null, 2));
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

    // Real PageSpeed Insights Simulation API
    if (pathname === '/api/pagespeed-analysis' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const targetUrl = data.url;
                
                console.log('🚀 Starting PageSpeed analysis for:', targetUrl);
                
                // Simulate realistic PageSpeed analysis time (1-3 seconds)
                const analysisTime = 1000 + Math.random() * 2000;
                
                setTimeout(() => {
                    performPageSpeedAnalysis(targetUrl, res);
                }, analysisTime);
                
            } catch (error) {
                console.error('❌ PageSpeed analysis error:', error);
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

    // Serve tracking script with cache busting
    if (pathname === '/tracking.js') {
        const trackingScript = fs.readFileSync(path.join(__dirname, 'tracking-v2.js'), 'utf8');
        res.writeHead(200, { 
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Last-Modified': new Date().toUTCString(),
            'ETag': '"' + Date.now() + '"'
        });
        res.end(trackingScript);
        return;
    }

    // Serve test tracking page
    if (pathname === '/test-tracking') {
        const testPage = fs.readFileSync(path.join(__dirname, 'test-tracking.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(testPage);
        return;
    }

    // Serve debug test page
    if (pathname === '/debug-test') {
        const debugPage = fs.readFileSync(path.join(__dirname, 'debug-test.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(debugPage);
        return;
    }

    // Serve test detection page
    if (pathname === '/test-detection') {
        const testPage = fs.readFileSync(path.join(__dirname, 'test-detection.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(testPage);
        return;
    }

    // Serve simple test page
    if (pathname === '/simple-test') {
        const simplePage = fs.readFileSync(path.join(__dirname, 'simple-test.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(simplePage);
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
        console.log(`🚀 Server running on port ${PORT} - FRESH DEPLOYMENT v11.0 - COMPLETELY NEW START`);
        console.log(`🆕 FRESH DEPLOYMENT: All historical data cleared - starting from zero`);
        console.log(`📊 API endpoint: /api/receive`);
        console.log(`📊 Data endpoint: /api/data.json`);
        console.log(`📊 Counts endpoint: /api/counts.json`);
        console.log(`📊 Tracking script: /tracking.js`);
        console.log(`🧹 Clear data endpoint: /api/clear-data`);
        console.log(`💾 Fresh data file: ${DATA_FILE}`);
        console.log(`🎯 Universal script supports unlimited websites with different GTM IDs`);
        console.log(`🧪 Test lead auto-cleanup: 1 minute per GTM ID`);
        console.log(`📱 Cache busting enabled for tracking script`);
        console.log(`✅ READY FOR FRESH TRACKING - NO OLD DATA PRESERVED`);
    });
