/**
 * Main Application Module
 * Wrapped in IIFE to avoid global scope pollution
 */
(function(window, $) {
    'use strict';

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const APP_CONFIG = {
    BREAKPOINTS: {
        MOBILE: 1024,
        TABLET: 768,
        DESKTOP_LARGE: 1280
    },
    ANIMATION: {
        SLIDE_DURATION: 400,
        SUBMENU_EXPAND: 250,
        SUBMENU_COLLAPSE: 200,
        ACCORDION_DURATION: 300,
        INIT_DELAY: 500,
        CAROUSEL_UPDATE_DELAY: 100
    },
    CAROUSEL: {
        AUTOPLAY_SPEED: 6000,
        TRANSITION_SPEED: 300,
        DESKTOP_SLIDES: 3,
        DESKTOP_MATERIALS_SLIDES: 3.5,
        TABLET_SLIDES: 2.5,
        TABLET_SCROLL: 2,
        MOBILE_SLIDES: 1,
        MOBILE_MATERIALS_SLIDES: 1.2
    },
    CONTENT: {
        MAX_PARTNER_DESCRIPTION_LENGTH: 255,
        ABOUT_MENU_SCROLL_OFFSET: 100
    }
};

const CSS_CLASSES = {
    SCROLLED: 'scrolled',
    NAVBAR_HIDDEN: 'navbar-hidden',
    EXPANDED: 'expanded',
    ACTIVE: 'active',
    SUBMENU_OPEN: 'submenu-open',
    SLICK_DISABLED: 'slick-disabled',
    SLICK_INITIALIZED: 'slick-initialized',
    NO_TRANSITION: 'no-transition',
    SURVEY_NAV_ITEM: 'survey-nav-item'
};

const APP_SELECTORS = {
    HEADER_NAVBAR: '#headernavbar',
    HEADER_IMAGE: '.header-image',
    MENU: '#menu',
    MENU_TOGGLE: '#menuToggle input[type="checkbox"]',
    SEARCH: '#search',
    NAV_ITEM: '.nav-item',
    DROPDOWN: '.dropdown',
    DROPDOWN_MENU: '.dropdown-menu',
    ACCORDION_HEADER: '.accordion-header',
    ACCORDION_CONTENT: '.accordion-content'
};

// Global state
let viewportWidth = window.innerWidth;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if current viewport is mobile size
 * @returns {boolean} True if viewport width is mobile or smaller
 */
function isMobileViewport() {
    return window.innerWidth <= APP_CONFIG.BREAKPOINTS.MOBILE;
}

/**
 * Check if document has vertical scroll
 * @returns {boolean} True if document height exceeds window height
 */
function documentHasScroll() {
    return window.innerHeight <= document.body.offsetHeight;
}

/**
 * Remove dropdown toggle attributes from navigation items
 * This prevents default Bootstrap dropdown behavior
 */
function removeDropdownToggles() {
    $(APP_SELECTORS.NAV_ITEM).children('a').each(function() {
        if ($(this).attr('data-toggle') === 'dropdown') {
            $(this).removeAttr('data-toggle');
        }
    });
}

/**
 * Set the width of header navbar and full-width elements
 */
function setHeaderWidths() {
    const innerWidth = $('body').innerWidth();
    $('#headerNavbar').width(innerWidth);
    $('.width100').width(innerWidth);
}

// ============================================================================
// NAVBAR SCROLL BEHAVIOR
// ============================================================================

/**
 * Handle navbar scroll behavior
 * Adds/removes classes based on scroll position and hero section
 */
function handleNavbarScroll() {
    const headerNavbar = document.getElementById('headernavbar');
    if (!headerNavbar) return;
    
    const heroSection = document.querySelector(APP_SELECTORS.HEADER_IMAGE);
    const scrollY = window.scrollY;

    if (heroSection) {
        const heroHeight = heroSection.offsetHeight;
        if (scrollY > heroHeight) {
            headerNavbar.classList.add(CSS_CLASSES.SCROLLED, CSS_CLASSES.NAVBAR_HIDDEN);
        } else {
            headerNavbar.classList.remove(CSS_CLASSES.SCROLLED, CSS_CLASSES.NAVBAR_HIDDEN);
        }
    } else {
        // Fallback: use navbar height if no hero image exists
        if (scrollY > headerNavbar.offsetHeight) {
            headerNavbar.classList.add(CSS_CLASSES.SCROLLED);
        } else {
            headerNavbar.classList.remove(CSS_CLASSES.SCROLLED);
        }
    }
}

// Attach scroll event listener
window.addEventListener('scroll', handleNavbarScroll);

// ============================================================================
// MENU INITIALIZATION
// ============================================================================

/**
 * Initialize menu structure and survey navigation items
 */
function initializeMenuStructure() {
    // Set menu ID (required for functionality)
    $('.navbar-nav').attr('id', 'menu');
    
    // Add survey class to "Take the Survey" menu items
    $('.navbar-nav .nav-item a').each(function() {
        const $link = $(this);
        const href = $link.attr('href') || '';
        const text = $link.text().trim();
        
        if (text === 'Take the Survey' || 
            (href.length > 0 && href.indexOf('forms.cloud.microsoft') !== -1)) {
            $link.closest(APP_SELECTORS.NAV_ITEM).addClass(CSS_CLASSES.SURVEY_NAV_ITEM);
        }
    });
}

/**
 * Initialize calendar and profile card decorations
 */
function initializePageDecorations() {
    $('<div class="calendar-top"></div>').insertBefore('#calendar');
    $('<div class="card-profile-top"></div>').insertBefore('.card.profile.card-profile');
    
    // Wrap profile cards in pairs
    const $profileDivs = $('.card-profiles > div');
    for (let i = 0; i < $profileDivs.length; i += 2) {
        $profileDivs.slice(i, i + 2).wrapAll('<div class="col-xs" />');
    }
}

// ============================================================================
// ABOUT PAGE MENU
// ============================================================================

/**
 * Initialize About page menu functionality
 * Handles smooth scrolling and active state management
 */
function initializeAboutMenu() {
    if ($('.about-menu').length === 0) return;

    // Handle menu item clicks
    $('.about-menu-item').on('click', function(e) {
        e.preventDefault();

        const $clickedItem = $(this);
        const targetId = $clickedItem.attr('href');

        // Update active states
        $('.about-menu-item').removeClass(CSS_CLASSES.ACTIVE);
        $clickedItem.addClass(CSS_CLASSES.ACTIVE);

        // Smooth scroll to target section
        $('html, body').animate({
            scrollTop: $(targetId).offset().top - APP_CONFIG.CONTENT.ABOUT_MENU_SCROLL_OFFSET
        }, APP_CONFIG.ANIMATION.SLIDE_DURATION);

        // Update URL hash
        history.pushState(null, null, targetId);
    });

    // Set initial active state
    const currentHash = window.location.hash;
    if (currentHash) {
        $(`.about-menu-item[href="${currentHash}"]`).addClass(CSS_CLASSES.ACTIVE);
    } else {
        $('.about-menu-item:first').addClass(CSS_CLASSES.ACTIVE);
    }
}

// ============================================================================
// MOBILE MENU
// ============================================================================

/**
 * Set CSS properties for mobile menu visibility and interactivity
 */
function setMobileMenuStyles() {
    $(APP_SELECTORS.MENU).css({
        visibility: 'visible',
        'pointer-events': 'auto'
    });
    
    $(`${APP_SELECTORS.MENU} a, ${APP_SELECTORS.MENU} li`).css({
        visibility: 'visible',
        'pointer-events': 'auto',
        opacity: '1'
    });
    
    $(`${APP_SELECTORS.MENU} ${APP_SELECTORS.DROPDOWN_MENU}`).css({
        display: 'none',
        visibility: 'visible',
        'pointer-events': 'auto'
    });
}

/**
 * Handle mobile menu toggle
 */
function handleMobileMenuToggle() {
    $(APP_SELECTORS.MENU_TOGGLE).on('change', function() {
        const isChecked = $(this).is(':checked');
        
        if (isChecked) {
            $(APP_SELECTORS.MENU).show('slide', { direction: 'right' }, APP_CONFIG.ANIMATION.SLIDE_DURATION);
            $(APP_SELECTORS.SEARCH).hide();
            setMobileMenuStyles();
            $('body, html').css('overflow', 'hidden');
        } else {
            $(APP_SELECTORS.MENU).hide('slide', { direction: 'right' }, APP_CONFIG.ANIMATION.SLIDE_DURATION);
            $(APP_SELECTORS.SEARCH).hide();
            $('body, html').css('overflow', 'auto');
            
            // Reset submenu states
            $(`${APP_SELECTORS.MENU} ${APP_SELECTORS.DROPDOWN_MENU}`).hide();
            $(`${APP_SELECTORS.MENU} ${APP_SELECTORS.DROPDOWN} > a`).removeClass(CSS_CLASSES.EXPANDED);
            $(APP_SELECTORS.MENU + ' ' + APP_SELECTORS.DROPDOWN).removeClass(CSS_CLASSES.SUBMENU_OPEN);
        }
    });
}

/**
 * Handle mobile submenu toggle logic
 */
function handleMobileSubmenuToggle() {
    $(document).on('click', `${APP_SELECTORS.MENU} ${APP_SELECTORS.DROPDOWN} > a`, function(e) {
        if (window.innerWidth > APP_CONFIG.BREAKPOINTS.MOBILE) return;
        
        const $link = $(this);
        const $parent = $link.parent(APP_SELECTORS.DROPDOWN);
        const $submenu = $parent.children(APP_SELECTORS.DROPDOWN_MENU);
        
        if (!$submenu.length) return;
        
        const href = $link.attr('href');
        const isParentOnlyLink = !href || href === '#' || href === '';
        
        e.preventDefault();
        
        const isSubmenuOpen = $submenu.is(':visible');
        
        if (isSubmenuOpen) {
            // If submenu is open and has real href, navigate
            if (!isParentOnlyLink && href) {
                window.location.href = href;
            }
        } else {
            // Expand submenu
            $link.addClass(CSS_CLASSES.EXPANDED);
            $submenu.slideDown(APP_CONFIG.ANIMATION.SUBMENU_EXPAND);
            $parent.addClass(CSS_CLASSES.SUBMENU_OPEN);
            
            // Close other open submenus
            $parent.siblings(APP_SELECTORS.DROPDOWN)
                .children(`${APP_SELECTORS.DROPDOWN_MENU}:visible`)
                .slideUp(APP_CONFIG.ANIMATION.SUBMENU_COLLAPSE);
            $parent.siblings(APP_SELECTORS.DROPDOWN)
                .children('a')
                .removeClass(CSS_CLASSES.EXPANDED);
            $parent.siblings(APP_SELECTORS.DROPDOWN)
                .removeClass(CSS_CLASSES.SUBMENU_OPEN);
        }
    });
}

/**
 * Ensure regular menu links work properly on mobile
 */
function handleMobileRegularLinks() {
    $(document).on('click', `${APP_SELECTORS.MENU} a:not(${APP_SELECTORS.DROPDOWN} > a)`, function() {
        if (window.innerWidth > APP_CONFIG.BREAKPOINTS.MOBILE) return true;
        
        const href = $(this).attr('href');
        return href && href !== '#' && href !== '';
    });
}

/**
 * Initialize mobile menu functionality
 */
function initializeMobileMenu() {
    if (!isMobileViewport()) return;
    
    handleMobileMenuToggle();
    handleMobileSubmenuToggle();
    handleMobileRegularLinks();
}

/**
 * Ensure mobile menu is properly set up
 */
function ensureMobileMenuSetup() {
    if (viewportWidth > APP_CONFIG.BREAKPOINTS.MOBILE) return;
    
    setMobileMenuStyles();
}

// ============================================================================
// PARTNERS SECTION
// ============================================================================

/**
 * Organize partners into two columns (even/odd distribution)
 */
function organizePartnersColumns() {
    if (viewportWidth < APP_CONFIG.BREAKPOINTS.MOBILE || !$('#partners .key_0').length) return;
    
    // First column: even indices
    const evenKeys = Array.from({length: 10}, (_, i) => `#partners .key_${i * 2}`).join(', ');
    $(evenKeys).wrapAll('<div class="col-md-6 col-xs-12" />');
    
    // Second column: odd indices
    const oddKeys = Array.from({length: 10}, (_, i) => `#partners .key_${i * 2 + 1}`).join(', ');
    $(oddKeys).wrapAll('<div class="col-md-6 col-xs-12" />');
}

// ============================================================================
// ACCORDIONS
// ============================================================================

/**
 * Initialize general accordion functionality
 */
function initAccordions() {
    $(document).off('click.accordion');
    
    $(document).on('click.accordion', APP_SELECTORS.ACCORDION_HEADER, function(e) {
        e.preventDefault();
        
        const $header = $(this);
        const $content = $header.siblings(APP_SELECTORS.ACCORDION_CONTENT);
        const $parentItem = $header.closest('.accordion-item');
        const $contentAlt = $parentItem.find(APP_SELECTORS.ACCORDION_CONTENT);
        
        $header.toggleClass(CSS_CLASSES.EXPANDED);
        
        // Find content using either method
        const $targetContent = $content.length > 0 ? $content : $contentAlt;
        
        if ($header.hasClass(CSS_CLASSES.EXPANDED)) {
            $targetContent.css('max-height', $targetContent[0].scrollHeight + 'px');
        } else {
            $targetContent.css('max-height', '0');
        }
    });
}

/**
 * Initialize block accordion functionality for course materials
 */
function initBlockAccordion() {
    $(document).off('click.blockAccordion', '.block-header');
    
    $(document).on('click.blockAccordion', '.block-header', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const $blockHeader = $(this);
        const $headerRow = $blockHeader.closest('.row');
        const $materialsContainer = $headerRow.nextAll('.row').first()
            .find('.block-materials-container');

        if ($materialsContainer.length === 0) return false;
        
        $blockHeader.toggleClass(CSS_CLASSES.EXPANDED);

        if ($materialsContainer.hasClass(CSS_CLASSES.EXPANDED)) {
            $materialsContainer.slideUp(APP_CONFIG.ANIMATION.ACCORDION_DURATION, function() {
                $materialsContainer.removeClass(CSS_CLASSES.EXPANDED);
            });
        } else {
            $materialsContainer.addClass(CSS_CLASSES.EXPANDED)
                .slideDown(APP_CONFIG.ANIMATION.ACCORDION_DURATION);
        }
        
        return false;
    });
}

// ============================================================================
// TABS
// ============================================================================

/**
 * Open a specific tab (generic tab handler)
 * @param {Event} evt - Click event
 * @param {string} tabName - ID of tab to open
 * @param {string} num - Tab group identifier
 */
function openTab(evt, tabName, num) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName(`tabs_content${num}`);
    Array.from(tabContents).forEach(content => {
        content.style.display = 'none';
    });
    
    // Remove active class from all tab links
    const tabLinks = document.getElementsByClassName(`tablink${num}`);
    Array.from(tabLinks).forEach(link => {
        link.className = link.className.replace(' ' + CSS_CLASSES.ACTIVE, '');
    });
    
    // Show selected tab and mark as active
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' ' + CSS_CLASSES.ACTIVE;
}

/**
 * Initialize "What is DERTO" dots navigation
 */
function initDertoDotsNav() {
    const $dots = $('.what-is-derto .dot');
    if ($dots.length === 0) return;
    
    $dots.on('click', function() {
        const $clickedDot = $(this);
        
        // Update active dot
        $dots.removeClass(CSS_CLASSES.ACTIVE);
        $clickedDot.addClass(CSS_CLASSES.ACTIVE);
        
        // Update tab content
        const tabTarget = $clickedDot.data('tab');
        $('.what-is-derto .tab-content').removeClass(CSS_CLASSES.ACTIVE);
        $(`#${tabTarget}`).addClass(CSS_CLASSES.ACTIVE);
        
        // Update header text
        const newHeader = $clickedDot.data('header');
        if (newHeader) {
            $('.what-is-derto .header h2').html(newHeader);
        }
    });
    
    // Initialize first dot if none is active
    if ($('.what-is-derto .dot.' + CSS_CLASSES.ACTIVE).length === 0) {
        const $firstDot = $dots.first();
        $firstDot.addClass(CSS_CLASSES.ACTIVE);
        
        const firstTabId = $firstDot.data('tab');
        $(`#${firstTabId}`).addClass(CSS_CLASSES.ACTIVE);
        
        const initialHeader = $firstDot.data('header');
        if (initialHeader) {
            $('.what-is-derto .header h2').html(initialHeader);
        }
    } else {
        // Set header from active dot
        const activeHeader = $(`.what-is-derto .dot.${CSS_CLASSES.ACTIVE}`).data('header');
        if (activeHeader) {
            $('.what-is-derto .header h2').html(activeHeader);
        }
    }
}

// ============================================================================
// CAROUSELS
// ============================================================================

/**
 * Initialize card carousel with Slick
 */
function initCardCarousel() {
    const $carousel = $('#card-carousel');
    if (!$carousel.length || $carousel.hasClass(CSS_CLASSES.SLICK_INITIALIZED)) return;
    
    $carousel.slick({
        slidesToShow: isMobileViewport() ? APP_CONFIG.CAROUSEL.MOBILE_SLIDES : APP_CONFIG.CAROUSEL.DESKTOP_SLIDES,
        slidesToScroll: isMobileViewport() ? APP_CONFIG.CAROUSEL.MOBILE_SLIDES : APP_CONFIG.CAROUSEL.DESKTOP_SLIDES,
        autoplay: true,
        autoplaySpeed: APP_CONFIG.CAROUSEL.AUTOPLAY_SPEED,
        prevArrow: '<i class="slick-prev"/>',
        nextArrow: '<i class="slick-next"/>'
    });
}

/**
 * Initialize materials carousel with Slick
 */
function initMaterialsCarousel() {
    const $carousel = $('.materials-list');
    if (!$carousel.length || $carousel.hasClass(CSS_CLASSES.SLICK_INITIALIZED)) return;
    
    $carousel.slick({
        dots: false,
        infinite: false,
        speed: APP_CONFIG.CAROUSEL.TRANSITION_SPEED,
        slidesToShow: isMobileViewport() ? APP_CONFIG.CAROUSEL.MOBILE_MATERIALS_SLIDES : APP_CONFIG.CAROUSEL.DESKTOP_MATERIALS_SLIDES,
        slidesToScroll: isMobileViewport() ? APP_CONFIG.CAROUSEL.MOBILE_SLIDES : APP_CONFIG.CAROUSEL.DESKTOP_SLIDES,
        centerMode: false,
        arrows: false,
        responsive: [
            {
                breakpoint: APP_CONFIG.BREAKPOINTS.DESKTOP_LARGE,
                settings: {
                    slidesToShow: APP_CONFIG.CAROUSEL.TABLET_SLIDES,
                    slidesToScroll: APP_CONFIG.CAROUSEL.TABLET_SCROLL,
                    centerPadding: '30px'
                }
            },
            {
                breakpoint: APP_CONFIG.BREAKPOINTS.TABLET,
                settings: {
                    slidesToShow: APP_CONFIG.CAROUSEL.MOBILE_MATERIALS_SLIDES,
                    slidesToScroll: APP_CONFIG.CAROUSEL.MOBILE_SLIDES
                }
            }
        ]
    });
    
    // Add event listeners for carousel state changes
    $carousel.on('afterChange init', function() {
        updateCarouselArrowStates($(this));
    });
}

/**
 * Initialize custom carousel controls (prev/next buttons)
 */
function initCarouselControls() {
    // Previous button handler
    $(document).on('click', '.materials-carousel-prev', function(e) {
        e.preventDefault();
        const $carousel = $(this).closest('.topic').find('.materials-list');
        
        if ($carousel.hasClass(CSS_CLASSES.SLICK_INITIALIZED)) {
            $carousel.slick('slickPrev');
            updateCarouselArrowStates($carousel);
        }
    });
    
    // Next button handler
    $(document).on('click', '.materials-carousel-next', function(e) {
        e.preventDefault();
        const $carousel = $(this).closest('.topic').find('.materials-list');
        
        if ($carousel.hasClass(CSS_CLASSES.SLICK_INITIALIZED)) {
            $carousel.slick('slickNext');
            updateCarouselArrowStates($carousel);
        }
    });
    
    // Update arrow states after initialization
    setTimeout(function() {
        $(`.materials-list.${CSS_CLASSES.SLICK_INITIALIZED}`).each(function() {
            updateCarouselArrowStates($(this));
        });
    }, APP_CONFIG.ANIMATION.CAROUSEL_UPDATE_DELAY);
}

/**
 * Update carousel arrow button states (enabled/disabled)
 * @param {jQuery} $carousel - Carousel element
 */
function updateCarouselArrowStates($carousel) {
    if (!$carousel.hasClass(CSS_CLASSES.SLICK_INITIALIZED)) return;
    
    const $topic = $carousel.closest('.topic');
    const $prevButton = $topic.find('.materials-carousel-prev');
    const $nextButton = $topic.find('.materials-carousel-next');
    
    const currentSlide = $carousel.slick('slickCurrentSlide');
    const slideCount = $carousel.slick('getSlick').slideCount;
    const slidesToShow = $carousel.slick('getSlick').options.slidesToShow;
    
    // Update prev button
    if (currentSlide === 0) {
        $prevButton.addClass(CSS_CLASSES.SLICK_DISABLED).attr('disabled', true);
    } else {
        $prevButton.removeClass(CSS_CLASSES.SLICK_DISABLED).attr('disabled', false);
    }
    
    // Update next button
    if (currentSlide >= slideCount - slidesToShow) {
        $nextButton.addClass(CSS_CLASSES.SLICK_DISABLED).attr('disabled', true);
    } else {
        $nextButton.removeClass(CSS_CLASSES.SLICK_DISABLED).attr('disabled', false);
    }
}

/**
 * Initialize all carousels on the page
 */
function initCarousels() {
    initCardCarousel();
    initMaterialsCarousel();
    initCarouselControls();
}

// ============================================================================
// PARTNER CONTENT
// ============================================================================

/**
 * Truncate text without breaking words
 * @param {string} text - Full text content
 * @param {number} maxLength - Maximum character length
 * @returns {string} Truncated text with ellipsis
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    
    let truncated = text.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
        truncated = truncated.substring(0, lastSpaceIndex);
    }
    
    return truncated + '...';
}

/**
 * Initialize partner content truncation
 */
function initPartnerContentTruncation() {
    $('.partner-content').each(function() {
        const $partnerContent = $(this);
        const $fullContent = $partnerContent.find('.partner-description-full');
        const $truncatedContent = $partnerContent.find('.partner-description-truncated');
        const $button = $partnerContent.find('.read-more-partner');
        
        const fullText = $fullContent.data('full-content');
        const maxLength = APP_CONFIG.CONTENT.MAX_PARTNER_DESCRIPTION_LENGTH;
        
        if (fullText && fullText.length > maxLength) {
            const truncatedText = truncateText(fullText, maxLength);
            
            $truncatedContent.html(truncatedText);
            $truncatedContent.show();
            $fullContent.hide();
            $button.show();
        } else {
            $truncatedContent.html(fullText);
            $truncatedContent.show();
            $fullContent.hide();
            $button.hide();
        }
    });
    
    // Handle read more/less toggle
    $('.read-more-partner').off('click').on('click', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const $partnerContent = $button.closest('.partner-content');
        const $truncatedContent = $partnerContent.find('.partner-description-truncated');
        const $fullContent = $partnerContent.find('.partner-description-full');
        
        if ($fullContent.is(':visible')) {
            $fullContent.hide();
            $truncatedContent.show();
            $button.text('Read more').removeClass(CSS_CLASSES.EXPANDED);
        } else {
            $truncatedContent.hide();
            $fullContent.show();
            $button.text('Read less').addClass(CSS_CLASSES.EXPANDED);
        }
    });
}

// ============================================================================
// BLOCK DOWNLOADS
// ============================================================================

/**
 * Initialize block download functionality
 */
function initBlockDownloads() {
    $(document).off('click.blockDownload')
        .on('click.blockDownload', '.download-block-btn', function(e) {
            handleBlockDownload(e);
        });
}

/**
 * Handle block download button click
 * @param {Event} e - Click event
 */
async function handleBlockDownload(e) {
    e.preventDefault();
    
    const btn = e.target.closest('.download-block-btn');
    if (!btn) return;
    
    const blockId = btn.dataset.blockId;
    const blockName = btn.dataset.blockName;
    
    // Set loading state
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.6';
    const originalHtml = btn.innerHTML;
    btn.innerHTML = 'Preparing download...';
    
    try {
        const materials = collectBlockMaterials(btn);
        
        if (materials.length === 0) {
            alert('No downloadable materials found for this block.');
            return;
        }
        
        await downloadBlockMaterials(materials, blockName, blockId);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
    } finally {
        // Reset button state
        btn.style.pointerEvents = '';
        btn.style.opacity = '';
        btn.innerHTML = originalHtml;
    }
}

/**
 * Collect material resources from a material card
 * @param {HTMLElement} card - Material card element
 * @returns {Object} Material data with resources
 */
function collectMaterialResources(card) {
    const materialData = {
        id: card.dataset.materialId,
        name: card.dataset.materialName,
        type: card.dataset.materialType,
        prefix: card.dataset.materialPrefix,
        resources: []
    };
    
    // Collect cover image
    if (card.dataset.materialCover) {
        materialData.resources.push({
            type: 'cover',
            url: card.dataset.materialCover,
            name: 'cover'
        });
    }
    
    // Collect video file
    if (card.dataset.materialVideoFile) {
        materialData.resources.push({
            type: 'video',
            url: card.dataset.materialVideoFile,
            name: 'video'
        });
    }
    
    // Collect document file
    if (card.dataset.materialDocumentFile) {
        materialData.resources.push({
            type: 'document',
            url: card.dataset.materialDocumentFile,
            name: 'document'
        });
    }
    
    // Collect gallery images
    if (card.dataset.materialGallery) {
        try {
            const gallery = JSON.parse(card.dataset.materialGallery);
            if (Array.isArray(gallery)) {
                gallery.forEach((imageUrl, index) => {
                    materialData.resources.push({
                        type: 'gallery',
                        url: imageUrl,
                        name: `gallery_image_${index + 1}`
                    });
                });
            }
        } catch (e) {
            console.warn('Failed to parse gallery data for material:', materialData.id);
        }
    }
    
    return materialData;
}

/**
 * Collect all materials from a specific block
 * @param {HTMLElement} button - Download button element
 * @returns {Array} Array of material data objects
 */
function collectBlockMaterials(button) {
    const blockMaterialsContainer = button.closest('.block-materials-container');
    if (!blockMaterialsContainer) return [];
    
    const materialCards = blockMaterialsContainer.querySelectorAll('.material-card');
    const materials = [];
    
    materialCards.forEach(card => {
        const materialData = collectMaterialResources(card);
        
        // Only include materials with downloadable resources
        if (materialData.resources.length > 0) {
            materials.push(materialData);
        }
    });
    
    return materials;
}

/**
 * Download block materials as ZIP file
 * @param {Array} materials - Array of material data
 * @param {string} blockName - Name of the block
 * @param {string} blockId - ID of the block
 */
async function downloadBlockMaterials(materials, blockName, blockId) {
    const response = await fetch('/api/courses/download-block', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            block_id: blockId,
            block_name: blockName,
            materials: materials
        })
    });
    
    if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
    }
    
    // Create and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${blockName.replace(/[^a-zA-Z0-9_-]/g, '_')}_materials.zip`;
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle window resize events
 */
function handleWindowResize() {
    viewportWidth = window.innerWidth;
    
    if (isMobileViewport()) {
        ensureMobileMenuSetup();
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all components that require DOM to be ready
 */
function initializeOnDOMReady() {
    // Initialize menu structure
    initializeMenuStructure();
    initializePageDecorations();
    
    // Set dimensions
    setHeaderWidths();
    
    // Remove Bootstrap dropdown toggles
    removeDropdownToggles();
    
    // Remove no-transition class to enable animations
    $('nav').removeClass(CSS_CLASSES.NO_TRANSITION);
    
    // Initialize page sections
    initializeAboutMenu();
    organizePartnersColumns();
    
    // Initialize interactive components
    initBlockAccordion();
    initPartnerContentTruncation();
    initBlockDownloads();
    
    // Initialize mobile menu if needed
    if (isMobileViewport()) {
        initializeMobileMenu();
    }
    
    // Initialize components with delay for proper rendering
    setTimeout(function() {
        initDertoDotsNav();
        initAccordions();
    }, APP_CONFIG.ANIMATION.INIT_DELAY);
}

/**
 * Initialize carousel system
 */
function initializeCarouselSystem() {
    initCarousels();
    
    // Reinitialize carousels on window resize
    window.addEventListener('resize', initCarousels);
    
    // Also initialize on DOMContentLoaded for safety
    document.addEventListener('DOMContentLoaded', initCarousels);
}

/**
 * Main initialization function
 */
function init() {
    initializeCarouselSystem();
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Document ready event
$(document).ready(initializeOnDOMReady);

// DOM content loaded event (for extra safety with certain components)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initDertoDotsNav();
        initAccordions();
        initBlockDownloads();
    }, APP_CONFIG.ANIMATION.INIT_DELAY);
});

// Window resize event
$(window).resize(handleWindowResize);

// Start initialization
init();

// ============================================================================
// EXPOSE GLOBAL FUNCTIONS
// ============================================================================

// Expose openTab function globally for use in HTML onclick attributes
window.openTab = openTab;

})(window, jQuery);


