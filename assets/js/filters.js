// Configuration and Constants
const CONFIG = {
    ENDPOINTS: {
        COURSES_RESULTS: '/courses/results',
    },
    HEADERS: {
        CONTENT_TYPE: 'application/x-www-form-urlencoded',
        OCTOBER_HANDLER: 'X-OCTOBER-REQUEST-HANDLER',
        REQUESTED_WITH: 'X-Requested-With',
        XML_HTTP_REQUEST: 'XMLHttpRequest'
    },
    FILTER_TYPES: ['language', 'level', 'department', 'type', 'topic'],
    FILTER_LABELS: {
        'language': 'Language',
        'level': 'Level',
        'type': 'Type',
        'topic': 'Topic',
        'department': 'Institution'
    },
    POPPER_CONFIG: {
        placement: 'bottom-start',
        modifiers: [
            {
                name: 'offset',
                options: { offset: [0, 5] }
            },
            {
                name: 'preventOverflow',
                options: {
                    boundary: null, // Will be set dynamically
                    padding: 10
                }
            },
            {
                name: 'computeStyles',
                options: { gpuAcceleration: true }
            },
            {
                name: 'zIndex',
                options: { zIndex: 9999 }
            }
        ]
    }
};

/**
 * Main Filter Manager Class
 * Handles all filter functionality across different page types
 */
class FilterManager {
    constructor() {
        this.popperInstances = {};
        this.filterValues = {
            language: '',
            level: '',
            department: '',
            type: '',
            topic: '',
            search: '',
            page: 1
        };
        
        this.elements = this.initializeElements();
        this.pageContext = this.determinePageContext();
        
        this.init();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        return {
            filterTriggers: document.querySelectorAll('.filter-trigger'),
            surveyButtonContainer: document.querySelector('.survey-button-container'),
            resultsContainer: document.getElementById('results-container'),
            blocksContainer: document.getElementById('blocks-container'),
            paginationContainer: document.getElementById('pagination-container'),
            searchForm: document.getElementById('resource-search-form'),
            filterForms: document.querySelectorAll('form[data-filter]'),
            filterTags: document.querySelectorAll('.filter-tag')
        };
    }

    /**
     * Determine current page context
     */
    determinePageContext() {
        const pathname = window.location.pathname;
        return {
            isCoursesResultsPage: pathname.includes('/courses/results'),
            isTopicPage: pathname.includes('/topic/'),
            isResourceLibraryPage: pathname.includes('/resource-library')
        };
    }

    /**
     * Initialize the filter manager
     */
    init() {
        this.initializeFromURL();
        this.attachEventListeners();
        this.initializePaginationListeners();
        
        // Load initial results on courses results page (regardless of filters)
        if (this.pageContext.isCoursesResultsPage) {
            this.loadResources(this.filterValues);
        }

        // Initialize topic page filters from URL
        if (this.pageContext.isTopicPage) {
            this.initializeTopicPageFilters();
        }
    }

    /**
     * Initialize filter values from URL parameters
     */
    initializeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (!this.pageContext.isCoursesResultsPage) return;

        // Initialize filter values from URL
        CONFIG.FILTER_TYPES.forEach(param => {
            if (urlParams.has(param)) {
                this.filterValues[param] = urlParams.get(param);
            }
        });

        // Handle search parameter
        if (urlParams.has('search') || urlParams.has('q')) {
            this.filterValues.search = urlParams.get('search') || urlParams.get('q');
            // Ensure search input is populated (this is a backup to the early population)
            this.updateSearchInput(this.filterValues.search);
        }

        // Handle page parameter
        if (urlParams.has('page')) {
            this.filterValues.page = parseInt(urlParams.get('page'), 10) || 1;
        }

        // Update UI to reflect URL state
        this.updateFilterUIFromValues(this.filterValues);
    }

    /**
     * Initialize topic page filters from URL
     */
    initializeTopicPageFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        const topicFilterTypes = ['language', 'level', 'type'];
        
        topicFilterTypes.forEach(filterType => {
            if (urlParams.has(filterType)) {
                const value = urlParams.get(filterType);
                this.activateFilterTag(filterType, value);
            }
        });

        // Load filtered blocks if any filters are active
        if (topicFilterTypes.some(type => urlParams.has(type))) {
            const topicFilters = {
                language: urlParams.get('language') || '',
                level: urlParams.get('level') || '',
                type: urlParams.get('type') || ''
            };
            this.loadFilteredBlocks(topicFilters);
        }
    }

    /**
     * Check if any filters are currently active
     */
    hasActiveFilters() {
        return CONFIG.FILTER_TYPES.some(type => this.filterValues[type]) ||
               this.filterValues.search ||
               this.filterValues.page > 1;
    }

    /**
     * Update search input value
     */
    updateSearchInput(value) {
        const searchInput = document.querySelector('input[name="q"]');
        if (searchInput) {
            // Only update if the value is different to avoid overriding user input
            if (searchInput.value !== value) {
                searchInput.value = value || '';
            }
        }
    }

    /**
     * Activate a filter tag by type and value
     */
    activateFilterTag(filterType, value) {
        const filterTag = document.querySelector(
            `.filter-tag[data-filter="${filterType}"][data-value="${value}"]`
        );
        
        if (filterTag) {
            filterTag.classList.add('active');
            
            const trigger = filterTag.closest('.filter-group')?.querySelector('.filter-trigger');
            if (trigger) {
                const displayText = filterTag.textContent.trim();
                this.updateFilterTriggerText(trigger, filterType, value, displayText);
            }
        }
    }

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        this.attachFilterTriggerListeners();
        this.attachFilterTagListeners();
        this.attachSearchFormListener();
        this.attachFilterFormListeners();
        this.attachDocumentClickListener();
    }

    /**
     * Attach filter trigger event listeners
     */
    attachFilterTriggerListeners() {
        this.elements.filterTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => this.handleFilterTriggerClick(e, trigger));
        });
    }

    /**
     * Handle filter trigger click
     */
    handleFilterTriggerClick(e, trigger) {
        e.preventDefault();
        
        const filterGroup = trigger.closest('.filter-group');
        const filterOptions = filterGroup.querySelector('.filter-options');
        const isShown = filterOptions.classList.toggle('show');
        
        trigger.classList.toggle('active', isShown);
        
        if (isShown) {
            this.setupDropdownPositioning(trigger, filterOptions);
            this.closeOtherFilters(trigger);
        }
        
        this.toggleSurveyButton();
    }

    /**
     * Setup dropdown positioning using Popper.js or fallback
     */
    setupDropdownPositioning(trigger, filterOptions) {
        if (typeof Popper !== 'undefined') {
            this.setupPopperPositioning(trigger, filterOptions);
        } else {
            this.setupFallbackPositioning(trigger, filterOptions);
        }
        
        this.addArrowElement(filterOptions);
    }

    /**
     * Setup Popper.js positioning
     */
    setupPopperPositioning(trigger, filterOptions) {
        if (!this.popperInstances[trigger.id]) {
            const config = { ...CONFIG.POPPER_CONFIG };
            config.modifiers[1].options.boundary = 
                document.querySelector('.hero-content') || 
                document.querySelector('.topic-filters');
            
            this.popperInstances[trigger.id] = Popper.createPopper(trigger, filterOptions, config);
        } else {
            this.popperInstances[trigger.id].update();
        }
    }

    /**
     * Setup fallback positioning
     */
    setupFallbackPositioning(trigger, filterOptions) {
        Object.assign(filterOptions.style, {
            display: 'block',
            position: 'absolute',
            top: `${trigger.offsetHeight + 5}px`,
            left: '0',
            zIndex: '9999'
        });
    }

    /**
     * Add arrow element for visual cue
     */
    addArrowElement(filterOptions) {
        if (!filterOptions.querySelector('.popper-arrow')) {
            const arrow = document.createElement('div');
            arrow.className = 'popper-arrow';
            filterOptions.appendChild(arrow);
        }
    }

    /**
     * Close other open filters
     */
    closeOtherFilters(currentTrigger) {
        this.elements.filterTriggers.forEach(trigger => {
            if (trigger !== currentTrigger) {
                const group = trigger.closest('.filter-group');
                const options = group.querySelector('.filter-options');
                options.classList.remove('show');
                trigger.classList.remove('active');
            }
        });
    }

    /**
     * Attach filter tag event listeners
     */
    attachFilterTagListeners() {
        this.elements.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => this.handleFilterTagClick(e, tag));
        });
    }

    /**
     * Handle filter tag click
     */
    handleFilterTagClick(e, tag) {
        e.preventDefault();
        
        const filterType = tag.getAttribute('data-filter');
        const filterValue = tag.getAttribute('data-value');
        
        if (!filterType) return;
        
        this.updateFilterTagUI(tag);
        this.closeDropdown(tag);
        this.toggleSurveyButton();
        
        this.handleFilterSelection(filterType, filterValue);
    }

    /**
     * Update filter tag UI state
     */
    updateFilterTagUI(selectedTag) {
        const parentOptions = selectedTag.closest('.filter-options');
        const allTags = parentOptions.querySelectorAll('.filter-tag');
        
        allTags.forEach(tag => tag.classList.remove('active'));
        selectedTag.classList.add('active');
        
        // Update trigger text
        const trigger = selectedTag.closest('.filter-group').querySelector('.filter-trigger');
        const filterType = selectedTag.getAttribute('data-filter');
        const filterValue = selectedTag.getAttribute('data-value');
        const displayText = selectedTag.textContent.trim();
        
        this.updateFilterTriggerText(trigger, filterType, filterValue, displayText);
    }

    /**
     * Close dropdown after selection
     */
    closeDropdown(tag) {
        const parentOptions = tag.closest('.filter-options');
        const trigger = tag.closest('.filter-group').querySelector('.filter-trigger');
        
        parentOptions.classList.remove('show');
        trigger.classList.remove('active');
    }

    /**
     * Handle filter selection based on page type
     */
    handleFilterSelection(filterType, filterValue) {
        if (this.pageContext.isTopicPage) {
            this.handleTopicPageFilter(filterType, filterValue);
        } else if (this.pageContext.isResourceLibraryPage) {
            this.handleResourceLibraryFilter(filterType, filterValue);
        } else {
            this.handleCoursesResultsFilter(filterType, filterValue);
        }
    }

    /**
     * Handle topic page filtering
     */
    handleTopicPageFilter(filterType, filterValue) {
        const topicFilters = this.getPreservedTopicFilters(['language', 'level', 'type']);
        topicFilters[filterType] = filterValue;
        this.loadFilteredBlocks(topicFilters);
    }

    /**
     * Handle resource library page filtering
     */
    handleResourceLibraryFilter(filterType, filterValue) {
        const resourceFilters = this.getPreservedTopicFilters(['language', 'level', 'type']);
        resourceFilters[filterType] = filterValue;
        this.redirectToCoursesResults(resourceFilters);
    }

    /**
     * Handle courses results page filtering
     */
    handleCoursesResultsFilter(filterType, filterValue) {
        this.filterValues[filterType] = filterValue;
        this.filterValues.page = 1;
        this.loadResources({ ...this.filterValues });
    }

    /**
     * Get preserved filter values for topic/resource library pages
     */
    getPreservedTopicFilters(filterTypes) {
        const filters = {};
        
        filterTypes.forEach(type => {
            const activeTag = document.querySelector(`.filter-tag[data-filter="${type}"].active`);
            filters[type] = activeTag ? activeTag.getAttribute('data-value') : '';
        });
        
        return filters;
    }

    /**
     * Attach search form event listener
     */
    attachSearchFormListener() {
        // Find all search forms (including homepage hero form)
        const searchForms = document.querySelectorAll('#resource-search-form, form[data-resource-search]');
        
        searchForms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSearchSubmit(e));
        });
        
        // Legacy fallback for the main search form element
        if (this.elements.searchForm && !Array.from(searchForms).includes(this.elements.searchForm)) {
            this.elements.searchForm.addEventListener('submit', (e) => this.handleSearchSubmit(e));
        }
    }

    /**
     * Handle search form submission
     */
    handleSearchSubmit(e) {
        e.preventDefault();
        
        const searchInput = e.target.querySelector('input[name="q"]');
        this.filterValues.search = searchInput.value;
        this.filterValues.page = 1;
        
        this.loadResources({ ...this.filterValues });
    }

    /**
     * Attach filter form event listeners
     */
    attachFilterFormListeners() {
        this.elements.filterForms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFilterFormSubmit(e));
        });
    }

    /**
     * Handle filter form submission
     */
    handleFilterFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const params = Object.fromEntries(
            Array.from(formData.entries()).filter(([_, value]) => value)
        );
        
        params.page = 1;
        this.loadResources(params);
    }

    /**
     * Attach document click listener for closing dropdowns
     */
    attachDocumentClickListener() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-group')) {
                this.closeAllFilters();
                this.toggleSurveyButton();
            }
        });
    }

    /**
     * Close all open filters
     */
    closeAllFilters() {
        document.querySelectorAll('.filter-options').forEach(options => {
            options.classList.remove('show');
        });
        
        this.elements.filterTriggers.forEach(trigger => {
            trigger.classList.remove('active');
        });
    }

    /**
     * Toggle survey button visibility based on dropdown state
     */
    toggleSurveyButton() {
        if (!this.elements.surveyButtonContainer) return;
        
        const anyDropdownOpen = document.querySelector('.filter-options.show');
        this.elements.surveyButtonContainer.classList.toggle('hidden', !!anyDropdownOpen);
    }

    /**
     * Load resources via AJAX
     */
    async loadResources(params) {
        if (!this.prepareResourcesContainer()) {
            this.redirectToCoursesResults(params);
            return;
        }

        try {
            const response = await this.fetchResources(params);
            const data = await response.json();
            
            this.updateResourcesUI(data);
            this.updateURL(params);
            this.updateGlobalFilterValues(params);
            this.initializePaginationListeners();
            
        } catch (error) {
            this.handleLoadError('Error loading results. Please try again.');
        }
    }

    /**
     * Prepare resources container for loading
     */
    prepareResourcesContainer() {
        if (this.elements.resultsContainer) {
            this.elements.resultsContainer.innerHTML = 
                '<div class="loading-indicator"><p>Loading results...</p></div>';
            return true;
        } else if (this.pageContext.isCoursesResultsPage) {
            return false;
        }
        return false;
    }

    /**
     * Fetch resources from server
     */
    fetchResources(params) {
        // Clean up parameters - only send non-empty values
        const cleanParams = {};
        Object.entries(params).forEach(([key, value]) => {
            if (value && value !== '') {
                cleanParams[key] = value;
            }
        });
        
        return fetch(CONFIG.ENDPOINTS.COURSES_RESULTS, {
            method: 'POST',
            headers: {
                'Content-Type': CONFIG.HEADERS.CONTENT_TYPE,
                [CONFIG.HEADERS.OCTOBER_HANDLER]: 'onLoadResources',
                [CONFIG.HEADERS.REQUESTED_WITH]: CONFIG.HEADERS.XML_HTTP_REQUEST
            },
            body: new URLSearchParams(cleanParams)
        });
    }

    /**
     * Update resources UI with response data
     */
    updateResourcesUI(data) {
        if (data['#results-container']) {
            this.elements.resultsContainer.innerHTML = data['#results-container'];
        }
        
        if (data['#pagination-container'] && this.elements.paginationContainer) {
            this.elements.paginationContainer.innerHTML = data['#pagination-container'];
        }
    }

    /**
     * Update URL with current parameters
     */
    updateURL(params) {
        const newParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                // Convert internal 'search' parameter to URL 'q' parameter for consistency
                if (key === 'search') {
                    newParams.set('q', value);
                } else {
                    newParams.set(key, value);
                }
            }
        });
        
        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        window.history.pushState({}, '', newUrl);
    }

    /**
     * Update global filter values
     */
    updateGlobalFilterValues(params) {
        Object.assign(this.filterValues, params);
    }

    /**
     * Handle loading errors
     */
    handleLoadError(message) {
        if (this.elements.resultsContainer) {
            this.elements.resultsContainer.innerHTML = 
                `<div class="error-message"><p>${message}</p></div>`;
        }
    }

    /**
     * Load filtered blocks for topic page
     */
    async loadFilteredBlocks(params) {
        if (!this.elements.blocksContainer) return;

        this.elements.blocksContainer.innerHTML = 
            '<div class="loading-indicator"><p>Loading blocks...</p></div>';

        try {
            const response = await fetch(window.location.pathname, {
                method: 'POST',
                headers: {
                    'Content-Type': CONFIG.HEADERS.CONTENT_TYPE,
                    [CONFIG.HEADERS.OCTOBER_HANDLER]: 'onLoadFilteredBlocks',
                    [CONFIG.HEADERS.REQUESTED_WITH]: CONFIG.HEADERS.XML_HTTP_REQUEST
                },
                body: new URLSearchParams(params)
            });

            const data = await response.json();
            
            if (data['#blocks-container']) {
                this.elements.blocksContainer.innerHTML = data['#blocks-container'];
            }
            
            this.updateTopicPageURL(params);
            
        } catch (error) {
            this.handleBlocksLoadError();
        }
    }

    /**
     * Update URL for topic page
     */
    updateTopicPageURL(params) {
        const newParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) newParams.set(key, value);
        });
        
        const newUrl = newParams.toString() ? 
            `${window.location.pathname}?${newParams.toString()}` : 
            window.location.pathname;
        
        window.history.pushState({}, '', newUrl);
    }

    /**
     * Handle blocks loading error
     */
    handleBlocksLoadError() {
        if (this.elements.blocksContainer) {
            this.elements.blocksContainer.innerHTML = 
                '<div class="error-message"><p>Error loading blocks. Please try again.</p></div>';
        }
    }

    /**
     * Initialize pagination event listeners
     */
    initializePaginationListeners() {
        const paginationLinks = document.querySelectorAll('.pagination a');
        
        paginationLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handlePaginationClick(e, link));
        });
    }

    /**
     * Handle pagination click
     */
    handlePaginationClick(e, link) {
        e.preventDefault();
        
        const currentParams = { ...this.filterValues };
        currentParams.page = link.dataset.page;
        
        this.loadResources(currentParams);
    }

    /**
     * Redirect to courses results page with parameters
     */
    redirectToCoursesResults(params) {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                // Convert internal 'search' parameter to URL 'q' parameter for consistency
                if (key === 'search') {
                    queryParams.set('q', value);
                } else {
                    queryParams.set(key, value);
                }
            }
        });
        
        window.location.href = `${CONFIG.ENDPOINTS.COURSES_RESULTS}?${queryParams.toString()}`;
    }

    /**
     * Update filter UI state to reflect current filter values
     */
    updateFilterUIFromValues(values) {
        // Clear all active states
        document.querySelectorAll('.filter-tag.active').forEach(tag => {
            tag.classList.remove('active');
        });
        
        // Reset all filter triggers
        this.resetAllFilterTriggers();
        
        // Update UI for each active filter
        Object.entries(values).forEach(([filterType, filterValue]) => {
            if (filterValue && filterType !== 'search' && filterType !== 'page') {
                this.activateFilterTag(filterType, filterValue);
            }
        });
    }

    /**
     * Reset all filter triggers to default state
     */
    resetAllFilterTriggers() {
        CONFIG.FILTER_TYPES.forEach(filterType => {
            const filterGroup = document.querySelector(`[data-filter="${filterType}"]`)?.closest('.filter-group');
            if (filterGroup) {
                const trigger = filterGroup.querySelector('.filter-trigger');
                if (trigger) {
                    this.updateFilterTriggerText(trigger, filterType, '', '');
                }
            }
        });
    }

    /**
     * Update filter trigger button text
     */
    updateFilterTriggerText(trigger, filterType, filterValue, displayText) {
        const baseText = CONFIG.FILTER_LABELS[filterType] || filterType;
        
        if (filterValue && filterValue !== '') {
            trigger.innerHTML = `${baseText} <span class="selected-value">: ${displayText}</span> <i class="filter-arrow"></i>`;
        } else {
            trigger.innerHTML = `${baseText} <i class="filter-arrow"></i>`;
        }
    }
}

// Immediately populate search input from URL if present (before DOM ready)
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search') || urlParams.get('q');
        
    if (searchTerm) {
        // Function to populate search input
        const populateSearch = () => {
            // Find ALL search inputs on the page
            const searchInputs = document.querySelectorAll('input[name="q"]');
            
            let populated = false;
            searchInputs.forEach((searchInput, index) => {
                
                if (!searchInput.value) {
                    searchInput.value = searchTerm;
                    populated = true;
                    
                    // Verify it was actually set
                    setTimeout(() => {
                        if (searchInput.value !== searchTerm) {
                            searchInput.value = searchTerm;
                            
                            // Force trigger input event in case there are listeners
                            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                            searchInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }, 100);
                }
            });
            
            return populated;
        };
        
        // Try multiple times to ensure we catch the input when it's available
        let attempts = 0;
        const maxAttempts = 20; // Maximum 1 second of retries (20 * 50ms)
        
        const tryPopulate = () => {
            if (!populateSearch() && attempts < maxAttempts) {
                attempts++;
                // If input not found or already has value, try again in a moment
                setTimeout(tryPopulate, 50);
            }
        };
        
        // Start trying immediately
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryPopulate);
        } else {
            tryPopulate();
        }
        
        // Also add a persistent watcher that will keep setting the value if it gets cleared
        let watcherAttempts = 0;
        const maxWatcherAttempts = 50; // 5 seconds worth of checking
        
        const persistentWatcher = () => {
            const searchInputs = document.querySelectorAll('input[name="q"]');
            let needsUpdate = false;
            
            searchInputs.forEach((searchInput, index) => {
                if (searchInput.value !== searchTerm && watcherAttempts < maxWatcherAttempts) {
                    searchInput.value = searchTerm;
                    needsUpdate = true;
                }
            });
            
            if (needsUpdate && watcherAttempts < maxWatcherAttempts) {
                watcherAttempts++;
                setTimeout(persistentWatcher, 100);
            }
        };
        
        // Start the persistent watcher after a short delay
        setTimeout(persistentWatcher, 200);
    }
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FilterManager();
});
