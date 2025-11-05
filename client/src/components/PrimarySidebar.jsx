import React from "react";
import { NavLink } from 'react-router-dom';
import "./Sidebar.css";
import sidebarData from './SidebarData';

export default function PrimarySidebar() {
    return (
        <aside className="primary_sidebar">
            <div className="sidebar_header">
                <div className="brand">APP RH</div>
            </div>

            <nav className="sidebar_nav" aria-label="Main navigation">
                <ul>
                    {sidebarData.map((item) => (
                        <li key={item.title}>
                            <NavLink to={item.path} className={({ isActive }) => (isActive ? 'link active' : 'link')}>
                                {item.icon && <item.icon className="icon" aria-hidden />}
                                <span className="title">{item.title}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

