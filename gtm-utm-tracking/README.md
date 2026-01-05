# UTM Tracker for Google Tag Manager

A comprehensive JavaScript solution for tracking UTM parameters and marketing attribution data in Google Tag Manager. This script automatically captures, stores, and makes UTM parameters available throughout your website and in GTM's dataLayer.

## Features

- **Automatic UTM Detection**: Captures UTM parameters from URL query strings
- **Persistent Storage**: Stores UTM data in both cookies and localStorage for reliability
- **GTM Integration**: Automatically pushes UTM data to GTM's dataLayer
- **Cross-Domain & Cross-Subdomain Tracking**: Track users across multiple domains and subdomains with automatic link decoration
- **Iframe Tracking**: Updates iframe URLs with UTM parameters for complete tracking
- **Multi-Platform Support**: Tracks gclid (Google), fbclid (Facebook), msclkid (Microsoft), and twclid (Twitter)
- **Configurable**: Extensive configuration options for customization
- **Production-Ready**: Includes error handling, debug mode, and comprehensive logging

## Quick Start

### Option 1: Custom HTML Tag (Recommended)

1. **Copy the script** from `utm-tracker.js`

2. **In Google Tag Manager**:
   - Go to **Tags** → **New**
   - Tag Type: **Custom HTML**
   - Paste the entire script content
   - Triggering: **All Pages** (Page View)
   - Advanced Settings → Tag firing options: **Once per page**
   - Save and name it "UTM Tracker"

3. **Preview and Publish** your container

### Option 2: External JavaScript File

1. **Upload** `utm-tracker.js` to your web server

2. **In Google Tag Manager**:
   - Go to **Tags** → **New**
   - Tag Type: **Custom HTML**
   - Add this code:
   ```html
   <script src="https://your-domain.com/path/to/utm-tracker.js"></script>
   ```
   - Triggering: **All Pages** (Page View)
   - Advanced Settings → Tag firing options: **Once per page**
   - Save and publish

## Cross-Domain & Subdomain Tracking

The tracker supports both cross-subdomain and cross-domain tracking for seamless UTM attribution across your entire web ecosystem.

### Quick Setup for Subdomains

To track across subdomains (e.g., `www.example.com` → `shop.example.com`):

```javascript
window.UTMTracker.configure({
    cookieDomain: '.example.com'  // Note the leading dot
});
```

### Quick Setup for Multiple Domains

To track across different domains (e.g., `marketing.com` → `app.platform.io`):

```javascript
window.UTMTracker.configure({
    enableCrossDomainTracking: true,
    allowedDomains: [
        'marketing.com',
        'app.platform.io'
    ],
    autoDecorateLinks: true
});
```

**📖 For detailed setup instructions, troubleshooting, and advanced examples, see [CROSS-DOMAIN-SETUP.md](CROSS-DOMAIN-SETUP.md)**

## Configuration

You can customize the tracker by modifying the `CONFIG` object at the top of the script:

```javascript
var CONFIG = {
    // Cookie settings
    cookieExpireDays: 30,              // How long to store UTM data
    cookiePrefix: 'utm_',              // Prefix for cookie names
    cookieDomain: null,                // Set to '.yourdomain.com' for cross-subdomain tracking

    // Cross-domain tracking
    enableCrossDomainTracking: false,  // Enable cross-domain link decoration
    allowedDomains: [],                // e.g., ['example.com', 'shop.example.com']
    autoDecorateLinks: true,           // Automatically decorate links to allowed domains
    linkDecoratorSelectors: 'a[href]', // CSS selector for links to decorate
    formDecoratorSelectors: 'form[action]', // CSS selector for forms to decorate

    // GTM integration
    enableDataLayer: true,             // Enable/disable dataLayer pushes
    dataLayerName: 'dataLayer',        // Name of your dataLayer (default: 'dataLayer')
    pushInitialEvent: true,            // Push event when UTMs are first captured
    initialEventName: 'utm_captured',  // Event name for initial capture

    // Parameters to track
    utmParams: [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'utm_id',
        'gclid',      // Google Click ID
        'fbclid',     // Facebook Click ID
        'msclkid',    // Microsoft Click ID
        'twclid'      // Twitter Click ID
    ],

    // Iframe settings
    enableIframeTracking: true,        // Update iframe URLs with UTM parameters
    iframeUpdateDelay: 500,            // Delay before updating iframes (ms)
    excludeIframeDomains: [            // Domains to exclude from iframe tracking
        'youtube.com',
        'vimeo.com',
        'wistia.com'
    ],

    // Debug mode
    debug: false                       // Enable console logging
};
```

## DataLayer Events

The script pushes the following events to the dataLayer:

### 1. `utm_captured` (default event)

Triggered when UTM parameters are first detected in the URL.

```javascript
{
    event: 'utm_captured',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'summer_sale',
    utm_term: 'running shoes',
    utm_content: 'ad_variant_a',
    gclid: 'Tester123'
}
```

### 2. `utm_updated`

Triggered when UTMs are manually updated via the API.

### 3. `utm_cleared`

Triggered when UTMs are cleared via the API.

## Using UTM Data in GTM

### Method 1: Create Data Layer Variables

1. In GTM, go to **Variables** → **New**
2. Variable Type: **Data Layer Variable**
3. Data Layer Variable Name: `utm_source` (or any UTM parameter)
4. Repeat for each UTM parameter you want to track

### Method 2: Use Built-in Variables

The script also exposes a global `UTMData` object:

```javascript
// Available in GTM Custom JavaScript variables
window.UTMData.utm_source
window.UTMData.utm_medium
// etc.
```

### Method 3: Use the Public API

Create a Custom JavaScript variable in GTM:

```javascript
function() {
    return window.UTMTracker.getUTM('utm_source');
}
```

## Creating GTM Triggers

### Example: Fire tag when UTMs are captured

1. **Trigger Type**: Custom Event
2. **Event Name**: `utm_captured`
3. **Use this trigger** on tags that should fire when UTM parameters are detected

### Example: Fire tag only for specific campaigns

1. **Trigger Type**: Custom Event
2. **Event Name**: `utm_captured`
3. **This trigger fires on**: Some Custom Events
4. **Condition**: `utm_campaign` equals `summer_sale`

## Passing UTMs to Conversion Tags

### Google Ads Conversion Tracking

Create the following Data Layer Variables:
- `utm_source`
- `utm_medium`
- `utm_campaign`

Then in your Google Ads Conversion Tag:
- **Custom Parameters** → Add:
  - `source: {{utm_source}}`
  - `medium: {{utm_medium}}`
  - `campaign: {{utm_campaign}}`

### Facebook Pixel

In your Facebook Pixel tag, add custom parameters:

```javascript
fbq('trackCustom', 'Purchase', {
    utm_source: {{utm_source}},
    utm_medium: {{utm_medium}},
    utm_campaign: {{utm_campaign}}
});
```

### Google Analytics 4

GA4 automatically captures UTM parameters, but you can also send them as custom parameters:

```javascript
gtag('event', 'conversion', {
    'utm_source': {{utm_source}},
    'utm_medium': {{utm_medium}},
    'utm_campaign': {{utm_campaign}}
});
```

## JavaScript API

The script exposes a global `window.UTMTracker` object with the following methods:

### `getUTMs()`

Returns all UTM parameters as an object.

```javascript
var allUTMs = window.UTMTracker.getUTMs();
// Returns: { utm_source: 'google', utm_medium: 'cpc', ... }
```

### `getUTM(param)`

Returns a specific UTM parameter.

```javascript
var source = window.UTMTracker.getUTM('utm_source');
// Returns: 'google'
```

### `setUTMs(utms)`

Manually set UTM parameters.

```javascript
window.UTMTracker.setUTMs({
    utm_source: 'newsletter',
    utm_medium: 'email',
    utm_campaign: 'weekly_digest'
});
```

### `clearUTMs()`

Clear all stored UTM parameters.

```javascript
window.UTMTracker.clearUTMs();
```

### `configure(options)`

Update configuration at runtime.

```javascript
window.UTMTracker.configure({
    debug: true,
    cookieExpireDays: 60
});
```

### `updateIframes()`

Manually trigger iframe URL updates.

```javascript
window.UTMTracker.updateIframes();
```

### `decorateLinks()`

Manually decorate links with UTM parameters.

```javascript
window.UTMTracker.decorateLinks();
```

### `decorateForms()`

Manually decorate forms with UTM parameters.

```javascript
window.UTMTracker.decorateForms();
```

### `decorateURL(url)`

Manually decorate a specific URL with UTM parameters.

```javascript
var decoratedURL = window.UTMTracker.decorateURL('https://example.com/page');
// Returns: 'https://example.com/page?utm_source=google&utm_medium=cpc&...'
```

### `getConfig()`

Get current configuration.

```javascript
var config = window.UTMTracker.getConfig();
```

## Advanced Use Cases

### Cross-Subdomain Tracking

Set the `cookieDomain` to your root domain:

```javascript
cookieDomain: '.yourdomain.com'
```

This allows UTM parameters to persist across `www.yourdomain.com`, `shop.yourdomain.com`, etc.

### Custom Event Names

Change the event name pushed to dataLayer:

```javascript
initialEventName: 'marketing_attribution_captured'
```

### Adding Custom Parameters

Add custom tracking parameters to the `utmParams` array:

```javascript
utmParams: [
    'utm_source',
    'utm_medium',
    // ... other standard params
    'affiliate_id',
    'partner_code',
    'referral_id'
]
```

### Debug Mode

Enable detailed console logging:

```javascript
debug: true
```

Or enable at runtime:

```javascript
window.UTMTracker.configure({ debug: true });
```

### Multi-Touch Attribution

Store all UTM touches by creating custom logic:

```javascript
// In a Custom HTML tag that fires after UTM Tracker
var utms = window.UTMTracker.getUTMs();
var touches = JSON.parse(localStorage.getItem('attribution_touches') || '[]');

if (Object.keys(utms).length > 0) {
    touches.push({
        timestamp: new Date().toISOString(),
        utms: utms,
        page: window.location.href
    });
    localStorage.setItem('attribution_touches', JSON.stringify(touches));
}
```

## Iframe Tracking

The script automatically updates iframe URLs with UTM parameters, which is useful for:

- Embedded forms (Typeform, JotForm, etc.)
- Payment gateways
- Booking widgets
- Chat widgets
- Any embedded content that needs attribution data

### Excluded Domains

By default, these domains are excluded from iframe tracking:
- YouTube
- Vimeo
- Wistia
- Vidyard

Add more excluded domains in the configuration:

```javascript
excludeIframeDomains: [
    'youtube.com',
    'vimeo.com',
    'your-excluded-domain.com'
]
```

## Troubleshooting

### UTMs not appearing in dataLayer

1. Check that `enableDataLayer` is `true`
2. Verify your URL has UTM parameters
3. Enable debug mode: `window.UTMTracker.configure({ debug: true })`
4. Check browser console for errors
5. Verify GTM Preview mode shows the `utm_captured` event

### UTMs not persisting

1. Check browser allows cookies
2. Verify `cookieExpireDays` is set correctly
3. Check for cookie domain issues (try setting `cookieDomain` to `null`)
4. Verify localStorage is enabled

### Iframes not updating

1. Check that `enableIframeTracking` is `true`
2. Verify the iframe domain is not in `excludeIframeDomains`
3. Check browser console for CORS or security errors
4. Some iframes may block parameter injection for security reasons

### Cross-Subdomain Issues

1. Set `cookieDomain` to your root domain: `.yourdomain.com`
2. Ensure the domain starts with a dot (`.`)
3. Test in an incognito window to avoid cached cookies

## Best Practices

### 1. Tag Firing Order

Set the UTM Tracker tag to:
- **Tag Sequencing** → Fire before other marketing tags
- This ensures UTM data is available for all subsequent tags

### 2. Attribution Window

Set `cookieExpireDays` based on your sales cycle:
- **Short cycle** (e-commerce): 7-30 days
- **Medium cycle** (B2B SaaS): 30-90 days
- **Long cycle** (Enterprise): 90-180 days

### 3. Data Layer Variable Naming

Use consistent naming in GTM:
- Create variables named exactly as UTM parameters: `utm_source`, `utm_medium`, etc.
- This makes debugging easier

### 4. Testing

Always test in GTM Preview mode:
1. Add UTM parameters to your URL: `?utm_source=test&utm_medium=test`
2. Verify the `utm_captured` event fires
3. Check that Data Layer Variables populate correctly
4. Test conversion tags receive the UTM data

### 5. Privacy Compliance

- Document UTM tracking in your privacy policy
- Consider GDPR/CCPA compliance (tracking parameters may contain personal data)
- Implement consent management if required

## Migration from WordPress Version

This GTM version has several improvements over the WordPress version:

### New Features
- ✅ Full GTM dataLayer integration
- ✅ Support for Microsoft and Twitter click IDs
- ✅ Enhanced configuration options
- ✅ Public API for programmatic access
- ✅ Better error handling and logging
- ✅ Runtime configuration updates

### Changes
- ❌ No longer requires WordPress
- ✅ Works with any website (static, CMS, SPA, etc.)
- ✅ More flexible deployment options
- ✅ Better cross-subdomain support

### Migration Steps

1. Remove the WordPress PHP function
2. Deploy this script via GTM (Custom HTML tag)
3. Test with GTM Preview mode
4. Verify dataLayer events are firing
5. Update any tags that depend on UTM data

## Browser Support

- ✅ Chrome (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Edge (all versions)
- ✅ IE11 (with polyfills for URLSearchParams)

## Performance

- **Size**: ~8KB minified
- **Load time**: < 5ms on modern browsers
- **No external dependencies**
- **Async execution**: Does not block page rendering

## Security

- ✅ No eval() or unsafe code execution
- ✅ Properly encodes/decodes cookie values
- ✅ SameSite=Lax cookie attribute for CSRF protection
- ✅ No external API calls
- ✅ XSS-safe parameter handling

## License

MIT License - feel free to use in commercial and personal projects.

## Support

For issues, questions, or feature requests, please open an issue in the repository.

## Version History

### v2.1.0 (Current)
- Added cross-domain tracking with automatic link decoration
- Added cross-subdomain tracking support
- Added form decoration for cross-domain attribution
- New API methods: `decorateLinks()`, `decorateForms()`, `decorateURL()`
- Enhanced configuration with cross-domain options
- Added comprehensive cross-domain setup guide

### v2.0.0
- Migrated from WordPress to GTM
- Added dataLayer integration
- Added support for msclkid and twclid
- Added public API
- Enhanced configuration options
- Improved error handling

### v1.0.0
- Initial WordPress version

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.
