
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
    const [stockProduct, setStockProduct] = useState(null);
    const [stockQuantity, setStockQuantity] = useState('');
    const [stockNotes, setStockNotes] = useState('');
    const [addingStock, setAddingStock] = useState(false);
    const [showProductForm, setShowProductForm] = useState(false);
    const [activityLogs, setActivityLogs] = React.useState({
            data: [],
            current_page: 1,
            last_page: 1,
        });

    const [activitySearch, setActivitySearch] = React.useState('');
    const [activityAction, setActivityAction] = React.useState('');
    const [activityLoading, setActivityLoading] = React.useState(false);
    const [activityError, setActivityError] = React.useState('');

    const token = localStorage.getItem('auth_token');

    
function formatActivityChanges(log) {
    const oldValues = log.old_values || {};
    const newValues = log.new_values || {};
    const changes = [];

    const labels = {
        name: 'Edit Product Name',
        price: 'Edit Price',
        description: 'Edit Description',
        category: 'Edit Category',
        stock_quantity: 'Edit Stock',
        quantity_added: 'Add Stock',
        quantity_sold: 'Quantity Sold',
        unit_price: 'Unit Price',
        total_amount: 'Total Revenue',
    };

    const fields = [
        ...new Set([
            ...Object.keys(oldValues),
            ...Object.keys(newValues),
        ]),
    ];

    for (const field of fields) {
        const oldValue = oldValues[field];
        const newValue = newValues[field];

        if (oldValue === undefined && newValue === undefined) continue;
        if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;

        if (field === 'quantity_added') {
            changes.push(`Add Stock: +${newValue} units`);
        } else if (field === 'quantity_sold') {
            changes.push(`Quantity Sold: ${newValue} units`);
        } else if (field === 'price' || field === 'unit_price') {
            changes.push(
                `${labels[field]}: ₱${Number(oldValue ?? 0).toFixed(2)} → ₱${Number(newValue ?? 0).toFixed(2)}`
            );
        } else if (oldValue !== undefined && newValue !== undefined) {
            changes.push(
                `${labels[field] || field}: ${oldValue ?? '—'} → ${newValue ?? '—'}`
            );
        } else {
            changes.push(
                `${labels[field] || field}: ${newValue ?? oldValue ?? '—'}`
            );
        }
    }

    if (log.details && changes.length === 0) {
        changes.push(log.details);
    }

    return changes;
}


    async function apiRequest(url, options = {}) {
        const token = localStorage.getItem('auth_token');

        const response = await fetch(url, {
            ...options,
            headers: {
                Accept: 'application/json',
                ...(options.headers || {}),
                ...(token
                    ? { Authorization: `Bearer ${token}` }
                    : {}),
                ...(options.body ? { 'Content-Type': 'application/json' } : {}),
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

    useEffect(() => {
        async function loadActivityLogs() {
            setActivityLoading(true);
            setActivityError('');

            try {
                const params = new URLSearchParams();

                if (activitySearch.trim()) {
                    params.set('search', activitySearch.trim());
                }

                if (activityAction) {
                    params.set('action', activityAction);
                }

                const query = params.toString();
                const endpoint = `/api/activity-logs${query ? `?${query}` : ''}`;

                const data = await apiRequest(endpoint);
                setActivityLogs(data);
            } catch (err) {
                setActivityError(
                    err.message || 'Unable to load activity history.'
                );
            } finally {
                setActivityLoading(false);
            }
        }

        loadActivityLogs();
    }, [activitySearch, activityAction]);

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
           setShowProductForm(false);
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
        setShowProductForm(true);
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


async function handleAddStock(e) {
    e.preventDefault();
    if (!stockProduct) return;

    setMessage('');
    setError('');
    setAddingStock(true);

    try {
        const data = await apiRequest(
            `/api/products/${stockProduct.id}/add-stock`,
            {
                method: 'POST',
                body: JSON.stringify({
                    quantity: Number(stockQuantity),
                    notes: stockNotes.trim() || 'Stock added',
                }),
            }
        );

        setMessage(data.message || 'Stock added successfully!');
        setStockProduct(null);
        setStockQuantity('');
        setStockNotes('');

        await loadProducts();
    } catch (err) {
        setError(err.message || 'Unable to add stock.');
    } finally {
        setAddingStock(false);
    }
}

function openAddStock(product) {
    setStockProduct(product);
    setStockQuantity('');
    setStockNotes('');
    setMessage('');
    setError('');
}

    
    function cancelEdit() {
        setEditingId(null);
        setForm({ ...emptyForm });
        setShowProductForm(false);
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
                    <button
    type="button"
    className="product-btn product-btn-primary"
    onClick={() => {
        setForm({ ...emptyForm });
        setEditingId(null);
        setMessage('');
        setError('');
        setShowProductForm(true);
    }}
>
    + Add Product
</button> 
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

            
            {showProductForm && (
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
                                <label htmlFor="product-description">Description</label>
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

                            <button
                                type="button"
                                className="product-btn product-btn-secondary"
                                onClick={cancelEdit}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {stockProduct && (
                <section className="product-form-panel">
                    <div className="product-section-heading">
                        <div className="product-section-icon">＋</div>
                        <div>
                            <h2>Add Stock</h2>
                            <p>
                                Add inventory for {stockProduct.name}.
                                Current stock: {stockProduct.stock_quantity}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAddStock}>
                        <div className="product-form-grid">
                            <div className="product-field">
                                <label htmlFor="stock-add-quantity">
                                    Quantity to add *
                                </label>
                                <input
                                    id="stock-add-quantity"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={stockQuantity}
                                    onChange={(e) => setStockQuantity(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="product-field">
                                <label htmlFor="stock-add-notes">Notes</label>
                                <input
                                    id="stock-add-notes"
                                    value={stockNotes}
                                    onChange={(e) => setStockNotes(e.target.value)}
                                    maxLength="500"
                                    placeholder="e.g. New delivery"
                                />
                            </div>
                        </div>

                        <div className="product-form-actions">
                            <button
                                type="submit"
                                className="product-btn product-btn-primary"
                                disabled={addingStock}
                            >
                                {addingStock ? 'Adding...' : '+ Confirm Add Stock'}
                            </button>

                            <button
                                type="button"
                                className="product-btn product-btn-secondary"
                                onClick={() => setStockProduct(null)}
                                disabled={addingStock}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}


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
                                                        className="product-action-edit"
                                                        onClick={() => openAddStock(product)}
                                                        >
    + Add Stock
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
            <section className="product-list-panel">
    <div className="product-section-heading">
        <div className="product-section-icon">◷</div>
        <div>
            <h2>Activity History</h2>
            <p>Audit trail for inventory and sales activities.</p>
        </div>
    </div>

    <div className="product-form-grid">
        <div className="product-field">
            <label htmlFor="activity-search">Search history</label>
            <input
                id="activity-search"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search product name..."
            />
        </div>

        <div className="product-field">
            <label htmlFor="activity-action">Filter by action</label>
            <select
                id="activity-action"
                value={activityAction}
                onChange={(e) => setActivityAction(e.target.value)}
            >
                <option value="">All activities</option>
                <option value="product_created">Product Created</option>
                <option value="product_updated">Product Updated</option>
                <option value="product_deleted">Product Deleted</option>
                <option value="stock_added">Stock Added</option>
                <option value="sale_recorded">Sale Recorded</option>
            </select>
        </div>
    </div>

    {activityLoading && <p>Loading activity history...</p>}

    {activityError && (
        <p role="alert" className="product-error">
            {activityError}
        </p>
    )}

    {!activityLoading && !activityError && (
        <div className="product-table-wrapper">
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Date &amp; Time</th>
                        <th>Action</th>
                        <th>Product</th>
                        <th>Details</th>
                        <th>Changes</th>
                    </tr>
                </thead>

                <tbody>
                    {(activityLogs.data || []).length === 0 ? (
                        <tr>
                            <td colSpan="5">No activity records found.</td>
                        </tr>
                    ) : (
                        activityLogs.data.map((log) => (
                            <tr key={log.id}>
                                <td>
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td>{log.action.replaceAll('_', ' ')}</td>
                                <td>{log.entity_name || '—'}</td>
                                <td>{log.details || '—'}</td>
                                <td>
                                    {log.old_values || log.new_values ? (
                                        
                                    <td>
                                        <details>
                                            <summary>View Changes</summary>
                                            <ol className="activity-change-list">
                                                {formatActivityChanges(log).map((change, index) => (
                                                    <li key={`${log.id}-${index}`}>{change}</li>
                                                ))}
                                                <li>
                                                    Date: {new Date(log.created_at).toLocaleString()}
                                                </li>
                                            </ol>
                                        </details>
                                    </td>

                                    ) : (
                                        '—'
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )}
</section>
        </main>
    );
}
export default ProductManagement;
