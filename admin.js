// M.R GAME ZONE Admin Panel
// Firebase Authentication + basic admin navigation.
// Product and order database actions will be added in a later step.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSZDoy8qcAgGR_qk4vZ5rWGlvID4t8B7Q",
  authDomain: "mr-game-shop-9f914.firebaseapp.com",
  databaseURL: "https://mr-game-shop-9f914-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mr-game-shop-9f914",
  storageBucket: "mr-game-shop-9f914.firebasestorage.app",
  messagingSenderId: "709309210572",
  appId: "1:709309210572:web:02e664a71cee8165874769",
  measurementId: "G-E6EWP7Y2R0"
};

// Only this Firebase Authentication account is allowed into the admin interface.
const ADMIN_UID = "MYGho0eVmHMWPV9n9GFSmO3XvC62";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginPage = document.getElementById("loginPage");
const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const adminApp = document.getElementById("app");
const adminEmail = document.getElementById("adminEmail");
const logoutBtn = document.getElementById("logoutBtn");
const globalMsg = document.getElementById("globalMsg");

function showLogin(message = "") {
  loginPage?.classList.remove("hidden");
  adminApp?.classList.add("hidden");
  if (loginMsg) loginMsg.textContent = message;
}

function showAdmin(user) {
  loginPage?.classList.add("hidden");
  adminApp?.classList.remove("hidden");
  if (adminEmail) adminEmail.textContent = user.email || "Admin";
  showPage("dashboard");
}

function showPage(pageName) {
  const pages = ["dashboard", "products", "orders"];
  pages.forEach((name) => {
    document.getElementById(name + "Page")?.classList.toggle("hidden", name !== pageName);
  });

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });

  const titles = {
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders"
  };
  const title = document.getElementById("pageTitle");
  if (title) title.textContent = titles[pageName] || "Dashboard";
}

function friendlyAuthError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/invalid-email": "ইমেইল ঠিকানাটি সঠিক নয়।",
    "auth/user-disabled": "এই অ্যাকাউন্টটি বন্ধ করা হয়েছে।",
    "auth/user-not-found": "এই ইমেইলে কোনো Firebase ব্যবহারকারী পাওয়া যায়নি।",
    "auth/wrong-password": "পাসওয়ার্ড সঠিক নয়।",
    "auth/invalid-credential": "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
    "auth/too-many-requests": "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
    "auth/network-request-failed": "ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
    "auth/operation-not-allowed": "Firebase-এ Email/Password sign-in চালু নেই।",
    "auth/unauthorized-domain": "Firebase Authentication-এর Authorized domains-এ GitHub Pages domain যোগ করতে হবে।"
  };
  return messages[code] || ("Login ব্যর্থ হয়েছে: " + (error?.message || "অজানা সমস্যা"));
}

// Keep the signed-in session on this browser.
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (loginMsg) loginMsg.textContent = "Login হচ্ছে...";
  const email = emailInput?.value.trim() || "";
  const password = passwordInput?.value || "";

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (credential.user.uid !== ADMIN_UID) {
      await signOut(auth);
      showLogin("এই অ্যাকাউন্টের Admin অনুমতি নেই।");
      return;
    }
    if (passwordInput) passwordInput.value = "";
    showAdmin(credential.user);
  } catch (error) {
    console.error("Admin login error:", error);
    showLogin(friendlyAuthError(error));
  }
});

logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showLogin("আপনি সফলভাবে Logout করেছেন।");
  } catch (error) {
    console.error("Logout error:", error);
    if (globalMsg) globalMsg.textContent = "Logout করা যায়নি। আবার চেষ্টা করুন।";
  }
});

// Sidebar navigation
document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll("[data-goto]").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.goto));
});

// Product form panel visibility only; database save/edit/delete is a separate next step.
const productFormPanel = document.getElementById("productFormPanel");
document.getElementById("newProductBtn")?.addEventListener("click", () => {
  document.getElementById("productForm")?.reset();
  const productId = document.getElementById("productId");
  if (productId) productId.value = "";
  const formTitle = document.getElementById("formTitle");
  if (formTitle) formTitle.textContent = "Add product";
  productFormPanel?.classList.remove("hidden");
});
function closeProductForm() {
  productFormPanel?.classList.add("hidden");
}
document.getElementById("cancelProductBtn")?.addEventListener("click", closeProductForm);
document.getElementById("cancelProductBtn2")?.addEventListener("click", closeProductForm);

// Restore the session and verify that the signed-in account is the configured admin.
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    showLogin();
    return;
  }

  if (user.uid !== ADMIN_UID) {
    await signOut(auth);
    showLogin("এই অ্যাকাউন্টের Admin অনুমতি নেই।");
    return;
  }

  showAdmin(user);
});
