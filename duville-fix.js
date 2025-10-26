/**
 * Fix for Duville Riverdale Grand - Lead Tracking
 * Add this script to your website after the tracking script
 */

// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Duville Lead Tracking Fix Loaded');
    
    // Find all forms with data-track-lead="true"
    const forms = document.querySelectorAll('form[data-track-lead="true"], form button[data-track-lead="true"]');
    
    forms.forEach((element, index) => {
        const form = element.tagName === 'FORM' ? element : element.closest('form');
        if (!form) return;
        
        console.log(`🔧 Setting up lead tracking for form ${index + 1}:`, form.id || form.className);
        
        // Add event listener for form submission
        form.addEventListener('submit', function(e) {
            console.log('📝 Form submission detected:', form.id || form.className);
            
            // Wait a bit for validation to complete
            setTimeout(() => {
                // Check if form validation passed (form fields are still filled)
                const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
                let allValid = true;
                
                inputs.forEach(input => {
                    if (!input.value || input.value.trim() === '') {
                        allValid = false;
                    }
                });
                
                if (allValid) {
                    console.log('✅ Form validation passed - tracking successful lead');
                    
                    // Call the tracking function
                    if (window.LiveAnalytics && window.LiveAnalytics.trackSuccessfulLead) {
                        window.LiveAnalytics.trackSuccessfulLead(form, index);
                        console.log('🎉 Lead successfully tracked!');
                    } else {
                        console.log('❌ LiveAnalytics not available');
                    }
                } else {
                    console.log('⚠️ Form validation failed - not tracking lead');
                }
            }, 1000); // Wait 1 second for validation
        });
    });
    
    // Also check for button clicks with data-track-lead="true"
    const buttons = document.querySelectorAll('button[data-track-lead="true"]');
    buttons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            console.log('🔘 Button with lead tracking clicked:', button.textContent);
            
            // Find the associated form
            const form = button.closest('form');
            if (form) {
                console.log('📝 Associated form found:', form.id || form.className);
                
                // Wait for form submission
                setTimeout(() => {
                    if (window.LiveAnalytics && window.LiveAnalytics.trackSuccessfulLead) {
                        window.LiveAnalytics.trackSuccessfulLead(form, index);
                        console.log('🎉 Lead tracked from button click!');
                    }
                }, 1500); // Wait 1.5 seconds for form processing
            }
        });
    });
    
    console.log(`🔧 Lead tracking setup complete for ${forms.length} forms and ${buttons.length} buttons`);
});
