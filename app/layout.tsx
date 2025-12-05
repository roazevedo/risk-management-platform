import React from 'react';
import ThemeProvider from '@/components/theme-provider';
import { DataProvider } from '@/contexts/DataContext';
import '@/styles//globals.css';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    // A tag HTML deve ser configurada aqui
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Adicione suas meta tags e links aqui, se necessário */}
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="#" />
      </head>
      <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DataProvider>
            {children}
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
