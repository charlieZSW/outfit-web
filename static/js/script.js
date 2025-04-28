// Utility Functions (Remain Global or move inside DOMContentLoaded if preferred)
console.log("Script loaded. Waiting for DOM...");

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    // =========================================================================
    // Configuration & Constants
    // =========================================================================
    const THEME_STORAGE_KEY = 'themePreference';
    const CONTENT_STORAGE_KEY = 'markdownEditorContent';
    const EDITOR_SETTINGS_KEY = 'editorSettings'; // NEW Settings storage key
    const DEBOUNCE_DELAY = 300; // ms

    // Default Editor Settings (NEW)
    const DEFAULT_EDITOR_SETTINGS = {
        lineNumbers: true,
        lineWrapping: true,
        fontSize: 'medium', // NEW Font size setting
        tabBehavior: 'spaces-4', // NEW: Default tab behavior
        // Add future settings here with defaults
    };

    // =========================================================================
    // DOM Element References
    // =========================================================================
    const markdownInput = document.getElementById('markdown-input');
    const previewArea = document.getElementById('preview-area');
    const themeToggleButton = document.getElementById('theme-toggle');
    const bodyElement = document.body;
    // NEW: Theme icon elements inside the toggle button
    const themeIconSun = themeToggleButton?.querySelector('.theme-icon-sun');
    const themeIconMoon = themeToggleButton?.querySelector('.theme-icon-moon');

    // Toolbar Buttons
    const toolbarButtons = {
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
        // settings: added later
    };

    // Settings Button & Modal Elements (NEW)
    const settingsToggleButton = document.getElementById('settings-toggle');
    const settingsModal = document.getElementById('settings-modal');
    const settingsModalClose = document.getElementById('settings-modal-close'); // Top X button
    const settingsModalCloseBtn = document.getElementById('settings-modal-close-btn'); // Footer Close button
    // Settings Modal Controls (NEW)
    const settingLineNumbers = document.getElementById('setting-line-numbers');
    const settingLineWrapping = document.getElementById('setting-line-wrapping'); // NEW
    const settingFontSize = document.getElementById('setting-font-size'); // NEW Font size select
    const settingTabBehavior = document.getElementById('setting-tab-behavior'); // NEW Tab behavior select

    // File Input
    const importFileInput = document.getElementById('import-file-input');

    // Table Modal Elements
    const tableModal = document.getElementById('table-modal');
    const tableModalClose = document.getElementById('table-modal-close');
    const tableModalConfirm = document.getElementById('table-modal-confirm');
    const tableModalCancel = document.getElementById('table-modal-cancel');
    const tableRowsInput = document.getElementById('table-rows');
    const tableColsInput = document.getElementById('table-cols');
    const tableModalError = document.getElementById('table-modal-error');

    // Status Bar Elements
    const charCountElement = document.getElementById('char-count');
    const wordCountElement = document.getElementById('word-count');

    // Shortcuts Help Modal Elements (NEW)
    const helpButton = document.getElementById('toolbar-help');
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const shortcutsModalClose = document.getElementById('shortcuts-modal-close');
    const shortcutsModalCloseBtn = document.getElementById('shortcuts-modal-close-btn');
    const shortcutsModalContent = document.getElementById('shortcuts-modal-content');

    // =========================================================================
    // State Variables
    // =========================================================================
    let editor; // CodeMirror instance
    let currentTheme = 'light'; // Track the current theme state
    let editorSettings = { ...DEFAULT_EDITOR_SETTINGS }; // Current editor settings state (NEW)

    // =========================================================================
    // Library & Element Checks
    // =========================================================================
    function runChecks() {
    if (!markdownInput) {
        console.error('Error: Markdown input area (textarea) not found!');
            return false;
    }
    if (!previewArea) {
        console.error('Error: Preview area not found!');
            return false;
    }
    if (typeof marked === 'undefined') {
        console.error('Error: marked.js library not loaded!');
        previewArea.innerHTML = '<p style="color: red;">错误: marked.js 库未加载。</p>';
            return false;
    }
    if (typeof DOMPurify === 'undefined') {
        console.error('Error: DOMPurify library not loaded!');
        previewArea.innerHTML = '<p style="color: red;">错误: DOMPurify 库未加载。</p>';
            return false;
    }
    if (typeof CodeMirror === 'undefined') {
        console.error('Error: CodeMirror library not loaded!');
        return false;
    }
    if (!themeToggleButton) {
            console.warn('Theme toggle button not found!'); // Optional
    }
    if (!tableModal || !tableModalClose || !tableModalConfirm || !tableModalCancel || !tableRowsInput || !tableColsInput || !tableModalError) {
        console.warn('Warning: Table modal elements not fully found! Interactive table generation might fail.');
        // Optional: return false; // Or decide if it's a critical failure
    }
    if (!importFileInput) {
        console.warn('Warning: Import file input element not found!');
        // Decide if this is critical, maybe return false
    }
    // Check status elements
    if (!charCountElement || !wordCountElement) {
        console.warn('Warning: Status count elements not found! Counts will not be displayed.');
    }
    // Check Settings elements (NEW)
    if (!settingsToggleButton) {
        console.warn('Warning: Settings toggle button not found!');
    }
    if (!settingsModal || !settingsModalClose || !settingsModalCloseBtn) {
        console.warn('Warning: Settings modal elements not fully found! Settings might not work.');
    }
    // Check specific setting controls (NEW)
    if (!settingLineNumbers) {
        console.warn('Warning: Setting control for Line Numbers not found!');
    }
    if (!settingLineWrapping) { // NEW Check
        console.warn('Warning: Setting control for Line Wrapping not found!');
    }
    if (!settingFontSize) { // NEW Check
        console.warn('Warning: Setting control for Font Size not found!');
    }
    // NEW Check for Tab Behavior
    if (!settingTabBehavior) {
        console.warn('Warning: Setting control for Tab Behavior not found!');
    }
    // Check toolbar buttons (optional, for robustness)
    Object.entries(toolbarButtons).forEach(([key, element]) => {
        if (!element) {
            console.warn(`Toolbar button 'toolbar-${key}' not found.`);
    }
    });
    if (!helpButton) {
        console.warn('Warning: Help button not found!');
    }
    if (!shortcutsModal || !shortcutsModalClose || !shortcutsModalCloseBtn || !shortcutsModalContent) {
        console.warn('Warning: Shortcuts modal elements not fully found!');
    }
        return true;
    }

    // =========================================================================
    // Editor Utilities & Toolbar Logic
    // =========================================================================
    const EditorUtils = {
        // --- Helper for Downloads ---
        _downloadFile: function(filename, content, mimeType) {
            try {
                const blob = new Blob([content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log(`Successfully initiated download for ${filename}`);
            } catch (error) {
                console.error(`Error creating download for ${filename}:`, error);
                alert(`无法创建下载文件 ${filename}。请检查控制台获取更多信息。`);
            }
        },

        // --- File Operations ---
        triggerImport: function() {
            if (importFileInput) {
                importFileInput.click(); // Trigger the hidden file input
            } else {
                console.error('Import file input not found.');
                alert('导入功能初始化失败。');
            }
        },

        _handleImport: function(event) {
            const file = event.target.files[0];
            if (!file) {
                return; // No file selected
            }

            if (!file.type.match('text/markdown') && !file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
                console.warn('Attempted to import non-markdown file:', file.name, file.type);
                alert('请选择一个 Markdown 文件 (.md, .markdown)。');
                event.target.value = null; // Reset input
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    editor.setValue(content);
                    console.log(`Successfully imported ${file.name}`);
                    // Optional: Maybe add a small notification?
                } catch (err) {
                    console.error('Error setting editor content after import:', err);
                    alert('导入文件时发生错误。无法将内容加载到编辑器。');
                }
            };

            reader.onerror = (e) => {
                console.error('Error reading file:', e);
                alert(`读取文件 ${file.name} 时发生错误。`);
            };

            reader.readAsText(file);

            // Reset the input value so the change event fires even if the same file is selected again
            event.target.value = null;
        },

        exportMarkdown: function() {
            try {
                const content = editor.getValue();
                this._downloadFile('document.md', content, 'text/markdown;charset=utf-8');
            } catch (error) {
                console.error('Error exporting Markdown:', error);
                alert('导出 Markdown 时发生错误。');
            }
        },

        exportHtml: function() {
            try {
                const markdownContent = editor.getValue();
                const rawHtml = marked.parse(markdownContent);
                const cleanHtml = DOMPurify.sanitize(rawHtml);

                // Optional: Wrap in a basic HTML structure
                const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Markdown</title>
    <style>
        /* Add some basic styles for better viewing */
        body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
        pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        code { font-family: monospace; }
        blockquote { border-left: 3px solid #ccc; padding-left: 10px; color: #555; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
${cleanHtml}
</body>
</html>`;

                this._downloadFile('document.html', fullHtml, 'text/html;charset=utf-8');
            } catch (error) {
                console.error('Error exporting HTML:', error);
                alert('导出 HTML 时发生错误。');
            }
        },

        // --- Core Formatting ---
        wrapText: function(syntaxStart, syntaxEnd = syntaxStart) {
        const selection = editor.getSelection();
        const startCursor = editor.getCursor('start');
        const endCursor = editor.getCursor('end');

            editor.operation(() => {
                if (selection) {
                editor.replaceSelection(syntaxStart + selection + syntaxEnd);
                editor.setSelection(
                    { line: startCursor.line, ch: startCursor.ch + syntaxStart.length },
                        { line: endCursor.line, ch: endCursor.ch + syntaxStart.length }
                );
                } else {
                editor.replaceSelection(syntaxStart + syntaxEnd);
                editor.setCursor({ line: startCursor.line, ch: startCursor.ch + syntaxStart.length });
            }
        });
        editor.focus();
        },

        // --- List Handling ---
        renumberOrderedList: function(doc, startLine) {
            // console.log(`[renumberOL] Starting scan from line ${startLine}`); // Removed log
        let changes = [];
        let currentNumber = 1;
        let searchLine = startLine;
        let scanUpLine = startLine - 1;
        let foundPrevOL = false;
        while (scanUpLine >= 0) {
            const prevLineContent = doc.getLine(scanUpLine);
                const prevOlMatch = prevLineContent.trimStart().match(/^(\d+)\.\s*/);
            if (prevOlMatch) {
                currentNumber = parseInt(prevOlMatch[1], 10) + 1;
                    // console.log(`[renumberOL] Determined starting number ${currentNumber} from line ${scanUpLine}`); // Removed log
                foundPrevOL = true;
                    break;
            }
            scanUpLine--;
        }
            // if (!foundPrevOL) console.log(`[renumberOL] No previous OL found, starting at 1.`); // Removed log

        while (searchLine < doc.lineCount()) {
            const lineContent = doc.getLine(searchLine);
            const lineLength = lineContent.length;
            const trimmedLineStart = lineContent.trimStart();
                const olMatch = trimmedLineStart.match(/^(\d+)\.(\s*)/);

            if (olMatch) {
                const correctNumberStr = String(currentNumber);
                const currentNumberStr = olMatch[1];
                    const spacing = olMatch[2] || ' ';
                const correctPrefix = correctNumberStr + '.' + spacing;
                    // const currentPrefix = currentNumberStr + '.' + spacing; // Not needed?

                if (currentNumberStr !== correctNumberStr) {
                    const leadingWhitespaceMatch = lineContent.match(/^(\s*)/);
                    const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[1] : "";
                    const actualCurrentPrefixInLine = lineContent.substring(leadingWhitespace.length).match(/^(\d+\.)(\s*)/)[0];
                    const contentAfterPrefix = lineContent.substring(leadingWhitespace.length + actualCurrentPrefixInLine.length);
                    const newContent = leadingWhitespace + correctPrefix + contentAfterPrefix;
                    const oldPrefixForChange = leadingWhitespace + actualCurrentPrefixInLine;
                    const newPrefixForChange = leadingWhitespace + correctPrefix;

                        // console.log(`[renumberOL Line ${searchLine}] Renumbering. Old: ${currentNumberStr}, New: ${correctNumberStr}`); // Removed log
                    doc.replaceRange(newContent, { line: searchLine, ch: 0 }, { line: searchLine, ch: lineLength });
                    changes.push({ lineNumber: searchLine, oldPrefix: oldPrefixForChange, newPrefix: newPrefixForChange });
                }
                    // else { console.log(`[renumberOL Line ${searchLine}] Number ${currentNumberStr} correct.`); } // Removed log
                currentNumber++;
                searchLine++;
                } else if (lineContent.trim() === '') {
                searchLine++;
            } else {
                    // console.log(`[renumberOL Line ${searchLine}] End of block.`); // Removed log
                break;
            }
        }
            // console.log(`[renumberOL] Finished scan. ${changes.length} changes.`); // Removed log
        return changes;
        },

        toggleListItem: function() { // Unordered List
            // console.log("[toggleListItem] Starting..."); // Removed log
        const doc = editor.getDoc();
            const selections = doc.listSelections();
            // console.log("[toggleListItem] Initial selections:", JSON.parse(JSON.stringify(selections))); // Removed log
        const newSelections = [];

            editor.operation(() => {
                const changes = [];
                let renumberingStarts = new Set();

            selections.forEach((selection, selIndex) => {
                    // console.log(`[toggleListItem Pass 1 Sel ${selIndex}] Processing`); // Removed log
                    const { rangeStart, rangeEnd } = this.getNormalizedSelection(doc, selection);
                    // console.log(`[toggleListItem Pass 1 Sel ${selIndex}] Normalized range:`, { rangeStart, rangeEnd }); // Removed log

                let linesToModify = [];
                    for (let i = rangeStart.line; i <= rangeEnd.line; i++) linesToModify.push(i);

                let addPrefix = true;
                for (const lineNumber of linesToModify) {
                    const lineContent = doc.getLine(lineNumber);
                        if (lineContent.trim() !== '') {
                            if (lineContent.trimStart().startsWith('- ')) addPrefix = false;
                        break;
                    }
                }
                    // console.log(`[toggleListItem Pass 1 Sel ${selIndex}] Action: addPrefix = ${addPrefix}`); // Removed log

                for (const lineNumber of linesToModify) {
                    const lineContent = doc.getLine(lineNumber);
                    let currentChange = null;
                        const leadingWhitespaceMatch = lineContent.match(/^(\s*)/);
                    const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[1] : "";
                        // console.log(`[toggleListItem Pass 1 Sel ${selIndex} Line ${lineNumber}] Processing. WS: "${leadingWhitespace}"`); // Removed log

                    if (addPrefix) {
                        const trimmedLineStart = lineContent.trimStart();
                        const olMatch = trimmedLineStart.match(/^(\d+\.)\s*/);
                            if (olMatch) { // Replace OL with UL
                                const prefixToRemove = olMatch[0];
                            const contentAfterPrefix = trimmedLineStart.substring(prefixToRemove.length);
                            const newContent = leadingWhitespace + '- ' + contentAfterPrefix;
                            const originalPrefix = leadingWhitespace + prefixToRemove;
                                // console.log(`[toggleListItem ... Line ${lineNumber}] Replacing OL with UL.`); // Removed log
                            doc.replaceRange(newContent, { line: lineNumber, ch: 0 }, { line: lineNumber, ch: lineContent.length });
                            currentChange = { lineNumber, oldPrefix: originalPrefix, newPrefix: leadingWhitespace + '- ' };
                            renumberingStarts.add(lineNumber + 1);
                                // console.log(`[toggleListItem ... Line ${lineNumber}] Queued renumber check for line ${lineNumber + 1}`); // Removed log
                            } else if (lineContent.trim() !== '' && !trimmedLineStart.startsWith('- ')) { // Add UL
                                const currentLineActualContent = doc.getLine(lineNumber); // Recalc WS (Workaround)
                            const currentLeadingWSMatch = currentLineActualContent.match(/^(\s*)/);
                            const currentLeadingWS = currentLeadingWSMatch ? currentLeadingWSMatch[1] : "";
                            const newContent = currentLeadingWS + '- ' + currentLineActualContent.substring(currentLeadingWS.length);
                                // console.log(`[toggleListItem ADDING UL] Line ${lineNumber}, NewContent: ${JSON.stringify(newContent)}`); // Removed core debug log
                                doc.replaceRange(newContent, { line: lineNumber, ch: 0 }, { line: lineNumber, ch: currentLineActualContent.length });
                                currentChange = { lineNumber, oldPrefix: currentLeadingWS, newPrefix: currentLeadingWS + '- ' };
                            }
                            // else { console.log(`[toggleListItem ... Line ${lineNumber}] Adding prefix skipped.`); } // Removed log
                        } else { // Remove UL prefix
                        const trimmedLine = lineContent.trimStart();
                        if (trimmedLine.startsWith('- ')) {
                                const currentLeadingWhitespace = lineContent.substring(0, lineContent.length - trimmedLine.length);
                                const contentAfterPrefix = lineContent.substring(currentLeadingWhitespace.length + 2);
                                const newContent = currentLeadingWhitespace + contentAfterPrefix;
                                const originalPrefix = currentLeadingWhitespace + '- ';
                                // console.log(`[toggleListItem ... Line ${lineNumber}] Removing prefix.`); // Removed log
                            doc.replaceRange(newContent, { line: lineNumber, ch: 0 }, { line: lineNumber, ch: lineContent.length });
                                currentChange = { lineNumber, oldPrefix: originalPrefix, newPrefix: currentLeadingWhitespace };
                            } else if (trimmedLine === '-') { // Handle just "-"
                                const currentLeadingWhitespace = lineContent.substring(0, lineContent.length - trimmedLine.length);
                                const newContent = currentLeadingWhitespace;
                                const originalPrefix = lineContent;
                                // console.log(`[toggleListItem ... Line ${lineNumber}] Removing prefix (just hyphen).`); // Removed log
                             doc.replaceRange(newContent, { line: lineNumber, ch: 0 }, { line: lineNumber, ch: lineContent.length });
                                currentChange = { lineNumber, oldPrefix: originalPrefix, newPrefix: currentLeadingWhitespace };
                        }
                            // else { console.log(`[toggleListItem ... Line ${lineNumber}] Removing prefix. No prefix found.`); } // Removed log
                    }
                    if (currentChange) {
                            // console.log(`[toggleListItem ... Line ${lineNumber}] Change recorded:`, currentChange); // Removed log
                        changes.push(currentChange);
                    }
                }
                }); // End loop linesToModify

            // Pass 1.5: Perform renumbering if needed
            let combinedChanges = [...changes];
                const processedRenumberStarts = new Set();
            for (const startLine of renumberingStarts) {
                if (startLine >= doc.lineCount() || processedRenumberStarts.has(startLine)) continue;
                const lineContent = doc.getLine(startLine);
                 if (/^\s*(\d+\.)\s*/.test(lineContent)) {
                        // console.log(`[toggleListItem Pass 1.5] Triggering renumber for line ${startLine}`); // Removed log
                        const renumberChanges = this.renumberOrderedList(doc, startLine);
                    combinedChanges = combinedChanges.concat(renumberChanges);
                     processedRenumberStarts.add(startLine); 
                    }
                    // else { console.log(`[toggleListItem Pass 1.5] Skipping renumber for line ${startLine}`); } // Removed log
                }
                if (renumberingStarts.size > 0) combinedChanges.sort((a, b) => a.lineNumber - b.lineNumber);
                // console.log("[toggleListItem Pass 2] All combined changes:", JSON.parse(JSON.stringify(combinedChanges))); // Removed log

                // Pass 2: Adjust selections
            selections.forEach((selection, selIndex) => {
                    // console.log(`[toggleListItem Pass 2 Sel ${selIndex}] Adjusting original selection`); // Removed log
                    const adjusted = this.adjustSelection(doc, selection, combinedChanges, `UL_${selIndex}`);
                newSelections.push(adjusted);
            });

            }); // End editor.operation

            // console.log("[toggleListItem Pass 2] Final selections: ", JSON.parse(JSON.stringify(newSelections))); // Removed log
            if (newSelections.length > 0) {
                doc.setSelections(newSelections);
                // console.log("[toggleListItem] setSelections called."); // Removed log
            }
            // console.log("[toggleListItem] Finished."); // Removed log
        editor.focus();
        },

        toggleOrderedListItem: function() {
            // console.log("[toggleOL] Starting..."); // Removed log
        const doc = editor.getDoc();
        const selections = doc.listSelections();
            // console.log("[toggleOL] Initial selections:", JSON.parse(JSON.stringify(selections))); // Removed log
        const newSelections = [];

        editor.operation(() => {
                const olChanges = [];
                let renumberStarts = new Set();

            // Pass 1: Determine action & calculate changes
            selections.forEach((selection, selIndex) => {
                    // console.log(`[toggleOL Pass 1 Sel ${selIndex}] Processing`); // Removed log
                    const { rangeStart, rangeEnd } = this.getNormalizedSelection(doc, selection);
                    // console.log(`[toggleOL Pass 1 Sel ${selIndex}] Normalized range:`, { rangeStart, rangeEnd }); // Removed log

                let linesToModify = [];
                    for (let i = rangeStart.line; i <= rangeEnd.line; i++) linesToModify.push(i);

                let primaryActionIsRemove = false;
                for (const lineNumber of linesToModify) {
                    const lineContent = doc.getLine(lineNumber);
                        if (lineContent.trim() !== '') {
                            if (/^(\d+\.)\s*/.test(lineContent.trimStart())) primaryActionIsRemove = true;
                        break;
                    }
                }
                    // console.log(`[toggleOL Pass 1 Sel ${selIndex}] Action: primaryActionIsRemove = ${primaryActionIsRemove}`); // Removed log

                    let listCounter = 1; // Counter only used when adding

                linesToModify.forEach(lineNumber => {
                    const lineContent = doc.getLine(lineNumber);
                    const lineLength = lineContent.length;
                    const trimmedLine = lineContent.trim();
                    const leadingWhitespaceMatch = lineContent.match(/^(\s*)/);
                    const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[1] : "";
                    let currentChange = null;
                        // console.log(`[toggleOL Pass 1 Sel ${selIndex} Line ${lineNumber}] Processing. WS: "${leadingWhitespace}"`); // Removed log

                        if (primaryActionIsRemove) { // Remove OL prefix
                            const trimmedLineStart = lineContent.trimStart();
                            const olMatch = trimmedLineStart.match(/^(\d+\.)\s*/);
                        if (olMatch) {
                                const currentLeadingWhitespace = lineContent.substring(0, lineContent.length - trimmedLineStart.length);
                                const prefixToRemove = olMatch[0];
                            const contentAfterPrefix = trimmedLineStart.substring(prefixToRemove.length);
                                const newContent = currentLeadingWhitespace + contentAfterPrefix;
                                const originalPrefix = currentLeadingWhitespace + prefixToRemove;
                                // console.log(`[toggleOL ... Line ${lineNumber}] Removing prefix.`); // Removed log
                            doc.replaceRange(newContent, {line: lineNumber, ch: 0}, {line: lineNumber, ch: lineLength});
                                currentChange = {lineNumber, oldPrefix: originalPrefix, newPrefix: currentLeadingWhitespace};
                                renumberStarts.add(lineNumber + 1);
                                // console.log(`[toggleOL ... Line ${lineNumber}] Queued renumber check for line ${lineNumber + 1}`); // Removed log
                            } else if (/^\\d+\.$/.test(trimmedLine)) { // Handle just "N."
                                const currentLeadingWhitespace = lineContent.substring(0, lineContent.length - trimmedLine.length);
                                const newContent = currentLeadingWhitespace;
                             const originalPrefix = lineContent;
                                // console.log(`[toggleOL ... Line ${lineNumber}] Removing prefix (just number+dot).`); // Removed log
                             doc.replaceRange(newContent, {line: lineNumber, ch: 0}, {line: lineNumber, ch: lineLength});
                                currentChange = {lineNumber, oldPrefix: originalPrefix, newPrefix: currentLeadingWhitespace};
                                renumberStarts.add(lineNumber + 1);
                                // console.log(`[toggleOL ... Line ${lineNumber}] Queued renumber check for line ${lineNumber + 1}`); // Removed log
                            }
                            // else { console.log(`[toggleOL ... Line ${lineNumber}] Removing prefix. No prefix found.`); } // Removed log
                        } else { // Add OL prefix
                        if (trimmedLine !== '' && !/^(\d+\.)\s*/.test(lineContent.trimStart())) {
                                let searchLine = lineNumber; // Determine start for renumbering check
                             let potentialListStart = lineNumber;
                             while (searchLine >= 0) {
                                 const prevLineContent = doc.getLine(searchLine);
                                 if (/^\s*(\d+\.|-)\s*/.test(prevLineContent) || prevLineContent.trim() === '') {
                                     potentialListStart = searchLine;
                                     searchLine--;
                                    } else break;
                                 }
                                renumberStarts.add(potentialListStart);
                                // console.log(`[toggleOL ... Line ${lineNumber}] Queued renumber check from line ${potentialListStart}`); // Removed log

                            const prefix = listCounter + '. ';
                            let contentToPrefix = lineContent.substring(leadingWhitespace.length);
                            let actualOldPrefix = leadingWhitespace;

                                if (contentToPrefix.startsWith('- ')) { // Remove UL marker if present
                                    // console.log(`[toggleOL ... Line ${lineNumber}] Removing existing UL marker.`); // Removed log
                                contentToPrefix = contentToPrefix.substring(2);
                                    actualOldPrefix += '- ';
                            }

                            const newContent = leadingWhitespace + prefix + contentToPrefix;
                                // console.log(`[toggleOL ADDING OL] Line ${lineNumber}, NewContent: ${JSON.stringify(newContent)}`); // Removed core debug log
                                // console.log(`[toggleOL ... Line ${lineNumber}] Adding prefix. New content: "${newContent}"`); // Removed log
                            doc.replaceRange(newContent, {line: lineNumber, ch: 0}, {line: lineNumber, ch: lineContent.length});
                            currentChange = {lineNumber, oldPrefix: actualOldPrefix, newPrefix: leadingWhitespace + prefix};
                                listCounter++;
                            }
                            // else if (trimmedLine === '') { console.log(`[toggleOL ... Line ${lineNumber}] Adding prefix skipped: empty line.`); } // Removed log
                            // else { console.log(`[toggleOL ... Line ${lineNumber}] Adding prefix skipped: already OL.`); listCounter++; } // Removed log
                    }

                    if(currentChange) {
                            // console.log(`[toggleOL ... Line ${lineNumber}] Change recorded:`, currentChange); // Removed log
                        olChanges.push(currentChange);
                    }
                    }); // End loop linesToModify
                }); // End loop selections

                // console.log("[toggleOL Pass 1] Initial changes:", JSON.parse(JSON.stringify(olChanges))); // Removed log

                // Pass 1.5: Renumber using helper
            let combinedChanges = [...olChanges];
                const processedRenumberStarts = new Set();
             const sortedStarts = Array.from(renumberStarts).sort((a,b) => a - b);
                // console.log("[toggleOL Pass 1.5] Potential renumber start lines:", sortedStarts); // Removed log
 
             for (const startLine of sortedStarts) {
                 if (startLine >= doc.lineCount() || processedRenumberStarts.has(startLine)) continue;
                 const lineContent = doc.getLine(startLine);
                 const prevLineIsOl = (startLine > 0) && /^\s*(\d+\.)\s*/.test(doc.getLine(startLine - 1));
                 const currentLineIsOl = /^\s*(\d+\.)\s*/.test(lineContent);

                    if (currentLineIsOl || prevLineIsOl) {
                        // console.log(`[toggleOL Pass 1.5] Triggering renumber around line ${startLine}`); // Removed log
                     const actualStartScan = currentLineIsOl ? startLine : startLine -1;
                     if(actualStartScan >= 0){
                           const renumberChanges = this.renumberOrderedList(doc, actualStartScan);
                        combinedChanges = combinedChanges.concat(renumberChanges);
                         renumberChanges.forEach(change => processedRenumberStarts.add(change.lineNumber)); 
                         processedRenumberStarts.add(actualStartScan); 
                     }
                    }
                    // else { console.log(`[toggleOL Pass 1.5] Skipping renumber for line ${startLine}`); } // Removed log
                }
                if (renumberStarts.size > 0) combinedChanges.sort((a, b) => a.lineNumber - b.lineNumber);
                // console.log("[toggleOL Pass 2] All combined changes:", JSON.parse(JSON.stringify(combinedChanges))); // Removed log

                // Pass 2: Adjust selections
            selections.forEach((selection, selIndex) => {
                    // console.log(`[toggleOL Pass 2 Sel ${selIndex}] Adjusting original selection`); // Removed log
                    const adjusted = this.adjustSelection(doc, selection, combinedChanges, `OL_${selIndex}`);
                newSelections.push(adjusted);
            });

                // console.log("[toggleOL Pass 2] Final selections: ", JSON.parse(JSON.stringify(newSelections))); // Removed log
            if (newSelections.length > 0) {
                doc.setSelections(newSelections);
                    // console.log("[toggleOL] setSelections called."); // Removed log
            }

        }); // End editor.operation
            // console.log("[toggleOL] Finished."); // Removed log
        editor.focus();
        },

        // --- Other Formatting ---
        toggleBlockquote: function() {
            const doc = editor.getDoc();
            const selections = doc.listSelections(); // Handle multiple selections

            editor.operation(() => {
                selections.forEach(selection => {
                     const { rangeStart, rangeEnd } = this.getNormalizedSelection(doc, selection);
                    let linesToModify = [];
                    for (let i = rangeStart.line; i <= rangeEnd.line; i++) linesToModify.push(i);

                    let allAreBlockquotes = linesToModify.every(lineNumber => {
                        const lineContent = doc.getLine(lineNumber).trim();
                        return lineContent.startsWith('> ') || lineContent === '';
                    });

                    linesToModify.forEach(lineNumber => {
                        const lineContent = doc.getLine(lineNumber);
                        if (lineContent.trim() === '' && !allAreBlockquotes) return;

                        if (allAreBlockquotes) {
                            const newContent = lineContent.replace(/^> /, '');
                            doc.replaceRange(newContent, {line: lineNumber, ch: 0}, {line: lineNumber, ch: lineContent.length});
                        } else {
                            if (!lineContent.startsWith('> ')) {
                               doc.replaceRange('> ' + lineContent, {line: lineNumber, ch: 0}, {line: lineNumber, ch: lineContent.length});
                            }
                        }
                    });
                });
            });
            editor.focus();
        },

        insertHorizontalRule: function() {
            const doc = editor.getDoc();
            const cursor = doc.getCursor();
            const currentLine = cursor.line;
            const lineContent = doc.getLine(currentLine);
            let textToInsert = '\n---\n';
            if (cursor.ch > 0 && lineContent.trim().length > 0) textToInsert = '\n' + textToInsert;
            if (doc.lineCount() > currentLine + 1) textToInsert += '\n'; // Extra newline if line below exists? Check this logic. Maybe just always add one trailing newline?

            const insertPos = { line: currentLine, ch: lineContent.length };
            doc.replaceRange(textToInsert, insertPos);
            // Cursor placement: Start of the line AFTER the HR line.
            editor.setCursor({ line: currentLine + 2, ch: 0 }); // HR itself adds a line, plus the newline after it.
            editor.focus();
        },

        insertLink: function() {
            const url = prompt("请输入链接 URL:", "https://");
            if (url) {
                const selection = editor.getSelection();
                const startCursor = editor.getCursor('start');
                if (selection) {
                    this.wrapText('[', `](${url})`);
                } else {
                    editor.replaceSelection(`[](${url})`);
                    editor.setCursor({ line: startCursor.line, ch: startCursor.ch + 1 });
                    editor.focus();
                }
            } else editor.focus();
        },

        toggleCodeBlock: function() {
            const selection = editor.getSelection();
            const startCursor = editor.getCursor();
            if (selection) {
                if (selection.includes('\n')) this.wrapText('```\n', '\n```');
                else this.wrapText('`', '`');
            } else {
                this.wrapText('```\n', '\n```');
                editor.setCursor({ line: startCursor.line + 1, ch: 0 });
            }
            editor.focus();
        },

        toggleHeading: function() {
        const doc = editor.getDoc();
        const selections = doc.listSelections();

        editor.operation(() => {
            selections.forEach(selection => {
                    const { rangeStart, rangeEnd } = this.getNormalizedSelection(doc, selection);
                for (let i = rangeStart.line; i <= rangeEnd.line; i++) {
                    const lineContent = doc.getLine(i);
                        const match = lineContent.match(/^#+\s/);
                    if (match) {
                            const prefix = match[0];
                            const currentLevel = prefix.length - 1;
                        const contentAfterPrefix = lineContent.substring(prefix.length);
                            if (currentLevel < 6) { // Increase H level
                            const newPrefix = '#'.repeat(currentLevel + 1) + ' ';
                            doc.replaceRange(newPrefix + contentAfterPrefix, { line: i, ch: 0 }, { line: i, ch: lineContent.length });
                            } else { // Remove H6
                            doc.replaceRange(contentAfterPrefix, { line: i, ch: 0 }, { line: i, ch: lineContent.length });
                        }
                        } else { // Add H1
                        doc.replaceRange('# ' + lineContent, { line: i, ch: 0 }, { line: i, ch: lineContent.length });
                    }
                }
            });
        });
        editor.focus();
        },

        insertTable: function() {
            // console.log("[EditorUtils.insertTable] Function called."); // DEBUG REMOVED
            // Instead of inserting template directly, show the modal
            // console.log("[EditorUtils.insertTable] Calling showTableModal..."); // DEBUG REMOVED
            this.showTableModal();
        },

        generateTableMarkdown: function(rows, cols) {
            if (rows < 1 || cols < 1) return ''; // Basic validation
            // console.log(`[generateTableMarkdown] Generating table with rows=${rows}, cols=${cols}`); // DEBUG REMOVED

            let markdown = '';

            // Header row
            markdown += '|';
            for (let j = 0; j < cols; j++) {
                markdown += ` Header ${j + 1} |`;
            }
            markdown += '\n'; // Use actual newline

            // Separator row
            markdown += '|';
            for (let j = 0; j< cols; j++) {
                markdown += '---|';
            }
            markdown += '\n'; // Use actual newline

            // console.log(`[generateTableMarkdown] Starting data row loop (original: i = 1; i < ${rows}; i++)`); // DEBUG REMOVED
            // Data rows: Reverting to original logic (rows - 1 data rows)
            // console.log(`[generateTableMarkdown] Applying corrected loop (i = 1; i <= ${rows} - 2; i++)`); // DEBUG REMOVED
             for (let i = 1; i < rows; i++) { // REVERTED to original loop
                // console.log(`[generateTableMarkdown] Generating data row i=${i}`); // DEBUG REMOVED
                markdown += '|';
                for (let j = 0; j < cols; j++) {
                    markdown += '          |'; // Add padding for alignment
                }
                markdown += '\n'; // Use actual newline
            }
            // console.log(`[generateTableMarkdown] Finished data row loop.`); // DEBUG REMOVED
            return markdown.trim(); // Trim trailing newline
        },

        insertGeneratedTable: function(rows, cols) {
            const doc = editor.getDoc();
            const cursor = doc.getCursor();
            const insertPos = { line: cursor.line, ch: cursor.ch };
            const lineContent = doc.getLine(insertPos.line);
            const tableMarkdown = this.generateTableMarkdown(rows, cols);
            // console.log("[insertGeneratedTable] Generated Markdown:\n", tableMarkdown); // DEBUG REMOVED

            if (!tableMarkdown) {
                console.error("Failed to generate table markdown.");
                return; // Don't insert if generation failed
            }

            let textToInsert = "";
            let targetLineOffset = rows; // Header + Separator + Data rows = row count

            if (insertPos.ch === 0 || (insertPos.ch > 0 && lineContent.trim() === "")) {
                if (insertPos.ch > 0) insertPos.ch = 0; // Force start if line is effectively empty
                textToInsert = tableMarkdown + "\n";
                targetLineOffset = rows -1; // Target line is last data row (0-indexed)
            } else {
                textToInsert = "\n" + tableMarkdown + "\n";
                targetLineOffset = rows; // Target line is last data row after the initial newline
            }


            editor.operation(() => {
                const startLine = insertPos.line;
                doc.replaceRange(textToInsert, insertPos);
                const targetLineNum = startLine + targetLineOffset;

                 try { // Select first data cell content (similar logic to original insertTable)
                    const dataStartLine = startLine + (textToInsert.startsWith('\n') ? 3 : 2); // Line index of the first data row
                    if (dataStartLine < doc.lineCount()){
                        const lineText = doc.getLine(dataStartLine);
                        const firstPipeIndex = lineText.indexOf('|');
                        const secondPipeIndex = lineText.indexOf('|', firstPipeIndex + 1);
                        if (firstPipeIndex !== -1 && secondPipeIndex !== -1) {
                            const firstCellStartCh = firstPipeIndex + 1;
                            const firstCellEndCh = secondPipeIndex;
                            // Trim whitespace for selection
                            const trimmedStart = lineText.substring(firstCellStartCh, firstCellEndCh).search(/\S|$/) + firstCellStartCh;
                            const trimmedEnd = lineText.substring(firstCellStartCh, firstCellEndCh).search(/\s*$/) + firstCellStartCh;
                            editor.setSelection(
                                { line: dataStartLine, ch: trimmedStart },
                                { line: dataStartLine, ch: trimmedEnd }
                            );
                        } else if (firstPipeIndex !== -1) { // Fallback: cursor after first pipe
                            editor.setCursor({ line: dataStartLine, ch: firstPipeIndex + 1 });
                        } else { // Fallback: cursor at line start
                            editor.setCursor({ line: dataStartLine, ch: 0 });
                        }
                    } else {
                         editor.setCursor({ line: targetLineNum, ch: 0 }); // Fallback if no data rows
                    }

                } catch (e) {
                     console.error(`[insertGeneratedTable] Error setting selection on line ${targetLineNum}:`, e);
                     editor.setCursor(insertPos); // Fallback cursor
                }
            });
            editor.focus();
        },

        // --- Modal Control ---
        showTableModal: function() {
            // console.log("[EditorUtils.showTableModal] Function called."); // DEBUG REMOVED
            if (!tableModal) {
                // console.error("[EditorUtils.showTableModal] tableModal element is null!"); // DEBUG REMOVED
                return;
            }
            // console.log("[EditorUtils.showTableModal] tableModal element found:", tableModal); // DEBUG REMOVED
            tableModalError.textContent = ''; // Clear previous errors
            tableModalError.style.display = 'none';
            // Reset default values if desired, or keep last entered? Keep for now.
            // tableRowsInput.value = 3;
            // tableColsInput.value = 2;
            tableModal.classList.add('active');
            tableRowsInput.focus(); // Focus on the first input
            tableRowsInput.select();
        },

        hideTableModal: function() {
            if (!tableModal) return;
            tableModal.classList.remove('active');
            editor.focus(); // Return focus to the editor
        },

        // --- Selection Helpers ---
        getNormalizedSelection: function(doc, selection) {
            const from = doc.posFromIndex(Math.min(doc.indexFromPos(selection.anchor), doc.indexFromPos(selection.head)));
            const to = doc.posFromIndex(Math.max(doc.indexFromPos(selection.anchor), doc.indexFromPos(selection.head)));
            return { rangeStart: from, rangeEnd: to };
        },

        adjustSelection: function(doc, selection, changes, selIndexForLog = 'N/A') { // Keep logs for now, complex function
            // console.log(`[adjustSelection Sel ${selIndexForLog}] Adjusting:`, JSON.parse(JSON.stringify(selection)), " based on changes:", JSON.parse(JSON.stringify(changes))); // Keep detailed log
            let finalAnchor = { ...selection.anchor };
            let finalHead = { ...selection.head };
            const sortedChanges = [...changes].sort((a, b) => a.lineNumber - b.lineNumber);
            // console.log(`[adjustSelection Sel ${selIndexForLog}] Sorted changes:`, JSON.parse(JSON.stringify(sortedChanges))); // Keep detailed log

            sortedChanges.forEach((change, changeIndex) => {
                const charDelta = change.newPrefix.length - change.oldPrefix.length;
                // console.log(`[adjustSelection Sel ${selIndexForLog} Change ${changeIndex}] Processing change:`, change, ` Char Delta: ${charDelta}`); // Keep detailed log

                // Adjust Anchor
                if (change.lineNumber === finalAnchor.line) {
                    if (finalAnchor.ch >= change.oldPrefix.length) {
                        // const originalAnchorCh = finalAnchor.ch;
                        finalAnchor.ch = Math.max(change.newPrefix.length, finalAnchor.ch + charDelta);
                        // console.log(`[adjustSelection ... Anchor (>= oldPrefix)] Orig ch: ${originalAnchorCh}, New ch: ${finalAnchor.ch}`); // Keep detailed log
    } else {
                        // const originalAnchorCh = finalAnchor.ch;
                        finalAnchor.ch = change.newPrefix.length;
                        // console.log(`[adjustSelection ... Anchor (< oldPrefix)] Orig ch: ${originalAnchorCh}, New ch: ${finalAnchor.ch}`); // Keep detailed log
                    }
                } // Line adjustment not handled yet

                // Adjust Head (same logic)
                if (change.lineNumber === finalHead.line) {
                   if (finalHead.ch >= change.oldPrefix.length) {
                       // const originalHeadCh = finalHead.ch;
                       finalHead.ch = Math.max(change.newPrefix.length, finalHead.ch + charDelta);
                       // console.log(`[adjustSelection ... Head (>= oldPrefix)] Orig ch: ${originalHeadCh}, New ch: ${finalHead.ch}`); // Keep detailed log
    } else {
                       // const originalHeadCh = finalHead.ch;
                       finalHead.ch = change.newPrefix.length;
                       // console.log(`[adjustSelection ... Head (< oldPrefix)] Orig ch: ${originalHeadCh}, New ch: ${finalHead.ch}`); // Keep detailed log
                   }
                } // Line adjustment not handled yet
            });

            // console.log(`[adjustSelection Sel ${selIndexForLog}] Final Anchor/Head:`, finalAnchor, finalHead); // Keep detailed log
            return { anchor: finalAnchor, head: finalHead };
    }
    }; // End EditorUtils

    // =========================================================================
    // Theme Management
    // =========================================================================
    const ThemeManager = {
        storageKey: THEME_STORAGE_KEY,
        bodyEl: bodyElement,
        toggleButton: themeToggleButton,
        // NEW: Icon elements
        iconSun: themeIconSun,
        iconMoon: themeIconMoon,

        _updateIcon: function(theme) {
            if (this.iconSun && this.iconMoon) {
                if (theme === 'dark') {
                    this.iconSun.style.display = 'none';
                    this.iconMoon.style.display = 'inline-block'; // Or 'block'
                } else {
                    this.iconSun.style.display = 'inline-block'; // Or 'block'
                    this.iconMoon.style.display = 'none';
                }
            }
        },

        applyTheme: function(theme) {
            // === DEBUGGING START ===
            console.log(`[applyTheme] Called with theme: ${theme}. Current body class: '${this.bodyEl.className}'`);
            // === DEBUGGING END ===
            this.bodyEl.classList.remove('light-theme', 'dark-theme'); // Ensure clean slate
            // === DEBUGGING START ===
            console.log(`[applyTheme] After remove, body class: '${this.bodyEl.className}'`);
            // === DEBUGGING END ===
            this.bodyEl.classList.add(theme + '-theme'); // Add the new theme class
            // === DEBUGGING START ===
            console.log(`[applyTheme] After add '${theme}-theme', body class: '${this.bodyEl.className}'`);
            // === DEBUGGING END ===
            currentTheme = theme; // Update global state
            localStorage.setItem(this.storageKey, theme);

            // Update CodeMirror theme
            if (editor) {
                editor.setOption("theme", theme === 'dark' ? 'material-darker' : 'material-lighter');
            }

            // Update toggle button state and icon (NEW)
            if (this.toggleButton) {
                 this.toggleButton.setAttribute('aria-pressed', theme === 'dark');
                 this._updateIcon(theme); // Update icon based on the applied theme
            }

            console.log(`Theme applied: ${theme}`);
        },

        toggle: function() {
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(newTheme);
        },

        init: function() {
            const savedTheme = localStorage.getItem(this.storageKey);
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

            // Ensure elements exist before trying to access them
            if (!this.bodyEl) {
                console.error('ThemeManager init failed: body element not found.');
                return;
            }
            if (this.toggleButton && (!this.iconSun || !this.iconMoon)) {
                console.warn('ThemeManager init: Theme icons not found within the toggle button.');
                // Continue initialization, but icon switching won't work
            }

            console.log(`Initializing theme. Saved: ${savedTheme}, PrefersDark: ${prefersDark}, Initial: ${initialTheme}`);
            this.applyTheme(initialTheme);

            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                // Only change if no theme preference is saved
                if (!localStorage.getItem(this.storageKey)) {
                    console.log('System theme changed, applying new theme.');
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });

            // Add click listener to the toggle button if it exists
            if (this.toggleButton) {
                this.toggleButton.addEventListener('click', () => this.toggle());
            }
        }
    };

    // =========================================================================
    // Content Storage (LocalStorage)
    // =========================================================================
    const StorageManager = {
        loadContent: function() {
            try {
                const savedMarkdown = localStorage.getItem(CONTENT_STORAGE_KEY);
                if (savedMarkdown !== null && editor) {
                    editor.setValue(savedMarkdown);
                    console.log("Restored content from localStorage into CodeMirror.");
                }
                } catch (e) {
                console.error("Error reading content from localStorage:", e);
                }
        },
        saveContent: function() {
            if (!editor) return;
            try {
                localStorage.setItem(CONTENT_STORAGE_KEY, editor.getValue());
            } catch (e) {
                console.error("Error saving content to localStorage:", e);
            }
        },

        // --- Settings (NEW) ---
        loadSettings: function() {
            try {
                const savedSettings = localStorage.getItem(EDITOR_SETTINGS_KEY);
                if (savedSettings) {
                    const parsedSettings = JSON.parse(savedSettings);
                    // Merge saved settings with defaults to handle missing keys
                    editorSettings = { ...DEFAULT_EDITOR_SETTINGS, ...parsedSettings };
                    console.log("Loaded editor settings from localStorage:", editorSettings);
                } else {
                    editorSettings = { ...DEFAULT_EDITOR_SETTINGS };
                    console.log("No saved settings found, using defaults.");
                }
            } catch (e) {
                console.error("Error loading or parsing editor settings from localStorage:", e);
                editorSettings = { ...DEFAULT_EDITOR_SETTINGS }; // Fallback to defaults
                console.log("Falling back to default settings due to error.");
            }
        },

        saveSettings: function() {
            try {
                localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(editorSettings));
                console.log("Saved editor settings to localStorage:", editorSettings);
            } catch (e) {
                console.error("Error saving editor settings to localStorage:", e);
            }
        }
    };

    // =========================================================================
    // Preview Update Logic
    // =========================================================================
    const PreviewUpdater = {
        update: function() {
            if (!editor || !previewArea) return;
            const markdownText = editor.getValue();
            try {
            const rawHtml = marked.parse(markdownText);
            const cleanHtml = DOMPurify.sanitize(rawHtml);
            previewArea.innerHTML = cleanHtml;
            if (typeof hljs !== 'undefined') {
                previewArea.querySelectorAll('pre code').forEach((block) => {
                        try { hljs.highlightElement(block); }
                        catch (highlightError) { console.error("Error highlighting code block:", highlightError); }
                });
            }
        } catch (error) {
            console.error("Error during Markdown processing or rendering:", error);
            previewArea.innerHTML = `<p style="color: red;">预览渲染时发生内部错误。请检查 Markdown 语法或稍后重试。</p>`;
        }
        },
        debouncedUpdate: null // Will be assigned after debounce is defined in scope
    };
    PreviewUpdater.debouncedUpdate = debounce(PreviewUpdater.update, DEBOUNCE_DELAY);

    // =========================================================================
    // Status Bar Logic
    // =========================================================================
    function updateStatusCounts() {
        if (!editor || !charCountElement || !wordCountElement) {
            // console.warn("Cannot update status counts: editor or elements missing.");
            return; // Exit if editor or elements aren't ready
        }
        try {
            const content = editor.getValue();
            const charCount = content.length;
            // Word count based on splitting by whitespace
            const wordCount = (content.trim() === '') ? 0 : (content.split(/\s+/).filter(Boolean).length);

            charCountElement.textContent = charCount;
            wordCountElement.textContent = wordCount;
        } catch (error) {
            console.error("Error updating status counts:", error);
            // Optionally reset counts or display an error indicator
            charCountElement.textContent = '-';
            wordCountElement.textContent = '-';
        }
    }

    // Debounced version for frequent updates
    const debouncedUpdateStatusCounts = debounce(updateStatusCounts, DEBOUNCE_DELAY * 2); // Slightly longer delay for status

    // =========================================================================
    // Modal Handling Logic (Generic + Settings)
    // =========================================================================
    const ModalManager = {
        // Generic function to show a modal
        showModal: function(modalElement) {
            if (modalElement) {
                modalElement.classList.add('active');
                modalElement.setAttribute('aria-hidden', 'false'); // Make it visible to screen readers
                // Focus the first focusable element inside? (Optional enhancement)
                // Find first focusable element logic (simplified):
                const focusableElements = modalElement.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }

            } else {
                console.error("Attempted to show a non-existent modal.");
            }
        },

        // Generic function to hide a modal
        hideModal: function(modalElement) {
            if (modalElement) {
                modalElement.classList.remove('active');
                modalElement.setAttribute('aria-hidden', 'true'); // Hide it from screen readers
            } else {
                console.error("Attempted to hide a non-existent modal.");
            }
        },

        // Initialize listeners for a specific modal
        setupModalListeners: function(modalElement, openTrigger, closeTriggers) {
            if (!modalElement || !openTrigger) return; // Need both modal and trigger

            openTrigger.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering window listener
                this.showModal(modalElement);
                openTrigger.setAttribute('aria-expanded', 'true'); // Update trigger state
            });

            // Combine all close actions
            const closeAction = (e) => {
                e.stopPropagation();
                this.hideModal(modalElement);
                openTrigger.setAttribute('aria-expanded', 'false'); // Update trigger state
                openTrigger.focus(); // Return focus to the trigger button
            };

            closeTriggers.forEach(trigger => {
                if (trigger) {
                    trigger.addEventListener('click', closeAction);
                }
            });

            // Close on backdrop click
            modalElement.addEventListener('click', (event) => {
                if (event.target === modalElement) { // Clicked directly on the backdrop
                    closeAction(event);
                }
            });
        },

        // Close on Escape key
        setupGlobalModalKeyListener: function() {
            window.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    const activeModals = document.querySelectorAll('.modal.active');
                    activeModals.forEach(modal => {
                         // Find the corresponding trigger button to update aria-expanded and focus
                         let triggerButton = null;
                         if (modal.id === 'table-modal' && toolbarButtons.table) {
                             triggerButton = toolbarButtons.table;
                         } else if (modal.id === 'settings-modal' && settingsToggleButton) {
                             triggerButton = settingsToggleButton;
                         } else if (modal.id === 'shortcuts-modal' && helpButton) { // Handle new modal
                             triggerButton = helpButton;
                         }

                        this.hideModal(modal);
                        if (triggerButton) {
                            triggerButton.setAttribute('aria-expanded', 'false');
                            triggerButton.focus(); // Return focus on Escape
                        }
                    });
                }
            });
        }
    };

    // =========================================================================
    // CodeMirror Configuration & Initialization
    // =========================================================================
    function initializeEditor() {
        if (!markdownInput) return;
        console.log("Initializing CodeMirror...");

        // Load settings before initializing editor to use them
        // StorageManager.loadSettings(); // Already called in initializeApp

        // Determine initial theme based on body class (set by ThemeManager.init)
        const initialTheme = bodyElement.classList.contains('dark-theme') ? 'material-darker' : 'material-lighter';

        try {
            editor = CodeMirror.fromTextArea(markdownInput, {
                mode: 'markdown',
                // lineNumbers: true, // Set based on loaded settings
                // lineWrapping: true, // Set based on loaded settings
                smartIndent: true, // Explicitly enable smart indent
                theme: initialTheme, // Use the determined initial theme
                extraKeys: {
                    // Add Enter key binding for list continuation
                    'Enter': 'newlineAndIndentContinueMarkdownList',
                    // Explicitly map Tab and Shift-Tab to standard indent commands - REVERTING THIS
                    // 'Tab': 'indentMore',
                    // 'Shift-Tab': 'indentLess',
                    "Ctrl-B": () => EditorUtils.wrapText('**'),
                    "Cmd-B": () => EditorUtils.wrapText('**'),
                    "Ctrl-I": () => EditorUtils.wrapText('*'),
                    "Cmd-I": () => EditorUtils.wrapText('*'),
                    "Ctrl-'": () => EditorUtils.toggleBlockquote(),
                    "Cmd-'": () => EditorUtils.toggleBlockquote(),
                    "Ctrl-Shift-S": () => EditorUtils.wrapText('~~'),
                    "Cmd-Shift-S": () => EditorUtils.wrapText('~~'),
                    "Ctrl-Shift-L": () => EditorUtils.toggleListItem(),
                    "Cmd-Shift-L": () => EditorUtils.toggleListItem(),
                    "Ctrl-Shift-O": () => EditorUtils.toggleOrderedListItem(),
                    "Cmd-Shift-O": () => EditorUtils.toggleOrderedListItem(),
                    "Ctrl-Shift-H": () => EditorUtils.toggleHeading(),
                    "Cmd-Shift-H": () => EditorUtils.toggleHeading(),
                    "Ctrl-Shift-C": () => EditorUtils.toggleCodeBlock(),
                    "Cmd-Shift-C": () => EditorUtils.toggleCodeBlock(),
                    "Ctrl-Shift-": () => EditorUtils.insertHorizontalRule(),
                    "Cmd-Shift-": () => EditorUtils.insertHorizontalRule(),
                    "Ctrl-Shift-T": () => EditorUtils.showTableModal(), // Show modal, don't insert directly
                    "Cmd-Shift-T": () => EditorUtils.showTableModal(),
                    "Ctrl-K": () => EditorUtils.insertLink(),
                    "Cmd-K": () => EditorUtils.insertLink(),

                    // Newly Added Shortcuts:
                    "Ctrl-O": () => EditorUtils.triggerImport(),
                    "Cmd-O": () => EditorUtils.triggerImport(),
                    "Ctrl-Alt-S": () => EditorUtils.exportMarkdown(), // Avoids Ctrl+S conflict
                    "Cmd-Alt-S": () => EditorUtils.exportMarkdown(),
                    "Ctrl-Shift-E": () => EditorUtils.exportHtml(),
                    "Cmd-Shift-E": () => EditorUtils.exportHtml(),
                    "Alt-L": () => EditorUI.toggleLineNumbers(),
                    "Alt-W": () => EditorUI.toggleLineWrapping(),
                    "Ctrl-=": () => EditorUI.increaseFontSize(),
                    "Cmd-=": () => EditorUI.increaseFontSize(),
                    "Ctrl-": () => EditorUI.decreaseFontSize(),
                    "Cmd-": () => EditorUI.decreaseFontSize(),
                    "Alt-T": () => ThemeManager.toggle(),

                    // Undo/Redo handled by default or explicitly if needed
                    // "Ctrl-Z": () => editor.undo(),
                    // "Cmd-Z": () => editor.undo(),
                    // "Ctrl-Y": () => editor.redo(),
                    // "Cmd-Y": () => editor.redo(),
                    // "Shift-Ctrl-Z": () => editor.redo(),
                    // "Shift-Cmd-Z": () => editor.redo()
                },
                // Apply loaded settings
                lineNumbers: editorSettings.lineNumbers,
                lineWrapping: editorSettings.lineWrapping,
                // Tab behavior will be applied by EditorUI.applyTabBehavior below
            });

            // Add aria-label to CodeMirror wrapper after initialization
            const cmWrapper = editor.getWrapperElement();
            if (cmWrapper) {
                cmWrapper.setAttribute('aria-label', 'Markdown 编辑器输入区域');
                 // Optional: Add role="application" or role="textbox" - check best practices
                 // cmWrapper.setAttribute('role', 'application'); 
            }

            // Apply initial tab behavior (NEW)
            EditorUI.applyTabBehavior(editorSettings.tabBehavior);

            // Load content from localStorage AFTER editor is created
            StorageManager.loadContent();

            // Debounced preview update and save
            const debouncedUpdateAndSave = debounce(() => {
                PreviewUpdater.update();
                StorageManager.saveContent();
                updateStatusCounts(); // Update counts on change
            }, DEBOUNCE_DELAY);

            // Initial update
            PreviewUpdater.update();
            updateStatusCounts(); // Initial counts

            editor.on('change', () => {
                debouncedUpdateAndSave();
            });

            // Debounced toolbar state update for ARIA
            const debouncedUpdateToolbarStates = debounce(() => {
                EditorUI.updateToolbarButtonStates();
            }, DEBOUNCE_DELAY + 50); // Slightly longer delay than preview

            // Update toolbar state when cursor moves or selection changes
            editor.on('cursorActivity', () => {
                debouncedUpdateToolbarStates();
            });

            // Initial toolbar state update
            EditorUI.updateToolbarButtonStates();

            console.log("CodeMirror initialized successfully.");
            console.log("Initial editor settings applied:", editorSettings); // Log applied settings

        } catch (err) {
            console.error('Error initializing CodeMirror:', err);
            markdownInput.style.display = 'block'; // Show textarea as fallback
             if (previewArea) {
                previewArea.innerHTML = '<p style="color: red; font-weight: bold;">CodeMirror 编辑器初始化失败。请检查控制台。将回退到普通文本区域。</p>';
            }
        }
    }

    // =========================================================================
    // Event Listener Setup
    // =========================================================================
    function setupEventListeners() {
        console.log("Setting up event listeners...");

        // Theme Toggle
        /* REMOVED: Redundant listener. ThemeManager.init() handles this.
        if (themeToggleButton) {
            // Wrap in arrow function to preserve 'this' for ThemeManager instance methods
            themeToggleButton.addEventListener('click', () => ThemeManager.toggle());
        } else {
             console.warn('Theme toggle button listener not attached: element not found.');
        }
        */

        // Editor Change listener is now set within initializeEditor after editor is created

        // Toolbar Buttons
        if (toolbarButtons.bold) toolbarButtons.bold.addEventListener('click', () => EditorUtils.wrapText('**'));
        if (toolbarButtons.italic) toolbarButtons.italic.addEventListener('click', () => EditorUtils.wrapText('*'));
        if (toolbarButtons.strike) toolbarButtons.strike.addEventListener('click', () => EditorUtils.wrapText('~~'));
        // FIX: Wrap calls in arrow functions to preserve 'this' context for EditorUtils
        if (toolbarButtons.link) toolbarButtons.link.addEventListener('click', () => EditorUtils.insertLink());
        if (toolbarButtons.quote) toolbarButtons.quote.addEventListener('click', () => EditorUtils.toggleBlockquote());
        if (toolbarButtons.ul) toolbarButtons.ul.addEventListener('click', () => EditorUtils.toggleListItem());
        if (toolbarButtons.ol) toolbarButtons.ol.addEventListener('click', () => EditorUtils.toggleOrderedListItem());
        if (toolbarButtons.heading) toolbarButtons.heading.addEventListener('click', () => EditorUtils.toggleHeading());
        if (toolbarButtons.code) toolbarButtons.code.addEventListener('click', () => EditorUtils.toggleCodeBlock());
        if (toolbarButtons.hr) toolbarButtons.hr.addEventListener('click', () => EditorUtils.insertHorizontalRule()); // Already an arrow func likely ok, but standardize
        if (toolbarButtons.table) toolbarButtons.table.addEventListener('click', () => EditorUtils.showTableModal()); // Already an arrow func likely ok, but standardize
        if (toolbarButtons.undo) toolbarButtons.undo.addEventListener('click', () => { editor.undo(); editor.focus(); });
        if (toolbarButtons.redo) toolbarButtons.redo.addEventListener('click', () => { editor.redo(); editor.focus(); });

        // File Operations Buttons
        if (toolbarButtons.importMd) toolbarButtons.importMd.addEventListener('click', EditorUtils.triggerImport);
        if (toolbarButtons.exportMd) toolbarButtons.exportMd.addEventListener('click', () => EditorUtils.exportMarkdown());
        if (toolbarButtons.exportHtml) toolbarButtons.exportHtml.addEventListener('click', () => EditorUtils.exportHtml());

        // File Input Listener
        if (importFileInput) {
            importFileInput.addEventListener('change', EditorUtils._handleImport);
        } else {
            console.warn('Import file input listener not attached: element not found.');
        }

        // Table Modal Listeners (Needs modification to use ModalManager correctly)
        if (toolbarButtons.table && tableModal && tableModalClose && tableModalConfirm && tableModalCancel) {
             // Use ModalManager to handle open/close triggers and ARIA states
             ModalManager.setupModalListeners(
                 tableModal,
                 toolbarButtons.table, // The trigger button
                 [tableModalClose, tableModalCancel] // Standard close buttons
             );

             // Handle Confirm separately as it doesn't just close
             tableModalConfirm.addEventListener('click', () => {
                 const rows = parseInt(tableRowsInput.value, 10);
                 const cols = parseInt(tableColsInput.value, 10);

                 if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
                     tableModalError.textContent = '请输入有效的正整数行数和列数。';
                     tableModalError.style.display = 'block';
                     tableModalError.setAttribute('aria-hidden', 'false'); // Show error message
                 } else {
                     tableModalError.style.display = 'none';
                     tableModalError.setAttribute('aria-hidden', 'true'); // Hide error message
                     ModalManager.hideModal(tableModal); // Use manager to hide
                     toolbarButtons.table.setAttribute('aria-expanded', 'false'); // Update trigger state
                     toolbarButtons.table.focus(); // Return focus
                     EditorUtils.insertGeneratedTable(rows, cols);
                 }
             });

            // Handle Enter key in modal inputs (Keep existing logic, but use ModalManager to hide on Escape)
            if (tableRowsInput) {
                tableRowsInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        tableModalConfirm.click();
                    } else if (event.key === 'Escape') {
                        // ModalManager's global listener handles Escape now
                        // ModalManager.hideModal(tableModal); // Redundant
                        // toolbarButtons.table.setAttribute('aria-expanded', 'false'); // Redundant
                        // toolbarButtons.table.focus(); // Redundant
                    }
                });
            }
             if (tableColsInput) {
                 tableColsInput.addEventListener('keydown', (event) => {
                     if (event.key === 'Enter') {
                         event.preventDefault();
                         tableModalConfirm.click();
                     } else if (event.key === 'Escape') {
                         // ModalManager's global listener handles Escape now
                     }
                 });
             }
            // Add ARIA hidden update for error message initially
            if (tableModalError) {
                 tableModalError.setAttribute('aria-hidden', 'true');
            }

        } else {
            console.warn('Warning: Table modal elements not fully found! Interactive table generation might fail.');
        }

        // Settings Modal Listeners (Using the updated ModalManager)
        if (settingsToggleButton && settingsModal && settingsModalClose && settingsModalCloseBtn) {
            ModalManager.setupModalListeners(
                settingsModal,
                settingsToggleButton, // Pass the trigger
                [settingsModalClose, settingsModalCloseBtn] // Pass close elements
            );
            // Note: Global Esc listener setup called only once later
        } else {
            console.warn('Warning: Settings modal elements not fully found! Settings might not work.');
        }

        // Settings Controls Listeners (NEW)
        if (settingLineNumbers) {
            settingLineNumbers.addEventListener('change', () => {
                const isChecked = settingLineNumbers.checked;
                if (editor) {
                    editor.setOption('lineNumbers', isChecked);
                }
                editorSettings.lineNumbers = isChecked;
                StorageManager.saveSettings();
            });
        } else {
            console.warn('Listener for Line Numbers setting not attached.');
        }

        // Line Wrapping setting listener (NEW)
        if (settingLineWrapping) {
            settingLineWrapping.addEventListener('change', () => {
                const isChecked = settingLineWrapping.checked;
                if (editor) {
                    editor.setOption('lineWrapping', isChecked);
                }
                editorSettings.lineWrapping = isChecked;
                StorageManager.saveSettings();
            });
        } else {
             console.warn('Listener for Line Wrapping setting not attached.');
        }

        // Font Size setting listener (NEW)
        if (settingFontSize) {
            settingFontSize.addEventListener('change', () => {
                const selectedSize = settingFontSize.value;
                EditorUI.applyFontSize(selectedSize);
                editorSettings.fontSize = selectedSize;
                StorageManager.saveSettings();
            });
        } else {
            console.warn('Listener for Font Size setting not attached.');
        }

        // NEW: Tab Behavior setting listener
        if (settingTabBehavior) {
            settingTabBehavior.addEventListener('change', () => {
                const selectedBehavior = settingTabBehavior.value;
                EditorUI.applyTabBehavior(selectedBehavior);
                editorSettings.tabBehavior = selectedBehavior;
                StorageManager.saveSettings();
            });
        } else {
             console.warn('Listener for Tab Behavior setting not attached.');
        }

        // Shortcuts Help Modal Listeners (NEW)
        if (helpButton && shortcutsModal && shortcutsModalClose && shortcutsModalCloseBtn) {
            // Use ModalManager for basic open/close/ARIA handling
            ModalManager.setupModalListeners(
                shortcutsModal,
                helpButton, // Trigger button
                [shortcutsModalClose, shortcutsModalCloseBtn] // Close buttons
            );

            // Override the simple showModal in setupModalListeners with our loading logic
            helpButton.removeEventListener('click', ModalManager.showModal); // Remove default listener added by setup
            helpButton.addEventListener('click', (e) => {
                e.stopPropagation();
                ShortcutsHelp.loadAndShow();
                 // ARIA expanded state is now handled here and in ModalManager.closeAction
                 helpButton.setAttribute('aria-expanded', 'true'); 
            });

             // Ensure close actions also reset the expanded state on the trigger
             const helpCloseAction = (e) => {
                e.stopPropagation();
                ModalManager.hideModal(shortcutsModal);
                helpButton.setAttribute('aria-expanded', 'false');
                helpButton.focus();
             };
             // Re-add listeners with the correct close action for this modal
             [shortcutsModalClose, shortcutsModalCloseBtn].forEach(trigger => {
                 if(trigger) {
                    // May need to remove listener added by setupModalListeners first if it causes issues
                    // trigger.removeEventListener('click', ??? ); // Need reference to the function added by setupModalListeners
                    // For simplicity, let's assume ModalManager.setupModalListeners used OUR closeAction
                    // If not, we need to adjust ModalManager or manually handle close here
                     trigger.removeEventListener('click', ModalManager.closeAction); // Assuming this was the one added
                     trigger.addEventListener('click', helpCloseAction);
                 }
             });
              shortcutsModal.addEventListener('click', (event) => {
                 if (event.target === shortcutsModal) { // Clicked directly on the backdrop
                     helpCloseAction(event);
                 }
             });

        } else {
            console.warn('Warning: Shortcuts help modal elements not fully found! Help might not work.');
        }

        // Setup Global Escape Listener (Call ONCE)
        ModalManager.setupGlobalModalKeyListener();

        console.log("Event listeners set up (including table modal, settings modal, and shortcuts help modal).");
    }

    // =========================================================================
    // Editor UI Helpers (NEW Section)
    // =========================================================================
    const EditorUI = {
        applyFontSize: function(sizeValue) {
            if (!editor) return;
            const cmElement = editor.getWrapperElement();
            cmElement.classList.remove('cm-font-small', 'cm-font-medium', 'cm-font-large');
            switch (sizeValue) {
                case 'small':
                    cmElement.classList.add('cm-font-small');
                    break;
                case 'large':
                    cmElement.classList.add('cm-font-large');
                    break;
                case 'medium': // Default
                default:
                    cmElement.classList.add('cm-font-medium');
                    break;
            }
            console.log(`Applied font size class: cm-font-${sizeValue}`);
        },

        // NEW: Apply Tab Behavior to CodeMirror
        applyTabBehavior: function(behaviorValue) {
            if (!editor) return;
            let indentUnit = 4; // Default to 4 spaces
            let indentWithTabs = false;

            switch (behaviorValue) {
                case 'tabs':
                    indentWithTabs = true;
                    // indentUnit: CodeMirror's default tab size is usually 4, but we can be explicit
                    indentUnit = 4; 
                    break;
                case 'spaces-2':
                    indentWithTabs = false;
                    indentUnit = 2;
                    break;
                case 'spaces-4':
                default:
                    indentWithTabs = false;
                    indentUnit = 4;
                    break;
            }

            editor.setOption('indentUnit', indentUnit);
            editor.setOption('indentWithTabs', indentWithTabs);
            console.log(`Applied tab behavior: ${behaviorValue} (indentUnit: ${indentUnit}, indentWithTabs: ${indentWithTabs})`);
        },

        toggleLineNumbers: function() {
            if (!editor) return;
            const currentLineNumbers = editor.getOption('lineNumbers');
            editor.setOption('lineNumbers', !currentLineNumbers);
            editorSettings.lineNumbers = !currentLineNumbers;
            StorageManager.saveSettings();
        },

        toggleLineWrapping: function() {
            if (!editor) return;
            const currentLineWrapping = editor.getOption('lineWrapping');
            editor.setOption('lineWrapping', !currentLineWrapping);
            editorSettings.lineWrapping = !currentLineWrapping;
            StorageManager.saveSettings();
        },

        increaseFontSize: function() {
            if (!editor) return;
            const currentSize = editor.getOption('fontSize');
            const newSize = currentSize === 'large' ? 'medium' : 'large';
            editor.setOption('fontSize', newSize);
            EditorUI.applyFontSize(newSize);
            editorSettings.fontSize = newSize;
            StorageManager.saveSettings();
        },

        decreaseFontSize: function() {
            if (!editor) return;
            const currentSize = editor.getOption('fontSize');
            const newSize = currentSize === 'small' ? 'medium' : 'small';
            editor.setOption('fontSize', newSize);
            EditorUI.applyFontSize(newSize);
            editorSettings.fontSize = newSize;
            StorageManager.saveSettings();
        },

        // NEW: Update aria-pressed state for toolbar buttons
        updateToolbarButtonStates: function() {
            if (!editor) return;

            const updateButton = (button, isActive) => {
                if (button) {
                    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                    // Optional: Add/remove a visual class for active state
                    button.classList.toggle('active', isActive);
                }
            };

            try {
                const cursor = editor.getCursor();
                const token = editor.getTokenAt(cursor);
                const lineContent = editor.getLine(cursor.line);

                let isBold = false;
                let isItalic = false;
                let isStrikethrough = false;
                let isCode = false;
                let isQuote = lineContent.trimStart().startsWith('> ');
                let isUL = lineContent.trimStart().startsWith('- ');
                let isOL = /\^\s*\d+\.\s/.test(lineContent); // Matches lines like " 1. ..."
                let isHeading = /\^#+\s/.test(lineContent);

                if (token.type) {
                    const types = token.type.split(' ');
                    isBold = types.includes('strong');
                    isItalic = types.includes('em');
                    isStrikethrough = types.includes('strikethrough');
                    isCode = types.includes('comment') || types.includes('variable-2') || types.includes('string') || token.string === '`' ; // Heuristic for inline/block code
                    // Note: Heading/List/Quote detection based on token type is less reliable, use line check instead.
                }

                // Refine code detection - check if cursor is within backticks
                if (!isCode) {
                    const marks = editor.findMarksAt(cursor);
                    marks.forEach(mark => {
                        if (mark.type === 'range' && mark.className === 'cm-comment') { // Assuming inline code uses comment style
                            isCode = true;
                        }
                        // Potentially check for other mark types if CM styling changes
                    });
                }
                 // Refine bold/italic/strike detection using marks if token fails
                 const marksAtCursor = editor.findMarksAt(cursor);
                 marksAtCursor.forEach(mark => {
                    // This depends heavily on how CodeMirror internally marks these styles
                    // Check common classes or marker types associated with these styles
                    // Example (might need adjustment based on actual CM behavior):
                    // if (mark.className && mark.className.includes('strong')) isBold = true;
                    // if (mark.className && mark.className.includes('em')) isItalic = true;
                    // if (mark.className && mark.className.includes('strikethrough')) isStrikethrough = true;
                 });


                updateButton(toolbarButtons.bold, isBold);
                updateButton(toolbarButtons.italic, isItalic);
                updateButton(toolbarButtons.strike, isStrikethrough);
                updateButton(toolbarButtons.quote, isQuote);
                updateButton(toolbarButtons.ul, isUL);
                updateButton(toolbarButtons.ol, isOL);
                updateButton(toolbarButtons.heading, isHeading);
                updateButton(toolbarButtons.code, isCode);

            } catch (error) {
                console.error("Error updating toolbar button states:", error);
            }
        }
    };

    // =========================================================================
    // Shortcuts Help Logic (NEW Section)
    // =========================================================================
    const ShortcutsHelp = {
        contentLoaded: false,
        isLoading: false,

        loadAndShow: async function() {
            if (!shortcutsModalContent || this.isLoading) return;

            if (this.contentLoaded) {
                // Content already loaded, just show modal
                ModalManager.showModal(shortcutsModal);
                // Ensure trigger ARIA state is correct (ModalManager.setupModalListeners handles this on click)
                // if (helpButton) helpButton.setAttribute('aria-expanded', 'true');
                return;
            }

            this.isLoading = true;
            shortcutsModalContent.innerHTML = '<p>正在加载快捷键列表...</p>';
            ModalManager.showModal(shortcutsModal);
            // Ensure trigger ARIA state is correct (ModalManager.setupModalListeners handles this on click)
            // if (helpButton) helpButton.setAttribute('aria-expanded', 'true');

            try {
                const response = await fetch('static/docs/shortcuts.md');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const markdownContent = await response.text();

                // Check if marked and DOMPurify are available
                if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
                     throw new Error('marked.js or DOMPurify library not loaded.');
                }

                const rawHtml = marked.parse(markdownContent);
                const cleanHtml = DOMPurify.sanitize(rawHtml);

                shortcutsModalContent.innerHTML = cleanHtml;
                this.contentLoaded = true;
                console.log("Shortcuts help loaded and rendered.");

            } catch (error) {
                console.error('Error loading or rendering shortcuts help:', error);
                shortcutsModalContent.innerHTML = '<p style="color: red;">无法加载快捷键帮助文档。请稍后再试。</p>';
                this.contentLoaded = false; // Allow retry
            } finally {
                this.isLoading = false;
            }
        }
    };

    // =========================================================================
    // Initialization Sequence
    // =========================================================================
    function initializeApp() {
        if (runChecks()) {
            StorageManager.loadSettings(); // Load settings BEFORE initializing editor (NEW)
            initializeEditor();
            ThemeManager.init(); // Initialize theme (applies saved theme to editor too)
            // StorageManager.loadContent(); // Moved inside initializeEditor

            // Update UI controls to reflect loaded settings (NEW)
            if (settingLineNumbers) {
                settingLineNumbers.checked = editorSettings.lineNumbers;
            }
            if (settingLineWrapping) { // NEW
                settingLineWrapping.checked = editorSettings.lineWrapping;
            }
            if (settingFontSize) { // NEW
                settingFontSize.value = editorSettings.fontSize;
                // Apply the font size class on initial load
                EditorUI.applyFontSize(editorSettings.fontSize);
            }
            // NEW: Set initial Tab Behavior select value
            if (settingTabBehavior) {
                settingTabBehavior.value = editorSettings.tabBehavior;
                // No need to call applyTabBehavior here, initializeEditor already does it.
            }

            setupEventListeners();
            // PreviewUpdater.update(); // Called initially inside initializeEditor
            if (editor) editor.focus(); // Focus editor on load
            console.log("Application initialized successfully.");
        } else {
            console.error("Application initialization failed due to missing elements or libraries.");
            if (previewArea) { // Check if preview area exists to display the message
                previewArea.innerHTML = '<p style="color: red; font-weight: bold;">抱歉，编辑器初始化失败。请检查浏览器控制台获取详细信息。</p>';
            }
        }
    }

    initializeApp(); // Call the main init function

}); // End DOMContentLoaded 