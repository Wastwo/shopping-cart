<script setup>
import { computed } from 'vue';
import { useProductStore } from '@/stores/productStore.js';
import ProductCard from '@/components/ProductCard.vue';
import { storeToRefs } from 'pinia';

const productStore = useProductStore();
const { products, rawSearchQuery, selectedCategory, sortBy, categories, filteredProducts } = storeToRefs(productStore);
const { resetFilters } = productStore;

const categoryOptions = computed(() => {
    return ['all', ...categories.value];
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

                            <span class="font-display text-[10px] sm:text-xs font-bold tracking-[0.24em] sm:tracking-[0.28em] uppercase text-secondary"> ESSENTIALS SELECTION </span>
                        </div>
                        <h1 class="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary uppercase">All Products</h1>
                    </div>

                    <span class="text-[11px] sm:text-xs font-display tracking-widest uppercase font-bold text-primary tabular-nums">{{ filteredProducts.length }} / {{ products.length }}</span>
                </div>
            </header>

            <section class="relative mb-8 sm:mb-10 rounded-xl border border-border/80 bg-surface p-2.5 sm:p-3.5 shadow-[0_4px_20px_rgb(0,0,0,0.015)]">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none -mx-1 px-1">
                        <button
                            v-for="cat in categoryOptions"
                            :key="cat"
                            @click="selectedCategory = cat"
                            class="shrink-0 rounded-full px-3 sm:px-3.5 py-1.5 font-sans text-[10px] sm:text-[11px] font-medium tracking-wider uppercase transition-colors duration-200 cursor-pointer"
                            :class="[selectedCategory === cat ? 'bg-primary text-surface' : 'bg-transparent text-secondary hover:bg-surface-muted hover:text-primary']"
                        >
                            {{ cat }}
                        </button>
                    </div>

                    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
                        <div class="relative flex-1 sm:w-60">
                            <input
                                v-model.trim="rawSearchQuery"
                                type="text"
                                placeholder="Search items..."
                                class="w-full rounded-full border border-border bg-surface py-1.5 pl-9 pr-9 text-xs font-sans text-primary placeholder:text-secondary/60 focus:border-primary focus:outline-none transition-colors"
                            />

                            <svg class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>

                            <button
                                v-if="rawSearchQuery"
                                @click="rawSearchQuery = ''"
                                type="button"
                                aria-label="Clear search"
                                class="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full text-secondary hover:bg-surface-muted hover:text-primary transition-colors cursor-pointer"
                            >
                                <svg class="h-3 w-3 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div class="relative shrink-0">
                            <select
                                v-model="sortBy"
                                class="w-full sm:w-auto appearance-none rounded-full border border-border bg-surface py-1.5 pl-3.5 pr-8 text-xs font-sans font-medium tracking-wide uppercase text-primary focus:border-primary focus:outline-none transition-colors cursor-pointer"
                            >
                                <option value="default">Sort: Default</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name: A-Z</option>
                            </select>
                            <svg class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            <main>
                <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 gap-3.5 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
                </div>

                <div v-else class="relative my-6 flex flex-col items-center justify-center border-y border-border/60 bg-surface/30 py-20 sm:py-28 px-4 text-center">
                    <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-border/80 bg-surface text-primary shadow-xs">
                        <svg class="h-5 w-5 stroke-[1.25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>

                    <h3 class="font-display text-xl sm:text-2xl font-bold tracking-tight uppercase text-primary">No Matching Essentials</h3>
                    <p class="mt-2 max-w-xs sm:max-w-md font-sans text-xs sm:text-sm leading-relaxed text-secondary">
                        Your current search or category filter yielded zero results in our archive. Adjust your keywords or view the full collection.
                    </p>

                    <button
                        @click="resetFilters"
                        class="group relative mt-8 inline-flex items-center gap-2.5 rounded-full border border-primary bg-primary px-6 py-2.5 font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-surface transition-all duration-300 hover:bg-transparent hover:text-primary active:scale-95 cursor-pointer"
                    >
                        <span>Reset All Filters</span>
                        <svg class="h-3 w-3 stroke-2 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
    display: none;
}
.scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
