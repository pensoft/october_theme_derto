var width = window.innerWidth;

var documentHasScroll = function() {
    return window.innerHeight <= document.body.offsetHeight;
};

window.addEventListener('scroll', function (e) {
    var headernavbar = document.getElementById("headernavbar");
    if (window.scrollY > headernavbar.offsetHeight){
        var headerNavbarNav = document.querySelector('#headerNavbarNav')
        headernavbar.classList.add('scrolled');
    }else{
        headernavbar.classList.remove('scrolled');
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
    setupAnimations();

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


    $('.events_tabs, .media_tabs').each(function(){
        // For each set of tabs, we want to keep track of
        // which tab is active and its associated content
        var $active, $content, $links = $(this).find('a');
        var speed = "fast";
        var activeTab = $(location.hash);
        // If the location.hash matches one of the links, use that as the active tab.
        // If no match is found, use the first link as the initial active tab.
        $active = $($links.filter("[href=\'"+location.hash+"\']")[0] || $links[0]);


        if($(this).parent().parent().hasClass('events')){
            $active.addClass('active');
        }

        $content = $($active[0].hash);

        // Hide the remaining content
        $links.not($active).each(function () {
            $(this.hash).hide();
        });

        if(activeTab.length){
            $content.slideDown(speed);
            //scroll to element
            $('html, body').animate({
                scrollTop:  activeTab.offset().top - $('header').height()
            }, speed);
        }

        // Bind the click event handler
        $(this).find("a").click(function (e) {
            if($(this).hasClass('active')) {
                $content.slideDown({
                    scrollTop: $content.offset().top - $('header').height()
                }, speed);
                var screenSize = getScreenSize();
                if (screenSize.width < 800) {
                    // scroll to element
                    $('html, body').animate({
                        scrollTop: $content.offset().top - $('header').height() + 300  // mobile
                    }, speed);
                }else{
                    //scroll to element icons top
                    $('html, body').animate({
                        scrollTop:  $content.offset().top - $('header').height() + 300
                    }, speed);
                }
                e.preventDefault();
                return false;
            }
            // Make the old tab inactive.
            $active.removeClass('active');
            $content.hide();

            // Update the variables with the new link and content
            $active = $(this);
            $content = $(this.hash);

            location.hash = $active[0].hash;

            // Make the tab active.
            $active.addClass('active');
            $content.slideDown({
                scrollTop: $content.offset().top - $('header').height()
            }, speed);

            // Prevent the anchor\'s default click action
            e.preventDefault();
        });
    });

    // Search form event handlers moved to site-search.js

    // Initialize events page functionality
    initEventsPage();
});


function isBreakpointLarge() {
    return window.innerWidth <= 991;
}



function init() {
    window.addEventListener('resize', function () {
        if (isBreakpointLarge()) {
            $('#card-carousel').slick('unslick');
        } else {
            if (typeof cardCarousel === 'function') {
                cardCarousel({
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    autoplay: true,
                    autoplaySpeed: 6000,
                    prevArrow: '<i class="slick-prev"/>',
                    nextArrow: '<i class="slick-next"/>',
                });
             }
        }

    });
    document.addEventListener('DOMContentLoaded', function () {
        if (!isBreakpointLarge()) {
            if (typeof cardCarousel === 'function') {
                cardCarousel({
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    autoplay: true,
                    autoplaySpeed: 6000,
                    prevArrow: '<i class="slick-prev"/>',
                    nextArrow: '<i class="slick-next"/>',
                });
            }
        }

        // Initialize work packages toggle
        initWorkPackagesToggle();
    });
}

// Search-related functions moved to site-search.js

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