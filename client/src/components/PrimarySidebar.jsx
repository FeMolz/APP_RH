import React, { useState } from "react";
import { NavLink } from 'react-router-dom';
import { FiMenu, FiChevronLeft } from 'react-icons/fi';
import "./Sidebar.css";
import sidebarData from './SidebarData';

export default function PrimarySidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={collapsed ? 'primary_sidebar collapsed' : 'primary_sidebar'}>
            <div className="sidebar_header">
                <button
                    className="collapse_btn"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    onClick={() => setCollapsed((s) => !s)}
                >
                    {collapsed ? <FiMenu /> : <FiChevronLeft />}
                </button>
                        {!collapsed && (
                            <div className="brand">APP RH</div>
                        )}
            </div>

            <nav className="sidebar_nav" aria-label="Main navigation">
                <ul>
                    {sidebarData.map((item) => (
                        <li key={item.title}>
                            <NavLink to={item.path} className={({ isActive }) => (isActive ? 'link active' : 'link')}>
                                {item.icon && <item.icon className="icon" aria-hidden />}
                                {!collapsed && <span className="title">{item.title}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

