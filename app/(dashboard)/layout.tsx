"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useData();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // 💡 useEffect: Apenas redireciona se o estado estiver 'false'
  useEffect(() => {
    if (isLoggedIn === false) {
      // Se não estiver logado, redireciona para a página de login
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  // 💡 BLOQUEIO: Se o estado inicial for 'false', BLOQUEIA a renderização.
  // Isso garante que o usuário não veja o Dashboard antes do redirecionamento.
  if (isLoggedIn === false) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500">A verificar autenticação...</p>
      </div>
    );
  }

  // ... Renderiza a Sidebar e o Main (Se isLoggedIn === true)
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* ... Sidebar e Main ... */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ease-in-out">
        <Header />
        {children}
      </main>
    </div>
  );
}
