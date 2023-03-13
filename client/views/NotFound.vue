<template>
    <div id="NotFoundDiv">
        <RouterLink :to="{name: 'home'}">
            <img src="/images/sail.png" alt="Image generated using Midjourney AI.">
        </RouterLink>
        <h3>⛺️ <br> Lost your way comrade?</h3>
        <p>What you are searching for has been lost in oblivion, or maybe it is hidden in the darkest recesses of your soul, but no worries, you can still return to the <RouterLink class="color bold" :to="{name: 'home'}">Homepage</RouterLink> and begin your search anew!</p>
    </div>
</template>

<script setup>

</script>