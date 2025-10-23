/**
 * API endpoint for receiving tracking data from microsites
 * This would typically be a server-side endpoint, but for GitHub Pages
 * we'll simulate it with client-side storage
 */

class TrackingAPI {
    constructor() {
        this.storageKey = 'tracking_data';
        this.init();
    }

    init() {
        // Listen for tracking data from microsites
        window.addEventListener('message', (event) => {
            if (event.data && event.data.event && event.data.event.startsWith('gtm.')) {
                this.handleTrackingData(event.data);
            }
        });

        // Also listen for fetch requests (simulated)
        this.setupFetchListener();
    }

    setupFetchListener() {
        // Override fetch to handle tracking requests
        const originalFetch = window.fetch;
        window.fetch = async (url, options) => {
            if (url.includes('/api/track') && options && options.method === 'POST') {
                try {
                    const data = JSON.parse(options.body);
                    this.handleTrackingData(data);
                    return new Response(JSON.stringify({ success: true }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                } catch (error) {
                    return new Response(JSON.stringify({ error: 'Invalid data' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
            return originalFetch(url, options);
        };
    }

    handleTrackingData(data) {
        console.log('Received tracking data:', data);
        
        // Store tracking data
        this.storeTrackingData(data);
        
        // Update dashboard if tracker is available
        if (window.tracker) {
            this.updateTrackerWithData(data);
        }
    }

    storeTrackingData(data) {
        const existingData = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        existingData.push({
            ...data,
            receivedAt: Date.now()
        });
        
        // Keep only last 1000 entries to prevent storage bloat
        if (existingData.length > 1000) {
            existingData.splice(0, existingData.length - 1000);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(existingData));
    }

    updateTrackerWithData(data) {
        const site = window.tracker.microsites.find(s => s.gtmId === data.gtmId);
        if (!site) return;

        switch (data.event) {
            case 'gtm.pageView':
                site.visitors += 1;
                site.lastActivity = 'Just now';
                break;
                
            case 'gtm.formSubmit':
                site.leads += 1;
                site.conversion = ((site.leads / site.visitors) * 100).toFixed(1);
                site.lastActivity = 'Just now';
                break;
                
            case 'gtm.conversion':
                site.leads += 1;
                site.conversion = ((site.leads / site.visitors) * 100).toFixed(1);
                site.lastActivity = 'Just now';
                break;
                
            case 'gtm.buttonClick':
                // Track engagement
                site.lastActivity = 'Just now';
                break;
                
            case 'gtm.scrollDepth':
                // Track engagement
                site.lastActivity = 'Just now';
                break;
        }

        // Update analytics
        window.tracker.updateAnalytics();
        window.tracker.updateDashboard();
    }

    getTrackingData(gtmId = null) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        if (gtmId) {
            return data.filter(item => item.gtmId === gtmId);
        }
        return data;
    }

    getAnalyticsSummary() {
        const data = this.getTrackingData();
        const summary = {
            totalEvents: data.length,
            pageViews: data.filter(item => item.event === 'gtm.pageView').length,
            formSubmissions: data.filter(item => item.event === 'gtm.formSubmit').length,
            conversions: data.filter(item => item.event === 'gtm.conversion').length,
            buttonClicks: data.filter(item => item.event === 'gtm.buttonClick').length,
            scrollEvents: data.filter(item => item.event === 'gtm.scrollDepth').length
        };
        
        return summary;
    }

    clearTrackingData() {
        localStorage.removeItem(this.storageKey);
    }
}

// Initialize tracking API
const trackingAPI = new TrackingAPI();

// Export for use in other files
window.TrackingAPI = TrackingAPI;
window.trackingAPI = trackingAPI;
