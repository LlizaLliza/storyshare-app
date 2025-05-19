import Api from '../../data/api';
import { parseActivePathname } from '../../routes/url-parser';

export default class HomePage {
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
    const storiesContainer = document.getElementById('stories-list');
    
    // cek login
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = '#/login';
      return;
    }
    
    try {
      // get data stori
      const response = await Api.getAllStories();
      
      if (response.error) {
        storiesContainer.innerHTML = `<p>${response.message}</p>`;
        return;
      }

      const stories = response.listStory;
      
      if (stories.length === 0) {
        storiesContainer.innerHTML = '<p>Belum ada cerita yang dibagikan</p>';
        return;
      }
      
      storiesContainer.innerHTML = '';
      stories.forEach((story) => {
        storiesContainer.innerHTML += `
          <article class="story-item">
            <div class="story-item__thumbnail">
              <img src="${story.photoUrl}" alt="${story.name}'s story" class="story-item__image">
            </div>
            <div class="story-item__content">
              <h2 class="story-item__title">${story.name}</h2>
              <p class="story-item__date">${new Date(story.createdAt).toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</p>
              <p class="story-item__description">${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
              <a href="#/detail/${story.id}" class="story-item__button">Baca Selengkapnya</a>
            </div>
          </article>
        `;
      });
    } catch (error) {
      console.error(error);
      storiesContainer.innerHTML = '<p>Gagal memuat cerita</p>';
    }
  }
}