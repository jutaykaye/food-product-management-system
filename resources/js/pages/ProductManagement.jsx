
import React, { useEffect, useState } from 'react';

const emptyForm = {
    name: '',
    description: '',
    category: '',
    price: '',
    stock_quantity: '',
};

const CATEGORIES = [
  "Canned Goods",
  "Rice",
  "Cooking Ingredients/Essential",
  "Frozen Foods",
  "Sweets",
  "Junk Foods",
  "Beverages",
  "Coffee/Dairy/Energy Drinks",
];


function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

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

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                window.location.reload();
            }

            throw new Error(
                data.message || 'Something went wrong.'
            );
        }

        return data;
    }

    async function loadProducts() {
        setLoading(true);
        setError('');

        try {
            const data = await apiRequest('/api/products');
            setProducts(data.products ?? data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');
        setError('');

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

            setMessage(data.message || 'Product saved successfully!');
            setForm(emptyForm);
            setEditingId(null);
            await loadProducts();
        } catch (err) {
            setError(err.message);
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
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

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
        setForm(emptyForm);
        setMessage('');
        setError('');
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
                Product Management
            </h1>
            <p className="mb-6 text-gray-600">
                Manage your food products and stock.
            </p>

            {message && (
                <p className="mb-4 rounded bg-green-100 p-3 text-green-800">
                    {message}
                </p>
            )}

            {error && (
                <p className="mb-4 rounded bg-red-100 p-3 text-red-700">
                    {error}
                </p>
            )}

            <form
                onSubmit={handleSubmit}
                className="mb-8 rounded-lg bg-white p-6 shadow"
            >
                <h2 className="mb-4 text-xl font-semibold">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        className="rounded border p-3"
                        name="name"
                        placeholder="Product name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                    
<div className="flex flex-col gap-2">
    <label
        htmlFor="category"
        className="font-medium text-gray-700"
    >
        Category
    </label>

    <select
        id="category"
        name="category"
        value={form.category}
        onChange={handleChange}
        className="rounded-lg border border-gray-300 bg-white p-3 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-100"
        required
    >
        <option value="">Select Category</option>

        {CATEGORIES.map((category) => (
            <option key={category} value={category}>
                {category}
            </option>
        ))}
    </select>
</div>
       

                    <input
                        className="rounded border p-3"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={form.price}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="rounded border p-3"
                        name="stock_quantity"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Stock quantity"
                        value={form.stock_quantity}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        className="rounded border p-3 md:col-span-2"
                        name="description"
                        placeholder="Product description"
                        value={form.description}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        type="submit"
                        className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                    >
                        {editingId ? 'Update Product' : 'Add Product'}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded bg-gray-200 px-5 py-2 text-gray-800"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="overflow-x-auto rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">
                    Product List
                </h2>

                {loading ? (
                    <p>Loading products...</p>
                ) : products.length === 0 ? (
                    <p className="text-gray-500">No products found.</p>
                ) : (
                    <table className="w-full min-w-[700px] text-left">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-3">Name</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="border-b">
                                    <td className="p-3">{product.name}</td>
                                    <td className="p-3">{product.category}</td>
                                    <td className="p-3">
                                        ₱{Number(product.price).toFixed(2)}
                                    </td>
                                    <td className="p-3">
                                        {product.stock_quantity}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="rounded bg-amber-500 px-3 py-1 text-white"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="rounded bg-red-600 px-3 py-1 text-white"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default ProductManagement;
