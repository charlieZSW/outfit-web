import { previewArea as defaultPreviewArea } from './domElements.js'; // Import with alias if needed, or make function accept element
import { hljs } from './externalLibs.js';

/**
 * Highlights all code blocks (pre code) within a given container element using highlight.js.
 * Checks if hljs library is loaded before attempting to highlight.
 * Includes basic error handling for the highlighting process.
 * Skips mermaid code blocks as they will be handled separately.
 *
 * @param {HTMLElement} containerElement - The DOM element containing the code blocks to highlight (e.g., the preview area).
 */
export function highlightCodeBlocks(containerElement) {
    if (!containerElement) {
        console.warn("highlightCodeBlocks called with no container element.");
        return;
    }

    if (typeof hljs !== 'undefined') {
        // console.log("hljs found, attempting to highlight code blocks..."); // Debug log
        const blocks = containerElement.querySelectorAll('pre code');
        // console.log(`Found ${blocks.length} blocks to highlight.`); // Debug log
        blocks.forEach((block) => {
            try {
                // 跳过mermaid代码块，这些将由processMermaidDiagrams函数处理
                if (block.classList.contains('language-mermaid')) {
                    // console.log("Skipping mermaid block for hljs processing"); 
                    return;
                }
                
                // 安全处理：确保代码块内容的HTML被正确转义
                // 先保存原始内容
                const originalContent = block.textContent;
                // 确保内容被正确地转义为纯文本
                block.textContent = originalContent; // 这会自动转义HTML
                
                // 然后应用高亮
                hljs.highlightElement(block);
                // console.log("Highlighted block:", block); // Debug log
            } catch (highlightError) {
                console.error("Error highlighting a code block:", highlightError, "Block content:", block.textContent.substring(0, 100));
            }
        });
    } else {
        // console.warn("highlight.js (hljs) not loaded. Skipping code highlighting."); // Informative warning
    }
} 