"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardIcon, ProcessIcon, ShieldIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { LogOut, FileText, FileBarChart, User } from 'lucide-react';
import { authClient } from '@/src/lib/auth-client';
import ReportModal from '@/src/components/features/reports/ReportModal';
import Image from 'next/image';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    href: string;
    isCollapsed: boolean;
    isExternal?: boolean;
  }> = ({ icon, label, href, isCollapsed, isExternal = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = () => {
    if (isExternal) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(href);
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        title={isCollapsed ? label : undefined}
        className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 w-full text-left ${isCollapsed ? 'justify-center' : ''} ${
            isActive
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <span className="flex-shrink-0">{icon}</span>
        {!isCollapsed && (
          <span className="ml-4 text-sm font-medium leading-tight">
            {label}
          </span>
        )}
      </button>
    </li>
  );
}

const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isCollapsed: boolean;
}> = ({ icon, label, onClick, isCollapsed }) => {
  return (
    <li>
      <button
        onClick={onClick}
        title={isCollapsed ? label : undefined}
        className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 w-full text-left text-gray-400 hover:bg-gray-700 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
      >
        <span className="flex-shrink-0">{icon}</span>
        {!isCollapsed && (
          <span className="ml-4 text-sm font-medium leading-tight">
            {label}
          </span>
        )}
      </button>
    </li>
  );
};

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace('/login');
  };

  return (
    <>
      <aside className={`relative flex-shrink-0 bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-20 flex items-center justify-center border-b border-gray-700 px-4">
          {isCollapsed ?
            <Image
              src="/Logo_Pref.png"
              alt="CGM-Rio"
              width={150}
              height={50}
              className="object-contain"
            /> :
            <Image
              src="/Logo_CGM_Branco.png"
              alt="CGM-Rio"
              width={150}
              height={50}
              className="object-contain"
            />
          }
        </div>
        <button
          onClick={onToggle}
          className={`absolute top-6 p-1.5 z-10 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900
            ${isCollapsed ? 'right-[-16px]' : 'right-4'}`}
          aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        >
          {isCollapsed ?
            <ChevronRightIcon className="w-4 h-4" /> :
            <ChevronLeftIcon className="w-4 h-4" />
          }
        </button>

        <nav className="flex-1 px-4 py-4">
          <ul>
            <NavItem
              icon={<DashboardIcon className="w-5 h-5" />}
              label="Dashboard"
              href="/dashboard"
              isCollapsed={isCollapsed}
            />

            <NavItem
              icon={<ProcessIcon className="w-5 h-5" />}
              label="Processos"
              href="/processes"
              isCollapsed={isCollapsed}
            />

            <NavItem
              icon={<FileText className="w-5 h-5" />}
              label="Política de Gestão de Riscos"
              href="https://controladoria.prefeitura.rio/wp-content/uploads/sites/29/2025/11/Politica-de-Gestao-de-Riscos-da-CGM-Rio.pdf"
              isCollapsed={isCollapsed}
              isExternal={true}
            />

            {/* Separador */}
            <li className="my-4 border-t border-gray-700" />

            {/* Botão de Gerar Relatório */}
            <ActionButton
              icon={<FileBarChart className="w-5 h-5" />}
              label="Gerar Relatório"
              onClick={() => setIsReportModalOpen(true)}
              isCollapsed={isCollapsed}
            />
          </ul>
        </nav>

        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={() => router.push('/user')}
            title={isCollapsed ? "Perfil" : undefined}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 w-full text-left
                        text-gray-400 hover:bg-gray-600 hover:text-white ${isCollapsed ? 'justify-center' : ''}`
                      }
          >
            <User className="w-5 h-5" />
            {!isCollapsed && <span className="ml-4 text-sm font-medium whitespace-nowrap">Perfil</span>}
          </button>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sair" : undefined}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 w-full text-left
                        text-red-400 hover:bg-red-600/20 hover:text-red-300 ${isCollapsed ? 'justify-center' : ''}`
                      }
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-4 text-sm font-medium whitespace-nowrap">Sair</span>}
          </button>
        </div>

        {!isCollapsed && (
          <div className="p-4 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">&copy; 2024 Controladoria-Geral do Município do Rio de Janeiro</p>
          </div>
        )}
      </aside>

      {/* Modal de Relatório */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
}
