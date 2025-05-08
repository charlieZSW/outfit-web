// Module for handling LocalStorage interactions (content and settings)

import { CONTENT_STORAGE_KEY, EDITOR_SETTINGS_KEY, DEFAULT_EDITOR_SETTINGS } from './config.js';
import { getEditor, getSettings, loadSettingsState } from './state.js';

/**
 * Loads Markdown content from LocalStorage and sets it in the CodeMirror editor.
 */
export function loadContentFromStorage() {
    const editor = getEditor();
    if (!editor) {
        console.warn("loadContentFromStorage: Editor not available.");
        return;
    }

    try {
        const savedMarkdown = localStorage.getItem(CONTENT_STORAGE_KEY);
        if (savedMarkdown !== null) {
            editor.setValue(savedMarkdown);
            // console.log("Restored content from localStorage.");
        } else {
            // console.log("No saved content found in localStorage.");
        }
    } catch (e) {
        console.error("Error reading content from localStorage:", e);
    }
}

/**
 * Saves the current Markdown content from the CodeMirror editor to LocalStorage.
 */
export function saveContentToStorage() {
    const editor = getEditor();
    if (!editor) {
        console.warn("saveContentToStorage: Editor not available.");
        return;
    }

    try {
        localStorage.setItem(CONTENT_STORAGE_KEY, editor.getValue());
        // console.log("Saved content to localStorage.");
    } catch (e) {
        console.error("Error saving content to localStorage:", e);
    }
}

/**
 * Loads editor settings from LocalStorage.
 * Merges with default settings and updates the application state.
 */
export function loadSettingsFromStorage() {
    let loadedSettings = {};
    try {
        const savedSettings = localStorage.getItem(EDITOR_SETTINGS_KEY);
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            // Merge saved settings with defaults to ensure all keys are present
            loadedSettings = { ...DEFAULT_EDITOR_SETTINGS, ...parsedSettings };
            // console.log("Loaded settings from localStorage:", loadedSettings);
        } else {
            loadedSettings = { ...DEFAULT_EDITOR_SETTINGS };
            // console.log("No saved settings found, using defaults.");
        }
    } catch (e) {
        console.error("Error loading or parsing editor settings from localStorage:", e);
        loadedSettings = { ...DEFAULT_EDITOR_SETTINGS }; // Fallback to defaults
        console.error("Falling back to default settings due to error.");
    }
    // Update the application state with the loaded settings
    loadSettingsState(loadedSettings);
}

/**
 * Saves the current editor settings (obtained from the state) to LocalStorage.
 */
export function saveSettingsToStorage() {
    const currentSettings = getSettings(); // Get current settings from state.js
    try {
        localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(currentSettings));
        // console.log("Saved settings to localStorage:", currentSettings);
    } catch (e) {
        console.error("Error saving editor settings to localStorage:", e);
    }
} 