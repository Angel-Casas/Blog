<template>
    <header>
        <h3 class='color'>Register</h3>
        <RouterLink :to='{ name: "login" }'>
            <h4 class='border-bottom'>Login</h4>
        </RouterLink>
    </header>
    <Form @submit='onSubmit' :validation-schema='schema' v-slot='{ errors, isSubmitting }'  id='RegisterForm'>
        <div class="formGroup">
            <label>Name</label>
            <Field name="name" type="text" class="border" :class='{ "isInvalid": errors.name }'/>
            <div class="invalidFeedback">{{ errors.name }}</div>
        </div>
        <div class="formGroup">
            <label>Email</label>
            <Field name='email' type='text' class='border' :class='{ "isInvalid": errors.email }'/>
            <div class="invalidFeedback">{{ errors.email }}</div>
        </div>
        <div class="formGroup">
            <label>Password</label>
            <Field name='password' type='password' class='border' :class='{ "isInvalid": errors.password }'/>
            <div class="invalidFeedback">{{  errors.password  }}</div>
        </div>
        <div class="formGroup">
            <button class='button' :disabled='isSubmitting'>
                <span v-show='isSubmitting' class="spinner"></span>
                Register
            </button>
            <RouterLink to="login" class="button">Cancel</RouterLink>
        </div>
    </Form>
</template>

<script setup>
/* IMPORTS */
import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';
import { useRoute } from 'vue-router';
import router from '@/router';
import { useUserStore } from '@/stores';
import useEventsBus from '@/composables/eventBus';

/* VARIABLES */
const { emitBus } = useEventsBus();

const route = useRoute();

const userStore = useUserStore();

const schema = Yup.object().shape({
    name: Yup.string()
        .required('Name is required'),
    email: Yup.string()
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
});

/* ACTIONS */

// Redirect to home if already logged in
if (userStore.user) {
    emitBus('notify', {
        type: 'success',
        title: `Already logged in!`,
        message: 'Returning to the home page.',
        action: 'retry'
    });
    router.push('/');
}

/* METHODS */

async function onSubmit(values) {
    await userStore.register(values);

    if (userStore.error) {
        emitBus('notify', {
            type: 'error',
            title: `Error registering.`,
            message: userStore.error.includes('email') ? 'Email is not valid.' : 'Password is not valid.',
            action: 'retry'
        });
    } else {
        emitBus('notify', {
            type: 'success',
            title: `Successfully registered.`,
            message: `Welcome ${userStore.user.name}`,
            action: 'close'
        });
    }
};
</script>