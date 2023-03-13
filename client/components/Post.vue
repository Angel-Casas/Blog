<template>
  <div class='postWrapper'>
    <nav class='navPost' role='navigation'>
      <div>
        <h2>Table of Contents:</h2>
        <ol v-if="headings" v-for='header in headings'>
          <li>
            <a :href='`#${header.elementId}`'>{{ header.title }}</a>
            <ol v-if="header.children.length" v-for="children in header.children">
              <li>
                <a :href='`#${children.elementId}`'>{{ children.title }}</a>
              </li>
            </ol>
          </li>
        </ol>
      </div>
    </nav>
    <article class="post">
      <div id='Entry'>
        <header>
          <h3 id='Header1' class='color'>{{ post.title }}</h3>
        </header>
        <small class='entrySmall'>
          <div class='entryAuthor'>
            <!-- <p v-if='author'>Written by: {{ author.name }}</p> -->
          </div>
          <div class='entryDate'>
            <span>Published on: </span>
            <time class='entryTime' :datetime='post.date'>{{ post.postTimeFormated }}</time>
            <div class='entryComments'>
              <!-- <a href='#postComments'>Comments: {{ getPostComments.length }}</a> -->
            </div>
            <div class='tags'>
              <RouterLink v-for='tag in post.tags' :key='tag.slug' :to='{ name: "tagList", params: { tag: tag.slug }}'>{{ tag.title }}</RouterLink>
            </div>
          </div>
        </small>
        <div class='postEntry' ref='postEntry'>
          <div v-html="post.body"></div>
        </div>
        <div class='postFooter'>
        </div>
        <Share :post='post'></Share>
        <Comments :comments='post.comments'></Comments>
      </div>
    </article>
    <aside class="extraAside">
      <Donations></Donations>
      <div class="blogList borderTop" v-if="posts">
        <h4 class="color">Last Posts</h4>
        <div class="listBox">
          <RouterLink v-for="post in posts" :key="post.id" :to='{ name: "post", params: { section: post.section, id: post.id }}'>
            <h5>{{ post.title }}</h5>
          </RouterLink>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
/* IMPORTS */
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import Donations from './Donations.vue';
import Comments from './Comment.vue';
import Share from './Share.vue';
import { usePostStore } from '@/stores';
import { storeToRefs } from 'pinia';

/* VARIABLES */
const postStore = usePostStore();

const { post, posts } = storeToRefs(postStore);
const headings = ref([]);

/* ACTIONS */

const getHeadings = async function() {
  await nextTick(); // wait for the DOM to update
  const entry = document.querySelector('#Entry');
  const headers = entry.querySelectorAll('h3, h4');

  let currentHeader = null;
  let currentSubHeader = null;
  const hierarchy = [];

  headers.forEach((heading) => {
    if (heading.tagName === 'H3') {
      currentHeader = {
        elementId: heading.id,
        title: heading.textContent.trim(),
        element: heading,
        children: [],
      };
      hierarchy.push(currentHeader);
      currentSubHeader = null;
    } else if (heading.tagName === 'H4') {
      currentSubHeader = {
        elementId: heading.id,
        title: heading.textContent.trim(),
        element: heading
      };
      if (currentHeader) {
        currentHeader.children.push(currentSubHeader);
      }
    }
  });

  headings.value = hierarchy;
};

/* MOUNTED */
onMounted(async () => {
  await postStore.fetchPosts();
  await getHeadings();
  const ToCAnchors = document.querySelectorAll('.navPost a');
  const options = {
    threshold: 0,
    rootMargin: '0px 0px 0px 0px'
  };
  const observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        ToCAnchors.forEach(anchor => {
          if (anchor.innerHTML === entry.target.innerHTML) {
            anchor.parentElement.classList.add('active');
          } else {
            anchor.parentElement.classList.remove('active');
          }
        })
      }
    })
  }, options);
  headings.value.forEach(header => {
    observer.observe(header.element);
    if (header.children.length) {
      header.children.forEach(children => {
        observer.observe(children.element);
      });
    }
  });
});
</script>