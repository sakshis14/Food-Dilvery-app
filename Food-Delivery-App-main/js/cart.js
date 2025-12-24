document.addEventListener("DOMContentLoaded", async () => {
  const user = Storage.getUser();
  if (!user) {
    document.getElementById("cartContainer").innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔒</div>
        <h3>Please login to view your cart</h3>
        <p>You need to be logged in to see your cart items.</p>
        <a href="login.html" class="btn btn-primary" style="margin-top: 1rem;">Sign In</a>
      </div>
    `;
    return;
  }
  await loadCart();
});

async function loadCart() {
  try {
    const cart = await Storage.getCart();
    const container = document.getElementById("cartContainer");
    const summary = document.getElementById("cartSummary");

    if (!cart || cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some delicious items to get started!</p>
          <a href="home.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Restaurants</a>
        </div>
      `;
      summary.style.display = "none";
      return;
    }

    let subtotal = 0;
    const deliveryFee = 2.99;

    container.innerHTML = cart.map(item => {
      // Convert productId to string (handles both ObjectId objects and strings)
      const itemId = String(item.productId || item._id || item.id);
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 1;
      const itemTotal = itemPrice * itemQuantity;
      subtotal += itemTotal;
      
      const imageUrl = getImageUrl(item.image || '');
      const escapedName = (item.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      
      return `
        <div class="card cart-item-card" style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; margin-bottom: 1rem;">
          <img src="${imageUrl}" 
               alt="${escapedName}"
               style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;"
               onerror="this.src='https://via.placeholder.com/120x120?text=${encodeURIComponent(item.name || '')}'">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-dark);">${escapedName}</h4>
            <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">$${itemPrice.toFixed(2)} each</p>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.5rem;">
              <button onclick="updateQty('${itemId}', ${itemQuantity - 1})" 
                      style="background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0 0.5rem; color: var(--primary-color);"
                      ${itemQuantity <= 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>-</button>
              <span style="min-width: 30px; text-align: center; font-weight: 600;">${itemQuantity}</span>
              <button onclick="updateQty('${itemId}', ${itemQuantity + 1})" 
                      style="background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0 0.5rem; color: var(--primary-color);">+</button>
            </div>
            <div style="text-align: right; min-width: 80px;">
              <strong style="color: var(--primary-color); font-size: 1.1rem;">$${itemTotal.toFixed(2)}</strong>
            </div>
            <button onclick="removeItem('${itemId}')" 
                    class="btn" 
                    style="background: var(--primary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
              Remove
            </button>
          </div>
        </div>
      `;
    }).join("");

    const total = subtotal + deliveryFee;
    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("total").textContent = `$${total.toFixed(2)}`;
    summary.style.display = "block";
  } catch (error) {
    console.error("Error loading cart:", error);
    document.getElementById("cartContainer").innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <h3>Error loading cart</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}

async function updateQty(id, qty) {
  if (qty < 1) {
    if (confirm("Remove this item from cart?")) {
      await removeItem(id);
    }
    return;
  }
  
  try {
    // Ensure id is a string
    const productId = String(id);
    await Storage.updateCartItemQuantity(productId, qty);
    await loadCart();
  } catch (error) {
    console.error("Error updating quantity:", error);
    alert("Failed to update quantity. Please try again.");
  }
}

async function removeItem(id) {
  try {
    // Ensure id is a string
    const productId = String(id);
    await Storage.removeFromCart(productId);
    await loadCart();
  } catch (error) {
    console.error("Error removing item:", error);
    alert("Failed to remove item. Please try again.");
  }
}

// Make functions globally accessible
window.updateQty = updateQty;
window.removeItem = removeItem;
