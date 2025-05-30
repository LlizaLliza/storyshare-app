import Api from '../../data/api';
import { parseActivePathname } from '../../routes/url-parser';
import CONFIG from '../../config';
import DetailPresenter from './detail-presenter';
import Database from '../../database'; 

export default class DetailPage {
  constructor() {
    this.presenter = new DetailPresenter({
      model: Api,
      dbModel: Database,
      view: this
    });
  }

  async render() {
    return `
      <section class="container story-detail">
        <div id="story-content" class="story-detail__content">
          <div class="loader">Loading...</div>
        </div>
        <div id="story-map" class="story-detail__map"></div>
        <div id="story-actions" class="story-detail__actions">
          <button id="story-detail-save" class="save-button">
            <span class="material-icons">bookmark</span>
            Simpan Cerita
          </button>
        </div>
      </section>
    `;
  }

  async afterRender() {
  
    try {
      const { id } = this.parsePathname();
  
      if (!id) {
        console.error('DetailPage: No ID found in URL');
        this.showError('ID cerita tidak valid');
        return;
      }
  
      await this.presenter.loadDetail(id);
  
      const isSaved = await this.presenter.isStorySaved(id);
      this.updateSaveButton(isSaved);
  
      const saveButton = document.getElementById('story-detail-save');
      if (saveButton) {
        saveButton.addEventListener('click', async () => {
  
          if (saveButton.textContent === 'Simpan Cerita') {
            const success = await this.presenter.saveStory(id);
            if (success) {
              this.updateSaveButton(true);
              this.saveToBookmarkSuccessfully('Cerita berhasil disimpan.');
            } else {
              this.saveToBookmarkFailed('Gagal menyimpan cerita.');
            }
          } else {
            const success = await this.presenter.deleteStory(id);
            if (success) {
              this.updateSaveButton(false);
              this.saveToBookmarkSuccessfully('Cerita berhasil dihapus.');
            } else {
              this.saveToBookmarkFailed('Gagal menghapus cerita.');
            }
          }
        });
      } else {
        console.error('DetailPage: Save button not found in DOM');
      }
  
    } catch (error) {
      console.error('DetailPage: Error in afterRender:', error);
      this.showError('Terjadi kesalahan saat memuat detail cerita');
    }
  }
  
  updateSaveButton(isSaved) {
    const saveButton = document.getElementById('story-detail-save');
    if (saveButton) {
      saveButton.textContent = isSaved ? 'Hapus Cerita' : 'Simpan Cerita';
    }
  }  

  redirectToLogin() {
    window.location.hash = '#/login';
  }

  parsePathname() {
    const result = parseActivePathname();
    return result;
  }

  logError(error) {
    console.error('DetailPage: Error logged:', error);
  }

  showAlert(message) {
    alert(message);
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
    if (!storyContent) {
      console.error('DetailPage: story-content element not found');
      return;
    }

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
    try {
      const map = this.createMap('story-map', lat, lon, CONFIG.DEFAULT_MAP_ZOOM);
      this.addTileLayer(map);

      const truncatedDescription = this.truncateText(description, 50);
      const popupContent = `<b>${name}</b><br>${truncatedDescription}`;

      this.addMarkerWithPopup(map, lat, lon, popupContent);
    } catch (error) {
      //
    }
  }

  showError(message) {
    const storyContent = document.getElementById('story-content');
    if (storyContent) {
      storyContent.innerHTML = `<p class="error-message">${message}</p>`;
    }
  }

  showNoLocation() {
    const mapElement = document.getElementById('story-map');
    if (mapElement) {
      mapElement.innerHTML = '<p>Lokasi tidak tersedia</p>';
    }
  }

  saveToBookmarkSuccessfully(message) {
    alert(message); 
  }

  saveToBookmarkFailed(message) {
    alert('Gagal menyimpan: ' + message);
  }
}
