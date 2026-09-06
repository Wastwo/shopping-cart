<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { RouterLink } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';

const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
</script>

<template>
    <header class="fixed top-0 inset-x-0 z-40 border-b border-border/60 bg-surface/75 py-2.5 sm:py-3 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div class="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between gap-2">
                <RouterLink
                    to="/products"
                    class="font-display text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.2em] sm:tracking-[0.28em] truncate uppercase text-primary transition-colors duration-300 hover:text-secondary shrink-0"
                >
                    ESSENTIALS
                </RouterLink>

                <nav class="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
                    <RouterLink
                        to="/products"
                        class="group relative inline-flex items-center justify-center rounded-full px-2.5 sm:px-3.5 md:px-4 py-1.5 font-sans text-[10px] sm:text-[11px] font-medium tracking-[0.14em] sm:tracking-[0.18em] uppercase text-secondary transition-all duration-300 hover:text-primary active:scale-95"
                        active-class="!text-primary font-semibold"
                    >
                        <span>Products</span>
                        <span class="absolute inset-0 -z-10 rounded-full bg-surface-muted/0 transition-colors duration-300 group-hover:bg-surface-muted"></span>
                    </RouterLink>

                    <span class="h-3.5 w-px bg-border/60 mx-0.5"></span>

                    <RouterLink
                        to="/wishlist"
                        aria-label="Wishlist"
                        class="group relative flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/60 bg-surface/50 px-2.5 sm:px-3.5 py-1.5 transition-all duration-300 hover:border-border hover:bg-surface hover:shadow-xs active:scale-95"
                        active-class="!border-primary !bg-surface text-primary"
                    >
                        <svg class="h-3.5 w-3.5 text-primary stroke-[1.5] transition-transform duration-300 group-hover:scale-110 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                            />
                        </svg>

                        <span class="hidden md:inline font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-secondary group-hover:text-primary transition-colors"> Wishlist </span>

                        <Transition
                            enter-active-class="transition duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                            enter-from-class="scale-0 opacity-0"
                            enter-to-class="scale-100 opacity-100"
                            leave-active-class="transition duration-200 ease-in"
                            leave-from-class="scale-100 opacity-100"
                            leave-to-class="scale-0 opacity-0"
                        >
                            <span
                                v-if="wishlistStore?.totalItems > 0"
                                class="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 flex h-3.5 min-w-3.5 sm:h-4 sm:min-w-4 items-center justify-center rounded-full bg-danger px-1 font-display text-[8px] sm:text-[9px] font-bold text-surface tabular-nums shadow-xs ring-2 ring-surface"
                            >
                                {{ wishlistStore.totalItems }}
                            </span>
                        </Transition>
                    </RouterLink>

                    <RouterLink
                        to="/cart"
                        aria-label="Cart"
                        class="group relative flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/60 bg-surface/50 px-2.5 sm:px-3.5 py-1.5 transition-all duration-300 hover:border-border hover:bg-surface hover:shadow-xs active:scale-95"
                        active-class="!border-primary !bg-surface text-primary"
                    >
                        <svg class="h-3.5 w-3.5 text-primary stroke-[1.5] transition-transform duration-300 group-hover:scale-110 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                            />
                        </svg>

                        <span class="hidden md:inline font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-secondary group-hover:text-primary transition-colors"> Cart </span>

                        <Transition
                            enter-active-class="transition duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                            enter-from-class="scale-0 opacity-0"
                            enter-to-class="scale-100 opacity-100"
                            leave-active-class="transition duration-200 ease-in"
                            leave-from-class="scale-100 opacity-100"
                            leave-to-class="scale-0 opacity-0"
                        >
                            <span
                                v-if="cartStore?.totalItems > 0"
                                class="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 flex h-3.5 min-w-3.5 sm:h-4 sm:min-w-4 items-center justify-center rounded-full bg-danger px-1 font-display text-[8px] sm:text-[9px] font-bold text-surface tabular-nums shadow-xs ring-2 ring-surface"
                            >
                                {{ cartStore.totalItems }}
                            </span>
                        </Transition>
                    </RouterLink>
                </nav>
            </div>
        </div>
    </header>
</template>
