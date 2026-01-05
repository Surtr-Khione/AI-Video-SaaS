/**
 * UTM Tracker for Google Tag Manager
 *
 * This script captures UTM parameters from URLs, stores them in cookies and localStorage,
 * and makes them available to GTM via the dataLayer.
 *
 * Features:
 * - Automatic UTM parameter detection and storage
 * - Cookie-based persistence with configurable expiration
 * - localStorage backup for reliability
 * - Automatic iframe URL updating with UTM parameters
 * - Google Tag Manager dataLayer integration
 * - Support for utm_*, gclid, and fbclid parameters
 * - Cross-domain and cross-subdomain tracking
 * - Automatic link decoration for external domains
 *
 * @version 2.1.0
 * @license MIT
 */

(function(window, document) {
    'use strict';

    // Configuration
    var CONFIG = {
        // Cookie settings
        cookieExpireDays: 30,
        cookiePrefix: 'utm_',
        cookieDomain: null, // Set to your domain (e.g., '.example.com') for cross-subdomain tracking

        // Storage settings
        storageKey: 'utm_params',

        // Cross-domain tracking
        enableCrossDomainTracking: false,
        allowedDomains: [], // e.g., ['example.com', 'shop.example.com', 'app.example.net']
        autoDecorateLinks: true,
        linkDecoratorSelectors: 'a[href]', // CSS selector for links to decorate
        formDecoratorSelectors: 'form[action]', // CSS selector for forms to decorate

        // GTM integration
        enableDataLayer: true,
        dataLayerName: 'dataLayer',
        pushInitialEvent: true,
        initialEventName: 'utm_captured',

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
        enableIframeTracking: true,
        iframeUpdateDelay: 500,
        excludeIframeDomains: [
            'youtube.com',
            'youtu.be',
            'vimeo.com',
            'wistia.com',
            'wistia.net',
            'vidyard.com'
        ],

        // Debug mode
        debug: false
    };

    /**
     * Logger utility for debugging
     */
    var Logger = {
        log: function() {
            if (CONFIG.debug && window.console) {
                console.log.apply(console, ['[UTM Tracker]'].concat(Array.prototype.slice.call(arguments)));
            }
        },
        error: function() {
            if (window.console) {
                console.error.apply(console, ['[UTM Tracker]'].concat(Array.prototype.slice.call(arguments)));
            }
        }
    };

    /**
     * Cookie utility functions
     */
    var CookieUtil = {
        set: function(name, value, days, domain) {
            var expires = '';
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toUTCString();
            }

            var domainAttr = '';
            if (domain) {
                domainAttr = '; domain=' + domain;
            }

            var cookieString = name + '=' + encodeURIComponent(value) +
                             expires +
                             domainAttr +
                             '; path=/; SameSite=Lax';

            document.cookie = cookieString;
            Logger.log('Cookie set:', name, '=', value);
        },

        get: function(name) {
            var nameEQ = name + '=';
            var cookies = document.cookie.split(';');

            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                if (cookie.indexOf(nameEQ) === 0) {
                    return decodeURIComponent(cookie.substring(nameEQ.length));
                }
            }
            return null;
        },

        delete: function(name, domain) {
            var domainAttr = domain ? '; domain=' + domain : '';
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/' + domainAttr;
            Logger.log('Cookie deleted:', name);
        }
    };

    /**
     * localStorage utility functions
     */
    var StorageUtil = {
        set: function(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                Logger.log('LocalStorage set:', key, data);
                return true;
            } catch (e) {
                Logger.error('LocalStorage set failed:', e);
                return false;
            }
        },

        get: function(key) {
            try {
                var data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                Logger.error('LocalStorage get failed:', e);
                return null;
            }
        },

        delete: function(key) {
            try {
                localStorage.removeItem(key);
                Logger.log('LocalStorage deleted:', key);
                return true;
            } catch (e) {
                Logger.error('LocalStorage delete failed:', e);
                return false;
            }
        }
    };

    /**
     * Google Tag Manager dataLayer utility
     */
    var DataLayerUtil = {
        push: function(data) {
            if (!CONFIG.enableDataLayer) {
                return;
            }

            try {
                window[CONFIG.dataLayerName] = window[CONFIG.dataLayerName] || [];
                window[CONFIG.dataLayerName].push(data);
                Logger.log('DataLayer push:', data);
            } catch (e) {
                Logger.error('DataLayer push failed:', e);
            }
        },

        pushUTMs: function(utms, eventName) {
            if (Object.keys(utms).length === 0) {
                return;
            }

            var data = {
                event: eventName || CONFIG.initialEventName
            };

            // Add each UTM parameter to the dataLayer
            Object.keys(utms).forEach(function(key) {
                data[key] = utms[key];
            });

            this.push(data);
        }
    };

    /**
     * Cross-domain tracking utility
     */
    var CrossDomainUtil = {
        processedLinks: new WeakSet(),
        processedForms: new WeakSet(),

        /**
         * Check if a domain is in the allowed domains list
         */
        isAllowedDomain: function(hostname) {
            if (!CONFIG.enableCrossDomainTracking || CONFIG.allowedDomains.length === 0) {
                return false;
            }

            return CONFIG.allowedDomains.some(function(domain) {
                // Check for exact match or subdomain match
                return hostname === domain || hostname.endsWith('.' + domain);
            });
        },

        /**
         * Check if a URL is external (different domain)
         */
        isExternalURL: function(url) {
            try {
                var urlObj = new URL(url, window.location.origin);
                return urlObj.hostname !== window.location.hostname;
            } catch (e) {
                return false;
            }
        },

        /**
         * Add UTM parameters to a URL
         */
        decorateURL: function(url, utms) {
            if (Object.keys(utms).length === 0) {
                return url;
            }

            try {
                var urlObj = new URL(url, window.location.origin);

                // Only add UTMs that don't already exist
                Object.keys(utms).forEach(function(param) {
                    if (!urlObj.searchParams.has(param)) {
                        urlObj.searchParams.set(param, utms[param]);
                    }
                });

                return urlObj.toString();
            } catch (e) {
                Logger.error('Error decorating URL:', e);
                return url;
            }
        },

        /**
         * Decorate links with UTM parameters
         */
        decorateLinks: function(utms) {
            if (!CONFIG.enableCrossDomainTracking || !CONFIG.autoDecorateLinks) {
                return;
            }

            if (Object.keys(utms).length === 0) {
                return;
            }

            var self = this;
            var links = document.querySelectorAll(CONFIG.linkDecoratorSelectors);

            links.forEach(function(link) {
                // Skip if already processed
                if (self.processedLinks.has(link)) {
                    return;
                }

                var href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                    self.processedLinks.add(link);
                    return;
                }

                try {
                    var urlObj = new URL(href, window.location.origin);

                    // Only decorate if it's an allowed external domain
                    if (self.isExternalURL(href) && self.isAllowedDomain(urlObj.hostname)) {
                        var decoratedURL = self.decorateURL(href, utms);
                        link.setAttribute('href', decoratedURL);
                        Logger.log('Link decorated:', decoratedURL);
                    }

                    self.processedLinks.add(link);
                } catch (e) {
                    Logger.error('Error processing link:', e);
                    self.processedLinks.add(link);
                }
            });
        },

        /**
         * Decorate forms with UTM parameters
         */
        decorateForms: function(utms) {
            if (!CONFIG.enableCrossDomainTracking || !CONFIG.autoDecorateLinks) {
                return;
            }

            if (Object.keys(utms).length === 0) {
                return;
            }

            var self = this;
            var forms = document.querySelectorAll(CONFIG.formDecoratorSelectors);

            forms.forEach(function(form) {
                // Skip if already processed
                if (self.processedForms.has(form)) {
                    return;
                }

                var action = form.getAttribute('action');
                if (!action) {
                    self.processedForms.add(form);
                    return;
                }

                try {
                    var urlObj = new URL(action, window.location.origin);

                    // Only decorate if it's an allowed external domain
                    if (self.isExternalURL(action) && self.isAllowedDomain(urlObj.hostname)) {
                        // Add hidden input fields for each UTM parameter
                        Object.keys(utms).forEach(function(param) {
                            // Check if input already exists
                            var existingInput = form.querySelector('input[name="' + param + '"]');
                            if (!existingInput) {
                                var input = document.createElement('input');
                                input.type = 'hidden';
                                input.name = param;
                                input.value = utms[param];
                                form.appendChild(input);
                            }
                        });

                        Logger.log('Form decorated with UTM fields');
                    }

                    self.processedForms.add(form);
                } catch (e) {
                    Logger.error('Error processing form:', e);
                    self.processedForms.add(form);
                }
            });
        },

        /**
         * Setup event listeners for dynamic link/form decoration
         */
        setupDynamicDecoration: function(utms) {
            if (!CONFIG.enableCrossDomainTracking || !CONFIG.autoDecorateLinks) {
                return;
            }

            var self = this;

            // Decorate links on click
            document.addEventListener('click', function(event) {
                var link = event.target.closest('a');
                if (link && !self.processedLinks.has(link)) {
                    var href = link.getAttribute('href');
                    if (href) {
                        try {
                            var urlObj = new URL(href, window.location.origin);
                            if (self.isExternalURL(href) && self.isAllowedDomain(urlObj.hostname)) {
                                var decoratedURL = self.decorateURL(href, utms);
                                link.setAttribute('href', decoratedURL);
                                self.processedLinks.add(link);
                            }
                        } catch (e) {
                            // Invalid URL, skip
                        }
                    }
                }
            }, true);

            Logger.log('Dynamic link decoration enabled');
        }
    };

    /**
     * Main UTM Tracker
     */
    var UTMTracker = {
        processedIframes: new WeakSet(),

        /**
         * Extract UTM parameters from current URL
         */
        getUTMsFromURL: function() {
            var params = new URLSearchParams(window.location.search);
            var utms = {};

            CONFIG.utmParams.forEach(function(param) {
                var value = params.get(param);
                if (value) {
                    utms[param] = value;
                }
            });

            Logger.log('UTMs from URL:', utms);
            return utms;
        },

        /**
         * Retrieve stored UTM parameters from cookies and localStorage
         */
        getStoredUTMs: function() {
            var utms = {};

            // First, try to get from cookies
            CONFIG.utmParams.forEach(function(param) {
                var value = CookieUtil.get(CONFIG.cookiePrefix + param);
                if (value) {
                    utms[param] = value;
                }
            });

            // If no cookies found, fallback to localStorage
            if (Object.keys(utms).length === 0) {
                var stored = StorageUtil.get(CONFIG.storageKey);
                if (stored) {
                    utms = stored;
                }
            }

            Logger.log('Stored UTMs:', utms);
            return utms;
        },

        /**
         * Store UTM parameters in cookies and localStorage
         */
        storeUTMs: function(utms) {
            if (Object.keys(utms).length === 0) {
                return;
            }

            // Store in cookies
            Object.keys(utms).forEach(function(param) {
                CookieUtil.set(
                    CONFIG.cookiePrefix + param,
                    utms[param],
                    CONFIG.cookieExpireDays,
                    CONFIG.cookieDomain
                );
            });

            // Merge with existing UTMs and store in localStorage
            var existingUTMs = this.getStoredUTMs();
            var mergedUTMs = Object.assign({}, existingUTMs, utms);
            StorageUtil.set(CONFIG.storageKey, mergedUTMs);

            Logger.log('UTMs stored:', utms);
        },

        /**
         * Get all UTM parameters (URL takes precedence over stored)
         */
        getAllUTMs: function() {
            var storedUTMs = this.getStoredUTMs();
            var urlUTMs = this.getUTMsFromURL();
            var allUTMs = Object.assign({}, storedUTMs, urlUTMs);

            Logger.log('All UTMs:', allUTMs);
            return allUTMs;
        },

        /**
         * Clear all stored UTM parameters
         */
        clearUTMs: function() {
            CONFIG.utmParams.forEach(function(param) {
                CookieUtil.delete(CONFIG.cookiePrefix + param, CONFIG.cookieDomain);
            });
            StorageUtil.delete(CONFIG.storageKey);
            Logger.log('All UTMs cleared');
        },

        /**
         * Check if iframe domain should be excluded from tracking
         */
        shouldExcludeIframe: function(url) {
            return CONFIG.excludeIframeDomains.some(function(domain) {
                return url.indexOf(domain) !== -1;
            });
        },

        /**
         * Update iframes with UTM parameters
         */
        updateIframes: function() {
            if (!CONFIG.enableIframeTracking) {
                return;
            }

            var self = this;
            var utms = this.getAllUTMs();

            if (Object.keys(utms).length === 0) {
                return;
            }

            var iframes = document.querySelectorAll('iframe');
            Logger.log('Found', iframes.length, 'iframes');

            iframes.forEach(function(iframe) {
                // Skip if already processed
                if (self.processedIframes.has(iframe)) {
                    return;
                }

                var src = iframe.getAttribute('src');
                if (!src) {
                    return;
                }

                // Skip excluded domains
                if (self.shouldExcludeIframe(src)) {
                    self.processedIframes.add(iframe);
                    Logger.log('Iframe excluded:', src);
                    return;
                }

                try {
                    var url = new URL(src, window.location.origin);
                    var modified = false;

                    // Add UTM parameters if they don't exist
                    Object.keys(utms).forEach(function(param) {
                        if (!url.searchParams.has(param)) {
                            url.searchParams.set(param, utms[param]);
                            modified = true;
                        }
                    });

                    self.processedIframes.add(iframe);

                    if (modified) {
                        iframe.setAttribute('src', url.toString());
                        Logger.log('Iframe updated:', url.toString());
                    }
                } catch (e) {
                    Logger.error('Error updating iframe:', e);
                    self.processedIframes.add(iframe);
                }
            });
        },

        /**
         * Setup MutationObserver for dynamic iframes
         */
        setupIframeObserver: function() {
            if (!CONFIG.enableIframeTracking) {
                return;
            }

            var self = this;
            var observer = new MutationObserver(function(mutations) {
                var hasNewIframes = false;

                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeName === 'IFRAME') {
                            hasNewIframes = true;
                        } else if (node.querySelectorAll) {
                            var iframes = node.querySelectorAll('iframe');
                            if (iframes.length > 0) {
                                hasNewIframes = true;
                            }
                        }
                    });
                });

                if (hasNewIframes) {
                    Logger.log('New iframes detected');
                    self.updateIframes();
                }
            });

            var observeBody = function() {
                if (document.body) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                    Logger.log('MutationObserver started');
                }
            };

            if (document.body) {
                observeBody();
            } else {
                document.addEventListener('DOMContentLoaded', observeBody);
            }
        },

        /**
         * Initialize the UTM tracker
         */
        init: function() {
            var self = this;

            Logger.log('Initializing UTM Tracker');

            // Get UTMs from URL
            var urlUTMs = this.getUTMsFromURL();

            // Store new UTMs if found
            if (Object.keys(urlUTMs).length > 0) {
                this.storeUTMs(urlUTMs);

                // Push to dataLayer
                if (CONFIG.pushInitialEvent) {
                    DataLayerUtil.pushUTMs(urlUTMs, CONFIG.initialEventName);
                }
            }

            // Get all UTMs for global access
            var allUTMs = this.getAllUTMs();

            // Expose UTMs globally
            window.UTMData = allUTMs;

            // Cross-domain link decoration
            var decorateLinksAndForms = function() {
                CrossDomainUtil.decorateLinks(allUTMs);
                CrossDomainUtil.decorateForms(allUTMs);
            };

            // Update iframes and cross-domain links on DOM ready
            var updateOnReady = function() {
                self.updateIframes();
                decorateLinksAndForms();
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', updateOnReady);
            } else {
                updateOnReady();
            }

            // Update iframes and links after page load (for delayed content)
            window.addEventListener('load', function() {
                setTimeout(function() {
                    self.updateIframes();
                    decorateLinksAndForms();
                }, CONFIG.iframeUpdateDelay);
            });

            // Setup observer for dynamic iframes
            this.setupIframeObserver();

            // Setup dynamic link decoration
            CrossDomainUtil.setupDynamicDecoration(allUTMs);

            Logger.log('UTM Tracker initialized with data:', allUTMs);
        }
    };

    /**
     * Public API
     */
    window.UTMTracker = {
        /**
         * Get all stored UTM parameters
         */
        getUTMs: function() {
            return UTMTracker.getAllUTMs();
        },

        /**
         * Get a specific UTM parameter
         */
        getUTM: function(param) {
            var utms = UTMTracker.getAllUTMs();
            return utms[param] || null;
        },

        /**
         * Manually store UTM parameters
         */
        setUTMs: function(utms) {
            UTMTracker.storeUTMs(utms);
            DataLayerUtil.pushUTMs(utms, 'utm_updated');
        },

        /**
         * Clear all UTM parameters
         */
        clearUTMs: function() {
            UTMTracker.clearUTMs();
            DataLayerUtil.push({ event: 'utm_cleared' });
        },

        /**
         * Update configuration
         */
        configure: function(options) {
            Object.keys(options).forEach(function(key) {
                if (CONFIG.hasOwnProperty(key)) {
                    CONFIG[key] = options[key];
                }
            });
            Logger.log('Configuration updated:', options);
        },

        /**
         * Manually trigger iframe update
         */
        updateIframes: function() {
            UTMTracker.updateIframes();
        },

        /**
         * Manually decorate links with UTM parameters
         */
        decorateLinks: function() {
            var utms = UTMTracker.getAllUTMs();
            CrossDomainUtil.decorateLinks(utms);
        },

        /**
         * Manually decorate forms with UTM parameters
         */
        decorateForms: function() {
            var utms = UTMTracker.getAllUTMs();
            CrossDomainUtil.decorateForms(utms);
        },

        /**
         * Manually decorate a specific URL with UTM parameters
         */
        decorateURL: function(url) {
            var utms = UTMTracker.getAllUTMs();
            return CrossDomainUtil.decorateURL(url, utms);
        },

        /**
         * Get current configuration
         */
        getConfig: function() {
            return Object.assign({}, CONFIG);
        }
    };

    // Auto-initialize
    UTMTracker.init();

})(window, document);
