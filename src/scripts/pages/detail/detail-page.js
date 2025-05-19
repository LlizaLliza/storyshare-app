import Api from '../../data/api';
import { parseActivePathname } from '../../routes/url-parser';
import CONFIG from '../../config';

export default class DetailPage {
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
    const storyContent = document.getElementById('story-content');
    const storyMap = document.getElementById('story-map');
    
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = '#/login';
      return;
    }
    
    const { id } = parseActivePathname();
    
    if (!id) {
      storyContent.innerHTML = '<p>ID cerita tidak valid</p>';
      return;
    }
    
    try {
      const response = await Api.getStoryDetail(id);
      
      if (response.error) {
        storyContent.innerHTML = `<p>${response.message}</p>`;
        return;
      }
      
      const story = response.story;
      
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
      
      if (story.lat && story.lon) {
        if (!window.L) {
          const leafletCSS = document.createElement('link');
          leafletCSS.rel = 'stylesheet';
          leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(leafletCSS);
          
          const leafletJS = document.createElement('script');
          leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          document.head.appendChild(leafletJS);
          
          await new Promise(resolve => {
            leafletJS.onload = resolve;
          });
        }
        
        const map = L.map('story-map').setView([story.lat, story.lon], CONFIG.DEFAULT_MAP_ZOOM);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        
        marker.bindPopup(`<b>${story.name}</b><br>${story.description.substring(0, 50)}${story.description.length > 50 ? '...' : ''}`).openPopup();
      } else {
        storyMap.innerHTML = '<p>Lokasi tidak tersedia</p>';
      }
    } catch (error) {
      console.error(error);
      storyContent.innerHTML = '<p>Gagal memuat detail cerita</p>';
    }
  }
}