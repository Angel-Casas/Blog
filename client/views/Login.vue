<template>
    <header>
        <h3 class='color'>Login</h3>
        <RouterLink :to='{ name: "register" }'>
            <h4 class='border-bottom'>Register</h4>
        </RouterLink>
    </header>
    <Form @submit='onSubmit' :validation-schema='schema' v-slot='{ errors, isSubmitting }'  id='LoginForm'>
        <div class="formGroup">
            <label>Email</label>
            <Field name='email' type='text' class='border' :class='{ "isInvalid": errors.email }'/>
            <div class="invalidFeedback">{{ errors.email }}</div>
        </div>
        <div class="formGroup">
            <label>Password</label>
            <Field name='password' type='password' class='border' :class='{ "isInvalid": errors.password }'/>
            <div class="invalidFeedback">{{ errors.password }}</div>
        </div>
        <div class="formGroup">
            <button class='button' :disabled='isSubmitting'>
                <span v-show='isSubmitting' class='spinner'></span>
                Login
            </button>
        </div>
    </form>
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
    email: Yup.string().required('Email is required'),
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

async function onSubmit(values) {
    const { email, password } = values;

    await userStore.login(email, password);

    if (userStore.error) {
        emitBus('notify', {
            type: 'error',
            title: `Error logging in (${userStore.error})`,
            message: 'Please make sure the user and password are correct.',
            action: 'retry'
        });
    } else {
        emitBus('notify', {
            type: 'success',
            title: 'Logged in',
            message: `Welcome back ${userStore.user.name}!`,
            action: 'close'
        });
    }
}
</script>