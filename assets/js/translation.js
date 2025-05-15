/**
 * Translation functionality for the website
 * Custom implementation for Google Translate Language Switcher
 * To handle translation through Google Translate API
 */

// Initialize language switcher
function initLanguageSwitcher() {
    // Create the language switcher if it doesn't exist
    if ($('#google_translate_element').length && $('#language-switcher').length === 0) {
        createLanguageSwitcher();
        
        // Check if we have a stored language preference in localStorage
        var storedLanguage = localStorage.getItem('selectedLanguage');
        if (storedLanguage && storedLanguage !== 'en') {
            // Check if the translation is already applied via cookie
            var currentLang = getCurrentLanguageFromCookie();
            if (!currentLang || currentLang !== storedLanguage) {
                // Apply the stored language preference
                setTimeout(function() {
                    translatePage(storedLanguage);
                }, 1000);
            }
        }
    }
}

// Function to create a custom language switcher
function createLanguageSwitcher() {    
    // Define available languages
    var languages = [
        { code: 'en', name: 'English', flag: 'gb' },
        { code: 'fr', name: 'French', flag: 'fr' },
        { code: 'de', name: 'German', flag: 'de' },
        { code: 'es', name: 'Spanish', flag: 'es' },
        { code: 'it', name: 'Italian', flag: 'it' },
        { code: 'pt', name: 'Portuguese', flag: 'pt' },
        { code: 'ro', name: 'Romanian', flag: 'ro' },
        { code: 'fi', name: 'Finnish', flag: 'fi' },
        { code: 'nl', name: 'Dutch', flag: 'nl' },
        { code: 'zh-CN', name: 'Chinese', flag: 'cn' }
    ];
    
    // Get the current language from cookie or default to English
    var currentLangCode = getCurrentLanguageFromCookie() || 'en';
    var currentLangName = 'English'; // Default
    var currentLangFlag = 'gb'; // Default
    
    // Find the name for the current language code
    for (var i = 0; i < languages.length; i++) {
        if (languages[i].code === currentLangCode) {
            currentLangName = languages[i].name;
            currentLangFlag = languages[i].flag;
            break;
        }
    }
    
    // Create the dropdown button with inline SVG for globe icon
    var $dropdown = $('<div id="language-switcher" class="language-dropdown">' +
        '<div class="selected-language">' +
            '<span class="flag-icon flag-icon-' + currentLangFlag + '"></span>' +
            '<span class="language-text">' + currentLangName + '</span>' +
            '<div class="dropdown-arrow"></div>' +
        '</div>' +
        '<div class="language-options"></div>' +
    '</div>');
    
    // Add language options
    var $options = $dropdown.find('.language-options');
    languages.forEach(function(lang) {
        var isSelected = lang.code === currentLangCode;
        var $option = $('<div class="language-option' + (isSelected ? ' selected' : '') + '" data-lang-code="' + lang.code + '">' +
                        '<span class="flag-icon flag-icon-' + lang.flag + '"></span>' + 
                        lang.name + '</div>');
        $options.append($option);
    });
    
    // Add the dropdown to the page
    $('#google_translate_element').html($dropdown);
    
    // Handle dropdown toggle
    $dropdown.find('.selected-language').on('click', function(e) {
        e.stopPropagation();
        $dropdown.toggleClass('open');
        
        // Ensure the selected language is visible in the dropdown by scrolling to it
        if ($dropdown.hasClass('open')) {
            var $selectedOption = $dropdown.find('.language-option.selected');
            if ($selectedOption.length) {
                setTimeout(function() {
                    var $optionsContainer = $dropdown.find('.language-options');
                    $optionsContainer.scrollTop($selectedOption.position().top - $optionsContainer.height()/2 + $selectedOption.height()/2);
                }, 50);
            }
            
            // Check if we need to adjust position based on screen height
            adjustDropdownPosition($dropdown);
        }
    });
    
    // Handle language selection
    $dropdown.find('.language-option').on('click', function(e) {
        e.stopPropagation();
        var langCode = $(this).data('lang-code');
        var langName = $(this).text().trim();
        var $flagIcon = $(this).find('.flag-icon');
        var flagClass = $flagIcon.attr('class').replace('flag-icon ', '');
        
        // Update the selected language display
        $dropdown.find('.language-text').text(langName);
        $dropdown.find('.selected-language .flag-icon').attr('class', flagClass);
        
        // Update selected class
        $dropdown.find('.language-option').removeClass('selected');
        $(this).addClass('selected');
        
        // Close the dropdown
        $dropdown.removeClass('open');
        
        // Store the selected language
        localStorage.setItem('selectedLanguage', langCode);
        
        // Perform the translation
        translatePage(langCode);
        
        // If Google Translate is blocked, at least update the UI to show the selected language
        setTimeout(function() {
            // Check if translation was applied
            var currentLang = getCurrentLanguageFromCookie();
            if (currentLang === langCode) {
            } else {
                // Update the dropdown text
                $dropdown.find('.language-text').text(langName);
                // Update the flag
                $dropdown.find('.selected-language .flag-icon').attr('class', flagClass);
                // Update selected class
                $dropdown.find('.language-option').removeClass('selected');
                $dropdown.find('.language-option[data-lang-code="' + langCode + '"]').addClass('selected');
            }
        }, 500);
    });
    
    // Close dropdown when clicking outside
    $(document).on('click', function() {
        $dropdown.removeClass('open');
    });
    
    // Prevent scrolling issues when dropdown is open and near the bottom of the screen
    $(window).on('resize', function() {
        var $dropdown = $('#language-switcher');
        
        if ($dropdown.length && $dropdown.hasClass('open')) {
            adjustDropdownPosition($dropdown);
        }
    });
}

// New function to adjust dropdown position based on available space
function adjustDropdownPosition($dropdown) {
    var windowHeight = $(window).height();
    var dropdownTop = $dropdown.offset().top;
    var dropdownHeight = $dropdown.outerHeight();
    var optionsHeight = 180; // Default maximum height
    
    // If we're in a small height environment
    if (windowHeight < 800) {
        var $options = $dropdown.find('.language-options');
        
        // Calculate available space below
        var spaceBelow = windowHeight - dropdownTop - dropdownHeight;
        // Calculate available space above
        var spaceAbove = dropdownTop;
        
        if (spaceBelow < 150 && spaceAbove > spaceBelow) {
            // Force the dropdown to open upward if there's more space above
            $options.css({
                'max-height': Math.min(spaceAbove - 20, 150) + 'px'
            });
        } else {
            // Open downward with adjusted height
            $options.css({
                'max-height': Math.min(spaceBelow - 20, 150) + 'px'
            });
        }
    }
}

// Function to get the current language from the Google Translate cookie
function getCurrentLanguageFromCookie() {
    try {
        var match = document.cookie.match(/(^|;)\s*googtrans=([^;]+)/);
        if (match) {
            // Cookie format is /source/target
            var parts = decodeURIComponent(match[2]).split('/');
            if (parts.length === 3) {
                return parts[2]; // Return the target language
            }
        }
    } catch (e) {
        console.error("Error reading language cookie:", e);
    }
    return null;
}

// Function to translate the page using Google Translate API
function translatePage(langCode) {
    // If it's the default language (English), just reload the page
    if (langCode === 'en') {
        // Remove any translation cookies
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + document.domain;
        
        // Also try to remove cookies for subdomains
        var hostParts = document.domain.split('.');
        if (hostParts.length >= 2) {
            var mainDomain = hostParts.slice(-2).join('.');
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + mainDomain;
        }
        
        // Reload the page to show original content
        window.location.reload();
        return;
    }
    
    // Set the Google Translate cookie directly
    var now = new Date();
    var expTime = now.getTime() + 999999999;
    now.setTime(expTime);
    
    // Format: /source language/target language
    var cookieValue = '/auto/' + langCode;
    
    // Set cookies for translation at different domain levels to ensure it works
    document.cookie = 'googtrans=' + cookieValue + '; expires=' + now.toGMTString() + '; path=/;';
    document.cookie = 'googtrans=' + cookieValue + '; expires=' + now.toGMTString() + '; path=/; domain=' + document.domain;
    document.cookie = 'googtrans=' + cookieValue + '; expires=' + now.toGMTString() + '; path=/; domain=.' + document.domain;
    
    // Also try to set cookies for main domain
    var hostParts = document.domain.split('.');
    if (hostParts.length >= 2) {
        var mainDomain = hostParts.slice(-2).join('.');
        document.cookie = 'googtrans=' + cookieValue + '; expires=' + now.toGMTString() + '; path=/; domain=.' + mainDomain;
    }
    
    // Try to trigger translation directly if Google Translate is loaded
    var translationTriggered = false;
    
    if (typeof google !== 'undefined' && typeof google.translate !== 'undefined') {
        try {
            // Try to use the hidden Google Translate element
            var hiddenElement = document.getElementById('google_translate_element_hidden');
            if (hiddenElement) {
                var selectElement = hiddenElement.querySelector('.goog-te-combo');
                if (selectElement) {
                    selectElement.value = langCode;
                    selectElement.dispatchEvent(new Event('change'));
                    translationTriggered = true;
                }
            }
        } catch (e) {
            console.error('Error triggering Google Translate:', e);
        }
    }
    
    // If we couldn't trigger the translation directly, try a fallback approach
    if (!translationTriggered) {
        // Try to detect if we're being blocked by an ad blocker
        var testImg = new Image();
        testImg.src = 'https://translate.google.com/favicon.ico?t=' + new Date().getTime();
        testImg.onload = function() {
            // Google Translate is accessible, reload the page to apply cookie-based translation
            window.location.reload();
        };
        testImg.onerror = function() {
            // Google Translate might be blocked, use a fallback method
            useFallbackTranslation(langCode);
        };
        
        // Set a timeout in case the image test takes too long
        setTimeout(function() {
            if (!translationTriggered) {
                window.location.reload();
            }
        }, 1000);
    } else {
        // Force a page reload to apply the translation
        window.location.reload();
    }
}

// Fallback translation method that uses a direct URL to Google Translate's website
function useFallbackTranslation(langCode) {
    // Store the selected language in localStorage so we can restore it later
    localStorage.setItem('selectedLanguage', langCode);
    
    // Ask the user if they want to use the external translation service
    if (confirm('Translation service may be blocked by your browser. Would you like to use an external translation service?')) {
        // Redirect to Google Translate's website
        var currentUrl = window.location.href;
        window.location.href = 'https://translate.google.com/translate?sl=auto&tl=' + langCode + '&u=' + encodeURIComponent(currentUrl);
    }
}

// Function to style the Google Translate iframe if needed
function styleGoogleTranslateIframe(iframe) {
    try {
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        
        // Add custom styles to the iframe content
        var style = iframeDocument.createElement('style');
        style.textContent = `
            .goog-te-menu2 {
                max-height: 300px !important;
                overflow-y: auto !important;
                background-color: #000 !important;
                border: 1px solid #444 !important;
            }
            
            .goog-te-menu2-item div, .goog-te-menu2-item:link div, 
            .goog-te-menu2-item:visited div, .goog-te-menu2-item:active div {
                color: #fff !important;
                background-color: #000 !important;
            }
            
            .goog-te-menu2-item:hover div {
                background-color: #111 !important;
            }
            
            .goog-te-menu2-item-selected div {
                background-color: #111 !important;
            }
        `;
        
        iframeDocument.head.appendChild(style);
    } catch (e) {
        console.error("Could not style Google Translate iframe:", e);
    }
}

// Add a DOM ready listener to initialize the language switcher
$(document).ready(function() {
    // Initialize language switcher
    initLanguageSwitcher();
    
    // Add a mutation observer to handle dynamically added iframes
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    if (node.tagName && node.tagName.toLowerCase() === 'iframe' && 
                        node.classList.contains('goog-te-menu-frame')) {
                        // Style the Google Translate iframe if needed
                        styleGoogleTranslateIframe(node);
                        break;
                    }
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
