// Module for initial checks of libraries and DOM elements

// Import necessary DOM elements
import {
    markdownInput,
    previewArea,
    themeToggleButton,
    tableModal,
    tableModalClose,
    tableModalConfirm,
    tableModalCancel,
    tableRowsInput,
    tableColsInput,
    tableModalError,
    importFileInput,
    charCountElement,
    wordCountElement,
    settingsToggleButton,
    settingsModal,
    settingsModalClose,
    settingsModalCloseBtn,
    settingLineNumbers,
    settingLineWrapping,
    settingFontSize,
    settingTabBehavior,
    toolbarButtons,
    helpButton,
    shortcutsModal,
    shortcutsModalClose,
    shortcutsModalCloseBtn
} from './domElements.js';

/**
 * Runs initial checks to ensure necessary libraries and DOM elements are loaded.
 * Logs errors or warnings if issues are found.
 * @returns {boolean} True if all critical checks pass, false otherwise.
 */
export function runInitialChecks() {
    // Critical Checks (must exist for core functionality)
    if (!markdownInput) {
        console.error('Error: Markdown input area (textarea) not found!');
        return false;
    }
    if (!previewArea) {
        console.error('Error: Preview area not found!');
        return false;
    }
    if (typeof window.marked === 'undefined') {
        console.error('Error: marked.js library not loaded!');
        if (previewArea) { // Only try to write if previewArea exists
             previewArea.innerHTML = '<p style="color: red;">错误: marked.js 库未加载。</p>';
        }
        return false;
    }
    if (typeof window.DOMPurify === 'undefined') {
        console.error('Error: DOMPurify library not loaded!');
        if (previewArea) { // Only try to write if previewArea exists
            previewArea.innerHTML = '<p style="color: red;">错误: DOMPurify 库未加载。</p>';
        }
        return false;
    }
    if (typeof window.CodeMirror === 'undefined') {
        console.error('Error: CodeMirror library not loaded!');
        // Unlike marked/DOMPurify, a missing CodeMirror might not be immediately fatal
        // depending on fallback, but it's critical for the intended experience.
        // We might let initialization continue but log a severe error.
        // For now, return false as it's core to the current setup.
        return false;
    }

    // Non-Critical Checks (log warnings if missing, but allow app to continue)
    if (!themeToggleButton) {
        console.warn('Warning: Theme toggle button not found!');
    }
    if (!tableModal || !tableModalClose || !tableModalConfirm || !tableModalCancel || !tableRowsInput || !tableColsInput || !tableModalError) {
        console.warn('Warning: Table modal elements not fully found! Interactive table generation might fail.');
    }
    if (!importFileInput) {
        console.warn('Warning: Import file input element not found!');
    }
    if (!charCountElement || !wordCountElement) {
        console.warn('Warning: Status count elements not found! Counts will not be displayed.');
    }
    if (!settingsToggleButton) {
        console.warn('Warning: Settings toggle button not found!');
    }
    if (!settingsModal || !settingsModalClose || !settingsModalCloseBtn) {
        console.warn('Warning: Settings modal elements not fully found! Settings might not work.');
    }
    if (!settingLineNumbers) {
        console.warn('Warning: Setting control for Line Numbers not found!');
    }
    if (!settingLineWrapping) {
        console.warn('Warning: Setting control for Line Wrapping not found!');
    }
    if (!settingFontSize) {
        console.warn('Warning: Setting control for Font Size not found!');
    }
    if (!settingTabBehavior) {
        console.warn('Warning: Setting control for Tab Behavior not found!');
    }
    // Check toolbar buttons individually for more granular warnings
    Object.entries(toolbarButtons).forEach(([key, element]) => {
        // Check if the element itself is null/undefined OR if the key exists but points to null/undefined
        if (!element && toolbarButtons.hasOwnProperty(key)) {
            // Log only if the button was expected (present as a key in domElements.js)
            console.warn(`Warning: Toolbar button element 'toolbar-${key}' not found in the DOM.`);
        }
    });
    if (!helpButton) {
        console.warn('Warning: Help button not found!');
    }
    if (!shortcutsModal || !shortcutsModalClose || !shortcutsModalCloseBtn) {
        console.warn('Warning: Shortcuts modal elements not fully found!');
    }

    // console.log("Initial checks completed."); // Optional: keep for debugging
    return true; // If we reached here, critical checks passed
} 