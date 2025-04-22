/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8CA4EC', // 主要强调色 - 已更改为请求的蓝色
        'primary-hover': '#748AD8', // 主色悬停状态 - 调整为更深的蓝色
        'primary-light': '#A8BCF5', // 浅色主色调 - 调整为更浅的蓝色
        background: '#FFFBF5', // 主背景色
        'card-bg': '#F9F7F3', // 卡片背景色
        secondary: '#F3F4F6', // 次要背景色
        text: '#374151', // 文本色
        'text-light': '#6B7280', // 次要文本色
        success: '#10B981', // 成功状态色
        warning: '#F59E0B', // 警告状态色
        error: '#EF4444', // 错误状态色
        info: '#3B82F6', // 信息状态色
      },
      fontFamily: {
        // 更新默认无衬线字体为Work Sans作为主要正文字体
        sans: ['Work Sans', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        // 添加新的字体类别
        heading: ['Quicksand', 'Comfortaa', 'ui-sans-serif', 'system-ui'],
        body: ['Work Sans', 'Nunito', 'ui-sans-serif', 'system-ui'],
        accent: ['Poppins', 'ui-sans-serif', 'system-ui'],
        mono: ['Space Mono', 'ui-monospace', 'SFMono-Regular']
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '8px',
        'lg': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        'fast': '150ms',
        DEFAULT: '250ms',
        'slow': '350ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
        'pulse-once': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'grow': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-in',
        'pulse-once': 'pulse-once 1s ease-in-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in',
        'grow': 'grow 0.2s ease-out',
      }
    },
  },
  plugins: [],
}

