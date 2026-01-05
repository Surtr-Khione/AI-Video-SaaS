# UTM Tracker - Usage Examples

This document provides practical examples for common use cases with the UTM Tracker for Google Tag Manager.

## Table of Contents

1. [Basic Setup Examples](#basic-setup-examples)
2. [GTM Configuration Examples](#gtm-configuration-examples)
3. [Custom Implementation Examples](#custom-implementation-examples)
4. [E-commerce Examples](#e-commerce-examples)
5. [Lead Generation Examples](#lead-generation-examples)
6. [Multi-Step Form Examples](#multi-step-form-examples)

---

## Basic Setup Examples

### Example 1: Simple Installation

**Tag Configuration in GTM:**
- Tag Type: Custom HTML
- Tag Name: UTM Tracker
- Triggering: All Pages (Page View)
- Tag firing options: Once per page

```html
<script>
// Paste the entire utm-tracker.js content here
</script>
```

### Example 2: External File with Custom Domain

**Tag Configuration:**
```html
<script src="https://cdn.yourdomain.com/scripts/utm-tracker.js"></script>
<script>
// Configure for cross-subdomain tracking
window.UTMTracker.configure({
    cookieDomain: '.yourdomain.com',
    cookieExpireDays: 90
});
</script>
```

### Example 3: Debug Mode Enabled

```html
<script src="/js/utm-tracker.js"></script>
<script>
// Enable debug mode to see console logs
window.UTMTracker.configure({
    debug: true
});
</script>
```

---

## GTM Configuration Examples

### Example 1: Create Data Layer Variables

**In GTM Variables:**

1. **Variable: UTM Source**
   - Type: Data Layer Variable
   - Data Layer Variable Name: `utm_source`
   - Default Value: `(direct)`

2. **Variable: UTM Medium**
   - Type: Data Layer Variable
   - Data Layer Variable Name: `utm_medium`
   - Default Value: `(none)`

3. **Variable: UTM Campaign**
   - Type: Data Layer Variable
   - Data Layer Variable Name: `utm_campaign`
   - Default Value: `(not set)`

4. **Variable: Google Click ID**
   - Type: Data Layer Variable
   - Data Layer Variable Name: `gclid`
   - Default Value: `(none)`

### Example 2: Trigger for Paid Traffic

**Trigger Configuration:**
- Trigger Type: Custom Event
- Event Name: `utm_captured`
- This trigger fires on: Some Custom Events
- Fire this trigger when:
  - `utm_medium` contains `cpc`
  - OR `gclid` does not equal `(none)`

### Example 3: Trigger for Specific Campaign

**Trigger Configuration:**
- Trigger Type: Custom Event
- Event Name: `utm_captured`
- This trigger fires on: Some Custom Events
- Fire this trigger when:
  - `utm_campaign` equals `black_friday_2024`

---

## Custom Implementation Examples

### Example 1: Send UTMs to Third-Party API

**Custom HTML Tag (fires on: utm_captured event):**

```html
<script>
(function() {
    var utms = window.UTMTracker.getUTMs();

    // Send to your API
    fetch('https://api.yourdomain.com/track-attribution', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            utms: utms
        })
    }).catch(function(error) {
        console.error('Error sending UTMs:', error);
    });
})();
</script>
```

### Example 2: Store First Touch and Last Touch Attribution

**Custom HTML Tag:**

```html
<script>
(function() {
    var utms = window.UTMTracker.getUTMs();

    if (Object.keys(utms).length === 0) return;

    // First touch (only set if not already set)
    var firstTouch = localStorage.getItem('first_touch_attribution');
    if (!firstTouch) {
        localStorage.setItem('first_touch_attribution', JSON.stringify({
            timestamp: new Date().toISOString(),
            utms: utms,
            page: window.location.href
        }));
    }

    // Last touch (always update)
    localStorage.setItem('last_touch_attribution', JSON.stringify({
        timestamp: new Date().toISOString(),
        utms: utms,
        page: window.location.href
    }));

    // Push to dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'attribution_stored',
        attribution_model: 'first_last_touch'
    });
})();
</script>
```

### Example 3: Multi-Touch Attribution Tracking

**Custom HTML Tag:**

```html
<script>
(function() {
    var utms = window.UTMTracker.getUTMs();

    if (Object.keys(utms).length === 0) return;

    // Get existing touches
    var touches = JSON.parse(localStorage.getItem('attribution_touches') || '[]');

    // Add new touch
    touches.push({
        timestamp: new Date().toISOString(),
        utms: utms,
        page: window.location.href,
        referrer: document.referrer
    });

    // Limit to last 10 touches
    if (touches.length > 10) {
        touches = touches.slice(-10);
    }

    // Store
    localStorage.setItem('attribution_touches', JSON.stringify(touches));

    // Push to dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'multi_touch_recorded',
        touch_count: touches.length
    });
})();
</script>
```

---

## E-commerce Examples

### Example 1: Pass UTMs to Purchase Event

**Enhanced Ecommerce Tag (fires on purchase):**

**Tag Type:** Google Analytics: GA4 Event

**Event Parameters:**
```
utm_source: {{utm_source}}
utm_medium: {{utm_medium}}
utm_campaign: {{utm_campaign}}
utm_term: {{utm_term}}
utm_content: {{utm_content}}
gclid: {{gclid}}
```

### Example 2: Add UTMs to Order Confirmation

**Custom HTML Tag (fires on order confirmation page):**

```html
<script>
(function() {
    var utms = window.UTMTracker.getUTMs();

    // Get order details (example with a global variable)
    var orderData = window.orderData || {};

    // Send to your backend
    if (orderData.order_id) {
        fetch('/api/orders/' + orderData.order_id + '/attribution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: orderData.order_id,
                attribution: {
                    utm_source: utms.utm_source || '(direct)',
                    utm_medium: utms.utm_medium || '(none)',
                    utm_campaign: utms.utm_campaign || '(not set)',
                    gclid: utms.gclid || null,
                    fbclid: utms.fbclid || null
                }
            })
        });
    }
})();
</script>
```

### Example 3: Shopify Integration

**Custom HTML Tag in GTM for Shopify:**

```html
<script>
// Wait for Shopify checkout object
(function() {
    if (typeof Shopify !== 'undefined' && Shopify.checkout) {
        var utms = window.UTMTracker.getUTMs();

        // Add UTMs as note attributes
        var noteAttributes = [];
        Object.keys(utms).forEach(function(key) {
            noteAttributes.push({
                name: key,
                value: utms[key]
            });
        });

        // Update checkout (Shopify Plus feature)
        if (noteAttributes.length > 0) {
            fetch('/cart/update.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    note: 'UTM Tracking: ' + JSON.stringify(utms)
                })
            });
        }
    }
})();
</script>
```

---

## Lead Generation Examples

### Example 1: Add UTMs to Form Submission

**Custom HTML Tag (fires on form submission):**

```html
<script>
document.addEventListener('submit', function(event) {
    var form = event.target;

    // Only process specific forms
    if (!form.classList.contains('lead-form')) return;

    var utms = window.UTMTracker.getUTMs();

    // Add UTMs as hidden fields
    Object.keys(utms).forEach(function(param) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = param;
        input.value = utms[param];
        form.appendChild(input);
    });
});
</script>
```

### Example 2: HubSpot Form Integration

**Custom HTML Tag:**

```html
<script>
window.addEventListener('message', function(event) {
    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormReady') {
        var utms = window.UTMTracker.getUTMs();

        // Set HubSpot hidden fields
        Object.keys(utms).forEach(function(param) {
            var field = document.querySelector('[name="' + param + '"]');
            if (field) {
                field.value = utms[param];
            }
        });
    }
});
</script>
```

### Example 3: Marketo Form Integration

**Custom HTML Tag:**

```html
<script>
// Wait for Marketo forms
if (typeof MktoForms2 !== 'undefined') {
    MktoForms2.whenReady(function(form) {
        var utms = window.UTMTracker.getUTMs();

        // Create values object for Marketo
        var values = {};
        Object.keys(utms).forEach(function(param) {
            // Convert to Marketo field names (e.g., utm_source -> UTM_Source__c)
            var fieldName = param.split('_')
                .map(function(word) {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                })
                .join('_') + '__c';

            values[fieldName] = utms[param];
        });

        // Set form values
        form.setValues(values);
    });
}
</script>
```

---

## Multi-Step Form Examples

### Example 1: Persist UTMs Across Form Steps

**Custom HTML Tag (fires on all pages with forms):**

```html
<script>
(function() {
    // Add UTMs to all form links
    var formLinks = document.querySelectorAll('a[href*="/form/step"]');
    var utms = window.UTMTracker.getUTMs();

    if (Object.keys(utms).length === 0) return;

    formLinks.forEach(function(link) {
        try {
            var url = new URL(link.href);

            // Add UTM parameters
            Object.keys(utms).forEach(function(param) {
                if (!url.searchParams.has(param)) {
                    url.searchParams.set(param, utms[param]);
                }
            });

            link.href = url.toString();
        } catch (e) {
            console.error('Error updating form link:', e);
        }
    });
})();
</script>
```

### Example 2: Track Form Abandonment with Attribution

**Custom HTML Tag:**

```html
<script>
(function() {
    var formStarted = false;
    var formCompleted = false;

    // Track form start
    document.addEventListener('focus', function(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            if (!formStarted) {
                formStarted = true;

                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'form_started',
                    utm_source: window.UTMTracker.getUTM('utm_source'),
                    utm_medium: window.UTMTracker.getUTM('utm_medium'),
                    utm_campaign: window.UTMTracker.getUTM('utm_campaign')
                });
            }
        }
    }, true);

    // Track form completion
    document.addEventListener('submit', function() {
        formCompleted = true;

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'form_completed',
            utm_source: window.UTMTracker.getUTM('utm_source'),
            utm_medium: window.UTMTracker.getUTM('utm_medium'),
            utm_campaign: window.UTMTracker.getUTM('utm_campaign')
        });
    });

    // Track abandonment on page unload
    window.addEventListener('beforeunload', function() {
        if (formStarted && !formCompleted) {
            // Use sendBeacon for reliable tracking
            if (navigator.sendBeacon) {
                var data = new FormData();
                data.append('event', 'form_abandoned');
                data.append('utm_source', window.UTMTracker.getUTM('utm_source') || '');
                data.append('utm_medium', window.UTMTracker.getUTM('utm_medium') || '');
                data.append('utm_campaign', window.UTMTracker.getUTM('utm_campaign') || '');

                navigator.sendBeacon('/api/track-abandonment', data);
            }
        }
    });
})();
</script>
```

### Example 3: Typeform Integration

**Custom HTML Tag:**

```html
<script>
(function() {
    // Update Typeform embed URLs with UTMs
    var updateTypeforms = function() {
        var utms = window.UTMTracker.getUTMs();
        if (Object.keys(utms).length === 0) return;

        // Update Typeform embeds
        var typeformEmbeds = document.querySelectorAll('[data-tf-widget]');

        typeformEmbeds.forEach(function(embed) {
            var src = embed.getAttribute('data-tf-widget');
            if (!src) return;

            try {
                var url = new URL(src);

                // Add UTM parameters as hidden fields
                Object.keys(utms).forEach(function(param) {
                    url.searchParams.set(param, utms[param]);
                });

                embed.setAttribute('data-tf-widget', url.toString());
            } catch (e) {
                console.error('Error updating Typeform:', e);
            }
        });
    };

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateTypeforms);
    } else {
        updateTypeforms();
    }
})();
</script>
```

---

## Advanced Examples

### Example 1: A/B Test Integration with Attribution

```html
<script>
(function() {
    // Assuming you have an A/B testing tool with a global variable
    var abVariant = window.optimizely?.get('state')?.getVariationMap() || {};
    var utms = window.UTMTracker.getUTMs();

    // Combine A/B test data with UTM data
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'ab_test_with_attribution',
        ab_variant: JSON.stringify(abVariant),
        utm_source: utms.utm_source || '(direct)',
        utm_medium: utms.utm_medium || '(none)',
        utm_campaign: utms.utm_campaign || '(not set)'
    });
})();
</script>
```

### Example 2: Revenue Attribution Tracking

```html
<script>
(function() {
    // Get UTMs
    var utms = window.UTMTracker.getUTMs();

    // Get first touch attribution
    var firstTouch = JSON.parse(localStorage.getItem('first_touch_attribution') || '{}');

    // On purchase, send attribution data
    window.addEventListener('purchase_complete', function(event) {
        var purchaseData = event.detail || {};

        fetch('/api/revenue-attribution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: purchaseData.order_id,
                revenue: purchaseData.revenue,
                first_touch: firstTouch.utms || {},
                last_touch: utms,
                timestamp: new Date().toISOString()
            })
        });
    });
})();
</script>
```

### Example 3: Clean URLs After Capturing UTMs

```html
<script>
(function() {
    // Only run if there are UTM parameters in the URL
    var urlParams = new URLSearchParams(window.location.search);
    var hasUTMs = false;

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function(param) {
        if (urlParams.has(param)) {
            hasUTMs = true;
        }
    });

    if (hasUTMs) {
        // Wait for UTMs to be stored
        setTimeout(function() {
            // Remove UTM parameters from URL
            var cleanParams = new URLSearchParams(window.location.search);

            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'gclid', 'fbclid'].forEach(function(param) {
                cleanParams.delete(param);
            });

            var newURL = window.location.pathname;
            if (cleanParams.toString()) {
                newURL += '?' + cleanParams.toString();
            }
            newURL += window.location.hash;

            // Update URL without reload
            window.history.replaceState({}, document.title, newURL);
        }, 100);
    }
})();
</script>
```

---

## Testing Examples

### Example 1: Test UTM Tracking in Console

```javascript
// Open browser console and run:

// Check if tracker is loaded
console.log('UTM Tracker loaded:', typeof window.UTMTracker !== 'undefined');

// Get all UTMs
console.log('All UTMs:', window.UTMTracker.getUTMs());

// Get specific UTM
console.log('UTM Source:', window.UTMTracker.getUTM('utm_source'));

// Manually set UTMs for testing
window.UTMTracker.setUTMs({
    utm_source: 'test',
    utm_medium: 'test',
    utm_campaign: 'test_campaign'
});

// Check dataLayer
console.log('DataLayer:', window.dataLayer);

// Clear UTMs
window.UTMTracker.clearUTMs();
```

### Example 2: GTM Preview Mode Testing Checklist

1. **Load page with UTMs**: `yoursite.com/?utm_source=test&utm_medium=cpc&utm_campaign=test_campaign`

2. **Check in GTM Preview**:
   - ✅ UTM Tracker tag fires on page load
   - ✅ `utm_captured` event appears in dataLayer
   - ✅ Data Layer Variables populate correctly

3. **Test persistence**:
   - Navigate to another page without UTMs
   - Verify UTMs still available: `window.UTMTracker.getUTMs()`

4. **Test iframe updating**:
   - Check iframe `src` attributes contain UTM parameters
   - Verify excluded domains are skipped

### Example 3: Automated Testing Script

```javascript
// Run this in browser console for automated testing
(function() {
    var tests = {
        'Tracker Loaded': typeof window.UTMTracker !== 'undefined',
        'Has getUTMs method': typeof window.UTMTracker.getUTMs === 'function',
        'Has getUTM method': typeof window.UTMTracker.getUTM === 'function',
        'Has setUTMs method': typeof window.UTMTracker.setUTMs === 'function',
        'Has clearUTMs method': typeof window.UTMTracker.clearUTMs === 'function',
        'DataLayer exists': Array.isArray(window.dataLayer),
        'UTMData global exists': typeof window.UTMData === 'object'
    };

    console.log('=== UTM Tracker Test Results ===');
    var passed = 0;
    var failed = 0;

    Object.keys(tests).forEach(function(testName) {
        var result = tests[testName];
        console.log(
            (result ? '✅' : '❌') + ' ' + testName
        );
        if (result) passed++;
        else failed++;
    });

    console.log('\n' + passed + ' passed, ' + failed + ' failed');
})();
```

---

## Conclusion

These examples cover most common use cases for the UTM Tracker. Feel free to modify and combine them based on your specific needs.

For more information, see the main [README.md](README.md) file.
