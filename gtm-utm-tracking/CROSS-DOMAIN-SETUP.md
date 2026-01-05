# Cross-Domain and Cross-Subdomain UTM Tracking Setup

This guide explains how to set up UTM tracking across multiple domains and subdomains.

## Table of Contents

1. [Cross-Subdomain Tracking](#cross-subdomain-tracking)
2. [Cross-Domain Tracking](#cross-domain-tracking)
3. [Configuration Examples](#configuration-examples)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## Cross-Subdomain Tracking

Cross-subdomain tracking allows UTM parameters to persist when users navigate between subdomains of the same root domain (e.g., from `www.example.com` to `shop.example.com`).

### How It Works

Cookies are shared across subdomains by setting the `cookieDomain` to your root domain with a leading dot.

### Setup

**Step 1: Configure the Cookie Domain**

In your GTM Custom HTML tag, configure the tracker:

```javascript
<script src="/path/to/utm-tracker.js"></script>
<script>
window.UTMTracker.configure({
    cookieDomain: '.example.com'  // Note the leading dot
});
</script>
```

Or modify the CONFIG directly in the script:

```javascript
var CONFIG = {
    cookieDomain: '.example.com',
    // ... other settings
};
```

**Step 2: Deploy to All Subdomains**

Deploy the same GTM container (with the same configuration) to all subdomains:
- www.example.com
- shop.example.com
- app.example.com
- etc.

**Step 3: Test**

1. Visit `www.example.com/?utm_source=google&utm_medium=cpc`
2. Navigate to `shop.example.com`
3. Open browser console and run: `window.UTMTracker.getUTMs()`
4. Verify UTMs are still present

### Example: E-commerce with Separate Checkout Domain

**Scenario:** Main site at `www.store.com`, checkout at `checkout.store.com`

**Configuration:**

```javascript
window.UTMTracker.configure({
    cookieDomain: '.store.com',
    cookieExpireDays: 30
});
```

**Result:** UTMs captured on `www.store.com` will automatically be available on `checkout.store.com`

---

## Cross-Domain Tracking

Cross-domain tracking allows UTM parameters to persist when users navigate between completely different domains (e.g., from `marketing-site.com` to `app-platform.com`).

### How It Works

The tracker automatically decorates links and forms that point to allowed external domains with UTM parameters.

### Setup

**Step 1: Enable Cross-Domain Tracking**

Configure the tracker with allowed domains:

```javascript
window.UTMTracker.configure({
    enableCrossDomainTracking: true,
    allowedDomains: [
        'marketing-site.com',
        'app-platform.com',
        'checkout.payment-provider.com'
    ],
    autoDecorateLinks: true
});
```

**Step 2: Deploy to All Domains**

Deploy the same configuration to all domains in your `allowedDomains` list.

**Step 3: Test**

1. Visit Domain A: `marketing-site.com/?utm_source=google`
2. Click a link to Domain B: `app-platform.com`
3. Verify the URL includes UTM parameters: `app-platform.com/?utm_source=google`
4. On Domain B, run: `window.UTMTracker.getUTMs()`
5. Verify UTMs are present

### What Gets Decorated

**Links (Anchors):**
```html
<!-- Before -->
<a href="https://app-platform.com/signup">Sign Up</a>

<!-- After (automatic) -->
<a href="https://app-platform.com/signup?utm_source=google&utm_medium=cpc">Sign Up</a>
```

**Forms:**
```html
<!-- Before -->
<form action="https://checkout.payment-provider.com/pay">
    <input type="text" name="email">
    <button>Submit</button>
</form>

<!-- After (automatic) -->
<form action="https://checkout.payment-provider.com/pay">
    <input type="text" name="email">
    <input type="hidden" name="utm_source" value="google">
    <input type="hidden" name="utm_medium" value="cpc">
    <button>Submit</button>
</form>
```

---

## Configuration Examples

### Example 1: SaaS with Separate Marketing and App Domains

**Scenario:**
- Marketing site: `www.product.com`
- Application: `app.product.io`
- Documentation: `docs.product.com`

**Configuration (deploy to all three domains):**

```javascript
window.UTMTracker.configure({
    // Subdomain tracking for docs
    cookieDomain: '.product.com',

    // Cross-domain tracking
    enableCrossDomainTracking: true,
    allowedDomains: [
        'product.com',
        'www.product.com',
        'docs.product.com',
        'app.product.io'
    ],
    autoDecorateLinks: true,

    // Cookie settings
    cookieExpireDays: 90  // Longer for B2B sales cycles
});
```

### Example 2: Marketplace with Multiple Vendor Domains

**Scenario:**
- Main marketplace: `marketplace.com`
- Vendor A: `vendor-a.com`
- Vendor B: `vendor-b.com`

**Configuration on marketplace.com:**

```javascript
window.UTMTracker.configure({
    enableCrossDomainTracking: true,
    allowedDomains: [
        'marketplace.com',
        'vendor-a.com',
        'vendor-b.com'
    ],
    autoDecorateLinks: true,

    // Only decorate specific links
    linkDecoratorSelectors: 'a.vendor-link, a[data-track-domain]'
});
```

**Configuration on vendor sites:**

```javascript
window.UTMTracker.configure({
    enableCrossDomainTracking: true,
    allowedDomains: [
        'marketplace.com',
        'vendor-a.com',
        'vendor-b.com'
    ],
    autoDecorateLinks: true
});
```

### Example 3: WordPress with External Checkout

**Scenario:**
- WordPress blog: `blog.example.com`
- Shopify store: `shop.example.com`

**Configuration:**

```javascript
window.UTMTracker.configure({
    enableCrossDomainTracking: true,
    allowedDomains: [
        'blog.example.com',
        'shop.example.com'
    ],
    autoDecorateLinks: true,
    cookieExpireDays: 30
});
```

### Example 4: Multi-Brand Setup

**Scenario:**
- Brand A: `brand-a.com`
- Brand B: `brand-b.com`
- Shared checkout: `checkout.brands.com`

**Configuration on both brand sites:**

```javascript
window.UTMTracker.configure({
    enableCrossDomainTracking: true,
    allowedDomains: [
        'brand-a.com',
        'brand-b.com',
        'checkout.brands.com'
    ],
    autoDecorateLinks: true,

    // Custom event name per brand
    initialEventName: 'utm_captured_brand_a' // or 'utm_captured_brand_b'
});
```

---

## Advanced Configuration

### Selective Link Decoration

Only decorate specific links:

```javascript
window.UTMTracker.configure({
    enableCrossDomainTracking: true,
    allowedDomains: ['external-site.com'],
    linkDecoratorSelectors: 'a.track-me, a[data-track="true"]'
});
```

### Disable Auto-Decoration (Manual Control)

```javascript
window.UTMTracker.configure({
    enableCrossDomainTracking: true,
    allowedDomains: ['external-site.com'],
    autoDecorateLinks: false  // Disable automatic decoration
});

// Manually decorate specific URLs
var decoratedURL = window.UTMTracker.decorateURL('https://external-site.com/page');
console.log(decoratedURL);
// Output: https://external-site.com/page?utm_source=google&utm_medium=cpc
```

### Dynamic Link Decoration

For links added after page load:

```javascript
// Links are automatically decorated on click
// But you can also manually trigger decoration:
window.UTMTracker.decorateLinks();
```

### Custom Domain Matching

For advanced control, modify the `isAllowedDomain` function in the script:

```javascript
isAllowedDomain: function(hostname) {
    // Custom logic
    // Example: Allow all *.example.com subdomains
    return hostname.endsWith('.example.com') || hostname === 'example.com';
}
```

---

## Testing

### Test Cross-Subdomain Tracking

**1. Manual Testing:**

```bash
# Step 1: Visit main domain with UTMs
https://www.example.com/?utm_source=test&utm_medium=test

# Step 2: Navigate to subdomain
https://shop.example.com/

# Step 3: Open browser console and check
window.UTMTracker.getUTMs()
```

**2. Cookie Inspection:**

1. Open DevTools → Application → Cookies
2. Check for cookies with prefix `utm_`
3. Verify Domain column shows `.example.com` (with leading dot)

**3. Automated Test:**

```javascript
// Run in console
(function() {
    var tests = {
        'Cookie Domain Set': document.cookie.includes('utm_'),
        'Has UTM Data': Object.keys(window.UTMTracker.getUTMs()).length > 0,
        'Source Matches': window.UTMTracker.getUTM('utm_source') === 'test'
    };

    console.log('Cross-Subdomain Test Results:');
    Object.keys(tests).forEach(function(test) {
        console.log((tests[test] ? '✅' : '❌') + ' ' + test);
    });
})();
```

### Test Cross-Domain Tracking

**1. Check Link Decoration:**

```javascript
// Open console on Domain A
// Inspect links to Domain B
var links = document.querySelectorAll('a[href*="domain-b.com"]');
links.forEach(function(link) {
    console.log(link.href);
    // Should include ?utm_source=...&utm_medium=... etc.
});
```

**2. Manual Click Test:**

1. Enable debug mode: `window.UTMTracker.configure({ debug: true })`
2. Click a link to an external allowed domain
3. Check console logs for "Link decorated:" messages
4. Verify the destination URL includes UTM parameters

**3. Test Form Decoration:**

```javascript
// Run in console
window.UTMTracker.decorateForms();

// Inspect forms
var forms = document.querySelectorAll('form');
forms.forEach(function(form) {
    var hiddenInputs = form.querySelectorAll('input[type="hidden"]');
    console.log('Form action:', form.action);
    console.log('Hidden UTM fields:', hiddenInputs.length);
    hiddenInputs.forEach(function(input) {
        if (input.name.startsWith('utm_')) {
            console.log('  -', input.name, '=', input.value);
        }
    });
});
```

---

## Troubleshooting

### UTMs Not Persisting Across Subdomains

**Problem:** UTMs lost when moving from `www.example.com` to `shop.example.com`

**Solutions:**

1. **Check Cookie Domain:**
   ```javascript
   // Must have leading dot
   cookieDomain: '.example.com'  // ✅ Correct
   cookieDomain: 'example.com'   // ❌ Wrong - no leading dot
   ```

2. **Check Cookie in DevTools:**
   - Open DevTools → Application → Cookies
   - Verify Domain column shows `.example.com`

3. **Browser Restrictions:**
   - Localhost testing requires special configuration
   - Use `127.0.0.1` instead of `localhost` for testing
   - Or test on actual domains

4. **Third-Party Cookie Blocking:**
   - Modern browsers block third-party cookies
   - Ensure domains are truly subdomains (not separate domains)

### Links Not Being Decorated

**Problem:** External links missing UTM parameters

**Solutions:**

1. **Enable Cross-Domain Tracking:**
   ```javascript
   enableCrossDomainTracking: true  // Must be true
   ```

2. **Check Allowed Domains:**
   ```javascript
   allowedDomains: ['external-site.com']  // Must include target domain
   ```

3. **Check Link Selector:**
   ```javascript
   linkDecoratorSelectors: 'a[href]'  // Default - should match most links
   ```

4. **Debug Mode:**
   ```javascript
   window.UTMTracker.configure({ debug: true });
   // Check console for "Link decorated:" messages
   ```

5. **Manually Trigger:**
   ```javascript
   // Force decoration
   window.UTMTracker.decorateLinks();
   ```

### Links Decorated Multiple Times

**Problem:** URLs have duplicate UTM parameters

**Solution:**

The tracker checks for existing parameters before adding:
```javascript
// This is already built-in
if (!url.searchParams.has(param)) {
    url.searchParams.set(param, utms[param]);
}
```

If you see duplicates, you may have multiple trackers running. Check:
```javascript
// In console
console.log('Number of GTM containers:', window.dataLayer?.length || 0);
```

### Performance Issues

**Problem:** Page slowdown with many links

**Solutions:**

1. **Limit Selectors:**
   ```javascript
   // Only decorate specific links
   linkDecoratorSelectors: 'a.external-link'
   ```

2. **Disable Auto-Decoration:**
   ```javascript
   autoDecorateLinks: false
   // Manually decorate only when needed
   ```

3. **Reduce Allowed Domains:**
   ```javascript
   // Only include necessary domains
   allowedDomains: ['critical-domain.com']
   ```

### CORS Issues with Forms

**Problem:** Form submission fails after decoration

**Solution:**

The tracker only adds hidden fields, not modifies the action URL. If you encounter CORS issues:

1. **Check Server Configuration:**
   - Ensure the form action URL accepts the origin domain
   - Configure CORS headers on the receiving server

2. **Disable Form Decoration:**
   ```javascript
   // Create custom selector that excludes problematic forms
   formDecoratorSelectors: 'form[data-allow-decoration]'
   ```

### Safari Private Browsing

**Problem:** Tracking doesn't work in Safari Private Browsing

**Solution:**

Safari blocks localStorage in private mode. The tracker falls back to cookies:

```javascript
// This is automatic, but you can verify:
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('localStorage available');
} catch (e) {
    console.log('localStorage blocked - using cookies only');
}
```

---

## Security Considerations

### 1. Allowed Domains Whitelist

Always use a whitelist to prevent UTM parameter injection to untrusted sites:

```javascript
// ✅ Good - explicit whitelist
allowedDomains: ['trusted-site-1.com', 'trusted-site-2.com']

// ❌ Bad - wildcard/no validation
allowedDomains: ['*']  // Don't do this!
```

### 2. Cookie Security

For production, consider secure cookies:

```javascript
// In CookieUtil.set, add Secure flag for HTTPS
document.cookie = name + '=' + value + expires +
                  '; path=/; SameSite=Lax; Secure';
```

Note: Secure flag requires HTTPS.

### 3. Parameter Validation

The tracker encodes parameters, but always validate on the server side:

```php
// Example server-side validation
$utm_source = filter_input(INPUT_GET, 'utm_source', FILTER_SANITIZE_STRING);
if (strlen($utm_source) > 100) {
    $utm_source = substr($utm_source, 0, 100);
}
```

### 4. Privacy Compliance

- Document cross-domain tracking in your privacy policy
- Implement consent management for GDPR/CCPA compliance
- Consider IP anonymization for GA4 integration

---

## Best Practices

### 1. Consistent Configuration

Deploy the same configuration across all domains:

```javascript
// Create a shared config file
var UTM_TRACKER_CONFIG = {
    enableCrossDomainTracking: true,
    allowedDomains: ['site-a.com', 'site-b.com'],
    cookieExpireDays: 30
};

// Use on all domains
window.UTMTracker.configure(UTM_TRACKER_CONFIG);
```

### 2. Test in Staging First

Always test cross-domain tracking in a staging environment before production.

### 3. Monitor in GTM Preview

Use GTM Preview mode to verify:
- UTM parameters are captured
- dataLayer events fire correctly
- Links are decorated properly

### 4. Document Your Setup

Keep a record of:
- All domains in your tracking setup
- Cookie domain configuration
- Any custom configurations

### 5. Regular Audits

Periodically check:
- All domains still have the tracker deployed
- Configuration is consistent
- No broken links or forms

---

## Migration from Single Domain

If you're migrating from single-domain to cross-domain tracking:

### Step 1: Update Configuration

```javascript
// Before (single domain)
var CONFIG = {
    cookieExpireDays: 30
};

// After (cross-domain)
var CONFIG = {
    cookieExpireDays: 30,
    cookieDomain: '.example.com',  // For subdomains
    enableCrossDomainTracking: true,  // For different domains
    allowedDomains: ['site-a.com', 'site-b.com']
};
```

### Step 2: Deploy to Additional Domains

Deploy the updated script to all domains in `allowedDomains`.

### Step 3: Test Thoroughly

Test all navigation paths between domains.

### Step 4: Monitor

Watch for any attribution discrepancies in your analytics.

---

## Need Help?

For additional support, please open an issue in the repository with:
- Your configuration (remove sensitive data)
- Browser and version
- Steps to reproduce
- Console errors (if any)
