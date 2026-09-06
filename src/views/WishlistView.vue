<script setup>
/**
 * @component WishlistView
 * @description Displays the user's saved wishlist items in a responsive grid
 * of product cards.
 *
 * Design decisions:
 * - Uses `storeToRefs` to destructure reactive state from both the wishlist and
 *   product stores. This preserves reactivity when accessing store properties.
 * - Uses `computed` for `wishlistProducts` because it's derived from two reactive
 *   sources: the wishlist store's IDs and the product store's catalogue. Computed
 *   properties automatically update when either source changes and cache results
 *   for performance.
 * - Uses `computed` for `isEmpty` because it's derived from `wishlistProducts`.
 *   This avoids redundant template logic and makes the empty-state check reusable.
 * - Joins wishlist IDs with product data to get full product objects for rendering.
 *   This pattern keeps the wishlist store lightweight (only IDs) while allowing
 *   the view to access complete product information.
 *
 * @example
 * <!-- Used by Vue Router at /wishlist -->
 * <WishlistView />
 */
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useProductStore } from '@/stores/productStore';
import ProductCard from '@/components/ProductCard.vue';

const wishlistStore = useWishlistStore();
const productStore = useProductStore();

/**
 * Destructure reactive state from the wishlist store.
 *
 * WHY storeToRefs: Preserves reactivity when destructuring. Without it,
 * `const { wishlistIds } = wishlistStore` would give a plain Set, not a ref.
 */
const { wishlistIds, totalItems } = storeToRefs(wishlistStore);
const { clearWishlist } = wishlistStore;

/**
 * Full product objects for all wishlisted items.
 *
 * WHY computed: This is derived from two reactive sources:
 * 1. `wishlistIds` (Set of product IDs from wishlist store)
 * 2. `productStore.products` (array of all products)
 *
 * Using `computed` ensures it automatically updates when either source changes
 * (e.g., when a product is added/removed from wishlist, or when the product
 * catalogue updates). It also caches the result until dependencies change,
 * avoiding unnecessary re-computations on every render.
 *
 * If we used a `ref`, we'd need a watcher to manually sync the two sources,
 * which is verbose and error-prone.
 *
 * @type {import('vue').ComputedRef<Array<Object>>}
 */
const wishlistProducts = computed(() => {
    return productStore.products.filter(product => wishlistIds.value.has(product.id));
});

/**
 * Whether the wishlist is empty (no products saved).
 *
 * @type {import('vue').ComputedRef<boolean>}
 */
const isEmpty = computed(() => wishlistProducts.value.length === 0);
</script>

<template>
    <div class="min-h-screen bg-[#fafafa] pt-20 sm:pt-24 pb-24 sm:pb-32 text-primary font-sans antialiased">
        <div class="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
            <header class="relative mb-8 sm:mb-12 border-b border-border/60 pb-6 sm:pb-10">
                <div class="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
                    <div class="flex flex-col gap-2 sm:gap-3">
                        <div class="flex items-center gap-2">
                            <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                            </svg>
                            <span class="font-display text-[10px] sm:text-xs font-bold tracking-[0.24em] sm:tracking-[0.28em] uppercase text-secondary"> CURATED SAVED ITEMS </span>
                        </div>
                        <h1 class="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary uppercase">My Wishlist</h1>
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="text-[11px] sm:text-xs font-display tracking-widest uppercase font-bold text-primary tabular-nums">
                            {{ totalItems }} {{ totalItems === 1 ? 'ITEM' : 'ITEMS' }}
                        </span>
                        <button
                            v-if="!isEmpty"
                            @click="clearWishlist"
                            type="button"
                            class="text-[11px] font-sans font-medium text-secondary hover:text-danger transition-colors duration-200 cursor-pointer"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <div v-if="!isEmpty" class="grid grid-cols-1 gap-3.5 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <ProductCard v-for="product in wishlistProducts" :key="product.id" :product="product" />
                </div>

                <div v-else class="relative my-6 flex flex-col items-center justify-center border-y border-border/60 bg-surface/30 py-20 sm:py-28 px-4 text-center">
                    <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border/80 bg-surface text-primary shadow-xs">
                        <svg class="h-6 w-6 stroke-[1.25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                            />
                        </svg>
                    </div>

                    <h3 class="font-display text-xl sm:text-2xl font-bold tracking-tight uppercase text-primary">Your Wishlist is Empty</h3>
                    <p class="mt-2 max-w-xs sm:max-w-md font-sans text-xs sm:text-sm leading-relaxed text-secondary">
                        You have not saved any items to your wishlist yet. Explore our collection to curate your personal archive.
                    </p>

                    <router-link
                        to="/products"
                        class="group relative mt-8 inline-flex items-center gap-2.5 rounded-full border border-primary bg-primary px-6 py-2.5 font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-surface transition-all duration-300 hover:bg-transparent hover:text-primary active:scale-95 cursor-pointer"
                    >
                        <span>Explore Collection</span>
                        <svg class="h-3 w-3 stroke-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </router-link>
                </div>
            </main>
        </div>
    </div>
</template>
