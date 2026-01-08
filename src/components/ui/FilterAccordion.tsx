"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterAccordionProps {
  title: string;
  isOpenDefault?: boolean;
  children: React.ReactNode;
}

export function FilterAccordion({ title, isOpenDefault = false, children }: FilterAccordionProps) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left focus:outline-none"
      >
        <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Conteúdo com animação simples de display */}
      {isOpen && (
        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
