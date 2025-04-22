'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiShoppingBag, FiInfo } from 'react-icons/fi';
import useAppStore from '../store';
import { clothesData } from '../data/clothes';

const SelectedItems = () => {
  const { t } = useTranslation(['common', 'apparel']);
  
  // 分别获取 store 中的状态和函数，避免创建新对象引起无限循环
  const selectedItemIds = useAppStore(state => state.selectedItemIds);
  const removeItem = useAppStore(state => state.removeItem);
  
  // 获取已选衣物的详细信息并按类别分组
  const selectedItems = selectedItemIds.map(id => 
    clothesData.find(item => item.id === id)
  ).filter(Boolean);

  // 按类别分组
  const groupedItems = selectedItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
  
  if (selectedItemIds.length === 0) {
    return (
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm flex items-center justify-center flex-col text-center h-32">
        <FiShoppingBag className="text-text-light mb-2 h-6 w-6 opacity-50" />
        <p className="text-text-light mb-1">
          {t('common:placeholder.no_selected_items')}
        </p>
        <p className="text-xs text-text-light/70">
          {t('common:placeholder.your_items_here')}
        </p>
      </div>
    );
  }
  
  return (
    <div 
      className="mb-8 p-5 bg-white rounded-lg shadow-sm transition-all duration-fast overflow-hidden" 
      data-testid="selected-items-area"
    >
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h3 className="font-medium text-lg flex items-center">
          <FiShoppingBag className="mr-2 text-primary" />
          {t('common:labels.selected_items')}
        </h3>
        <span className="bg-primary text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center">
          {selectedItemIds.length}
          <span className="ml-1 text-[10px]">{t('common:labels.item_unit')}</span>
        </span>
      </div>
      
      <div className="overflow-hidden">
        {Object.entries(groupedItems).map(([category, items]) => {
          const translatedCategory = t(`apparel:category.${category}`);
          return (
            <div key={category} className="mb-4 animate-fade-in">
              <h4 className="text-sm text-text-light mb-2 flex items-center">
                <span className="w-1 h-4 bg-primary rounded-full mr-2 opacity-70"></span>
                {translatedCategory}
              </h4>
              <div className="flex flex-wrap gap-2">
                {items.map(item => {
                  const translatedName = t(`apparel:${item.nameKey}`);
                  const translatedSubCategory = t(`apparel:subcategory.${item.category}.${item.subCategory}`);
                  return (
                    <div 
                      key={item.id}
                      className="group flex items-center bg-secondary/80 hover:bg-secondary px-3 py-2 rounded-lg text-sm 
                        transition-all duration-fast hover:shadow-sm hover:-translate-y-0.5 border border-transparent hover:border-primary/10"
                    >
                      <div className="flex items-center">
                        <span 
                          className="w-4 h-4 rounded-full mr-2 border border-gray-200 flex-shrink-0 shadow-sm" 
                          style={{ backgroundColor: item.colorValue }}
                          title={t(`apparel:color.${item.colorName}`)}
                        ></span>
                        <span>
                          {translatedName}
                          <span className="text-xs text-text-light ml-1">({translatedSubCategory})</span>
                        </span>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="ml-2 opacity-50 group-hover:opacity-100 hover:bg-error/10 hover:text-error 
                          p-1 rounded-full transition-all duration-fast transform group-hover:rotate-90"
                        aria-label={`${t('common:button.delete')} ${translatedName}`}
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedItemIds.length > 0 && selectedItemIds.length < 2 && (
        <div className="mt-3 flex items-start p-3 bg-info/10 text-info rounded-md text-sm border border-info/20 animate-fade-in">
          <FiInfo className="mr-2 flex-shrink-0 mt-0.5" />
          <p>{t('common:messages.minimum_items')}</p>
        </div>
      )}
    </div>
  );
};

export default SelectedItems;
