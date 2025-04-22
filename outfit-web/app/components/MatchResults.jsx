'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAppStore from '../store';
import { clothesData } from '../data/clothes';
import { FiAlertCircle, FiCheck, FiCoffee, FiImage } from 'react-icons/fi';

const MatchResults = () => {
  const { t } = useTranslation();
  
  // 分别获取 store 中的状态，避免创建新对象引起无限循环
  const matchingResults = useAppStore(state => state.matchingResults);
  const isLoading = useAppStore(state => state.isLoading);
  const selectedOccasion = useAppStore(state => state.selectedOccasion);
  const selectedSeason = useAppStore(state => state.selectedSeason);
  const [imageErrors, setImageErrors] = useState({});

  // 图片加载错误处理
  const handleImageError = (resultId) => {
    setImageErrors(prev => ({
      ...prev,
      [resultId]: true
    }));
  };
  
  // 加载状态
  if (isLoading) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
        </div>
        <p className="text-lg font-medium text-text">{t('messages.loading')}</p>
        <p className="text-sm text-text-light mt-2">{t('messages.analyzing')}</p>
        <div className="mt-4 flex justify-center space-x-1">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
        </div>
      </div>
    );
  }
  
  // 如果没有触发搭配，显示空状态
  if (matchingResults.length === 0 && !selectedOccasion && !selectedSeason) {
    return (
      <div id="results-area" className="mt-8 border-t pt-8 border-gray-200">
        <h2 className="text-xl font-medium mb-4 flex items-center">
          <FiCoffee className="mr-2 text-primary" />
          {t('labels.matching_results')}
        </h2>
        <div className="text-center py-16 bg-gradient-to-b from-white to-card-bg rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
            <FiImage className="h-8 w-8 text-text-light opacity-40" />
          </div>
          <p className="text-lg text-text-light">{t('placeholder.waiting_for_match')}</p>
          <p className="text-sm text-text-light mt-2 max-w-md">
            {t('placeholder.waiting_message')}
          </p>
        </div>
      </div>
    );
  }
  
  // 如果已触发搭配但无结果
  if (matchingResults.length === 0) {
    return (
      <div id="results-area" data-testid="results-area" className="mt-8 border-t pt-8 border-gray-200">
        <h2 className="text-xl font-medium mb-4 flex items-center">
          <FiCoffee className="mr-2 text-primary" />
          {t('labels.matching_results')}
        </h2>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="h-8 w-8 text-warning" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t('messages.no_matches')}</h3>
          <p className="text-text-light mb-6">{t('messages.sorry_message')}</p>
          <div className="bg-secondary p-5 rounded-lg inline-block text-left max-w-lg mx-auto">
            <p className="text-sm font-medium mb-2 flex items-center">
              <span className="w-1 h-4 bg-warning rounded-full mr-2"></span>
              {t('messages.try_suggestions')}
            </p>
            <ul className="text-sm space-y-2 ml-3">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-warning rounded-full mr-2"></span>
                {t('messages.suggestion_more_items')}
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-warning rounded-full mr-2"></span>
                {t('messages.suggestion_different_combo')}
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-warning rounded-full mr-2"></span>
                {t('messages.suggestion_less_color')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div id="results-area" data-testid="results-area" className="mt-8 border-t pt-8 border-gray-200">
      <h2 className="text-xl font-medium mb-5 flex items-center">
        <FiCoffee className="mr-2 text-primary" />
        {t('labels.matching_results')}
        <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
          {matchingResults.length}
        </span>
      </h2>
      
      {matchingResults.some(result => result.isFallback) && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-start">
          <FiAlertCircle className="text-warning mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-text">
              {t('messages.fallback_results')}
            </p>
            <p className="text-sm text-text-light mt-1">
              {t('messages.fallback_description')}
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchingResults.map(result => (
          <div 
            key={result.id} 
            className={`bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-fast 
              hover:shadow-md hover:-translate-y-1 group
              ${result.isFallback ? 'border-l-4 border-warning' : 'border-l-4 border-primary'}
            `}
          >
            <div className="aspect-[4/5] bg-card-bg relative overflow-hidden">
              {!imageErrors[result.id] ? (
                <img 
                  src={result.resultImage || '/images/placeholder.svg'} 
                  alt={result.name}
                  className="w-full h-full object-cover transition-transform duration-fast group-hover:scale-105"
                  onError={() => handleImageError(result.id)}
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                  <div className="text-center p-4">
                    <FiImage className="h-12 w-12 text-text-light mx-auto mb-2" />
                    <p className="text-sm text-text-light">{t('messages.image_error')}</p>
                  </div>
                </div>
              )}
              
              {result.isFallback && (
                <div className="absolute top-3 right-3 bg-warning text-white text-xs px-2 py-1 rounded-md shadow-md">
                  {t('tags.approx_match')}
                </div>
              )}
            </div>
            
            <div className="p-5">
              <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors duration-fast">{result.name}</h3>
              
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="bg-secondary px-2 py-1 rounded-md text-xs flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></span>
                  {result.targetOccasion}
                </span>
                <span className="bg-secondary px-2 py-1 rounded-md text-xs flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></span>
                  {result.targetSeason}季
                </span>
              </div>
              
              <p className="text-sm text-text-light">{result.description}</p>
              
              {result.isFallback && result.fallbackReason && (
                <div className="mt-4 text-xs bg-warning/10 p-3 rounded-md border border-warning/20">
                  <p className="font-medium flex items-center">
                    <FiAlertCircle className="mr-1 text-warning" />
                    {result.fallbackReason}
                  </p>
                  {result.missingItems && result.missingItems.length > 0 && (
                    <div className="mt-2 pl-4 pt-2 border-t border-warning/10">
                      <p className="mb-1 text-text-light">{t('tags.suggested_add')}</p>
                      <div className="flex flex-wrap gap-1">
                        {result.missingItems.map(item => {
                          const foundItem = clothesData.find(c => c.id === item.itemId);
                          return foundItem ? (
                            <span key={item.itemId} className="bg-warning/20 text-text-light px-1.5 py-0.5 rounded text-[10px]">
                              {foundItem.name}({foundItem.colorName})
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchResults;
