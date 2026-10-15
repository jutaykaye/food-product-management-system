
import React from 'react';

export default function Register({ onBackToLogin }) {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    function handleChange(event) {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                const validationErrors = data.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : '';

                throw new Error(
                    validationErrors || data.message || 'Registration failed.'
                );
            }

           
        setSuccess(
            data.message || 'Account created successfully!'
        );
        
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        });
        
        setTimeout(() => {
            onBackToLogin();
        }, 1200);
        
        } catch (err) {
            setError(err.message || 'Unable to register.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="brand-icon">F</div>
                    <h1>FreshStock</h1>
                    <p>Create your inventory account</p>
                </div>

                <h2>Create Account</h2>

                {error && (
                    <p className="auth-error" role="alert">{error}</p>
                )}

                {success && (
                    <p className="auth-success" role="status">{success}</p>
                )}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="register-name">Full Name</label>
                    <input
                        id="register-name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                    />

                    <label htmlFor="register-email">Email Address</label>
                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />

                    <label htmlFor="register-confirm-password">
                        Confirm Password
                    </label>
                    <input
                        id="register-confirm-password"
                        name="password_confirmation"
                        type="password"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <button type="button" onClick={onBackToLogin}>
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
}
