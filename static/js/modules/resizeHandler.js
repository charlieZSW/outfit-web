/**
 * resizeHandler.js
 * 处理编辑区和预览区之间的可调节分割线
 */

// 本地存储键名
const EDITOR_WIDTH_RATIO_KEY = 'editorWidthRatio';

/**
 * 初始化可调节分割线功能
 */
export function initResizeHandler() {
    const container = document.querySelector('.editor-container');
    const handle = document.getElementById('resize-handle');
    const editorPane = document.querySelector('.editor-pane');
    const previewPane = document.querySelector('.preview-pane');
    
    if (!handle || !editorPane || !previewPane || !container) {
        console.error('ResizeHandler: 无法找到必要的DOM元素');
        return;
    }
    
    let isDragging = false;
    let startX, startWidth;
    
    // 鼠标按下事件
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault(); // 防止选择文本
        isDragging = true;
        startX = e.clientX;
        startWidth = editorPane.offsetWidth;
        
        // 添加拖动状态
        handle.classList.add('dragging');
        document.body.classList.add('body-no-select');
        
        // 应用拖动样式
        document.body.style.cursor = 'col-resize';
    });
    
    // 鼠标移动事件 (添加到document以捕获所有移动)
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        // 计算容器宽度和限制
        const containerWidth = container.offsetWidth;
        const minWidth = containerWidth * 0.2; // 最小宽度为20%
        const maxWidth = containerWidth * 0.8; // 最大宽度为80%
        
        // 计算新宽度
        let newWidth = startWidth + (e.clientX - startX);
        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        
        // 设置宽度比例
        const widthPercent = (newWidth / containerWidth) * 100;
        editorPane.style.flex = `0 0 ${widthPercent}%`;
        previewPane.style.flex = `1 1 ${100 - widthPercent}%`;
        
        // 强制更新预览区域布局
        previewPane.style.width = `calc(100% - ${widthPercent}%)`;
        
        // 可选：触发 CodeMirror 的 refresh 以确保正确渲染
        if (window.editor) {
            window.editor.refresh();
        }
    });
    
    // 鼠标释放事件
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            
            // 移除拖动状态
            handle.classList.remove('dragging');
            document.body.classList.remove('body-no-select');
            document.body.style.cursor = '';
            
            // 保存当前的宽度比例到 localStorage
            const ratio = editorPane.offsetWidth / container.offsetWidth;
            try {
                localStorage.setItem(EDITOR_WIDTH_RATIO_KEY, ratio.toString());
            } catch (e) {
                console.warn('ResizeHandler: 无法保存宽度比例到localStorage', e);
            }
            
            // 强制刷新预览区域
            setTimeout(() => {
                // 重新计算预览区域布局
                const previewArea = document.getElementById('preview-area');
                if (previewArea) {
                    // 触发回流和重绘
                    previewArea.style.display = 'none';
                    previewArea.offsetHeight; // 强制回流
                    previewArea.style.display = '';
                }
                
                // 通知编辑器刷新
                if (window.editor) {
                    window.editor.refresh();
                }
            }, 0);
        }
    });
    
    // 初始化：恢复上次的宽度比例
    try {
        const savedRatio = localStorage.getItem(EDITOR_WIDTH_RATIO_KEY);
        if (savedRatio) {
            const ratio = parseFloat(savedRatio);
            if (!isNaN(ratio) && ratio > 0.2 && ratio < 0.8) {
                const widthPercent = ratio * 100;
                editorPane.style.flex = `0 0 ${widthPercent}%`;
                previewPane.style.flex = `1 1 ${100 - widthPercent}%`;
            }
        }
    } catch (e) {
        console.warn('ResizeHandler: 无法从localStorage恢复宽度比例', e);
    }
    
    // 处理窗口大小变化，以确保比例保持不变
    window.addEventListener('resize', () => {
        // 触发 CodeMirror 的 refresh 以确保正确渲染
        if (window.editor) {
            window.editor.refresh();
        }
    });
}

export default {
    init: initResizeHandler
}; 