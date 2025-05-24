export default class LoginPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async login({ email, password }) {
    try {
      const response = await this.#model.login({ email, password });

      if (response.error) {
        this.#view.showError(response.message);
        return;
      }

      this.#view.navigateToHome();
    } catch (error) {
      this.#view.logError(error);
      this.#view.showError('Terjadi kesalahan saat login');
    }
  }
}