export default class AddStoryPresenter {
    constructor(Api, CONFIG) {
      this.Api = Api;
      this.CONFIG = CONFIG;
      this.stream = null;
    }
  
    async init() {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.hash = '#/login';
        return;
      }
  
      await this.loadLeaflet();
  
      this.setupMap();
      this.setupCamera();
      this.setupForm();
      this.setupStopCameraOnHashChange();
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
  
    setupMap() {
      const { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_MAP_ZOOM } = this.CONFIG;
      this.map = L.map('locationMap').setView([DEFAULT_LATITUDE, DEFAULT_LONGITUDE], DEFAULT_MAP_ZOOM);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  
      this.locationText = document.getElementById('locationText');
      this.latInput = document.getElementById('latInput');
      this.lonInput = document.getElementById('lonInput');
  
      this.marker = null;
  
      this.map.on('click', (event) => {
        const { lat, lng } = event.latlng;
  
        if (this.marker) {
          this.map.removeLayer(this.marker);
        }
  
        this.marker = L.marker([lat, lng]).addTo(this.map);
  
        this.locationText.textContent = `Lokasi: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        this.latInput.value = lat;
        this.lonInput.value = lng;
      });
    }
  
    setupCamera() {
      this.cameraButton = document.getElementById('cameraButton');
      this.cameraContainer = document.getElementById('cameraContainer');
      this.cameraPreview = document.getElementById('cameraPreview');
      this.captureButton = document.getElementById('captureButton');
      this.photoPreview = document.getElementById('photoPreview');
      this.photoCanvas = document.getElementById('photoCanvas');
      this.photoInput = document.getElementById('photoInput');
  
      this.cameraButton.addEventListener('click', async () => {
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
            },
          });
  
          this.cameraPreview.srcObject = this.stream;
          this.cameraContainer.classList.remove('hidden');
        } catch (error) {
          console.error('Error accessing camera:', error);
          alert('Gagal mengakses kamera. Pastikan Anda memberikan izin dan perangkat memiliki kamera.');
        }
      });
  
      this.captureButton.addEventListener('click', () => {
        if (!this.stream) return;
  
        const { videoWidth, videoHeight } = this.cameraPreview;
  
        this.photoCanvas.width = videoWidth;
        this.photoCanvas.height = videoHeight;
  
        const context = this.photoCanvas.getContext('2d');
        context.drawImage(this.cameraPreview, 0, 0, videoWidth, videoHeight);
  
        const photoDataUrl = this.photoCanvas.toDataURL('image/jpeg');
  
        this.photoPreview.src = photoDataUrl;
        this.photoPreview.classList.remove('hidden');
        this.photoInput.value = photoDataUrl;
  
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
  
        this.cameraContainer.classList.add('hidden');
      });
    }
  
    setupForm() {
      const addStoryForm = document.getElementById('addStoryForm');
  
      addStoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
  
        const description = document.getElementById('description').value;
  
        if (!this.photoInput.value) {
          alert('Silakan ambil foto dengan kamera');
          return;
        }
  
        if (!this.latInput.value || !this.lonInput.value) {
          alert('Silakan pilih lokasi pada peta');
          return;
        }
  
        try {
          const base64Data = this.photoInput.value.split(',')[1];
          const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then((res) => res.blob());
  
          const formData = new FormData();
          formData.append('description', description);
          formData.append('photo', blob, 'photo.jpg');
          formData.append('lat', this.latInput.value);
          formData.append('lon', this.lonInput.value);
  
          const response = await this.Api.addNewStory(formData);
  
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
    }
  
    setupStopCameraOnHashChange() {
      window.addEventListener('hashchange', () => {
        this.stopCamera();
      });
    }
  
    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
        console.log('Kamera dimatikan karena user pindah halaman.');
      }
    }
  }
  