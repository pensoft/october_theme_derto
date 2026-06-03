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
            slideshare_url: card.dataset.materialSlideshareUrl,
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

        // Set type with variant class
        const typeEl = popup.querySelector('#popup-material-type');
        if (typeEl) {
            typeEl.textContent = getDisplayType(currentMaterial.type);
            // remove previous variant classes
            const classes = typeEl.className.split(' ').filter(c => !/^material-type--/.test(c));
            typeEl.className = classes.join(' ').trim() || 'material-type';
            if (currentMaterial.type) {
                typeEl.classList.add(`material-type--${currentMaterial.type}`);
            }
        }

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

        // Handle topic
        const topicEl = popup.querySelector('#popup-topic-name');
        if (currentMaterial.topic_name && topicEl) {
            topicEl.textContent = currentMaterial.topic_name;
            topicEl.style.display = 'inline';
            contextSection.style.display = 'block';
        } else {
            if (topicEl) topicEl.style.display = 'none';
            contextSection.style.display = 'none';
        }
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
                downloadText.textContent = 'Download Resource (ZIP)';
                downloadSection.style.display = 'block';
            } else if (currentMaterial.document_file) {
                    const rawUrl = currentMaterial.document_file;
                    const absoluteUrl = /^https?:\/\//i.test(rawUrl)
                        ? rawUrl
                        : `${window.location.origin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

                    // Determine extension from URL path
                    let ext = '';
                    try {
                        const urlObj = new URL(absoluteUrl);
                        const pathname = urlObj.pathname.toLowerCase();
                        const match = pathname.match(/\.([a-z0-9]+)$/);
                        ext = match ? match[1] : '';
                    } catch (e) {
                        // Fallback if URL() fails
                        const lowerUrl = absoluteUrl.toLowerCase().split('?')[0].split('#')[0];
                        const parts = lowerUrl.split('.');
                        ext = parts.length > 1 ? parts.pop() : '';
                    }

                    // Determine behavior by extension
                    const directDownloadExts = new Set(['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip']);
                    const isDirectDownload = directDownloadExts.has(ext);

                    // Reset any previous click handler
                    downloadBtn.onclick = null;
                    downloadBtn.removeAttribute('rel');
                    downloadBtn.removeAttribute('download');

                    if (!isDirectDownload) {
                        // Open in new tab for preview (no direct download)
                        downloadBtn.href = absoluteUrl;
                        downloadBtn.target = '_blank';
                        downloadBtn.setAttribute('rel', 'noopener noreferrer');
                        downloadText.textContent = 'Preview Resource';
                        downloadSection.style.display = 'block';
                    } else {
                        // Direct download for office documents and other non-previewable files
                        downloadBtn.href = absoluteUrl;
                        downloadBtn.target = '_self';
                        // Hint download when possible (may be ignored cross-origin)
                        downloadBtn.setAttribute('download', '');
                        downloadText.textContent = 'Download Resource';
                        downloadSection.style.display = 'block';
                    }
            } else {
                downloadSection.style.display = 'none';
            }
        }
    }

    function generateContentByType() {
        const type = currentMaterial.type;
        const parts = [];

        switch (type) {
            case 'video_tour':
            case 'video':
                parts.push(generateVideoContent());
                break;
            case 'presentation':
                parts.push(generateSlideshareContent());
                break;
            case 'document':
            case 'textbook_chapter':
            case 'worksheet':
            case 'guideline':
            case 'standard_of_practice':
            case 'business_case_studies':
                parts.push(generateDocumentContent());
                break;
            case 'interactive_presentation_h5p':
            case 'evaluation':
                parts.push(generateQuizContent());
                break;
            case 'podcast':
                parts.push(generatePodcastContent());
                break;
            case 'photo_gallery':
                parts.push(generatePhotoGalleryContent());
                break;
            case 'image':
                parts.push(generateImageContent());
                break;
            case 'virtual_reality_tour':
                parts.push(generateVRContent());
                break;
            default:
                parts.push(generateCustomContent());
        }

        // Append slideshare preview when available, even if type isn't 'presentation'
        if (currentMaterial.slideshare_url && type !== 'presentation') {
            const slide = generateSlideshareContent();
            if (slide) parts.push(slide);
        }

        return parts.filter(Boolean).join('');
    }

    function generateSlideshareContent() {
        if (!currentMaterial.slideshare_url || currentMaterial.slideshare_url.trim() === '') {
            return '';
        }

        // Decode HTML entities if they exist (in case admin pasted embed HTML)
        let urlOrEmbed = currentMaterial.slideshare_url.trim();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = urlOrEmbed;

        // If it looks like full embed HTML with an iframe, use it directly
        const iframe = tempDiv.querySelector('iframe');
        if (iframe && iframe.src) {
            const safeSrc = iframe.src;
            return `
                <div class="slideshare-content">
                    <div class="slideshare-embed">
                        <iframe src="${safeSrc}" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
                    </div>
                </div>
            `;
        }

        // Otherwise treat it as a URL and embed it
        const decoded = tempDiv.textContent || tempDiv.innerText || '';
        const contentToCheck = decoded.trim();
        const isUrl = /^https?:\/\/[^^\s<>"']+/.test(contentToCheck);
        if (!isUrl) {
            return '';
        }

        return `
            <div class="slideshare-content">
                <div class="slideshare-embed">
                    <iframe src="${contentToCheck}" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
                </div>
            </div>
        `;
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
            return `
                <div class="quiz-content">
                    <div class="h5p-embed-container">
                        <iframe 
                            src="${contentToCheck}" 
                            width="100%" 
                            height="370"
                            style="border: none; display: block;"
                            allow="fullscreen"
                            allowfullscreen>
                        </iframe>
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
            // Render as H5P iframe for VR content (allows fullscreen)
            return `
                <div class="vr-content">
                    <div class="h5p-embed-container">
                        <iframe 
                               src="${contentToCheck}" 
                               width="100%" 
                               height="500"
                               style="border: none; display: block;"
                               allow="fullscreen"
                               allowfullscreen>
                        </iframe>
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
            'evaluation': 'Evaluation',
            'presentation': 'Presentation',
            'business_case_studies': 'Business Case Studies'
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
