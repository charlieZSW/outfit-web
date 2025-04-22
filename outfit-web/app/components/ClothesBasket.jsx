'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiShoppingBag, FiX } from 'react-icons/fi';
import useAppStore from '../store';
import { clothesData } from '../data/clothes';

const ClothesBasket = () => {
  const { t } = useTranslation(['common', 'apparel']);
  const [isOpen, setIsOpen] = useState(false);
  
  // 获取已选衣物数量和ID
  const selectedItemIds = useAppStore(state => state.selectedItemIds);
  const removeItem = useAppStore(state => state.removeItem);
  
  const selectedItemsCount = selectedItemIds.length;
  
  // 获取已选衣物的详细信息（仅在弹出框打开时需要）
  const selectedItems = isOpen 
    ? selectedItemIds.map(id => clothesData.find(item => item.id === id)).filter(Boolean)
    : [];
  
  // 切换弹出框显示状态
  const toggleBasket = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* 衣篓按钮 */}
      <button 
        onClick={toggleBasket}
        className="relative bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary-hover transition-all duration-fast 
          hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        aria-label={t('common:labels.clothes_basket')}
      >
        <FiShoppingBag className="w-6 h-6" />
        
        {/* 数量指示器 */}
        {selectedItemsCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {selectedItemsCount}
          </span>
        )}
      </button>
      
      {/* 衣篓弹出框 */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 w-80 border border-gray-100 animate-fade-in-up">
          <div className="flex justify-between items-center mb-3 pb-2 border-b">
            <h3 className="font-medium flex items-center">
              <FiShoppingBag className="mr-2 text-primary" />
              {t('common:labels.selected_items')}
            </h3>
            <button 
              onClick={toggleBasket}
              className="text-text-light hover:bg-secondary p-1.5 rounded-full transition-colors duration-fast"
              aria-label={t('common:button.close')}
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          
          {selectedItemsCount === 0 ? (
            <div className="text-center py-4 text-text-light">
              {t('common:placeholder.no_selected_items')}
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto pr-1 -mr-1">
              {selectedItems.map(item => {
                const translatedName = t(`apparel:${item.nameKey}`);
                return (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 group"
                  >
                    <div className="flex items-center">
                      <span 
                        className="w-4 h-4 rounded-full mr-2 border border-gray-200" 
                        style={{ backgroundColor: item.colorValue }}
                      ></span>
                      <span className="text-sm">{translatedName}</span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-error/10 hover:text-error transition-all duration-fast"
                      aria-label={`${t('common:button.delete')} ${translatedName}`}
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* 点击外部区域关闭弹出框的遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[90]" 
          onClick={toggleBasket}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default ClothesBasket; 