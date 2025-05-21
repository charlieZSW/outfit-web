// static/js/modules/feedbackManager.js
import {
    feedbackButton,
    feedbackModal,
    feedbackModalCloseButton,
    feedbackForm,
    feedbackStatusElement
} from './domElements.js';

// DOM Elements are now imported, so local declarations and DOMElements() function are removed.

/**
 * Toggles the feedback modal visibility.
 * @param {boolean} show - True to show, false to hide.
 */
function toggleFeedbackModal(show) {
    console.log(`[FeedbackManager] toggleFeedbackModal called with show: ${show}`);
    if (!feedbackModal || !feedbackButton || !feedbackForm) {
        console.error('[FeedbackManager] toggleFeedbackModal: Required DOM elements not found.', { feedbackModal, feedbackButton, feedbackForm });
        return;
    }
    if (show) {
        console.log('[FeedbackManager] Showing feedback modal by adding .active class and ensuring display is not none.');
        // Crucial: Remove any inline display:none that might be lingering
        feedbackModal.style.display = ''; // Clears inline display style, letting CSS classes take over
        // Or, be more explicit if .active class itself doesn't guarantee display:block override in all cases:
        // feedbackModal.style.display = 'block'; 
        feedbackModal.classList.add('active');
        feedbackModal.setAttribute('aria-hidden', 'false');
        feedbackButton.setAttribute('aria-expanded', 'true');
        const firstFocusableElement = feedbackForm.querySelector('select, input, textarea, button');
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
    } else {
        console.log('[FeedbackManager] Hiding feedback modal by removing .active class.');
        feedbackModal.classList.remove('active');
        feedbackModal.setAttribute('aria-hidden', 'true');
        feedbackButton.setAttribute('aria-expanded', 'false');
        // NO LONGER SETTING feedbackModal.style.display = 'none'; here.
        // The .modal class (when .active is removed) should handle display:none via CSS.
        if (document.activeElement !== feedbackButton) {
            feedbackButton.focus();
        }
    }
}

/**
 * Handles the feedback form submission.
 * @param {Event} event - The form submission event.
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('[FeedbackManager] handleFormSubmit triggered.');
    if (!feedbackForm || !feedbackStatusElement) {
        console.error('[FeedbackManager] handleFormSubmit: Form or status element not found.');
        return;
    }

    const formData = new FormData(feedbackForm);
    feedbackStatusElement.textContent = 'Sending...';
    feedbackStatusElement.className = '';
    console.log('[FeedbackManager] Submitting feedback data:', Object.fromEntries(formData.entries()));

    try {
        const response = await fetch(feedbackForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        console.log('[FeedbackManager] Formspree response status:', response.status);

        if (response.ok) {
            feedbackStatusElement.textContent = 'Thanks for your feedback!';
            feedbackStatusElement.className = 'success';
            feedbackForm.reset();
            console.log('[FeedbackManager] Feedback submitted successfully.');
            setTimeout(() => {
                toggleFeedbackModal(false);
                feedbackStatusElement.textContent = '';
                feedbackStatusElement.className = '';
            }, 3000);
        } else {
            const data = await response.json();
            console.error('[FeedbackManager] Formspree error response data:', data);
            if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
                feedbackStatusElement.textContent = data.errors.map(error => error.message).join(", ");
            } else {
                feedbackStatusElement.textContent = 'Oops! There was a problem submitting your feedback.';
            }
            feedbackStatusElement.className = 'error';
        }
    } catch (error) {
        console.error('[FeedbackManager] Error submitting feedback form:', error);
        feedbackStatusElement.textContent = 'An unexpected error occurred. Please try again.';
        feedbackStatusElement.className = 'error';
    }
}

/**
 * Initializes the feedback manager module.
 * Sets up event listeners for the feedback button, modal close button, and form submission.
 */
export function initFeedbackManager() {
    console.log('[FeedbackManager] Initializing...');

    // Log the state of imported DOM elements
    console.log('[FeedbackManager] Imported DOM elements:', {
        feedbackButton,
        feedbackModal,
        feedbackModalCloseButton,
        feedbackForm,
        feedbackStatusElement
    });

    if (feedbackButton) {
        console.log('[FeedbackManager] Feedback button found. Adding click listener.');
        feedbackButton.addEventListener('click', () => {
            console.log('[FeedbackManager] Feedback button clicked.');
            toggleFeedbackModal(true);
        });
    } else {
        console.warn('[FeedbackManager] Feedback button NOT found. Cannot add click listener.');
    }

    if (feedbackModalCloseButton) {
        console.log('[FeedbackManager] Feedback modal close button found. Adding click listener.');
        feedbackModalCloseButton.addEventListener('click', () => {
            console.log('[FeedbackManager] Feedback modal close button clicked.');
            toggleFeedbackModal(false);
        });
    } else {
        console.warn('[FeedbackManager] Feedback modal close button NOT found. Cannot add click listener.');
    }

    if (feedbackModal) {
        console.log('[FeedbackManager] Feedback modal found. Adding backdrop click listener.');
        feedbackModal.addEventListener('click', (event) => {
            if (event.target === feedbackModal) {
                console.log('[FeedbackManager] Feedback modal backdrop clicked.');
                toggleFeedbackModal(false);
            }
        });
    } else {
        console.warn('[FeedbackManager] Feedback modal NOT found. Cannot add backdrop click listener.');
    }

    console.log('[FeedbackManager] Adding Escape key listener for modal.');
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && feedbackModal && feedbackModal.classList.contains('active')) { // Check for .active class instead of style.display
            console.log('[FeedbackManager] Escape key pressed, closing feedback modal.');
            toggleFeedbackModal(false);
        }
    });

    if (feedbackForm) {
        console.log('[FeedbackManager] Feedback form found. Adding submit listener.');
        feedbackForm.addEventListener('submit', handleFormSubmit);
    } else {
        console.warn('[FeedbackManager] Feedback form NOT found. Cannot add submit listener.');
    }

    console.log('[FeedbackManager] Initialized successfully using imported DOM elements');
} 