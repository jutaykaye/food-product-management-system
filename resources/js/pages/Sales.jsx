
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api";

export default function Sales() {
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("auth_token");

    async function loadData() {
        try {
            const [productResponse, salesResponse] = await Promise.all([
                fetch(`${API_URL}/products`),
                fetch(`${API_URL}/sales`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);

            const productData = await productResponse.json();
            const salesData = await salesResponse.json();

            if (!productResponse.ok) {
                throw new Error("Failed to load products.");
            }

            if (!salesResponse.ok) {
                throw new Error(
                    salesData.message || "Failed to load sales. Please log in again."
                );
            }

            setProducts(productData.products || []);
            setSales(salesData.sales || []);
        } catch (err) {
            setError(err.message || "Unable to load data.");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const selectedProduct = products.find(
        (product) => String(product.id) === String(productId)
    );

    async function recordSale(event) {
        event.preventDefault();
        setMessage("");
        setError("");

        if (!productId || Number(quantity) < 1) {
            setError("Please select a product and enter a valid quantity.");
            return;
        }

        if (Number(quantity) > Number(selectedProduct?.stock_quantity ?? 0)) {
            setError("Not enough stock available.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/sales`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    product_id: Number(productId),
                    quantity: Number(quantity),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.errors?.quantity?.[0] ||
                    "Failed to record sale."
                );
            }

            setMessage(data.message || "Sale recorded successfully!");
            setQuantity(1);
            await loadData();
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    const totalRevenue = sales.reduce(
        (total, sale) => total + Number(sale.total_amount || 0),
        0
    );

    return (
        <div className="sales-page">
            <h1>Sales Management</h1>
            <p>Record sold products and monitor your sales.</p>

            <div className="sales-summary">
                <div className="sales-card">
                    <h3>Total Transactions</h3>
                    <p>{sales.length}</p>
                </div>

                <div className="sales-card">
                    <h3>Total Revenue</h3>
                    <p>
                        ₱{totalRevenue.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </p>
                </div>
            </div>

            <form className="sales-form" onSubmit={recordSale}>
                <h2>Record a Sale</h2>

                <label htmlFor="sale-product">Select Product</label>
                <select
                    id="sale-product"
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                    required
                >
                    <option value="">Choose a product</option>
                    {products.map((product) => (
                        <option
                            key={product.id}
                            value={product.id}
                            disabled={Number(product.stock_quantity) < 1}
                        >
                            {product.name} — Stock: {product.stock_quantity}
                        </option>
                    ))}
                </select>

                {selectedProduct && (
                    <p>
                        Price per item: ₱
                        {Number(selectedProduct.price).toFixed(2)}
                    </p>
                )}

                <label htmlFor="sale-quantity">Quantity Sold</label>
                <input
                    id="sale-quantity"
                    type="number"
                    min="1"
                    max={selectedProduct?.stock_quantity || undefined}
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    required
                />

                {selectedProduct && Number(quantity) > 0 && (
                    <p>
                        Estimated Total: ₱
                        {(Number(selectedProduct.price) * Number(quantity))
                            .toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                    </p>
                )}

                {message && <p className="sales-success">{message}</p>}
                {error && <p className="sales-error">{error}</p>}

                <button type="submit" disabled={loading || !token}>
                    {loading ? "Recording..." : "Record Sale"}
                </button>

                {!token && (
                    <p className="sales-error">
                        Please log in first to record sales.
                    </p>
                )}
            </form>

            <div className="sales-history">
                <h2>Recent Sales</h2>

                <div className="sales-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.length === 0 ? (
                                <tr>
                                    <td colSpan="5">No sales recorded yet.</td>
                                </tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale.id}>
                                        <td>{sale.product_name}</td>
                                        <td>{sale.quantity}</td>
                                        <td>
                                            ₱{Number(sale.unit_price).toFixed(2)}
                                        </td>
                                        <td>
                                            ₱{Number(sale.total_amount).toFixed(2)}
                                        </td>
                                        <td>
                                            {new Date(sale.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
