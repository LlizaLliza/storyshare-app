export default class DetailPresenter {
  constructor({ model, dbModel, view }) {
    this.model = model;
    this.dbModel = dbModel;
    this.view = view;
  }

  async loadDetail(id) {
    
    if (!id) {
      console.error('DetailPresenter: No ID provided');
      this.view.showError('ID cerita tidak valid');
      return;
    }

    try {
      const apiResponse = await this.model.getStoryDetail(id);

      if (apiResponse.error) {
        this.view.showError(apiResponse.message);
        return;
      }

      if (!apiResponse.story) {
        this.view.showError('Data cerita tidak ditemukan');
        return;
      }

      const story = apiResponse.story;
      console.log('DetailPresenter: Story data:', {
        id: story.id,
        name: story.name,
        hasLocation: !!(story.lat && story.lon)
      });

      this.view.showStoryDetail(story);

      if (story.lat && story.lon) {
        this.view.showMap(story.lat, story.lon, story.name, story.description);
      } else {
        console.log('DetailPresenter: No location data, showing no location message');
        this.view.showNoLocation();
      }
      
    } catch (error) {
      console.error('DetailPresenter: Error loading detail:', error);
      this.view.logError(error);
      this.view.showError('Gagal memuat detail cerita');
    }
  }

  async saveStory(id) {
    try {
      console.log('DetailPresenter: Saving story with ID:', id);
      const apiResponse = await this.model.getStoryDetail(id);

      if (apiResponse.error || !apiResponse.story) {
        throw new Error(apiResponse.message || 'Cerita tidak ditemukan');
      }

      await this.dbModel.putStory(apiResponse.story);
    } catch (error) {
      this.view.saveToBookmarkFailed(error.message);
    }
  }

  async isStorySaved(id) {
    try {
      const story = await this.dbModel.getStory(id);
      return !!story;
    } catch (error) {
      console.error('DetailPresenter: Error checking story saved:', error);
      return false;
    }
  }
  
  async deleteStory(id) {
    try {
      await this.dbModel.deleteStory(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async saveStory(id) {
    try {
      const apiResponse = await this.model.getStoryDetail(id);
  
      if (apiResponse.error || !apiResponse.story) {
        throw new Error(apiResponse.message || 'Cerita tidak ditemukan');
      }
  
      await this.dbModel.putStory(apiResponse.story);
      return true;
    } catch (error) {
      return false;
    }
  }      
}