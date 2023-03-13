<template>
    <header>
        <h2 class="color">{{ $route.params.section }}</h2>
    </header>
    <p v-if="loading">Loading posts...</p>
    <p v-if="error">{{ error }}</p>
    <div v-if="posts">
        <PostPreview v-for="post in posts" :post="post" :key="post"></PostPreview>
    </div>
    <p v-else>No posts to show!</p>
</template>

<script setup>
/* IMPORTS */
import { onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usePostStore } from '../stores/post.store';
import PostPreview from '@/components/PostPreview.vue';

/* VARIABLES */
const { posts, loading, error } = storeToRefs(usePostStore());
const { fetchPostsBySection } = usePostStore();
const route = useRoute();
const postList = 0;


/* MOUNTED */

onMounted(async () => {
    fetchPostsBySection(route.params.section);
});
</script>