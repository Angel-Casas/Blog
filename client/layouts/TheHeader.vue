<template>
<header id='Header'>
  <RouterLink :to='{ name: "home" }' title='Ángel Casas Pescador'>
    <Logo></Logo>
  </RouterLink>
  <h1 class='srOnly'>Ángel Casas Pescador</h1>
  <nav>
    <RouterLink :to='{ name: "postSection", params: { section: "cs" }}'>Computer Science</RouterLink>
    <RouterLink :to='{ name: "postSection", params: { section: "mathematics" }}'>Mathematics</RouterLink>
    <RouterLink :to='{ name: "postSection", params: { section: "economy" }}'>Economy</RouterLink>
    <RouterLink :to='{ name: "postSection", params: { section: "nature" }}'>Nature</RouterLink>
    <RouterLink :to='{ name: "books"}'>Books</RouterLink>
    <RouterLink :to='{ name: "projects"}'>Projects</RouterLink>
    <RouterLink :to='{ name: "about"}'>About</RouterLink>
    <RouterLink :to='{ name: "login"}' v-if="!userStore.user">Login</RouterLink>
    <RouterLink :to='{ name: "register"}' v-if="!userStore.user">Register</RouterLink>
    <button class='button' v-if="userStore.user" @click="logout">Log out</button>
  </nav>
</header>
</template>

<script setup>
/* IMPORTS */
import { RouterLink } from 'vue-router';
import Logo from '@/components/Logo.vue';
import useEventsBus from '@/composables/eventBus';
import { useUserStore } from '@/stores';


/* VARIABLES */
const { emitBus } = useEventsBus();

const userStore = useUserStore();

/* ACTIONS */
async function logout() {

    await userStore.logout();

    if (userStore.error) {
      emitBus('notify', {
        type: 'error',
        title: `Error logging out (${userStore.error})`,
        message: 'Please try again.',
        action: 'retry'
      });
    } else {
      emitBus('notify', {
        type: 'success',
        title: 'Logged out',
        message: `We hope to see you back soon!`,
        action: 'close'
      });
    }
}
</script>
