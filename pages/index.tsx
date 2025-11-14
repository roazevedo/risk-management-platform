import React from 'react';
import type { NextPage } from 'next';
import Dashboard from '../components/Dashboard';
import { useData } from '../contexts/DataContext';

const DashboardPage: NextPage = () => {
    const { processes, risks, controls } = useData();

    return <Dashboard processes={processes} risks={risks} controls={controls} />;
};

export default DashboardPage;
