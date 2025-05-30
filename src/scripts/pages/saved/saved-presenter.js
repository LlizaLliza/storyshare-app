import DB from '../../database'; // pastikan path ini sesuai struktur kamu

export default class SavedPresenter {
  constructor({ view }) {
    this.view = view;
    this.dbModel = DB;
    console.log('SavedPresenter: Initialized');
  }

  async loadSavedStories() {
    try {
      const stories = await this.dbModel.getAllStories();
      console.log('SavedPresenter: Loaded saved stories:', stories);
      this.view.showSavedStories(stories);
    } catch (error) {
      console.error('SavedPresenter: Error loading saved stories:', error);
      this.view.showError('Gagal memuat cerita tersimpan');
    }
  }
}
