

export default class AddStoryPresenter {
  constructor({ model, config, view }) {
    this.model = model;
    this.config = config;
    this.view = view;
    this.stream = null;
  }

  async init() {
    await this.view.loadLeaflet();

    this.setupMap();
    this.setupCamera();
    this.setupForm();
    this.view.setupStopCameraOnHashChange(() => this.stopCamera());
  }

  setupMap() {
    const { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_MAP_ZOOM } = this.config;
    this.map = this.view.createMap('locationMap', DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_MAP_ZOOM);

    this.view.addTileLayer(this.map);

    this.marker = null;

    this.view.setupMapClickHandler(this.map, (lat, lng) => {
      if (this.marker) {
        this.view.removeMarker(this.map, this.marker);
      }

      this.marker = this.view.addMarker(this.map, lat, lng);
      this.view.updateLocationUI(lat, lng);
    });
  }

  setupCamera() {
    this.view.setupCameraEvents({
      onCameraClick: this.handleCameraClick.bind(this),
      onCaptureClick: this.handleCaptureClick.bind(this)
    });
  }

  async handleCameraClick() {
    try {
      this.stream = await this.view.getUserMedia({
        video: {
          facingMode: 'environment',
        },
      });

      this.view.showCameraPreview(this.stream);
    } catch (error) {
      this.view.logError('Error accessing camera:', error);
      this.view.showAlert('Gagal mengakses kamera. Pastikan Anda memberikan izin dan perangkat memiliki kamera.');
    }
  }

  handleCaptureClick() {
    if (!this.stream) return;

    const photoDataUrl = this.view.capturePhoto();
    
    this.view.stopMediaStream(this.stream);
    this.stream = null;

    this.view.showCapturedPhoto(photoDataUrl);
  }

  setupForm() {
    this.view.setupFormEvents({
      onSubmit: this.handleFormSubmit.bind(this)
    });
  }

  async handleFormSubmit(formData) {
    const { description, photoDataUrl, lat, lon } = formData;

    if (!photoDataUrl) {
      this.view.showAlert('Silakan ambil foto dengan kamera');
      return;
    }

    if (!lat || !lon) {
      this.view.showAlert('Silakan pilih lokasi pada peta');
      return;
    }

    try {
      const base64Data = photoDataUrl.split(',')[1];
      const blob = await this.view.createBlobFromBase64(base64Data);

      const apiFormData = this.view.createFormData();
      this.view.appendToFormData(apiFormData, 'description', description);
      this.view.appendToFormData(apiFormData, 'photo', blob, 'photo.jpg');
      this.view.appendToFormData(apiFormData, 'lat', lat);
      this.view.appendToFormData(apiFormData, 'lon', lon);

      const response = await this.model.addNewStory(apiFormData);

      if (response.error) {
        this.view.showAlert(response.message);
        return;
      }

      // BAGIAN BARU: Kirim notifikasi ke semua user setelah story berhasil dibuat
      // No need to wait response - jalankan di background
      this.#notifyToAllUser(response.story?.id);

      this.view.showAlert('Cerita berhasil ditambahkan!');
      this.view.redirectToHome();
    } catch (error) {
      this.view.logError(error);
      this.view.showAlert('Terjadi kesalahan saat menambahkan cerita');
    }
  }

  // BAGIAN BARU: Method untuk mengirim notifikasi ke semua user
  async #notifyToAllUser(storyId) {
    if (!storyId) {
      console.warn('Story ID not found, skip notification');
      return false;
    }

    try {
      console.log('Sending notification to all users for story:', storyId);
      const response = await Api.sendStoryToAllUserViaNotification(storyId);
      
      if (!response.ok) {
        console.error('#notifyToAllUser: response:', response);
        return false;
      }
      
      console.log('Notification sent successfully to all users');
      return true;
    } catch (error) {
      console.error('#notifyToAllUser: error:', error);
      return false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.view.stopMediaStream(this.stream);
      this.stream = null;
      this.view.logMessage('Kamera dimatikan karena user pindah halaman.');
    }
  }
}