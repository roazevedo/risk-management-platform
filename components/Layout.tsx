import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import { useData } from '../contexts/DataContext';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const { isLoggedIn } = useData();
    const router = useRouter();

    useEffect(() => {
        // Se não estiver logado, redireciona para a página de login.
        if (!isLoggedIn) {
            router.push('/login');
        }
    }, [isLoggedIn, router]);

    // Não renderiza nada enquanto verifica o login ou redireciona
    if (!isLoggedIn) {
        return null; 
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ease-in-out">
                {children}
            </main>
        </div>
    );
}
