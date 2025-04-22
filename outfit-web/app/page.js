'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import StoreContainer from './components/StoreContainer';
import { categories } from './data/clothes';
import CategoryBanner from './components/CategoryBanner';
import DrawerMenu from './components/DrawerMenu';
import SelectedItems from './components/SelectedItems';
import OccasionSeasonSelector from './components/OccasionSeasonSelector';
import MatchResults from './components/MatchResults';
import LanguageSwitcher from './components/LanguageSwitcher';
import useAppStore from './store';
import { FiShoppingBag, FiRefreshCw, FiZap, FiMap, FiUser, FiCommand } from 'react-icons/fi';
import ClothesBasket from './components/ClothesBasket';

// 包装store相关的组件部分
const HomeContent = () => {
  const { t } = useTranslation(['common', 'apparel']);
  
  // 分别获取 store 中的函数，避免创建新对象引起无限循环
  const triggerMatching = useAppStore(state => state.triggerMatching);
  const clearSelections = useAppStore(state => state.clearSelections);
  const selectedItemIds = useAppStore(state => state.selectedItemIds);
  const selectedOccasion = useAppStore(state => state.selectedOccasion);
  const selectedSeason = useAppStore(state => state.selectedSeason);
  
  // 是否禁用生成按钮
  const isGenerateDisabled = selectedItemIds.length === 0 || !selectedOccasion || !selectedSeason;
  
  // 图标映射函数
  const getCategoryIcon = (category) => {
    const categoryLower = category.toLowerCase();
    switch(categoryLower) {
      case 'tops':
        return <FiUser />;
      case 'bottoms':
        return <FiCommand />;
      case 'footwear':
        return <FiMap />;
      default:
        return <FiShoppingBag />;
    }
  };
  
  return (
    <>
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-medium mb-5 flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <FiShoppingBag className="text-primary" />
          </div>
          {t('common:labels.select_items')}
        </h2>
        <div className="space-y-2">
          {categories.map(category => (
            <CategoryBanner 
              key={category} 
              category={category} 
              icon={getCategoryIcon(category)}
            />
          ))}
        </div>
      </div>
      
      <SelectedItems />
      
      <OccasionSeasonSelector />
      
      <div className="flex gap-4 mb-12">
        <button 
          onClick={triggerMatching}
          disabled={isGenerateDisabled}
          className={`flex-1 py-4 rounded-lg shadow-sm transition-all duration-fast flex items-center justify-center font-medium text-lg
            ${isGenerateDisabled 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary-hover hover:shadow transform hover:-translate-y-1'}`}
          aria-disabled={isGenerateDisabled}
        >
          <div className={`mr-3 w-6 h-6 rounded-full flex items-center justify-center
            ${isGenerateDisabled ? 'bg-gray-300' : 'bg-white/20'}`}>
            <FiZap className={isGenerateDisabled ? 'text-gray-400' : 'text-white'} size={16} />
          </div>
          {t('common:button.generate')}
        </button>
        
        <button 
          onClick={clearSelections}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-secondary transition-all duration-fast flex items-center justify-center group"
          aria-label={t('common:button.cancel')}
          disabled={selectedItemIds.length === 0 && !selectedOccasion && !selectedSeason}
        >
          <FiRefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-fast" />
        </button>
      </div>
      
      <MatchResults />
      
      <DrawerMenu />
      
      <ClothesBasket />
    </>
  );
};

// 主页面组件
export default function Home() {
  const { t } = useTranslation('common');
  
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-10 pb-6 text-center sm:text-left relative overflow-visible">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
          
          <div className="flex justify-between items-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-primary relative z-10">{t('title')}</h1>
            <div className="relative z-20">
              <LanguageSwitcher />
            </div>
          </div>
          
          <p className="text-text-light max-w-2xl mx-auto sm:mx-0">{t('description')}</p>
        </header>
        
        <StoreContainer>
          <HomeContent />
        </StoreContainer>
        
        <footer className="mt-16 pt-8 border-t text-center text-text-light text-sm">
          <p>{t('footer')}</p>
        </footer>
      </div>
    </main>
  );
}
