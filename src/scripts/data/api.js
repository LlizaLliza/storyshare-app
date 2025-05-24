import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

class Api {
  static async register({ name, email, password }) {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
    
    return await response.json();
  }

  static async login({ email, password }) {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    
    const result = await response.json();

    if (!result.error && result.loginResult) {
      const { userId, name, token } = result.loginResult;
      localStorage.setItem('userId', userId);
      localStorage.setItem('name', name);
      localStorage.setItem('token', token);
    }

    return result;
  }

  static async getAllStories() {
    const token = localStorage.getItem('token');
    const response = await fetch(ENDPOINTS.STORIES, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return await response.json();
  }

  static async getStoryDetail(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(ENDPOINTS.DETAIL(id), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return await response.json();
  }

  static async addNewStory(formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    return await response.json();
  }
}

export default Api;