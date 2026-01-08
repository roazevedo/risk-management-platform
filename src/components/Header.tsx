import React from 'react';
// import { ModeToggle } from './ModeToggle'; // Ajuste o caminho conforme onde ModeToggle.tsx está

export default function Header() {
  return (
    <div className="flex justify-end items-center mb-6 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Aqui você pode adicionar um Título, Breadcrumbs, Notificações, etc. */}
      {/* Exemplo de título que muda de cor com o tema */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mr-auto">
        Dashboard
      </h2>

      {/* Botão de Alternância de Tema */}
      {/* <ModeToggle /> */}
    </div>
  );
}
