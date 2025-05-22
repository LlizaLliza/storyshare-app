export default class RegisterPresenter {
    #view;
    #model;
  
    constructor({ view, model }) {
      this.#view = view;
      this.#model = model;
    }
  
    async handleRegister(formData) {
      try {
        const response = await this.#model.register(formData);
  
        if (response.error) {
          this.#view.showError(response.message);
          return;
        }
  
        this.#view.showSuccess('Registrasi berhasil! Silakan login.');
        window.location.hash = '#/login';
      } catch (error) {
        console.error(error);
        this.#view.showError('Terjadi kesalahan saat registrasi');
      }
    }
  }
  