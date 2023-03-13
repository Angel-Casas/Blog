<template>
    <div id="NotFoundDiv">
        <RouterLink :to="{name: 'home'}">
            <img src="/images/sail.png" alt="Image generated using Midjourney AI.">
        </RouterLink>
        <h3>⛺️ <br> 401 Unauthorized access</h3>
        <p>Only the admin can access this page. Please return to the <RouterLink class="color bold" :to="{name: 'home'}">Homepage</RouterLink>!</p>
    </div>
</template>

<script setup>

</script>