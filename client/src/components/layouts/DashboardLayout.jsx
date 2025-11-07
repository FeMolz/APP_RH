import React from 'react';
import { Outlet } from 'react-router-dom';
import PrimarySidebar from '../PrimarySidebar';
import './Layouts.css';

export default function DashboardLayout() {
    return (
        <div className="dashboard_layout">
            <PrimarySidebar />
            <main className="dashboard_content">
                <Outlet />
            </main>
        </div>
    );
}
