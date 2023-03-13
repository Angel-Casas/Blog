<template>
    <article class="postPreview">
        <RouterLink :to='{ name: "post", params: { section: post.section, id: post.id }}'>
          <div class="cover" :style="{backgroundImage:`url(${post.cover})`}">
            <div class="postPreviewBox">
              <h4 class="noMargin">{{ post.title }}</h4>
              <time class="postDate" :datetime="post.date">{{ post.post_time_formated }}</time>
              <p class="preview">{{ post.preview }}</p>
              <div class="entrySmall">
                <ul class="tags" v-if='post.tags'>
                  <li v-for='tag in post.tags'>
                    <RouterLink :to='{ name: "tagList", params: { tag: tag.slug } }'>{{ tag.title }}</RouterLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </RouterLink>
      </article>
</template>
<script setup>
const props = defineProps(['post']);
</script>