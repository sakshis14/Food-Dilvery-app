document.addEventListener("DOMContentLoaded", async () => {
  const restaurantId = new URLSearchParams(window.location.search).get("id");
  console.log("🍽️ Loading menu for restaurant ID:", restaurantId);
  
  if (!restaurantId) {
    console.error("❌ No restaurant ID provided");
    return location.href = "home.html";
  }

  const menuContainer = document.getElementById("menuContainer");
  const restaurantName = document.getElementById("restaurantName");

  try {
    console.log("🔍 Fetching restaurants...");
    const restaurants = await Storage.getRestaurants();
    console.log(`Found ${restaurants.length} restaurants`);
    
    const restaurant = restaurants.find(r => r._id === restaurantId || r.id === restaurantId);
    console.log("Restaurant found:", restaurant ? restaurant.name : "NOT FOUND");
    console.log("Restaurant _id:", restaurant?._id, "Restaurant id:", restaurant?.id);

    if (!restaurant) {
      console.error("❌ Restaurant not found with ID:", restaurantId);
      menuContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">❌</div>
          <h3>Restaurant not found</h3>
          <p>Please go back and try again.</p>
        </div>
      `;
      return;
    }

    restaurantName.textContent = restaurant.name + " - Menu";

    console.log("🔍 Fetching menu items for restaurant:", restaurantId);
    const menuItems = await Storage.getMenuItems(restaurantId);
    console.log(`📋 Received ${menuItems.length} menu items`);

    if (menuItems.length === 0) {
      menuContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🍽️</div>
          <h3>No menu items available</h3>
          <p>This restaurant doesn't have any menu items yet.</p>
        </div>
      `;
      return;
    }

    menuContainer.innerHTML = menuItems.map(item => {
      // Properly escape image URL and other attributes
      const imageUrl = getImageUrl(item.image || '');
      const itemName = item.name || '';
      const itemDesc = item.description || '';
      const itemId = item._id || item.id;
      const itemPrice = item.price || 0;
      const isAvailable = item.available !== false; // Default to true if not specified
      
      // Escape for HTML attributes
      const escapedImageUrl = imageUrl.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const escapedName = itemName.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const escapedDesc = itemDesc.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      
      // For onclick, escape single quotes
      const onclickName = itemName.replace(/'/g, "\\'");
      const onclickImage = imageUrl.replace(/'/g, "\\'");
      
      return `
      <div class="card menu-item-card" ${!isAvailable ? 'style="opacity: 0.6;"' : ''}>
        ${!isAvailable ? '<span class="restaurant-badge" style="position: absolute; top: 10px; right: 10px; background: #ff6b6b;">Unavailable</span>' : ''}
        <img src="${escapedImageUrl}" 
             alt="${escapedName}"
             loading="lazy"
             style="display: block; max-width: 100%; height: auto;"
             onerror="console.error('Image failed to load:', '${escapedImageUrl}'); this.onerror=null; this.src='https://via.placeholder.com/400x300?text=' + encodeURIComponent('${escapedName}')">
        <h4>${escapedName}</h4>
        <p>${escapedDesc}</p>
        <strong>₹${itemPrice}</strong>
        <button class="btn btn-primary" ${!isAvailable ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
          onclick="${isAvailable ? `addToCart('${itemId}','${onclickName}',${itemPrice},'${onclickImage}')` : 'return false;'}">
          ${isAvailable ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    `;
    }).join("");
  } catch (error) {
    console.error("Error loading menu:", error);
    menuContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <h3>Error loading menu</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
});

async function addToCart(id, name, price, image) {
  const user = Storage.getUser();
  if (!user) {
    alert("Please login first to add items to cart");
    return;
  }

  try {
    await Storage.addToCart({
      productId: id,
      name,
      price,
      image,
      quantity: 1
    });
    alert("Added to cart ✅");
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Failed to add item to cart. Please try again.");
  }
}
