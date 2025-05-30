import DB from '../../database';

export default class SavedPresenter {
  constructor({ view }) {
    this.view = view;
    this.dbModel = DB;
  }

  async loadSavedStories() {
    try {
      const stories = await this.dbModel.getAllStories();
      this.view.showSavedStories(stories);
    } catch (error) {
      this.view.showError('Gagal memuat cerita tersimpan');
    }
  }
}
