// Shared auth state management
let currentUser = null;

async function checkAuth() {
  try {
    const { user } = await API.me();
    currentUser = user;
    updateNavAuth();
    return user;
  } catch {
    currentUser = null;
    updateNavAuth();
    return null;
  }
}

function updateNavAuth() {
  const authLinks = document.getElementById('auth-links');
  if (!authLinks) return;

  if (currentUser) {
    authLinks.innerHTML = `
      <li><a href="/sell">Sell</a></li>
      <li><a href="/account">${currentUser.display_name}</a></li>
      <li><a href="#" onclick="handleLogout(event)">Logout</a></li>
    `;
  } else {
    authLinks.innerHTML = `
      <li><a href="/login">Log In</a></li>
      <li><a href="/signup" class="btn btn-gold btn-sm">Sign Up</a></li>
    `;
  }
}

async function handleLogout(e) {
  e.preventDefault();
  await API.logout();
  currentUser = null;
  window.location.href = '/';
}

function requireLogin() {
  if (!currentUser) {
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  return true;
}

// Init on every page
document.addEventListener('DOMContentLoaded', checkAuth);

// Hamburger menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.navbar-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }
});
