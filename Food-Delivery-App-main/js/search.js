// Search functionality for restaurants and menu items

let searchResults = {
    restaurants: [],
    menuItems: []
};

// Perform search across restaurants and menu items
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchQuery = searchInput.value.trim().toLowerCase();
    
    if (!searchQuery) {
        alert('Please enter a search term');
        return;
    }
    
    // Store search query in sessionStorage
    sessionStorage.setItem('searchQuery', searchQuery);
    
    // Determine correct path based on current location
    const currentPath = window.location.pathname;
    const isInPages = currentPath.includes('/pages/') || currentPath.includes('pages\\');
    const redirectPath = isInPages ? 'search-results.html' : 'pages/search-results.html';
    
    // Redirect to search results page
    window.location.href = redirectPath;
}

// Handle Enter key press in search input
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        performSearch();
    }
}

// Load and filter search results
async function loadSearchResults() {
    const searchQuery = sessionStorage.getItem('searchQuery');
    
    if (!searchQuery) {
        window.location.href = 'home.html';
        return;
    }
    
    const container = document.getElementById('searchResultsContainer');
    const queryDisplay = document.getElementById('searchQueryDisplay');
    
    if (queryDisplay) {
        queryDisplay.textContent = `"${searchQuery}"`;
    }
    
    try {
        // Load all restaurants
        const restaurants = await Storage.getRestaurants();
        
        // Search restaurants
        const matchingRestaurants = restaurants.filter(restaurant => {
            const nameMatch = restaurant.name.toLowerCase().includes(searchQuery);
            const cuisineMatch = restaurant.cuisine.toLowerCase().includes(searchQuery);
            const descMatch = restaurant.description.toLowerCase().includes(searchQuery);
            return nameMatch || cuisineMatch || descMatch;
        });
        
        // Search menu items across all restaurants
        const matchingMenuItems = [];
        for (const restaurant of restaurants) {
            try {
                const menuItems = await Storage.getMenuItems(restaurant.id);
                const filteredItems = menuItems.filter(item => {
                    const nameMatch = item.name.toLowerCase().includes(searchQuery);
                    const descMatch = item.description.toLowerCase().includes(searchQuery);
                    return nameMatch || descMatch;
                });
                
                filteredItems.forEach(item => {
                    matchingMenuItems.push({
                        ...item,
                        restaurantName: restaurant.name,
                        restaurantId: restaurant.id
                    });
                });
            } catch (error) {
                console.error(`Error loading menu for restaurant ${restaurant.id}:`, error);
            }
        }
        
        // Display results
        displaySearchResults(matchingRestaurants, matchingMenuItems, searchQuery);
        
    } catch (error) {
        console.error('Error loading search results:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>Error loading search results</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

function displaySearchResults(restaurants, menuItems, query) {
    const container = document.getElementById('searchResultsContainer');
    
    if (restaurants.length === 0 && menuItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No results found</h3>
                <p>We couldn't find any restaurants or menu items matching "${query}".</p>
                <p style="margin-top: 1rem;">Try searching with different keywords.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Display restaurants
    if (restaurants.length > 0) {
        html += `
            <div style="margin-bottom: 3rem;">
                <h2 style="color: var(--primary-color); margin-bottom: 1.5rem;">
                    Restaurants (${restaurants.length})
                </h2>
                <div class="restaurants-grid">
                    ${restaurants.map(restaurant => {
                        const deliveryFee = restaurant.deliveryFee || 2.99;
                        const minOrder = restaurant.minOrder || 0;
                        const imageUrl = getImageUrl(restaurant.image || '');
                        return `
                            <div class="card restaurant-card" onclick="navigateTo('menu.html?id=${restaurant.id || restaurant._id}')">
                                <img src="${imageUrl}" alt="${restaurant.name}" onerror="this.src='https://via.placeholder.com/400x200?text=${encodeURIComponent(restaurant.name)}'">
                                <h3>${restaurant.name}</h3>
                                <p style="color: var(--text-light); margin-bottom: 1rem;">${restaurant.description}</p>
                                <div class="restaurant-info">
                                    <span class="rating">⭐ ${restaurant.rating}</span>
                                    <span>${restaurant.cuisine}</span>
                                    <span>⏱️ ${restaurant.deliveryTime}</span>
                                </div>
                                <div class="delivery-info">
                                    <span class="delivery-fee">💰 Delivery: $${deliveryFee.toFixed(2)}</span>
                                    ${minOrder > 0 ? `<span>Min: $${minOrder.toFixed(2)}</span>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Display menu items
    if (menuItems.length > 0) {
        html += `
            <div>
                <h2 style="color: var(--primary-color); margin-bottom: 1.5rem;">
                    Menu Items (${menuItems.length})
                </h2>
                <div class="menu-grid">
                    ${menuItems.map(item => {
                        const imageUrl = getImageUrl(item.image || '');
                        return `
                            <div class="card menu-item-card" onclick="navigateTo('menu.html?id=${item.restaurantId}')">
                                <img src="${imageUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x300?text=${encodeURIComponent(item.name)}'">
                                <div class="menu-item-info">
                                    <h4>${item.name}</h4>
                                    <p style="color: var(--text-light); margin-bottom: 0.5rem;">${item.description}</p>
                                    <p style="color: var(--text-light); font-size: 0.85rem; margin-bottom: 0.5rem;">
                                        <strong>From:</strong> ${item.restaurantName}
                                    </p>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                                        <span class="menu-item-price">${formatCurrency(item.price)}</span>
                                        <button class="btn btn-primary" onclick="event.stopPropagation(); addToCartFromSearch(${item.id}, '${item.name}', ${item.price}, '${item.image}', ${item.restaurantId})">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function addToCartFromSearch(id, name, price, image, restaurantId) {
    // Check if user is logged in
    const user = Storage.getUser();
    if (!user) {
        alert('Please login to add items to your cart.');
        redirectToLogin();
        return;
    }
    
    Storage.addToCart({
        id: id,
        name: name,
        price: price,
        image: image,
        restaurantId: restaurantId,
        quantity: 1
    });
    
    // Show feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Added! ✓';
    btn.disabled = true;
    btn.style.background = '#51cf66';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.background = '';
    }, 1500);
}

// Make addToCartFromSearch globally accessible
window.addToCartFromSearch = addToCartFromSearch;

