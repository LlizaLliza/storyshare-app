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
    const presenter = new AddStoryPresenter(Api, CONFIG);
    await presenter.init();
  }
}
