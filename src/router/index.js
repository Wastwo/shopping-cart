import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'products',
            component: () => import('../views/ProductListView.vue')
        },
        {
            path: '/cart',
            name: 'cart',
            component: () => import('../views/CartView.vue')
        },
         {
            path: '/wishlist',
            name: 'wishlist',
            component: () => import('../views/WishlistView.vue')
        },
    ],
})

export default router
