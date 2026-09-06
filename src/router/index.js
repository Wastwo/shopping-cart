import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/products'
        },
        {
            path: '/products',
            name: 'products',
            component: () => import('../views/ProductListView.vue'),
            meta: {
                title: 'All Products'
            }
        },
        {
            path: '/cart',
            name: 'cart',
            component: () => import('../views/CartView.vue'),
            meta: {
                title: 'Shopping Bag'
            }
        },
        {
            path: '/wishlist',
            name: 'wishlist',
            component: () => import('../views/WishlistView.vue'),
            meta: {
                title: 'My Wishlist'
            }
        },
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0 };
    }
})

router.afterEach((to) => {
    const baseTitle = 'Essentials';
    const pageTitle = to.meta.title;
    document.title = pageTitle ? `${pageTitle} — ${baseTitle}` : baseTitle;
})

export default router
