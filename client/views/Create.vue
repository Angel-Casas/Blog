<template>
    <header>
        <h2 class="color">Create Post</h2>
    </header>
    <Form @submit='onSubmit' :validation-schema='schema' v-slot='{ errors, isSubmitting }' id='EditForm'>
        <div class="formGroup">
            <label>Cover</label>
            <Field name='cover' type='text' class='border' :class='{ isInvalid: errors.cover }' />
            <div class="invalidFeedback">{{ errors.cover }}</div>
        </div>
        <div class="formGroup">
            <label>Title</label>
            <Field name='title' type='text' class='border' :class='{ isInvalid: errors.title }' />
            <div class="invalidFeedback">{{ errors.title }}</div>
        </div>
        <div class="formGroup">
            <label>Body</label>
            <Field name='body' as='textarea' class='border' :class='{ isInvalid: errors.body }' rows='4' cols='20' />
            <div class="invalidFeedback">{{ errors.body }}</div>
        </div>
        <div class="formGroup">
            <label>Preview</label>
            <Field name='preview' as='textarea' class='border' :class='{ isInvalid: errors.preview }' rows='4' cols='20' />
            <div class="invalidFeedback">{{ errors.preview }}</div>
        </div>
        <div class="formGroup">
            <label>section</label>
            <Field name='section' as='select' class='border' :class='{ isInvalid: errors.section }'>
                <option value='cs'>CS</option>
                <option value='mathematics'>Mathematics</option>
                <option value='economy'>Economy</option>
                <option value='nature'>Nature</option>
            </Field>
            <div class="invalidFeedback">{{ errors.section }}</div>
        </div>
        <div class="formGroup">
            <label>Date</label>
            <Field name='date' type='text' class='border' :class='{ isInvalid: errors.date }' />
            <div class="invalidFeedback">{{ errors.date }}</div>
        </div>
        <div class="formGroup">
            <label>Tags</label>
            <Field name='tags' type='text' class='border' :class='{ isInvalid: errors.tags }' />
            <div class="invalidFeedback">{{ errors.tags }}</div>
        </div>
        <div class="formGroup">
            <button class='button' :disabled='isSubmitting'>
                <span v-show='isSubmitting' class='spinner'></span>
                Publish
            </button>
        </div>
    </Form>
</template>
<script setup>
/* IMPORTS */
import { useRoute } from 'vue-router';
import router from '@/router';
import { usePostStore } from '@/stores';
import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';
import useEventsBus from '@/composables/eventBus';

/* VARIABLES */
const { emitBus } = useEventsBus();
const route = useRoute();
const postStore = usePostStore();

const schema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    body: Yup.string().required('Body is required'),
    preview: Yup.string().required('Preview is required'),
    section: Yup.string().oneOf(['cs', 'mathematics', 'economy', 'nature']).required('Section is required'),
    date: Yup.string(),
    tags: Yup.string()
});

/* ACTIONS */

async function onSubmit(values) {
    await postStore.create(values);

    if (postStore.error) {
        emitBus('notify', {
            type: 'error',
            title: `Error creating the post (${postStore.error})`,
            message: 'Please make sure the data is valid.',
            action: 'retry'
        });
    } else {
        emitBus('notify', {
            type: 'success',
            title: 'Success',
            message: 'Post has been created!',
            action: 'close'
        });
        // router.go(-1);
    }
};
</script>