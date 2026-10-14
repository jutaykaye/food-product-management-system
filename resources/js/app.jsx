import React from 'react';
import { createRoot } from 'react-dom/client';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import Navbar from './components/Navbar';

function App() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(
        !!localStorage.getItem('auth_token')
    );

    const [currentPage, setCurrentPage] = React.useState('dashboard');

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

        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setIsLoggedIn(false);
            setCurrentPage('dashboard');
        }
    }

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                onLogout={handleLogout}
                user={user}
            />

            {currentPage === 'dashboard' && (
                <Dashboard onLogout={handleLogout} />
            )}

            {currentPage === 'products' && (
                <ProductManagement />
            )}
        </div>
    );
}

const element = document.getElementById('app');

if (element) {
    createRoot(element).render(<App />);
}
