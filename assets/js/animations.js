document.addEventListener('DOMContentLoaded', function() {
    // Survey button border animation
    const surveyButtonContainer = document.querySelector('.survey-button-container');
    const surveyBorder = document.querySelector('.survey-border');
    const surveyButton = document.querySelector('.survey-button');
    
    if (surveyButton && surveyBorder) {
        // Initialize the border with no rotation
        surveyBorder.style.transform = 'rotate(0deg)';
        
        // Shorter animation duration
        const animationDuration = 400; // ms
        
        // Set CSS transition once
        surveyBorder.style.transition = `transform ${animationDuration}ms ease`;
        
        let isAnimating = false;
        let hoverState = false;
        let animationTimeout = null;
        
        function resetAnimation() {
            isAnimating = false;
            
            // Check if hover state changed during animation
            if (hoverState) {
                animateBorderClockwise();
            } else {
                animateBorderCounterClockwise();
            }
        }
        
        function animateBorderClockwise() {
            if (isAnimating) return;
            
            isAnimating = true;
            surveyBorder.style.transform = 'rotate(360deg)';
            
            clearTimeout(animationTimeout);
            animationTimeout = setTimeout(resetAnimation, animationDuration);
        }
        
        function animateBorderCounterClockwise() {
            if (isAnimating) return;
            
            isAnimating = true;
            surveyBorder.style.transform = 'rotate(0deg)';
            
            clearTimeout(animationTimeout);
            animationTimeout = setTimeout(resetAnimation, animationDuration);
        }
        
        surveyButton.addEventListener('mouseenter', function() {
            hoverState = true;
            if (!isAnimating) {
                animateBorderClockwise();
            }
        });
        
        surveyButton.addEventListener('mouseleave', function() {
            hoverState = false;
            if (!isAnimating) {
                animateBorderCounterClockwise();
            }
        });
        
        // Ensure animation still works after clicking
        surveyButton.addEventListener('click', function() {
            clearTimeout(animationTimeout);
            isAnimating = false;
        });
    }
});
