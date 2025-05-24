export default class DetailPresenter {
  constructor({ model, view }) {
    this.model = model;
    this.view = view;
  }

  async loadDetail(id) {
    if (!id) {
      this.view.showError('ID cerita tidak valid');
      return;
    }

    try {
      const apiResponse = await this.model.getStoryDetail(id);

      if (apiResponse.error) {
        this.view.showError(apiResponse.message);
        return;
      }

      const story = apiResponse.story;

      this.view.showStoryDetail(story);

      if (story.lat && story.lon) {
        this.view.showMap(story.lat, story.lon, story.name, story.description);
      } else {
        this.view.showNoLocation();
      }
    } catch (error) {
      this.view.logError(error);
      this.view.showError('Gagal memuat detail cerita');
    }
  }
}