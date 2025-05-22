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
  
        const { userId, name, token } = response.loginResult;
        localStorage.setItem('userId', userId);
        localStorage.setItem('name', name);
        localStorage.setItem('token', token);
  
        this.#view.navigateToHome();
      } catch (error) {
        console.error(error);
        this.#view.showError('Terjadi kesalahan saat login');
      }
    }
  }
  