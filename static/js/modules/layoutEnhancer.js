/**
 * layoutEnhancer.js
 * 布局增强功能的统一入口，负责初始化所有布局改进功能
 */

// Restore correct imports - Assuming filenames are resizeHandler.js and fullscreenMode.js
import ResizeHandler from './resizeHandler.js'; 
import FullscreenMode from './fullscreenMode.js';
// Removed incorrect imports from domElements.js and isResizing/isFullscreen vars

/**
 * 初始化所有布局增强功能
 */
function initLayoutEnhancements() { // Changed back to simple function, removed export on this line
    // 初始化可调节分割线
    ResizeHandler.init(); 
    
    // 初始化全屏模式
    FullscreenMode.init();
    
    // Removed incorrect function calls and logs
    
    console.info('LayoutEnhancer: 所有布局增强功能已初始化');
}

// Removed incorrect function definitions

export default {
    init: initLayoutEnhancements
}; 