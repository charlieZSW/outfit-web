// Shared State Management for Outfit Web
import { DEFAULT_EDITOR_SETTINGS } from './config.js';

let _editor = null; // Internal CodeMirror instance reference
let _editorSettings = { ...DEFAULT_EDITOR_SETTINGS }; // Internal settings state, initialized with defaults

/**
 * Sets the global CodeMirror editor instance.
 * @param {object} instance - The CodeMirror editor instance.
 */
export function setEditor(instance) {
    if (instance) {
        _editor = instance;
    } else {
        console.warn('Attempted to set a null editor instance in state.');
    }
}

/**
 * Gets the global CodeMirror editor instance.
 * @returns {object | null} The CodeMirror editor instance or null if not set.
 */
export function getEditor() {
    return _editor;
}

/**
 * Gets the current editor settings object.
 * @returns {object} The editor settings object.
 */
export function getSettings() {
    // Return a copy to prevent accidental direct modification?
    // For now, return direct reference for simplicity, but be mindful.
    return _editorSettings;
}

/**
 * Updates a specific editor setting.
 * @param {string} key - The setting key (e.g., 'lineNumbers').
 * @param {*} value - The new value for the setting.
 */
export function updateSetting(key, value) {
    if (key in _editorSettings) {
        _editorSettings[key] = value;
        // console.log(`State updated: ${key} = ${value}`); // Optional logging
        // TODO: Consider if saving to localStorage should happen here or elsewhere.
        // For now, saving is handled externally after calling updateSetting.
    } else {
        console.warn(`Attempted to update non-existent setting: ${key}`);
    }
}

/**
 * Replaces the entire settings object. Used primarily when loading from storage.
 * @param {object} newSettings - The new settings object.
 */
export function loadSettingsState(newSettings) {
     // Merge with defaults to ensure all keys exist, even if storage is outdated
    _editorSettings = { ...DEFAULT_EDITOR_SETTINGS, ...newSettings };
}

// We might move the actual localStorage load/save logic here later,
// but for now, keep it separate to stick closer to the plan's steps. 