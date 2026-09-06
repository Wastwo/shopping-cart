<script setup>
/**
 * @component ProductCard
 * @description Displays a product in a card layout with image, name, description,
 * price, wishlist toggle, and add-to-cart button.
 *
 * Design decisions:
 * - Uses `ref` for `addedFeedback` because it's a temporary UI state (1.5s timeout)
 *   that's set imperatively. It's not derived from other state, so `computed` would
 *   be inappropriate. A `ref` allows simple boolean toggling with `setTimeout`.
 * - Uses `computed` for `isInWishlist` because it's derived from the wishlist store's
 *   state. The value automatically updates when the store changes, eliminating the
 *   need for manual synchronization or watchers.
 * - The 1.5s feedback timeout provides visual confirmation without blocking the UI.
 *   Using `setTimeout` instead of a reactive timer keeps the logic simple and avoids
 *   unnecessary re-renders.
 * - Props are validated to ensure required fields (id, name, price) are present.
 *
 * @example
 * <ProductCard :product="{ id: 1, name: 'Headphones', price: 249 }" />
 */
import { ref, computed } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';

/**
 * Component props.
 *
 * @property {Object} product - The product to display.
 * @property {number} product.id - Unique product identifier.
 * @property {string} product.name - Product display name.
 * @property {number} product.price - Product price.
 * @property {string} [product.image] - Optional product image URL.
 * @property {string} [product.description] - Optional product description.
 * @property {string} [product.badge] - Optional badge text (e.g., "NEW", "SALE").
 */
const props = defineProps({
    product: {
        type: Object,
        required: true,
        validator: value => {
            return value.id && value.name && value.price;
        },
    },
});

/**
 * Component events.
 *
 * @event add-to-cart Emitted when the product is added to the cart.
 * @event add-to-cart.payload {Object} - Contains product identification.
 * @event add-to-cart.payload.id {number} - Product ID.
 * @event add-to-cart.payload.name {string} - Product name.
 *
 * @event toggle-wishlist Emitted when the wishlist status is toggled.
 * @event toggle-wishlist.productId {number} - Product ID being toggled.
 */
const emit = defineEmits({
    'add-to-cart': payload => {
        if (payload && typeof payload.id === 'number') {
            return true;
        }
        return false;
    },
    'toggle-wishlist': productId => {
        return typeof productId === 'number';
    },
});

const cart = useCartStore();
const wishlist = useWishlistStore();

/**
 * Temporary UI state for the "Added to cart" feedback animation.
 *
 * WHY ref over computed: This is imperative state set by a user action (click)
 * and cleared by a timer. It's not derived from any reactive source. Using
 * `computed` would require a writable computed with a setter, which is overkill
 * for a simple boolean flag. The 1.5s timeout provides visual confirmation without
 * blocking the UI or requiring complex state management.
 *
 * @type {import('vue').Ref<boolean>}
 */
const addedFeedback = ref(false);

/**
 * Whether the product is currently in the wishlist.
 *
 * WHY computed over ref: This value is derived from the wishlist store's state.
 * Using `computed` ensures it automatically updates when the store changes (e.g.,
 * when the user toggles the wishlist from another component). If we used a `ref`,
 * we'd need to manually sync it with a watcher or re-compute it on every store
 * change, which is error-prone and verbose.
 *
 * @type {import('vue').ComputedRef<boolean>}
 */
const isInWishlist = computed(() => wishlist.isInWishlist(props.product.id));

/**
 * Adds the product to the cart and shows a 1.5s confirmation animation.
 *
 * @returns {void}
 */
function handleAddToCart() {
    cart.addItem(props.product);
    emit('add-to-cart', { id: props.product.id, name: props.product.name });

    addedFeedback.value = true;
    setTimeout(() => {
        addedFeedback.value = false;
    }, 1500);
}

/**
 * Toggles the product's wishlist status.
 *
 * @returns {void}
 */
function handleToggleWishlist() {
    wishlist.toggleWishlist(props.product.id);
    emit('toggle-wishlist', props.product.id);
}
</script>

<template>
    <div
        class="group relative flex w-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-border-hover hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07)]"
    >
        <div class="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-surface-muted">
            <slot name="image" :product="product">
                <img
                    v-if="product.image"
                    :src="product.image"
                    :alt="product.name"
                    class="h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-secondary">
                    <svg class="h-6 w-6 stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                    </svg>
                </div>
            </slot>

            <slot name="badge" :product="product">
                <span
                    v-if="product.badge"
                    class="absolute left-2 top-2 sm:left-3 sm:top-3 z-10 inline-block rounded-full bg-primary/90 px-2 py-0.5 text-[8px] sm:text-[9px] font-sans font-medium tracking-widest text-surface uppercase backdrop-blur-sm transition-transform duration-300 group-hover:scale-105"
                >
                    {{ product.badge }}
                </span>
            </slot>

            <button
                @click="handleToggleWishlist"
                :aria-label="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
                class="absolute right-2 top-2 sm:right-3 sm:top-3 z-10 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-surface/80 text-primary shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-surface hover:scale-110 active:scale-90 group-hover:shadow-md cursor-pointer"
                :class="{ 'bg-surface! text-danger!': isInWishlist }"
            >
                <svg
                    class="h-3 w-3 sm:h-4 sm:w-4 transition-all duration-300 stroke-[1.5]"
                    :class="{ 'fill-danger stroke-danger scale-110': isInWishlist }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                    />
                </svg>
            </button>
        </div>

        <div class="flex flex-1 flex-col justify-between p-3 sm:p-4 min-w-0">
            <slot name="description" :product="product">
                <div class="min-w-0">
                    <h3
                        :title="product.name"
                        class="line-clamp-2 font-display text-xs sm:text-sm font-semibold leading-snug tracking-tight text-primary transition-colors duration-300 group-hover:text-secondary wrap-break-word"
                    >
                        {{ product.name }}
                    </h3>

                    <p v-if="product.description" :title="product.description" class="mt-1 line-clamp-2 font-sans text-[11px] sm:text-xs leading-relaxed text-secondary wrap-break-word">
                        {{ product.description }}
                    </p>
                </div>
            </slot>

            <div class="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border/30">
                <slot name="price" :product="product">
                    <div class="min-w-0 flex-1">
                        <span class="block font-display text-xs sm:text-sm font-bold tracking-tight text-primary tabular-nums truncate"> ${{ product.price.toFixed(2) }} </span>
                    </div>
                </slot>

                <slot name="actions" :product="product" :added-feedback="addedFeedback" :handle-add-to-cart="handleAddToCart">
                    <button
                        @click="handleAddToCart"
                        :disabled="addedFeedback || cart.isBatching"
                        class="shrink-0 inline-flex h-7 sm:h-8 items-center justify-center gap-1 sm:gap-1.5 rounded-full bg-primary px-2.5 sm:px-3.5 text-[10px] sm:text-xs font-medium font-sans text-surface shadow-xs transition-all duration-300 hover:bg-primary-hover hover:shadow-md active:scale-95 disabled:bg-success disabled:opacity-100 disabled:cursor-default cursor-pointer"
                        :aria-label="addedFeedback ? 'Added to cart' : 'Add to cart'"
                    >
                        <template v-if="!addedFeedback">
                            <span class="hidden leading-none sm:inline">Add</span>
                            <svg class="h-3.5 w-3.5 shrink-0 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </template>

                        <template v-else>
                            <span class="hidden leading-none sm:inline">Added</span>
                            <svg class="h-3.5 w-3.5 shrink-0 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </template>
                    </button>
                </slot>
            </div>
        </div>
    </div>
</template>
