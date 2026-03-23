const API_URL = 'http://localhost:5000/api';

export const apiFetch = async (endpoint: string, options: any = {}) => {
    const token = localStorage.getItem('grofast-token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            throw new Error(error.message || `API request failed: ${response.status}`);
        } else {
            const text = await response.text();
            throw new Error(`API error (${response.status}): ${text.slice(0, 100)}...`);
        }
    }

    return response.json();
};
