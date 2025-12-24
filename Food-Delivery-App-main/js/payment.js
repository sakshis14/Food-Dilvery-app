document.addEventListener('DOMContentLoaded', async () => {
    await loadOrderSummary();
});

async function loadOrderSummary() {
    try {
        const cart = await Storage.getCart();
        const orderSummary = document.getElementById('orderSummary');
        const orderTotal = document.getElementById('orderTotal');

        if (!cart || cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        const subtotal = calculateCartTotal(cart);
        const deliveryFee = 2.99;
        const total = subtotal + deliveryFee;

        orderSummary.innerHTML = cart.map(item => `
            <div class="summary-row" style="font-size: 0.9rem;">
                <span>${item.name} x${item.quantity}</span>
                <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
        `).join('') + `
            <div class="summary-row" style="font-size: 0.9rem;">
                <span>Delivery Fee</span>
                <span>${formatCurrency(deliveryFee)}</span>
            </div>
        `;

        orderTotal.textContent = formatCurrency(total);
    } catch (error) {
        console.error("Error loading order summary:", error);
        alert("Failed to load order summary. Please try again.");
        window.location.href = 'cart.html';
    }
}

async function processPayment(method) {
    const user = Storage.getUser();
    if (!user) {
        alert("Please login first to proceed with payment");
        window.location.href = 'login.html';
        return;
    }

    try {
        const cart = await Storage.getCart();
        
        if (!cart || cart.length === 0) {
            alert('Your cart is empty!');
            window.location.href = 'cart.html';
            return;
        }

        // Get delivery address from storage
        const deliveryLocation = Storage.getLocation();

        // Create order via backend API
        const response = await fetch("http://localhost:5000/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id || user._id,
                paymentMethod: method,
                deliveryAddress: {
                    area: deliveryLocation.area || '',
                    address: deliveryLocation.address || ''
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Order created successfully:", data);
            
            // Clear cart
            await Storage.clearCart();
            
            // Update cart badge
            if (typeof updateCartBadge === 'function') {
                updateCartBadge();
            }
            
            // Redirect to success page with order ID
            window.location.href = `payment-success.html?orderId=${data._id || data.id}`;
        } else {
            console.error("Create order error:", data);
            alert(data.message || "Failed to process payment. Please try again.");
        }
    } catch (error) {
        console.error("Payment processing error:", error);
        alert("Failed to process payment. Please check your connection and try again.");
    }
}

// Make processPayment globally accessible
window.processPayment = processPayment;

