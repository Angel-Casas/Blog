<template>
  <div id='postComments'>
          <header>
            <h5 class='color'>Comments</h5>
          </header>
          <div id="postComments">
            <div class="commentCount">{{ comments.length }} Comments</div>
            <ul class='commentGroup' v-if='comments.length'>
              <li v-for='(comment, index) in comments' :key="comment.id" class="borderBottom" :id="`comment-${comment.id}`">
                <div v-if="comment.approved" class="approvedComments">
                  <div class="meta">
                    <div class="commentNumber">
                      <span class="color">{{ index }}</span>
                    </div>
                    <span class="authorName color">{{ comment.name }}</span><span> said on: </span>
                    <time :datetime="comment.date">{{ new Date(comment.date).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}) }}</time>
                  </div>
                  <div class="quote">
                    <p>{{ comment.body }}</p>
                  </div>
                </div>
                <div v-else-if="user?.role === 'admin'">
                  <div class="meta">
                    <div class="commentNumber">
                      <span class="color">{{ index }}</span>
                    </div>
                    <span class="authorName color">{{ comment.name }}</span><span> said on: </span>
                    <time :datetime="comment.date">{{ new Date(comment.date).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}) }}</time>
                  </div>
                  <div class="quote">
                    <p>{{ comment.body }}</p>
                  </div>
                  <button class="button" @click="approveComment(comment.id)">Approve</button>
                </div>
                <button class="button" @click="deleteComment(comment.id)" v-if="user?.role === 'admin'">Delete</button>
              </li>
            </ul>
            <p v-else>Be the first to comment!</p>
          </div>
          <Form @submit="onSubmit" :validation-schema='schema' v-slot='{ errors, isSubmitting }' id='commentsForm'>
            <h5 class='color'>Leave your comment</h5>
            <div class="formGroup">
              <label>Name</label>
              <Field name='name' type='text' class='border' :class='{ "isInvalid": errors.name }'/>
              <div class="invalidFeedback">{{ errors.name }}</div>
            </div>
            <div class="formGroup">
              <label>Message</label>
              <Field name='body' as='textarea' class='border' :class='{ isInvalid: errors.body }' rows='4' cols='20' />
              <div class="invalidFeedback">{{ errors.body }}</div>
            </div>
            <div class="formGroup">
              <button class='button' :disabled='isSubmitting'>
                <span v-show='isSubmitting' class='spinner'></span>
                Comment
            </button>
            </div>
          </Form>
        </div>
</template>

<script setup>
/* IMPORTS */
import { Form, Field} from 'vee-validate';
import * as Yup from 'yup';
import { usePostStore, useUserStore } from '@/stores';
import { useRoute } from 'vue-router';
import router from '@/router';
import { storeToRefs } from 'pinia';
import useEventsBus from '@/composables/eventBus';

/* PROPS */

defineProps(['comments']);

/* VARIABLES */
const { emitBus } = useEventsBus();
const postStore = usePostStore();
const userStore = useUserStore();
const route = useRoute();

const { user } = storeToRefs(userStore);

const schema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    body: Yup.string().required('Message is required')
});

/* ACTIONS */

async function onSubmit(values) {
  await postStore.createComment(route.params.section, route.params.id, values);
  if (postStore.error) {
        emitBus('notify', {
            type: 'error',
            title: `Error posting your comment (${postStore.error})`,
            message: 'Please make sure the name and message are not empty.',
            action: 'retry'
        });
    } else {
        emitBus('notify', {
            type: 'success',
            title: 'Success',
            message: `Your comment is now pending approval and will soon become visible!`,
            action: 'close'
        });
        router.push(`/posts/${postStore.post.section}/${postStore.post.id}#postComments`);
    }
}

async function approveComment(commentId) {
  const comment = await postStore.approveComment(route.params.section, route.params.id, commentId);

  if (postStore.error) {
        emitBus('notify', {
            type: 'error',
            title: `Error approving your comment (${postStore.error})`,
            message: 'Please try again.',
            action: 'retry'
        });
    } else {
        emitBus('notify', {
            type: 'success',
            title: 'Success',
            message: `Your comment is now approved!`,
            action: 'close'
        });
        router.push(`/posts/${postStore.post.section}/${postStore.post.id}#postComments`);
    }
}

async function deleteComment(commentId) {
  await postStore.deleteComment(route.params.section, route.params.id, commentId);

  if (postStore.error) {
        emitBus('notify', {
            type: 'error',
            title: `Error deleting your comment (${postStore.error})`,
            message: 'Please try again.',
            action: 'retry'
        });
    } else {
        emitBus('notify', {
            type: 'success',
            title: 'Success',
            message: `Your comment is now deleted!`,
            action: 'close'
        });
        router.push(`/posts/${postStore.post.section}/${postStore.post.id}#postComments`);
    }
}
</script>