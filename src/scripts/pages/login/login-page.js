import Api from '../../data/api';

export default class LoginPage {
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
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await Api.login({ email, password });
        
        if (response.error) {
          alert(response.message);
          return;
        }
        
        const { userId, name, token } = response.loginResult;
        localStorage.setItem('userId', userId);
        localStorage.setItem('name', name);
        localStorage.setItem('token', token);
        
        window.location.hash = '#/';
      } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan saat login');
      }
    });
  }
}