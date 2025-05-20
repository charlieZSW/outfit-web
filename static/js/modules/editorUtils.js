import { getEditor } from './state.js';

// Helper to get normalized selection range (ensures start <= end)
function getNormalizedSelection(doc, selection) {
    let head = doc.getCursor('head');
    let anchor = doc.getCursor('anchor');
    let rangeStart = head.line < anchor.line || (head.line === anchor.line && head.ch < anchor.ch) ? head : anchor;
    let rangeEnd = head.line > anchor.line || (head.line === anchor.line && head.ch > anchor.ch) ? head : anchor;
    // Handle selection where only one line is selected but maybe backwards
    if (selection && selection.ranges && selection.ranges.length > 0) {
        let selHead = selection.ranges[0].head;
        let selAnchor = selection.ranges[0].anchor;
         rangeStart = selHead.line < selAnchor.line || (selHead.line === selAnchor.line && selHead.ch < selAnchor.ch) ? selHead : selAnchor;
         rangeEnd = selHead.line > selAnchor.line || (selHead.line === selAnchor.line && selHead.ch > selAnchor.ch) ? selHead : selAnchor;
    }
    return { rangeStart, rangeEnd };
}


/**
 * Wraps the selected text or cursor position with the given syntax markers.
 * @param {string} syntaxStart - The starting syntax marker (e.g., '**').
 * @param {string} [syntaxEnd=syntaxStart] - The ending syntax marker. Defaults to syntaxStart.
 */
export function wrapText(syntaxStart, syntaxEnd = syntaxStart) {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in wrapText");
        return;
    }
    try {
        const selection = editor.getSelection();
        const startCursor = editor.getCursor('start');
        const endCursor = editor.getCursor('end');

        editor.operation(() => {
            if (selection) {
                editor.replaceSelection(syntaxStart + selection + syntaxEnd);
                // Adjust selection to cover the original text + syntax
                editor.setSelection(
                    { line: startCursor.line, ch: startCursor.ch + syntaxStart.length },
                    { line: endCursor.line, ch: endCursor.ch + syntaxStart.length } // Adjusted end cursor calculation
                );
            } else {
                editor.replaceSelection(syntaxStart + syntaxEnd);
                editor.setCursor({ line: startCursor.line, ch: startCursor.ch + syntaxStart.length });
            }
        });
        editor.focus();
    } catch (error) {
        console.error("Error in wrapText:", error);
    }
}


/**
 * Toggles the current line(s) as an unordered list item (starts with '- ').
 */
export function toggleListItem() { // Unordered List
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in toggleListItem");
        return;
    }
    try {
        const doc = editor.getDoc();
        const selections = doc.listSelections();
        const newSelections = [];

        editor.operation(() => {
            const changes = [];
            selections.forEach((selection) => {
                const { rangeStart, rangeEnd } = getNormalizedSelection(doc, selection);
                let linesToModify = [];
                for (let i = rangeStart.line; i <= rangeEnd.line; i++) linesToModify.push(i);

                let addPrefix = true;
                // Determine if we should add or remove the prefix based on the first line
                if (linesToModify.length > 0) {
                    const firstLineContent = doc.getLine(linesToModify[0]);
                    addPrefix = !firstLineContent.trimStart().startsWith('- ');
                }

                linesToModify.forEach(lineNumber => {
                    const lineContent = doc.getLine(lineNumber);
                    const trimmedLine = lineContent.trimStart();
                    const currentIndentMatch = lineContent.match(/^(\s*)/);
                    const currentIndent = currentIndentMatch ? currentIndentMatch[1] : "";

                    if (addPrefix) {
                        // 修复:检查是否已经是有序列表,并适当转换
                        const olMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
                        if (olMatch) {
                            // 有序列表转换成无序列表,保留内容
                            const contentAfterPrefix = olMatch[2];
                            const newContent = currentIndent + '- ' + contentAfterPrefix;
                            changes.push({
                                from: { line: lineNumber, ch: 0 },
                                to: { line: lineNumber, ch: lineContent.length },
                                text: newContent
                            });
                        } 
                        // 不是有序列表也不是无序列表,添加无序列表标记
                        else if (trimmedLine && !trimmedLine.match(/^(\-|\*|\+)\s/)) {
                            const newContent = currentIndent + '- ' + trimmedLine;
                            changes.push({
                                from: { line: lineNumber, ch: 0 },
                                to: { line: lineNumber, ch: lineContent.length },
                                text: newContent
                            });
                        } 
                        // 空行处理
                        else if (!trimmedLine) {
                            // Apply to empty line if it's the only one selected
                            if (linesToModify.length === 1) {
                                changes.push({
                                    from: { line: lineNumber, ch: 0 },
                                    to: { line: lineNumber, ch: 0 },
                                    text: currentIndent + '- '
                                });
                            }
                        }
                    } else {
                        // 移除无序列表标记
                        if (trimmedLine.startsWith('- ')) {
                            const contentAfterPrefix = trimmedLine.substring(2); // Remove '- '
                            const newContent = currentIndent + contentAfterPrefix;
                            changes.push({
                                from: { line: lineNumber, ch: 0 },
                                to: { line: lineNumber, ch: lineContent.length },
                                text: newContent
                            });
                        }
                    }
                });

                // Adjust final selection based on changes (simplified approach)
                const finalLine = rangeEnd.line;
                const finalLineContent = doc.getLine(finalLine); // Re-get potentially modified line
                newSelections.push({
                    anchor: { line: rangeStart.line, ch: rangeStart.ch }, // Keep start anchor roughly
                    head: { line: finalLine, ch: finalLineContent.length } // Move head to end of last modified line
                });

            });

            // Apply changes in reverse line order to avoid messing up line numbers
            changes.sort((a, b) => b.from.line - a.from.line);
            changes.forEach(change => {
                doc.replaceRange(change.text, change.from, change.to);
            });

            // Restore selections (might need refinement for complex multi-cursor edits)
            // if (newSelections.length > 0) {
            //     doc.setSelections(newSelections);
            // }

        });
        editor.focus();
    } catch (error) {
        console.error("Error in toggleListItem:", error);
    }
}


/**
 * Toggles the current line(s) as an ordered list item (starts with '1. ').
 * Attempts to renumber subsequent list items correctly.
 */
export function toggleOrderedListItem() {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in toggleOrderedListItem");
        return;
    }
    try {
        const doc = editor.getDoc();
        const selections = doc.listSelections();
        const newSelections = [];

        editor.operation(() => {
            const changes = [];
            let renumberingStarts = new Set(); // Store lines where renumbering might be needed

            selections.forEach((selection) => {
                const { rangeStart, rangeEnd } = getNormalizedSelection(doc, selection);
                let linesToModify = [];
                for (let i = rangeStart.line; i <= rangeEnd.line; i++) linesToModify.push(i);

                let addPrefix = true;
                let initialNumber = 1;
                // Determine action based on the first line
                if (linesToModify.length > 0) {
                    const firstLineContent = doc.getLine(linesToModify[0]);
                    const olMatch = firstLineContent.trimStart().match(/^(\d+)\.\s/);
                    if (olMatch) {
                        addPrefix = false; // It's already an OL, so remove
                    } else {
                        // Check if previous line is OL to determine starting number
                        if (linesToModify[0] > 0) {
                            const prevLineContent = doc.getLine(linesToModify[0] - 1);
                            const prevOlMatch = prevLineContent.trimStart().match(/^(\d+)\.\s/);
                            if (prevOlMatch) {
                                initialNumber = parseInt(prevOlMatch[1], 10) + 1;
                            }
                        }
                    }
                }

                let currentNumber = initialNumber;
                linesToModify.forEach(lineNumber => {
                    const lineContent = doc.getLine(lineNumber);
                    const trimmedLine = lineContent.trimStart();
                    const currentIndentMatch = lineContent.match(/^(\s*)/);
                    const currentIndent = currentIndentMatch ? currentIndentMatch[1] : "";

                    if (addPrefix) {
                        // 修复:检查是否是无序列表,并适当转换
                        const ulMatch = trimmedLine.match(/^(\-|\*|\+)\s+(.*)/);
                        if (ulMatch) {
                            // 无序列表转换成有序列表,保留内容
                            const contentAfterPrefix = ulMatch[2];
                            const prefix = currentNumber + '. ';
                            const newContent = currentIndent + prefix + contentAfterPrefix;
                            changes.push({
                                from: { line: lineNumber, ch: 0 },
                                to: { line: lineNumber, ch: lineContent.length },
                                text: newContent
                            });
                            renumberingStarts.add(lineNumber + 1);
                            currentNumber++;
                        }
                        // 非列表文本转换为有序列表
                        else if (trimmedLine && !trimmedLine.match(/^\d+\.\s/)) {
                            const prefix = currentNumber + '. ';
                            const newContent = currentIndent + prefix + trimmedLine;
                            changes.push({
                                from: { line: lineNumber, ch: 0 },
                                to: { line: lineNumber, ch: lineContent.length },
                                text: newContent
                            });
                            renumberingStarts.add(lineNumber + 1);
                            currentNumber++;
                        } 
                        // 空行处理
                        else if (!trimmedLine && linesToModify.length === 1) {
                            // Apply to empty line only if it's the only selected line
                            changes.push({
                                from: { line: lineNumber, ch: 0 },
                                to: { line: lineNumber, ch: 0 },
                                text: currentIndent + currentNumber + '. '
                            });
                            renumberingStarts.add(lineNumber + 1);
                            currentNumber++;
                        }
                    } else {
                        // 移除有序列表标记
                        const olMatch = trimmedLine.match(/^(\d+)\.\s/);
                        if (olMatch) {
                            const contentAfterPrefix = trimmedLine.substring(olMatch[0].length);
                            const newContent = currentIndent + contentAfterPrefix;
                            changes.push({
                                from: { line: lineNumber, ch: 0 },
                                to: { line: lineNumber, ch: lineContent.length },
                                text: newContent
                            });
                            renumberingStarts.add(lineNumber);
                        }
                    }
                });
                // Add selection adjustment logic if needed, similar to toggleListItem
                const finalLine = rangeEnd.line;
                const finalLineContent = doc.getLine(finalLine);
                newSelections.push({
                    anchor: { line: rangeStart.line, ch: rangeStart.ch },
                    head: { line: finalLine, ch: finalLineContent.length }
                });
            });

            // Apply changes in reverse line order
            changes.sort((a, b) => b.from.line - a.from.line);
            changes.forEach(change => {
                doc.replaceRange(change.text, change.from, change.to);
            });

            // Perform renumbering after toggling prefixes
            renumberingStarts.forEach(startLine => {
                renumberOrderedList(doc, startLine);
            });

            // Restore selections (simplified)
            // if (newSelections.length > 0) {
            //     doc.setSelections(newSelections);
            // }
        });
        editor.focus();
    } catch (error) {
        console.error("Error in toggleOrderedListItem:", error);
    }
}


/**
 * Renumbers an ordered list starting from a given line.
 * @param {CodeMirror.Doc} doc - The CodeMirror document instance.
 * @param {number} startLine - The line number to start renumbering from.
 */
function renumberOrderedList(doc, startLine) {
    const editor = getEditor();
     if (!editor) {
         console.error("Editor not initialized in renumberOrderedList");
         return;
     }
    try {
        // console.log(`[renumberOL] Starting scan from line ${startLine}`); // Debug log removed
        let currentNumber = 1;
        let searchLine = startLine;
        let scanUpLine = startLine - 1;

        // Find the correct starting number by looking at the previous line(s)
        while (scanUpLine >= 0) {
            const prevLineContent = doc.getLine(scanUpLine);
            const prevOlMatch = prevLineContent.trimStart().match(/^(\d+)\.\s+/);
            if (prevOlMatch) {
                currentNumber = parseInt(prevOlMatch[1], 10) + 1;
                // console.log(`[renumberOL] Determined starting number ${currentNumber} from line ${scanUpLine}`); // Debug log removed
                break;
            }
             // If the previous line is empty or not an OL item, stop scanning up
             if (prevLineContent.trim() === '' || !prevLineContent.match(/^\s*(\d+\.|\*|\+|-)\s/)) {
                break;
            }
            scanUpLine--;
        }
        // if (scanUpLine < 0) console.log(`[renumberOL] No previous OL found or boundary reached, starting at 1.`); // Debug log removed


        // Now, renumber lines downwards from searchLine
        while (searchLine < doc.lineCount()) {
            const lineContent = doc.getLine(searchLine);
            const lineLength = lineContent.length;
            const trimmedLineStart = lineContent.trimStart();
            const olMatch = trimmedLineStart.match(/^(\d+)\.(\s*)/); // Match number, dot, and optional space

            if (olMatch) {
                const correctNumberStr = String(currentNumber);
                const currentNumberStr = olMatch[1];
                const spacing = olMatch[2] || ' '; // Ensure at least one space
                const correctPrefix = correctNumberStr + '.' + spacing;

                // Get the actual prefix including indentation
                const leadingWhitespaceMatch = lineContent.match(/^(\s*)/);
                const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[1] : "";
                const actualCurrentPrefixMatch = lineContent.substring(leadingWhitespace.length).match(/^\\d+\\.\\s*/); // Match the prefix in the line content

                if (actualCurrentPrefixMatch && currentNumberStr !== correctNumberStr) {
                     const actualCurrentPrefixInLine = actualCurrentPrefixMatch[0];
                     const contentAfterPrefix = lineContent.substring(leadingWhitespace.length + actualCurrentPrefixInLine.length);
                     const newContent = leadingWhitespace + correctPrefix + contentAfterPrefix;

                    // console.log(`[renumberOL Line ${searchLine}] Renumbering. Old: ${currentNumberStr}, New: ${correctNumberStr}`); // Debug log removed
                    doc.replaceRange(newContent, { line: searchLine, ch: 0 }, { line: searchLine, ch: lineLength });
                 }
                // else { console.log(`[renumberOL Line ${searchLine}] Number ${currentNumberStr} correct.`); } // Debug log removed

                currentNumber++;
                searchLine++;
            } else if (lineContent.trim() === '') {
                // Skip empty lines within the list but continue numbering
                searchLine++;
            } else {
                // Stop if the line is not an ordered list item or empty
                // console.log(`[renumberOL Line ${searchLine}] End of contiguous OL block.`); // Debug log removed
                break;
            }
        }
        // console.log(`[renumberOL] Finished scan starting from ${startLine}.`); // Debug log removed
    } catch (error) {
        console.error("Error in renumberOrderedList:", error);
    }
}


/**
 * Toggles the current line(s) as blockquotes (prepends '> ').
 */
export function toggleBlockquote() {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in toggleBlockquote");
        return;
    }
    try {
        const doc = editor.getDoc();
        const selections = doc.listSelections();

        editor.operation(() => {
            selections.forEach(selection => {
                const { rangeStart, rangeEnd } = getNormalizedSelection(doc, selection);
                let addPrefix = true;
                // Check if the first line already starts with '> '
                if (rangeStart.line <= rangeEnd.line) {
                   const firstLine = doc.getLine(rangeStart.line);
                   addPrefix = !firstLine.trimStart().startsWith('> ');
                }

                for (let i = rangeStart.line; i <= rangeEnd.line; i++) {
                    const lineContent = doc.getLine(i);
                    const trimmedLine = lineContent.trimStart();
                    const currentIndentMatch = lineContent.match(/^(\s*)/);
                    const currentIndent = currentIndentMatch ? currentIndentMatch[1] : "";

                    if (addPrefix) {
                        // Add '> ' after indentation, only if line isn't empty
                        if (trimmedLine) {
                           doc.replaceRange(currentIndent + '> ' + trimmedLine, { line: i, ch: 0 }, { line: i, ch: lineContent.length });
                        } else {
                             // Apply to empty lines as well? Maybe only if single line selected?
                             if (rangeStart.line === rangeEnd.line) {
                                  doc.replaceRange(currentIndent + '> ', { line: i, ch: 0 }, { line: i, ch: lineContent.length });
                             }
                        }
                    } else {
                        // Remove '> ' if present after indentation
                        if (trimmedLine.startsWith('> ')) {
                            const contentAfterPrefix = trimmedLine.substring(2);
                           doc.replaceRange(currentIndent + contentAfterPrefix, { line: i, ch: 0 }, { line: i, ch: lineContent.length });
                        }
                    }
                }
            });
        });
        editor.focus();
    } catch (error) {
        console.error("Error in toggleBlockquote:", error);
    }
}


/**
 * Toggles the current line between paragraph and ATX heading (cycles H1-H6, then back to paragraph).
 */
export function toggleHeading() {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in toggleHeading");
        return;
    }
    try {
        const doc = editor.getDoc();
        const cursor = doc.getCursor();
        const line = cursor.line;
        const lineContent = doc.getLine(line);
        const trimmedLine = lineContent.trimStart();
        const headingMatch = trimmedLine.match(/^(#{1,6})\s/);
        const currentIndentMatch = lineContent.match(/^(\s*)/);
        const currentIndent = currentIndentMatch ? currentIndentMatch[1] : "";

        editor.operation(() => {
            let newContent;
            if (headingMatch) {
                const level = headingMatch[1].length;
                const contentAfterHeading = trimmedLine.substring(headingMatch[0].length);
                if (level < 6) {
                    // Increase heading level
                    newContent = currentIndent + '#'.repeat(level + 1) + ' ' + contentAfterHeading;
                } else {
                    // Remove heading (cycle back to paragraph)
                    newContent = currentIndent + contentAfterHeading;
                }
            } else {
                // Make it H1
                newContent = currentIndent + '# ' + trimmedLine;
            }
            doc.replaceRange(newContent, { line: line, ch: 0 }, { line: line, ch: lineContent.length });
            // Move cursor to end of modified line
            doc.setCursor({ line: line, ch: newContent.length });
        });
        editor.focus();
    } catch (error) {
        console.error("Error in toggleHeading:", error);
    }
}


/**
 * Toggles the selected text or current line(s) as a fenced code block (```).
 */
export function toggleCodeBlock() {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in toggleCodeBlock");
        return;
    }
    try {
        const doc = editor.getDoc();
        const selection = doc.getSelection();
        const { rangeStart, rangeEnd } = getNormalizedSelection(doc, doc.listSelections()[0]); // Use normalized range

        editor.operation(() => {
            // 检查是否已经在代码块内
            const currentLine = doc.getLine(rangeStart.line);
            const nextLine = rangeStart.line < doc.lineCount() - 1 ? doc.getLine(rangeStart.line + 1) : "";
            const prevLine = rangeStart.line > 0 ? doc.getLine(rangeStart.line - 1) : "";
            
            const insideCodeBlock = 
                (prevLine.trim().startsWith("```") && !nextLine.trim().startsWith("```")) || 
                (nextLine.trim().startsWith("```") && !prevLine.trim().startsWith("```"));
            
            if (insideCodeBlock) {
                // 当前处于代码块内，将光标移动到代码块外
                if (prevLine.trim().startsWith("```")) {
                    // 移动到代码块开始处
                    doc.setCursor({line: rangeStart.line - 1, ch: prevLine.indexOf("```")});
                } else if (doc.lineCount() > rangeStart.line + 1) {
                    // 移动到代码块结束处
                    doc.setCursor({line: rangeStart.line + 1, ch: nextLine.indexOf("```")});
                }
            }
            else if (selection) {
                // 包装选中文本到代码块中
                const lang = prompt("请输入编程语言 (如 python, javascript, html, css, java, cpp, sql 等):", "");
                const newText = "```" + (lang || "") + "\n" + selection + "\n```";
                doc.replaceSelection(newText);
                // 将光标放在代码块内
                doc.setCursor({ line: rangeStart.line + 1, ch: 0 });
            } else {
                // 在当前行插入代码块
                const lineContent = doc.getLine(rangeStart.line);
                const lang = prompt("请输入编程语言 (如 python, javascript, html, css, java, cpp, sql 等):", "");
                const newText = "```" + (lang || "") + "\n" + lineContent + "\n```";
                doc.replaceRange(newText, { line: rangeStart.line, ch: 0 }, { line: rangeStart.line, ch: lineContent.length });
                // 将光标放在代码块内
                doc.setCursor({ line: rangeStart.line + 1, ch: 0 });
            }
        });
        editor.focus();
    } catch (error) {
        console.error("Error in toggleCodeBlock:", error);
    }
}


/**
 * Inserts a horizontal rule (---) at the current cursor position or on a new line.
 */
export function insertHorizontalRule() {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in insertHorizontalRule");
        return;
    }
    try {
        const doc = editor.getDoc();
        const cursor = doc.getCursor();
        const lineContent = doc.getLine(cursor.line);

        editor.operation(() => {
            if (lineContent.trim() === "") {
                // Replace empty line with HR
                doc.replaceRange("---", { line: cursor.line, ch: 0 }, { line: cursor.line, ch: lineContent.length });
                doc.setCursor({ line: cursor.line, ch: 3 });
            } else {
                // Insert HR on a new line below
                const hrText = "\n---";
                doc.replaceRange(hrText, { line: cursor.line, ch: lineContent.length }); // Insert after current line content
                doc.setCursor({ line: cursor.line + 1, ch: 3 });
            }
        });
        editor.focus();
    } catch (error) {
        console.error("Error in insertHorizontalRule:", error);
    }
}


/**
 * Prompts the user for a URL and inserts a Markdown link `[link text](url)`.
 */
export function insertLink() {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in insertLink");
        return;
    }
    try {
        const selection = editor.getSelection();
        const url = prompt("输入链接 URL:", "https://");

        if (url) { // Only proceed if user entered a URL
            editor.operation(() => {
                if (selection) {
                    editor.replaceSelection(`[${selection}](${url})`);
                } else {
                    editor.replaceSelection(`[链接文本](${url})`);
                     // Select "链接文本" for easy replacement
                    const startCursor = editor.getCursor('start'); // Cursor is after the inserted text
                    editor.setSelection(
                        { line: startCursor.line, ch: startCursor.ch - url.length - 3 }, // Start of "链接文本"
                        { line: startCursor.line, ch: startCursor.ch - url.length - 1 }  // End of "链接文本"
                    );
                }
            });
            editor.focus();
        } else {
             editor.focus(); // Return focus even if cancelled
        }
    } catch (error) {
        console.error("Error in insertLink:", error);
    }
}

/**
 * Inserts a Markdown table with the specified number of rows and columns.
 * @param {number} rows - The number of rows (including header).
 * @param {number} cols - The number of columns.
 */
export function insertGeneratedTable(rows, cols) {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in insertGeneratedTable");
        return;
    }
    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
        console.error("Invalid rows or columns for table generation:", rows, cols);
        return;
    }
    try {
        let table = "\n"; // Start with a newline for spacing

        // Header row
        table += "|";
        for (let j = 0; j < cols; j++) {
            table += ` Header ${j + 1} |`;
        }
        table += "\n";

        // Separator row
        table += "|";
        for (let j = 0; j < cols; j++) {
            table += " :--- |"; // Default left alignment
        }
        table += "\n";

        // Data rows (rows - 1 because header is one row)
        for (let i = 1; i < rows; i++) {
            table += "|";
            for (let j = 0; j < cols; j++) {
                table += ` Cell ${i},${j + 1} |`;
            }
            table += "\n";
        }
        table += "\n"; // Add a newline after the table

        editor.operation(() => {
             const cursor = editor.getCursor();
            // Insert at cursor position
             editor.replaceRange(table, cursor);
            // Place cursor at the beginning of the first header cell for editing
            editor.setCursor({ line: cursor.line + 1, ch: 2 }); // Line adjusted for starting newline
        });
        editor.focus();
    } catch (error) {
        console.error("Error in insertGeneratedTable:", error);
    }
} 