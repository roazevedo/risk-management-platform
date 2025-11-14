import React from 'react';
import type { AppProps } from 'next/app';
import { DataProvider } from '../contexts/DataContext';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps, router }: AppProps) {
  // A página de login não usa o layout principal com a barra lateral
  if (router.pathname === '/login') {
    return (
      <DataProvider>
        <Component {...pageProps} />
      </DataProvider>
    );
  }

  return (
    <DataProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </DataProvider>
  );
}

export default MyApp;
