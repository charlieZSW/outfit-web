import { charCountElement, wordCountElement } from './domElements.js';
import { getEditor } from './state.js';

/**
 * Updates the character and word count elements in the status bar.
 * Fetches the current editor content and calculates the counts.
 */
export function updateStatusCounts() {
    const editor = getEditor(); // Get editor instance

    // Check if elements and editor are available
    if (!editor || !charCountElement || !wordCountElement) {
        // Only log warning if elements are missing, as editor might not be initialized yet
        if (!charCountElement || !wordCountElement) {
            console.warn("Cannot update status counts: Status bar elements missing.");
        }
        // Silently return if editor is not ready, as this might be called early
        return;
    }

    try {
        const content = editor.getValue();
        const charCount = content.length;
        // Word count based on splitting by whitespace, handling empty/whitespace-only cases
        const wordCount = (content.trim() === '') ? 0 : (content.trim().split(/\s+/).filter(Boolean).length);

        // Update DOM elements
        charCountElement.textContent = charCount;
        wordCountElement.textContent = wordCount;
    } catch (error) {
        console.error("Error updating status counts:", error);
        // Optionally reset counts or display an error indicator in the DOM
        if (charCountElement) charCountElement.textContent = '-';
        if (wordCountElement) wordCountElement.textContent = '-';
    }
}

// Note: Debouncing logic should be applied where this function is called
// (e.g., in the editor change event listener setup in main.js or editorSetup.js). 