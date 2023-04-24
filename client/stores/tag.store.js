import { defineStore } from 'pinia';
import { fetchWrapper } from '@/helpers';

const baseUrl = `/server/api/tags`;

export const useTagStore = defineStore({
  id: 'tag',
  state: () => {
    return {
      tags: [],
      tag: null,
      loading: false,
      error: null,
    }
  },
  getters: {
    getTags: (state) => {
      return state.tags;
    }
  },
  actions: {
    async fetchTags() {
      this.tags = [];
      this.error = null;
      this.loading = true;
      try {
        const data = await fetchWrapper.get(baseUrl);
        this.tags = data.tags;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async fetchTag(tag) {
      this.tag = null;
      this.error = null;
      this.loading = true;
      try {
        const data = await fetchWrapper.get(`${baseUrl}/${tag}`);
        this.tag = data.tag;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async removeOrphans() {
      this.error = null;
      try {
        await fetchWrapper.post(`${baseUrl}/removeOrphans`);
      } catch (error) {
        this.error = error;
      }
    }
  }
});