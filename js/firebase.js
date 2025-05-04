// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDb9YOroocw_2O-NO34EFw8ojcu3sUcS4",
  authDomain: "waraf-1c450.firebaseapp.com",
  databaseURL: "https://waraf-1c450-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "waraf-1c450",
  storageBucket: "waraf-1c450.firebasestorage.app",
  messagingSenderId: "464312561630",
  appId: "1:464312561630:web:1e42b976469cc43c65f74f",
  measurementId: "G-FS9EMEYZZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Local storage keys
const USER_PRODUCTS_KEY_PREFIX = 'waraf_user_products_';

// Authentication functions
export async function loginWithEmailPassword(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    let errorMessage = "An error occurred during login.";
    
    // Provide more specific error messages for common authentication issues
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = "Invalid email or password.";
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = "Too many unsuccessful login attempts. Please try again later.";
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = "This account has been disabled.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Please enter a valid email address.";
    }
    
    return { success: false, error: errorMessage };
  }
}

export async function createAccount(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Registration error:", error.code, error.message);
    let errorMessage = "An error occurred during registration.";
    
    // Provide more specific error messages for common registration issues
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already registered.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Please enter a valid email address.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password is too weak. Please use at least 6 characters.";
    }
    
    return { success: false, error: errorMessage };
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Google login error:", error.code, error.message);
    let errorMessage = "An error occurred during Google login.";
    
    // Provide more specific error messages for common Google sign-in issues
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "Login popup was closed before completion.";
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = "Login popup was blocked by your browser.";
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = "The login request was cancelled.";
    }
    
    return { success: false, error: errorMessage };
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error.code, error.message);
    return { success: false, error: "An error occurred during logout." };
  }
}

// Product storage functions (using localStorage)

// Get user-specific storage key
function getUserProductsKey(userId) {
  return `${USER_PRODUCTS_KEY_PREFIX}${userId}`;
}

// Get all products for a specific user
export function getUserProducts(userId) {
  if (!userId) return [];
  
  const storageKey = getUserProductsKey(userId);
  const storedProducts = localStorage.getItem(storageKey);
  
  return storedProducts ? JSON.parse(storedProducts) : [];
}

// Save a product for a specific user
export function saveUserProduct(userId, productData) {
  if (!userId) return false;
  
  try {
    const storageKey = getUserProductsKey(userId);
    const userProducts = getUserProducts(userId);
    
    // Generate a unique product ID if not provided
    if (!productData.id) {
      productData.id = Date.now().toString();
    }
    
    // Check if product already exists (to update)
    const existingProductIndex = userProducts.findIndex(product => product.id === productData.id);
    
    if (existingProductIndex >= 0) {
      // Update existing product
      userProducts[existingProductIndex] = productData;
    } else {
      // Add new product
      userProducts.push(productData);
    }
    
    // Save the updated products array
    localStorage.setItem(storageKey, JSON.stringify(userProducts));
    return true;
  } catch (error) {
    console.error("Error saving product:", error);
    return false;
  }
}

// Delete a product for a specific user
export function deleteUserProduct(userId, productId) {
  if (!userId || !productId) return false;
  
  try {
    const storageKey = getUserProductsKey(userId);
    let userProducts = getUserProducts(userId);
    
    // Filter out the product to delete
    userProducts = userProducts.filter(product => product.id !== productId);
    
    // Save the updated products array
    localStorage.setItem(storageKey, JSON.stringify(userProducts));
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}

// Clear all products for a specific user
export function clearUserProducts(userId) {
  if (!userId) return false;
  
  try {
    const storageKey = getUserProductsKey(userId);
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error("Error clearing products:", error);
    return false;
  }
} 