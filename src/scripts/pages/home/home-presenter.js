export default class HomePresenter {
    #model;
    #view;
  
    constructor({ model, view }) {
      this.#model = model;
      this.#view = view;
    }
  
    async loadStories() {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.hash = '#/login';
        return;
      }
  
      try {
        const response = await this.#model.getAllStories();
  
        if (response.error) {
          this.#view.showError(response.message);
          return;
        }
  
        this.#view.showStories(response.listStory);
      } catch (error) {
        console.error(error);
        this.#view.showError('Gagal memuat cerita');
      }
    }
  }
  