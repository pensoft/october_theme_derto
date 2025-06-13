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
	$( '<div class="calendar-top"></div>' ).insertBefore( "#calendar" );
	$( '<div class="card-profile-top"></div>' ).insertBefore( ".card.profile.card-profile" );
	var divs = $(".card-profiles > div");
	for(var i = 0; i < divs.length; i+=2) {
		divs.slice(i, i+2).wrapAll( '<div class="col-xs" />');
	}

    // Initialize block accordion functionality
    initBlockAccordion();

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
        console.log('Dot clicked:', $(this).data('tab'));

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
            slidesToScroll: 1,
            centerMode: false,
            arrows: false,
            responsive: [
                {
                    breakpoint: 1280,
                    settings: {
                        slidesToShow: 2.5,
                        slidesToScroll: 1,
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
    $(document).on('click', '.block-header', function(e) {
        e.preventDefault();

        var $blockHeader = $(this);
        var $blockContainer = $blockHeader.closest('.col-xs-12');
        var $materialsContainer = $blockContainer.find('.block-materials-container');

        // Toggle expanded class on header
        $blockHeader.toggleClass('expanded');

        // Toggle materials container with smooth animation
        if ($materialsContainer.hasClass('expanded')) {
            $materialsContainer.slideUp(300, function() {
                $materialsContainer.removeClass('expanded');
            });
        } else {
            $materialsContainer.addClass('expanded').slideDown(300);
        }
    });
}
