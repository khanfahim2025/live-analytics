/**
 * Dashboard JavaScript for Live Analytics
 * Handles UI interactions and chart rendering
 */

class Dashboard {
    constructor() {
        this.charts = {};
        this.currentPeriod = 'day';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDashboard();
        this.startRealTimeUpdates();
    }

    // Setup event listeners
    setupEventListeners() {
        // Time range buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = e.target.dataset.period;
                this.updateCharts();
            });
        });

        // Refresh button
        document.querySelector('.refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        // Click outside modal to close
        document.getElementById('addMicrositeModal').addEventListener('click', (e) => {
            if (e.target.id === 'addMicrositeModal') {
                this.closeModal();
            }
        });
    }

    // Initialize charts
    initializeCharts() {
        this.createVisitorsChart();
        this.createLeadsChart();
        this.createConversionChart();
        this.createConversionTrendsChart();
    }

    // Create visitors chart
    createVisitorsChart() {
        const ctx = document.getElementById('visitorsChart');
        if (!ctx) return;

        this.charts.visitors = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(),
                datasets: [{
                    label: 'Visitors',
                    data: this.generateRandomData(12, 100, 500),
                    borderColor: '#4299e1',
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });
    }

    // Create leads chart
    createLeadsChart() {
        const ctx = document.getElementById('leadsChart');
        if (!ctx) return;

        this.charts.leads = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(),
                datasets: [{
                    label: 'Leads',
                    data: this.generateRandomData(12, 10, 50),
                    borderColor: '#48bb78',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });
    }

    // Create conversion chart
    createConversionChart() {
        const ctx = document.getElementById('conversionChart');
        if (!ctx) return;

        this.charts.conversion = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Converted', 'Not Converted'],
                datasets: [{
                    data: [7.1, 92.9],
                    backgroundColor: ['#48bb78', '#e2e8f0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Create conversion trends chart
    createConversionTrendsChart() {
        const ctx = document.getElementById('conversionTrendsChart');
        if (!ctx) return;

        this.charts.conversionTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(7),
                datasets: [{
                    label: 'Conversion Rate',
                    data: this.generateRandomData(7, 5, 10),
                    borderColor: '#4299e1',
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#718096'
                        }
                    },
                    y: {
                        grid: {
                            color: '#e2e8f0'
                        },
                        ticks: {
                            color: '#718096',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        backgroundColor: '#4299e1'
                    }
                }
            }
        });
    }

    // Generate time labels
    generateTimeLabels(count = 12) {
        const labels = [];
        const now = new Date();
        
        for (let i = count - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Every hour
            labels.push(time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }));
        }
        
        return labels;
    }

    // Generate random data
    generateRandomData(count, min, max) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return data;
    }

    // Update charts
    updateCharts() {
        // Update chart data based on current period
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.data) {
                chart.data.labels = this.generateTimeLabels();
                chart.data.datasets.forEach(dataset => {
                    dataset.data = this.generateRandomData(12, 10, 100);
                });
                chart.update();
            }
        });
    }

    // Update dashboard
    updateDashboard() {
        if (window.realTimeFetcher) {
            window.realTimeFetcher.updateDashboard();
        }
    }

    // Refresh data
    refreshData() {
        const refreshBtn = document.querySelector('.refresh-btn');
        const icon = refreshBtn.querySelector('i');
        
        // Show loading state
        icon.classList.add('fa-spin');
        refreshBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            this.updateDashboard();
            icon.classList.remove('fa-spin');
            refreshBtn.disabled = false;
            
            // Show success message
            this.showNotification('Data refreshed successfully!', 'success');
        }, 1000);
    }

    // Start real-time updates
    startRealTimeUpdates() {
        // Update dashboard every 5 seconds
        setInterval(() => {
            this.updateDashboard();
        }, 5000);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : '#4299e1'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Add microsite
    addMicrosite() {
        document.getElementById('addMicrositeModal').style.display = 'block';
    }

    // Save microsite
    saveMicrosite() {
        const form = document.getElementById('addMicrositeForm');
        const formData = new FormData(form);
        
        const siteData = {
            siteName: document.getElementById('siteName').value,
            siteUrl: document.getElementById('siteUrl').value,
            gtmId: document.getElementById('gtmId').value,
            formSelector: document.getElementById('formSelector').value,
            conversionGoal: document.getElementById('conversionGoal').value
        };
        
        // Validate required fields
        if (!siteData.siteName || !siteData.siteUrl || !siteData.gtmId) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Check if editing existing site
        const modal = document.getElementById('addMicrositeModal');
        const siteId = modal.dataset.siteId;
        
        if (siteId) {
            // Update existing site
            const site = window.realTimeFetcher.microsites.find(s => s.id == siteId);
            if (site) {
                site.name = siteData.siteName;
                site.url = siteData.siteUrl;
                site.gtmId = siteData.gtmId;
                site.formSelector = siteData.formSelector;
                site.conversionGoal = siteData.conversionGoal;
                window.realTimeFetcher.saveMicrosites();
                this.showNotification('Microsite updated successfully!', 'success');
            }
        } else {
            // Add new site
            window.realTimeFetcher.addMicrosite(siteData);
            this.showNotification('Microsite added successfully!', 'success');
        }
        
        this.closeModal();
        form.reset();
    }

    // Close modal
    closeModal() {
        document.getElementById('addMicrositeModal').style.display = 'none';
        document.getElementById('addMicrositeModal').dataset.siteId = '';
        document.getElementById('addMicrositeForm').reset();
    }

    // Export data
    exportData() {
        const data = window.realTimeFetcher.getAnalyticsData();
        const csv = this.convertToCSV(data.microsites);
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }

    // Convert data to CSV
    convertToCSV(data) {
        const headers = ['Name', 'URL', 'Visitors', 'Leads', 'Conversion %', 'Status', 'Form Status', 'Last Activity'];
        const rows = data.map(site => [
            site.name,
            site.url,
            site.visitors,
            site.leads,
            site.conversion,
            site.status,
            site.formStatus,
            site.lastActivity
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }
}

// Global functions for HTML onclick handlers
function refreshData() {
    if (window.dashboard) {
        window.dashboard.refreshData();
    }
}

function addMicrosite() {
    if (window.dashboard) {
        window.dashboard.addMicrosite();
    }
}

function saveMicrosite() {
    if (window.dashboard) {
        window.dashboard.saveMicrosite();
    }
}

function closeModal() {
    if (window.dashboard) {
        window.dashboard.closeModal();
    }
}

function exportData() {
    if (window.dashboard) {
        window.dashboard.exportData();
    }
}

// Load real data from server counts
async function loadRealData() {
    console.log('📊 Loading real data from server counts...');
    
    try {
        const response = await fetch('https://your-railway-app.up.railway.app/api/counts.json');
        const serverCounts = await response.json();
        
        console.log('📊 Found server counts:', serverCounts);
        
        // Update each site with server counts
        Object.keys(serverCounts).forEach(gtmId => {
            const serverData = serverCounts[gtmId];
            
            console.log('📊 Looking for site with GTM ID:', gtmId);
            console.log('📊 Available microsites:', window.realTimeFetcher.microsites.map(s => ({ name: s.name, gtmId: s.gtmId })));
            
            // Find the site by GTM ID
            let site = window.realTimeFetcher.microsites.find(s => s.gtmId === gtmId);
            
            if (site) {
                console.log('📊 Updating site with server counts:', site.name);
                
                // Update with server counts
                site.visitors = serverData.visitors || 0;
                site.leads = serverData.leads || 0;
                site.conversion = serverData.conversionRate || 0;
                site.lastActivity = 'Just now';
                
                console.log('✅ Updated site data from server:', {
                    visitors: site.visitors,
                    leads: site.leads,
                    conversion: site.conversion
                });
            } else {
                console.log('❌ Site not found for GTM ID:', gtmId);
                console.log('📊 Available GTM IDs:', window.realTimeFetcher.microsites.map(s => s.gtmId));
            }
        });
        
        // Update analytics and dashboard
        window.realTimeFetcher.updateAnalytics();
        window.realTimeFetcher.updateDashboard();
        
        console.log('✅ Real data loaded successfully from server!');
    } catch (error) {
        console.error('❌ Error loading data from server:', error);
    }
}

// Listen for messages from microsites
window.addEventListener('message', function(event) {
    console.log('📊 Received message from microsite:', event.data);
    if (event.data && event.data.event && event.data.event.startsWith('gtm.')) {
        // Store the message
        const existingData = JSON.parse(localStorage.getItem('homesfy_tracking') || '[]');
        existingData.push(event.data);
        localStorage.setItem('homesfy_tracking', JSON.stringify(existingData));
        
        // Process the data immediately
        loadRealData();
    }
});

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    
    // Load any existing real data after a short delay
    setTimeout(() => {
        loadRealData();
    }, 1000);
    
    // Auto-refresh data every 5 seconds
    setInterval(() => {
        loadRealData();
    }, 5000);
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
