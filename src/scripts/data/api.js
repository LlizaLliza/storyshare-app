import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

function getAccessToken() {
  return localStorage.getItem('token');
}

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
    const cacheName = 'story-api-json';
    const cacheKey = ENDPOINTS.STORIES;
  
    try {
      const response = await fetch(cacheKey, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari jaringan');
      }
  
      const cache = await caches.open(cacheName);
      cache.put(cacheKey, response.clone());
  
      return await response.json();
  
    } catch (error) {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(cacheKey);
  
      if (cachedResponse) {
        return await cachedResponse.json();
      }
  
      throw error;
    }
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

  static async sendStoryToAllUserViaNotification(storyId) {
    return await sendStoryToAllUserViaNotification(storyId);
  }

  static async sendStoryToMeViaNotification(storyId) {
    return await sendStoryToMeViaNotification(storyId);
  }
}

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ endpoint });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendStoryToAllUserViaNotification(storyId) {
  const accessToken = getAccessToken();
  
  console.log('sendStoryToAllUserViaNotification called with:', {
    storyId,
    hasToken: !!accessToken,
    endpoint: `${CONFIG.BASE_URL}/stories/${storyId}/notify-all`
  });
  
  if (!accessToken) {
    return {
      error: true,
      message: 'No access token available',
      ok: false
    };
  }
  
  try {
    const fetchResponse = await fetch(`${CONFIG.BASE_URL}/stories/${storyId}/notify-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!fetchResponse.ok) {
      
      let errorMessage = 'Network response was not ok';
      try {
        const errorData = await fetchResponse.text();
        errorMessage = errorData || errorMessage;
      } catch (parseError) {
      }
      
      return {
        error: true,
        message: `HTTP ${fetchResponse.status}: ${errorMessage}`,
        ok: false
      };
    }
    
    const json = await fetchResponse.json();
    
    return {
      ...json,
      ok: fetchResponse.ok,
    };
    
  } catch (error) {
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return {
        error: true,
        message: 'Network error: Unable to connect to server for notify all users.',
        ok: false
      };
    }
    
    return {
      error: true,
      message: error.message || 'Unknown error occurred in notify all users',
      ok: false
    };
  }
}

export async function sendStoryToMeViaNotification(storyId) {
  const accessToken = getAccessToken();
  
  console.log('sendStoryToMeViaNotification called with:', {
    storyId,
    hasToken: !!accessToken,
    endpoint: `${CONFIG.BASE_URL}/stories/${storyId}/notify-me`
  });
  
  if (!accessToken) {
    return {
      error: true,
      message: 'No access token available',
      ok: false
    };
  }
  
  try {
    const fetchResponse = await fetch(`${CONFIG.BASE_URL}/stories/${storyId}/notify-me`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!fetchResponse.ok) {
      
      let errorMessage = 'Network response was not ok';
      try {
        const errorData = await fetchResponse.text();
        errorMessage = errorData || errorMessage;
      } catch (parseError) {
      }
      
      return {
        error: true,
        message: `HTTP ${fetchResponse.status}: ${errorMessage}`,
        ok: false
      };
    }
    
    const json = await fetchResponse.json();
    console.log('API response json:', json);
    
    return {
      ...json,
      ok: fetchResponse.ok,
    };
    
  } catch (error) {
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return {
        error: true,
        message: 'Network error: Unable to connect to server. Please check your internet connection.',
        ok: false
      };
    }
    
    return {
      error: true,
      message: error.message || 'Unknown error occurred',
      ok: false
    };
  }
}

export default Api;