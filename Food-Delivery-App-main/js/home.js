let allRestaurants = [];
let filteredRestaurants = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initializeLocation();
    await loadRestaurants();
    setupEventListeners();
});

/* =========================
   LOCATION LOGIC (UNCHANGED)
========================= */
async function initializeLocation() {
    const location = Storage.getLocation();
    const areas = Storage.getAvailableAreas();

    const locationSelect = document.getElementById('locationSelect');
    const areaSelect = document.getElementById('areaSelect');

    areas.forEach(area => {
        const option1 = document.createElement('option');
        option1.value = area;
        option1.textContent = area;
        locationSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = area;
        option2.textContent = area;
        areaSelect.appendChild(option2);
    });

    if (location.area) {
        locationSelect.value = location.area;
        areaSelect.value = location.area;
    } else {
        // Don't set default location - show all restaurants
        locationSelect.value = '';
        areaSelect.value = '';
    }

    updateLocationDisplay();
}

function updateLocationDisplay() {
    const location = Storage.getLocation();
    const locationSelect = document.getElementById('locationSelect');
    if (locationSelect) {
        locationSelect.value = location.area || '';
    }
}

/* =========================
   LOAD RESTAURANTS (UPDATED)
========================= */
async function loadRestaurants() {
    const container = document.getElementById('restaurantsContainer');

    try {
        console.log("Fetching restaurants from backend...");

        const res = await fetch("http://localhost:5000/api/restaurants");
        if (!res.ok) throw new Error("Failed to fetch restaurants");

        allRestaurants = await res.json();
        console.log("Restaurants loaded:", allRestaurants.length);

        // Populate cuisine filter
        const cuisines = [...new Set(allRestaurants.map(r => r.cuisine))].sort();
        const cuisineFilter = document.getElementById('cuisineFilter');
        cuisineFilter.innerHTML = `<option value="">All Cuisines</option>`;

        cuisines.forEach(cuisine => {
            const option = document.createElement('option');
            option.value = cuisine;
            option.textContent = cuisine;
            cuisineFilter.appendChild(option);
        });

        filterAndDisplayRestaurants();

    } catch (error) {
        console.error("Error loading restaurants:", error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>Error loading restaurants</h3>
                <p>Backend server not running</p>
                <button onclick="location.reload()" class="btn btn-primary" style="margin-top:1rem;">
                    Reload
                </button>
            </div>
        `;
    }
}

/* =========================
   FILTER + SORT
========================= */
function filterAndDisplayRestaurants() {
    const location = Storage.getLocation();
    const sortValue = document.getElementById('sortSelect').value;
    const cuisineValue = document.getElementById('cuisineFilter').value;

    filteredRestaurants = allRestaurants.filter(restaurant => {
        // Only filter by location if an area is selected
        if (location.area && location.area.trim() !== '') {
            if (restaurant.areas && !restaurant.areas.includes(location.area)) {
                return false;
        }
        }

        // Filter by cuisine if selected
        if (cuisineValue && restaurant.cuisine !== cuisineValue) return false;

        return true;
    });

    if (sortValue) {
        sortRestaurants(sortValue);
    }

    displayRestaurants();
}

function sortRestaurants(sortType) {
    const [field, order] = sortType.split('-');

    filteredRestaurants.sort((a, b) => {
        let comparison = 0;

        switch (field) {
            case 'rating':
                comparison = a.rating - b.rating;
                break;
            case 'time':
                const getTimeValue = (str) => {
                    const match = str.match(/(\d+)/);
                    return match ? parseInt(match[1]) : 0;
                };
                comparison = getTimeValue(a.deliveryTime) - getTimeValue(b.deliveryTime);
                break;
            case 'price':
                comparison = (a.minOrder || 0) - (b.minOrder || 0);
                break;
            case 'fee':
                comparison = (a.deliveryFee || 0) - (b.deliveryFee || 0);
                break;
        }

        return order === 'desc' ? -comparison : comparison;
    });
}

/* =========================
   DISPLAY RESTAURANTS
========================= */
function displayRestaurants() {
    const container = document.getElementById('restaurantsContainer');
    const location = Storage.getLocation();

    if (filteredRestaurants.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <h3>No restaurants found</h3>
                <p>No restaurants deliver to ${location.area || 'this area'}.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredRestaurants.map(restaurant => {
        const deliversToArea =
            !location.area ||
            (restaurant.areas && restaurant.areas.includes(location.area));

        const imageUrl = getImageUrl(restaurant.image || '');
        const restaurantName = restaurant.name || '';
        const escapedImageUrl = imageUrl.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const escapedName = restaurantName.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        return `
            <div class="card restaurant-card"
                 onclick="navigateTo('menu.html?id=${restaurant._id}')">

                ${!deliversToArea ? '<span class="restaurant-badge">Not Available</span>' : ''}

                <img src="${escapedImageUrl}"
                     alt="${escapedName}"
                     loading="lazy"
                     style="display: block; width: 100%; height: 200px; object-fit: cover;"
                     onerror="console.error('Restaurant image failed to load:', '${escapedImageUrl}'); this.onerror=null; this.src='https://via.placeholder.com/400x200?text=' + encodeURIComponent('${escapedName}')">

                <h3>${escapedName}</h3>
                <p style="color: var(--text-light); margin-bottom:1rem;">
                    ${restaurant.description || ''}
                </p>

                <div class="restaurant-info">
                    <span class="rating">⭐ ${restaurant.rating || 0}</span>
                    <span>${restaurant.cuisine || ''}</span>
                    <span>⏱️ ${restaurant.deliveryTime || ''}</span>
                </div>

                <div class="delivery-info">
                    <span>💰 Delivery: ₹${restaurant.deliveryFee || 0}</span>
                    <span>Min: ₹${restaurant.minOrder || 0}</span>
                </div>
            </div>
        `;
    }).join('');
}

/* =========================
   EVENT LISTENERS
========================= */
function setupEventListeners() {
    document.getElementById('sortSelect')
        .addEventListener('change', filterAndDisplayRestaurants);

    document.getElementById('cuisineFilter')
        .addEventListener('change', filterAndDisplayRestaurants);

    document.getElementById('locationSelect')
        .addEventListener('change', (e) => {
            const location = Storage.getLocation();
            location.area = e.target.value;
            Storage.setLocation(location);
            filterAndDisplayRestaurants();
        });
}

/* =========================
   LOCATION MODAL
========================= */
function openLocationModal() {
    const modal = document.getElementById('locationModal');
    const location = Storage.getLocation();
    document.getElementById('areaSelect').value = location.area || '';
    document.getElementById('addressInput').value = location.address || '';
    modal.style.display = 'block';
}

function closeLocationModal() {
    document.getElementById('locationModal').style.display = 'none';
}

function saveLocation() {
    const area = document.getElementById('areaSelect').value;
    const address = document.getElementById('addressInput').value;

    if (!area) {
        alert('Please select an area');
        return;
    }

    Storage.setLocation({ area, address });
    updateLocationDisplay();
    closeLocationModal();
    filterAndDisplayRestaurants();
}

window.onclick = function (event) {
    const modal = document.getElementById('locationModal');
    if (event.target === modal) closeLocationModal();
};
