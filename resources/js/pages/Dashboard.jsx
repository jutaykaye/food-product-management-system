import React from 'react';

function Dashboard({ onLogout }) {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold">
                Food Product Management
            </h1>

            <p className="mt-2 text-slate-600">
                Manage your food products in one place.
            </p>

            <h2 className="mt-6 text-xl font-semibold">
                Welcome to your dashboard!
            </h2>

            <p className="mt-2">
                Your React frontend is connected to your Laravel API.
            </p>

            <button
                onClick={onLogout}
                className="mt-6 rounded bg-red-500 px-4 py-2 text-white"
            >
                Logout
            </button>
        </div>
    );
}

export default Dashboard;