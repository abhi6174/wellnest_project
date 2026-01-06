export async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No JWT token found');
    }
    
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('API request failed');
    }
    return response.json();
  }
  