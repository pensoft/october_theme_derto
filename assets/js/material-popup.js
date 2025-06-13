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
            target_audience: card.dataset.materialTargetAudience,
            target_audiences: card.dataset.materialTargetAudiences,
            prefix: card.dataset.materialPrefix,
            duration: card.dataset.materialDuration,
            language: card.dataset.materialLanguage,
            description: card.dataset.materialDescription,
            keywords: card.dataset.materialKeywords,
            cover: card.dataset.materialCover,
            youtube_url: card.dataset.materialYoutubeUrl,
            video_file: card.dataset.materialVideoFile,
            document_file: card.dataset.materialDocumentFile,
            quiz: card.dataset.materialQuiz,
            author: card.dataset.materialAuthor,
            contact_information: card.dataset.materialContactInformation,
            copyright: card.dataset.materialCopyright,
            link_to_other_materials: card.dataset.materialLinkToOtherMaterials,
            download_possible: card.dataset.materialDownloadPossible,
            date_of_creation: card.dataset.materialDateOfCreation,
            date_of_version: card.dataset.materialDateOfVersion,
            date_of_upload: card.dataset.materialDateOfUpload,
            lesson_name: card.dataset.materialLessonName,
            block_name: card.dataset.materialBlockName,
            topic_name: card.dataset.materialTopicName,
            gallery: card.dataset.materialGallery
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
        if (typeEl) typeEl.textContent = getDisplayType(currentMaterial.type);

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

        // Populate context hierarchy
        populateContextHierarchy();

        // Populate quick info grid
        populateQuickInfo();

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
        const contentSection = popup.querySelector('#popup-material-content-section');
        const contentEl = popup.querySelector('#popup-material-content');
        if (contentEl && contentSection) {
            const generatedContent = generateContentByType();
            if (generatedContent && generatedContent.trim() !== '') {
                contentEl.innerHTML = generatedContent;
                contentSection.style.display = 'block';
            } else {
                contentSection.style.display = 'none';
            }
        }

        // Populate ownership section
        populateOwnershipSection();

        // Populate timeline section
        populateTimelineSection();

        // Set related materials
        populateRelatedMaterials();

        // Set download section
        populateDownloadSection();
    }

    function populateContextHierarchy() {
        const contextSection = popup.querySelector('#popup-context-section');
        
        if (!contextSection) return;

        let hasContext = false;

        // Handle topic
        const topicEl = popup.querySelector('#popup-topic-name');
        const topicSeparator = popup.querySelector('#popup-topic-separator');
        if (currentMaterial.topic_name && topicEl) {
            topicEl.textContent = currentMaterial.topic_name;
            topicEl.style.display = 'inline';
            hasContext = true;
        } else if (topicEl) {
            topicEl.style.display = 'none';
        }

        // Handle block
        const blockEl = popup.querySelector('#popup-block-name');
        const blockSeparator = popup.querySelector('#popup-block-separator');
        if (currentMaterial.block_name && blockEl) {
            blockEl.textContent = currentMaterial.block_name;
            blockEl.style.display = 'inline';
            if (hasContext && topicSeparator) topicSeparator.style.display = 'inline';
            hasContext = true;
        } else if (blockEl) {
            blockEl.style.display = 'none';
            if (topicSeparator) topicSeparator.style.display = 'none';
        }

        // Handle lesson
        const lessonEl = popup.querySelector('#popup-lesson-name');
        if (currentMaterial.lesson_name && lessonEl) {
            lessonEl.textContent = currentMaterial.lesson_name;
            lessonEl.style.display = 'inline';
            if (hasContext && blockSeparator) blockSeparator.style.display = 'inline';
            hasContext = true;
        } else if (lessonEl) {
            lessonEl.style.display = 'none';
            if (blockSeparator) blockSeparator.style.display = 'none';
        }

        // Show/hide entire context section
        contextSection.style.display = hasContext ? 'block' : 'none';
    }

    function populateQuickInfo() {
        // Handle language
        const languageInfo = popup.querySelector('#popup-language-info');
        const languageEl = popup.querySelector('#popup-material-language');
        if (languageInfo && languageEl) {
            if (currentMaterial.language) {
                languageEl.textContent = currentMaterial.language;
                languageInfo.style.display = 'flex';
            } else {
                languageInfo.style.display = 'none';
            }
        }

        // Handle target audiences (supports multiple with backward compatibility)
        const audienceInfo = popup.querySelector('#popup-audience-info');
        const audienceEl = popup.querySelector('#popup-material-target-audience');
        if (audienceInfo && audienceEl) {
            let targetAudiences = [];
            
            // Prioritize new field (target_audiences) over old field (target_audience)
            if (currentMaterial.target_audiences) {
                // Handle new field - should be array format
                if (typeof currentMaterial.target_audiences === 'string') {
                    try {
                        targetAudiences = JSON.parse(currentMaterial.target_audiences);
                    } catch (e) {
                        targetAudiences = [currentMaterial.target_audiences];
                    }
                } else if (Array.isArray(currentMaterial.target_audiences)) {
                    targetAudiences = currentMaterial.target_audiences;
                }
            } else if (currentMaterial.target_audience) {
                // Fallback to old field for backward compatibility
                if (typeof currentMaterial.target_audience === 'string') {
                    try {
                        targetAudiences = JSON.parse(currentMaterial.target_audience);
                    } catch (e) {
                        targetAudiences = [currentMaterial.target_audience];
                    }
                } else if (Array.isArray(currentMaterial.target_audience)) {
                    targetAudiences = currentMaterial.target_audience;
                }
            }
            
            if (targetAudiences.length > 0) {
                const displayAudiences = targetAudiences.map(audience => 
                    getDisplayTargetAudience(audience)
                ).join(', ');
                audienceEl.textContent = displayAudiences;
                audienceInfo.style.display = 'flex';
            } else {
                audienceInfo.style.display = 'none';
            }
        }
    }

    function populateOwnershipSection() {
        const ownershipSection = popup.querySelector('#popup-ownership-section');
        if (!ownershipSection) return;

        let hasOwnershipInfo = false;

        // Handle author
        const authorItem = popup.querySelector('#popup-author-item');
        const authorEl = popup.querySelector('#popup-material-author');
        if (authorItem && authorEl) {
            if (currentMaterial.author && currentMaterial.author.trim() !== '') {
                authorEl.textContent = currentMaterial.author;
                authorItem.style.display = 'block';
                hasOwnershipInfo = true;
            } else {
                authorItem.style.display = 'none';
            }
        }

        // Handle contact
        const contactItem = popup.querySelector('#popup-contact-item');
        const contactEl = popup.querySelector('#popup-material-contact');
        if (contactItem && contactEl) {
            if (currentMaterial.contact_information && currentMaterial.contact_information.trim() !== '') {
                contactEl.textContent = currentMaterial.contact_information;
                contactItem.style.display = 'block';
                hasOwnershipInfo = true;
            } else {
                contactItem.style.display = 'none';
            }
        }

        // Handle copyright
        const copyrightItem = popup.querySelector('#popup-copyright-item');
        const copyrightEl = popup.querySelector('#popup-material-copyright');
        if (copyrightItem && copyrightEl) {
            if (currentMaterial.copyright && currentMaterial.copyright.trim() !== '') {
                copyrightEl.textContent = currentMaterial.copyright;
                copyrightItem.style.display = 'block';
                hasOwnershipInfo = true;
            } else {
                copyrightItem.style.display = 'none';
            }
        }

        // Show/hide entire ownership section
        ownershipSection.style.display = hasOwnershipInfo ? 'block' : 'none';
    }

    function populateTimelineSection() {
        const timelineSection = popup.querySelector('#popup-timeline-section');
        if (!timelineSection) return;

        let hasTimelineInfo = false;

        // Handle creation date
        const creationItem = popup.querySelector('#popup-date-creation-item');
        const creationEl = popup.querySelector('#popup-date-creation');
        if (creationItem && creationEl) {
            if (currentMaterial.date_of_creation && currentMaterial.date_of_creation.trim() !== '') {
                creationEl.textContent = formatDate(currentMaterial.date_of_creation);
                creationItem.style.display = 'block';
                hasTimelineInfo = true;
            } else {
                creationItem.style.display = 'none';
            }
        }

        // Handle version date
        const versionItem = popup.querySelector('#popup-date-version-item');
        const versionEl = popup.querySelector('#popup-date-version');
        if (versionItem && versionEl) {
            if (currentMaterial.date_of_version && currentMaterial.date_of_version.trim() !== '') {
                versionEl.textContent = formatDate(currentMaterial.date_of_version);
                versionItem.style.display = 'block';
                hasTimelineInfo = true;
            } else {
                versionItem.style.display = 'none';
            }
        }

        // Handle upload date
        const uploadItem = popup.querySelector('#popup-date-upload-item');
        const uploadEl = popup.querySelector('#popup-date-upload');
        if (uploadItem && uploadEl) {
            if (currentMaterial.date_of_upload && currentMaterial.date_of_upload.trim() !== '') {
                uploadEl.textContent = formatDate(currentMaterial.date_of_upload);
                uploadItem.style.display = 'block';
                hasTimelineInfo = true;
            } else {
                uploadItem.style.display = 'none';
            }
        }

        // Show/hide entire timeline section
        timelineSection.style.display = hasTimelineInfo ? 'block' : 'none';
    }

    function populateRelatedMaterials() {
        const relatedSection = popup.querySelector('#popup-related-section');
        const linkEl = popup.querySelector('#popup-material-link');
        
        if (relatedSection && linkEl) {
            if (currentMaterial.link_to_other_materials && currentMaterial.link_to_other_materials.trim() !== '') {
                linkEl.href = currentMaterial.link_to_other_materials;
                relatedSection.style.display = 'block';
            } else {
                relatedSection.style.display = 'none';
            }
        }
    }

    function populateDownloadSection() {
        const downloadSection = popup.querySelector('#popup-download-section');
        const downloadBtn = popup.querySelector('#popup-download-btn');
        const downloadText = popup.querySelector('#popup-download-text');
        
        if (downloadSection && downloadBtn && downloadText) {
            // Handle gallery downloads differently
            if (currentMaterial.type === 'photo_gallery' && currentMaterial.gallery && currentMaterial.download_possible === 'true') {
                downloadBtn.href = '#';
                downloadBtn.target = '_self';
                downloadBtn.onclick = (e) => {
                    e.preventDefault();
                    downloadGalleryAsZip();
                };
                downloadText.textContent = 'Download Gallery (ZIP)';
                downloadSection.style.display = 'block';
            } else if (currentMaterial.document_file && currentMaterial.download_possible === 'true') {
                downloadBtn.href = currentMaterial.document_file;
                downloadBtn.target = '_blank';
                downloadBtn.onclick = null;
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
            case 'video_tour':
            case 'video':
                return generateVideoContent();
            case 'document':
            case 'textbook_chapter':
            case 'worksheet':
            case 'guideline':
            case 'standard_of_practice':
                return generateDocumentContent();
            case 'interactive_presentation_h5p':
            case 'evaluation':
                return generateQuizContent();
            case 'podcast':
                return generatePodcastContent();
            case 'photo_gallery':
                return generatePhotoGalleryContent();
            case 'image':
                return generateImageContent();
            case 'virtual_reality_tour':
                return generateVRContent();
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
        return '';
    }

    function generateTextContent() {
        return '';
    }

    function generateQuizContent() {
        if (!currentMaterial.quiz || currentMaterial.quiz.trim() === '') {
            return `
                <div class="quiz-content">
                    <div class="quiz-placeholder">
                        <p>No quiz content available.</p>
                    </div>
                </div>
            `;
        }

        let quizContent = currentMaterial.quiz.trim();
        
        // Decode HTML entities if they exist
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = quizContent;
        const decodedContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Use decoded content if it looks like a URL, otherwise use original
        const contentToCheck = decodedContent.trim();
        
        // More robust URL detection - check if it starts with http/https and has domain structure
        const isUrl = /^https?:\/\/[^\s<>"]+\.[^\s<>"]+/.test(contentToCheck);
        
        if (isUrl) {
            // Render as H5P embed
            return `
                <div class="quiz-content">
                    <div class="h5p-embed-container">
                        <embed type="text/html" 
                               src="${contentToCheck}" 
                               width="100%" 
                               height="370"
                               style="border: none; display: block;">
                    </div>
                </div>
            `;
        } else {
            // Render as HTML content
            return `
                <div class="quiz-content">
                    <div class="quiz-body">${quizContent}</div>
                </div>
            `;
        }
    }

    function generateCustomContent() {
        return '';
    }

    function generatePodcastContent() {
        return '';
    }

    function generatePhotoGalleryContent() {
        if (currentMaterial.gallery) {
            let galleryImages = [];
            
            // Handle both string and array formats
            if (typeof currentMaterial.gallery === 'string') {
                try {
                    galleryImages = JSON.parse(currentMaterial.gallery);
                } catch (e) {
                    galleryImages = [currentMaterial.gallery];
                }
            } else if (Array.isArray(currentMaterial.gallery)) {
                galleryImages = currentMaterial.gallery;
            }
            
            if (galleryImages.length > 0) {
                const imageElements = galleryImages.map((image, index) => 
                    `<div class="gallery-item">
                        <img src="${image}" alt="Gallery image ${index + 1}" onclick="openGalleryLightbox(${index})">
                    </div>`
                ).join('');
                
                return `
                    <div class="photo-gallery-content">
                        <div class="gallery-grid">
                            ${imageElements}
                        </div>
                    </div>
                `;
            }
        }
        return '';
    }

    function generateImageContent() {
        if (currentMaterial.cover) {
            return `
                <div class="image-content">
                    <div class="image-display">
                        <img src="${currentMaterial.cover}" alt="${currentMaterial.name}" style="max-width: 100%; height: auto;">
                    </div>
                </div>
            `;
        }
        return '';
    }

    function generateVRContent() {
        if (!currentMaterial.quiz || currentMaterial.quiz.trim() === '') {
            return `
                <div class="vr-content">
                    <div class="vr-placeholder">
                        <p>No VR content available.</p>
                    </div>
                </div>
            `;
        }

        let vrContent = currentMaterial.quiz.trim();
        
        // Decode HTML entities if they exist
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = vrContent;
        const decodedContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Use decoded content if it looks like a URL, otherwise use original
        const contentToCheck = decodedContent.trim();
        
        // More robust URL detection - check if it starts with http/https and has domain structure
        const isUrl = /^https?:\/\/[^\s<>"]+\.[^\s<>"]+/.test(contentToCheck);
        
        if (isUrl) {
            // Render as H5P embed for VR content
            return `
                <div class="vr-content">
                    <div class="h5p-embed-container">
                        <embed type="text/html" 
                               src="${contentToCheck}" 
                               width="100%" 
                               height="500"
                               style="border: none; display: block;">
                    </div>
                </div>
            `;
        } else {
            // Render as HTML content for VR
            return `
                <div class="vr-content">
                    <div class="vr-body">${vrContent}</div>
                </div>
            `;
        }
    }

    function getDisplayType(type) {
        const typeMap = {
            'interactive_presentation_h5p': 'Interactive Presentation (H5P)',
            'video_tour': 'Video Tour',
            'video': 'Video',
            'virtual_reality_tour': 'Virtual Reality Tour',
            'podcast': 'Podcast',
            'textbook_chapter': 'Textbook Chapter',
            'worksheet': 'Worksheet',
            'photo_gallery': 'Photo Gallery',
            'image': 'Image',
            'guideline': 'Guideline',
            'standard_of_practice': 'Standard of Practice',
            'document': 'Document',
            'evaluation': 'Evaluation'
        };
        
        return typeMap[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Material');
    }

    function getDisplayTargetAudience(audience) {
        const audienceMap = {
            'architects': 'Architects',
            'engineers': 'Engineers',
            'environmental_educators': 'Environmental Educators',
            'teachers': 'Teachers',
            'farmers': 'Farmers',
            'foresters': 'Foresters',
            'landscape_gardeners': 'Landscape Gardeners',
            'ngos': 'NGOs',
            'policymakers': 'Policymakers',
            'restoration_practitioners': 'Restoration Practitioners',
            'students': 'Students',
            'urban_planner': 'Urban Planner',
            'local_community': 'Local Community',
            'indigenous_native_group': 'Indigenous / Native Group',
            'underrepresented_groups': 'Underrepresented Groups'
        };
        
        return audienceMap[audience] || audience;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (e) {
            return dateString;
        }
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
            case 'ppt': return 'Presentation';
            case 'photo_gallery': return 'Gallery (ZIP)';
            default: return "Material";
        }
    }

    function downloadGalleryAsZip() {
        if (!currentMaterial || !currentMaterial.gallery) {
            alert('No gallery images available for download.');
            return;
        }

        let galleryImages = [];
        
        // Handle both string and array formats
        if (typeof currentMaterial.gallery === 'string') {
            try {
                galleryImages = JSON.parse(currentMaterial.gallery);
            } catch (e) {
                galleryImages = [currentMaterial.gallery];
            }
        } else if (Array.isArray(currentMaterial.gallery)) {
            galleryImages = currentMaterial.gallery;
        }

        if (galleryImages.length === 0) {
            alert('No gallery images available for download.');
            return;
        }

        // Show downloading indicator
        const downloadBtn = popup.querySelector('#popup-download-btn');
        const downloadText = popup.querySelector('#popup-download-text');
        const originalText = downloadText.textContent;
        downloadText.textContent = 'Preparing download...';
        downloadBtn.disabled = true;

        // Create a form and submit it to trigger the download
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/api/courses/download-gallery';
        form.style.display = 'none';

        // Add CSRF token if available
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken.getAttribute('content');
            form.appendChild(csrfInput);
        }

        // Add material data
        const materialIdInput = document.createElement('input');
        materialIdInput.type = 'hidden';
        materialIdInput.name = 'material_id';
        materialIdInput.value = currentMaterial.id || '';
        form.appendChild(materialIdInput);

        const materialNameInput = document.createElement('input');
        materialNameInput.type = 'hidden';
        materialNameInput.name = 'material_name';
        materialNameInput.value = currentMaterial.name || 'Gallery';
        form.appendChild(materialNameInput);

        // Add gallery URLs
        galleryImages.forEach((imageUrl, index) => {
            const urlInput = document.createElement('input');
            urlInput.type = 'hidden';
            urlInput.name = `gallery_urls[${index}]`;
            urlInput.value = imageUrl;
            form.appendChild(urlInput);
        });

        document.body.appendChild(form);

        // Submit form
        form.submit();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(form);
            downloadText.textContent = originalText;
            downloadBtn.disabled = false;
        }, 2000);
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

    // Simple gallery lightbox function
    function openGalleryLightbox(imageIndex) {
        if (!currentMaterial || !currentMaterial.gallery) return;
        
        let galleryImages = [];
        if (typeof currentMaterial.gallery === 'string') {
            try {
                galleryImages = JSON.parse(currentMaterial.gallery);
            } catch (e) {
                galleryImages = [currentMaterial.gallery];
            }
        } else if (Array.isArray(currentMaterial.gallery)) {
            galleryImages = currentMaterial.gallery;
        }
        
        if (galleryImages[imageIndex]) {
            // Simple implementation - open in new window for now
            // Can be enhanced with a proper lightbox later
            window.open(galleryImages[imageIndex], '_blank');
        }
    }

    // Expose globally for external access if needed
    window.MaterialPopup = { open, close };
    window.openGalleryLightbox = openGalleryLightbox;

})();
