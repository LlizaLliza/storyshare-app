import Api from '../../data/api';
import AddStoryPresenter from './add-story-presenter';
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
    const presenter = new AddStoryPresenter({
      model: Api,
      config: CONFIG,
      view: this
    });
    await presenter.init();
  }

  redirectToLogin() {
    window.location.hash = '#/login';
  }

  redirectToHome() {
    window.location.hash = '#/';
  }

  logError(message, error = null) {
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }

  logMessage(message) {
    console.log(message);
  }

  async loadLeaflet() {
    if (window.L) return;

    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    const leafletJS = document.createElement('script');
    leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(leafletJS);

    await new Promise((resolve) => {
      leafletJS.onload = resolve;
    });
  }

  setupStopCameraOnHashChange(stopCameraCallback) {
    window.addEventListener('hashchange', stopCameraCallback);
  }

  async getUserMedia(constraints) {
    return await navigator.mediaDevices.getUserMedia(constraints);
  }

  stopMediaStream(stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  async createBlobFromBase64(base64Data) {
    return await fetch(`data:image/jpeg;base64,${base64Data}`).then((res) => res.blob());
  }

  createFormData() {
    return new FormData();
  }

  appendToFormData(formData, key, value, filename = null) {
    if (filename) {
      formData.append(key, value, filename);
    } else {
      formData.append(key, value);
    }
  }

  showAlert(message) {
    alert(message);
  }

  createMap(elementId, lat, lng, zoom) {
    return L.map(elementId).setView([lat, lng], zoom);
  }

  addTileLayer(map) {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  }

  setupMapClickHandler(map, callback) {
    map.on('click', (event) => {
      const { lat, lng } = event.latlng;
      callback(lat, lng);
    });
  }

  addMarker(map, lat, lng) {
    return L.marker([lat, lng]).addTo(map);
  }

  removeMarker(map, marker) {
    map.removeLayer(marker);
  }

  updateLocationUI(lat, lng) {
    const locationText = document.getElementById('locationText');
    const latInput = document.getElementById('latInput');
    const lonInput = document.getElementById('lonInput');

    locationText.textContent = `Lokasi: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    latInput.value = lat;
    lonInput.value = lng;
  }

  setupCameraEvents(handlers) {
    const cameraButton = document.getElementById('cameraButton');
    const captureButton = document.getElementById('captureButton');

    cameraButton.addEventListener('click', handlers.onCameraClick);
    captureButton.addEventListener('click', handlers.onCaptureClick);
  }

  showCameraPreview(stream) {
    const cameraPreview = document.getElementById('cameraPreview');
    const cameraContainer = document.getElementById('cameraContainer');

    cameraPreview.srcObject = stream;
    cameraContainer.classList.remove('hidden');
  }

  capturePhoto() {
    const cameraPreview = document.getElementById('cameraPreview');
    const photoCanvas = document.getElementById('photoCanvas');
    const { videoWidth, videoHeight } = cameraPreview;

    photoCanvas.width = videoWidth;
    photoCanvas.height = videoHeight;

    const context = photoCanvas.getContext('2d');
    context.drawImage(cameraPreview, 0, 0, videoWidth, videoHeight);

    return photoCanvas.toDataURL('image/jpeg');
  }

  showCapturedPhoto(photoDataUrl) {
    const photoPreview = document.getElementById('photoPreview');
    const photoInput = document.getElementById('photoInput');
    const cameraContainer = document.getElementById('cameraContainer');

    photoPreview.src = photoDataUrl;
    photoPreview.classList.remove('hidden');
    photoInput.value = photoDataUrl;
    cameraContainer.classList.add('hidden');
  }

  setupFormEvents(handlers) {
    const addStoryForm = document.getElementById('addStoryForm');

    addStoryForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const description = document.getElementById('description').value;
      const photoInput = document.getElementById('photoInput');
      const latInput = document.getElementById('latInput');
      const lonInput = document.getElementById('lonInput');

      const formData = {
        description,
        photoDataUrl: photoInput.value,
        lat: latInput.value,
        lon: lonInput.value
      };

      await handlers.onSubmit(formData);
    });
  }
}