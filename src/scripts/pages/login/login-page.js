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

    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      this.#presenter.login({ email, password });
    });
  }

  showError(message) {
    alert(message);
  }

  navigateToHome() {
    window.location.hash = '#/';
  }
}
