
import React from 'react';

const API_URL = '/api/products';

function Dashboard() {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        async function loadProducts() {
            try {
                const token = localStorage.getItem('auth_token');

                const response = await fetch(API_URL, {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Unable to load products.');
                }

                const result = await response.json();

                // Support common Laravel API response formats.
                const data = Array.isArray(result)
                    ? result
                    : Array.isArray(result.data)
                        ? result.data
                        : Array.isArray(result.products)
                            ? result.products
                            : [];

                setProducts(data);
            } catch (err) {
                setError(err.message || 'Something went wrong.');
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    const totalProducts = products.length;

    const lowStock = products.filter(
        (product) => Number(product.stock_quantity) <= 5
    ).length;

    const totalStock = products.reduce(
        (total, product) => total + Number(product.stock_quantity || 0),
        0
    );

    const stats = [
        {
            label: 'Total Products',
            value: totalProducts,
            icon: '📦',
            color: 'green',
        },
        {
            label: 'Low Stock Items',
            value: lowStock,
            icon: '⚠️',
            color: 'amber',
        },
        {
            label: 'Total Stock Units',
            value: totalStock,
            icon: '🗃️',
            color: 'blue',
        },
        {
            label: 'Categories',
            value: new Set(products.map((p) => p.category).filter(Boolean)).size,
            icon: '🏷️',
            color: 'purple',
        },
    ];

    return (
        <div className="dashboard-page">
            <section className="dashboard-welcome">
                <div>
                    <span className="dashboard-kicker">OVERVIEW</span>
                    <h2>Welcome to FreshStock!</h2>
                    <p>
                        Monitor your food products and stock in one place.
                    </p>
                </div>

                <div className="dashboard-date">
                    <span>Inventory Dashboard</span>
                    <strong>{new Date().toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}</strong>
                </div>
            </section>

            {error && (
                <div className="dashboard-error" role="alert">
                    {error} Please check your API connection.
                </div>
            )}

            <section className="dashboard-stats">
                {stats.map((stat) => (
                    <article
                        className={`dashboard-stat stat-${stat.color}`}
                        key={stat.label}
                    >
                        <div className="stat-top">
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-icon" aria-hidden="true">
                                {stat.icon}
                            </span>
                        </div>

                        <strong className="stat-value">
                            {loading ? '...' : stat.value.toLocaleString()}
                        </strong>

                        <span className="stat-note">
                            {stat.label === 'Low Stock Items'
                                ? 'Products with 5 or fewer units'
                                : 'Based on your inventory'}
                        </span>
                    </article>
                ))}
            </section>

            <section className="dashboard-panel">
                <div className="dashboard-panel-heading">
                    <div>
                        <h3>Inventory Summary</h3>
                        <p>A quick look at your current products.</p>
                    </div>
                    <span className="inventory-status">
                        <span className="status-dot" />
                        Inventory Overview
                    </span>
                </div>

                {loading ? (
                    <p className="dashboard-message">Loading inventory...</p>
                ) : error ? (
                    <p className="dashboard-message">
                        Inventory information is currently unavailable.
                    </p>
                ) : products.length === 0 ? (
                    <div className="dashboard-empty">
                        <span>📦</span>
                        <strong>No products yet</strong>
                        <p>
                            Add your first food product to see your inventory
                            summary here.
                        </p>
                    </div>
                ) : (
                    <div className="dashboard-table-wrap">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.slice(0, 5).map((product) => {
                                    const quantity = Number(
                                        product.stock_quantity || 0
                                    );

                                    return (
                                        <tr key={product.id}>
                                            <td className="product-name-cell">
                                                {product.name}
                                            </td>
                                            <td>{product.category || '—'}</td>
                                            <td>
                                                ₱{Number(product.price || 0)
                                                    .toLocaleString('en-PH', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                            </td>
                                            <td>{quantity}</td>
                                            <td>
                                                <span
                                                    className={`stock-badge ${
                                                        quantity <= 5
                                                            ? 'stock-low'
                                                            : 'stock-good'
                                                    }`}
                                                >
                                                    {quantity <= 5
                                                        ? 'Low Stock'
                                                        : 'In Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
