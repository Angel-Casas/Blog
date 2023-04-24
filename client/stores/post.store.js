import { defineStore } from 'pinia';
import { fetchWrapper, slugify } from '@/helpers';

const baseUrl = `/api/server/posts`;

export const usePostStore = defineStore({
  id: 'post',
  state: () => {
    return {
      posts: [],
      post: null,
      randomPost: null,
      loading: false,
      error: null,
    }
  },
  getters: {
    getPosts: (state) => {
      return state.posts;
    }
  },
  actions: {
    async fetchPosts() {
      this.posts = [];
      this.error = null;
      this.loading = true;
      try {
        const data = await fetchWrapper.get(baseUrl);
        this.posts = data.posts;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async fetchPostsBySection(section) {
      this.posts = [];
      this.error = null;
      this.loading = true;
      try {
        const data = await fetchWrapper.get(`${baseUrl}/${section}`);
        console.log(data);
        this.posts = data.posts;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async fetchPost(section, id) {
      this.post = null;
      this.error = null;
      this.loading = true;
      try {
        const data = await fetchWrapper.get(`${baseUrl}/${section}/${id}`);
        this.post = data.post;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async create(values) {
      this.post = null;
      this.error = null;
      this.loading = true;

      values.tags = values.tags.split(", ").map(tag => {
        return {
          title: tag,
          slug: slugify(tag)
        };
      });

      try {
        const data = await fetchWrapper.post(baseUrl, values);

        console.log(data);

        this.post = data.post;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async update(values) {
      this.post = null;
      this.error = null;
      this.loading = true;

      values.tags = values.tags.split(", ").map(tag => {
        return {
          title: tag,
          slug: slugify(tag)
        };
      });

      try {
        const data = await fetchWrapper.patch(`${baseUrl}/${values.section}/${values.id}`, values);

        this.post = data.post;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async delete(section, id) {
      this.error = null;
      this.loading = true;

      try {
        await fetchWrapper.delete(`${baseUrl}/${section}/${id}`);
        this.post = null;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    getRandomPost() {
      this.randomPost = this.posts[Math.floor(Math.random()*this.posts.length)];
    },
    async createComment(section, id, values) {
      this.error = null;

      try {
        const { name, body } = values;
        const data = await fetchWrapper.post(`${baseUrl}/${section}/${id}/comment`, { name: name, body: body, postId: id });
        return data.comment;
      } catch (error) {
        this.error = error;
      }
    },
    async approveComment(section, id, commentId) {
      this.error = null;

      try {
        await fetchWrapper.post(`${baseUrl}/${section}/${id}/comment/approve`, {commentId: commentId});
      } catch (error) {
        this.error = error;
      }
    },
    async deleteComment(section, id, commentId) {
      this.error = null;

      try {
        await fetchWrapper.delete(`${baseUrl}/${section}/${id}/comment`, {commentId: commentId});
      } catch (error) {
        this.error = error;
      }
    }
  }
});