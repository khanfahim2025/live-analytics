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
    
    // Show loading state
    const loadBtn = document.querySelector('button[onclick="loadRealData()"]');
    const originalText = loadBtn.innerHTML;
    loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadBtn.disabled = true;
    
    try {
        const response = await fetch('https://web-production-beea8.up.railway.app/api/counts.json');
        const serverCounts = await response.json();
        
        console.log('📊 Found server counts:', serverCounts);
        
        let filteredCount = 0;
        let totalCount = 0;
        
        // Update each site with server counts
        Object.keys(serverCounts).forEach(gtmId => {
            const serverData = serverCounts[gtmId];
            totalCount++;
            
            // For date filtering, we'll show all data but mark it appropriately
            // Since the current system doesn't have historical date-based data,
            // we'll implement a different approach
            let shouldShow = true;
            
            if (dateFilter.enabled) {
                // Check if we have any tracking data for this site in the date range
                const hasDataInRange = checkTrackingDataInRange(gtmId, dateFilter.from, dateFilter.to);
                if (!hasDataInRange) {
                    console.log('📅 No data found for date range, skipping:', serverData.siteName);
                    return; // Skip this site
                }
                filteredCount++;
            }
            
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
                
                // Add date information
                site.lastUpdated = serverData.lastUpdated;
                site.filteredByDate = dateFilter.enabled;
                
                // Add a note about date filtering if enabled
                if (dateFilter.enabled) {
                    site.dateFilterNote = 'Current aggregated data (historical filtering not available)';
                }
                
                console.log('✅ Updated site data from server:', {
                    visitors: site.visitors,
                    leads: site.leads,
                    conversion: site.conversion,
                    lastUpdated: site.lastUpdated
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
        
        // Show filter status
        if (dateFilter.enabled) {
            const filteredSites = window.realTimeFetcher.microsites.filter(site => site.filteredByDate);
            console.log(`📅 Date filter active: ${filteredSites.length} sites match date range`);
            
            // Update status with count and note about date filtering limitations
            const status = document.getElementById('dateFilterStatus');
            status.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-info-circle"></i>
                    <span><strong>Date Filter Applied:</strong> Showing current data for ${filteredCount} of ${totalCount} sites</span>
                </div>
                <div style="margin-top: 8px; font-size: 0.85rem; color: #718096;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Note:</strong> Historical date-based filtering is not available. Showing current aggregated data.
                </div>
            `;
            status.style.display = 'block';
        }
        
    } catch (error) {
        console.error('❌ Error loading data from server:', error);
        alert('Failed to load data from server. Please try again.');
    } finally {
        // Reset button state
        loadBtn.innerHTML = originalText;
        loadBtn.disabled = false;
    }
}

// Date filter state
let dateFilter = {
    enabled: false,
    from: null,
    to: null
};

// Apply date filter
function applyDateFilter() {
    const fromDate = document.getElementById('dateFrom').value;
    const toDate = document.getElementById('dateTo').value;
    
    if (!fromDate && !toDate) {
        alert('Please select at least one date');
        return;
    }
    
    // Validate date range
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        alert('From date cannot be after To date');
        return;
    }
    
    dateFilter.enabled = true;
    dateFilter.from = fromDate || null;
    dateFilter.to = toDate || null;
    
    // Update status display with warning about limitations
    const status = document.getElementById('dateFilterStatus');
    status.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <i class="fas fa-exclamation-triangle" style="color: #ed8936;"></i>
            <span><strong>Date Filter Applied:</strong> From ${dateFilter.from ? new Date(dateFilter.from).toLocaleDateString() : 'Any'} to ${dateFilter.to ? new Date(dateFilter.to).toLocaleDateString() : 'Any'}</span>
        </div>
        <div style="font-size: 0.85rem; color: #718096; background: #fff5f5; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #ed8936;">
            <i class="fas fa-info-circle"></i>
            <strong>Note:</strong> Historical date-based filtering is not available in the current system. 
            The system only stores current aggregated data. To implement historical filtering, 
            the tracking system would need to be modified to store data with timestamps.
        </div>
    `;
    status.style.display = 'block';
    
    // Show "No data available" message since historical filtering is not available
    showNoDataMessage();
    console.log('📅 Date filter applied:', dateFilter);
}

// Clear date filter
function clearDateFilter() {
    dateFilter.enabled = false;
    dateFilter.from = null;
    dateFilter.to = null;
    
    // Reset to default dates (today)
    setDefaultDateRange();
    document.getElementById('dateFilterStatus').textContent = '';
    document.getElementById('dateFilterStatus').style.display = 'none';
    
    // Reload data without filter
    loadRealData();
    console.log('📅 Date filter cleared');
}

// Check if date is within filter range
function isDateInRange(date, from, to) {
    if (!dateFilter.enabled) return true;
    
    const checkDate = new Date(date);
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    
    // Set time to start/end of day for proper comparison
    if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
    }
    if (toDate) {
        toDate.setHours(23, 59, 59, 999);
    }
    
    if (fromDate && checkDate < fromDate) return false;
    if (toDate && checkDate > toDate) return false;
    
    return true;
}

// Check if there's tracking data for a site in the specified date range
function checkTrackingDataInRange(gtmId, fromDate, toDate) {
    // Since we don't have historical data stored by date,
    // we'll implement a different approach:
    // 1. If no date filter is applied, show all data
    // 2. If date filter is applied, show a message that date filtering is not available
    //    and show current data with a note
    
    if (!dateFilter.enabled) return true;
    
    // For now, we'll show all data but with a note that date filtering is not available
    // In a real implementation, you would need to store historical data with timestamps
    return true;
}

// Show "No data available" message when date filter is applied
function showNoDataMessage() {
    const tableBody = document.getElementById('performanceTableBody');
    if (!tableBody) return;
    
    if (dateFilter.enabled) {
        // Clear existing content
        tableBody.innerHTML = '';
        
        // Add a row showing no data available
        const noDataRow = document.createElement('tr');
        noDataRow.className = 'no-data-row';
        noDataRow.innerHTML = `
            <td colspan="9" style="text-align: center; padding: 40px; color: #718096;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                    <i class="fas fa-calendar-times" style="font-size: 2rem; color: #cbd5e0;"></i>
                    <div>
                        <h3 style="margin: 0; color: #4a5568;">No Data Available</h3>
                        <p style="margin: 8px 0 0 0; font-size: 0.9rem;">
                            No tracking data found for the selected date range.<br>
                            <small>Historical date-based filtering is not available in the current system.</small>
                        </p>
                    </div>
                    <button onclick="clearDateFilter()" class="btn-primary" style="margin-top: 8px;">
                        <i class="fas fa-times"></i> Clear Date Filter
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(noDataRow);
    }
}

// Set default date range (current date)
function setDefaultDateRange() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Set both dates to today by default
    document.getElementById('dateFrom').value = todayString;
    document.getElementById('dateTo').value = todayString;
}

// Set date presets
function setDatePreset(preset) {
    const today = new Date();
    let fromDate, toDate;
    
    switch(preset) {
        case 'today':
            fromDate = toDate = today.toISOString().split('T')[0];
            break;
        case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            fromDate = toDate = yesterday.toISOString().split('T')[0];
            break;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            fromDate = weekStart.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
        case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            fromDate = monthStart.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
        default:
            return;
    }
    
    document.getElementById('dateFrom').value = fromDate;
    document.getElementById('dateTo').value = toDate;
    
    // Auto-apply the filter
    applyDateFilter();
}

// Export filtered data
function exportFilteredData() {
    if (!dateFilter.enabled) {
        alert('Please apply a date filter first');
        return;
    }
    
    const filteredSites = window.realTimeFetcher.microsites.filter(site => site.filteredByDate);
    
    if (filteredSites.length === 0) {
        alert('No data found for the selected date range');
        return;
    }
    
    // Create CSV with filtered data
    let csv = 'Website,URL,Visitors,Leads,Conversion%,Status,Form Status,Last Updated\n';
    
    filteredSites.forEach(site => {
        csv += `"${site.name}","${site.url}",${site.visitors},${site.leads},${site.conversion}%,"${site.status}","${site.formStatus}","${site.lastUpdated || 'Unknown'}"\n`;
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microsite-performance-${dateFilter.from?.toISOString().split('T')[0] || 'filtered'}-to-${dateFilter.to?.toISOString().split('T')[0] || 'filtered'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log('📊 Filtered data exported:', filteredSites.length, 'sites');
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
    // Set default date range (current date)
    setDefaultDateRange();
    
    window.dashboard = new Dashboard();
    
    // Load any existing real data after a short delay
    setTimeout(() => {
        loadRealData();
    }, 1000);
    
    // Auto-refresh data every 5 seconds
    setInterval(() => {
        loadRealData();
    }, 5000);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + R to refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            loadRealData();
        }
        
        // Ctrl/Cmd + E to export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportData();
        }
        
        // Escape to clear filters
        if (e.key === 'Escape') {
            clearDateFilter();
        }
    });
    
    // Add tooltips and help text
    addTooltips();
});

// Add tooltips for better UX
function addTooltips() {
    const tooltips = {
        'dateFrom': 'Select the start date for filtering data',
        'dateTo': 'Select the end date for filtering data',
        'loadRealData': 'Load the latest data from the server',
        'exportData': 'Export all data to CSV file',
        'exportFilteredData': 'Export only filtered data to CSV file'
    };
    
    Object.keys(tooltips).forEach(id => {
        const element = document.getElementById(id) || document.querySelector(`[onclick*="${id}"]`);
        if (element) {
            element.title = tooltips[id];
        }
    });
}

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
