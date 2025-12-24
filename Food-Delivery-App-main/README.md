# Food Delivery System

A frontend-only Food Delivery Web Application built with HTML, CSS, and JavaScript. Perfect for DevOps projects with GitHub, Jenkins, Docker, Kubernetes, and Terraform.

## Features

- 🍕 **10 Restaurants** with diverse cuisines
- 🍽️ **50+ Menu Items** across all restaurants
- 🛒 **Shopping Cart** with localStorage persistence
- 💳 **Payment Options** (UPI, Card, COD)
- 📦 **Order Tracking** with status updates
- 👨‍💼 **Admin Panel** to add restaurants and menu items
- 📱 **Responsive Design** for all devices

## Quick Start

### Option 1: Using Python (Recommended)

1. Open a terminal in the project directory
2. Run one of these commands:

**Windows (PowerShell):**
```powershell
.\start-server.ps1
```

**Windows (Command Prompt):**
```cmd
start-server.bat
```

**Linux/Mac:**
```bash
python3 -m http.server 8000
```

3. Open your browser and go to: `http://localhost:8000`

### Option 2: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 3: Using Node.js (if you have it)

```bash
npx http-server -p 8000
```

## Important Note

⚠️ **You MUST use a local web server** - Opening HTML files directly (file:// protocol) will NOT work due to browser CORS restrictions when loading JSON files.

## Project Structure

```
Food_Delivery_System/
├── css/
│   └── style.css          # Shared stylesheet
├── js/
│   ├── utils.js           # Shared utilities
│   ├── login.js           # Login page logic
│   ├── home.js            # Home page (restaurants list)
│   ├── menu.js            # Menu page logic
│   ├── cart.js            # Cart page logic
│   ├── payment.js         # Payment page logic
│   ├── payment-success.js # Success page logic
│   ├── tracking.js        # Order tracking logic
│   └── admin.js           # Admin page logic
├── pages/
│   ├── login.html
│   ├── home.html
│   ├── menu.html
│   ├── cart.html
│   ├── payment.html
│   ├── payment-success.html
│   ├── tracking.html
│   └── admin.html
├── data/
│   ├── restaurants.json   # Restaurant data (10 restaurants)
│   └── menu.json          # Menu items data (50+ items)
├── index.html             # Landing page
└── README.md
```

## Usage

1. **Start the server** using one of the methods above
2. **Open** `http://localhost:8000` in your browser
3. **Login** with any email and password (dummy validation)
4. **Browse** restaurants and add items to cart
5. **Checkout** and place orders
6. **Track** your orders
7. **Admin** panel to add custom restaurants and menu items

## Restaurants

1. Pizza Paradise (Italian)
2. Burger King (American)
3. Sushi Express (Japanese)
4. Taco Fiesta (Mexican)
5. Curry House (Indian)
6. Noodle Bar (Chinese)
7. Thai Garden (Thai)
8. Mediterranean Delight (Mediterranean)
9. BBQ Smokehouse (BBQ)
10. Sweet Dreams Bakery (Desserts)

## Technologies

- Pure HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript (ES6+)
- localStorage for data persistence
- JSON for static data

## Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari

## Troubleshooting

### Restaurants not showing?

1. Make sure you're using a local web server (not opening files directly)
2. Check browser console (F12) for any errors
3. Verify `data/restaurants.json` exists and is valid JSON
4. Try clearing browser cache

### Images not loading?

- Images are loaded from Unsplash CDN
- Check your internet connection
- Images have fallback placeholders

## For DevOps Projects

This application is designed to work well with:
- **GitHub** - Version control
- **Jenkins** - CI/CD pipelines
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **Terraform** - Infrastructure as Code

The clean structure and modular code make it easy to containerize and deploy.

## License

This project is for academic/educational purposes.

