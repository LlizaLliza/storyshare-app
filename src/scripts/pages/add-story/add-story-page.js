import Api from '../../data/api';
import CONFIG from '../../config';

export default class AddStoryPage {
  async render() {
    return `
      <section class="container add-story">
        <h1 class="add-story__title">Tambah Cerita Baru</h1>
        <form id="addStoryForm" class="add-story__form">
          <div class="form-group">
            <label for="description">Cerita</label>
            <textarea id="description" name="description" required></textarea>
          </div>
          
          <div class="form-group">
            <label>Foto</label>
            <button type="button" id="cameraButton" class="add-story__camera-button">
              <span class="material-icons">camera_alt</span>
              Ambil Foto dengan Kamera
            </button>
            <div id="cameraContainer" class="add-story__camera-container hidden">
              <video id="cameraPreview" class="add-story__camera-preview" autoplay playsinline></video>
              <button type="button" id="captureButton" class="add-story__capture-button">
                <span class="material-icons">photo_camera</span>
              </button>
            </div>
            <img id="photoPreview" class="add-story__photo-preview hidden" alt="Preview foto">
            <canvas id="photoCanvas" class="hidden"></canvas>
            <input type="hidden" id="photoInput" name="photo" required>
          </div>
          
          <div class="form-group">
            <label for="locationMap">Lokasi (Klik pada peta)</label>
            <div id="locationMap" class="add-story__map"></div>
            <p id="locationText" class="add-story__location-text">Lokasi belum dipilih</p>
            <input type="hidden" id="latInput" name="lat" required>
            <input type="hidden" id="lonInput" name="lon" required>
          </div>
          
          <div class="form-group">
            <button type="submit" class="add-story__submit-button">Tambah Cerita</button>
          </div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = '#/login';
      return;
    }
    
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
    
    const map = L.map('locationMap').setView([CONFIG.DEFAULT_LATITUDE, CONFIG.DEFAULT_LONGITUDE], CONFIG.DEFAULT_MAP_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    const locationText = document.getElementById('locationText');
    const latInput = document.getElementById('latInput');
    const lonInput = document.getElementById('lonInput');
    
    let marker;
    
    map.on('click', (event) => {
      const { lat, lng } = event.latlng;
      
      if (marker) {
        map.removeLayer(marker);
      }
      
      marker = L.marker([lat, lng]).addTo(map);
      
      locationText.textContent = `Lokasi: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      latInput.value = lat;
      lonInput.value = lng;
    });
    
    const cameraButton = document.getElementById('cameraButton');
    const cameraContainer = document.getElementById('cameraContainer');
    const cameraPreview = document.getElementById('cameraPreview');
    const captureButton = document.getElementById('captureButton');
    const photoPreview = document.getElementById('photoPreview');
    const photoCanvas = document.getElementById('photoCanvas');
    const photoInput = document.getElementById('photoInput');
    
    let stream;
    
    cameraButton.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment'
          }
        });
        
        cameraPreview.srcObject = stream;
        cameraContainer.classList.remove('hidden');
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Gagal mengakses kamera. Pastikan Anda memberikan izin dan perangkat memiliki kamera.');
      }
    });
    
    captureButton.addEventListener('click', () => {
      if (!stream) return;
      
      const { videoWidth, videoHeight } = cameraPreview;
      
      photoCanvas.width = videoWidth;
      photoCanvas.height = videoHeight;
      
      const context = photoCanvas.getContext('2d');
      context.drawImage(cameraPreview, 0, 0, videoWidth, videoHeight);
      
      const photoDataUrl = photoCanvas.toDataURL('image/jpeg');
      
      photoPreview.src = photoDataUrl;
      photoPreview.classList.remove('hidden');
      photoInput.value = photoDataUrl;
      
      stream.getTracks().forEach(track => track.stop());
      stream = null;
      
      cameraContainer.classList.add('hidden');
    });
    
    const addStoryForm = document.getElementById('addStoryForm');
    
    addStoryForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const description = document.getElementById('description').value;
      
      if (!photoInput.value) {
        alert('Silakan ambil foto dengan kamera');
        return;
      }
      
      if (!latInput.value || !lonInput.value) {
        alert('Silakan pilih lokasi pada peta');
        return;
      }
      
      try {
        const base64Data = photoInput.value.split(',')[1];
        const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
        
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', blob, 'photo.jpg');
        formData.append('lat', latInput.value);
        formData.append('lon', lonInput.value);
        
        const response = await Api.addNewStory(formData);
        
        if (response.error) {
          alert(response.message);
          return;
        }
        
        alert('Cerita berhasil ditambahkan!');
        window.location.hash = '#/';
      } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan saat menambahkan cerita');
      }
    });
    
    function stopCamera() {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        console.log('Kamera dimatikan karena user pindah halaman.');
      }
    }

    window.addEventListener('hashchange', () => {
      stopCamera();
    });
  }
}