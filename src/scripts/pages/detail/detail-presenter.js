export default class DetailPresenter {
  constructor({ model, view }) {
    this.model = model;
    this.view = view;
    console.log('DetailPresenter: Initialized with model and view');
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
}