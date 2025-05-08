import { previewArea } from './domElements.js';
import { getEditor } from './state.js';
import { highlightCodeBlocks } from './highlightManager.js';
import { updateStatusCounts } from './statusBar.js';
import { DEBOUNCE_DELAY } from './config.js';
import { marked, DOMPurify, mermaid, katex, renderMathInElement } from './externalLibs.js';

// Debounce utility (can be moved to a shared utils module later)
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * 初始化Mermaid图表库
 */
function initializeMermaid() {
    if (mermaid) {
        mermaid.initialize({
            startOnLoad: false,
            theme: document.body.classList.contains('dark-theme') ? 'dark' : 'default',
            securityLevel: 'loose', // 允许点击事件
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            }
        });
    }
}

/**
 * 处理预览区内的Mermaid图表
 * @param {HTMLElement} container - 包含图表的容器元素
 */
async function processMermaidDiagrams(container) {
    if (!mermaid) return;
    
    // 查找所有mermaid代码块
    const mermaidBlocks = container.querySelectorAll('code.language-mermaid');
    
    if (mermaidBlocks.length === 0) return;
    
    // Use Promise.all to handle multiple diagrams concurrently
    const renderPromises = Array.from(mermaidBlocks).map(async (block, index) => {
        // 获取父 pre 元素
        const pre = block.parentElement;
        if (!pre || !pre.parentElement) {
            console.warn('Could not find parent element for mermaid block:', block);
            return; // Skip if structure is unexpected
        }

        try {
            // 创建一个唯一ID的div来放置渲染后的图表
            const id = `mermaid-diagram-${Date.now()}-${index}`; // Use timestamp for better uniqueness
            const diagram = document.createElement('div');
            diagram.id = id; // ID is still useful for targeting by mermaid
            diagram.className = 'mermaid-diagram';
            diagram.style.width = '100%'; // Apply basic styling
            diagram.style.marginBottom = '1em';
            
            // 获取mermaid语法
            const graphDefinition = block.textContent || "";
            
            // 替换 pre 元素为图表容器
            pre.parentElement.replaceChild(diagram, pre);
            
            // 渲染图表 using Promise API
            const { svg } = await mermaid.render(id, graphDefinition);
            diagram.innerHTML = svg;
        } catch (error) {
            console.error(`Error rendering mermaid diagram ${index}:`, error);
            // If rendering fails, put the original <pre><code> block back
            // and add an error message.
            if (pre && pre.parentElement !== diagram) { // Ensure pre exists and wasn't removed elsewhere
                const errorMsg = document.createElement('div');
                errorMsg.className = 'mermaid-error';
                errorMsg.style.color = 'red';
                errorMsg.style.marginBottom = '1em'; // Add some spacing
                errorMsg.textContent = `图表渲染错误: ${error instanceof Error ? error.message : String(error)}`;

                // Reinsert the original pre block before the error message
                diagram.replaceWith(pre, errorMsg);
            } else if (diagram && diagram.parentElement) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'mermaid-error';
                errorMsg.style.color = 'red';
                errorMsg.style.marginBottom = '1em';
                errorMsg.textContent = `图表渲染错误: ${error instanceof Error ? error.message : String(error)}`;
                diagram.parentElement.insertBefore(errorMsg, diagram.nextSibling); // Insert error after placeholder
            }
        }
    });

    // Wait for all rendering attempts to complete
    try {
        await Promise.all(renderPromises);
    } catch (err) {
        // This catch is mainly for potential errors in Promise.all itself,
        // individual rendering errors are caught inside the map.
        console.error("Error processing one or more Mermaid diagrams:", err);
    }
}

/**
 * 初始化并渲染页面中的数学公式
 * @param {HTMLElement} container - 包含公式的容器元素
 */
function renderMathEquations(container) {
    if (!renderMathInElement || !katex) return;
    
    try {
        // 直接使用 renderMathInElement，移除有问题的预处理函数
        renderMathInElement(container, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\(", right: "\\)", display: false},
                {left: "\\[", right: "\\]", display: true}
            ],
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false, // 添加这个选项使 KaTeX 更宽容
            trust: true    // 允许所有 KaTeX 功能，注意这可能有安全风险但我们已经使用了 DOMPurify
        });
    } catch (error) {
        console.error('Error rendering math equations:', error);
    }
}

/**
 * Updates the preview area with rendered HTML from the editor's Markdown content.
 * Includes parsing, sanitizing, rendering, and code highlighting.
 */
export function updatePreview() {
    const editor = getEditor();
    if (!editor || !previewArea) {
        // Silently return if editor or preview area isn't ready
        return;
    }

    const markdownText = editor.getValue();
    try {
        // 初始化Mermaid (如果需要)
        initializeMermaid();
        
        // 1. 保护 LaTeX 公式不被解析
        // 替换独立公式 $$...$$
        const blockMathPlaceholders = [];
        let protectedMarkdown = markdownText.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
            const placeholder = `BLOCK_MATH_${blockMathPlaceholders.length}`;
            blockMathPlaceholders.push(formula);
            return placeholder;
        });
        
        // 替换内联公式 $...$，避免匹配已经替换的占位符
        const inlineMathPlaceholders = [];
        protectedMarkdown = protectedMarkdown.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
            if (match.startsWith('BLOCK_MATH_')) return match; // 跳过已替换的占位符
            const placeholder = `INLINE_MATH_${inlineMathPlaceholders.length}`;
            inlineMathPlaceholders.push(formula);
            return placeholder;
        });
        
        // 2. Parse Markdown
        const rawHtml = marked.parse(protectedMarkdown);
        
        // 3. Sanitize HTML
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
            ADD_ATTR: [
                // 基本属性
                'class', 'id', 
                // SVG属性 (for Mermaid)
                'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'points', 'x', 'y', 'cx', 'cy', 'r', 'x1', 'x2', 'y1', 'y2',
                // KaTeX需要的属性（保留，但我们将直接插入渲染后的HTML）
                'style', 'href', 'xmlns', 'aria-hidden', 'width', 'height'
            ],
            ADD_TAGS: [
                // SVG相关标签 (for Mermaid)
                'svg', 'path', 'circle', 'line', 'polygon', 'rect', 'g', 'marker', 'defs', 'text', 'tspan', 'textPath'
            ],
            FORBID_TAGS: ['script'], // 只禁止script标签
            FORBID_ATTR: [] // 不禁止任何属性
        });
        
        // 4. 恢复并渲染数学公式
        let finalHtml = cleanHtml;
        
        // 恢复并渲染独立公式
        blockMathPlaceholders.forEach((formula, index) => {
            try {
                const placeholder = `BLOCK_MATH_${index}`;
                const renderedFormula = katex.renderToString(formula, {
                    displayMode: true,
                    throwOnError: false,
                    errorColor: '#cc0000'
                });
                finalHtml = finalHtml.replace(placeholder, renderedFormula);
            } catch (err) {
                console.error(`Error rendering block formula #${index}:`, err);
                // 如果渲染失败，至少显示原始公式
                finalHtml = finalHtml.replace(`BLOCK_MATH_${index}`, `$$${formula}$$`);
            }
        });
        
        // 恢复并渲染内联公式
        inlineMathPlaceholders.forEach((formula, index) => {
            try {
                const placeholder = `INLINE_MATH_${index}`;
                const renderedFormula = katex.renderToString(formula, {
                    displayMode: false,
                    throwOnError: false,
                    errorColor: '#cc0000'
                });
                finalHtml = finalHtml.replace(placeholder, renderedFormula);
            } catch (err) {
                console.error(`Error rendering inline formula #${index}:`, err);
                // 如果渲染失败，至少显示原始公式
                finalHtml = finalHtml.replace(`INLINE_MATH_${index}`, `$${formula}$`);
            }
        });
        
        // 5. Render HTML
        previewArea.innerHTML = finalHtml;
        
        // 6. Highlight Code Blocks and Process Mermaid
        requestAnimationFrame(async () => {
            try {
                highlightCodeBlocks(previewArea);
                await processMermaidDiagrams(previewArea);
            } catch (processingError) {
                console.error("Error during post-render processing (highlighting or Mermaid):", processingError);
            }
        });
    } catch (error) {
        console.error("Error during Markdown processing or rendering:", error);
        if (previewArea) {
            previewArea.innerHTML = `<p style="color: red;">预览渲染时发生内部错误。请检查 Markdown 语法或稍后重试。</p>`;
        }
    }
}

/**
 * A debounced function that updates both the preview and the status counts.
 */
export const debouncedUpdatePreviewAndCounts = debounce(() => {
    updatePreview();
    updateStatusCounts();
    // TODO: Potentially add StorageManager.saveContent() here later if editor change listener moves to main.js
}, DEBOUNCE_DELAY); 