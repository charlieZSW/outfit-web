import { getEditor } from './state.js';
import { toolbarButtons } from './domElements.js';

/**
 * Applies the selected font size to the CodeMirror editor.
 * @param {string} sizeValue - The font size value ('small', 'medium', 'large').
 */
export function applyFontSize(sizeValue) {
    const editor = getEditor();
    if (!editor) {
        console.warn("applyFontSize: Editor not available.");
        return;
    }
    const cmElement = editor.getWrapperElement();
    cmElement.classList.remove('cm-font-small', 'cm-font-medium', 'cm-font-large');
    cmElement.classList.add(`cm-font-${sizeValue || 'medium'}`);
}

/**
 * Applies the selected tab indentation behavior to the CodeMirror editor.
 * @param {string} behaviorValue - The tab behavior value ('tabs', 'spaces-2', 'spaces-4').
 */
export function applyTabBehavior(behaviorValue) {
    const editor = getEditor();
    if (!editor) {
        console.warn("applyTabBehavior: Editor not available.");
        return;
    }
    let indentUnit = 4;
    let indentWithTabs = false;
    switch (behaviorValue) {
        case 'tabs': indentWithTabs = true; indentUnit = 4; break;
        case 'spaces-2': indentWithTabs = false; indentUnit = 2; break;
        case 'spaces-4': default: indentWithTabs = false; indentUnit = 4; break;
    }
    editor.setOption('indentUnit', indentUnit);
    editor.setOption('indentWithTabs', indentWithTabs);
}

/**
 * Updates the visual state (active class, aria-pressed) of toolbar buttons
 * based on the formatting at the current cursor position in CodeMirror.
 */
export function updateToolbarButtonStates() {
    const editor = getEditor();
    // Use imported toolbarButtons directly
    const tb = toolbarButtons;

    if (!editor || !tb) {
        // console.warn("updateToolbarButtonStates: Editor or toolbarButtons not available.");
        return; // Don't warn too frequently, as this runs on cursor activity
    }

    const updateButton = (button, isActive) => {
        if (button) {
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            button.classList.toggle('active', isActive);
        }
    };

    try {
        const cursor = editor.getCursor();
        const token = editor.getTokenAt(cursor);
        const lineContent = editor.getLine(cursor.line);
        let isBold = false, isItalic = false, isStrikethrough = false, isCode = false;
        let isQuote = lineContent.trimStart().startsWith('> ');
        let isUL = lineContent.trimStart().startsWith('- ');
        let isOL = /^\\s*\\d+\\.\\s/.test(lineContent);
        let isHeading = /^#+\\s/.test(lineContent);

        if (token && token.type) {
            const types = token.type.split(' ');
            isBold = types.includes('strong');
            isItalic = types.includes('em');
            isStrikethrough = types.includes('strikethrough');
            isCode = types.includes('comment') || types.includes('variable-2') || types.includes('string') || token.string === '\`'; // Basic check
        }

        // Refine using marks if needed
        const marksAtCursor = editor.findMarksAt(cursor);
        marksAtCursor.forEach(mark => {
             if (mark.type === 'range' && mark.className === 'cm-comment') isCode = true; // Inline code check
             // Add checks for bold/italic/strike marks if CodeMirror styling uses them explicitly
             // e.g., if (mark.type === 'range' && mark.className?.includes('cm-strong')) isBold = true;
        });

        updateButton(tb.bold, isBold);
        updateButton(tb.italic, isItalic);
        updateButton(tb.strike, isStrikethrough);
        updateButton(tb.quote, isQuote);
        updateButton(tb.ul, isUL);
        updateButton(tb.ol, isOL);
        updateButton(tb.heading, isHeading);
        updateButton(tb.code, isCode);

    } catch (error) {
        console.error("Error updating toolbar button states:", error);
    }
}

/**
 * Attaches the handler to update toolbar button states on relevant editor events.
 */
export function setupEditorStateListeners() {
     // console.log("[editorUI] Attempting to setup editor state listeners...");
     const editor = getEditor();
     if (!editor) {
         console.warn("[editorUI] setupEditorStateListeners: Editor not available when attempting to attach listeners.");
         return;
     }
     // console.log("[editorUI] Editor instance obtained. Attaching listeners...");
     // Update toolbar state when cursor activity changes
     editor.on('cursorActivity', updateToolbarButtonStates);
     // Also update when content changes (e.g., after undo/redo or pasting)
     editor.on('change', updateToolbarButtonStates);
     // console.log('[editorUI] Editor state listeners for toolbar updates attached.');
} 