// DOM Element References for Outfit Web

export const markdownInput = document.getElementById('markdown-input');
export const previewArea = document.getElementById('preview-area');
export const themeToggleButton = document.getElementById('theme-toggle');
export const bodyElement = document.body;

// Theme icon elements (might be null if button structure changes)
export const themeIconSun = themeToggleButton?.querySelector('.theme-icon-sun');
export const themeIconMoon = themeToggleButton?.querySelector('.theme-icon-moon');

// Toolbar Buttons Object
export const toolbarButtons = {
    bold: document.getElementById('toolbar-bold'),
    italic: document.getElementById('toolbar-italic'),
    strike: document.getElementById('toolbar-strike'),
    link: document.getElementById('toolbar-link'),
    quote: document.getElementById('toolbar-quote'),
    ul: document.getElementById('toolbar-ul'),
    ol: document.getElementById('toolbar-ol'),
    heading: document.getElementById('toolbar-heading'),
    code: document.getElementById('toolbar-code'),
    hr: document.getElementById('toolbar-hr'),
    table: document.getElementById('toolbar-table'),
    importMd: document.getElementById('toolbar-import-md'),
    exportMd: document.getElementById('toolbar-export-md'),
    exportHtml: document.getElementById('toolbar-export-html'),
    undo: document.getElementById('toolbar-undo'),
    redo: document.getElementById('toolbar-redo'),
    find: document.getElementById('toolbar-find'),
    // settings toggle is separate below
};

// Settings Button & Modal Elements
export const settingsToggleButton = document.getElementById('settings-toggle');
export const settingsModal = document.getElementById('settings-modal');
export const settingsModalClose = document.getElementById('settings-modal-close'); // Top X button
export const settingsModalCloseBtn = document.getElementById('settings-modal-close-btn'); // Footer Close button

// Settings Modal Controls
export const settingLineNumbers = document.getElementById('setting-line-numbers');
export const settingLineWrapping = document.getElementById('setting-line-wrapping');
export const settingFontSize = document.getElementById('setting-font-size');
export const settingTabBehavior = document.getElementById('setting-tab-behavior');

// File Input
export const importFileInput = document.getElementById('import-file-input');

// Table Modal Elements
export const tableModal = document.getElementById('table-modal');
export const tableModalClose = document.getElementById('table-modal-close');
export const tableModalConfirm = document.getElementById('table-modal-confirm');
export const tableModalCancel = document.getElementById('table-modal-cancel');
export const tableRowsInput = document.getElementById('table-rows');
export const tableColsInput = document.getElementById('table-cols');
export const tableModalError = document.getElementById('table-modal-error');

// Status Bar Elements
export const charCountElement = document.getElementById('char-count');
export const wordCountElement = document.getElementById('word-count');

// Shortcuts Help Modal Elements
export const helpButton = document.getElementById('toolbar-help');
export const shortcutsModal = document.getElementById('shortcuts-modal');
export const shortcutsModalClose = document.getElementById('shortcuts-modal-close');
export const shortcutsModalCloseBtn = document.getElementById('shortcuts-modal-close-btn');
export const shortcutsModalContent = document.getElementById('shortcuts-modal-content');

// 布局增强功能元素
export const resizeHandle = document.getElementById('resize-handle');
export const editorPane = document.querySelector('.editor-pane');
export const previewPane = document.querySelector('.preview-pane');
export const editorContainer = document.querySelector('.editor-container');
export const fullscreenToggleButton = document.getElementById('fullscreen-toggle');

// Share Button (New)
export const shareButton = document.getElementById('share-button'); 

// Feedback Modal Elements (New)
export const feedbackButton = document.getElementById('feedback-button');
export const feedbackModal = document.getElementById('feedback-modal');
export const feedbackModalCloseButton = document.getElementById('feedback-modal-close');
export const feedbackForm = document.getElementById('feedback-form');
export const feedbackStatusElement = document.getElementById('feedback-status'); 