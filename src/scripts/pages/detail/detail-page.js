import Api from '../../data/api';
import { parseActivePathname } from '../../routes/url-parser';
import CONFIG from '../../config';
import DetailPresenter from './detail-presenter';

export default class DetailPage {
  constructor() {
    this.presenter = new DetailPresenter(this);
  }

  async render() {
    return `
      <section class="container story-detail">
        <div id="story-content" class="story-detail__content">
          <div class="loader"></div>
        </div>
        <div id="story-map" class="story-detail__map"></div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    const { id } = parseActivePathname();

    if (!token) {
      window.location.hash = '#/login';
      return;
    }

    if (!id) {
      this.showError('ID cerita tidak valid');
      return;
    }

    try {
      const response = await Api.getStoryDetail(id);
      await this.presenter.loadDetail({ token, id, apiResponse: response });
    } catch (error) {
      console.error(error);
      this.showError('Gagal memuat detail cerita');
    }
  }

  showStoryDetail(story) {
    const storyContent = document.getElementById('story-content');
    storyContent.innerHTML = `
      <h1 class="story-detail__title">${story.name}</h1>
      <p class="story-detail__date">${new Date(story.createdAt).toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })}</p>
      <div class="story-detail__image-container">
        <img src="${story.photoUrl}" alt="${story.name}'s story" class="story-detail__image">
      </div>
      <p class="story-detail__description">${story.description}</p>
    `;
  }

  showMap(lat, lon, name, description) {
    const storyMap = document.getElementById('story-map');

    if (!window.L) {
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(leafletCSS);

      const leafletJS = document.createElement('script');
      leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.head.appendChild(leafletJS);

      leafletJS.onload = () => this._initMap(lat, lon, name, description);
    } else {
      this._initMap(lat, lon, name, description);
    }
  }

  _initMap(lat, lon, name, description) {
    const map = L.map('story-map').setView([lat, lon], CONFIG.DEFAULT_MAP_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const marker = L.marker([lat, lon]).addTo(map);

    marker.bindPopup(`<b>${name}</b><br>${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`).openPopup();
  }

  showError(message) {
    document.getElementById('story-content').innerHTML = `<p>${message}</p>`;
  }

  showNoLocation() {
    document.getElementById('story-map').innerHTML = '<p>Lokasi tidak tersedia</p>';
  }
}
