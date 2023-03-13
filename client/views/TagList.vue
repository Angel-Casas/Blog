<template>
<p v-if="loading">Loading post...</p>
<p v-if="error">{{ error.message }}</p>
<div v-if="tag">
    <header>
        <h2 class="color">{{ tag.title }}</h2>
    </header>
    <div class="tagList">
        <div>
            <PostPreview v-for="post in tag.posts" :post="post" :key="post.id"></PostPreview>
        </div>
    </div>
</div>
</template>

<script setup>
/* IMPORTS */
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTagStore } from '@/stores';
import { useRoute } from 'vue-router';
import PostPreview from '@/components/PostPreview.vue';

/* VARIABLES */
const route = useRoute();
const tagStore = useTagStore();
const { tag, loading, error } = storeToRefs(tagStore);


/* MOUNTED */

onMounted(async () => {
    await tagStore.fetchTag(route.params.tag);
});
</script>