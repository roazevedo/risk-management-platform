"use client";

import React from 'react';
import Dashboard from '@/components/Dashboard';
import { useData } from '@/contexts/DataContext';

const DashboardPage = () => {
    const { processes, risks, controls } = useData();

    return <Dashboard processes={processes} risks={risks} controls={controls} />;
};

export default DashboardPage;
