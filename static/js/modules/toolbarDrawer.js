/**
 * toolbarDrawer.js
 * 实现全屏模式下工具栏的抽屉式行为
 */

// 本地存储键名
const TOOLBAR_STATE_KEY = 'toolbarDrawerState';

/**
 * 初始化工具栏抽屉功能
 */
export function initToolbarDrawer() {
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar) {
        console.error('ToolbarDrawer: 无法找到工具栏元素');
        return;
    }
    
    // 创建工具栏切换按钮
    const toggleButton = document.createElement('button');
    toggleButton.className = 'toolbar-toggle';
    toggleButton.setAttribute('aria-label', '切换工具栏显示');
    toggleButton.setAttribute('title', '切换工具栏');
    toggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    
    // 添加到 body 元素，紧跟在工具栏之后
    toolbar.parentNode.insertBefore(toggleButton, toolbar.nextSibling);
    
    // 切换工具栏的显示状态
    function toggleToolbar() {
        const isCollapsed = toolbar.classList.toggle('toolbar-collapsed');
        
        // 同时更新编辑区和预览区的状态
        const editorPane = document.querySelector('.editor-pane');
        const previewPane = document.querySelector('.preview-pane');
        
        if (editorPane && previewPane) {
            if (isCollapsed) {
                editorPane.classList.add('toolbar-collapsed');
                previewPane.classList.add('toolbar-collapsed');
            } else {
                editorPane.classList.remove('toolbar-collapsed');
                previewPane.classList.remove('toolbar-collapsed');
            }
        }
        
        // 保存状态到本地存储
        try {
            localStorage.setItem(TOOLBAR_STATE_KEY, isCollapsed ? 'collapsed' : 'expanded');
        } catch (e) {
            console.warn('ToolbarDrawer: 无法保存工具栏状态', e);
        }
    }
    
    // 点击按钮切换工具栏
    toggleButton.addEventListener('click', toggleToolbar);
    
    // 监听全屏模式变化
    const bodyObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isFullscreen = document.body.classList.contains('fullscreen-mode');
                
                // 如果进入全屏模式，确保工具栏处于展开状态
                if (isFullscreen && toolbar.classList.contains('toolbar-collapsed')) {
                    toggleToolbar(); // 展开工具栏
                }
            }
        });
    });
    
    // 观察 body 元素的类名变化
    bodyObserver.observe(document.body, { attributes: true });
    
    // 恢复之前的状态（仅在全屏模式下）
    document.addEventListener('DOMContentLoaded', () => {
        const isFullscreen = document.body.classList.contains('fullscreen-mode');
        if (isFullscreen) {
            try {
                const savedState = localStorage.getItem(TOOLBAR_STATE_KEY);
                if (savedState === 'collapsed' && !toolbar.classList.contains('toolbar-collapsed')) {
                    toggleToolbar();
                }
            } catch (e) {
                console.warn('ToolbarDrawer: 无法恢复工具栏状态', e);
            }
        }
    });
    
    // 添加快捷键支持 (Alt+T 切换工具栏) 
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 't' && document.body.classList.contains('fullscreen-mode')) {
            e.preventDefault();
            toggleToolbar();
        }
    });
}

export default {
    init: initToolbarDrawer
}; 