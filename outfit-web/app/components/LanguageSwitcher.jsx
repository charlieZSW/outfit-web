'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';
import { i18nConfig } from '../i18n/config';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // 在组件挂载时从localStorage读取保存的语言
  useEffect(() => {
    const savedLang = localStorage.getItem('wardrobe-lang');
    if (savedLang && i18nConfig.supportedLangs.includes(savedLang)) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);
  
  // 切换语言
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('wardrobe-lang', lang);
    setIsOpen(false);
  };
  
  // 语言名称映射
  const languageNames = {
    'zh-CN': '中文',
    'zh': '中文',
    'en': 'English'
  };
  
  return (
    <div className="relative z-20">
      <button 
        className="flex items-center p-2 rounded-md hover:bg-primary/10 transition-colors duration-fast"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('languages.language')}
        aria-expanded={isOpen}
      >
        <FiGlobe className="mr-2" />
        <span className="text-sm">{languageNames[i18n.language] || i18n.language}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-1 z-20 border border-gray-100 animate-fadeIn">
          {i18nConfig.supportedLangs.map(lang => (
            <button
              key={lang}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors duration-fast flex items-center justify-between
                ${i18n.language === lang ? 'bg-primary/5 font-medium' : ''}`}
              onClick={() => changeLanguage(lang)}
            >
              {languageNames[lang] || lang}
              {i18n.language === lang && (
                <span className="w-2 h-2 rounded-full bg-primary"></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 