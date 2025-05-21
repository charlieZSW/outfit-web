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
    shortcutsModalContent,
    shareButton
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
// Import shareManager module (New)
import { handleShare } from './modules/shareManager.js';
// Import feedbackManager module (New)
import { initFeedbackManager } from './modules/feedbackManager.js';

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

async function loadSnapshotContent(snapshotId) {
    try {
        console.log(`尝试加载快照: ${snapshotId}`);
        const response = await fetch(`/api/get-snapshot/${snapshotId}`); // Relative path

        if (!response.ok) {
            if (response.status === 404) {
                alert("快照未找到或已过期。将加载本地保存的内容（如有）。");
                console.warn(`快照 ${snapshotId} 未找到或已过期。`);
                return null; // Indicate snapshot not loaded
            }
            const errorText = await response.text();
            throw new Error(`获取快照失败: ${response.status} ${errorText}`);
        }

        const { markdownContent } = await response.json();
        return markdownContent;

    } catch (error) {
        console.error(`加载快照 ${snapshotId} 失败:`, error);
        alert(`无法加载分享的快照内容: ${error.message}`);
        return null; // Indicate snapshot not loaded
    }
}

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

    // Share Button (New)
    if (shareButton) {
        shareButton.addEventListener('click', handleShare);
    } else {
        console.warn("Share button not found, cannot attach listener.");
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
async function initializeApp() {
    // console.log("[main] DOM fully loaded. Initializing application..."); // Removed log

    let loadedFromSnapshot = false; // 标志位

    // 0. 检查 URL hash 中是否有快照 ID
    if (window.location.hash && window.location.hash.startsWith('#s=')) {
        const snapshotId = window.location.hash.substring(3); // Remove #s=
        if (snapshotId) {
            const snapshotContent = await loadSnapshotContent(snapshotId);
            if (snapshotContent !== null) { // 确保真的加载到了内容
                // 我们需要编辑器实例先初始化，然后再设置内容
                // 所以这里先保存内容，在编辑器初始化后再设置
                window.initialSnapshotContent = snapshotContent;
                loadedFromSnapshot = true;
                // 清除 hash，避免刷新时重复加载或干扰后续操作
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
        }
    }

    // 1. Run essential checks
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
    // Note: initializeCodeMirror itself should call setEditor(editorInstance) internally
    // or return the instance which we then pass to setEditor.
    // For this example, we assume initializeCodeMirror handles setting the editor instance in state.js
    // or we get it via getEditor() after its initialization.
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

    if (!editorInstance) { // Check if editorInstance was successfully created
        console.error("[main] Failed to initialize CodeMirror. Application cannot proceed.");
        // Error message is likely already shown by initializeCodeMirror
        return; // Stop initialization
    }

    // Ensure editor state is updated (if initializeCodeMirror doesn't do it)
    // setEditor(editorInstance); // This might be redundant if initializeCodeMirror already calls setEditor

    // 添加光标位置监听器以更新工具栏状态
    editorInstance.on('cursorActivity', updateToolbarButtonStates);

    // 3.5 如果从快照加载了内容，在这里设置到编辑器
    if (loadedFromSnapshot && window.initialSnapshotContent) {
        console.log("正在从快照设置编辑器内容...");
        editorInstance.setValue(window.initialSnapshotContent);
        // 可选：清除撤销历史，因为这是新加载的内容
        editorInstance.clearHistory(); 
        delete window.initialSnapshotContent; // 清理全局变量
    }


    // 4. Load saved content (must be after editor init)
    //    只在没有从快照加载内容时才从 LocalStorage 加载
    if (!loadedFromSnapshot) {
        // console.log("[main] Loading saved content from LocalStorage...");
        loadContentFromStorage(); // 你现有的函数
        // console.log("[main] Attempted to load saved content.");
    } else {
        console.log("[main] 跳过从 LocalStorage 加载内容，因为已从快照加载。");
    }

    // 5. Initial Preview & Status Update
    // 确保这里使用的 initialContent 是编辑器当前的内容
    const currentEditorContent = editorInstance.getValue(); // Always get fresh content
    updatePreview(currentEditorContent); // 你现有的函数
    updateStatusCounts(currentEditorContent); // 你现有的函数
    // console.log("[main] Initial preview and status updated.");

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

    // 初始化反馈功能 (New)
    initFeedbackManager();

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
