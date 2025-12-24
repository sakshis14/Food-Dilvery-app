document.addEventListener('DOMContentLoaded', async () => {
    await loadOrders();
});

async function loadOrders() {
    const container = document.getElementById('trackingContainer');
    const user = Storage.getUser();

    // Check if user is logged in
    if (!user) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔒</div>
                <h3>Please login to view your orders</h3>
                <p>You need to be logged in to see your order tracking.</p>
                <a href="login.html" class="btn btn-primary" style="margin-top: 1rem;">Sign In</a>
            </div>
        `;
        return;
    }

    try {
        const orders = await Storage.getOrders();

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <h3>No orders found</h3>
                    <p>You haven't placed any orders yet.</p>
                    <a href="home.html" class="btn btn-primary" style="margin-top: 1rem;">Start Ordering</a>
                </div>
            `;
            return;
        }

        // Sort orders by most recent first (by createdAt date)
        const sortedOrders = orders.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0);
            const dateB = new Date(b.createdAt || b.created_at || 0);
            return dateB - dateA;
        });

        container.innerHTML = sortedOrders.map(order => {
            // Define all possible statuses in order
            const statuses = ['Received', 'Preparing', 'Out for Delivery', 'Delivered'];
            const currentStatus = order.status || 'Received';
            const currentStatusIndex = statuses.indexOf(currentStatus);
            
            // Handle cancelled status separately
            const isCancelled = currentStatus === 'Cancelled';
            
            // Use _id or id for display
            const displayOrderId = order._id || order.id;

            return `
                <div class="card" style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
                        <div>
                            <h3>Order #${displayOrderId}</h3>
                            <p style="color: var(--text-light); margin-top: 0.5rem;">
                                Placed on ${new Date(order.createdAt || order.created_at).toLocaleString()}
                            </p>
                            ${order.deliveryAddress && order.deliveryAddress.area ? `
                                <p style="color: var(--text-light); font-size: 0.9rem; margin-top: 0.25rem;">
                                    📍 ${order.deliveryAddress.area}${order.deliveryAddress.address ? ', ' + order.deliveryAddress.address : ''}
                                </p>
                            ` : ''}
                        </div>
                        <div style="text-align: right;">
                            <strong style="color: var(--primary-color); font-size: 1.2rem;">${formatCurrency(order.total)}</strong>
                            <p style="color: var(--text-light); font-size: 0.9rem; margin-top: 0.5rem;">${order.paymentMethod}</p>
                            ${isCancelled ? `
                                <span style="display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.75rem; background: #ff6b6b; color: white; border-radius: 4px; font-size: 0.85rem;">
                                    Cancelled
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${!isCancelled ? `
                    <div class="tracking-steps">
                        ${statuses.map((status, index) => {
                            let className = '';
                            if (index < currentStatusIndex) {
                                className = 'completed';
                            } else if (index === currentStatusIndex) {
                                className = 'active';
                            }
                            
                            return `
                                <div class="tracking-step">
                                    <div class="step-circle ${className}">
                                        ${index < currentStatusIndex ? '✓' : index + 1}
                                    </div>
                                    <div style="font-weight: ${index === currentStatusIndex ? 'bold' : 'normal'}; color: ${index === currentStatusIndex ? 'var(--primary-color)' : 'var(--text-light)'};">
                                        ${status}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ` : ''}

                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                        <h4 style="margin-bottom: 0.5rem;">Order Items:</h4>
                        <ul style="list-style: none; padding: 0;">
                            ${order.items && order.items.length > 0 ? order.items.map(item => `
                                <li style="padding: 0.5rem 0; display: flex; justify-content: space-between;">
                                    <span>${item.name} x${item.quantity}</span>
                                    <span>${formatCurrency(item.price * item.quantity)}</span>
                                </li>
                            `).join('') : '<li>No items found</li>'}
                        </ul>
                        ${order.subtotal !== undefined ? `
                            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-light);">Subtotal:</span>
                                    <span>${formatCurrency(order.subtotal)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-light);">Delivery Fee:</span>
                                    <span>${formatCurrency(order.deliveryFee || 2.99)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid var(--border-color); font-weight: bold; font-size: 1.1rem;">
                                    <span>Total:</span>
                                    <span style="color: var(--primary-color);">${formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error("Error loading orders:", error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>Error loading orders</h3>
                <p>Please try again later.</p>
                <a href="home.html" class="btn btn-primary" style="margin-top: 1rem;">Go to Home</a>
            </div>
        `;
    }
}

