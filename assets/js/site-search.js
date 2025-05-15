// Search functionality for Pensoft DERTO theme

// Functions for search modal
function showSearchForm(){
    const searchModal = document.getElementById('searchModalOverlay');
    const modal = document.querySelector('.search-modal');
    
    // First show the overlay
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Then add animation class to the modal for enhanced illustration effect
    setTimeout(() => {
        if (modal) modal.classList.add('active');
        
        // Focus on the search input
        const searchInput = document.querySelector('.search_input');
        if (searchInput) searchInput.focus();
    }, 150);
    
    // Add ESC key listener
    document.addEventListener('keydown', handleEscKey);
}

function hideSearchForm(){
    const searchModal = document.getElementById('searchModalOverlay');
    const modal = document.querySelector('.search-modal');
    
    // First remove the active class from the modal
    if (modal) modal.classList.remove('active');
    
    // Then after a small delay, hide the overlay
    setTimeout(() => {
        searchModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }, 150);
    
    // Remove ESC key listener
    document.removeEventListener('keydown', handleEscKey);
}

function handleEscKey(e) {
    if (e.key === 'Escape') {
        hideSearchForm();
    }
}

// Update the mobile menu by appending social media icons to the search field
function updateMobileMenu() {
    var socialIcons = '';
    
    // Check if LinkedIn button exists in the header (means it's enabled)
    if ($('.search-and-social-media .btn-linkedin').length > 0) {
        socialIcons += '<a href="' + $('.search-and-social-media .btn-linkedin').attr('href') + '" class="mobile-social-btn btn-linkedin" aria-label="LinkedIn" target="_blank"></a>';
    }
    
    // Check if BlueSky button exists in the header (means it's enabled)
    if ($('.search-and-social-media .btn-bluesky').length > 0) {
        socialIcons += '<a href="' + $('.search-and-social-media .btn-bluesky').attr('href') + '" class="mobile-social-btn btn-bluesky" aria-label="BlueSky" target="_blank"></a>';
    }
    
    // Only update if we have social icons to add
    if (socialIcons !== '') {
        // Clear existing icons first to prevent duplicates
        $('#menuToggle #menu .search_field .icon-container').html('');
        // Add search button and social icons
        $('#menuToggle #menu .search_field .icon-container').html('<a href="#" class="mobile-search-btn" aria-label="Search"></a>' + socialIcons);
    }
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add search button to mobile menu after CONTACT if it doesn't exist
    if ($('#menuToggle #menu .search_field').length === 0) {
        $('#menuToggle #menu').append('<li class="nav-item search_field"><div class="icon-container"><a href="#" class="mobile-search-btn" aria-label="Search"></a></div></li>');
    }
    
    // Update mobile menu with social icons
    updateMobileMenu();
    
    // Make sure mobile search button works
    $(document).on('click', '.mobile-search-btn', function(e) {
        e.preventDefault();
        // Close mobile menu if open
        if ($('#menuToggle input[type="checkbox"]').is(":checked")) {
            $('#menuToggle input[type="checkbox"]').prop('checked', false);
            $('#menu').hide("slide", { direction: "right" }, 400);
            $('body', 'html').css({
                'overflow': 'auto'
            });
        }
        
        // Show search form
        setTimeout(function() {
            showSearchForm();
        }, 100);
        
        return false;
    });
    
    // Add click event to close modal when clicking outside
    $('#searchModalOverlay').on('click', function(e) {
        if (e.target === this) {
            hideSearchForm();
        }
    });
    
    // Submit search on enter
    $('.search_input').on('keydown', function(e) {
        if (e.key === 'Enter') {
            $(this).closest('form').submit();
        }
    });
    
    // Always rebuild the mobile menu social icons on page load
    var width = window.innerWidth;
    if (width < 992) {
        // First ensure the search field container exists
        if ($('#menuToggle #menu .search_field').length === 0) {
            $('#menuToggle #menu').append('<li class="nav-item search_field"><div class="icon-container"></div></li>');
        }
        // Then update it with icons
        updateMobileMenu();
    }
});

// Update mobile menu on window resize
$(window).resize(function() {
    // Update width variable
    var width = window.innerWidth;
    
    if (width < 992) {
        // Ensure the search field container exists
        if ($('#menuToggle #menu .search_field').length === 0) {
            $('#menuToggle #menu').append('<li class="nav-item search_field"><div class="icon-container"></div></li>');
        }
        // Update it with icons
        updateMobileMenu();
    }
});
