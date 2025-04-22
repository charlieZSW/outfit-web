'use client';

import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { i18nConfig } from './config';

// 创建客户端i18next实例
const i18nInstance = createInstance();

// 初始化i18next
i18nInstance
  .use(initReactI18next)
  .use(resourcesToBackend((language, namespace) => 
    import(`../../public/locales/${language}/${namespace}.json`)
  ))
  .init({
    debug: process.env.NODE_ENV === 'development',
    lng: i18nConfig.defaultLang,
    fallbackLng: i18nConfig.defaultLang,
    supportedLngs: i18nConfig.supportedLangs,
    defaultNS: i18nConfig.defaultNamespace,
    ns: i18nConfig.namespaces,
    interpolation: {
      escapeValue: false // React已经安全地转义
    }
  });

export default i18nInstance; 