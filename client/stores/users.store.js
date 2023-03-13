import { defineStore } from 'pinia';
import { fetchWrapper } from '@/helpers';
import router from '@/router';

const baseUrl = `${import.meta.env.VITE_API_URL}/api/users`;

export const useUserStore = defineStore({
  id: 'users',
  state: () => ({
    users: [],
    user: JSON.parse(localStorage.getItem('user')),
    loading: false,
    returnUrl: null,
    error: null
  }),
  getters: {
    isAuth: (state) => {
      if (state.user) {
        return state.user.role === 'admin'
      }
      return false;
    }
  },
  actions: {
    async fetchUsers() {
      this.users = { loading: true };
      fetchWrapper.get(baseUrl)
        .then(users => this.users = users)
        .catch(error => this.users = { error })
    },
    async login(email, password) {
      this.error = null;
      this.loading = true;
      try {
        const data = await fetchWrapper.post(`${baseUrl}/login`, { email, password });

        this.user = data.user;

        // Store user details and jwt in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to previous url or default to home page
        router.push(this.returnUrl || '/');
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    logout()  {
      this.user = null;
      localStorage.removeItem('user');
      router.push('/login');
    },
    async register(user) {
      try {
        await fetchWrapper.post(`${baseUrl}/register`, user);
      } catch (error) {
        this.error = error;
        return;
      }

      // Success, now we log in
      const { email, password } = user;
      await this.login(email, password);
    }
  }
});