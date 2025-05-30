export default class DetailPresenter {
  constructor({ model, dbModel, view }) {
    this.model = model;
    this.dbModel = dbModel;  // ⏩ tambahkan database model
    this.view = view;
    console.log('DetailPresenter: Initialized with model, dbModel, and view');
  }

  async loadDetail(id) {
    console.log('DetailPresenter: loadDetail called with ID:', id);
    
    if (!id) {
      console.error('DetailPresenter: No ID provided');
      this.view.showError('ID cerita tidak valid');
      return;
    }

    try {
      console.log('DetailPresenter: Fetching story detail from API...');
      const apiResponse = await this.model.getStoryDetail(id);
      console.log('DetailPresenter: API response received:', apiResponse);

      if (apiResponse.error) {
        console.error('DetailPresenter: API returned error:', apiResponse.message);
        this.view.showError(apiResponse.message);
        return;
      }

      if (!apiResponse.story) {
        console.error('DetailPresenter: No story data in response');
        this.view.showError('Data cerita tidak ditemukan');
        return;
      }

      const story = apiResponse.story;
      console.log('DetailPresenter: Story data:', {
        id: story.id,
        name: story.name,
        hasLocation: !!(story.lat && story.lon)
      });

      // Show story detail
      this.view.showStoryDetail(story);

      // Show map if location available
      if (story.lat && story.lon) {
        console.log('DetailPresenter: Showing map with location');
        this.view.showMap(story.lat, story.lon, story.name, story.description);
      } else {
        console.log('DetailPresenter: No location data, showing no location message');
        this.view.showNoLocation();
      }
      
      console.log('DetailPresenter: Story detail loaded successfully');
      
    } catch (error) {
      console.error('DetailPresenter: Error loading detail:', error);
      this.view.logError(error);
      this.view.showError('Gagal memuat detail cerita');
    }
  }

  // ⏩ method baru untuk menyimpan cerita
  async saveStory(id) {
    try {
      console.log('DetailPresenter: Saving story with ID:', id);
      const apiResponse = await this.model.getStoryDetail(id);

      if (apiResponse.error || !apiResponse.story) {
        throw new Error(apiResponse.message || 'Cerita tidak ditemukan');
      }

      await this.dbModel.putStory(apiResponse.story);
      console.log('DetailPresenter: Story saved successfully');
      this.view.saveToBookmarkSuccessfully('Cerita berhasil disimpan!');
    } catch (error) {
      console.error('DetailPresenter: Error saving story:', error);
      this.view.saveToBookmarkFailed(error.message);
    }
  }

  async isStorySaved(id) {
    try {
      const story = await this.dbModel.getStory(id);
      return !!story; // true jika ada, false jika tidak ada
    } catch (error) {
      console.error('DetailPresenter: Error checking story saved:', error);
      return false;
    }
  }
  
  async deleteStory(id) {
    try {
      await this.dbModel.deleteStory(id);
      console.log('DetailPresenter: Story deleted successfully');
      this.view.saveToBookmarkSuccessfully('Cerita berhasil dihapus!');
      return true;
    } catch (error) {
      console.error('DetailPresenter: Error deleting story:', error);
      this.view.saveToBookmarkFailed('Gagal menghapus cerita');
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
      console.log('DetailPresenter: Story saved successfully');
      // Jangan tampilkan alert di sini, biar di DetailPage bisa atur sendiri
      return true;
    } catch (error) {
      console.error('DetailPresenter: Error saving story:', error);
      return false;
    }
  }      
}