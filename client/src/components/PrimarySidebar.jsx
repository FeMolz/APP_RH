import React, { useState } from "react";
import { NavLink } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import "./Sidebar.css";
import sidebarData from './SidebarData';

export default function PrimarySidebar() {
    const [subnav, setSubnav] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);

    const showSubnav = (title) => {
        if (expandedItem === title) {
            setExpandedItem(null);
        } else {
            setExpandedItem(title);
        }
    };

    return (
        <aside className="primary_sidebar">
            <div className="sidebar_header">
                <div className="brand">CVF Incorporadora</div>
            </div>

            <nav className="sidebar_nav" aria-label="Main navigation">
                <ul>
                    {sidebarData.map((item) => (
                        <li key={item.title}>
                            <div className="menu_item_container">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => (isActive ? 'link active' : 'link')}
                                    onClick={(e) => {
                                        if (item.subNav) {
                                            e.preventDefault();
                                            showSubnav(item.title);
                                        }
                                    }}
                                >
                                    <div className="link_content">
                                        {item.icon && <item.icon className="icon" aria-hidden />}
                                        <span className="title">{item.title}</span>
                                    </div>
                                    {item.subNav && (
                                        <span className="dropdown_icon">
                                            {expandedItem === item.title ? <FaChevronUp /> : <FaChevronDown />}
                                        </span>
                                    )}
                                </NavLink>
                            </div>
                            {item.subNav && (
                                <ul className={`sub_nav ${expandedItem === item.title ? 'open' : ''}`}>
                                    {item.subNav.map((subItem) => (
                                        <li key={subItem.title}>
                                            <NavLink to={subItem.path} className={({ isActive }) => (isActive ? 'sub_link active' : 'sub_link')}>
                                                {subItem.icon && <subItem.icon className="icon" aria-hidden />}
                                                <span className="title">{subItem.title}</span>
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

