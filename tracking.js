/**
 * Live Analytics Tracking Script for GitHub Pages
 * Client-side Firebase tracking for microsite analytics
 */

class MicrositeTracker {
    constructor(options = {}) {
        this.micrositeId = options.micrositeId || 'demo-microsite';
        this.debug = options.debug || false;
        this.gtmId = this.generateGtmId();
        
        this.log('MicrositeTracker initialized', { micrositeId: this.micrositeId });
        
        // Track page view on load
        this.trackPageView();
        
        // Set up form tracking
        this.setupFormTracking();
        
        // Track page visibility changes (for SPA-like behavior)
        this.setupVisibilityTracking();
    }
    
    generateGtmId() {
        return 'gtm_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    log(message, data = null) {
        if (this.debug) {
            console.log(`[MicrositeTracker] ${message}`, data);
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
        
        // Also track buttons with data-track-lead attribute
        document.addEventListener('click', (event) => {
            const button = event.target;
            if (button.hasAttribute('data-track-lead') && button.getAttribute('data-track-lead') === 'true') {
                event.preventDefault();
                this.handleButtonClick(button);
            }
        });
    }
    
    async handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        this.log('Form submission detected', data);
        
        try {
            await this.trackLead(data);
            
            // Show success message
            this.showNotification('Thank you! Your inquiry has been submitted.', 'success');
            
            // Reset form
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
            // Extract data from button attributes or nearby elements
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
    
    setupVisibilityTracking() {
        // Track when page becomes visible again (for SPA-like behavior)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.log('Page became visible, tracking page view');
                this.trackPageView();
            }
        });
        
        // Track focus events (user returned to tab)
        window.addEventListener('focus', () => {
            this.log('Window focused, tracking page view');
            this.trackPageView();
        });
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

// Auto-initialize if micrositeId is provided via data attribute
document.addEventListener('DOMContentLoaded', function() {
    const script = document.querySelector('script[data-microsite-id]');
    if (script) {
        const micrositeId = script.getAttribute('data-microsite-id');
        const debug = script.getAttribute('data-debug') === 'true';
        
        window.micrositeTracker = new MicrositeTracker({
            micrositeId,
            debug
        });
    }
});

// Export for manual initialization
window.MicrositeTracker = MicrositeTracker;
