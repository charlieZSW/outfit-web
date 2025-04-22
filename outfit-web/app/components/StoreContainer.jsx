'use client';

import React, { useEffect, useState } from 'react';
import useAppStore from '../store';

// 用于避免服务器端渲染时访问store的包装器组件
const StoreContainer = ({ children }) => {
  // 这个状态用于确保组件仅在客户端渲染
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 在客户端渲染之前，返回一个加载中的状态或空内容
  if (!isClient) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    </div>;
  }

  // 仅在客户端渲染后渲染子组件
  return <>{children}</>;
};

export default StoreContainer; 