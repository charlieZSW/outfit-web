/**
 * fullscreenMode.js
 * 实现编辑器的全屏模式功能
 */

// 本地存储键名
const FULLSCREEN_MODE_KEY = 'fullscreenMode';

/**
 * 初始化全屏模式功能
 */
export function initFullscreenMode() {
    const fullscreenButton = document.getElementById('fullscreen-toggle');
    
    if (!fullscreenButton) {
        console.error('FullscreenMode: 无法找到全屏模式按钮');
        return;
    }
    
    // 切换全屏模式
    function toggleFullscreen() {
        const wasFullscreen = document.body.classList.contains('fullscreen-mode');
        document.body.classList.toggle('fullscreen-mode');
        
        const isFullscreen = document.body.classList.contains('fullscreen-mode');
        fullscreenButton.setAttribute('aria-pressed', isFullscreen.toString());
        fullscreenButton.title = isFullscreen ? '退出全屏 (F11)' : '全屏模式 (F11)';
        
        // 触发 CodeMirror 的 refresh 以确保正确渲染
        if (window.editor) {
            setTimeout(() => window.editor.refresh(), 100);
        }
        
        // 如果是从全屏模式退出，触发额外的布局刷新
        if (wasFullscreen && !isFullscreen) {
            // 确保页眉页脚状态和相关CSS规则正确应用
            setTimeout(() => {
                // 触发布局重新计算
                window.dispatchEvent(new Event('resize'));
                
                // 确保底部边距能够正确应用
                const editorPane = document.querySelector('.editor-pane');
                const previewPane = document.querySelector('.preview-pane');
                
                if (editorPane && previewPane) {
                    // 临时移除并重新添加样式，强制浏览器重新计算
                    const editorStyle = editorPane.style.cssText;
                    const previewStyle = previewPane.style.cssText;
                    
                    editorPane.style.cssText = '';
                    previewPane.style.cssText = '';
                    
                    // 触发回流
                    void editorPane.offsetHeight;
                    void previewPane.offsetHeight;
                    
                    // 恢复样式
                    editorPane.style.cssText = editorStyle;
                    previewPane.style.cssText = previewStyle;
                    
                    // 额外检查页脚是否处于收缩状态，如果是，确保应用了正确的底部边距
                    const footer = document.querySelector('footer');
                    if (footer && footer.classList.contains('footer-collapsed')) {
                        editorPane.style.marginBottom = '0.5rem';
                        previewPane.style.marginBottom = '0.5rem';
                        // 300ms后移除内联样式，让CSS规则接管
                        setTimeout(() => {
                            editorPane.style.marginBottom = '';
                            previewPane.style.marginBottom = '';
                        }, 300);
                    }
                }
            }, 200);
        }
        
        // 保存用户的偏好
        try {
            localStorage.setItem(FULLSCREEN_MODE_KEY, isFullscreen.toString());
        } catch (e) {
            console.warn('FullscreenMode: 无法保存全屏模式偏好到localStorage', e);
        }
    }
    
    // 点击按钮切换全屏
    fullscreenButton.addEventListener('click', (e) => {
        e.preventDefault();
        toggleFullscreen();
    });
    
    // 支持键盘快捷键 F11
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11') {
            e.preventDefault(); // 阻止浏览器默认的全屏行为
            toggleFullscreen();
        }
    });
    
    // ESC 键退出全屏
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('fullscreen-mode')) {
            e.preventDefault();
            toggleFullscreen();
        }
    });
    
    // 恢复上次的全屏设置
    try {
        const savedFullscreen = localStorage.getItem(FULLSCREEN_MODE_KEY);
        if (savedFullscreen === 'true') {
            document.body.classList.add('fullscreen-mode');
            fullscreenButton.setAttribute('aria-pressed', 'true');
            fullscreenButton.title = '退出全屏 (F11)';
        }
    } catch (e) {
        console.warn('FullscreenMode: 无法从localStorage恢复全屏模式偏好', e);
    }
}

export default {
    init: initFullscreenMode
}; 