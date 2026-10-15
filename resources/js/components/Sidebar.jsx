
import React from 'react';

const menuItems = [
    { label: 'Dashboard', icon: '▦', page: 'dashboard' },
    { label: 'Product Management', icon: '▤', page: 'products' },
];

export default function Sidebar({
    activePage = 'dashboard',
    onNavigate = () => {},
    mobileOpen = false,
    onClose = () => {},
}) {
    return (
        <>
            {mobileOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    aria-label="Close navigation"
                    onClick={onClose}
                />
            )}

            <aside
                className={`app-sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
                aria-label="Main navigation"
            >
                <div className="sidebar-brand">
                    <div className="brand-icon">F</div>
                    <div>
                        <strong>FreshStock</strong>
                        <span>Inventory System</span>
                    </div>
                </div>

                <p className="sidebar-heading">MAIN MENU</p>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.page}
                            type="button"
                            className={`sidebar-link ${
                                activePage === item.page ? 'active' : ''
                            }`}
                            onClick={() => {
                                onNavigate(item.page);
                                onClose();
                            }}
                            aria-current={
                                activePage === item.page ? 'page' : undefined
                            }
                        >
                            <span className="sidebar-icon" aria-hidden="true">
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <span className="status-dot" />
                    <div>
                        <strong>System Status</strong>
                        <span>Ready to manage</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
