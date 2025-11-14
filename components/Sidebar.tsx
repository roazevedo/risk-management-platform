
import React from 'react';
// FIX: Removed unused imports for Next.js routing, which is not used in this context.
// import Link from 'next/link';
// import { useRouter } from 'next/router';
import { DashboardIcon, ProcessIcon, ShieldIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
// FIX: Added import for View enum to be used in props.
import { View } from '../types';

// FIX: Added `currentView` and `setView` to props to control component state from App.tsx.
interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    currentView: View;
    setView: (view: View) => void;
}

// FIX: Replaced `href` with `onClick` and changed from Link to a button to work without Next.js router.
const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    isCollapsed: boolean;
}> = ({ icon, label, isActive, onClick, isCollapsed }) => (
    <li>
        <button
            onClick={onClick}
            title={isCollapsed ? label : undefined}
            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 w-full text-left ${isCollapsed ? 'justify-center' : ''} ${
                isActive
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {icon}
            {!isCollapsed && <span className="ml-4 text-sm font-medium whitespace-nowrap">{label}</span>}
        </button>
    </li>
);

// FIX: Updated component to receive and use `currentView` and `setView` props.
export default function Sidebar({ isCollapsed, onToggle, currentView, setView }: SidebarProps) {
    // FIX: Removed Next.js router as it's not used in the App.tsx context.
    // const router = useRouter();
    
    return (
        <aside className={`relative flex-shrink-0 bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="h-20 flex items-center justify-center border-b border-gray-700 px-4">
                {isCollapsed ? 
                    <ShieldIcon className="w-8 h-8 text-indigo-400" /> : 
                    <h1 className="text-2xl font-bold text-white whitespace-nowrap">Risk Platform</h1>
                }
            </div>
            <button
                onClick={onToggle}
                className={`absolute top-6 p-1.5 z-10 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900
                    ${isCollapsed ? 'right-[-16px]' : 'right-4'}`}
                aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            >
                {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
            </button>
            <nav className="flex-1 px-4 py-4">
                <ul>
                    {/* FIX: Updated NavItem to use onClick and derive isActive from `currentView` prop. */}
                    <NavItem
                        icon={<DashboardIcon className="w-5 h-5" />}
                        label="Dashboard"
                        onClick={() => setView(View.DASHBOARD)}
                        isActive={currentView === View.DASHBOARD}
                        isCollapsed={isCollapsed}
                    />
                    {/* FIX: Updated NavItem to use onClick and derive isActive from `currentView` prop. */}
                    <NavItem
                        icon={<ProcessIcon className="w-5 h-5" />}
                        label="Processos"
                        onClick={() => setView(View.PROCESSES)}
                        isActive={[View.PROCESSES, View.RISKS, View.CONTROLS].includes(currentView)}
                        isCollapsed={isCollapsed}
                    />
                </ul>
            </nav>
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500 text-center">&copy; 2024 Risk Management</p>
                </div>
            )}
        </aside>
    );
}
