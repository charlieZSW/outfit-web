/**
 * scrollSync.js - 编辑区和预览区滚动同步模块
 * 
 * 提供编辑区和预览区之间的双向滚动同步功能。
 * 使用防抖和节流技术保证滚动平滑且性能良好。
 */

import { getEditor } from './state.js';
import { previewArea } from './domElements.js';

// 滚动状态追踪
let isEditorScrolling = false;
let isPreviewScrolling = false;
let scrollTimeout = null;
let lastEditorScrollTop = 0;
let lastPreviewScrollTop = 0;

/**
 * 简易节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制的时间间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 计算编辑器滚动位置对应的预览区滚动位置
 * @returns {number} 预览区域应该滚动到的位置
 */
function calculatePreviewScrollPosition() {
    const editor = getEditor();
    if (!editor || !previewArea) return 0;
    
    // 获取编辑器的滚动信息
    const editorInfo = editor.getScrollInfo();
    const editorScrollRatio = editorInfo.top / (editorInfo.height - editorInfo.clientHeight);
    
    // 计算预览区应该滚动到的位置
    return editorScrollRatio * (previewArea.scrollHeight - previewArea.clientHeight);
}

/**
 * 计算预览区滚动位置对应的编辑器滚动位置
 * @returns {number} 编辑器应该滚动到的位置
 */
function calculateEditorScrollPosition() {
    const editor = getEditor();
    if (!editor || !previewArea) return 0;
    
    // 获取预览区的滚动信息
    const previewScrollRatio = previewArea.scrollTop / (previewArea.scrollHeight - previewArea.clientHeight);
    
    // 获取编辑器的信息
    const editorInfo = editor.getScrollInfo();
    
    // 计算编辑器应该滚动到的位置
    return previewScrollRatio * (editorInfo.height - editorInfo.clientHeight);
}

/**
 * 编辑器滚动事件处理函数
 */
const handleEditorScroll = throttle(function() {
    if (isPreviewScrolling) return;
    
    isEditorScrolling = true;
    clearTimeout(scrollTimeout);
    
    const editor = getEditor();
    if (!editor || !previewArea) return;
    
    // 检查是否真的滚动了
    const currentScrollTop = editor.getScrollInfo().top;
    if (currentScrollTop === lastEditorScrollTop) {
        isEditorScrolling = false;
        return;
    }
    lastEditorScrollTop = currentScrollTop;
    
    // 计算并设置预览区滚动位置
    const targetScrollTop = calculatePreviewScrollPosition();
    previewArea.scrollTop = targetScrollTop;
    
    // 重置状态
    scrollTimeout = setTimeout(() => {
        isEditorScrolling = false;
    }, 150);
}, 30);

/**
 * 预览区滚动事件处理函数
 */
const handlePreviewScroll = throttle(function() {
    if (isEditorScrolling) return;
    
    isPreviewScrolling = true;
    clearTimeout(scrollTimeout);
    
    const editor = getEditor();
    if (!editor || !previewArea) return;
    
    // 检查是否真的滚动了
    const currentScrollTop = previewArea.scrollTop;
    if (currentScrollTop === lastPreviewScrollTop) {
        isPreviewScrolling = false;
        return;
    }
    lastPreviewScrollTop = currentScrollTop;
    
    // 计算并设置编辑器滚动位置
    const targetScrollTop = calculateEditorScrollPosition();
    editor.scrollTo(null, targetScrollTop);
    
    // 重置状态
    scrollTimeout = setTimeout(() => {
        isPreviewScrolling = false;
    }, 150);
}, 30);

/**
 * 初始化滚动同步功能
 */
export function initScrollSync() {
    try {
        const editor = getEditor();
        if (!editor || !previewArea) {
            console.warn('无法初始化滚动同步：编辑器或预览区未准备好');
            return;
        }
        
        // 初始化 - 记录初始滚动位置
        lastEditorScrollTop = editor.getScrollInfo().top;
        lastPreviewScrollTop = previewArea.scrollTop;
        
        // 绑定滚动事件
        editor.on('scroll', handleEditorScroll);
        previewArea.addEventListener('scroll', handlePreviewScroll);
        
        console.log('滚动同步功能已初始化');
    } catch (error) {
        console.error('初始化滚动同步时出错:', error);
    }
}

/**
 * 清理滚动同步的事件监听
 */
export function cleanupScrollSync() {
    try {
        const editor = getEditor();
        if (editor) {
            editor.off('scroll', handleEditorScroll);
        }
        if (previewArea) {
            previewArea.removeEventListener('scroll', handlePreviewScroll);
        }
    } catch (error) {
        console.error('清理滚动同步时出错:', error);
    }
} 