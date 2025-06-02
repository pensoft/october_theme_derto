document.addEventListener('DOMContentLoaded', function() {
    // Core filter functionality
    const popperInstances = {};
    const filterTriggers = document.querySelectorAll('.filter-trigger');
    const surveyButtonContainer = document.querySelector('.survey-button-container');
    const filterValues = {
        language: '',
        level: '',
        department: '',
        type: '',
        topic: '',
        search: '',
        page: 1
    };
    
    // Get initial URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const isCoursesResultsPage = window.location.pathname.includes('/courses/results');
    const isTopicPage = window.location.pathname.includes('/topic/');
    const isResourceLibraryPage = window.location.pathname.includes('/resource-library');
    
    // Initialize from URL parameters
    if (isCoursesResultsPage) {
        ['language', 'level', 'department', 'type', 'topic'].forEach(param => {
            if (urlParams.has(param)) {
                filterValues[param] = urlParams.get(param);
            }
        });
        
        if (urlParams.has('search') || urlParams.has('q')) {
            filterValues.search = urlParams.has('search') ? urlParams.get('search') : urlParams.get('q');
            
            const searchInput = document.querySelector('input[name="q"]');
            if (searchInput) {
                searchInput.value = filterValues.search;
            }
        }
        
        if (urlParams.has('page')) {
            filterValues.page = parseInt(urlParams.get('page'), 10) || 1;
        }
        
        // Update filter UI state from URL parameters
        updateFilterUIFromValues(filterValues);
        
        // If any filter was applied from URL, fetch results
        if (filterValues.language || filterValues.level || filterValues.department || 
            filterValues.type || filterValues.topic || filterValues.search || filterValues.page > 1) {
            loadResources(filterValues);
        }
    }
    
    /**
     * Load resources via AJAX
     * @param {Object} params - Filter parameters
     */
    function loadResources(params) {
        const resultsContainer = document.getElementById('results-container');
        
        if (resultsContainer) {
            resultsContainer.innerHTML = '<div class="loading-indicator"><p>Loading results...</p></div>';
        } else if (isCoursesResultsPage) {
            return;
        } else {
            redirectToCoursesResults(params);
            return;
        }
        
        fetch('/courses/results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-OCTOBER-REQUEST-HANDLER': 'onLoadResources',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams(params)
        })
        .then(response => response.json())
        .then(data => {
            // Update the HTML with the returned partials
            if (data['#results-container']) {
                document.getElementById('results-container').innerHTML = data['#results-container'];
            }
            
            if (data['#pagination-container']) {
                document.getElementById('pagination-container').innerHTML = data['#pagination-container'];
            }
            
            // Reinitialize pagination event listeners
            initializePaginationListeners();
            
            // Update URL query parameters
            const newParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value) newParams.set(key, value);
            });
            window.history.pushState({}, '', `${window.location.pathname}?${newParams.toString()}`);
            
            // Update global filterValues
            Object.assign(filterValues, params);
        })
        .catch(error => {
            if (resultsContainer) {
                resultsContainer.innerHTML = '<div class="error-message"><p>Error loading results. Please try again.</p></div>';
            }
        });
    }
    
    /**
     * Load filtered blocks for topic page
     * @param {Object} params - Filter parameters
     */
    function loadFilteredBlocks(params) {
        const blocksContainer = document.getElementById('blocks-container');
        
        if (!blocksContainer) {
            return;
        }
        
        blocksContainer.innerHTML = '<div class="loading-indicator"><p>Loading blocks...</p></div>';
        
        fetch(window.location.pathname, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-OCTOBER-REQUEST-HANDLER': 'onLoadFilteredBlocks',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams(params)
        })
        .then(response => response.json())
        .then(data => {
            if (data['#blocks-container']) {
                document.getElementById('blocks-container').innerHTML = data['#blocks-container'];
            }
            
            // Update URL query parameters
            const newParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value) newParams.set(key, value);
            });
            const newUrl = newParams.toString() ? 
                `${window.location.pathname}?${newParams.toString()}` : 
                window.location.pathname;
            window.history.pushState({}, '', newUrl);
        })
        .catch(error => {
            if (blocksContainer) {
                blocksContainer.innerHTML = '<div class="error-message"><p>Error loading blocks. Please try again.</p></div>';
            }
        });
    }
    
    /**
     * Initialize pagination event listeners
     */
    function initializePaginationListeners() {
        const paginationLinks = document.querySelectorAll('.pagination a');
        
        paginationLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const currentParams = { ...filterValues };
                currentParams.page = this.dataset.page;
                
                loadResources(currentParams);
            });
        });
    }
    
    /**
     * Toggle survey button visibility based on dropdown state
     */
    function toggleSurveyButton() {
        if (!surveyButtonContainer) return;
        
        const anyDropdownOpen = document.querySelector('.filter-options.show');
        
        if (anyDropdownOpen) {
            surveyButtonContainer.classList.add('hidden');
        } else {
            surveyButtonContainer.classList.remove('hidden');
        }
    }

    /**
     * Redirect to courses results page with parameters
     * @param {Object} params - Filter parameters
     */
    function redirectToCoursesResults(params) {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.set(key, value);
        });
        
        window.location.href = '/courses/results?' + queryParams.toString();
    }
    
    // Handle filter triggers
    filterTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            
            const filterGroup = this.closest('.filter-group');
            const filterOptions = filterGroup.querySelector('.filter-options');
            const isShown = filterOptions.classList.toggle('show');
            
            this.classList.toggle('active', isShown);
            
            if (isShown && typeof Popper !== 'undefined') {
                // Create or update Popper instance
                if (!popperInstances[trigger.id]) {
                    popperInstances[trigger.id] = Popper.createPopper(trigger, filterOptions, {
                        placement: 'bottom-start',
                        modifiers: [
                            {
                                name: 'offset',
                                options: {
                                    offset: [0, 5],
                                },
                            },
                            {
                                name: 'preventOverflow',
                                options: {
                                    boundary: document.querySelector('.hero-content') || document.querySelector('.topic-filters'),
                                    padding: 10
                                },
                            },
                            {
                                name: 'computeStyles',
                                options: {
                                    gpuAcceleration: true,
                                },
                            },
                            {
                                name: 'zIndex',
                                options: {
                                    zIndex: 9999
                                }
                            }
                        ],
                    });
                } else {
                    popperInstances[trigger.id].update();
                }
                
                // Add arrow element for visual cue if not exists
                if (!filterOptions.querySelector('.popper-arrow')) {
                    const arrow = document.createElement('div');
                    arrow.className = 'popper-arrow';
                    filterOptions.appendChild(arrow);
                }
            } else if (isShown) {
                // Fallback positioning if Popper is not available
                filterOptions.style.display = 'block';
                filterOptions.style.position = 'absolute';
                filterOptions.style.top = (trigger.offsetHeight + 5) + 'px';
                filterOptions.style.left = '0';
                filterOptions.style.zIndex = '9999';
            }
            
            // Close other open filters
            filterTriggers.forEach(otherTrigger => {        
                if (otherTrigger !== trigger) {
                    const otherGroup = otherTrigger.closest('.filter-group');
                    const otherOptions = otherGroup.querySelector('.filter-options');
                    otherOptions.classList.remove('show');
                    otherTrigger.classList.remove('active');
                }
            });
            
            // Toggle survey button visibility
            toggleSurveyButton();
        });
    });
    
    // Close filters when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.filter-group')) {
            document.querySelectorAll('.filter-options').forEach(options => {
                options.classList.remove('show');
            });
            
            document.querySelectorAll('.filter-trigger').forEach(trigger => {
                trigger.classList.remove('active');
            });
            
            // Toggle survey button visibility
            toggleSurveyButton();
        }
    });
    
    // Handle filter tag selection
    const filterTags = document.querySelectorAll('.filter-tag');
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            
            const filterType = this.getAttribute('data-filter');
            const filterValue = this.getAttribute('data-value');
            
            if (!filterType) {
                return;
            }
            
            // Update UI
            const parentOptions = this.closest('.filter-options');
            const allTags = parentOptions.querySelectorAll('.filter-tag');
            
            allTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update trigger text using the new function
            const trigger = this.closest('.filter-group').querySelector('.filter-trigger');
            const displayText = this.textContent.trim();
            updateFilterTriggerText(trigger, filterType, filterValue, displayText);
            
            // Close filter dropdown
            parentOptions.classList.remove('show');
            trigger.classList.remove('active');
            
            // Toggle survey button visibility
            toggleSurveyButton();
            
            // Determine which load function to call based on page type
            if (isTopicPage) {
                // For topic page, filter blocks
                const topicFilters = {
                    language: filterType === 'language' ? filterValue : '',
                    level: filterType === 'level' ? filterValue : '',
                    type: filterType === 'type' ? filterValue : ''
                };
                
                // Preserve other active filters
                const currentLanguage = document.querySelector('.filter-tag[data-filter="language"].active');
                const currentLevel = document.querySelector('.filter-tag[data-filter="level"].active');
                const currentType = document.querySelector('.filter-tag[data-filter="type"].active');
                
                if (currentLanguage && filterType !== 'language') {
                    topicFilters.language = currentLanguage.getAttribute('data-value');
                }
                if (currentLevel && filterType !== 'level') {
                    topicFilters.level = currentLevel.getAttribute('data-value');
                }
                if (currentType && filterType !== 'type') {
                    topicFilters.type = currentType.getAttribute('data-value');
                }
                
                loadFilteredBlocks(topicFilters);
            } else if (isResourceLibraryPage) {
                // For resource library page, redirect to courses results with filter
                const resourceFilters = {
                    [filterType]: filterValue
                };
                
                // Preserve other active filters from the current page
                const currentLanguage = document.querySelector('.filter-tag[data-filter="language"].active');
                const currentLevel = document.querySelector('.filter-tag[data-filter="level"].active');
                const currentType = document.querySelector('.filter-tag[data-filter="type"].active');
                
                if (currentLanguage && filterType !== 'language') {
                    resourceFilters.language = currentLanguage.getAttribute('data-value');
                }
                if (currentLevel && filterType !== 'level') {
                    resourceFilters.level = currentLevel.getAttribute('data-value');
                }
                if (currentType && filterType !== 'type') {
                    resourceFilters.type = currentType.getAttribute('data-value');
                }
                
                redirectToCoursesResults(resourceFilters);
            } else {
                // For courses results page, filter materials
                filterValues[filterType] = filterValue;
                filterValues.page = 1;
                loadResources({ ...filterValues });
            }
        });
    });
    
    // Handle search form submission
    const searchForm = document.getElementById('resource-search-form');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = this.querySelector('input[name="q"]');
            filterValues.search = searchInput.value;
            filterValues.page = 1;
            
            loadResources({ ...filterValues });
        });
    }
    
    // Initialize pagination listeners on page load
    initializePaginationListeners();
    
    // Handle filter form submission
    const filterForms = document.querySelectorAll('form[data-filter]');
    filterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const params = Object.fromEntries(
                Array.from(formData.entries())
                    .filter(([_, value]) => value)
            );
            
            params.page = 1;
            
            loadResources(params);
        });
    });
    
    // Initialize filter states from URL on topic page
    if (isTopicPage) {
        ['language', 'level', 'type'].forEach(filterType => {
            if (urlParams.has(filterType)) {
                const value = urlParams.get(filterType);
                const filterTag = document.querySelector(`.filter-tag[data-filter="${filterType}"][data-value="${value}"]`);
                if (filterTag) {
                    filterTag.classList.add('active');
                    
                    // Update trigger text using the new function
                    const trigger = filterTag.closest('.filter-group').querySelector('.filter-trigger');
                    const displayText = filterTag.textContent.trim();
                    updateFilterTriggerText(trigger, filterType, value, displayText);
                }
            }
        });
        
        // Load filtered blocks if any filters are active
        if (urlParams.has('language') || urlParams.has('level') || urlParams.has('type')) {
            const topicFilters = {
                language: urlParams.get('language') || '',
                level: urlParams.get('level') || '',
                type: urlParams.get('type') || ''
            };
            loadFilteredBlocks(topicFilters);
        }
    }
    
    /**
     * Update filter UI state to reflect current filter values
     * @param {Object} values - Current filter values
     */
    function updateFilterUIFromValues(values) {
        // Clear all active states first
        document.querySelectorAll('.filter-tag.active').forEach(tag => {
            tag.classList.remove('active');
        });
        
        // Reset all filter triggers to default state
        const allFilterTypes = ['language', 'level', 'type', 'topic', 'department'];
        allFilterTypes.forEach(filterType => {
            const filterGroup = document.querySelector(`[data-filter="${filterType}"]`)?.closest('.filter-group');
            if (filterGroup) {
                const trigger = filterGroup.querySelector('.filter-trigger');
                if (trigger) {
                    updateFilterTriggerText(trigger, filterType, '', '');
                }
            }
        });
        
        // Update filter trigger texts and activate corresponding filter tags
        Object.entries(values).forEach(([filterType, filterValue]) => {
            if (filterValue && filterType !== 'search' && filterType !== 'page') {
                // Find and activate the corresponding filter tag
                const filterTag = document.querySelector(`.filter-tag[data-filter="${filterType}"][data-value="${filterValue}"]`);
                if (filterTag) {
                    filterTag.classList.add('active');
                    
                    // Update the trigger button text
                    const filterGroup = filterTag.closest('.filter-group');
                    if (filterGroup) {
                        const trigger = filterGroup.querySelector('.filter-trigger');
                        if (trigger) {
                            updateFilterTriggerText(trigger, filterType, filterValue, filterTag.textContent.trim());
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update filter trigger button text
     * @param {Element} trigger - Filter trigger button
     * @param {string} filterType - Type of filter
     * @param {string} filterValue - Filter value
     * @param {string} displayText - Display text for the filter
     */
    function updateFilterTriggerText(trigger, filterType, filterValue, displayText) {
        const filterLabels = {
            'language': 'Language',
            'level': 'Level',
            'type': 'Type',
            'topic': 'Topic',
            'department': 'Institution'
        };
        
        const baseText = filterLabels[filterType] || filterType;
        
        if (filterValue && filterValue !== '') {
            // Update trigger to show selected value
            trigger.innerHTML = `${baseText} <span class="selected-value">: ${displayText}</span> <i class="filter-arrow"></i>`;
        } else {
            // Reset to default text
            trigger.innerHTML = `${baseText} <i class="filter-arrow"></i>`;
        }
    }
});
