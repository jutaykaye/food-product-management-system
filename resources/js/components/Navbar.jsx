
import React from 'react';

function Navbar({ currentPage, onLogout, user, onMenuClick }) {
    const pageTitle =
        currentPage === 'products'
            ? 'Product Management'
            : 'Dashboard';

    return (
        <header className="app-navbar">
            <div className="navbar-left">
                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={onMenuClick}
                    aria-label="Open navigation menu"
                >
                    <span />
                    <span />
                    <span />
                </button>

                <div className="navbar-page-info">
                    <span className="navbar-eyebrow">
                        FOOD PRODUCT MANAGEMENT
                    </span>
                    <h1>{pageTitle}</h1>
                </div>
            </div>

            <div className="navbar-right">
                <div className="navbar-user">
                    <div className="navbar-avatar">
                        {(user?.name || 'User')
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className="navbar-user-details">
                        <span className="navbar-user-label">
                            Signed in as
                        </span>
                        <strong className="navbar-user-name">
                            {user?.name || 'User'}
                        </strong>
                    </div>
                </div>

                <button
                    type="button"
                    className="navbar-logout"
                    onClick={onLogout}
                >
                    Log out
                </button>
            </div>
        </header>
    );
}

export default Navbar;
