import React from 'react';

interface DetailItemProps {
    label: string;
    value: React.ReactNode;
    fullWidth?: boolean;
}

export const DetailItem: React.FC<DetailItemProps> = ({ label, value, fullWidth = false }) => {
    if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        return null;
    }

    return (
        <div className={fullWidth ? 'md:col-span-2' : ''}>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{value}</dd>
        </div>
    );
};

interface DetailsSectionProps {
    title: string;
    children: React.ReactNode;
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({ title, children }) => (
    <div className="py-4">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">{title}</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            {children}
        </dl>
    </div>
);