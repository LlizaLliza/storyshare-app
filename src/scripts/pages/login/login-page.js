import Api from '../../data/api';
import LoginPresenter from './login-presenter.js';

export default class LoginPage {
  #presenter;

  async render() {
    return `
      <section class="container auth">
        <h1 class="auth__title">Login</h1>
        <div class="auth__form">
          <form id="loginForm">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
              <button type="submit" class="auth__button">Login</button>
            </div>
          </form>
          <p class="auth__redirect">
            Belum punya akun? <a href="#/register">Register</a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      model: Api,
      view: this,
    });

    this.setupFormEvents();
  }

  navigateToHome() {
    window.location.hash = '#/';
  }

  logError(error) {
    console.error(error);
  }

  showAlert(message) {
    alert(message);
  }

  getFormData() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    return { email, password };
  }

  setupFormEvents() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      const formData = this.getFormData();
      this.#presenter.login(formData);
    });
  }

  showError(message) {
    this.showAlert(message);
  }
}