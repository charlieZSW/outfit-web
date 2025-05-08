import { getEditor } from './state.js';
import { importFileInput } from './domElements.js'; // Need this for triggerImport
import { marked, DOMPurify } from './externalLibs.js';

// 模块加载调试日志
// console.log('fileManager.js loaded with ES6 imports for marked and DOMPurify', { marked, DOMPurify });

// --- Helper for Downloads (Internal) ---
function _downloadFile(filename, content, mimeType) {
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
    } catch (error) {
        console.error(`Error creating download for ${filename}:`, error);
        alert(`无法创建下载文件 ${filename}。请检查控制台获取更多信息。`);
    }
}

// --- Exported File Operations ---

/**
 * Triggers a click on the hidden file input element to open the file selection dialog.
 */
export function triggerImport() {
    if (importFileInput) {
        try {
             importFileInput.click();
        } catch (error) {
             console.error('Error triggering file input click:', error);
             alert('无法打开文件选择对话框。');
        }
    } else {
        console.error('Import file input element not found.');
        alert('导入功能初始化失败。');
    }
}

/**
 * Handles the 'change' event of the file input.
 * Reads the selected Markdown file and sets its content in the editor.
 * @param {Event} event - The file input change event.
 */
export function handleImport(event) {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in handleImport");
        alert('编辑器未初始化，无法导入文件。');
        return;
    }

    const file = event.target.files[0];
    if (!file) {
        return; // No file selected
    }

    // Basic type check
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
            if (typeof content === 'string') {
                editor.setValue(content);
                 // Trigger preview update after import
                 // TODO: Consider importing updatePreview directly if needed, or rely on CodeMirror's change event
            } else {
                throw new Error('File content is not a string.')
            }
        } catch (err) {
            console.error('Error setting editor content after import:', err);
            alert('导入文件时发生错误。无法将内容加载到编辑器。');
        }
    };

    reader.onerror = (e) => {
        console.error('Error reading file:', e);
        alert(`读取文件 ${file.name} 时发生错误。`);
    };

    try {
        reader.readAsText(file);
    } catch (readError) {
        console.error('Error initiating file read:', readError);
        alert(`启动文件读取时出错: ${file.name}`);
    }


    // Reset the input value so the change event fires even if the same file is selected again
    try {
        event.target.value = null;
    } catch (resetError) {
        // This can sometimes fail in specific browser/security contexts, log it but don't block.
        console.warn('Could not reset file input value:', resetError);
    }
}

/**
 * Exports the current editor content as a Markdown file.
 */
export function exportMarkdown() {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in exportMarkdown");
        alert('编辑器未初始化，无法导出 Markdown。');
        return;
    }
    try {
        const content = editor.getValue();
        _downloadFile('document.md', content, 'text/markdown;charset=utf-8');
    } catch (error) {
        console.error('Error exporting Markdown:', error);
        alert('导出 Markdown 时发生错误。请检查控制台。');
    }
}

/**
 * Exports the current editor content as an HTML file.
 * Uses marked.js for parsing and DOMPurify for sanitization.
 */
export function exportHtml() {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor not initialized in exportHtml");
        alert('编辑器未初始化，无法导出 HTML。');
        return;
    }

    // Check for required libraries
    if (!marked || !DOMPurify) {
        console.error('marked.js or DOMPurify library not available. Cannot export HTML.');
        alert('导出 HTML 失败：缺少必要的库 (marked.js 或 DOMPurify)。');
        return;
    }

    try {
        const markdownContent = editor.getValue();
        const rawHtml = marked.parse(markdownContent);
        const cleanHtml = DOMPurify.sanitize(rawHtml);

        // Basic HTML structure
        const fullHtml = `<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>导出的文档</title>\n    <style>\n        body { font-family: sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }\n        pre { background-color: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; }\n        code { font-family: monospace; background-color: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; }
        pre > code { background-color: transparent; padding: 0; }
        blockquote { border-left: 4px solid #ccc; padding-left: 1em; color: #555; margin-left: 0; }
        table { border-collapse: collapse; width: auto; margin-bottom: 1em; border: 1px solid #ddd; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        img { max-width: 100%; height: auto; }
    </style>\n</head>\n<body>\n${cleanHtml}\n</body>\n</html>`;

        _downloadFile('document.html', fullHtml, 'text/html;charset=utf-8');
    } catch (error) {
        console.error('Error exporting HTML:', error);
        // Check if the error is related to marked or DOMPurify specifically
        if (error.message.includes('marked') || error.message.includes('DOMPurify')) {
             alert('导出 HTML 时发生错误：Markdown 解析或清理失败。请检查控制台。');
        } else {
            alert('导出 HTML 时发生未知错误。请检查控制台。');
        }
    }
} 