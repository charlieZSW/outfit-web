// External Libraries Wrapper for ES6 Module Access

/**
 * This module serves as a bridge between global libraries loaded via <script> tags
 * and our ES6 module system. It exports references to those libraries so they can
 * be properly imported in other modules.
 */

// Markdown parser
export const marked = window.marked;

// 配置marked保留原始的列表编号
if (marked && marked.setOptions) {
  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false,
    smartypants: false,
    langPrefix: 'language-'  // 添加语言前缀，与highlight.js兼容
  });

  // 创建新的渲染器并配置它
  const renderer = new marked.Renderer();
  
  // 自定义list渲染方法，确保保留原始编号
  const originalList = renderer.list;
  renderer.list = function(body, ordered, start) {
    if (ordered && start && start > 1) {
      return '<ol start="' + start + '">\n' + body + '</ol>\n';
    }
    return originalList.call(this, body, ordered, start);
  };

  // 增强代码块渲染，确保语言类名正确添加到预览区
  const originalCode = renderer.code;
  renderer.code = function(code, language, isEscaped) {
    if (language) {
      // 确保语言名被正确添加到class属性
      return `<pre><code class="language-${language}">${
        isEscaped ? code : this.options.highlight ? 
          this.options.highlight(code, language) : 
          escape(code, true)
      }</code></pre>\n`;
    }
    return originalCode.call(this, code, language, isEscaped);
  };

  // 应用配置的渲染器
  marked.setOptions({ renderer: renderer });
}

// HTML sanitizer
export const DOMPurify = window.DOMPurify;

// CodeMirror editor
export const CodeMirror = window.CodeMirror;

// 注释掉导致无限递归的代码块
/* 
// 配置CodeMirror以支持内嵌的代码块高亮
if (CodeMirror && CodeMirror.defineMode) {
  // 确保CodeMirror已经加载了Markdown模式和其他语言模式
  const modes = ['python', 'javascript', 'html', 'css', 'java', 'cpp', 'sql'];
  
  // 针对Markdown内的代码块，启用嵌套语言模式
  if (CodeMirror.modes.markdown) {
    const originalMode = CodeMirror.modes.markdown;
    CodeMirror.modes.markdown = function(config, parserConfig) {
      const mode = originalMode(config, parserConfig);
      // 增强代码块识别和高亮能力
      mode.token = function(stream, state) {
        if (state.code) {
          // 如果已经在代码块内部，使用对应的语言模式处理
          const result = CodeMirror.modes[state.codeLanguage || 'text/plain']
            ? CodeMirror.modes[state.codeLanguage](config)(stream, state.codeState)
            : stream.skipToEnd();
          return result || 'code';
        }
        return mode.token(stream, state);
      };
      return mode;
    };
  }
}
*/

// Highlight.js for code highlighting
export const hljs = window.hljs; 

// Mermaid for diagrams
export const mermaid = window.mermaid; 

// KaTeX for math rendering
export const katex = window.katex;
export const renderMathInElement = window.renderMathInElement; 