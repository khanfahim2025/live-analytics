/**
 * GTM-Compatible Tracking Script for Real Microsites
 * This script can be embedded in your actual microsite (green-reserve-noida.in)
 * It sends data directly to Firebase without needing serverless functions
 */

// Firebase configuration - Your actual config
const firebaseConfig = {
    apiKey: "AIzaSyDl8ApkaKB-Cpg9fHfk4uwRpAUn6oj-2FA",
    authDomain: "live-analytics-dashboard.firebaseapp.com",
    databaseURL: "https://live-analytics-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "live-analytics-dashboard",
    storageBucket: "live-analytics-dashboard.firebasestorage.app",
    messagingSenderId: "289125971781",
    appId: "1:289125971781:web:f9eee35fc1938a7d43302c",
    measurementId: "G-CMZT1BT8W5"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
}

class RealMicrositeTracker {
    constructor(options = {}) {
        this.micrositeId = options.micrositeId || 'green-reserve-noida';
        this.debug = options.debug || false;
        this.gtmId = this.generateGtmId();
        
        this.log('RealMicrositeTracker initialized for', this.micrositeId);
        
        // Track page view on load
        this.trackPageView();
        
        // Set up form tracking
        this.setupFormTracking();
        
        // Set up GTM dataLayer integration
        this.setupGTMIntegration();
    }
    
    generateGtmId() {
        return 'gtm_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    log(message, data = null) {
        if (this.debug) {
            console.log(`[RealMicrositeTracker] ${message}`, data);
        }
    }
    
    async trackEvent(eventType, additionalData = {}) {
        const eventData = {
            gtm_id: this.gtmId,
            microsite_id: this.micrositeId,
            event_type: eventType,
            url: window.location.href,
            referrer: document.referrer || 'direct',
            utm_source: this.getUrlParameter('utm_source') || 'direct',
            utm_medium: this.getUrlParameter('utm_medium') || 'organic',
            utm_campaign: this.getUrlParameter('utm_campaign') || null,
            utm_term: this.getUrlParameter('utm_term') || null,
            utm_content: this.getUrlParameter('utm_content') || null,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString(),
            source: 'real_microsite',
            ...additionalData
        };
        
        this.log('Tracking event', eventData);
        
        try {
            // Store directly in Firebase
            const ref = firebase.database().ref('events').push();
            await ref.set(eventData);
            
            // Also store in specific collections
            if (eventType === 'page_view') {
                const visitRef = firebase.database().ref('visits').push();
                await visitRef.set({
                    ...eventData,
                    date: eventData.timestamp.split('T')[0]
                });
            }
            
            if (eventType === 'form_submission' || eventType === 'lead_conversion') {
                const leadRef = firebase.database().ref('leads').push();
                await leadRef.set({
                    ...eventData,
                    date: eventData.timestamp.split('T')[0]
                });
            }
            
            // Push to GTM dataLayer for GTM integration
            if (typeof dataLayer !== 'undefined') {
                dataLayer.push({
                    'event': 'microsite_tracking',
                    'microsite_id': this.micrositeId,
                    'event_type': eventType,
                    'gtm_id': this.gtmId,
                    'timestamp': eventData.timestamp
                });
            }
            
            this.log('Event tracked successfully');
            return { success: true };
        } catch (error) {
            this.log('Error tracking event', error);
            throw error;
        }
    }
    
    trackPageView() {
        this.trackEvent('page_view');
    }
    
    trackLead(formData = {}) {
        return this.trackEvent('form_submission', {
            form_data: formData,
            lead_data: {
                name: formData.name || '',
                email: formData.email || '',
                phone: formData.phone || '',
                message: formData.message || ''
            }
        });
    }
    
    setupFormTracking() {
        // Track all forms with data-track-lead attribute
        document.addEventListener('submit', (event) => {
            const form = event.target;
            const trackLead = form.querySelector('[data-track-lead="true"]') || 
                             form.querySelector('button[data-track-lead="true"]');
            
            if (trackLead) {
                event.preventDefault();
                this.handleFormSubmission(form);
            }
        });
        
        // Track buttons with data-track-lead attribute
        document.addEventListener('click', (event) => {
            const button = event.target;
            if (button.hasAttribute('data-track-lead') && button.getAttribute('data-track-lead') === 'true') {
                event.preventDefault();
                this.handleButtonClick(button);
            }
        });
        
        // Track specific elements by class or ID
        this.setupSpecificTracking();
    }
    
    setupSpecificTracking() {
        // Track specific elements on green-reserve-noida.in
        const trackableElements = [
            'button[type="submit"]',
            '.enquire-now',
            '.register-now',
            '.request-brochure',
            '.download-brochure',
            '.cta-button',
            '.contact-form button',
            '.inquiry-form button'
        ];
        
        trackableElements.forEach(selector => {
            document.addEventListener('click', (event) => {
                if (event.target.matches(selector)) {
                    this.trackEvent('button_click', {
                        button_text: event.target.textContent,
                        button_class: event.target.className,
                        button_id: event.target.id
                    });
                }
            });
        });
    }
    
    setupGTMIntegration() {
        // Initialize GTM dataLayer if not exists
        if (typeof dataLayer === 'undefined') {
            window.dataLayer = window.dataLayer || [];
        }
        
        // Track page views for GTM
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                'microsite_id': this.micrositeId,
                'page_title': document.title,
                'page_location': window.location.href
            });
        }
    }
    
    async handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        this.log('Form submission detected', data);
        
        try {
            await this.trackLead(data);
            this.showNotification('Thank you! Your inquiry has been submitted.', 'success');
            form.reset();
        } catch (error) {
            this.log('Error tracking lead', error);
            this.showNotification('There was an error submitting your form. Please try again.', 'error');
        }
    }
    
    async handleButtonClick(button) {
        const form = button.closest('form');
        let data = {};
        
        if (form) {
            const formData = new FormData(form);
            data = Object.fromEntries(formData.entries());
        } else {
            data = {
                action: button.textContent || button.value || 'button_click',
                url: window.location.href
            };
        }
        
        this.log('Button click detected', data);
        
        try {
            await this.trackLead(data);
            this.showNotification('Thank you! Your inquiry has been submitted.', 'success');
        } catch (error) {
            this.log('Error tracking lead', error);
            this.showNotification('There was an error submitting your inquiry. Please try again.', 'error');
        }
    }
    
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ${type === 'success' ? 'background-color: #27ae60;' : ''}
            ${type === 'error' ? 'background-color: #e74c3c;' : ''}
            ${type === 'info' ? 'background-color: #3498db;' : ''}
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tracker for green-reserve-noida
    window.micrositeTracker = new RealMicrositeTracker({
        micrositeId: 'green-reserve-noida',
        debug: true
    });
    
    console.log('🚀 Live Analytics Tracker initialized for green-reserve-noida.in');
});

// Export for manual initialization
window.RealMicrositeTracker = RealMicrositeTracker;
