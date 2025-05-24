import Api from '../../data/api';
import RegisterPresenter from './register-presenter.js';

export default class RegisterPage {
  #presenter;

  constructor() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: Api,
    });
  }

  async render() {
    return `
      <section class="container auth">
        <h1 class="auth__title">Register</h1>
        <div class="auth__form">
          <form id="registerForm">
            <div class="form-group">
              <label for="name">Nama</label>
              <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password (minimal 8 karakter)</label>
              <input type="password" id="password" name="password" minlength="8" required>
            </div>
            <div class="form-group">
              <button type="submit" class="auth__button">Register</button>
            </div>
          </form>
          <p class="auth__redirect">
            Sudah punya akun? <a href="#/login">Login</a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.setupFormEvents();
  }

  navigateToLogin() {
    window.location.hash = '#/login';
  }

  logError(error) {
    console.error(error);
  }

  showAlert(message) {
    alert(message);
  }

  getFormData() {
    return {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    };
  }

  setupFormEvents() {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = this.getFormData();
      await this.#presenter.handleRegister(formData);
    });
  }

  showError(message) {
    this.showAlert(message);
  }

  showSuccess(message) {
    this.showAlert(message);
  }
}