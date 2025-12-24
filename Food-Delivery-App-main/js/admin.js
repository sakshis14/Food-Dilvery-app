document.addEventListener('DOMContentLoaded', async () => {
    // Check admin authentication
    const user = Storage.getUser();
    if (!user || !user.isAdmin || user.email !== 'admin@gmail.com') {
        // Redirect to login page with admin flag
        window.location.href = 'login.html?admin=true';
        return;
    }
    
    // Initialize admin navigation (profile dropdown)
    initializeAdminNavigation();
    
    await loadRestaurantsForSelect();
    await loadRestaurantsTable();
    
    // Add restaurant form handler
    document.getElementById('addRestaurantForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const restaurant = {
            name: formData.get('name'),
            cuisine: formData.get('cuisine'),
            rating: parseFloat(formData.get('rating')),
            deliveryTime: formData.get('deliveryTime'),
            image: formData.get('image'),
            description: formData.get('description')
        };
        
        Storage.addCustomRestaurant(restaurant);
        document.getElementById('restaurantSuccess').style.display = 'block';
        e.target.reset();
        await loadRestaurantsForSelect();
        await loadRestaurantsTable();
        
        setTimeout(() => {
            document.getElementById('restaurantSuccess').style.display = 'none';
        }, 3000);
    });
    
    // Add menu item form handler
    document.getElementById('addMenuItemForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const menuItem = {
            restaurantId: parseInt(formData.get('restaurantId')),
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            image: formData.get('image')
        };
        
        Storage.addCustomMenuItem(menuItem);
        document.getElementById('menuItemSuccess').style.display = 'block';
        e.target.reset();
        
        setTimeout(() => {
            document.getElementById('menuItemSuccess').style.display = 'none';
        }, 3000);
    });
});

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Reload restaurants table if viewing that tab
    if (tabName === 'viewRestaurants') {
        loadRestaurantsTable();
    }
}

async function loadRestaurantsForSelect() {
    const restaurants = await Storage.getRestaurants();
    const select = document.getElementById('menuRestaurantId');
    select.innerHTML = '<option value="">Select Restaurant</option>' + 
        restaurants.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
}

async function loadRestaurantsTable() {
    const container = document.getElementById('restaurantsTableContainer');
    const restaurants = await Storage.getRestaurants();
    
    if (restaurants.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <h3>No restaurants available</h3>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="restaurants-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Cuisine</th>
                    <th>Rating</th>
                    <th>Delivery Time</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${restaurants.map(r => `
                    <tr>
                        <td>${r.id}</td>
                        <td><strong>${r.name}</strong></td>
                        <td>${r.cuisine}</td>
                        <td>⭐ ${r.rating}</td>
                        <td>${r.deliveryTime}</td>
                        <td>${r.description}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

