/**
 * GTM Tracker for Live Analytics Dashboard
 * Handles multiple GTM containers and real-time tracking
 */

class GTMTracker {
    constructor() {
        this.microsites = [];
        this.analytics = {
            visitors: 0,
            leads: 0,
            conversions: 0,
            totalWebsites: 0,
            activeWebsites: 0,
            workingForms: 0
        };
        this.realTimeData = new Map();
        this.socket = null;
        this.init();
    }

    init() {
        this.loadMicrosites();
        this.setupRealTimeConnection();
        this.startPeriodicUpdates();
        this.setupGTMListeners();
    }

    // Load microsites from localStorage or default data
    loadMicrosites() {
        const saved = localStorage.getItem('microsites');
        if (saved) {
            this.microsites = JSON.parse(saved);
        } else {
            // Default microsites for demo
            this.microsites = [
                {
                    id: 1,
                    name: "L&T Green Reserve Noida",
                    url: "https://ltgreenreserve.com",
                    gtmId: "GTM-XXXXXXX",
                    status: "online",
                    visitors: 1247,
                    leads: 89,
                    conversion: 7.1,
                    lastActivity: "2 minutes ago",
                    formStatus: "working",
                    responseTime: 245,
                    uptime: 99.9
                },
                {
                    id: 2,
                    name: "TechCorp Solutions",
                    url: "https://techcorp.com",
                    gtmId: "GTM-YYYYYYY",
                    status: "online",
                    visitors: 892,
                    leads: 67,
                    conversion: 7.5,
                    lastActivity: "5 minutes ago",
                    formStatus: "working",
                    responseTime: 189,
                    uptime: 99.8
                },
                {
                    id: 3,
                    name: "Digital Marketing Pro",
                    url: "https://digitalmarketingpro.com",
                    gtmId: "GTM-ZZZZZZZ",
                    status: "warning",
                    visitors: 456,
                    leads: 23,
                    conversion: 5.0,
                    lastActivity: "1 hour ago",
                    formStatus: "warning",
                    responseTime: 1200,
                    uptime: 98.5
                }
            ];
            this.saveMicrosites();
        }
        this.updateAnalytics();
    }

    // Save microsites to localStorage
    saveMicrosites() {
        localStorage.setItem('microsites', JSON.stringify(this.microsites));
    }

    // Setup real-time connection (simulated for demo)
    setupRealTimeConnection() {
        // In a real implementation, this would connect to a WebSocket server
        console.log('Real-time connection established');
    }

    // Start periodic updates to simulate real-time data
    startPeriodicUpdates() {
        setInterval(() => {
            this.updateRealTimeData();
            this.checkWebsiteStatus();
            this.updateAnalytics();
            this.updateDashboard();
        }, 5000); // Update every 5 seconds
    }

    // Update real-time data
    updateRealTimeData() {
        this.microsites.forEach(site => {
            // Simulate visitor activity
            if (Math.random() > 0.7) {
                site.visitors += Math.floor(Math.random() * 3);
                site.lastActivity = "Just now";
            }

            // Simulate lead generation
            if (Math.random() > 0.9) {
                site.leads += 1;
                site.conversion = ((site.leads / site.visitors) * 100).toFixed(1);
                site.lastActivity = "Just now";
            }

            // Simulate response time changes
            site.responseTime = Math.floor(Math.random() * 200) + 100;

            // Simulate concurrent users
            site.concurrentUsers = Math.floor(Math.random() * 10) + 1;
        });
    }

    // Check website status
    checkWebsiteStatus() {
        this.microsites.forEach(site => {
            // Simulate status checks
            const random = Math.random();
            if (random > 0.95) {
                site.status = "offline";
                site.uptime = Math.max(95, site.uptime - 0.1);
            } else if (random > 0.9) {
                site.status = "warning";
                site.uptime = Math.max(97, site.uptime - 0.05);
            } else {
                site.status = "online";
                site.uptime = Math.min(99.9, site.uptime + 0.01);
            }

            // Check form status
            if (Math.random() > 0.98) {
                site.formStatus = "error";
            } else if (Math.random() > 0.95) {
                site.formStatus = "warning";
            } else {
                site.formStatus = "working";
            }
        });
    }

    // Update analytics totals
    updateAnalytics() {
        this.analytics.visitors = this.microsites.reduce((sum, site) => sum + site.visitors, 0);
        this.analytics.leads = this.microsites.reduce((sum, site) => sum + site.leads, 0);
        this.analytics.totalWebsites = this.microsites.length;
        this.analytics.activeWebsites = this.microsites.filter(site => site.status === 'online').length;
        this.analytics.workingForms = this.microsites.filter(site => site.formStatus === 'working').length;
        
        if (this.analytics.visitors > 0) {
            this.analytics.conversions = ((this.analytics.leads / this.analytics.visitors) * 100).toFixed(1);
        }
    }

    // Setup GTM listeners for form submissions and conversions
    setupGTMListeners() {
        // Listen for GTM events
        window.addEventListener('message', (event) => {
            if (event.data && event.data.event === 'gtm.formSubmit') {
                this.handleFormSubmission(event.data);
            }
            if (event.data && event.data.event === 'gtm.conversion') {
                this.handleConversion(event.data);
            }
        });

        // Listen for form submissions on all microsites
        this.microsites.forEach(site => {
            this.setupFormTracking(site);
        });
    }

    // Setup form tracking for a specific microsite
    setupFormTracking(site) {
        // This would be implemented to track forms on the actual microsites
        // For demo purposes, we'll simulate form tracking
        console.log(`Setting up form tracking for ${site.name}`);
    }

    // Handle form submission
    handleFormSubmission(data) {
        const site = this.microsites.find(s => s.gtmId === data.gtmId);
        if (site) {
            site.leads += 1;
            site.conversion = ((site.leads / site.visitors) * 100).toFixed(1);
            site.lastActivity = "Just now";
            this.updateAnalytics();
            this.updateDashboard();
        }
    }

    // Handle conversion
    handleConversion(data) {
        const site = this.microsites.find(s => s.gtmId === data.gtmId);
        if (site) {
            site.leads += 1;
            site.conversion = ((site.leads / site.visitors) * 100).toFixed(1);
            this.updateAnalytics();
            this.updateDashboard();
        }
    }

    // Add new microsite
    addMicrosite(siteData) {
        const newSite = {
            id: Date.now(),
            name: siteData.siteName,
            url: siteData.siteUrl,
            gtmId: siteData.gtmId,
            status: "online",
            visitors: 0,
            leads: 0,
            conversion: 0,
            lastActivity: "Just added",
            formStatus: "working",
            responseTime: 0,
            uptime: 100,
            concurrentUsers: 0,
            formSelector: siteData.formSelector || '',
            conversionGoal: siteData.conversionGoal || 'Lead Generation'
        };
        
        this.microsites.push(newSite);
        this.saveMicrosites();
        this.updateAnalytics();
        this.updateDashboard();
        this.setupFormTracking(newSite);
    }

    // Remove microsite
    removeMicrosite(siteId) {
        this.microsites = this.microsites.filter(site => site.id !== siteId);
        this.saveMicrosites();
        this.updateAnalytics();
        this.updateDashboard();
    }

    // Update dashboard display
    updateDashboard() {
        // Update metric cards
        document.getElementById('totalVisitors').textContent = this.analytics.visitors.toLocaleString();
        document.getElementById('totalLeads').textContent = this.analytics.leads.toLocaleString();
        document.getElementById('conversionRate').textContent = this.analytics.conversions + '%';
        document.getElementById('totalWebsites').textContent = this.analytics.totalWebsites;
        document.getElementById('activeWebsites').textContent = this.analytics.activeWebsites + ' Active';
        document.getElementById('workingForms').textContent = this.analytics.workingForms;
        document.getElementById('formStatus').textContent = this.analytics.workingForms === this.analytics.totalWebsites ? 'All Working' : 'Some Issues';

        // Update performance table
        this.updatePerformanceTable();
        
        // Update website status grid
        this.updateWebsiteStatusGrid();
        
        // Update performance metrics
        this.updatePerformanceMetrics();
    }

    // Update performance table
    updatePerformanceTable() {
        const tbody = document.getElementById('performanceTableBody');
        tbody.innerHTML = '';

        this.microsites.forEach((site, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div style="font-weight: 600;">${site.name}</div>
                    <div style="font-size: 0.75rem; color: #718096;">${site.url}</div>
                </td>
                <td>${site.visitors.toLocaleString()}</td>
                <td>${site.leads.toLocaleString()}</td>
                <td>${site.conversion}%</td>
                <td>
                    <span class="status-${site.status}">
                        ${site.status === 'online' ? '🟢 ONLINE' : 
                          site.status === 'warning' ? '🟡 WARNING' : '🔴 OFFLINE'}
                    </span>
                </td>
                <td>
                    <span class="status-${site.formStatus}">
                        ${site.formStatus === 'working' ? '✅ Working' : 
                          site.formStatus === 'warning' ? '⚠️ Warning' : '❌ Error'}
                    </span>
                </td>
                <td>${site.lastActivity}</td>
                <td>
                    <button onclick="tracker.editMicrosite(${site.id})" style="margin-right: 8px; padding: 4px 8px; background: #4299e1; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>
                    <button onclick="tracker.removeMicrosite(${site.id})" style="padding: 4px 8px; background: #f56565; color: white; border: none; border-radius: 4px; cursor: pointer;">Remove</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Update website status grid
    updateWebsiteStatusGrid() {
        const grid = document.getElementById('websiteStatusGrid');
        grid.innerHTML = '';

        this.microsites.forEach(site => {
            const card = document.createElement('div');
            card.className = `website-status-card ${site.status}`;
            card.innerHTML = `
                <div class="website-name">${site.name}</div>
                <div class="website-status">
                    <span class="status-${site.status}">
                        ${site.status === 'online' ? '🟢 ONLINE' : 
                          site.status === 'warning' ? '🟡 WARNING' : '🔴 OFFLINE'}
                    </span>
                </div>
                <div class="website-metrics">
                    Response: ${site.responseTime}ms | Uptime: ${site.uptime}%<br>
                    Visitors: ${site.visitors.toLocaleString()} | Leads: ${site.leads.toLocaleString()}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Update performance metrics
    updatePerformanceMetrics() {
        const avgResponseTime = this.microsites.reduce((sum, site) => sum + site.responseTime, 0) / this.microsites.length;
        const avgUptime = this.microsites.reduce((sum, site) => sum + site.uptime, 0) / this.microsites.length;
        const totalConcurrentUsers = this.microsites.reduce((sum, site) => sum + site.concurrentUsers, 0);
        const avgPageLoadSpeed = Math.floor(Math.random() * 500) + 800; // Simulated

        document.getElementById('responseTime').textContent = Math.round(avgResponseTime) + 'ms';
        document.getElementById('uptime').textContent = avgUptime.toFixed(1) + '%';
        document.getElementById('concurrentUsers').textContent = totalConcurrentUsers;
        document.getElementById('pageLoadSpeed').textContent = (avgPageLoadSpeed / 1000).toFixed(1) + 's';
    }

    // Edit microsite
    editMicrosite(siteId) {
        const site = this.microsites.find(s => s.id === siteId);
        if (site) {
            // Fill form with existing data
            document.getElementById('siteName').value = site.name;
            document.getElementById('siteUrl').value = site.url;
            document.getElementById('gtmId').value = site.gtmId;
            document.getElementById('formSelector').value = site.formSelector || '';
            document.getElementById('conversionGoal').value = site.conversionGoal || '';
            
            // Show modal
            document.getElementById('addMicrositeModal').style.display = 'block';
            
            // Store current site ID for updating
            document.getElementById('addMicrositeModal').dataset.siteId = siteId;
        }
    }

    // Get analytics data for charts
    getAnalyticsData() {
        return {
            visitors: this.analytics.visitors,
            leads: this.analytics.leads,
            conversions: this.analytics.conversions,
            totalWebsites: this.analytics.totalWebsites,
            activeWebsites: this.analytics.activeWebsites,
            workingForms: this.analytics.workingForms,
            microsites: this.microsites
        };
    }
}

// Initialize tracker
const tracker = new GTMTracker();

// Export for use in other files
window.GTMTracker = GTMTracker;
window.tracker = tracker;
