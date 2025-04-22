'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18nInstance from './index';
import { i18nConfig } from './config';

// 创建语言切换上下文提供器
export default function I18nProvider({ children, initialLocale }) {
  const [mounted, setMounted] = useState(false);
  
  // 在客户端挂载后初始化语言
  useEffect(() => {
    // 优先使用传入的 initialLocale
    // 如果没有，尝试从 localStorage 获取
    // 如果仍没有，使用默认语言
    const storedLang = typeof window !== 'undefined' 
      ? localStorage.getItem('wardrobe-lang') 
      : null;
    
    const userLang = initialLocale || storedLang || i18nConfig.defaultLang;
    
    // 切换语言
    if (i18nInstance.language !== userLang) {
      i18nInstance.changeLanguage(userLang);
    }
    
    setMounted(true);
  }, [initialLocale]);
  
  // 在服务器端渲染时，或客户端加载期间，直接返回子组件
  // 避免在语言加载前渲染导致闪烁
  if (!mounted) return children;
  
  return (
    <I18nextProvider i18n={i18nInstance}>
      {children}
    </I18nextProvider>
  );
} 