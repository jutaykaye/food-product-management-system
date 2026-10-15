
import React from 'react';
import { createRoot } from 'react-dom/client';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Sales from './pages/Sales';
import '../css/app.css';
import Register from './pages/Register';

function App() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(
        !!localStorage.getItem('auth_token')
    );
    
    const [currentPage, setCurrentPage] = React.useState(() => {
    return localStorage.getItem('freshstock_current_page') || 'dashboard';
        });
    React.useEffect(() => {
    if (isLoggedIn) {
        localStorage.setItem('freshstock_current_page', currentPage);
        }
    }, [currentPage, isLoggedIn]);    
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    
    const [authMode, setAuthMode] = React.useState('login');

if (!isLoggedIn) {
    return authMode === 'register' ? (
        <Register
            onBackToLogin={() => setAuthMode('login')}
        />
    ) : (
        <Login
            onLogin={handleLogin}
            onRegister={() => setAuthMode('register')}
        />
    );
}
    const user = React.useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('auth_user') || 'null');
        } catch {
            return null;
        }
    }, [isLoggedIn]);

    function handleLogin() {
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
    }


    async function handleLogout() {
        const token = localStorage.getItem('auth_token');

        
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('freshstock_current_page');

        setIsLoggedIn(false);
        setCurrentPage('dashboard');
        setMobileMenuOpen(false);

        try {
            if (token) {
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Logout request failed:', error);
        }
    }


    

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="app-layout">
            <Sidebar
                activePage={currentPage}
                onNavigate={setCurrentPage}
                mobileOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <div className="app-main">
                <Navbar
                    currentPage={currentPage}
                    onNavigate={setCurrentPage}
                    onLogout={handleLogout}
                    user={user}
                    onMenuClick={() => setMobileMenuOpen((open) => !open)}
                />

                <main className="app-content">
                    {currentPage === 'dashboard' && (
                        <Dashboard onLogout={handleLogout} />
                    )}

                    {currentPage === 'products' && (
                        <ProductManagement />
                    )}
                    {currentPage === 'sales' && (
                        <Sales />
                    )}
                </main>
            </div>
        </div>
    );
}

const element = document.getElementById('app');

if (element) {
    createRoot(element).render(<App />);
}
