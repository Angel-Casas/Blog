import { defineStore } from 'pinia';

import { fetchWrapper } from '@/helpers';
import router from '@/router';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        user: null,
        refreshTokenTimeout: null
    }),
    actions: {
        async login(email, password) {
            this.user = await fetchWrapper.post(`${baseUrl}/login`, { email, password });
            this.startRefreshTokenTimer();
        },
        logout() {
            fetchWrapper.post(`${baseUrl}/revokeToken`, {}, { credentials: 'include' });
            this.stopRefreshTokenTimer();
            this.user = null;
            router.push('/login');
        },
        async refreshToken() {
            this.user = await fetchWrapper.post(`${baseUrl}/refreshToken`, {}, { credentials: 'include' });
            this.startRefreshTokenTimer();
        },
        startRefreshTokenTimer() {
            // Parse json object from base64 encoded jwt token
            const jwtBase64 = this.user.jwtToken.split('.'[1]);
            const jwtToken = JSON.parse(atob(jwtBase64));

            // Set a timeout to refresh the token a minute before it expires
            const expires = new Date(jwtToken.exp * 1000);
            const timeout = expires.getTime() - Date.now() - (60 * 1000);
            this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
        },
        stopRefreshTokenTimer() {
            clearTimeout(this.refreshTokenTimeout);
        }
    }
});