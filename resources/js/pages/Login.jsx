
import { useState } from 'react';

export default function Login({ onLogin })  {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

   async function handleLogin(e) {
    e.preventDefault();
    setError('');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
           body: JSON.stringify({
    email: email.trim(),
    password: password,
}),
        });

        // Basahon ang response kausa ra.
        const data = await response.json();

        if (!response.ok) {
            setError(
                data.message || 'Invalid email or password.'
            );
            return;
        }

        localStorage.setItem('auth_token', data.token);
        localStorage.setItem(
            'auth_user',
            JSON.stringify(data.user)
        );

        onLogin();
    } catch (error) {
        setError('Unable to connect. Please try again.');
        console.error(error);
    }
        }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-md rounded-xl bg-white p-8 shadow"
            >
                <h1 className="mb-2 text-2xl font-bold">
                    Welcome Back!
                </h1>

                <p className="mb-6 text-gray-600">
                    Login to Food Product Management
                </p>

                {error && (
                    <p className="mb-4 rounded bg-red-100 p-3 text-red-700">
                        {error}
                    </p>
                )}

                <label className="mb-1 block">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-4 w-full rounded border p-3"
                    placeholder="Enter your email"
                    required
                />

                <label className="mb-1 block">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-6 w-full rounded border p-3"
                    placeholder="Enter your password"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-green-600 p-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
