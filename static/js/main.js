// Outfit Web - Main Application Entry Point (ES6 Module)
import {
    THEME_STORAGE_KEY,
    CONTENT_STORAGE_KEY,
    EDITOR_SETTINGS_KEY,
    DEBOUNCE_DELAY,
    DEFAULT_EDITOR_SETTINGS
} from './modules/config.js';

import {
    markdownInput,
    previewArea,
    themeToggleButton,
    bodyElement,
    themeIconSun,
    themeIconMoon,
    toolbarButtons,
    settingsToggleButton,
    settingsModal,
    settingsModalClose,
    settingsModalCloseBtn,
    settingLineNumbers,
    settingLineWrapping,
    settingFontSize,
    settingTabBehavior,
    importFileInput,
    tableModal,
    tableModalClose,
    tableModalConfirm,
    tableModalCancel,
    tableRowsInput,
    tableColsInput,
    tableModalError,
    charCountElement,
    wordCountElement,
    helpButton,
    shortcutsModal,
    shortcutsModalClose,
    shortcutsModalCloseBtn,
    shortcutsModalContent
} from './modules/domElements.js';

import {
    getEditor,
    setEditor,
    getSettings,
    updateSetting
} from './modules/state.js';

import { init as themeInit, toggle as themeToggle } from './modules/themeManager.js';
import {
    setupModalListeners,
    setupGlobalModalKeyListener,
    hideModal
} from './modules/modalManager.js';
import { highlightCodeBlocks } from './modules/highlightManager.js';
import { updateStatusCounts } from './modules/statusBar.js';
import { updatePreview, debouncedUpdatePreviewAndCounts } from './modules/previewUpdater.js';
import { initializeCodeMirror } from './modules/editorSetup.js';
// Import EditorUtils functions
import {
    wrapText,
    toggleListItem,
    toggleOrderedListItem,
    toggleBlockquote,
    toggleHeading,
    toggleCodeBlock,
    insertHorizontalRule,
    insertLink,
    insertGeneratedTable
} from './modules/editorUtils.js';
// Import FileManager functions (v2.1 - Updated fileManager with proper ES6 imports - timestamp: 20240527)
import {
    triggerImport,
    handleImport,
    exportMarkdown,
    exportHtml
} from './modules/fileManager.js';
// Import the checks module
import { runInitialChecks } from './modules/checks.js';
// Import the storage module
import {
    loadContentFromStorage,
    saveContentToStorage,
    loadSettingsFromStorage,
    saveSettingsToStorage
} from './modules/storageManager.js';
// Import the editor UI module
import {
    applyFontSize,
    applyTabBehavior,
    updateToolbarButtonStates,
    setupEditorStateListeners
} from './modules/editorUI.js';
// Import the shortcuts help module
import { loadAndShowShortcuts } from './modules/shortcutsHelp.js';
// Import the scroll sync module
import { initScrollSync, cleanupScrollSync } from './modules/scrollSync.js';
// Import layoutEnhancer module
import layoutEnhancer from './modules/layoutEnhancer.js';
// Import toolbarDrawer module
import toolbarDrawer from './modules/toolbarDrawer.js';
// Import searchManager module
import { initSearchPanel, showSearchPanel, hideSearchPanel } from './modules/searchManager.js';

// Debounce utility (defined here temporarily, move to utils.js later)
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// --- Temporary Accessor for Script Objects (Remove after full refactor) ---
// const EditorUI = window.EditorUI || {}; // REMOVED - Now imported
// const ThemeManager = window.ThemeManager || { toggle: themeToggle }; // Keep ThemeManager line if script.js still defines it globally (unlikely for theme)
// const ShortcutsHelp = window.ShortcutsHelp || {}; // REMOVED - Now imported
// if (Object.keys(EditorUI).length === 0) console.warn("Global EditorUI not found! UI settings might fail."); // REMOVED
// if (Object.keys(ShortcutsHelp).length === 0) console.warn("Global ShortcutsHelp not found! Help modal might fail."); // REMOVED

// console.log('main.js loaded as module.'); // Removed log

// =========================================================================
// Event Listener Setup
// =========================================================================
function setupEventListeners() {
    // console.log("Setting up event listeners..."); // Removed log

    // Theme Toggle Button
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', themeToggle);
    } else {
        console.warn("Theme toggle button not found, cannot attach listener.");
    }

    // --- Modal Listeners Setup ---
    // Table Modal
    if (toolbarButtons.table && tableModal && tableModalClose && tableModalCancel) {
        setupModalListeners(tableModal, toolbarButtons.table, [tableModalClose, tableModalCancel]);
        if (tableModalConfirm) {
            tableModalConfirm.addEventListener('click', () => {
                const rows = parseInt(tableRowsInput.value, 10);
                const cols = parseInt(tableColsInput.value, 10);
                if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
                    tableModalError.textContent = 'Please enter valid positive integers for rows and columns.';
                    tableModalError.style.display = 'block';
                    tableModalError.setAttribute('aria-hidden', 'false');
                } else {
                    tableModalError.style.display = 'none';
                    tableModalError.setAttribute('aria-hidden', 'true');
                    hideModal(tableModal);
                    if (toolbarButtons.table) {
                       toolbarButtons.table.setAttribute('aria-expanded', 'false');
                       toolbarButtons.table.focus();
                    }
                    insertGeneratedTable(rows, cols);
                }
            });
        }
         if (tableRowsInput && tableModalConfirm) {
             tableRowsInput.addEventListener('keydown', (event) => {
                 if (event.key === 'Enter') { event.preventDefault(); tableModalConfirm.click(); }
             });
         }
          if (tableColsInput && tableModalConfirm) {
              tableColsInput.addEventListener('keydown', (event) => {
                  if (event.key === 'Enter') { event.preventDefault(); tableModalConfirm.click(); }
              });
          }
         if (tableModalError) tableModalError.setAttribute('aria-hidden', 'true');
    } else {
        console.warn('Table modal listener setup skipped: elements missing.');
    }

    // Settings Modal
    if (settingsToggleButton && settingsModal && settingsModalClose && settingsModalCloseBtn) {
        setupModalListeners(settingsModal, settingsToggleButton, [settingsModalClose, settingsModalCloseBtn]);
    } else {
        console.warn('Settings modal listener setup skipped: elements missing.');
    }

    // Shortcuts Help Modal
    if (helpButton && shortcutsModal && shortcutsModalClose && shortcutsModalCloseBtn) {
        // setupModalListeners handles showing/hiding the modal shell via button/close clicks
        setupModalListeners(shortcutsModal, helpButton, [shortcutsModalClose, shortcutsModalCloseBtn]);
        // Attach listener specifically to the help button to trigger content loading
        helpButton.addEventListener('click', loadAndShowShortcuts);
        // TODO: Consider if initial load should happen differently (e.g., on first open)
    } else {
        console.warn('Shortcuts modal listener setup skipped: elements missing.');
    }

    // --- Settings Controls Listeners ---
    if (settingLineNumbers) {
        settingLineNumbers.addEventListener('change', () => {
            const isChecked = settingLineNumbers.checked;
            const currentEditor = getEditor();
            if (currentEditor) currentEditor.setOption('lineNumbers', isChecked);
            updateSetting('lineNumbers', isChecked);
            saveSettingsToStorage();
        });
    }
    if (settingLineWrapping) {
        settingLineWrapping.addEventListener('change', () => {
            const isChecked = settingLineWrapping.checked;
            const currentEditor = getEditor();
            if (currentEditor) currentEditor.setOption('lineWrapping', isChecked);
            updateSetting('lineWrapping', isChecked);
            saveSettingsToStorage();
        });
    }
    if (settingFontSize) {
        settingFontSize.addEventListener('change', () => {
            const selectedSize = settingFontSize.value;
            // if (EditorUI.applyFontSize) EditorUI.applyFontSize(selectedSize); else console.error("EditorUI.applyFontSize not found"); // OLD
            applyFontSize(selectedSize); // NEW: Call imported function
            updateSetting('fontSize', selectedSize);
            saveSettingsToStorage();
        });
    }
    if (settingTabBehavior) {
        settingTabBehavior.addEventListener('change', () => {
            const selectedBehavior = settingTabBehavior.value;
            // if (EditorUI.applyTabBehavior) EditorUI.applyTabBehavior(selectedBehavior); else console.error("EditorUI.applyTabBehavior not found"); // OLD
            applyTabBehavior(selectedBehavior); // NEW: Call imported function
            updateSetting('tabBehavior', selectedBehavior);
            saveSettingsToStorage();
        });
    }

    // --- Toolbar and File Listeners ---
    if (toolbarButtons.bold) toolbarButtons.bold.addEventListener('click', () => wrapText('**'));
    if (toolbarButtons.italic) toolbarButtons.italic.addEventListener('click', () => wrapText('*'));
    if (toolbarButtons.strike) toolbarButtons.strike.addEventListener('click', () => wrapText('~~'));
    if (toolbarButtons.link) toolbarButtons.link.addEventListener('click', () => insertLink());
    if (toolbarButtons.quote) toolbarButtons.quote.addEventListener('click', () => toggleBlockquote());
    if (toolbarButtons.ul) toolbarButtons.ul.addEventListener('click', () => toggleListItem());
    if (toolbarButtons.ol) toolbarButtons.ol.addEventListener('click', () => toggleOrderedListItem());
    if (toolbarButtons.heading) toolbarButtons.heading.addEventListener('click', () => toggleHeading());
    if (toolbarButtons.code) toolbarButtons.code.addEventListener('click', () => toggleCodeBlock());
    if (toolbarButtons.hr) toolbarButtons.hr.addEventListener('click', () => insertHorizontalRule());
    if (toolbarButtons.undo) toolbarButtons.undo.addEventListener('click', () => { const editor = getEditor(); if(editor) { editor.undo(); editor.focus();} });
    if (toolbarButtons.redo) toolbarButtons.redo.addEventListener('click', () => { const editor = getEditor(); if(editor) { editor.redo(); editor.focus();} });
    if (toolbarButtons.find) {
        toolbarButtons.find.addEventListener('click', () => {
            showSearchPanel();
            toolbarButtons.find.setAttribute('aria-expanded', 'true');
        });
    }
    if (toolbarButtons.importMd) toolbarButtons.importMd.addEventListener('click', triggerImport);
    if (toolbarButtons.exportMd) toolbarButtons.exportMd.addEventListener('click', exportMarkdown);
    if (toolbarButtons.exportHtml) toolbarButtons.exportHtml.addEventListener('click', exportHtml);
    if (importFileInput) {
        importFileInput.addEventListener('change', handleImport);
    } else {
        console.warn('Import file input listener not attached: element or handler missing.');
    }

    // --- Global Key Listener ---
    setupGlobalModalKeyListener();

    // --- Editor State Listeners (for toolbar updates etc.) ---
    setupEditorStateListeners(); // NEW: Attach listeners from editorUI module

    // console.log("Event listeners setup complete."); // Removed log
}

// =========================================================================
// Application Initialization
// =========================================================================
function initializeApp() {
    // console.log("[main] DOM fully loaded. Initializing application..."); // Removed log

    // 1. Run essential checks (e.g., for required libraries)
    // console.log("[main] Running initial checks..."); // Removed log
    try {
        runInitialChecks();
        // Only proceed if checks pass
    } catch (error) {
        console.error("[main] Initialization failed during initial checks:", error);
        // Optionally display a more prominent error to the user
        previewArea.innerHTML = `<p style="color: red; font-weight: bold;">Application initialization failed: ${error.message}. Please check the console or refresh the page.</p>`;
        return; // Stop initialization
    }
    // console.log("[main] Initial checks passed."); // Removed log

    // 2. Load settings and initialize theme
    // console.log("[main] Loading settings and initializing theme..."); // Removed log
    loadSettingsFromStorage();
    themeInit(); // Initialize theme based on loaded settings/preferences
    // console.log("[main] Settings and theme initialized."); // Removed log

    // 3. Initialize CodeMirror Editor
    // console.log("[main] Initializing CodeMirror editor..."); // Removed log
    const settings = getSettings();
    const editorInstance = initializeCodeMirror({
        inputElement: markdownInput, // The <textarea>
        initialSettings: settings, // Use loaded settings
        initialTheme: bodyElement.classList.contains('dark-theme') ? 'material-darker' : 'material-lighter', // Sync with theme
        // Pass debounced update function as onChange callback
        onChangeCallback: debouncedUpdatePreviewAndCounts,
        // Define extra key mappings for shortcuts and functionality
        extraKeysMap: {
            "Ctrl-B": () => wrapText('**'),
            "Ctrl-I": () => wrapText('*'),
            "Ctrl-K": () => insertLink(),
            "Ctrl-'": () => toggleBlockquote(), // Single quote for blockquote
            "Ctrl-Shift-S": () => wrapText('~~'), // Strikethrough
            "Ctrl-Shift-L": () => toggleListItem(), // Unordered list
            "Ctrl-Shift-O": () => toggleOrderedListItem(), // Ordered list
            "Ctrl-Shift-C": () => toggleCodeBlock(), // Code block/inline
            "Ctrl-Shift-H": () => toggleHeading(), // Cycle heading
            "Ctrl-Shift-T": () => toolbarButtons.table.click(), // Trigger table modal
            "Ctrl-Shift-": () => insertHorizontalRule(), // Horizontal Rule
            "Alt-T": () => themeToggleButton.click(), // Theme toggle
            "Alt-L": () => settings.lineNumbers ? settingLineNumbers.click() : settingLineNumbers.click(), // Toggle line numbers (click checkbox)
            "Alt-W": () => settings.lineWrapping ? settingLineWrapping.click() : settingLineWrapping.click(), // Toggle line wrap
            "Ctrl-O": () => toolbarButtons.importMd.click(), // Trigger import
            "Ctrl-Alt-S": () => toolbarButtons.exportMd.click(), // Export MD
            "Ctrl-Shift-E": () => toolbarButtons.exportHtml.click(), // Export HTML
            "Alt-?": () => helpButton.click(), // Show help
            // 添加查找/替换快捷键
            "Ctrl-F": () => { showSearchPanel(false); if (toolbarButtons.find) toolbarButtons.find.setAttribute('aria-expanded', 'true'); },
            "Ctrl-H": () => { showSearchPanel(true); if (toolbarButtons.find) toolbarButtons.find.setAttribute('aria-expanded', 'true'); },
            // Adjust font size shortcuts
            "Ctrl-=": () => {
                const current = settingFontSize.value;
                if (current === 'small') settingFontSize.value = 'medium';
                else if (current === 'medium') settingFontSize.value = 'large';
                settingFontSize.dispatchEvent(new Event('change')); // Trigger change
            },
            "Ctrl-+": () => { // Numpad + or regular +
                const current = settingFontSize.value;
                if (current === 'small') settingFontSize.value = 'medium';
                else if (current === 'medium') settingFontSize.value = 'large';
                settingFontSize.dispatchEvent(new Event('change')); // Trigger change
            },
            "Ctrl--": () => {
                const current = settingFontSize.value;
                if (current === 'large') settingFontSize.value = 'medium';
                else if (current === 'medium') settingFontSize.value = 'small';
                settingFontSize.dispatchEvent(new Event('change')); // Trigger change
            }
        }
    });

    if (!editorInstance) {
        console.error("[main] Failed to initialize CodeMirror. Application cannot proceed.");
        // Error message is likely already shown by initializeCodeMirror
        return; // Stop initialization
    }

    // 添加光标位置监听器以更新工具栏状态
    editorInstance.on('cursorActivity', updateToolbarButtonStates);

    // 4. Load saved content (must be after editor init)
    // console.log("[main] Loading saved content..."); // Removed log
    loadContentFromStorage();
    // console.log("[main] Attempted to load saved content."); // Removed log

    // 5. Initial Preview & Status Update (call once after loading content)
    // console.log("[main] Performing initial preview and status update..."); // Removed log
    const initialContent = getEditor().getValue();
    updatePreview(initialContent);
    updateStatusCounts(initialContent);
    // console.log("[main] Initial preview and status updated."); // Removed log

    // 6. Setup remaining listeners (toolbar state, settings controls)
    // console.log("[main] Setting up event listeners via setupEventListeners()..."); // Removed log
    setupEventListeners();
    setupEditorStateListeners(); // Attach cursor/change listeners for toolbar UI updates

    // 初始化滚动同步功能
    initScrollSync();
    
    // 初始化布局增强功能 (可调节分割线和全屏模式)
    console.log("Applying layout enhancements...");
    layoutEnhancer.init();

    // Initialize fullscreen mode (when implemented)
    if (typeof window.FullscreenMode !== 'undefined' && window.FullscreenMode.init) {
        window.FullscreenMode.init();
    }
    
    // Initialize toolbar drawer if present
    console.log("Initializing toolbar drawer...");
    toolbarDrawer.init();

    // 初始化搜索面板
    initSearchPanel();

    console.log('App initialized successfully.');
}

// =========================================================================
// Start the application when the DOM is ready
// =========================================================================
document.addEventListener('DOMContentLoaded', initializeApp);

// 清理资源 (可能在单页应用路由变化时等情况下调用)
window.addEventListener('beforeunload', function() {
    cleanupScrollSync();
});
