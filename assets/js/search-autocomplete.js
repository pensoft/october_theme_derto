/**
 * Search Autocomplete Functionality
 * Provides keyword suggestions for search inputs across the site
 * Following modern JavaScript best practices and performance optimization
 */

class SearchAutocomplete {
    constructor(options = {}) {
        this.options = {
            debounceDelay: 300,
            minQueryLength: 2,
            maxSuggestions: 10,
            componentAlias: 'searchSuggestions',
            ...options
        };
        
        this.cache = new Map();
        this.currentRequest = null;
        this.activeInput = null;
        this.suggestionsList = null;
        this.selectedIndex = -1;
        
        this.init();
    }

    init() {
        this.createSuggestionContainer();
        this.bindEvents();
        this.setupKeyboardNavigation();
    }

    createSuggestionContainer() {
        this.suggestionsList = document.createElement('div');
        this.suggestionsList.className = 'search-suggestions';
        this.suggestionsList.style.display = 'none';
        document.body.appendChild(this.suggestionsList);
    }

    bindEvents() {
        // Handle all search inputs with debouncing
        document.addEventListener('input', this.debounce((e) => {
            if (this.isSearchInput(e.target)) {
                this.handleInput(e.target);
            }
        }, this.options.debounceDelay));

        // Handle clicks outside to close suggestions
        document.addEventListener('click', (e) => {
            if (!this.suggestionsList.contains(e.target) && !this.isSearchInput(e.target)) {
                this.hideSuggestions();
            }
        });

        // Handle search form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.querySelector('input[name="q"]')) {
                this.hideSuggestions();
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.activeInput || !this.isSuggestionsVisible()) {
                return;
            }

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateSuggestions(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateSuggestions(-1);
                    break;
                case 'Enter':
                    if (this.selectedIndex >= 0) {
                        e.preventDefault();
                        this.selectSuggestion(this.selectedIndex);
                    }
                    break;
                case 'Escape':
                    this.hideSuggestions();
                    break;
            }
        });
    }

    isSearchInput(element) {
        return element && 
               element.type === 'text' && 
               element.name === 'q' &&
               !element.classList.contains('no-autocomplete');
    }

    async handleInput(input) {
        const query = input.value.trim();
        this.activeInput = input;

        if (query.length < this.options.minQueryLength) {
            this.hideSuggestions();
            return;
        }

        // Check cache first
        if (this.cache.has(query)) {
            this.showSuggestions(this.cache.get(query), input);
            return;
        }

        // Cancel previous request
        if (this.currentRequest) {
            this.currentRequest.abort();
        }

        try {
            this.currentRequest = this.fetchSuggestions(query);
            const suggestions = await this.currentRequest;
            
            // Cache the results
            this.cache.set(query, suggestions);
            
            // Limit cache size
            if (this.cache.size > 100) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }

            this.showSuggestions(suggestions, input);
        } catch (error) {
            if (error.name !== 'AbortError') {
                this.hideSuggestions();
            }
        } finally {
            this.currentRequest = null;
        }
    }

    async fetchSuggestions(query) {
        const controller = new AbortController();
        

        
        // Try October Framework first (if available)
        if (window.$ && window.$.request) {
            return new Promise((resolve, reject) => {
                window.$.request(`${this.options.componentAlias}::onGetSuggestions`, {
                    data: { query: query },
                    success: function(data) {
                        resolve(data.suggestions || []);
                    },
                    error: function(xhr, status, error) {
                        // Gracefully handle October framework errors
                        resolve([]); // Return empty array instead of rejecting
                    }
                });
            });
        }
        
        // Fallback to native fetch
        const request = fetch(`${window.location.origin}${window.location.pathname}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest',
                'X-OCTOBER-REQUEST-HANDLER': `${this.options.componentAlias}::onGetSuggestions`
            },
            body: new URLSearchParams({
                query: query
            }),
            signal: controller.signal
        });

        request.abort = () => controller.abort();

        const response = await request;
        
        if (!response.ok) {
            // Return empty array instead of throwing error
            return [];
        }

        const data = await response.json();
        return data.suggestions || [];
    }

    showSuggestions(suggestions, input) {
        if (!suggestions.length) {
            this.hideSuggestions();
            return;
        }

        this.selectedIndex = -1;
        this.suggestionsList.innerHTML = '';

        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => this.selectSuggestion(index));
            this.suggestionsList.appendChild(item);
        });

        this.positionSuggestions(input);
        this.suggestionsList.style.display = 'block';
    }

    positionSuggestions(input) {
        const rect = input.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        this.suggestionsList.style.position = 'absolute';
        this.suggestionsList.style.top = `${rect.bottom + scrollTop}px`;
        this.suggestionsList.style.left = `${rect.left + scrollLeft}px`;
        this.suggestionsList.style.width = `${rect.width}px`;
        this.suggestionsList.style.zIndex = '9999';
    }

    hideSuggestions() {
        this.suggestionsList.style.display = 'none';
        this.selectedIndex = -1;
        this.activeInput = null;
    }

    isSuggestionsVisible() {
        return this.suggestionsList.style.display !== 'none';
    }

    navigateSuggestions(direction) {
        const items = this.suggestionsList.querySelectorAll('.suggestion-item');
        if (!items.length) return;

        // Remove previous selection
        if (this.selectedIndex >= 0) {
            items[this.selectedIndex].classList.remove('selected');
        }

        // Calculate new index
        this.selectedIndex += direction;
        
        if (this.selectedIndex < 0) {
            this.selectedIndex = items.length - 1;
        } else if (this.selectedIndex >= items.length) {
            this.selectedIndex = 0;
        }

        // Apply new selection
        items[this.selectedIndex].classList.add('selected');
        items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
    }

    selectSuggestion(index) {
        const items = this.suggestionsList.querySelectorAll('.suggestion-item');
        if (items[index] && this.activeInput) {
            const input = this.activeInput; // Store reference before hiding suggestions
            const selectedValue = items[index].textContent;
            
            // Set the value and hide suggestions
            input.value = selectedValue;
            this.hideSuggestions();
            
            // Trigger input event for any listeners
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
            
            // Optionally trigger the form submission or search
            const form = input.closest('form');
            if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
            }
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    positionErrorMessage(input) {
        const rect = input.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        this.errorMessage.style.position = 'absolute';
        this.errorMessage.style.top = `${rect.bottom + scrollTop}px`;
        this.errorMessage.style.left = `${rect.left + scrollLeft}px`;
        this.errorMessage.style.width = `${rect.width}px`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const hasComponent = document.querySelector('[data-component="searchSuggestions"]');
    const hasSearchInput = document.querySelector('input[name="q"]');
    
    if (hasComponent || hasSearchInput) {
        window.searchAutocomplete = new SearchAutocomplete();
    }
});

window.SearchAutocomplete = SearchAutocomplete; 