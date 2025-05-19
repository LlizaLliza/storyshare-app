// CSS imports
import 'regenerator-runtime';
import '../styles/styles.css';
import App from './pages/app';

const app = new App({
  navigationDrawer: document.getElementById('navigationDrawer'),
  drawerButton: document.getElementById('hamburgerButton'),
  content: document.getElementById('mainContent'),
});

const authNavItem = document.getElementById('authNavItem');
const authDrawerItem = document.getElementById('authDrawerItem');

const updateAuthUI = () => {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('name');
  
  if (token) {
    authNavItem.innerHTML = `
      <div class="user-info">
        <span>Hi, ${userName}</span>
        <button id="logoutButton" class="logout-button">Logout</button>
      </div>
    `;
    
    authDrawerItem.innerHTML = `
      <div class="user-info">
        <span>Hi, ${userName}</span>
        <button id="logoutDrawerButton" class="logout-button">Logout</button>
      </div>
    `;
    
    document.getElementById('logoutButton')?.addEventListener('click', () => {
      localStorage.clear();
      window.location.hash = '#/login';
      updateAuthUI();
    });
    
    document.getElementById('logoutDrawerButton')?.addEventListener('click', () => {
      localStorage.clear();
      window.location.hash = '#/login';
      updateAuthUI();
    });
  } else {
    authNavItem.innerHTML = '<a href="#/login">Login</a>';
    authDrawerItem.innerHTML = '<a href="#/login">Login</a>';
  }
};

window.addEventListener('hashchange', () => {
  updateAuthUI();
  app.renderPage();
});

window.addEventListener('load', () => {
  updateAuthUI();
  app.renderPage();
});