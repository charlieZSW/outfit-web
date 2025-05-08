import { shortcutsModalContent, shortcutsModal, helpButton } from './domElements.js';
import { showModal } from './modalManager.js'; // Assuming modalManager exports showModal

let contentLoaded = false;
let isLoading = false;

/**
 * Loads the shortcuts documentation from static/docs/shortcuts.md,
 * parses it using marked, sanitizes it using DOMPurify, and displays
 * it in the shortcuts modal.
 * Shows the modal if it's not already visible.
 */
export async function loadAndShowShortcuts() {
    // Use imported elements
    if (!shortcutsModalContent || !shortcutsModal) {
        console.error('Shortcuts modal elements not found in DOM.');
        return;
    }

    // If content is already loaded and modal is hidden, just show it.
    // The modalManager's setupModalListeners already handles showing the modal on button click,
    // but we might call this function directly elsewhere, so double-check visibility.
    if (contentLoaded && !shortcutsModal.classList.contains('active')) {
        showModal(shortcutsModal); // Use imported showModal
        // ARIA state is handled by setupModalListeners
        return;
    }

    // If already loading or already loaded and visible, do nothing.
    if (isLoading || (contentLoaded && shortcutsModal.classList.contains('active'))) {
        return;
    }

    isLoading = true;
    shortcutsModalContent.innerHTML = '<p>正在加载快捷键列表...</p>';
    // Ensure modal is visible while loading (might already be shown by button click)
    if (!shortcutsModal.classList.contains('active')) {
         showModal(shortcutsModal);
         // If shown programmatically, update ARIA state if helpButton exists
         if (helpButton) helpButton.setAttribute('aria-expanded', 'true');
    }

    try {
        const response = await fetch('static/docs/shortcuts.md');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const markdownContent = await response.text();

        // Access libraries via window object as per plan
        if (typeof window.marked === 'undefined' || typeof window.DOMPurify === 'undefined') {
             throw new Error('marked.js or DOMPurify library not loaded.');
        }

        const rawHtml = window.marked.parse(markdownContent);
        // Ensure DOMPurify sanitizes the content correctly
        const cleanHtml = window.DOMPurify.sanitize(rawHtml);

        shortcutsModalContent.innerHTML = cleanHtml;
        contentLoaded = true;

    } catch (error) {
        console.error('Error loading or rendering shortcuts help:', error);
        shortcutsModalContent.innerHTML = '<p style="color: red;">无法加载快捷键帮助文档。请稍后再试。</p>';
        contentLoaded = false; // Allow retrying if loading failed
    } finally {
        isLoading = false;
    }
} 