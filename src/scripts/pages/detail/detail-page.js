import Api from '../../data/api';
import { parseActivePathname } from '../../routes/url-parser';
import CONFIG from '../../config';
import DetailPresenter from './detail-presenter';

export default class DetailPage {
  constructor() {
    this.presenter = new DetailPresenter({
      model: Api,
      view: this
    });
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
    const { id } = this.parsePathname();

    if (!id) {
      this.showError('ID cerita tidak valid');
      return;
    }

    await this.presenter.loadDetail(id);
  }

  redirectToLogin() {
    window.location.hash = '#/login';
  }

  parsePathname() {
    return parseActivePathname();
  }

  logError(error) {
    console.error(error);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  loadLeafletLibrary(callback) {
    if (window.L) {
      callback();
      return;
    }

    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    const leafletJS = document.createElement('script');
    leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(leafletJS);

    leafletJS.onload = callback;
  }

  createMap(elementId, lat, lon, zoom) {
    return L.map(elementId).setView([lat, lon], zoom);
  }

  addTileLayer(map) {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  }

  addMarkerWithPopup(map, lat, lon, popupContent) {
    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(popupContent).openPopup();
    return marker;
  }

  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  showStoryDetail(story) {
    const storyContent = document.getElementById('story-content');
    const formattedDate = this.formatDate(story.createdAt);
    
    storyContent.innerHTML = `
      <h1 class="story-detail__title">${story.name}</h1>
      <p class="story-detail__date">${formattedDate}</p>
      <div class="story-detail__image-container">
        <img src="${story.photoUrl}" alt="${story.name}'s story" class="story-detail__image">
      </div>
      <p class="story-detail__description">${story.description}</p>
    `;
  }

  showMap(lat, lon, name, description) {
    this.loadLeafletLibrary(() => {
      this._initMap(lat, lon, name, description);
    });
  }

  _initMap(lat, lon, name, description) {
    const map = this.createMap('story-map', lat, lon, CONFIG.DEFAULT_MAP_ZOOM);
    this.addTileLayer(map);
    
    const truncatedDescription = this.truncateText(description, 50);
    const popupContent = `<b>${name}</b><br>${truncatedDescription}`;
    
    this.addMarkerWithPopup(map, lat, lon, popupContent);
  }

  showError(message) {
    document.getElementById('story-content').innerHTML = `<p>${message}</p>`;
  }

  showNoLocation() {
    document.getElementById('story-map').innerHTML = '<p>Lokasi tidak tersedia</p>';
  }
}