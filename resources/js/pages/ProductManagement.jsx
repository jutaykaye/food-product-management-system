
import React, { useEffect, useState } from 'react';

const emptyForm = {
    name: '',
    description: '',
    category: '',
    price: '',
    stock_quantity: '',
};

const CATEGORIES = [
    'Canned Goods',
    'Rice',
    'Cooking Ingredients/Essential',
    'Frozen Foods',
    'Sweets',
    'Junk Foods',
    'Beverages',
    'Coffee/Dairy/Energy Drinks',
];

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const token = localStorage.getItem('auth_token');

    async function apiRequest(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                window.location.reload();
            }

            const validationErrors = data.errors
                ? Object.values(data.errors).flat().join(' ')
                : '';

            throw new Error(
                validationErrors || data.message || 'Something went wrong.'
            );
        }

        return data;
    }

    async function loadProducts() {
        setLoading(true);
        setError('');

        try {
            const data = await apiRequest('/api/products');
            setProducts(data.products ?? data.data ?? data);
        } catch (err) {
            setError(err.message || 'Unable to load products.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');
        setError('');
        setSaving(true);

        try {
            const url = editingId
                ? `/api/products/${editingId}`
                : '/api/products';

            const data = await apiRequest(url, {
                method: editingId ? 'PUT' : 'POST',
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    stock_quantity: Number(form.stock_quantity),
                }),
            });

            setMessage(
                data.message ||
                (editingId
                    ? 'Product updated successfully!'
                    : 'Product added successfully!')
            );

            setForm({ ...emptyForm });
            setEditingId(null);
            await loadProducts();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(product) {
        setEditingId(product.id);
        setForm({
            name: product.name ?? '',
            description: product.description ?? '',
            category: product.category ?? '',
            price: String(product.price ?? ''),
            stock_quantity: String(product.stock_quantity ?? ''),
        });

        setMessage('');
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleDelete(id) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this product?'
        );

        if (!confirmed) return;

        setMessage('');
        setError('');

        try {
            const data = await apiRequest(`/api/products/${id}`, {
                method: 'DELETE',
            });

            setMessage(data.message || 'Product deleted successfully!');
            await loadProducts();
        } catch (err) {
            setError(err.message);
        }
    }

    function cancelEdit() {
        setEditingId(null);
        setForm({ ...emptyForm });
        setMessage('');
        setError('');
    }

    const filteredProducts = products.filter((product) => {
        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            String(product.name ?? '').toLowerCase().includes(searchText) ||
            String(product.description ?? '').toLowerCase().includes(searchText);

        const matchesCategory =
            categoryFilter === 'all' ||
            product.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const lowStockCount = products.filter(
        (product) => Number(product.stock_quantity) <= 5
    ).length;

    return (
        <main className="product-page">
            <section className="product-page-heading">
                <div>
                    <span className="product-eyebrow">INVENTORY</span>
                    <h1>Product Management</h1>
                    <p>Manage your food products, prices, and stock.</p>
                </div>

                <div className="product-heading-count">
                    <span>Total products</span>
                    <strong>{loading ? '...' : products.length}</strong>
                </div>
            </section>

            {message && (
                <div className="product-alert product-alert-success" role="status">
                    <span>✓</span>
                    {message}
                    <button
                        type="button"
                        onClick={() => setMessage('')}
                        aria-label="Dismiss message"
                    >
                        ×
                    </button>
                </div>
            )}

            {error && (
                <div className="product-alert product-alert-error" role="alert">
                    <span>!</span>
                    {error}
                    <button
                        type="button"
                        onClick={() => setError('')}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            <section className="product-mini-stats">
                <article className="product-mini-card">
                    <span className="product-mini-icon">📦</span>
                    <div>
                        <span>All Products</span>
                        <strong>{loading ? '...' : products.length}</strong>
                    </div>
                </article>

                <article className="product-mini-card">
                    <span className="product-mini-icon product-mini-warning">⚠️</span>
                    <div>
                        <span>Low Stock</span>
                        <strong>{loading ? '...' : lowStockCount}</strong>
                    </div>
                </article>

                <article className="product-mini-card">
                    <span className="product-mini-icon product-mini-category">🏷️</span>
                    <div>
                        <span>Categories Used</span>
                        <strong>
                            {loading
                                ? '...'
                                : new Set(
                                    products
                                        .map((product) => product.category)
                                        .filter(Boolean)
                                ).size}
                        </strong>
                    </div>
                </article>
            </section>

            <section className="product-form-panel">
                <div className="product-section-heading">
                    <div className="product-section-icon">＋</div>
                    <div>
                        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                        <p>
                            {editingId
                                ? 'Update the details of this product.'
                                : 'Enter the details of the food product below.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="product-form-grid">
                        <div className="product-field">
                            <label htmlFor="product-name">Product name *</label>
                            <input
                                id="product-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Canned Sardines"
                                maxLength={255}
                                required
                            />
                        </div>

                        <div className="product-field">
                            <label htmlFor="product-category">Category *</label>
                            <select
                                id="product-category"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="product-field">
                            <label htmlFor="product-price">Price (₱) *</label>
                            <input
                                id="product-price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="product-field">
                            <label htmlFor="product-stock">Stock quantity *</label>
                            <input
                                id="product-stock"
                                name="stock_quantity"
                                type="number"
                                min="0"
                                step="1"
                                value={form.stock_quantity}
                                onChange={handleChange}
                                placeholder="Enter quantity"
                                required
                            />
                        </div>

                        <div className="product-field product-field-full">
                            <label htmlFor="product-description">
                                Description
                            </label>
                            <textarea
                                id="product-description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Optional product description"
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="product-form-actions">
                        <button
                            type="submit"
                            className="product-btn product-btn-primary"
                            disabled={saving}
                        >
                            {saving
                                ? 'Saving...'
                                : editingId
                                    ? '✓ Update Product'
                                    : '+ Add Product'}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="product-btn product-btn-secondary"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="product-list-panel">
                <div className="product-list-heading">
                    <div>
                        <h2>Product List</h2>
                        <p>View and manage your inventory items.</p>
                    </div>
                    <span className="product-result-count">
                        {loading ? 'Loading...' : `${filteredProducts.length} items`}
                    </span>
                </div>

                <div className="product-filters">
                    <div className="product-search">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            aria-label="Search products"
                        />
                    </div>

                    <select
                        className="product-category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        aria-label="Filter by category"
                    >
                        <option value="all">All categories</option>
                        {CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="product-empty-state">
                        <span>⏳</span>
                        <p>Loading products...</p>
                    </div>
                ) : error && products.length === 0 ? (
                    <div className="product-empty-state">
                        <span>!</span>
                        <p>Unable to load products. Check the error message above.</p>
                        <button
                            type="button"
                            className="product-btn product-btn-secondary"
                            onClick={loadProducts}
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="product-empty-state">
                        <span>📦</span>
                        <strong>
                            {products.length === 0
                                ? 'No products yet'
                                : 'No matching products'}
                        </strong>
                        <p>
                            {products.length === 0
                                ? 'Add a product using the form above.'
                                : 'Try another search term or category.'}
                        </p>
                        {(search || categoryFilter !== 'all') && (
                            <button
                                type="button"
                                className="product-btn product-btn-secondary"
                                onClick={() => {
                                    setSearch('');
                                    setCategoryFilter('all');
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="product-table-wrap">
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => {
                                    const quantity = Number(
                                        product.stock_quantity || 0
                                    );
                                    const isLowStock = quantity <= 5;

                                    return (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="product-name">
                                                    <span className="product-row-icon">
                                                        📦
                                                    </span>
                                                    <div>
                                                        <strong>{product.name}</strong>
                                                        {product.description && (
                                                            <small>
                                                                {product.description}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="product-category-tag">
                                                    {product.category || '—'}
                                                </span>
                                            </td>
                                            <td className="product-price">
                                                ₱{Number(product.price || 0).toLocaleString(
                                                    'en-PH',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </td>
                                            <td>{quantity}</td>
                                            <td>
                                                <span
                                                    className={`product-stock-status ${
                                                        isLowStock
                                                            ? 'product-stock-low'
                                                            : 'product-stock-good'
                                                    }`}
                                                >
                                                    <span />
                                                    {isLowStock ? 'Low Stock' : 'In Stock'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="product-row-actions">
                                                    <button
                                                        type="button"
                                                        className="product-action-edit"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="product-action-delete"
                                                        onClick={() => handleDelete(product.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

export default ProductManagement;
