// Material Popup with Dynamic Content Loading
(function() {
    'use strict';

    let popup = null;
    let isOpen = false;
    let currentMaterial = null;

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    }

    function setup() {
        popup = document.getElementById('material-popup');
        if (!popup) return;

        bindEvents();
        bindMaterialCards();
    }

    function bindEvents() {
        // Close popup
        const closeBtn = popup.querySelector('.close-popup');
        if (closeBtn) {
            closeBtn.addEventListener('click', close);
        }
        
        // Close on overlay click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) close();
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) close();
        });
    }

    function bindMaterialCards() {
        // Listen for clicks on material cards to open popup
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.material-card');
            if (card) {
                e.preventDefault();
                loadMaterialData(card);
                open();
            }
        });
    }

    function loadMaterialData(card) {
        // Extract material data from card attributes
        currentMaterial = {
            id: card.dataset.materialId,
            name: card.dataset.materialName,
            type: card.dataset.materialType,
            prefix: card.dataset.materialPrefix,
            duration: card.dataset.materialDuration,
            language: card.dataset.materialLanguage,
            description: card.dataset.materialDescription,
            keywords: card.dataset.materialKeywords,
            cover: card.dataset.materialCover,
            youtube_url: card.dataset.materialYoutubeUrl,
            video_file: card.dataset.materialVideoFile,
            document_file: card.dataset.materialDocumentFile,
            quiz: card.dataset.materialQuiz
        };

        populatePopup();
    }

    function populatePopup() {
        if (!currentMaterial) return;

        // Set title
        const titleEl = popup.querySelector('#popup-material-title');
        if (titleEl) titleEl.textContent = currentMaterial.name || 'Material';

        // Set type
        const typeEl = popup.querySelector('#popup-material-type');
        if (typeEl) typeEl.textContent = (currentMaterial.type || 'material').charAt(0).toUpperCase() + (currentMaterial.type || 'material').slice(1);

        // Set prefix
        const prefixEl = popup.querySelector('#popup-material-prefix');
        if (prefixEl) {
            if (currentMaterial.prefix) {
                prefixEl.textContent = currentMaterial.prefix;
                prefixEl.style.display = 'inline';
            } else {
                prefixEl.style.display = 'none';
            }
        }

        // Set duration
        const durationEl = popup.querySelector('#popup-material-duration');
        const durationTextEl = popup.querySelector('#popup-duration-text');
        if (durationEl && durationTextEl) {
            if (currentMaterial.duration) {
                durationTextEl.textContent = currentMaterial.duration;
                durationEl.style.display = 'flex';
            } else {
                durationEl.style.display = 'none';
            }
        }

        // Set cover image
        const coverEl = popup.querySelector('#popup-cover-image');
        if (coverEl) {
            if (currentMaterial.cover) {
                coverEl.style.backgroundImage = `url('${currentMaterial.cover}')`;
                coverEl.style.backgroundSize = 'cover';
                coverEl.style.backgroundPosition = 'center';
                coverEl.classList.remove('default-cover');
                coverEl.innerHTML = ''; // Remove icon
            } else {
                coverEl.style.backgroundImage = '';
                coverEl.classList.add('default-cover');
                coverEl.innerHTML = '<i class="icon-image"></i>';
            }
        }

        // Set language
        const languageSection = popup.querySelector('#popup-language-section');
        const languageEl = popup.querySelector('#popup-material-language');
        if (languageSection && languageEl) {
            if (currentMaterial.language) {
                languageEl.textContent = currentMaterial.language;
                languageSection.style.display = 'block';
            } else {
                languageSection.style.display = 'none';
            }
        }

        // Set description
        const descriptionSection = popup.querySelector('#popup-description-section');
        const descriptionEl = popup.querySelector('#popup-material-description');
        if (descriptionSection && descriptionEl) {
            if (currentMaterial.description) {
                descriptionEl.innerHTML = currentMaterial.description;
                descriptionSection.style.display = 'block';
            } else {
                descriptionSection.style.display = 'none';
            }
        }

        // Set keywords
        const keywordsSection = popup.querySelector('#popup-keywords-section');
        const keywordsEl = popup.querySelector('#popup-keywords-list');
        if (keywordsSection && keywordsEl) {
            if (currentMaterial.keywords) {
                const keywords = currentMaterial.keywords.split(',').filter(k => k.trim());
                if (keywords.length > 0) {
                    keywordsEl.innerHTML = keywords.map(keyword => 
                        `<span class="keyword-tag">${keyword.trim()}</span>`
                    ).join('');
                    keywordsSection.style.display = 'block';
                } else {
                    keywordsSection.style.display = 'none';
                }
            } else {
                keywordsSection.style.display = 'none';
            }
        }

        // Set content based on type
        const contentEl = popup.querySelector('#popup-material-content');
        if (contentEl) {
            contentEl.innerHTML = generateContentByType();
        }

        // Set download section
        const downloadSection = popup.querySelector('#popup-download-section');
        const downloadBtn = popup.querySelector('#popup-download-btn');
        const downloadText = popup.querySelector('#popup-download-text');
        if (downloadSection && downloadBtn && downloadText) {
            if (currentMaterial.document_file) {
                downloadBtn.href = currentMaterial.document_file;
                downloadText.textContent = `Download ${getDownloadLabel()}`;
                downloadSection.style.display = 'block';
            } else {
                downloadSection.style.display = 'none';
            }
        }
    }

    function generateContentByType() {
        const type = currentMaterial.type;
        
        switch (type) {
            case 'video':
                return generateVideoContent();
            case 'document':
                return generateDocumentContent();
            case 'text':
                return generateTextContent();
            case 'quiz':
                return generateQuizContent();
            default:
                return generateCustomContent();
        }
    }

    function generateVideoContent() {
        if (currentMaterial.youtube_url) {
            const youtubeId = extractYouTubeId(currentMaterial.youtube_url);
            return `
                <div class="video-content">
                    <div class="video-player">
                        <div class="youtube-embed">
                            <iframe src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>
                        </div>
                    </div>
                </div>
            `;
        } else if (currentMaterial.video_file) {
            return `
                <div class="video-content">
                    <div class="video-player">
                        <div class="video-file-player">
                            <video controls>
                                <source src="${currentMaterial.video_file}" type="video/mp4">
                            </video>
                        </div>
                    </div>
                </div>
            `;
        }
        return '';
    }

    function generateDocumentContent() {
        return `
            <div class="document-content">
                <div class="document-info">
                    <p>Document is ready for download.</p>
                </div>
            </div>
        `;
    }

    function generateTextContent() {
        return currentMaterial.description ? `
            <div class="text-content">
                <div class="text-body">${currentMaterial.description}</div>
            </div>
        ` : '';
    }

    function generateQuizContent() {
        return currentMaterial.quiz ? `
            <div class="quiz-content">
                <div class="quiz-body">${currentMaterial.quiz}</div>
            </div>
        ` : '';
    }

    function generateCustomContent() {
        return currentMaterial.description ? `
            <div class="custom-content">
                <div class="custom-body">${currentMaterial.description}</div>
            </div>
        ` : '';
    }

    function extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : '';
    }

    function getDownloadLabel() {
        switch (currentMaterial.type) {
            case 'document': return 'Document';
            case 'video': return 'Video';
            default: return (currentMaterial.type || 'Material').charAt(0).toUpperCase() + (currentMaterial.type || 'Material').slice(1);
        }
    }

    function open() {
        if (!popup || isOpen) return;
        
        popup.style.display = 'flex';
        isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    function close() {
        if (!popup || !isOpen) return;
        
        popup.style.display = 'none';
        isOpen = false;
        document.body.style.overflow = '';
        currentMaterial = null;
    }

    // Initialize
    init();

    // Expose globally for external access if needed
    window.MaterialPopup = { open, close };

})();
