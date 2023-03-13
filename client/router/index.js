import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore, useTagStore } from '@/stores';
import Home from '../views/Home.vue';
import PostSection from '../views/PostSection.vue';
import PostView from '../views/PostView.vue';
import TagList from '../views/TagList.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { selector: to.hash }
    } else if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 }
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path:'/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue')
    },
    {
      path:'/register',
      name: 'register',
      component: () => import(/* webpackChunkName: "register" */ '../views/Register.vue')
    },
    {
      path: '/:pathMatch(.*)',
      name: 'notFound',
      component: () => import(/* webpackChunkName: "notfound" */ '../views/NotFound.vue')
    },
    {
      path: '/401',
      name: 'unauthorized',
      component: () => import(/* webpackChunkName: "unauthorized" */ '../views/Unauthorized.vue')
    },
    {
      path: '/posts/create',
      name: 'postCreate',
      component: () => import(/* webpackChunkName: "postcreate" */ '../views/Create.vue'),
      beforeEnter(to, from, next) {
        const userStore = useUserStore();

        if (!userStore.isAuth) {
          userStore.returnUrl = to.fullPath;
          userStore.user ? next({ name: 'unauthorized' }) : next({ name: 'login' });
        } else {
          next();
        }
      }
    },
    {
      path: '/posts/:section',
      name: 'postSection',
      component: PostSection,
    },
    {
      path: '/posts/:section/:id',
      name: 'post',
      component: PostView,
    },
    {
      path: '/posts/:section/:id/edit',
      name: 'postEdit',
      component: () => import(/* webpackChunkName: "postedit" */ '../views/PostEdit.vue'),
      beforeEnter(to, from, next) {
        const userStore = useUserStore();

        if (!userStore.isAuth) {
          userStore.returnUrl = to.fullPath;
          userStore.user ? next({ name: 'unauthorized' }) : next({ name: 'login' });
        } else {
          next();
        }
      }
    },
    {
      path: '/tags/:tag',
      name: 'tagList',
      component: TagList,
      async beforeEnter(to, from, next) {
        const tagStore = useTagStore();

        const tag = await tagStore.fetchTag(to.params.tag);

        if (!tag) {
          next({ name: 'home' });
        } else {
          next();
        }
      }
    },
    {
      path: '/books',
      name: 'books',
      component: () => import(/* webpackChunkName: "books" */ '../views/Books.vue')
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import(/* webpackChunkName: "projects" */ '../views/Projects.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    },
    {
      path: '/privacyPolicy',
      name: 'privacyPolicy',
      component: () => import(/* webpackChunkName: "privacypolicy" */ '../views/PrivacyPolicy.vue')
    },
    {
      path: '/:catchAll(.*)',
      redirect: { name: 'notFound' }
    }
  ],
});

export default router;
