export const getJwtFromLocalStorage = (): string | null => {
    return localStorage.getItem('jwt');
};

export const fetchWithAuth = async <T = any>(
    url: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getJwtFromLocalStorage();
    if (!token) {
        throw new Error('No JWT token found');
    }

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        throw new Error('API request failed');
    }

    return response.json();
};
