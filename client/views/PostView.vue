<template>
  <div>
    <p v-if="loading">Loading post...</p>
    <p v-if="error">{{ error.message }}</p>
    <div class="adminBox" v-if='post && user?.role === "admin"'>
      <button class="button" @click="toEdit(post)">Edit</button>
      <button class='button' @click='deletePost(post)'>Delete</button>
      <button class="button" @click='removeOrphans'>Remove Orphan Tags</button>
    </div>
    <Post v-if='post'></Post>
  </div> 
</template>

<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { usePostStore, useUserStore, useTagStore } from '@/stores';
import router from '@/router';
import { useRoute } from 'vue-router';
import Post from '../components/Post.vue';
import useEventsBus from '@/composables/eventBus';

/* VARIABLES */
const { emitBus } = useEventsBus();
const route = useRoute();
const postStore = usePostStore();
const userStore = useUserStore();
const tagStore = useTagStore();
const { post, loading, error } = storeToRefs(postStore);
const { user } = storeToRefs(userStore);

/* ACTIONS */
async function deletePost(post) {
  await postStore.delete(post.section, post.id);

  if (postStore.error) {
        emitBus('notify', {
            type: 'error',
            title: 'Error deleting post',
            message: postStore.error,
            action: 'retry'
        });
    } else {
        emitBus('notify', {
            type: 'success',
            title: 'Successful',
            message: `Post has been deleted.`,
            action: 'close'
        });
        router.push('/');
    }
}

function toEdit(post) {
  router.push(`/posts/${post.section}/${post.id}/edit`);
}

async function removeOrphans() {
  await tagStore.removeOrphans();

  if (tagStore.error) {
    emitBus('notify', {
            type: 'error',
            title: 'Error Finding Orphan Tags',
            message: postStore.error,
            action: 'retry'
        });
    } else {
        emitBus('notify', {
            type: 'success',
            title: 'Successful',
            message: `Orphan tags have been deleted.`,
            action: 'close'
        });
        // router.push('/');
    }
}

/* MOUNTED */

onMounted(async () => {
    await postStore.fetchPost(route.params.section, route.params.id);
});
</script>