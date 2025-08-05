var width = window.innerWidth;

var documentHasScroll = function() {
    return window.innerHeight <= document.body.offsetHeight;
};

window.addEventListener('scroll', function (e) {
    var headernavbar = document.getElementById("headernavbar");
    var heroSection = document.querySelector('.header-image');

    if (heroSection) {
        var heroHeight = heroSection.offsetHeight;
        if (window.scrollY > heroHeight) {
            headernavbar.classList.add('scrolled');
            headernavbar.classList.add('navbar-hidden');
        } else {
            headernavbar.classList.remove('scrolled');
            headernavbar.classList.remove('navbar-hidden');
        }
    } else {
        // Fallback behavior if no header-image exists
        if (window.scrollY > headernavbar.offsetHeight) {
            headernavbar.classList.add('scrolled');
        } else {
            headernavbar.classList.remove('scrolled');
        }
    }
});

$(document).ready(function() {
    // $("nav").removeClass("no-transition");
	/* MENU */
	$('.navbar-nav').attr('id', 'menu'); // please don't remove this line
	
	// Add survey tooltip class to "Take the Survey" menu item
	$('.navbar-nav .nav-item a').each(function() {
        var $this = $(this);
        var href = $this.attr('href') || '';
        var text = $this.text().trim();
        
        // Check if this is a "Take the Survey" link
        if (text === 'Take the Survey' || (href && href.length > 0 && href.indexOf('forms.cloud.microsoft') !== -1)) {
            $this.closest('.nav-item').addClass('survey-nav-item');
        }
    });
	$( '<div class="calendar-top"></div>' ).insertBefore( "#calendar" );
	$( '<div class="card-profile-top"></div>' ).insertBefore( ".card.profile.card-profile" );
	var divs = $(".card-profiles > div");
	for(var i = 0; i < divs.length; i+=2) {
		divs.slice(i, i+2).wrapAll( '<div class="col-xs" />');
	}

    // Initialize block accordion functionality
    initBlockAccordion();
    
    // Initialize partner content truncation
    initPartnerContentTruncation();
    
    // Initialize block download functionality
    initBlockDownloads();

    // Update the mobile menu functionality is now moved to site-search.js

	var headerNavbar = $('#headerNavbar');
	var width100 = $('.width100');
	var innerWidth = $('body').innerWidth();
	headerNavbar.width(innerWidth);
	width100.width(innerWidth);

    $('.nav-item').children("a").each(function(){
        if($(this).attr('data-toggle') == 'dropdown'){
            $(this).removeAttr('data-toggle')
        }
    });

    $("nav").removeClass("no-transition");

    // Initialize animations
    // setupAnimations();

    // About page menu - simplified approach
    if ($('.about-menu').length > 0) {
        // Simple direct click handler for menu items
        $('.about-menu-item').click(function(e) {
            e.preventDefault();

            // Remove active class from all items
            $('.about-menu-item').removeClass('active');

            // Add active class to clicked item
            $(this).addClass('active');

            // Get target section ID from href
            var targetId = $(this).attr('href');

            // Scroll to section
            $('html, body').animate({
                scrollTop: $(targetId).offset().top - 100
            }, 500);

            // Update URL hash
            history.pushState(null, null, targetId);
        });

        // Set initial active state based on URL hash
        var currentHash = window.location.hash;
        if (currentHash) {
            $('.about-menu-item[href="' + currentHash + '"]').addClass('active');
        } else {
            $('.about-menu-item:first').addClass('active');
        }
    }

    if (width < 992) { // mobile
        $('#menuToggle input[type="checkbox"]').change(function(){
            var checked = $(this).is(":checked");
            if(checked){
                $('#menu').show("slide", { direction: "right" }, 400);
                $('#search').hide();
                // Fix: Make all elements in menu visible immediately, including dropdown menu items
                $('#menu, #menu *, #menu .dropdown-menu, #menu .dropdown-menu *').css({
                    'visibility': 'visible'
                });
                // Make dropdown menu items visible in a proper way
                $('#menu .dropdown-menu').css('display', 'none');

                $('body', 'html').css({
                    'overflow': 'hidden'
                });
            }else{
                $('#menu').hide("slide", { direction: "right" }, 400);
                $('#search').hide();
                $('body', 'html').css({
                    'overflow': 'auto'
                });
            }
        });

        // Mobile search button event handling moved to site-search.js

        // --- MOBILE SUBMENU TOGGLE LOGIC ---
        // Only for mobile: clicking a parent with submenu toggles its dropdown-menu
        $(document).on('click', '#menu .dropdown > a', function(e) {
            // Only act if in mobile
            if (window.innerWidth >= 992) return;
            var $parent = $(this).parent('.dropdown');
            var $submenu = $parent.children('.dropdown-menu');
            if ($submenu.length) {
                e.preventDefault();

                // Toggle expanded class for arrow rotation
                $(this).toggleClass('expanded');

                // Toggle submenu with smooth animation
                $submenu.slideToggle(250);

                // Toggle special class on parent for border styling
                $parent.toggleClass('submenu-open');

                // Close other open submenus and reset their expanded state
                $parent.siblings('.dropdown').children('.dropdown-menu:visible').slideUp(200);
                $parent.siblings('.dropdown').children('a').removeClass('expanded');
                $parent.siblings('.dropdown').removeClass('submenu-open');
            }
        });
        // Hide all submenus when menu closes
        $('#menuToggle input[type="checkbox"]').change(function(){
            if (!$(this).is(":checked")) {
                $('#menu .dropdown-menu').hide();
                // Reset expanded state
                $('#menu .dropdown > a').removeClass('expanded');
                $('#menu .dropdown').removeClass('submenu-open');
            }
        });
    }


    $('.nav-item').children("a").each(function(){
        if($(this).attr('data-toggle') == 'dropdown'){
            $(this).removeAttr('data-toggle')
        }
    });

    $("nav").removeClass("no-transition");
    
    if(width >= 1024 && $('#partners .key_0').length){
        // First column: items 0, 2, 4, 6, etc. (even numbers)
        $('#partners .key_0, #partners .key_2, #partners .key_4, #partners .key_6, #partners .key_8, #partners .key_10, #partners .key_12, #partners .key_14, #partners .key_16, #partners .key_18').wrapAll('<div class="col-md-6 col-xs-12" />');
        
        // Second column: items 1, 3, 5, 7, etc. (odd numbers)
        $('#partners .key_1, #partners .key_3, #partners .key_5, #partners .key_7, #partners .key_9, #partners .key_11, #partners .key_13, #partners .key_15, #partners .key_17, #partners .key_19').wrapAll('<div class="col-md-6 col-xs-12" />');
    }
    // Initialize events page functionality
    // initEventsPage();

    // Initialize What is DERTO dots navigation
    setTimeout(function() {
        initDertoDotsNav();
        initAccordions();
    }, 500);

});

// Also add a DOM loaded event listener for extra safety
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initDertoDotsNav();
        initAccordions();
        initBlockDownloads();
    }, 500);
});

// Initialize accordion functionality
function initAccordions() {    
    // Remove any existing handlers
    $(document).off('click.accordion');
    
    // Use document delegation with namespace
    $(document).on('click.accordion', '.accordion-header', function(e) {
        e.preventDefault();
        
        var $header = $(this);
        var $content = $header.siblings('.accordion-content');
        var $parentItem = $header.closest('.accordion-item');
        var $contentAlt = $parentItem.find('.accordion-content');

        $header.toggleClass('expanded');
        
        // Try both methods to find content
        var $targetContent = $content.length > 0 ? $content : $contentAlt;
        
        if ($header.hasClass('expanded')) {
            $targetContent.css('max-height', $targetContent[0].scrollHeight + 'px');
        } else {
            $targetContent.css('max-height', '0');
        }
    });
}


function openTab(evt, tabName, num) {
    var i, x, tablinks;
    x = document.getElementsByClassName("tabs_content"+num);
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink"+num);
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Initialize the dots navigation for the What is DERTO section
function initDertoDotsNav() {
    // Use jQuery for better compatibility
    $('.what-is-derto .dot').on('click', function() {
        // console.log('Dot clicked:', $(this).data('tab'));

        // Remove active class from all dots
        $('.what-is-derto .dot').removeClass('active');

        // Add active class to clicked dot
        $(this).addClass('active');

        // Get tab target
        const tabTarget = $(this).data('tab');

        // Hide all tab contents
        $('.what-is-derto .tab-content').removeClass('active');

        // Show target tab content
        $('#' + tabTarget).addClass('active');

        // Update the header text from data attribute
        const newHeader = $(this).data('header');
        if (newHeader) {
            $('.what-is-derto .header h2').html(newHeader);
        }
    });

    // Make sure at least one dot is active at start and set initial header
    if ($('.what-is-derto .dot.active').length === 0) {
        $('.what-is-derto .dot').first().addClass('active');
        const firstTabId = $('.what-is-derto .dot').first().data('tab');
        $('#' + firstTabId).addClass('active');
        
        // Set initial header from data attribute
        const initialHeader = $('.what-is-derto .dot').first().data('header');
        if (initialHeader) {
            $('.what-is-derto .header h2').html(initialHeader);
        }
    } else {
        // If there's already an active dot, set its corresponding header
        const activeHeader = $('.what-is-derto .dot.active').data('header');
        if (activeHeader) {
            $('.what-is-derto .header h2').html(activeHeader);
        }
    }
}

function isBreakpointLarge() {
    return window.innerWidth <= 991;
}


function init() {
    // Initialize carousels on page load
    initCarousels();

    // Reinitialize on window resize
    window.addEventListener('resize', function() {
        initCarousels();
    });

    document.addEventListener('DOMContentLoaded', function() {
        initCarousels();
        // appendSearchAndSocialMedia();
        // requestFormLibrary();
    });

}

init()

// Simplified carousel initialization
function initCarousels() {
    // Initialize card carousel
    if ($('#card-carousel').length && !$('#card-carousel').hasClass('slick-initialized')) {
        $('#card-carousel').slick({
            slidesToShow: isBreakpointLarge() ? 1 : 3,
            slidesToScroll: isBreakpointLarge() ? 1 : 3,
            autoplay: true,
            autoplaySpeed: 6000,
            prevArrow: '<i class="slick-prev"/>',
            nextArrow: '<i class="slick-next"/>'
        });
    }

    // Initialize materials carousel
    if ($('.materials-list').length && !$('.materials-list').hasClass('slick-initialized')) {
        $('.materials-list').slick({
            dots: false,
            infinite: false,
            speed: 300,
            slidesToShow: isBreakpointLarge() ? 1 : 3.5,
            slidesToScroll: isBreakpointLarge() ? 1 : 3,
            centerMode: false,
            arrows: false, // Disabled built-in arrows since we have custom header arrows
            responsive: [
                {
                    breakpoint: 1280,
                    settings: {
                        slidesToShow: 2.5,
                        slidesToScroll: 2,
                        centerPadding: '30px'
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1.2,
                        slidesToScroll: 1,
                    }
                }
            ]
        });
        
        // Add event listeners for carousel state changes
        $('.materials-list').on('afterChange', function(event, slick, currentSlide) {
            updateCarouselArrowStates($(this));
        });
        
        $('.materials-list').on('init', function(event, slick) {
            updateCarouselArrowStates($(this));
        });
    }
    
    // Initialize custom header carousel controls
    initCarouselControls();
}

// Initialize custom header carousel controls
function initCarouselControls() {
    // Handle custom carousel arrow clicks
    $(document).on('click', '.materials-carousel-prev', function(e) {
        e.preventDefault();
        var $button = $(this);
        var topicSlug = $button.data('topic');
        var $carousel = $button.closest('.topic').find('.materials-list');
        
        if ($carousel.hasClass('slick-initialized')) {
            $carousel.slick('slickPrev');
            updateCarouselArrowStates($carousel);
        }
    });
    
    $(document).on('click', '.materials-carousel-next', function(e) {
        e.preventDefault();
        var $button = $(this);
        var topicSlug = $button.data('topic');
        var $carousel = $button.closest('.topic').find('.materials-list');
        
        if ($carousel.hasClass('slick-initialized')) {
            $carousel.slick('slickNext');
            updateCarouselArrowStates($carousel);
        }
    });
    
    // Update arrow states after carousel initialization
    setTimeout(function() {
        $('.materials-list.slick-initialized').each(function() {
            updateCarouselArrowStates($(this));
        });
    }, 100);
}

// Update carousel arrow states based on current slide
function updateCarouselArrowStates($carousel) {
    if (!$carousel.hasClass('slick-initialized')) return;
    
    var $topic = $carousel.closest('.topic');
    var $prevButton = $topic.find('.materials-carousel-prev');
    var $nextButton = $topic.find('.materials-carousel-next');
    
    var currentSlide = $carousel.slick('slickCurrentSlide');
    var slideCount = $carousel.slick('getSlick').slideCount;
    var slidesToShow = $carousel.slick('getSlick').options.slidesToShow;
    
    // Update prev button state
    if (currentSlide === 0) {
        $prevButton.addClass('slick-disabled').attr('disabled', true);
    } else {
        $prevButton.removeClass('slick-disabled').attr('disabled', false);
    }
    
    // Update next button state  
    if (currentSlide >= slideCount - slidesToShow) {
        $nextButton.addClass('slick-disabled').attr('disabled', true);
    } else {
        $nextButton.removeClass('slick-disabled').attr('disabled', false);
    }
}

// Handle mobile submenu visibility
function initMobileMenu() {
    // If we're in mobile view
    if (width < 992) {
        // Make sure dropdown menus are properly set up
        $('#menu .dropdown-menu').each(function() {
            $(this).css('display', 'none');
            $(this).css('visibility', 'visible');
        });

        // Ensure all elements in the menu are properly visible
        $('#menu li, #menu a').css('visibility', 'visible');
    }
}

// Window resize handler updated to remove search-related code
$(window).resize(function() {
    // Update width variable
    width = window.innerWidth;

    if (width < 992) {
        initMobileMenu();
    }
});

// Initialize block accordion functionality
function initBlockAccordion() {
    $(document).off('click.blockAccordion', '.block-header');
    
    // Attach the block accordion handler
    $(document).on('click.blockAccordion', '.block-header', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $blockHeader = $(this);
        var $blockContainer = $blockHeader.closest('.col-xs-12');
        var $materialsContainer = $blockContainer.find('.block-materials-container');

        // Only proceed if we found the materials container
        if ($materialsContainer.length > 0) {
            $blockHeader.toggleClass('expanded');

            if ($materialsContainer.hasClass('expanded')) {
                $materialsContainer.slideUp(300, function() {
                    $materialsContainer.removeClass('expanded');
                });
            } else {
                $materialsContainer.addClass('expanded').slideDown(300);
            }
        }
        
        return false;
    });
}

/**
 * Initialize partner content truncation
 * Truncates partner descriptions to 255 characters without breaking words
 */
function initPartnerContentTruncation() {
    $('.partner-content').each(function() {
        var $partnerContent = $(this);
        var $fullContent = $partnerContent.find('.partner-description-full');
        var $truncatedContent = $partnerContent.find('.partner-description-truncated');
        var $button = $partnerContent.find('.read-more-partner');
        
        var fullText = $fullContent.data('full-content');
        var maxLength = 255;
        
        if (fullText && fullText.length > maxLength) {
            // Find the last space before the 255 character limit to avoid breaking words
            var truncatedText = fullText.substring(0, maxLength);
            var lastSpaceIndex = truncatedText.lastIndexOf(' ');
            
            if (lastSpaceIndex > 0) {
                truncatedText = truncatedText.substring(0, lastSpaceIndex);
            }
            
            // Add ellipsis to indicate there's more content
            truncatedText += '...';
            
            // Set the truncated content
            $truncatedContent.html(truncatedText);
            
            // Show truncated content initially and show button
            $truncatedContent.show();
            $fullContent.hide();
            $button.show();
        } else {
            // Content is short enough, show full content and hide button
            $truncatedContent.html(fullText);
            $truncatedContent.show();
            $fullContent.hide();
            $button.hide();
        }
    });
    
    // Handle read more/less toggle with smooth animation
    $('.read-more-partner').off('click').on('click', function(e) {
        e.preventDefault();
        
        var $button = $(this);
        var $partnerContent = $button.closest('.partner-content');
        var $truncatedContent = $partnerContent.find('.partner-description-truncated');
        var $fullContent = $partnerContent.find('.partner-description-full');
        
        if ($fullContent.is(':visible')) {
            // Currently showing full content, switch to truncated
            $fullContent.hide();
            $truncatedContent.show();
            $button.text('Read more').removeClass('expanded');
        } else {
            // Currently showing truncated content, switch to full
            $truncatedContent.hide();
            $fullContent.show();
            $button.text('Read less').addClass('expanded');
        }
    });
}

/**
 * Initialize block download functionality
 */
function initBlockDownloads() {
    // Use event delegation to handle dynamically loaded content
    $(document).off('click.blockDownload').on('click.blockDownload', '.download-block-btn', function(e) {
        handleBlockDownload(e);
    });
}

/**
 * Handle block download
 */
async function handleBlockDownload(e) {
    e.preventDefault();
    
    const btn = e.target.closest('.download-block-btn');
    if (!btn) return;
    
    const blockId = btn.dataset.blockId;
    const blockName = btn.dataset.blockName;
    
    // Disable button and show loading state
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.6';
    const originalHtml = btn.innerHTML;
    btn.innerHTML = 'Preparing download...';
    
    try {
        // Collect all materials from the specific block
        const materials = collectBlockMaterials(btn);
        
        if (materials.length === 0) {
            alert('No downloadable materials found for this block.');
            return;
        }
        
        // Send download request
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
 * Collect all materials from a specific block
 */
function collectBlockMaterials(button) {
    // Find the block materials container that contains this button
    const blockMaterialsContainer = button.closest('.block-materials-container');
    if (!blockMaterialsContainer) return [];
    
    // Find all material cards within this specific block
    const materialCards = blockMaterialsContainer.querySelectorAll('.material-card');
    const materials = [];
    
    materialCards.forEach(card => {
        const materialData = {
            id: card.dataset.materialId,
            name: card.dataset.materialName,
            type: card.dataset.materialType,
            prefix: card.dataset.materialPrefix,
            resources: []
        };
        
        // Collect downloadable resources
        if (card.dataset.materialCover) {
            materialData.resources.push({
                type: 'cover',
                url: card.dataset.materialCover,
                name: 'cover'
            });
        }
        
        if (card.dataset.materialVideoFile) {
            materialData.resources.push({
                type: 'video',
                url: card.dataset.materialVideoFile,
                name: 'video'
            });
        }
        
        if (card.dataset.materialDocumentFile) {
            materialData.resources.push({
                type: 'document',
                url: card.dataset.materialDocumentFile,
                name: 'document'
            });
        }
        
        // Add gallery images
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
        
        // Only include materials that have downloadable resources
        if (materialData.resources.length > 0) {
            materials.push(materialData);
        }
    });
    
    return materials;
}

/**
 * Download block materials
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
    
    // Handle the download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blockName.replace(/[^a-zA-Z0-9_-]/g, '_')}_materials.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}


