<script setup>
/**
 * @component CartView
 * @description Shopping cart page displaying all cart items, shipping progress,
 * promo code input, and order summary with totals.
 *
 * Design decisions:
 * - Uses `storeToRefs` to destructure reactive state from the cart store. This
 *   preserves reactivity when accessing store properties in the template. Without
 *   `storeToRefs`, destructuring would lose reactivity (e.g., `const { items } = cartStore`
 *   would give a plain value, not a ref).
 * - Uses `ref` for promo-related state (`promoCode`, `promoApplied`, `promoDiscount`,
 *   `promoError`) because these are local to this view and not shared across components.
 *   They're set imperatively by user actions (typing, clicking Apply), not derived
 *   from other state.
 * - Uses `computed` for derived values (`shippingProgress`, `amountToFreeShipping`,
 *   `shippingFee`, `finalTotal`) because they're calculated from other reactive values.
 *   Computed properties automatically update when dependencies change and are cached
 *   for performance.
 * - The free shipping threshold is a constant because it's a business rule that
 *   doesn't change at runtime.
 *
 * @example
 * <!-- Used by Vue Router at /cart -->
 * <CartView />
 */
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useCartStore } from '@/stores/cartStore';
import CartItem from '@/components/CartItem.vue';

const cartStore = useCartStore();

/**
 * Destructure reactive state from the cart store.
 *
 * WHY storeToRefs: Pinia stores are reactive objects, but destructuring them
 * directly (e.g., `const { items } = cartStore`) loses reactivity because you're
 * extracting plain values. `storeToRefs` wraps each property in a `ref` or
 * `computed`, preserving the reactive link to the store. This allows the template
 * to access `items.value` and have it update automatically when the store changes.
 */
const { items, totalItems, totalPrice, isEmpty } = storeToRefs(cartStore);
const { clearCart } = cartStore;

/**
 * Minimum cart total to qualify for free shipping.
 *
 * @constant {number}
 */
const FREE_SHIPPING_THRESHOLD = 300;

/**
 * Progress toward free shipping as a percentage (0-100).
 *
 * WHY computed: This is derived from `totalPrice` (a reactive store value). Using
 * `computed` ensures it automatically recalculates when the cart total changes and
 * caches the result until dependencies update. A `ref` would require manual updates
 * via a watcher, which is verbose and error-prone.
 *
 * @type {import('vue').ComputedRef<number>}
 */
const shippingProgress = computed(() => {
    return Math.min(100, (totalPrice.value / FREE_SHIPPING_THRESHOLD) * 100);
});

/**
 * Remaining amount needed to reach free shipping.
 *
 * @type {import('vue').ComputedRef<number>}
 */
const amountToFreeShipping = computed(() => {
    return Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice.value);
});

/**
 * User-entered promo code (bound to the input field).
 *
 * WHY ref: This is local form state set by user input. It's not derived from
 * other reactive values, so `computed` would be inappropriate.
 *
 * @type {import('vue').Ref<string>}
 */
const promoCode = ref('');

/**
 * Whether a promo code has been successfully applied.
 *
 * @type {import('vue').Ref<boolean>}
 */
const promoApplied = ref(false);

/**
 * Discount amount from the applied promo code.
 *
 * @type {import('vue').Ref<number>}
 */
const promoDiscount = ref(0);

/**
 * Error message for invalid promo codes.
 *
 * @type {import('vue').Ref<string>}
 */
const promoError = ref('');

/**
 * Base shipping fee when free shipping is not qualified.
 *
 * WHY ref: This is a constant value in the current implementation, but using `ref`
 * allows it to be changed dynamically in the future (e.g., based on region or
 * shipping method) without refactoring the component.
 *
 * @type {import('vue').Ref<number>}
 */
const baseShippingFee = ref(20);

/**
 * Validates and applies the entered promo code.
 *
 * Currently supports a single hardcoded code: "ESSENTIALS10" (10% discount).
 *
 * @returns {void}
 */
function handleApplyPromo() {
    promoError.value = '';
    if (promoCode.value.trim().toUpperCase() === 'ESSENTIALS10') {
        promoApplied.value = true;
        promoDiscount.value = totalPrice.value * 0.1;
    } else if (promoCode.value.trim() === '') {
        promoError.value = 'Please enter a valid code.';
    } else {
        promoError.value = 'Invalid promotional code.';
    }
}

/**
 * Removes the applied promo code and resets related state.
 *
 * @returns {void}
 */
function handleRemovePromo() {
    promoApplied.value = false;
    promoDiscount.value = 0;
    promoCode.value = '';
    promoError.value = '';
}

/**
 * Actual shipping fee (0 if free shipping is qualified, otherwise base fee).
 *
 * @type {import('vue').ComputedRef<number>}
 */
const shippingFee = computed(() => {
    return amountToFreeShipping.value === 0 ? 0 : baseShippingFee.value;
});

/**
 * Final order total after shipping and promo discount.
 *
 * Uses `Math.max(0, ...)` to prevent negative totals if the discount exceeds
 * the subtotal (edge case protection).
 *
 * @type {import('vue').ComputedRef<number>}
 */
const finalTotal = computed(() => {
    return Math.max(0, totalPrice.value + shippingFee.value - promoDiscount.value);
});
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
                            <span class="font-display text-[10px] sm:text-xs font-bold tracking-[0.24em] sm:tracking-[0.28em] uppercase text-secondary"> YOUR SELECTION </span>
                        </div>
                        <h1 class="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary uppercase">Shopping Bag</h1>
                    </div>

                    <span class="text-[11px] sm:text-xs font-display tracking-widest uppercase font-bold text-primary tabular-nums"> {{ totalItems }} {{ totalItems === 1 ? 'ITEM' : 'ITEMS' }} </span>
                </div>
            </header>

            <main>
                <div v-if="!isEmpty" class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    <div class="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                        <div class="rounded-xl border border-border/80 bg-surface p-4 sm:p-5 shadow-[0_4px_20px_rgb(0,0,0,0.015)]">
                            <div class="flex items-center justify-between gap-2 text-xs font-display font-medium tracking-tight">
                                <span v-if="amountToFreeShipping > 0" class="text-primary">
                                    Add <strong class="font-bold tabular-nums">${{ amountToFreeShipping.toFixed(2) }}</strong> more for Express Delivery
                                </span>
                                <span v-else class="text-success font-semibold flex items-center gap-1.5">
                                    <svg class="h-4 w-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    Complimentary Express Delivery Unlocked
                                </span>
                                <span class="text-secondary tabular-nums text-[11px]">{{ Math.round(shippingProgress) }}%</span>
                            </div>
                            <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                                <div class="h-full bg-primary transition-all duration-500 ease-out" :style="{ width: `${shippingProgress}%` }"></div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-2">
                            <h2 class="font-display text-xs font-bold tracking-[0.2em] uppercase text-secondary">Archive Items</h2>
                            <button
                                @click="clearCart"
                                :disabled="cartStore.isBatching"
                                type="button"
                                class="text-[11px] font-sans font-medium text-secondary hover:text-danger disabled:opacity-50 transition-colors duration-200 cursor-pointer"
                            >
                                Clear All
                            </button>
                        </div>

                        <div class="flex flex-col gap-3.5">
                            <CartItem v-for="item in items" :key="item.id" :item="item" />
                        </div>
                    </div>

                    <aside class="lg:col-span-5 xl:col-span-4 sticky top-28">
                        <div class="rounded-xl border border-border/80 bg-surface p-5 sm:p-7 shadow-[0_10px_30px_rgb(0,0,0,0.02)]">
                            <h2 class="font-display text-sm font-bold tracking-[0.2em] uppercase text-primary border-b border-border/60 pb-4">Order Summary</h2>

                            <div class="mt-5 flex flex-col gap-3.5 text-xs font-sans">
                                <div class="flex justify-between items-center text-secondary">
                                    <span>Subtotal</span>
                                    <span class="font-display font-semibold text-primary tabular-nums">${{ totalPrice.toFixed(2) }}</span>
                                </div>

                                <div class="flex justify-between items-center text-secondary">
                                    <span>Estimated Shipping</span>
                                    <span class="font-display font-medium tabular-nums">
                                        <template v-if="shippingFee === 0">
                                            <span class="text-success uppercase text-[10px] tracking-wider font-bold">Free</span>
                                        </template>
                                        <template v-else> ${{ shippingFee.toFixed(2) }} </template>
                                    </span>
                                </div>

                                <div v-if="promoApplied" class="flex justify-between items-center text-success">
                                    <span class="flex items-center gap-1">
                                        <span>Promo (10% OFF)</span>
                                        <button
                                            @click="handleRemovePromo"
                                            type="button"
                                            class="inline-flex items-center justify-center text-secondary hover:text-danger transition-colors ml-1.5 p-0.5 rounded-full hover:bg-danger/10 cursor-pointer"
                                            aria-label="Remove promo code"
                                        >
                                            <svg class="h-3.5 w-3.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                    <span class="font-display font-semibold tabular-nums">-${{ promoDiscount.toFixed(2) }}</span>
                                </div>

                                <div class="pt-2">
                                    <div v-if="!promoApplied" class="flex gap-2">
                                        <input
                                            v-model.trim="promoCode"
                                            @input="promoError = ''"
                                            type="text"
                                            placeholder="PROMO CODE (ESSENTIALS10)"
                                            class="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-[11px] font-sans uppercase placeholder:normal-case placeholder:text-secondary/50 focus:border-primary focus:outline-none transition-colors"
                                        />
                                        <button
                                            @click="handleApplyPromo"
                                            type="button"
                                            class="rounded-lg border border-primary bg-primary px-3.5 py-2 text-[10px] font-display font-bold tracking-wider uppercase text-surface hover:bg-primary-hover transition-colors cursor-pointer"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    <p v-if="promoError" class="mt-1.5 text-[10px] text-danger">{{ promoError }}</p>
                                </div>

                                <div class="my-2 border-t border-border/60"></div>

                                <div class="flex justify-between items-end pt-1">
                                    <div class="flex flex-col">
                                        <span class="font-display text-xs font-bold tracking-wider uppercase text-primary">Total</span>
                                        <span class="text-[10px] text-secondary">Taxes included</span>
                                    </div>
                                    <span class="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-primary tabular-nums"> ${{ finalTotal.toFixed(2) }} </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                class="group relative mt-6 flex w-full items-center justify-center gap-2.5 rounded-full border border-primary bg-primary px-6 py-3.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-surface transition-all duration-300 hover:bg-transparent hover:text-primary active:scale-[0.98] cursor-pointer"
                            >
                                <span>Proceed to Checkout</span>
                                <svg class="h-3.5 w-3.5 stroke-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>

                            <div class="mt-6 grid grid-cols-3 gap-2 border-t border-border/40 pt-5 text-center">
                                <div class="flex flex-col items-center gap-1">
                                    <svg class="h-4 w-4 text-secondary stroke-[1.25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z"
                                        />
                                    </svg>
                                    <span class="text-[9px] font-sans font-medium uppercase tracking-wider text-secondary">Encrypted</span>
                                </div>

                                <div class="flex flex-col items-center gap-1">
                                    <svg class="h-4 w-4 text-secondary stroke-[1.25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0C2.678 5.572 2.25 6.05 2.25 6.618v12.23"
                                        />
                                    </svg>
                                    <span class="text-[9px] font-sans font-medium uppercase tracking-wider text-secondary">Express</span>
                                </div>

                                <div class="flex flex-col items-center gap-1">
                                    <svg class="h-4 w-4 text-secondary stroke-[1.25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                        />
                                    </svg>
                                    <span class="text-[9px] font-sans font-medium uppercase tracking-wider text-secondary">30-Day Return</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                <div v-else class="relative my-6 flex flex-col items-center justify-center border-y border-border/60 bg-surface/30 py-20 sm:py-28 px-4 text-center">
                    <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border/80 bg-surface text-primary shadow-xs">
                        <svg class="h-6 w-6 stroke-[1.25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                            />
                        </svg>
                    </div>

                    <h3 class="font-display text-xl sm:text-2xl font-bold tracking-tight uppercase text-primary">Your Bag is Empty</h3>
                    <p class="mt-2 max-w-xs sm:max-w-md font-sans text-xs sm:text-sm leading-relaxed text-secondary">
                        You have not selected any items from our archive yet. Discover our curated essentials to build your collection.
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
