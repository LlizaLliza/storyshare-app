import Api from '../../data/api';

export default class RegisterPage {
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
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await Api.register({ name, email, password });
        
        if (response.error) {
          alert(response.message);
          return;
        }
        
        alert('Registrasi berhasil! Silakan login.');
        window.location.hash = '#/login';
      } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan saat registrasi');
      }
    });
  }
}