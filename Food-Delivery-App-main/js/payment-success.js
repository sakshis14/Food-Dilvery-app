document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) {
        window.location.href = 'home.html';
        return;
    }

    try {
        const order = await Storage.getOrder(orderId);

        if (!order) {
            document.getElementById('orderInfo').innerHTML = '<p>Order not found.</p>';
            return;
        }

        // Use _id or id for display
        const displayOrderId = order._id || order.id;

        const orderInfo = document.getElementById('orderInfo');
        orderInfo.innerHTML = `
            <p><strong>Order ID:</strong> #${displayOrderId}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Total Amount:</strong> ${formatCurrency(order.total)}</p>
            <p><strong>Status:</strong> ${order.status || 'Received'}</p>
            <p><strong>Items:</strong></p>
            <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                ${order.items.map(item => `<li>${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}</li>`).join('')}
            </ul>
        `;
    } catch (error) {
        console.error("Error loading order:", error);
        document.getElementById('orderInfo').innerHTML = '<p>Error loading order details. Please try again.</p>';
    }
});

