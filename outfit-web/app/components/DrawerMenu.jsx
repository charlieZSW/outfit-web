'use client';

import React, { useState } from 'react';
import { FiX, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import useAppStore from '../store';
import { subCategories, availableColors, clothesData, styleOptions } from '../data/clothes';

const DrawerMenu = () => {
  const { t } = useTranslation(['apparel', 'common']);
  
  // 分别获取 store 中的状态和函数，避免创建新对象引起无限循环
  const isDrawerOpen = useAppStore(state => state.isDrawerOpen);
  const drawerCategory = useAppStore(state => state.drawerCategory);
  const drawerCurrentView = useAppStore(state => state.drawerCurrentView);
  const drawerSubCategory = useAppStore(state => state.drawerSubCategory);
  const closeDrawer = useAppStore(state => state.closeDrawer);
  const setDrawerSubCategory = useAppStore(state => state.setDrawerSubCategory);
  const setDrawerView = useAppStore(state => state.setDrawerView);
  const toggleItem = useAppStore(state => state.toggleItem);
  const selectedItemIds = useAppStore(state => state.selectedItemIds);

  // 本地状态，用于暂存选择（未提交到全局状态）
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  // 获取翻译后的类别名称
  const translatedCategory = drawerCategory ? t(`apparel:category.${drawerCategory.toLowerCase()}`) : '';
  // 获取翻译后的子类别名称
  const translatedSubCategory = drawerSubCategory ? 
    t(`apparel:subcategory.${drawerCategory.toLowerCase()}.${drawerSubCategory.toLowerCase()}`) : '';

  // 当前类别下的所有款式
  const availableStyles = drawerSubCategory
    ? [...new Set(clothesData
        .filter(item => item.category === drawerCategory && item.subCategory === drawerSubCategory)
        .map(item => item.styleKey))]
    : [];

  // 处理款式选择变更
  const handleStyleChange = (styleKey) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleKey)) {
        return prev.filter(s => s !== styleKey);
      } else {
        return [...prev, styleKey];
      }
    });
  };

  // 处理颜色选择变更
  const handleColorChange = (colorName) => {
    setSelectedColors(prev => {
      if (prev.includes(colorName)) {
        return prev.filter(c => c !== colorName);
      } else {
        return [...prev, colorName];
      }
    });
  };

  // 添加选中的款式和颜色到全局状态
  const handleAddToSelection = () => {
    if (selectedStyles.length === 0 || selectedColors.length === 0) {
      return; // 需要至少选一个款式和一个颜色
    }

    // 针对每个选择的款式和颜色组合，找到对应的衣物ID并添加到选择中
    selectedStyles.forEach(styleKey => {
      selectedColors.forEach(color => {
        const matchingItems = clothesData.filter(
          item => item.category === drawerCategory &&
                 item.subCategory === drawerSubCategory &&
                 item.styleKey === styleKey &&
                 item.colorName === color
        );

        matchingItems.forEach(item => {
          toggleItem(item.id);
        });
      });
    });

    // 清空本地选择状态
    setSelectedStyles([]);
    setSelectedColors([]);
    
    // 返回到子分类视图
    setDrawerView('subCategory');
  };

  if (!isDrawerOpen) return null;

  const renderSubCategoryView = () => (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4 text-text">{t('common:labels.select_type')}</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {subCategories[drawerCategory]?.map((subCategory) => {
          const translatedSubCat = t(`apparel:subcategory.${drawerCategory.toLowerCase()}.${subCategory.toLowerCase()}`);
          return (
            <div 
              key={subCategory}
              className="p-3 bg-white rounded-lg shadow-sm hover:bg-primary/10 cursor-pointer transition-all duration-fast 
                flex items-center hover:shadow hover:-translate-y-0.5 border border-transparent hover:border-primary/20"
              onClick={() => setDrawerSubCategory(subCategory)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => e.key === 'Enter' && setDrawerSubCategory(subCategory)}
            >
              <span className="flex-1">{translatedSubCat}</span>
              <span className="text-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStyleView = () => (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setDrawerView('subCategory')}
          className="p-2 rounded-full hover:bg-secondary mr-2 transition-colors duration-fast focus:outline-none 
            focus:ring-2 focus:ring-primary focus:ring-opacity-50 hover:bg-primary/10"
          aria-label={t('common:button.back')}
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-medium text-primary">{translatedSubCategory}</h3>
      </div>
      
      <div className="mb-8">
        <h4 className="text-md font-medium mb-3 flex items-center">
          <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
          {t('common:labels.select_style')}
        </h4>
        <div className="space-y-2">
          {availableStyles.length > 0 ? (
            availableStyles.map(styleKey => {
              const translatedStyle = t(`apparel:${styleKey}`);
              return (
                <div 
                  key={styleKey}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-fast flex items-center
                    ${selectedStyles.includes(styleKey) 
                      ? 'bg-primary/20 border border-primary shadow-sm' 
                      : 'bg-white hover:bg-primary/10 border border-transparent hover:border-primary/30'}`}
                  onClick={() => handleStyleChange(styleKey)}
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={selectedStyles.includes(styleKey)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStyleChange(styleKey)}
                >
                  <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center transition-all duration-fast
                    ${selectedStyles.includes(styleKey) ? 'bg-primary text-white scale-110' : 'border border-gray-300'}`}>
                    {selectedStyles.includes(styleKey) && <FiCheck className="h-3 w-3" />}
                  </div>
                  <label className="cursor-pointer flex-1">{translatedStyle}</label>
                </div>
              );
            })
          ) : (
            <div className="text-text-light italic p-4 bg-secondary/50 rounded-lg text-center">
              {t('common:messages.no_styles_available')}
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="text-md font-medium mb-3 flex items-center">
          <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
          {t('common:labels.select_color')}
        </h4>
        <div className="grid grid-cols-4 gap-3">
          {availableColors.map((color) => {
            const translatedColor = t(`apparel:color.${color.name.toLowerCase()}`);
            return (
              <div 
                key={color.name}
                className={`flex flex-col items-center p-2 rounded-md cursor-pointer transition-all duration-fast
                  ${selectedColors.includes(color.name) 
                    ? 'bg-primary/10 transform scale-105' 
                    : 'hover:bg-secondary'}`}
                onClick={() => handleColorChange(color.name)}
                tabIndex={0}
                role="checkbox"
                aria-checked={selectedColors.includes(color.name)}
                aria-label={`${translatedColor} ${t('common:labels.color')}`}
                onKeyDown={(e) => e.key === 'Enter' && handleColorChange(color.name)}
              >
                <div className="relative">
                  <div 
                    className={`w-10 h-10 rounded-full mb-1 border-2 transition-all duration-fast shadow
                      ${selectedColors.includes(color.name) 
                        ? 'border-primary transform scale-110' 
                        : 'border-gray-200'}`}
                    style={{ backgroundColor: color.value }}
                  ></div>
                  {selectedColors.includes(color.name) && (
                    <div className="absolute top-0 right-0 bg-primary text-white rounded-full w-5 h-5 
                      flex items-center justify-center -mr-1 -mt-1 animate-pulse-once shadow-md">
                      <FiCheck className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{translatedColor}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <button 
        className={`w-full mt-8 py-3 rounded-lg transition-all duration-fast flex items-center justify-center font-medium
          ${(selectedStyles.length > 0 && selectedColors.length > 0)
            ? 'bg-primary text-white hover:bg-primary-hover shadow hover:shadow-md hover:-translate-y-1' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
        onClick={handleAddToSelection}
        disabled={selectedStyles.length === 0 || selectedColors.length === 0}
      >
        <FiCheck className="mr-2" />
        {t('common:button.confirm')}
      </button>
    </div>
  );

  // 抽屉动画类
  const drawerAnimationClass = isDrawerOpen
    ? 'translate-x-0 opacity-100'
    : 'translate-x-full opacity-0';

  // 遮罩动画类
  const overlayAnimationClass = isDrawerOpen
    ? 'opacity-100'
    : 'opacity-0 pointer-events-none';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 半透明遮罩 */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-normal ${overlayAnimationClass}`}
        onClick={closeDrawer}
        aria-hidden="true"
      ></div>
      
      {/* 抽屉内容 */}
      <div 
        className={`w-full max-w-md bg-background h-full overflow-y-auto shadow-lg transition-all duration-normal 
          ${drawerAnimationClass} border-l border-gray-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-background z-10 backdrop-blur-sm bg-opacity-95">
          <h2 id="drawer-title" className="text-xl font-medium text-primary">{translatedCategory}</h2>
          <button 
            onClick={closeDrawer}
            className="p-2 rounded-full hover:bg-secondary transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            aria-label={t('common:button.cancel')}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        <div className="transition-all duration-normal">
          {drawerCurrentView === 'subCategory' ? renderSubCategoryView() : renderStyleView()}
        </div>
      </div>
    </div>
  );
};

export default DrawerMenu;
