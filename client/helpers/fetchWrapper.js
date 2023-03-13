import { useUserStore } from '@/stores';

export const fetchWrapper = {
    get: request('GET'),
    post: request('POST'),
    patch: request('PATCH'),
    delete: request('DELETE')
};

function request(method) {
    return (url, body, { credentials } = {}) => {
        const requestOptions = {
            method,
            headers: authHeader(url)
        };
        if (body) {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(body);
        }
        if (credentials) {
            requestOptions.credentials = credentials;
        }

        return fetch(url, requestOptions).then(handleResponse);
    }
};

function authHeader(url) {
    // Return auth header with jwt if user is logged in and request is to the api url
    const { user } = useUserStore();
    const isLoggedIn = !!user?.token;
    const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL);
    if (isLoggedIn && isApiUrl) {
        return { Authorization: `Bearer ${user.token}` };
    } else {
        return {};
    }
};

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);

        if (!response.ok) {
            const { user, logout } = useUserStore();
            if ([401, 403].includes(response.status) && user) {
                // Auto logout if 401 Unauthorized or 403 Forbidden
                logout();
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
};