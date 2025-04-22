'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiMapPin, FiSun, FiCloudSnow, FiCloud, FiWind, FiBriefcase, FiHeart, FiCoffee, FiActivity, FiInfo } from 'react-icons/fi';
import useAppStore from '../store';
import { occasions, seasons } from '../data/clothes';

// 场合对应的图标和描述
const occasionIcons = {
  '日常': { icon: <FiCalendar className="h-4 w-4" />, desc: "日常休闲穿着" },
  '通勤': { icon: <FiBriefcase className="h-4 w-4" />, desc: "上班、上学着装" },
  '休闲': { icon: <FiCoffee className="h-4 w-4" />, desc: "周末休闲时光" },
  '约会': { icon: <FiHeart className="h-4 w-4" />, desc: "约会、社交场合" },
  '运动': { icon: <FiActivity className="h-4 w-4" />, desc: "运动、健身活动" },
  '正式': { icon: <FiMapPin className="h-4 w-4" />, desc: "正式、商务场合" },
};

// 季节对应的图标和描述
const seasonIcons = {
  '春': { icon: <FiCloud className="h-4 w-4" />, desc: "温暖舒适，春风和煦" },
  '夏': { icon: <FiSun className="h-4 w-4" />, desc: "炎热明媚，清凉舒爽" },
  '秋': { icon: <FiWind className="h-4 w-4" />, desc: "凉爽宜人，层次穿搭" },
  '冬': { icon: <FiCloudSnow className="h-4 w-4" />, desc: "寒冷季节，保暖为主" },
};

// 选项数据（可根据实际需求从外部导入）
const occasionOptions = [
  { id: 'daily', label: '日常' },
  { id: 'work', label: '通勤' },
  { id: 'casual', label: '休闲' },
  { id: 'date', label: '约会' },
  { id: 'sport', label: '运动' },
  { id: 'formal', label: '正式' }
];

const seasonOptions = [
  { id: 'spring', label: '春' },
  { id: 'summer', label: '夏' },
  { id: 'autumn', label: '秋' },
  { id: 'winter', label: '冬' }
];

const OccasionSeasonSelector = () => {
  const { t } = useTranslation(['common', 'apparel']);
  
  // 分别获取 store 中的状态和函数，避免创建新对象引起无限循环
  const selectedOccasion = useAppStore(state => state.selectedOccasion);
  const selectedSeason = useAppStore(state => state.selectedSeason);
  const setSelectedOccasion = useAppStore(state => state.setSelectedOccasion);
  const setSelectedSeason = useAppStore(state => state.setSelectedSeason);
  
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <FiMapPin className="text-primary" />
          </div>
          {t('labels.occasions')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {occasionOptions.map(option => (
            <button
              key={option.id}
              className={`px-4 py-2 rounded-full transition-all duration-fast text-sm 
                ${selectedOccasion === option.id ? 
                  'bg-primary text-white shadow-md' : 
                  'bg-secondary hover:bg-primary/20'}`}
              onClick={() => setSelectedOccasion(option.id)}
              aria-pressed={selectedOccasion === option.id}
            >
              {t(`occasion.${option.id}`, { ns: 'apparel' })}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <FiCalendar className="text-primary" />
          </div>
          {t('labels.seasons')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {seasonOptions.map(option => (
            <button
              key={option.id}
              className={`px-4 py-2 rounded-full transition-all duration-fast text-sm
                ${selectedSeason === option.id ? 
                  'bg-primary text-white shadow-md' : 
                  'bg-secondary hover:bg-primary/20'}`}
              onClick={() => setSelectedSeason(option.id)}
              aria-pressed={selectedSeason === option.id}
            >
              {t(`season.${option.id}`, { ns: 'apparel' })}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OccasionSeasonSelector;
