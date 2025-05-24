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
      this.#view.navigateToLogin();
    } catch (error) {
      this.#view.logError(error);
      this.#view.showError('Terjadi kesalahan saat registrasi');
    }
  }
}