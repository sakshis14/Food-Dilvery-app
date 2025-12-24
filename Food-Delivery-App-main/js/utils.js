// Utility functions for the Food Delivery System

// Backend API base URL
const API_BASE_URL = "http://localhost:5000";

// Helper function to get full image URL
function getImageUrl(imagePath) {
  if (!imagePath) return '';
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // If it's a relative path starting with /, prepend backend URL
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  // Otherwise, assume it's a relative path and prepend backend URL with /
  return `${API_BASE_URL}/${imagePath}`;
}

// LocalStorage helpers
const Storage = {
    // Cart operations (Backend API)
    getCart: async () => {
        const user = Storage.getUser();
        if (!user || !user.id) {
            // Fallback to localStorage if not logged in
            const localCart = localStorage.getItem('cart');
            return localCart ? JSON.parse(localCart) : [];
        }

        try {
            const response = await fetch(`http://localhost:5000/api/cart/${user.id}`);
            if (response.ok) {
                const cart = await response.json();
                // Update cart badge
                updateCartBadge();
                return cart;
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        }

        // Fallback to localStorage
        const localCart = localStorage.getItem('cart');
        return localCart ? JSON.parse(localCart) : [];
    },

    setCart: async (cart) => {
        const user = Storage.getUser();
        if (!user || !user.id) {
            // Fallback to localStorage if not logged in
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            return;
        }

        // Cart is managed by backend, so we don't need to set it here
        updateCartBadge();
    },

    addToCart: async (item) => {
        const user = Storage.getUser();
        if (!user || !user.id) {
            alert("Please login first to add items to cart");
            return [];
        }

        try {
            const response = await fetch("http://localhost:5000/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user.id,
                    item: {
                        productId: item.productId || item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: item.quantity || 1
                    }
                })
            });

            if (response.ok) {
                const cart = await response.json();
                updateCartBadge();
                return cart;
            } else {
                const error = await response.json();
                console.error("Error adding to cart:", error);
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
        }

        return [];
    },

    removeFromCart: async (itemId) => {
        const user = Storage.getUser();
        if (!user || !user.id) {
            // Fallback to localStorage
            const localCart = localStorage.getItem('cart');
            const cart = localCart ? JSON.parse(localCart) : [];
            const filtered = cart.filter(item => (item.id || item.productId) !== itemId);
            localStorage.setItem('cart', JSON.stringify(filtered));
            updateCartBadge();
            return filtered;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/cart/${user.id}/${itemId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                const cart = await response.json();
                updateCartBadge();
                return cart;
            }
        } catch (error) {
            console.error("Error removing from cart:", error);
        }

        return [];
    },

    updateCartItemQuantity: async (itemId, quantity) => {
        const user = Storage.getUser();
        if (!user || !user.id) {
            // Fallback to localStorage
            const localCart = localStorage.getItem('cart');
            const cart = localCart ? JSON.parse(localCart) : [];
            const item = cart.find(cartItem => (cartItem.id || cartItem.productId) === itemId);
            
            if (item) {
                if (quantity <= 0) {
                    return await Storage.removeFromCart(itemId);
                }
                item.quantity = quantity;
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            return cart;
        }

        try {
            const response = await fetch("http://localhost:5000/api/cart/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user.id,
                    productId: itemId,
                    quantity: quantity
                })
            });

            if (response.ok) {
                const cart = await response.json();
                updateCartBadge();
                return cart;
            }
        } catch (error) {
            console.error("Error updating cart:", error);
        }

        return [];
    },

    clearCart: async () => {
        const user = Storage.getUser();
        if (!user || !user.id) {
            localStorage.removeItem('cart');
            updateCartBadge();
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/cart/${user.id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                updateCartBadge();
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    },

    // User authentication
    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // User registration (for signup)
    getUsers: () => {
        const users = localStorage.getItem('registeredUsers');
        return users ? JSON.parse(users) : [];
    },

    setUsers: (users) => {
        localStorage.setItem('registeredUsers', JSON.stringify(users));
    },

    logout: () => {
        localStorage.removeItem('user');
        // Get the current page's pathname or href
        const currentPath = window.location.pathname || window.location.href;
        
        // Check if we're in the pages directory
        // If pathname contains '/pages/' or 'pages/', we're already in pages directory
        if (currentPath.includes('/pages/') || currentPath.includes('pages\\')) {
            window.location.href = 'login.html';
        } else {
            // We're in root directory
            window.location.href = 'pages/login.html';
        }
    },

    // Location management
    setLocation: (location) => {
        localStorage.setItem('deliveryLocation', JSON.stringify(location));
    },

    getLocation: () => {
        const location = localStorage.getItem('deliveryLocation');
        return location ? JSON.parse(location) : { area: '', address: '' };
    },

    getAvailableAreas: () => {
        return [
            'MG Road',
            'Belgaum',
            'Indiranagar',
            'RPD',
            'Khanapur',
            'Koramangala',
            'Whitefield',
            'Nehru Nagar',
            'Electronic City',
            'HSR Layout',
            'BTM Layout',
            'Jayanagar',
            'Rajajinagar',
            'Yelahanka',
            'Banashankari',
            'Marathahalli',
            'Bellandur',
            'Hebbal',
            'Malleshwaram',
            'JP Nagar',
            'Vijayanagar',
            'KR Puram',
            'Basavanagudi',
            'Frazer Town'
        ];
    },

    // Orders (Backend API)
    getOrders: async () => {
        const user = Storage.getUser();
        if (!user || !user.id) {
            // Fallback to localStorage if not logged in
            const localOrders = localStorage.getItem('orders');
            return localOrders ? JSON.parse(localOrders) : [];
        }

        try {
            const response = await fetch(`http://localhost:5000/api/orders/user/${user.id}`);
            if (response.ok) {
                const orders = await response.json();
                // Remove duplicates based on _id or id (extra safety check)
                const uniqueOrders = [];
                const seenIds = new Set();
                
                orders.forEach(order => {
                    const orderId = order._id || order.id;
                    if (orderId && !seenIds.has(String(orderId))) {
                        seenIds.add(String(orderId));
                        uniqueOrders.push(order);
                    }
                });
                
                return uniqueOrders;
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }

        // Fallback to localStorage
        const localOrders = localStorage.getItem('orders');
        return localOrders ? JSON.parse(localOrders) : [];
    },

    getOrder: async (orderId) => {
        const user = Storage.getUser();
        if (!user || !user.id) {
            // Fallback to localStorage
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            return orders.find(o => o.id === orderId || o._id === orderId);
        }

        try {
            const response = await fetch(`http://localhost:5000/api/orders/order/${orderId}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error("Error fetching order:", error);
        }

        // Fallback to localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        return orders.find(o => o.id === orderId || o._id === orderId);
    },

    addOrder: async (order) => {
        // Orders are now created directly via the backend API in payment.js
        // This function is kept for backward compatibility but orders should be created via API
        const orders = await Storage.getOrders();
        const newOrder = {
            ...order,
            id: Date.now(),
            _id: Date.now().toString(),
            status: 'Received',
            createdAt: new Date().toISOString()
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        return newOrder;
    },

    updateOrderStatus: async (orderId, status) => {
        // This could be updated to use backend API in the future
        const orders = await Storage.getOrders();
        const order = orders.find(o => (o.id === orderId || o._id === orderId));
        if (order) {
            order.status = status;
            localStorage.setItem('orders', JSON.stringify(orders));
        }
        return order;
    },

    // Restaurants (for admin)
    getRestaurants: async () => {
        // Try backend API first
        try {
            const response = await fetch("http://localhost:5000/api/restaurants");
            if (response.ok) {
                const restaurants = await response.json();
                console.log(`✅ Successfully loaded ${restaurants.length} restaurants from backend API`);
                const customRestaurants = Storage.getCustomRestaurants();
                console.log(`Found ${customRestaurants.length} custom restaurants in localStorage`);
                return [...restaurants, ...customRestaurants];
            }
        } catch (error) {
            console.log(`⚠️ Backend API not available, trying JSON files:`, error.message);
        }

        // Fallback to JSON files
        const possiblePaths = [
            '../data/restaurants.json',  // From pages/ directory
            'data/restaurants.json',     // From root directory
            './data/restaurants.json'    // Alternative root path
        ];
        
        for (const path of possiblePaths) {
            try {
                console.log(`Trying to load restaurants from: ${path}`);
                const response = await fetch(path);
                if (!response.ok) {
                    continue; // Try next path
                }
                const restaurants = await response.json();
                console.log(`✅ Successfully loaded ${restaurants.length} restaurants from ${path}`);
                const customRestaurants = Storage.getCustomRestaurants();
                console.log(`Found ${customRestaurants.length} custom restaurants in localStorage`);
                return [...restaurants, ...customRestaurants];
            } catch (error) {
                console.log(`❌ Failed to load from ${path}:`, error.message);
                continue; // Try next path
            }
        }
        
        // If all paths failed, show error but still return custom restaurants
        console.error('⚠️ Could not load restaurants from backend or JSON files. Using localStorage only.');
        
        // Check if using file:// protocol
        if (window.location.protocol === 'file:') {
            console.error('');
            console.error('🚨 CORS ERROR DETECTED!');
            console.error('You are using file:// protocol which blocks fetch requests.');
            console.error('');
            console.error('SOLUTION: Use a local web server!');
            console.error('1. Open PowerShell/CMD in this folder');
            console.error('2. Run: python -m http.server 8000');
            console.error('3. Open: http://localhost:8000/pages/home.html');
            console.error('');
            console.error('See START_HERE.md for detailed instructions.');
        }
        
        const customRestaurants = Storage.getCustomRestaurants();
        if (customRestaurants.length === 0) {
            console.error('⚠️ No restaurants found in localStorage either. Please check:');
            console.error('1. Are you using a local web server? (file:// protocol won\'t work)');
            console.error('2. Is the backend server running on port 5000?');
            console.error('3. Is data/restaurants.json in the correct location?');
        }
        return customRestaurants;
    },

    getCustomRestaurants: () => {
        const restaurants = localStorage.getItem('customRestaurants');
        return restaurants ? JSON.parse(restaurants) : [];
    },

    addCustomRestaurant: (restaurant) => {
        const restaurants = Storage.getCustomRestaurants();
        const newRestaurant = {
            ...restaurant,
            id: Date.now()
        };
        restaurants.push(newRestaurant);
        localStorage.setItem('customRestaurants', JSON.stringify(restaurants));
        return newRestaurant;
    },

    // Menu items (for admin)
    getMenuItems: async (restaurantId) => {
        // Try backend API first
        try {
            console.log(`🔍 Fetching menu items for restaurant: ${restaurantId}`);
            const response = await fetch(`http://localhost:5000/api/menu/restaurant/${restaurantId}`);
            console.log(`Response status: ${response.status}`);
            
            if (response.ok) {
                const menuItems = await response.json();
                console.log(`✅ Successfully loaded ${menuItems.length} menu items from backend API for restaurant ${restaurantId}`);
                console.log('Menu items:', menuItems);
                const customMenuItems = Storage.getCustomMenuItems(restaurantId);
                return [...menuItems, ...customMenuItems];
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error(`❌ API error: ${response.status} -`, errorData);
            }
        } catch (error) {
            console.error(`⚠️ Backend API error:`, error);
            console.log(`⚠️ Backend API not available, trying JSON files:`, error.message);
        }

        // Fallback to JSON files
        const possiblePaths = [
            '../data/menu.json',  // From pages/ directory
            'data/menu.json',     // From root directory
            './data/menu.json'    // Alternative root path
        ];
        
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    continue; // Try next path
                }
                const menuData = await response.json();
                const menuItems = menuData[restaurantId] || [];
                const customMenuItems = Storage.getCustomMenuItems(restaurantId);
                console.log(`✅ Loaded ${menuItems.length} menu items for restaurant ${restaurantId}`);
                return [...menuItems, ...customMenuItems];
            } catch (error) {
                console.log(`Failed to load menu from ${path}:`, error.message);
                continue; // Try next path
            }
        }
        
        // If all paths failed, return custom menu items only
        console.error('⚠️ Could not load menu from backend or JSON files. Using localStorage only.');
        return Storage.getCustomMenuItems(restaurantId);
    },

    getCustomMenuItems: (restaurantId) => {
        const menuItems = localStorage.getItem('customMenuItems');
        if (!menuItems) return [];
        const allItems = JSON.parse(menuItems);
        return allItems.filter(item => item.restaurantId == restaurantId);
    },

    addCustomMenuItem: (menuItem) => {
        const menuItems = Storage.getCustomMenuItems(menuItem.restaurantId);
        const allCustomItems = JSON.parse(localStorage.getItem('customMenuItems') || '[]');
        const newItem = {
            ...menuItem,
            id: Date.now()
        };
        menuItems.push(newItem);
        allCustomItems.push(newItem);
        localStorage.setItem('customMenuItems', JSON.stringify(allCustomItems));
        return newItem;
    }
};

// Update cart badge in navigation
async function updateCartBadge() {
    try {
        const cart = await Storage.getCart();
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error("Error updating cart badge:", error);
        // Fallback to localStorage
        const localCart = localStorage.getItem('cart');
        const cart = localCart ? JSON.parse(localCart) : [];
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
}

// Navigation helper
function navigateTo(page) {
    window.location.href = page;
}

// Format currency
function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

// Calculate cart total
function calculateCartTotal(cart) {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Check if user is logged in
function checkAuth() {
    const user = Storage.getUser();
    if (!user) {
        window.location.href = 'pages/login.html';
        return false;
    }
    return true;
}

// Initialize profile dropdown and navigation
function initializeUserNavigation() {
    const user = Storage.getUser();
    const navLinks = document.querySelector('.nav-links');
    
    if (!navLinks) return;
    
    // Remove existing profile container if any
    const existingProfile = document.querySelector('.profile-container');
    if (existingProfile) {
        existingProfile.remove();
    }
    
    // Find Sign In link
    const signInItems = Array.from(navLinks.querySelectorAll('li'));
    const signInItem = signInItems.find(li => {
        const link = li.querySelector('a');
        return link && (link.textContent.includes('Sign In') || link.href.includes('login.html'));
    });
    
    // Determine correct path for tracking page
    const currentPath = window.location.pathname;
    const isInPages = currentPath.includes('/pages/') || currentPath.includes('pages\\');
    const trackingPath = isInPages ? 'tracking.html' : 'pages/tracking.html';
    
    // Check if user is admin - don't show profile for admin on regular pages
    const isAdmin = user && user.isAdmin && user.email === 'admin@gmail.com';
    
    if (user && !isAdmin) {
        // Remove Sign In link
        if (signInItem) {
            signInItem.remove();
        }
        
        // Create profile container
        const profileContainer = document.createElement('li');
        profileContainer.className = 'profile-container';
        const userInitial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
        profileContainer.innerHTML = `
            <div class="profile-avatar" onclick="toggleProfileDropdown(event)">
                ${userInitial}
            </div>
            <div class="profile-dropdown" id="profileDropdown">
                <div class="profile-dropdown-header">
                    <div class="profile-name">${user.name || 'User'}</div>
                    <div class="profile-email">${user.email}</div>
                </div>
                <ul class="profile-dropdown-menu">
                    <li><a href="#" onclick="event.preventDefault(); closeProfileDropdown();"><span class="icon">👤</span> My Profile</a></li>
                    <li><a href="${trackingPath}"><span class="icon">📦</span> My Orders</a></li>
                    <li><a href="#" onclick="event.preventDefault(); closeProfileDropdown();"><span class="icon">⚙️</span> Settings</a></li>
                    <li class="divider"></li>
                    <li class="logout-item"><a href="#" onclick="event.preventDefault(); handleLogout();"><span class="icon">🚪</span> Logout</a></li>
                </ul>
            </div>
        `;
        
        navLinks.appendChild(profileContainer);
    } else {
        // Ensure Sign In link exists
        if (!signInItem) {
            const signInItem = document.createElement('li');
            const signInLink = document.createElement('a');
            const loginPath = isInPages ? 'login.html' : 'pages/login.html';
            signInLink.href = loginPath;
            signInLink.textContent = 'Sign In';
            signInItem.appendChild(signInLink);
            navLinks.appendChild(signInItem);
        }
    }
}

// Toggle profile dropdown
function toggleProfileDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('profileDropdown');
    const isActive = dropdown.classList.contains('active');
    
    // Close all dropdowns
    document.querySelectorAll('.profile-dropdown').forEach(d => {
        d.classList.remove('active');
    });
    
    // Toggle current dropdown
    if (!isActive) {
        dropdown.classList.add('active');
    }
}

// Close profile dropdown
function closeProfileDropdown() {
    document.querySelectorAll('.profile-dropdown').forEach(d => {
        d.classList.remove('active');
    });
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        Storage.logout();
    }
}

// Make handleLogout globally accessible
window.handleLogout = handleLogout;

// Helper function to redirect to login page
function redirectToLogin() {
    const currentPath = window.location.pathname || window.location.href;
    
    // Check if we're in the pages directory
    if (currentPath.includes('/pages/') || currentPath.includes('pages\\')) {
        window.location.href = 'login.html';
    } else {
        // We're in root directory
        window.location.href = 'pages/login.html';
    }
}

// Make redirectToLogin globally accessible
window.redirectToLogin = redirectToLogin;

// Initialize admin profile dropdown and navigation (for admin dashboard only)
function initializeAdminNavigation() {
    const user = Storage.getUser();
    const navLinks = document.querySelector('.nav-links');
    
    if (!navLinks) return;
    
    // Check if user is admin
    const isAdmin = user && user.isAdmin && user.email === 'admin@gmail.com';
    
    if (!isAdmin) {
        return; // Don't initialize if not admin
    }
    
    // Remove existing profile container if any
    const existingProfile = document.querySelector('.profile-container');
    if (existingProfile) {
        existingProfile.remove();
    }
    
    // Find Sign In link
    const signInItems = Array.from(navLinks.querySelectorAll('li'));
    const signInItem = signInItems.find(li => {
        const link = li.querySelector('a');
        return link && (link.textContent.includes('Sign In') || link.href.includes('login.html'));
    });
    
    // Remove Sign In link
    if (signInItem) {
        signInItem.remove();
    }
    
    // Create admin profile container
    const profileContainer = document.createElement('li');
    profileContainer.className = 'profile-container';
    const userInitial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
    profileContainer.innerHTML = `
        <div class="profile-avatar" onclick="toggleProfileDropdown(event)">
            ${userInitial}
        </div>
        <div class="profile-dropdown" id="profileDropdown">
            <div class="profile-dropdown-header">
                <div class="profile-name">${user.name || 'Admin'}</div>
                <div class="profile-email">${user.email}</div>
            </div>
            <ul class="profile-dropdown-menu">
                <li><a href="#" onclick="event.preventDefault(); closeProfileDropdown();"><span class="icon">👤</span> Admin Profile</a></li>
                <li><a href="#" onclick="event.preventDefault(); closeProfileDropdown();"><span class="icon">⚙️</span> Settings</a></li>
                <li class="divider"></li>
                <li class="logout-item"><a href="#" onclick="event.preventDefault(); handleLogout();"><span class="icon">🚪</span> Logout</a></li>
            </ul>
        </div>
    `;
    
    navLinks.appendChild(profileContainer);
}

// Make initializeAdminNavigation globally accessible
window.initializeAdminNavigation = initializeAdminNavigation;

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-container')) {
        closeProfileDropdown();
    }
});

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', async () => {
    await updateCartBadge();
    
    // Only initialize user navigation if not on admin page
    const currentPath = window.location.pathname || window.location.href;
    const isAdminPage = currentPath.includes('admin.html');
    
    if (!isAdminPage) {
        initializeUserNavigation();
    }
});

