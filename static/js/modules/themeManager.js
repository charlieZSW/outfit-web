import { THEME_STORAGE_KEY } from './config.js';
import { bodyElement, themeToggleButton, themeIconSun, themeIconMoon } from './domElements.js';
import { getEditor } from './state.js';

// Module-level state
let currentTheme = 'light';

// Private helper function (internal to the module)
function _updateIcon(theme) {
    if (themeIconSun && themeIconMoon) {
        if (theme === 'dark') {
            themeIconSun.style.display = 'none';
            themeIconMoon.style.display = 'inline-block'; // Or 'block'
        } else {
            themeIconSun.style.display = 'inline-block'; // Or 'block'
            themeIconMoon.style.display = 'none';
        }
    }
}

// Public function to apply a theme
function applyTheme(theme) {
    if (!bodyElement) {
        console.error("Cannot apply theme: body element not found.");
        return;
    }
    // console.log(`[applyTheme] Called with theme: ${theme}. Current body class: '${bodyElement.className}'`);
    bodyElement.classList.remove('light-theme', 'dark-theme'); // Ensure clean slate
    // console.log(`[applyTheme] After remove, body class: '${bodyElement.className}'`);
    bodyElement.classList.add(theme + '-theme'); // Add the new theme class
    // console.log(`[applyTheme] After add '${theme}-theme', body class: '${bodyElement.className}'`);
    currentTheme = theme; // Update module state
    localStorage.setItem(THEME_STORAGE_KEY, theme); // Use imported constant

    // Update CodeMirror theme
    const editor = getEditor(); // Get editor instance when needed
    if (editor) {
        editor.setOption("theme", theme === 'dark' ? 'material-darker' : 'material-lighter');
    }

    // Update toggle button state and icon (NEW)
    if (themeToggleButton) {
         themeToggleButton.setAttribute('aria-pressed', theme === 'dark');
         _updateIcon(theme); // Update icon based on the applied theme
    }

    // console.log(`Theme applied: ${theme}`); // Removed success log
}

// Public function to toggle the theme
export function toggle() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'; // Use module state
    applyTheme(newTheme);
}

// Public function to initialize the theme
export function init() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    // Ensure elements exist before trying to access them
    if (!bodyElement) {
        console.error('ThemeManager init failed: body element not found.');
        return;
    }
    // Icons are checked within _updateIcon now, but button check is useful
    if (!themeToggleButton) {
        console.warn('ThemeManager init: Theme toggle button not found.');
    }
     // Warning if icons are missing within the button - useful for setup verification
    if (themeToggleButton && (!themeIconSun || !themeIconMoon)) {
       console.warn('ThemeManager init: Theme icons not found within the toggle button. Icon switching might not work.');
    }

    // console.log(`Initializing theme. Saved: ${savedTheme}, PrefersDark: ${prefersDark}, Initial: ${initialTheme}`); // Removed info log
    applyTheme(initialTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Only change if no theme preference is saved
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            // console.log('System theme changed, applying new theme.'); // Removed info log
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Click listener setup will be handled in main.js
    // No longer adding listener here as main.js should coordinate listeners
    // if (themeToggleButton) {
    //     themeToggleButton.addEventListener('click', toggle); // Remove this listener setup
    // }
} 