'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAppStore from '../store';

const CategoryBanner = ({ category, icon }) => {
  const { t } = useTranslation(['apparel', 'common']);
  const openDrawer = useAppStore((state) => state.openDrawer);
  const [isHovered, setIsHovered] = useState(false);
  
  // 翻译类别名称
  const translatedCategory = t(`apparel:category.${category.toLowerCase()}`);

  return (
    <div 
      className={`flex items-center p-4 mb-3 bg-white rounded-lg shadow-sm border-l-4 border-primary 
        transition-all duration-fast cursor-pointer
        ${isHovered ? 'transform -translate-y-1 shadow-md scale-[1.01] border-l-[6px]' : ''}
      `}
      onClick={() => openDrawer(category)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={t('common:labels.select_category', { category: translatedCategory })}
    >
      {icon && (
        <div className={`mr-3 text-xl text-primary transition-all duration-fast ${isHovered ? 'scale-110' : ''}`}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h2 className={`text-lg font-medium transition-all duration-fast ${isHovered ? 'text-primary' : ''}`}>
          {translatedCategory}
        </h2>
        <p className="text-sm text-text-light">
          {t('common:placeholder.click_to_select', { category: translatedCategory })}
        </p>
      </div>
      <div className="ml-auto">
        <svg 
          className={`w-5 h-5 text-primary transition-all duration-fast 
            ${isHovered ? 'transform translate-x-1 scale-110' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default CategoryBanner;
