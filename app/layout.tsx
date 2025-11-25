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

// import React from 'react';
// import type { AppProps } from 'next/app';
// import { DataProvider } from '../contexts/DataContext';
// // import { ThemeProvider } from '../components/Theme-Provider';
// import Layout from './(dashboard)/layout';

// function MyApp({ Component, pageProps, router }: AppProps) {

//   // O conteúdo da página atual
//   const pageContent = <Component {...pageProps} />;

//   // A lógica decide se a página renderiza com ou sem o Layout (Sidebar e Guarda de Rota)
//   const contentWithLayout = router.pathname === '/login' ? (
//     // Se for Login, renderiza APENAS o componente da página (sem Layout)
//     pageContent
//   ) : (
//     // Se não for Login (páginas protegidas), renderiza o conteúdo envolvido pelo Layout
//     <Layout>
//       {pageContent}
//     </Layout>
//   );

//   return (
//     // 1. ThemeProvider no topo: Deve ser incondicional para injetar o tema (dark/light) em <html>
//     // <ThemeProvider
//     //   attribute="class" // Adiciona a classe 'dark' ao <html>
//     //   defaultTheme="system"
//     //   enableSystem
//     //   disableTransitionOnChange
//     // >
//       // {/* 2. DataProvider: Envolve todo o conteúdo para garantir que useData() funcione em qualquer lugar */}
//       <DataProvider>
//         {/* Renderiza o conteúdo (Login ou Página Protegida com Layout) */}
//         {contentWithLayout}
//       </DataProvider>
//     // </ThemeProvider>
//   );
// }

// export default MyApp;
