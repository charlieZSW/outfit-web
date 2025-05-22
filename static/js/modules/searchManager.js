import { getEditor } from './state.js';

// 内部状态
let _searchPanel = null;
let _searchInput = null;
let _replaceInput = null;
let _options = {
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    inSelection: false,
    wrapAround: true
};
let _overlay = null;
let _currentMatch = null;
let _matches = [];
let _searchCursor = null;

/**
 * 创建搜索面板DOM结构
 * @returns {HTMLElement} 搜索面板DOM元素
 */
function createSearchPanelDOM() {
    // 创建主容器
    const panel = document.createElement('div');
    panel.className = 'search-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Find and Replace');

    // --- 创建 Header ---
    const header = document.createElement('div');
    header.className = 'search-panel-header';

    // 创建拖动句柄
    const dragHandle = document.createElement('div');
    dragHandle.className = 'search-panel-drag-handle';
    dragHandle.setAttribute('title', 'Drag panel');
    dragHandle.innerHTML = `
        <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: auto;">
            <circle cx="6" cy="3" r="1.2"/>
            <circle cx="6" cy="7" r="1.2"/>
            <circle cx="6" cy="11" r="1.2"/>
            <circle cx="6" cy="15" r="1.2"/>
        </svg>
    `;
    header.appendChild(dragHandle);

    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'search-panel-close';
    closeButton.id = 'search-panel-close';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close search panel');
    closeButton.setAttribute('title', 'Close (Esc)');
    header.appendChild(closeButton);

    panel.appendChild(header); // 添加 Header到主面板

    // --- 创建主要内容区域 (查找、替换、按钮组、状态、选项) ---
    const mainContent = document.createElement('div');
    mainContent.className = 'search-panel-main-content';

    // 查找输入行
    const findRow = document.createElement('div');
    findRow.className = 'search-panel-input-row';
    
    const findContainer = document.createElement('div');
    findContainer.className = 'search-panel-input-container search-input-container';
    
    const findLabel = document.createElement('label');
    findLabel.className = 'search-panel-label';
    findLabel.setAttribute('for', 'search-panel-find-input');
    findLabel.textContent = 'Find:';
    findContainer.appendChild(findLabel);
    
    const findInput = document.createElement('input');
    findInput.type = 'text';
    findInput.id = 'search-panel-find-input';
    findInput.className = 'search-panel-input';
    findInput.placeholder = 'Enter search text...';
    findInput.setAttribute('aria-label', 'Search text');
    findContainer.appendChild(findInput);
    
    findRow.appendChild(findContainer);
    mainContent.appendChild(findRow);
    
    // 第一个按钮组 (Previous, Next)
    const findActionsGroup = document.createElement('div');
    findActionsGroup.className = 'search-panel-button-group'; // 可以复用样式
    const prevButton = document.createElement('button');
    prevButton.id = 'search-panel-prev';
    prevButton.className = 'search-panel-button';
    prevButton.textContent = 'Previous';
    prevButton.setAttribute('title', 'Find previous (Shift+Enter)');
    findActionsGroup.appendChild(prevButton);
    const nextButton = document.createElement('button');
    nextButton.id = 'search-panel-next';
    nextButton.className = 'search-panel-button search-panel-button-primary'; // 突出 Next
    nextButton.textContent = 'Next';
    nextButton.setAttribute('title', 'Find next (Enter)');
    findActionsGroup.appendChild(nextButton);
    mainContent.appendChild(findActionsGroup); // 放在查找行下方

    // 替换输入行
    const replaceRow = document.createElement('div');
    replaceRow.className = 'search-panel-input-row';
    
    const replaceContainer = document.createElement('div');
    replaceContainer.className = 'search-panel-input-container replace-input-container';
    
    const replaceLabel = document.createElement('label');
    replaceLabel.className = 'search-panel-label';
    replaceLabel.setAttribute('for', 'search-panel-replace-input');
    replaceLabel.textContent = 'Replace with:';
    replaceContainer.appendChild(replaceLabel);
    
    const replaceInput = document.createElement('input');
    replaceInput.type = 'text';
    replaceInput.id = 'search-panel-replace-input';
    replaceInput.className = 'search-panel-input';
    replaceInput.placeholder = 'Enter replacement text...';
    replaceInput.setAttribute('aria-label', 'Replacement text');
    replaceContainer.appendChild(replaceInput);
    
    replaceRow.appendChild(replaceContainer);
    replaceRow.id = 'search-panel-replace-row';
    mainContent.appendChild(replaceRow);

    // 第二个按钮组 (Replace, Replace All)
    const replaceActionsGroup = document.createElement('div');
    replaceActionsGroup.className = 'search-panel-button-group'; // 可以复用样式
    const replaceButton = document.createElement('button');
    replaceButton.id = 'search-panel-replace';
    replaceButton.className = 'search-panel-button';
    replaceButton.textContent = 'Replace';
    replaceButton.setAttribute('title', 'Replace current match');
    replaceActionsGroup.appendChild(replaceButton);
    const replaceAllButton = document.createElement('button');
    replaceAllButton.id = 'search-panel-replace-all';
    replaceAllButton.className = 'search-panel-button search-panel-button-primary'; // 突出 Replace All
    replaceAllButton.textContent = 'Replace All';
    replaceAllButton.setAttribute('title', 'Replace all matches (Alt+R)');
    replaceActionsGroup.appendChild(replaceAllButton);
    mainContent.appendChild(replaceActionsGroup); // 放在替换行下方

    // 状态/结果显示区域
    const statusArea = document.createElement('div');
    statusArea.id = 'search-panel-status';
    statusArea.className = 'search-panel-status';
    statusArea.setAttribute('aria-live', 'polite');
    mainContent.appendChild(statusArea);
    
    // 选项容器
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'search-panel-options collapsed'; // 添加 collapsed 类，默认收起
    optionsContainer.id = 'search-panel-options';
    optionsContainer.setAttribute('aria-hidden', 'true');
    
    // 创建选项复选框
    const options = [
        { id: 'search-panel-option-case', label: 'Case sensitive', checked: false },
        { id: 'search-panel-option-word', label: 'Whole word', checked: false },
        { id: 'search-panel-option-regex', label: 'Regular expression', checked: false },
        { id: 'search-panel-option-selection', label: 'Search in selection', checked: false },
        { id: 'search-panel-option-wrap', label: 'Wrap around', checked: true }
    ];
    
    options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'search-panel-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = option.id;
        checkbox.checked = option.checked;
        
        const label = document.createElement('label');
        label.setAttribute('for', option.id);
        label.textContent = option.label;
        
        optionDiv.appendChild(checkbox);
        optionDiv.appendChild(label);
        optionsContainer.appendChild(optionDiv);
    });
    
    mainContent.appendChild(optionsContainer);

    panel.appendChild(mainContent); // 添加主要内容区域到主面板

    // --- 创建 Footer ---
    const footer = document.createElement('div');
    footer.className = 'search-panel-footer';

    // "更多设置"按钮
    const moreSettingsButton = document.createElement('button');
    moreSettingsButton.id = 'search-panel-more-settings';
    moreSettingsButton.className = 'search-panel-more-settings';
    moreSettingsButton.setAttribute('aria-expanded', 'false');
    moreSettingsButton.setAttribute('aria-controls', 'search-panel-options');
    moreSettingsButton.setAttribute('title', 'More settings');
    // Initial icon: chevron-down (indicates expand)
    moreSettingsButton.innerHTML = `
        <span class="search-panel-more-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </span>`; 
    footer.appendChild(moreSettingsButton);

    panel.appendChild(footer); // 添加 Footer 到主面板
    
    // 注意：optionsContainer 的创建和子元素添加已在 mainContent 内部完成
    // 但我们需要在这里确保它的初始 display 状态
    const optionsContainerInstance = mainContent.querySelector('#search-panel-options');
    if (optionsContainerInstance) {
        optionsContainerInstance.style.display = 'none'; // 初始隐藏
    }

    return panel;
}

/**
 * 初始化搜索面板并添加到DOM
 */
function initSearchPanel() {
    // 如果已经初始化，就不再创建
    if (_searchPanel) return;
    
    // 创建面板元素
    _searchPanel = createSearchPanelDOM();
    
    // 修改：添加到 document.body 而不是特定的编辑器容器中
    document.body.appendChild(_searchPanel);
        
    // 缓存常用的DOM元素引用
    _searchInput = document.getElementById('search-panel-find-input');
    _replaceInput = document.getElementById('search-panel-replace-input');
    
    // 添加样式类，用于错误提示
    if (_searchInput) {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .search-input-error {
                border-color: var(--error-color, #e53935) !important;
                animation: search-error-flash 0.8s ease;
            }
            @keyframes search-error-flash {
                0%, 100% { background-color: var(--input-bg-color, var(--bg-color)); }
                50% { background-color: rgba(229, 57, 53, 0.1); }
            }
            
            /* 状态图标样式 */
            .search-status-icon {
                display: inline-block;
                margin-right: 5px;
                vertical-align: middle;
            }
            
            /* 成功状态样式 */
            .search-panel-status.success {
                color: var(--success-color, #43a047);
                background-color: rgba(67, 160, 71, 0.07);
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // 初始化面板状态
    setupPanelEvents();
    
    // 添加窗口大小变化事件监听器，以便重新定位面板
    window.addEventListener('resize', debounce(() => {
        if (isSearchPanelVisible()) {
            positionSearchPanel();
        }
    }, 100));
}

/**
 * 根据编辑器位置定位搜索面板（放置在编辑器右上角）
 */
function positionSearchPanel() {
    if (!_searchPanel) return;
    
    const editor = getEditor();
    if (!editor) return;
    
    const editorWrapper = editor.getWrapperElement();
    const wrapperRect = editorWrapper.getBoundingClientRect();
    
    // 获取面板尺寸（先设置可见才能获取正确尺寸）
    // 确保面板是可见的以获取正确的尺寸，如果它之前是 display:none
    const originalDisplay = _searchPanel.style.display;
    const originalVisibility = _searchPanel.style.visibility;
    if (originalDisplay === 'none') {
        _searchPanel.style.visibility = 'hidden'; // 保持隐藏但参与布局
    _searchPanel.style.display = 'flex';
    }
    const panelRect = _searchPanel.getBoundingClientRect();
    if (originalDisplay === 'none') { // 恢复原始状态
        _searchPanel.style.display = originalDisplay;
        _searchPanel.style.visibility = originalVisibility;
    }


    let targetTop = wrapperRect.top + 5; // 5px 从顶部偏移
    let targetLeft = wrapperRect.right - panelRect.width - 5; // 5px 从右侧偏移

    // 确保面板不会完全移出视窗顶部或左侧
    targetTop = Math.max(0, targetTop);
    targetLeft = Math.max(0, targetLeft);
    
    // 确保面板不会完全移出视窗底部或右侧 (考虑面板自身高度和宽度)
    targetTop = Math.min(window.innerHeight - panelRect.height, targetTop);
    targetLeft = Math.min(window.innerWidth - panelRect.width, targetLeft);


    _searchPanel.style.top = `${targetTop}px`;
    _searchPanel.style.left = `${targetLeft}px`;
    // _searchPanel.style.visibility = 'visible'; // showSearchPanel 会处理这个
}

/**
 * 显示搜索面板
 * @param {boolean} showReplace 是否显示替换功能
 */
function showSearchPanel(showReplace = false) {
    if (!_searchPanel) {
        initSearchPanel();
    }
    
    // 设置面板中替换相关元素的可见性
    const replaceRow = document.getElementById('search-panel-replace-row');
    const replaceButton = document.getElementById('search-panel-replace');
    const replaceAllButton = document.getElementById('search-panel-replace-all');
    
    if (replaceRow && replaceButton && replaceAllButton) {
        replaceRow.style.display = 'flex';
        replaceButton.style.display = 'block';
        replaceAllButton.style.display = 'block';
    }
    
    // 定位面板
    positionSearchPanel();
    
    // 如果编辑器中有选中的文本，自动填充到查找输入框
    const editor = getEditor();
    if (editor && _searchInput) {
        const selectedText = editor.getSelection();
        if (selectedText) {
            _searchInput.value = selectedText;
        }
        
        // 聚焦到查找输入框
        _searchInput.focus();
        _searchInput.select();
    }
    
    // 设置ARIA状态
    if (_searchPanel) {
        _searchPanel.setAttribute('aria-hidden', 'false');
    }
}

/**
 * 隐藏搜索面板
 */
function hideSearchPanel() {
    if (!_searchPanel) return;
    
    // 隐藏面板（通过定位在可视区域外）
    _searchPanel.style.top = '-10000px';
    _searchPanel.style.left = '-10000px';
    
    // 清除高亮
    clearHighlight();
    
    // 焦点返回编辑器
    const editor = getEditor();
    if (editor) editor.focus();
    
    // 设置ARIA状态
    _searchPanel.setAttribute('aria-hidden', 'true');
    
    // 更新查找按钮状态
    const findButton = document.getElementById('toolbar-find');
    if (findButton) {
        findButton.setAttribute('aria-expanded', 'false');
    }
}

/**
 * 检查搜索面板是否可见
 * @returns {boolean} 面板是否可见
 */
function isSearchPanelVisible() {
    if (!_searchPanel) return false;
    return _searchPanel.style.top !== '-10000px';
}

/**
 * 设置面板的事件监听器
 */
function setupPanelEvents() {
    if (!_searchPanel) return;
    
    const closeButton = document.getElementById('search-panel-close');
    const findInput = _searchInput; // 已在 initSearchPanel 中获取
    const replaceInput = _replaceInput; // 已在 initSearchPanel 中获取
    const prevButton = document.getElementById('search-panel-prev');
    const nextButton = document.getElementById('search-panel-next');
    const replaceButton = document.getElementById('search-panel-replace');
    const replaceAllButton = document.getElementById('search-panel-replace-all');
    const optionsContainer = _searchPanel.querySelector('.search-panel-options');
    const moreSettingsButton = document.getElementById('search-panel-more-settings');
    const dragHandle = _searchPanel.querySelector('.search-panel-drag-handle'); // Corrected selector

    // 关闭事件
    closeButton?.addEventListener('click', hideSearchPanel);
    _searchPanel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
                hideSearchPanel();
        }
    });

    // 查找输入事件
    findInput?.addEventListener('input', () => {
        findInput.classList.remove('search-input-error');
        const statusArea = document.getElementById('search-panel-status');
        if (statusArea && (statusArea.textContent.includes('No matches') || statusArea.textContent.includes('Invalid'))) {
            updateStatusArea('');
        }
        if (findInput.value === '') {
            clearHighlight();
            updateStatusArea('');
            _matches = [];
            _currentMatch = null;
        }
    });

    findInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (event.shiftKey) {
                findNext(false); 
            } else {
                findNext(true);  
            }
        }
    });

    replaceInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            replace(); 
        }
    });

    prevButton?.addEventListener('click', () => findNext(false));
    nextButton?.addEventListener('click', () => findNext(true));
    replaceButton?.addEventListener('click', replace);
    replaceAllButton?.addEventListener('click', () => {
        // 在实际的 replaceAll 函数中处理确认，或者根据需要保留这里的 confirm
                    replaceAll();
    });
    
    optionsContainer?.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
                    updateOptions();
            if (findInput.value) {
                    find();
            }
        }
    });
    
    // 更多设置按钮点击事件
    if (moreSettingsButton && optionsContainer) {
        moreSettingsButton.addEventListener('click', () => {
            const isCurrentlyCollapsed = optionsContainer.classList.contains('collapsed');
            const iconSpan = moreSettingsButton.querySelector('.search-panel-more-icon');
            
            if (isCurrentlyCollapsed) {
                // 要展开
                optionsContainer.classList.remove('collapsed');
                optionsContainer.style.display = 'flex'; 
                moreSettingsButton.setAttribute('aria-expanded', 'true');
                moreSettingsButton.setAttribute('title', 'Collapse settings');
                optionsContainer.setAttribute('aria-hidden', 'false');
                // Update icon to CHEVRON-UP (indicates collapse next)
                if (iconSpan) iconSpan.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-up"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
                setTimeout(positionSearchPanelIfRequired, 10); 
            } else {
                // 要收起
                optionsContainer.classList.add('collapsed');
                optionsContainer.style.display = 'none'; 
                moreSettingsButton.setAttribute('aria-expanded', 'false');
                moreSettingsButton.setAttribute('title', 'More settings');
                optionsContainer.setAttribute('aria-hidden', 'true');
                // Update icon to CHEVRON-DOWN (indicates expand next)
                if (iconSpan) iconSpan.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
            }
        });
    }
    
    // --- 面板拖动逻辑 ---
    let isDragging = false;
    let panelStartX, panelStartY; // 面板初始位置
    let mouseStartX, mouseStartY; // 鼠标初始位置

    const onDragMouseDown = (e) => {
        e.preventDefault(); // 立即阻止默认行为，因为只在句柄上监听
        
        isDragging = true;
        _searchPanel.style.userSelect = 'none'; 
        _searchPanel.style.cursor = 'grabbing'; // 应用到整个面板以提供反馈

        const computedStyle = window.getComputedStyle(_searchPanel);
        panelStartX = parseFloat(computedStyle.left) || 0;
        panelStartY = parseFloat(computedStyle.top) || 0;
        
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;

        document.addEventListener('mousemove', onDragMouseMove);
        document.addEventListener('mouseup', onDragMouseUp);
    };
        
    const onDragMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault(); // 在实际拖动时才阻止默认行为

        let newLeft = panelStartX + (e.clientX - mouseStartX);
        let newTop = panelStartY + (e.clientY - mouseStartY);

        // 限制拖动范围
        const panelWidth = _searchPanel.offsetWidth;
        const panelHeight = _searchPanel.offsetHeight;
        const maxLeft = window.innerWidth - panelWidth;
        const maxTop = window.innerHeight - panelHeight;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        _searchPanel.style.left = `${newLeft}px`;
        _searchPanel.style.top = `${newTop}px`;
    };

    const onDragMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        _searchPanel.style.userSelect = ''; 
        _searchPanel.style.cursor = 'default'; // 恢复整个面板的鼠标样式
        document.removeEventListener('mousemove', onDragMouseMove);
        document.removeEventListener('mouseup', onDragMouseUp);
    };

    if (dragHandle) { // 将 mousedown 事件绑定到拖动句柄
        dragHandle.addEventListener('mousedown', onDragMouseDown);
            }
    // --- 结束面板拖动逻辑 ---
}

// 新增一个辅助函数，用于在需要时（例如面板可能超出屏幕）才重新定位
// 这个函数暂时只是一个占位符，具体逻辑可以根据需求完善
// 目前，为了解决"点击设置按钮跳回原位"的问题，我们先不调用它，或让它不做任何事
function positionSearchPanelIfRequired() {
    if (!_searchPanel || !isSearchPanelVisible()) return;

    const panelRect = _searchPanel.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // 检查面板底部是否超出视窗
    if (panelRect.bottom > windowHeight) {
        // 计算需要向上移动的偏移量，并额外增加一点边距 (例如 10px)
        const overflowAmount = panelRect.bottom - windowHeight;
        const newTop = Math.max(0, panelRect.top - overflowAmount - 10);
        _searchPanel.style.top = `${newTop}px`;
        // 注意：这里不修改 left，以保留用户拖动后的水平位置
    }
    // 如果面板顶部超出（虽然在展开时不太可能，但拖动后可能发生）
    else if (panelRect.top < 0) {
        _searchPanel.style.top = '0px';
    }
    // 这里还可以添加逻辑检查左右是否超出，但通常拖动逻辑已处理，
    // 且展开操作主要影响高度。
}

/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 防抖处理后的函数
 */
function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * 更新选项状态
 */
function updateOptions() {
    _options.caseSensitive = document.getElementById('search-panel-option-case')?.checked || false;
    _options.wholeWord = document.getElementById('search-panel-option-word')?.checked || false;
    _options.regex = document.getElementById('search-panel-option-regex')?.checked || false;
    _options.inSelection = document.getElementById('search-panel-option-selection')?.checked || false;
    _options.wrapAround = document.getElementById('search-panel-option-wrap')?.checked || true;
}

/**
 * 清除当前匹配项的高亮样式
 */
function clearCurrentMatchHighlight() {
    const editor = getEditor();
    if (!editor || !_currentMatch) return;
    
    // 如果有之前的高亮标记，清除它
    if (_currentMatch.marker && _currentMatch.marker.clear) {
        _currentMatch.marker.clear();
        delete _currentMatch.marker;
    }
}

/**
 * 清除文本高亮
 */
function clearHighlight() {
    const editor = getEditor();
    if (!editor) return;
    
    // 清除当前匹配项的高亮
    clearCurrentMatchHighlight();
    
    // 清除当前高亮的匹配项
    if (_currentMatch) {
        _currentMatch = null;
    }
    
    // 如果有搜索光标，重置它
    _searchCursor = null;
    
    // 移除CodeMirror的overlay模式（如果有的话）
    if (_overlay) {
        editor.removeOverlay(_overlay);
        _overlay = null;
    }
    
    // 清空匹配数组
    _matches = [];
    
    // 更新状态区域
    updateStatusArea();
}

/**
 * 构建查找的正则表达式
 * @returns {RegExp|null} 正则表达式对象，如果查询为空或正则表达式无效则返回null
 */
function buildSearchRegex() {
    if (!_searchInput || !_searchInput.value.trim()) return null;
    
    let query = _searchInput.value;
    
    try {
        let flags = 'g'; // 添加全局标志
        if (!_options.caseSensitive) {
            flags += 'i';
        }
        
        let pattern;
        
        if (_options.regex) {
            // 使用用户输入的正则表达式
            pattern = query;
        } else {
            // 将普通文本转换为正则表达式字符串（转义特殊字符）
            pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // 处理全词匹配
            if (_options.wholeWord) {
                pattern = '\\b' + pattern + '\\b';
            }
        }
        
        return new RegExp(pattern, flags);
    } catch (error) {
        // 正则表达式语法错误
        setSearchError(`Invalid regular expression: ${error.message}`);
        return null;
    }
}

/**
 * 更新状态区域的内容（显示匹配数量和当前位置）
 */
function updateStatusArea() {
    const statusArea = document.getElementById('search-panel-status');
    if (!statusArea) return;
    
    if (_matches.length === 0) {
        if (_searchInput && _searchInput.value.trim()) {
            statusArea.innerHTML = '<span class="search-status-icon">🔍</span> No matches found';
            statusArea.className = 'search-panel-status error';
        } else {
            statusArea.textContent = '';
            statusArea.className = 'search-panel-status';
        }
        return;
    }
    
    // 找出当前匹配项的索引
    let currentIndex = -1;
    if (_currentMatch) {
        currentIndex = _matches.findIndex(match => 
            match.from.line === _currentMatch.from.line && 
            match.from.ch === _currentMatch.from.ch
        );
    }
    
    statusArea.innerHTML = `<span class="search-status-icon">✓</span> ${currentIndex + 1} / ${_matches.length} matches`;
    statusArea.className = 'search-panel-status success';
}

/**
 * 在状态区域显示错误消息并设置输入框样式
 * @param {string} message 错误消息
 */
function setSearchError(message) {
    const statusArea = document.getElementById('search-panel-status');
    if (statusArea) {
        statusArea.innerHTML = `<span class="search-status-icon">⚠️</span> ${message}`;
        statusArea.className = 'search-panel-status error';
    }
    
    // 为搜索输入框添加错误样式
    if (_searchInput) {
        _searchInput.classList.add('search-input-error');
        
        // 500毫秒后移除错误样式
        setTimeout(() => {
            _searchInput.classList.remove('search-input-error');
        }, 800);
    }
}

/**
 * 高亮匹配项的文本
 */
function highlightMatches() {
    const editor = getEditor();
    if (!editor) return;
    
    // 移除现有的高亮
    if (_overlay) {
        editor.removeOverlay(_overlay);
    }
    
    // 获取搜索正则表达式
    const searchRegex = buildSearchRegex();
    if (!searchRegex) return;
    
    // 创建高亮覆盖层
    _overlay = {
        token: function(stream) {
            searchRegex.lastIndex = stream.pos;
            const match = searchRegex.exec(stream.string);
            if (match && match.index === stream.pos) {
                stream.pos += match[0].length || 1;
                return 'cm-search-match-highlight';
            } else if (match) {
                stream.pos = match.index;
            } else {
                stream.skipToEnd();
            }
            return null;
        }
    };
    
    // 应用高亮
    editor.addOverlay(_overlay);
}

/**
 * 执行查找操作
 */
function find() {
    const editor = getEditor();
    if (!editor || !_searchInput) return;
    
    // 清除现有高亮
    clearHighlight();
    
    // 检查查询是否有效
    const query = _searchInput.value.trim();
    if (!query) {
        updateStatusArea(); // 更新状态区域为空
        return;
    }
    
    // 构建正则表达式
    const searchRegex = buildSearchRegex();
    if (!searchRegex) {
        // buildSearchRegex中已处理错误情况
        return;
    }
    
    try {
        // 确定搜索范围
        let from, to;
        if (_options.inSelection) {
            const selection = editor.listSelections()[0];
            if (!selection) {
                _options.inSelection = false;
                document.getElementById('search-panel-option-selection').checked = false;
            } else {
                from = selection.from();
                to = selection.to();
            }
        }
        
        if (!_options.inSelection) {
            from = { line: 0, ch: 0 };
            to = { line: editor.lineCount() - 1, ch: editor.getLine(editor.lineCount() - 1).length };
        }
        
        // 找出所有匹配项 - 修复：使用CodeMirror内置搜索功能的替代方法
        _matches = [];
        
        // 手动搜索所有匹配项（如果CodeMirror的getSearchCursor不可用）
        for (let lineIndex = 0; lineIndex < editor.lineCount(); lineIndex++) {
            const lineContent = editor.getLine(lineIndex);
            
            // 使用正则表达式找出当前行的所有匹配
            let match;
            while ((match = searchRegex.exec(lineContent)) !== null) {
                // 获取匹配的起始和结束位置
                const matchFrom = { line: lineIndex, ch: match.index };
                const matchTo = { line: lineIndex, ch: match.index + match[0].length };
                
                // 检查是否在搜索范围内（如果是在选区内搜索）
                if (_options.inSelection) {
                    if (lineIndex > to.line || 
                        (lineIndex === to.line && match.index > to.ch) ||
                        lineIndex < from.line || 
                        (lineIndex === from.line && match.index + match[0].length < from.ch)) {
                        continue;
                    }
                }
                
                // 保存匹配项
                _matches.push({
                    from: matchFrom,
                    to: matchTo
                });
                
                // 如果使用了非全局正则表达式，需要手动调整索引，防止无限循环
                if (!searchRegex.global) {
                    searchRegex.lastIndex = match.index + 1;
                }
            }
        }
        
        // 高亮所有匹配项
        highlightMatches();
        
        // 如果存在匹配项，跳转到第一个
        if (_matches.length > 0) {
            selectMatch(_matches[0]);
        } else {
            setSearchError('No matches found');
        }
        
        // 更新状态区域
        updateStatusArea();
    } catch (error) {
        console.error('Error during search:', error);
        setSearchError(`Error during search: ${error.message}`);
    }
}

/**
 * 查找下一个或上一个匹配项
 * @param {boolean} forward 是否向前查找
 */
function findNext(forward = true) {
    const editor = getEditor();
    if (!editor || _matches.length === 0) {
        // 如果没有当前匹配项或匹配列表为空，则执行新的查找
        find();
        return;
    }
    
    // 找出当前匹配项的索引
    let currentIndex = -1;
    if (_currentMatch) {
        currentIndex = _matches.findIndex(match => 
            match.from.line === _currentMatch.from.line && 
            match.from.ch === _currentMatch.from.ch
        );
    }
    
    // 计算下一个匹配项的索引
    let nextIndex;
    if (forward) {
        nextIndex = (currentIndex + 1) % _matches.length;
    } else {
        nextIndex = (currentIndex - 1 + _matches.length) % _matches.length;
    }
    
    // 如果不允许循环查找且走到头了，则提示
    if (!_options.wrapAround && ((forward && nextIndex < currentIndex) || (!forward && nextIndex > currentIndex))) {
        const statusArea = document.getElementById('search-panel-status');
        if (statusArea) {
            statusArea.textContent = forward ? 'Reached last match' : 'Reached first match';
        }
        return;
    }
    
    // 选择并跳转到匹配项
    selectMatch(_matches[nextIndex]);
    
    // 更新状态区域
    updateStatusArea();
}

/**
 * 选择并跳转到指定的匹配项
 * @param {Object} match 匹配项，包含from和to位置
 */
function selectMatch(match) {
    const editor = getEditor();
    if (!editor || !match) return;
    
    // 清除之前的当前匹配项高亮
    clearCurrentMatchHighlight();
    
    // 保存当前匹配项
    _currentMatch = match;
    
    // 移动光标并选中匹配文本
    editor.setSelection(match.from, match.to);
    
    // 确保匹配项在视野中，添加平滑滚动效果
    editor.scrollIntoView({
        from: match.from,
        to: match.to
    }, 80); // 减小边距值，使匹配项更居中
    
    // 为当前匹配项添加特殊样式
    _currentMatch.marker = editor.markText(
        match.from, 
        match.to, 
        { className: 'cm-search-match-current' }
    );
    
    // 获取并显示匹配项的上下文（前后几个字符）
    updateMatchContext(match, editor);
    
    // 更新状态显示
    updateStatusArea();
}

/**
 * 更新当前匹配项的上下文预览
 * @param {Object} match 当前匹配项
 * @param {Object} editor CodeMirror编辑器实例
 */
function updateMatchContext(match, editor) {
    if (!match || !editor) return;
    
    const statusArea = document.getElementById('search-panel-status');
    if (!statusArea) return;
    
    // 获取匹配行的内容
    const lineContent = editor.getLine(match.from.line);
    if (!lineContent) return;
    
    // 获取匹配项前后的字符
    const matchText = lineContent.substring(match.from.ch, match.to.ch);
    
    // 计算预览的上下文范围（匹配项前后各20个字符）
    const contextStart = Math.max(0, match.from.ch - 20);
    const contextEnd = Math.min(lineContent.length, match.to.ch + 20);
    
    // 提取上下文
    let beforeContext = lineContent.substring(contextStart, match.from.ch);
    let afterContext = lineContent.substring(match.to.ch, contextEnd);
    
    // 如果上下文被截断，添加省略号
    if (contextStart > 0) beforeContext = '...' + beforeContext;
    if (contextEnd < lineContent.length) afterContext = afterContext + '...';
    
    // 创建带有上下文的HTML
    const contextHTML = `
        <div class="match-context">
            <span class="match-context-before">${escapeHTML(beforeContext)}</span>
            <span class="match-context-highlight">${escapeHTML(matchText)}</span>
            <span class="match-context-after">${escapeHTML(afterContext)}</span>
        </div>
    `;
    
    // 添加上下文HTML到状态区域
    const currentIndex = _matches.findIndex(m => 
        m.from.line === match.from.line && m.from.ch === match.from.ch
    );
    
    statusArea.innerHTML = `
        <span class="search-status-icon">✓</span> ${currentIndex + 1} / ${_matches.length} 个匹配项
        ${contextHTML}
    `;
    statusArea.className = 'search-panel-status success';
    
    // 在初始化时添加上下文样式（如果尚未添加）
    addContextStyles();
}

/**
 * 添加匹配项上下文的CSS样式
 */
function addContextStyles() {
    // 检查是否已添加样式
    if (document.getElementById('search-context-styles')) return;
    
    // 创建样式元素
    const styleElement = document.createElement('style');
    styleElement.id = 'search-context-styles';
    styleElement.textContent = `
        .match-context {
            margin-top: 5px;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-all;
            background-color: rgba(0, 0, 0, 0.04);
            padding: 4px 6px;
            border-radius: 3px;
            max-width: 100%;
            overflow: hidden;
            text-align: left;
        }
        
        .dark-theme .match-context {
            background-color: rgba(255, 255, 255, 0.07);
        }
        
        .match-context-highlight {
            background-color: rgba(255, 152, 0, 0.4);
            font-weight: bold;
            padding: 0 2px;
            border-radius: 2px;
        }
        
        .dark-theme .match-context-highlight {
            background-color: rgba(255, 152, 0, 0.5);
        }
    `;
    
    // 添加样式到文档头部
    document.head.appendChild(styleElement);
}

/**
 * HTML转义函数，防止XSS
 * @param {string} text 需要转义的文本
 * @returns {string} 转义后的安全HTML
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 执行替换操作
 */
function replace() {
    const editor = getEditor();
    if (!editor || !_currentMatch || !_replaceInput) return;
    
    // 获取替换文本
    const replaceText = _replaceInput.value;
    
    // 执行替换
    editor.replaceRange(replaceText, _currentMatch.from, _currentMatch.to);
    
    // 调整当前匹配项的位置（如果替换前后文本长度不同）
    const lenDiff = replaceText.length - (_currentMatch.to.ch - _currentMatch.from.ch);
    
    // 更新后续匹配项的位置
    for (let i = 0; i < _matches.length; i++) {
        const match = _matches[i];
        
        // 跳过当前及之前的匹配项
        if (match.from.line > _currentMatch.from.line || 
            (match.from.line === _currentMatch.from.line && match.from.ch >= _currentMatch.from.ch)) {
            
            // 如果匹配项在同一行，需要调整字符位置
            if (match.from.line === _currentMatch.from.line) {
                match.from.ch += lenDiff;
            }
            if (match.to.line === _currentMatch.from.line) {
                match.to.ch += lenDiff;
            }
        }
    }
    
    // 重新高亮匹配项
    highlightMatches();
    
    // 查找下一个匹配项
    findNext(true);
}

/**
 * 执行全部替换
 */
function replaceAll() {
    const editor = getEditor();
    if (!editor || !_searchInput || !_replaceInput) return;
    
    // 获取查询和替换文本
    const query = _searchInput.value.trim();
    const replaceText = _replaceInput.value;
    
    if (!query) return;
    
    // 构建正则表达式
    const searchRegex = buildSearchRegex();
    if (!searchRegex) return;
    
    // 确定搜索范围
    let from, to;
    if (_options.inSelection) {
        const selection = editor.listSelections()[0];
        if (!selection) {
            _options.inSelection = false;
            document.getElementById('search-panel-option-selection').checked = false;
        } else {
            from = selection.from();
            to = selection.to();
        }
    }
    
    if (!_options.inSelection) {
        from = { line: 0, ch: 0 };
        to = { line: editor.lineCount() - 1, ch: editor.getLine(editor.lineCount() - 1).length };
    }
    
    // 保存初始位置
    const initialPosition = editor.getCursor();
    
    // 执行所有替换
    let replaceCount = 0;
    
    // 使用事务进行所有替换，这样可以作为一个撤销单元
    editor.operation(() => {
        // 首先执行搜索以获得所有匹配项
        const matches = [];
        
        // 复制搜索逻辑，确保匹配项排序从后到前，防止位置偏移
        for (let lineIndex = 0; lineIndex < editor.lineCount(); lineIndex++) {
            const lineContent = editor.getLine(lineIndex);
            
            // 使用正则表达式找出当前行的所有匹配
            let match;
            
            // 重置正则表达式的lastIndex
            searchRegex.lastIndex = 0;
            
            while ((match = searchRegex.exec(lineContent)) !== null) {
                // 获取匹配的起始和结束位置
                const matchFrom = { line: lineIndex, ch: match.index };
                const matchTo = { line: lineIndex, ch: match.index + match[0].length };
                
                // 检查是否在搜索范围内（如果是在选区内搜索）
                if (_options.inSelection) {
                    if (lineIndex > to.line || 
                        (lineIndex === to.line && match.index > to.ch) ||
                        lineIndex < from.line || 
                        (lineIndex === from.line && match.index + match[0].length < from.ch)) {
                        continue;
                    }
                }
                
                // 保存匹配项
                matches.push({
                    from: matchFrom,
                    to: matchTo
                });
                
                // 如果使用了非全局正则表达式，需要手动调整索引，防止无限循环
                if (!searchRegex.global) {
                    searchRegex.lastIndex = match.index + 1;
                }
            }
        }
        
        // 从后向前替换，避免位置偏移问题
        for (let i = matches.length - 1; i >= 0; i--) {
            const match = matches[i];
            editor.replaceRange(replaceText, match.from, match.to);
            replaceCount++;
        }
    });
    
    // 恢复光标位置
    editor.setCursor(initialPosition);
    
    // 更新状态区域
    const statusArea = document.getElementById('search-panel-status');
    if (statusArea) {
        statusArea.textContent = `Replaced ${replaceCount} matches`;
    }
    
    // 清除高亮并重新执行查找
    clearHighlight();
    find();
}

// 导出公共API
export {
    initSearchPanel,
    showSearchPanel,
    hideSearchPanel
};