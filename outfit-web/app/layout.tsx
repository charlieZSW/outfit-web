import './globals.css'
import type { Metadata } from 'next'
import I18nProvider from './i18n/i18nProvider'
import { i18nConfig } from './i18n/config'

export const metadata: Metadata = {
  title: '实用型个性化穿搭助手',
  description: '从你的衣橱中选择物品，获取个性化搭配建议，让穿搭不再烦恼。',
}

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: any
}) {
  // 获取当前语言，默认使用配置中的默认语言
  const locale = params?.locale || i18nConfig.defaultLang;

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&family=Poppins:wght@400;500;600&family=Quicksand:wght@400;500;600;700&family=Space+Mono&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <I18nProvider initialLocale={locale}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
