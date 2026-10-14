
import React from 'react';

function Navbar({ currentPage, onNavigate, onLogout, user }) {
    const links = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'products', label: 'Product Management' },
    ];

    return (
        <nav className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 px-6 py-4 text-white shadow">
            <h1 className="text-xl font-bold">
                Food Product Management
            </h1>

            <div className="flex flex-wrap items-center gap-3">
                {links.map((link) => (
                    <button
                        key={link.id}
                        onClick={() => onNavigate(link.id)}
                        className={`rounded px-4 py-2 ${
                            currentPage === link.id
                                ? 'bg-blue-600'
                                : 'hover:bg-slate-700'
                        }`}
                    >
                        {link.label}
                    </button>
                ))}

                <span className="text-sm text-slate-300">
                    {user?.name || 'User'}
                </span>

                <button
                    onClick={onLogout}
                    className="rounded bg-red-600 px-4 py-2 hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
