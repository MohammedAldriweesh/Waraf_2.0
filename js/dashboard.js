import { 
  getCurrentUser, 
  onAuthChange, 
  getUserProducts, 
  saveUserProduct, 
  deleteUserProduct 
} from './firebase.js';

// DOM Elements
const emptyState = document.querySelector('.dashboard__empty');
const productsGrid = document.querySelector('.dashboard__products');
const productSelection = document.querySelector('#product-selection');
const headerAddButton = document.getElementById('add-product-button');
const addButtonsEmpty = document.getElementById('add-product-button-empty');

// Product tracking
const MAX_PRODUCTS = 12;
let currentUser = null;
let userProducts = [];

// Initialize Dashboard
function initDashboard() {
  // Listen for authentication state changes
  onAuthChange((user) => {
    if (user) {
      // User is logged in
      currentUser = user;
      
      // Load user's products from localStorage
      loadUserProducts();
    } else {
      // User is logged out, redirect to home page
      window.location.href = 'index.html';
    }
  });
  
  // Set up event listeners
  setupEventListeners();
}

// Load user's products from localStorage
function loadUserProducts() {
  if (!currentUser) return;
  
  // Get products from localStorage
  userProducts = getUserProducts(currentUser.uid);
  
  // Update UI based on products
  updateProductsDisplay();
}

// Update the products display
function updateProductsDisplay() {
  // Clear the products grid
  productsGrid.innerHTML = '';
  
  // Update product count global variable to match the user's products
  window.productCount = userProducts.length;
  window.addedProducts = [...userProducts];
  
  if (userProducts.length === 0) {
    // Show empty state if no products
    emptyState.style.display = 'block';
    productsGrid.style.display = 'none';
    window.showingProducts = false;
  } else {
    // Create product cards for each product
    userProducts.forEach(product => {
      createProductCard(product);
    });
    
    // Show products grid and hide empty state
    emptyState.style.display = 'none';
    productsGrid.style.display = 'grid';
    window.showingProducts = true;
  }
  
  // Update Add Product button state
  if (userProducts.length >= MAX_PRODUCTS) {
    headerAddButton.style.opacity = '0.5';
    headerAddButton.style.cursor = 'not-allowed';
    headerAddButton.title = 'Maximum number of products reached (12)';
  } else {
    headerAddButton.style.opacity = '1';
    headerAddButton.style.cursor = 'pointer';
    headerAddButton.title = 'Add a new product';
  }
}

// Create a product card
function createProductCard(product) {
  // Create card element
  const productCard = document.createElement('div');
  productCard.className = 'product-card';
  productCard.id = product.id;
  
  // Determine product stats
  const temp = product.temperature || (Math.random() * 5 + 20).toFixed(1);
  const humidity = product.humidity || Math.floor(Math.random() * 20 + 60);
  const pH = product.pH || (Math.random() * 1 + 5.5).toFixed(1);
  const plants = product.plants || (product.type === 'tower-module' ? '36' : '72');
  
  // Set HTML content
  productCard.innerHTML = `
    <div class="product-card__image">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="product-card__content">
      <h3 class="product-card__title">${product.name}</h3>
      <div class="product-card__stats">
        <div class="product-card__stat">
          <div class="product-card__stat-value">${temp}°C</div>
          <div class="product-card__stat-label">Temperature</div>
        </div>
        <div class="product-card__stat">
          <div class="product-card__stat-value">${humidity}%</div>
          <div class="product-card__stat-label">Humidity</div>
        </div>
        <div class="product-card__stat">
          <div class="product-card__stat-value">${pH}</div>
          <div class="product-card__stat-label">pH Level</div>
        </div>
        <div class="product-card__stat">
          <div class="product-card__stat-value">${plants}</div>
          <div class="product-card__stat-label">Plants</div>
        </div>
      </div>
      <div class="product-card__actions">
        <a href="#" class="product-card__button product-card__button--primary">View Details</a>
        <a href="#" class="product-card__button product-card__button--secondary">Settings</a>
      </div>
    </div>
  `;
  
  // Add the card to the products grid
  productsGrid.appendChild(productCard);
}

// Setup Event Listeners
function setupEventListeners() {
  // Add Product buttons
  const addButtons = document.querySelectorAll('#add-product-button, #add-product-button-empty');
  
  addButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Don't allow adding more than MAX_PRODUCTS
      if (userProducts.length >= MAX_PRODUCTS) {
        return;
      }
      
      // Always hide the empty state when showing product selection
      emptyState.style.display = 'none';
      
      // Show product selection
      productSelection.style.display = 'block';
    });
  });
  
  // Add event delegation for View Details button
  document.addEventListener('click', (event) => {
    const viewDetailsButton = event.target.closest('.product-card__button--primary');
    if (viewDetailsButton) {
      event.preventDefault();
      
      // Get the product card
      const productCard = viewDetailsButton.closest('.product-card');
      if (!productCard) return;
      
      // Get product name from the card
      const productTitle = productCard.querySelector('.product-card__title');
      
      // Check if it's the special test prototype
      if (productTitle && productTitle.textContent === "testPrototype") {
        // Navigate to the product details page with ID parameter
        window.location.href = `product-details.html?id=${productCard.id}`;
      } else {
        // For regular products, show a message that this feature is not available
        alert('Detailed view is only available for prototype devices.');
      }
    }
  });
  
  // Listen for successful product verification and save the product to localStorage
  window.addEventListener('productAdded', (event) => {
    if (currentUser && event.detail) {
      const newProduct = event.detail;
      
      // Add the product to the user's products
      saveUserProduct(currentUser.uid, newProduct);
      
      // Reload user's products to update the UI
      loadUserProducts();
    }
  });
  
  // Listen for product deletion
  window.addEventListener('productDeleted', (event) => {
    if (currentUser && event.detail) {
      const productId = event.detail.id;
      
      // Remove the product from localStorage
      deleteUserProduct(currentUser.uid, productId);
      
      // Reload user's products to update the UI
      loadUserProducts();
    }
  });
  
  // Listen for product update (e.g., adding extension)
  window.addEventListener('productUpdated', (event) => {
    if (currentUser && event.detail) {
      const updatedProduct = event.detail;
      
      // Save the updated product data
      saveUserProduct(currentUser.uid, updatedProduct);
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

// Export function to trigger product update from other modules
export function updateProduct(productId, updatedData) {
  if (!currentUser) return;
  
  // Find the product in the user's products array
  const productIndex = userProducts.findIndex(p => p.id === productId);
  
  if (productIndex >= 0) {
    // Update the product data
    const updatedProduct = {
      ...userProducts[productIndex],
      ...updatedData
    };
    
    // Save to localStorage
    saveUserProduct(currentUser.uid, updatedProduct);
    
    // Reload user's products
    loadUserProducts();
    
    return true;
  }
  
  return false;
} 