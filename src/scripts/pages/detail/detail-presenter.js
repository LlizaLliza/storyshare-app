export default class DetailPresenter {
    constructor(view) {
      this.view = view;
    }
  
    async loadDetail({ token, id, apiResponse }) {
      if (!token) {
        window.location.hash = '#/login';
        return;
      }
  
      if (!id) {
        this.view.showError('ID cerita tidak valid');
        return;
      }
  
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
    }
  }
  