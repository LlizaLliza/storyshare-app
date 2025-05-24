import HomePresenter from './home-presenter.js';
import Api from '../../data/api';

export default class HomePage {
  #presenter;

  async render() {
    return `
      <section class="container stories">
        <div class="stories__header">
          <h1 class="stories__title">Cerita Terbaru</h1>
          <a href="#/add" class="stories__add-button">
            <span class="material-icons">add</span>
            Tambah Cerita
          </a>
        </div>
        <div id="stories-list" class="stories__list">
          <div class="loader"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      model: Api,
      view: this,
    });

    await this.#presenter.loadStories();
  }

  redirectToLogin() {
    window.location.hash = '#/login';
  }

  logError(error) {
    console.error(error);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  showStories(stories) {
    const container = document.getElementById('stories-list');
    container.innerHTML = '';

    if (stories.length === 0) {
      container.innerHTML = '<p>Belum ada cerita yang dibagikan</p>';
      return;
    }

    stories.forEach((story) => {
      const formattedDate = this.formatDate(story.createdAt);
      const truncatedDescription = this.truncateText(story.description, 100);
      
      container.innerHTML += `
        <article class="story-item">
          <div class="story-item__thumbnail">
            <img src="${story.photoUrl}" alt="${story.name}'s story" class="story-item__image">
          </div>
          <div class="story-item__content">
            <h2 class="story-item__title">${story.name}</h2>
            <p class="story-item__date">${formattedDate}</p>
            <p class="story-item__description">${truncatedDescription}</p>
            <a href="#/detail/${story.id}" class="story-item__button">Baca Selengkapnya</a>
          </div>
        </article>
      `;
    });
  }

  showError(message) {
    const container = document.getElementById('stories-list');
    container.innerHTML = `<p>${message}</p>`;
  }
}