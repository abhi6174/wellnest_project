export function getJwtFromLocalStorage() {
    return localStorage.getItem('jwt');
  }
  
  export async function fetchWithAuth(url, options = {}) {
    const token = getJwtFromLocalStorage();
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, options);
  }
  