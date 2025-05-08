import { setEditor } from './state.js';
import { CodeMirror } from './externalLibs.js';

/**
 * Initializes the CodeMirror editor instance.
 *
 * @param {object} options - Configuration options for the editor.
 * @param {HTMLTextAreaElement} options.inputElement - The textarea element to replace.
 * @param {object} options.initialSettings - Initial editor settings (e.g., { lineNumbers, lineWrapping }).
 * @param {string} options.initialTheme - The initial CodeMirror theme name (e.g., 'material-darker').
 * @param {object} options.extraKeysMap - An object mapping key combinations to callback functions.
 * @param {function} options.onChangeCallback - Callback function to execute on editor 'change' event.
 * @param {function} options.onCursorActivityCallback - Callback function to execute on editor 'cursorActivity' event.
 * @returns {CodeMirror.EditorFromTextArea | null} The initialized CodeMirror editor instance, or null if initialization fails.
 */
export function initializeCodeMirror(options) {
    const {
        inputElement,
        initialSettings,
        initialTheme,
        extraKeysMap,
        onChangeCallback,
        onCursorActivityCallback
    } = options;

    if (!inputElement) {
        console.error('Error initializing CodeMirror: Input element not provided.');
        return null;
    }

    try {
        // 使用更简单的配置，避免嵌套模式的复杂性
        const editor = CodeMirror.fromTextArea(inputElement, {
            mode: 'markdown',
            smartIndent: true,
            theme: initialTheme,
            lineNumbers: initialSettings.lineNumbers,
            lineWrapping: initialSettings.lineWrapping,
            indentUnit: 4,
            electricChars: true,
            matchBrackets: true,
            styleActiveLine: true,
            extraKeys: {
                // Add Enter key binding for list continuation by default
                'Enter': 'newlineAndIndentContinueMarkdownList',
                // Use addon for smart list indent/outdent
                "Tab": "autoIndentMarkdownList",
                "Shift-Tab": "autoUnindentMarkdownList",
                // Spread the provided key map (ensure addon keys aren't overridden easily)
                ...extraKeysMap
            }
            // Note: Tab behavior (indentUnit, indentWithTabs) should be applied *after* initialization
            // by calling a separate function (e.g., from EditorUI module) using the editor instance.
        });

        // 使用简单的样式增强替代复杂的嵌套模式
        enhanceMarkdownStyling(editor);

        // Store the editor instance in the shared state
        setEditor(editor);

        // Add ARIA label to the wrapper element created by CodeMirror
        const cmWrapper = editor.getWrapperElement();
        if (cmWrapper) {
            cmWrapper.setAttribute('aria-label', 'Markdown 编辑器输入区域');
        }

        // Attach event listeners provided by the caller
        if (onChangeCallback) {
            editor.on('change', onChangeCallback);
        }
        if (onCursorActivityCallback) {
            editor.on('cursorActivity', onCursorActivityCallback);
        }

        return editor; // Return the instance

    } catch (err) {
        console.error('Error initializing CodeMirror:', err);
        // Fallback: Ensure the original textarea is visible if CM fails
        inputElement.style.display = 'block';
        // Optionally display an error message to the user in the preview area or elsewhere
        // (Requires importing previewArea or passing another element)
        const preview = document.getElementById('preview-area'); // Temporary direct access
        if (preview) {
             preview.innerHTML = '<p style="color: red; font-weight: bold;">CodeMirror 编辑器初始化失败。请检查控制台。将回退到普通文本区域。</p>';
        }
        setEditor(null); // Ensure editor state is null
        return null;
    }
}

/**
 * 为Markdown编辑器增加样式增强功能
 * @param {CodeMirror.Editor} editor - CodeMirror编辑器实例
 */
function enhanceMarkdownStyling(editor) {
    if (!editor) return;

    // 使用更简单的renderLine处理方式来增强可视化效果
    editor.on('renderLine', function(cm, line, el) {
        const content = line.text;
        
        // 添加代码块样式
        if (content.startsWith('```')) {
            el.classList.add('cm-code-block-marker');
            
            // 提取语言标识
            const lang = content.substring(3).trim();
            if (lang) {
                // 在元素上添加自定义属性表示语言
                el.setAttribute('data-lang', lang);
                // 添加特殊样式类
                el.classList.add('cm-code-block-lang');
            }
        }
        
        // 添加标题样式
        if (/^#{1,6}\s/.test(content)) {
            const level = content.match(/^(#{1,6})\s/)[1].length;
            el.classList.add(`cm-header-${level}`);
        }
    });
} 