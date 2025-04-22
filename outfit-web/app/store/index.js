'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { clothesData } from '../data/clothes';
import { rulesData } from '../data/rules';

// 匹配逻辑函数
const matchRules = ({ selectedItems, selectedOccasion, selectedSeason }) => {
  console.log("开始匹配，选择条件:", { selectedItems, selectedOccasion, selectedSeason });
  
  // 首先尝试严格匹配
  const exactMatches = findExactMatches(selectedItems, selectedOccasion, selectedSeason);
  
  // 如果找到了完全匹配的规则，就返回它们
  if (exactMatches.length > 0) {
    console.log("找到严格匹配的规则:", exactMatches.length, "个");
    return exactMatches;
  }
  
  console.log("没有找到严格匹配的规则，尝试退回策略");
  
  // 如果没有找到完全匹配的规则，尝试退回策略
  return findFallbackMatches(selectedItems, selectedOccasion, selectedSeason);
};

// 严格匹配：场合、季节和必需衣物都完全匹配
const findExactMatches = (selectedItems, selectedOccasion, selectedSeason) => {
  return rulesData.filter((rule) => {
    // 场合与季节必须完全匹配
    if (rule.targetOccasion !== selectedOccasion || rule.targetSeason !== selectedSeason) {
      return false;
    }
    
    // 所有必需衣物都必须在选中的衣物中
    const allRequiredItemsSelected = rule.requiredItems.every((requiredItem) => 
      selectedItems.includes(requiredItem.itemId)
    );
    
    return allRequiredItemsSelected;
  });
};

// 退回策略：当严格匹配找不到结果时的替代方案
const findFallbackMatches = (selectedItems, selectedOccasion, selectedSeason) => {
  // 策略1: 放宽季节限制，但保持场合匹配
  const seasonRelaxedMatches = rulesData.filter((rule) => {
    // 只匹配场合，不考虑季节
    if (rule.targetOccasion !== selectedOccasion) {
      return false;
    }
    
    // 所有必需衣物都必须在选中的衣物中
    return rule.requiredItems.every((requiredItem) => 
      selectedItems.includes(requiredItem.itemId)
    );
  });
  
  if (seasonRelaxedMatches.length > 0) {
    console.log("通过放宽季节限制找到匹配:", seasonRelaxedMatches.length, "个");
    return seasonRelaxedMatches.map(rule => ({
      ...rule,
      isFallback: true,
      fallbackReason: `原计划 ${selectedSeason} 季节，实际适合 ${rule.targetSeason} 季节`
    }));
  }
  
  // 策略2: 部分衣物匹配，要求至少选择了部分必需衣物
  // 只在有足够选择的情况下使用此策略
  if (selectedItems.length >= 2) {
    const partialMatches = rulesData.filter((rule) => {
      // 场合必须匹配
      if (rule.targetOccasion !== selectedOccasion) {
        return false;
      }
      
      // 至少有一半(或至少一件)的必需衣物被选中
      const requiredCount = rule.requiredItems.length;
      const matchedCount = rule.requiredItems.filter(item => 
        selectedItems.includes(item.itemId)
      ).length;
      
      return matchedCount > 0 && (matchedCount >= requiredCount / 2 || matchedCount >= 1);
    });
    
    if (partialMatches.length > 0) {
      console.log("通过部分衣物匹配找到:", partialMatches.length, "个");
      return partialMatches.map(rule => {
        const matchedItems = rule.requiredItems.filter(item => 
          selectedItems.includes(item.itemId)
        );
        const missingItems = rule.requiredItems.filter(item => 
          !selectedItems.includes(item.itemId)
        );
        
        return {
          ...rule,
          isFallback: true,
          fallbackReason: `缺少 ${missingItems.length} 件搭配必需品`,
          matchedItems,
          missingItems
        };
      });
    }
  }
  
  // 如果上述策略都没有找到匹配，返回空数组
  console.log("所有退回策略都未找到匹配");
  return [];
};

// 定义store的状态和操作
const storeCreator = (set, get) => ({
  // 用户选择状态
  selectedItemIds: [],
  selectedOccasion: null,
  selectedSeason: null,

  // 筛选 UI 状态
  isDrawerOpen: false,
  drawerCategory: null,
  drawerCurrentView: 'subCategory',
  drawerSubCategory: null,

  // 搭配结果状态
  matchingResults: [],
  isLoading: false,
  
  // Actions
  // 衣物选择
  addItem: (itemId) => set((state) => ({
    selectedItemIds: [...state.selectedItemIds, itemId]
  })),

  removeItem: (itemId) => set((state) => ({
    selectedItemIds: state.selectedItemIds.filter(id => id !== itemId)
  })),

  toggleItem: (itemId) => set((state) => {
    const newSelectedItemIds = [...state.selectedItemIds];
    const index = newSelectedItemIds.indexOf(itemId);
    
    if (index > -1) {
      newSelectedItemIds.splice(index, 1);
    } else {
      newSelectedItemIds.push(itemId);
    }
    
    return { selectedItemIds: newSelectedItemIds };
  }),

  // 场合与季节选择
  setSelectedOccasion: (occasion) => set({ selectedOccasion: occasion }),
  setOccasion: (occasion) => set({ selectedOccasion: occasion }),
  
  setSelectedSeason: (season) => set({ selectedSeason: season }),
  setSeason: (season) => set({ selectedSeason: season }),

  // 抽屉菜单控制
  openDrawer: (category) => set({ 
    isDrawerOpen: true,
    drawerCategory: category,
    drawerCurrentView: 'subCategory',
    drawerSubCategory: null,
  }),
  
  closeDrawer: () => set({ isDrawerOpen: false }),
  
  setDrawerSubCategory: (subCategory) => set({ 
    drawerSubCategory: subCategory, 
    drawerCurrentView: 'style' 
  }),
  
  setDrawerView: (view) => set({ drawerCurrentView: view }),

  // 添加选择分类的方法
  setSelectedCategory: (category) => set({
    drawerCategory: category
  }),

  // 触发搭配匹配
  triggerMatching: () => {
    const { selectedItemIds, selectedOccasion, selectedSeason } = get();
    
    if (!selectedOccasion || !selectedSeason || selectedItemIds.length === 0) {
      console.warn("请选择衣物、场合和季节");
      return;
    }
    
    set({ isLoading: true });

    setTimeout(() => {
      const results = matchRules({
        selectedItems: selectedItemIds,
        selectedOccasion,
        selectedSeason
      });
      
      set({ matchingResults: results, isLoading: false });
    }, 500); // 添加短暂延迟模拟计算过程
  },

  // 清除选择
  clearSelections: () => set({
    selectedItemIds: [],
    selectedOccasion: null,
    selectedSeason: null,
    matchingResults: []
  }),
});

// 创建store - 简化逻辑，避免服务器端/客户端不同处理导致的问题
let store;

// 在创建store之前，先确保我们有一个缓存的服务器快照
const useAppStore = create(
  persist(storeCreator, {
    name: 'wardrobe-assistant-storage',
    storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : null),
    partialize: (state) => ({
      selectedItemIds: state.selectedItemIds,
      selectedOccasion: state.selectedOccasion,
      selectedSeason: state.selectedSeason,
    }),
    // 添加自定义 onRehydrateStorage 回调以确保正确处理服务器端状态
    onRehydrateStorage: () => (state) => {
      if (state) {
        store = state;
      }
    }
  })
);

// 修复 getServerSnapshot 缓存问题
const originalServerSnapshot = useAppStore.getServerSnapshot;
useAppStore.getServerSnapshot = () => {
  return store || originalServerSnapshot();
};

export default useAppStore;
