import {
    toolbarButtons,
    settingsToggleButton,
    helpButton,
    tableModal, tableModalClose, tableModalCancel, // For table modal setup/closing
    settingsModal, settingsModalClose, settingsModalCloseBtn, // For settings modal setup/closing
    shortcutsModal, shortcutsModalClose, shortcutsModalCloseBtn // For shortcuts modal setup/closing
} from './domElements.js';

// --- Core Modal Functions ---

/**
 * Shows a modal element and handles ARIA attributes.
 * @param {HTMLElement} modalElement The modal element to show.
 */
export function showModal(modalElement) {
    if (modalElement) {
        modalElement.classList.add('active');
        modalElement.setAttribute('aria-hidden', 'false'); // Make it visible to screen readers

        // Focus the first focusable element inside (enhancement)
        const focusableElements = modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    } else {
        console.error("Attempted to show a non-existent modal.");
    }
}

/**
 * Hides a modal element and handles ARIA attributes.
 * @param {HTMLElement} modalElement The modal element to hide.
 */
export function hideModal(modalElement) {
    if (modalElement) {
        modalElement.classList.remove('active');
        modalElement.setAttribute('aria-hidden', 'true'); // Hide it from screen readers
    } else {
        console.error("Attempted to hide a non-existent modal.");
    }
}

// --- Listener Setup Functions ---

/**
 * Sets up standard open/close listeners for a modal.
 * @param {HTMLElement} modalElement The modal element.
 * @param {HTMLElement} openTrigger The button/element that opens the modal.
 * @param {Array<HTMLElement>} closeTriggers An array of elements that close the modal (e.g., close buttons, cancel buttons).
 */
export function setupModalListeners(modalElement, openTrigger, closeTriggers) {
    if (!modalElement || !openTrigger) {
        console.warn("Modal listener setup skipped: Modal element or open trigger missing.", { modalElement, openTrigger });
        return;
    }

    // Action to open the modal
    const openAction = (e) => {
        e.stopPropagation();
        showModal(modalElement); // Call imported showModal
        openTrigger.setAttribute('aria-expanded', 'true');
    };

    openTrigger.addEventListener('click', openAction);

    // Action to close the modal
    const closeAction = (e) => {
        e.stopPropagation();
        hideModal(modalElement); // Call imported hideModal
        openTrigger.setAttribute('aria-expanded', 'false');
        openTrigger.focus(); // Return focus to the trigger button
    };

    closeTriggers.forEach(trigger => {
        if (trigger) {
            trigger.addEventListener('click', closeAction);
        } else {
             console.warn("Missing close trigger element during modal listener setup.");
        }
    });

    // Close on backdrop click
    modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) { // Clicked directly on the backdrop
            closeAction(event);
        }
    });

     // Set initial ARIA state for the trigger
    openTrigger.setAttribute('aria-expanded', 'false');
    // Set initial ARIA state for the modal
    modalElement.setAttribute('aria-hidden', 'true');
}

/**
 * Sets up a global key listener to close active modals with the Escape key.
 * Should be called once during application initialization.
 */
export function setupGlobalModalKeyListener() {
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal.active');
            activeModals.forEach(modal => {
                 // Find the corresponding trigger button to update aria-expanded and focus
                 let triggerButton = null;
                 // Use imported DOM elements for lookup
                 if (modal === tableModal && toolbarButtons.table) {
                     triggerButton = toolbarButtons.table;
                 } else if (modal === settingsModal && settingsToggleButton) {
                     triggerButton = settingsToggleButton;
                 } else if (modal === shortcutsModal && helpButton) { // Handle shortcuts modal
                     triggerButton = helpButton;
                 }

                hideModal(modal); // Call imported hideModal
                if (triggerButton) {
                    triggerButton.setAttribute('aria-expanded', 'false');
                    try {
                      triggerButton.focus(); // Return focus on Escape
                    } catch (focusError) {
                       console.warn("Could not focus trigger button after closing modal with Esc key.", focusError);
                    }
                }
            });
        }
    });
} 