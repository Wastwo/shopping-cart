/**
 * @module productStore
 * @description Pinia store managing the product catalogue, including product
 * lookup, category filtering, text search with debounce, and sort options.
 *
 * Products are stored in a `Map<number, Product>` keyed by ID for O(1) lookups.
 * A derived `products` computed property exposes them as an array for iteration.
 *
 * Search debounce: `rawSearchQuery` is the live-bound input value; it is
 * debounced (500 ms) into `activeSearchQuery` which drives the actual filtering.
 * Category and sort changes bypass the debounce and apply immediately, since
 * they are discrete selector changes rather than free-text typing.
 */
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

/**
 * @typedef {Object} Product
 * @property {number} id - Unique product identifier.
 * @property {string} name - Display name.
 * @property {number} price - Unit price in currency.
 * @property {string} image - URL of the product image.
 * @property {string} description - Short product description.
 * @property {string} category - Category slug (e.g., 'electronics', 'accessories').
 * @property {Object} details - Additional key-value product attributes.
 */

/**
 * Pinia composition-API store for the product catalogue.
 *
 * @returns {{
 *   products: import('vue').ComputedRef<Product[]>,
 *   categories: import('vue').ComputedRef<string[]>,
 *   filteredProducts: import('vue').ComputedRef<Product[]>,
 *   rawSearchQuery: import('vue').Ref<string>,
 *   selectedCategory: import('vue').Ref<string>,
 *   sortBy: import('vue').Ref<string>,
 *   getProductById: function,
 *   getProductsByCategory: function,
 *   resetFilters: function
 * }}
 */
export const useProductStore = defineStore('product', () => {
    /**
     * Internal product catalogue stored as a Map for O(1) ID-based lookups.
     *
     * Keys are product IDs (number), values are {@link Product} objects.
     * Pre-populated with the seed catalogue at store creation.
     *
     * @type {import('vue').Ref<Map<number, Product>>}
     */
    const productMap = ref(new Map([
        [1, {
            id: 1,
            name: 'Studio Wireless Headphones',
            price: 249.00,
            image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
            description: 'Over-ear headphones featuring active noise cancellation and refined acoustics.',
            category: 'electronics',
            details: { color: 'Matte Black', weight: '250g' }
        }],
        [2, {
            id: 2,
            name: 'Precision Line Follower Kit',
            price: 89.00,
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
            description: 'Autonomous robotics kit equipped with high-sensitivity IR array sensors.',
            category: 'electronics',
            details: { color: 'Matte White', sensors: '8-Channel IR' }
        }],
        [3, {
            id: 3,
            name: 'Minimalist Canvas Backpack',
            price: 115.00,
            image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
            description: 'Water-resistant daily carry with an integrated 16-inch laptop compartment.',
            category: 'accessories',
            details: { color: 'Charcoal Gray', capacity: '22L' }
        }],
        [4, {
            id: 4,
            name: 'Custom Mechanical Keyboard',
            price: 165.00,
            image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
            description: 'Anodized aluminum chassis fitted with custom tactile silent switches.',
            category: 'electronics',
            details: { color: 'Off-White', switches: 'Tactile Silent' }
        }],
        [5, {
            id: 5,
            name: 'Matte Polycarbonate Case',
            price: 35.00,
            image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
            description: 'Ultra-slim MagSafe protection with anti-scratch translucent coating.',
            category: 'accessories',
            details: { color: 'Clear Matte', material: 'Polycarbonate' }
        }],
        [6, {
            id: 6,
            name: 'Machined Aluminum Laptop Stand',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
            description: 'Ergonomic desktop riser crafted from premium aircraft-grade aluminum.',
            category: 'accessories',
            details: { color: 'Space Gray', material: 'Aluminum' }
        }]
    ]))

    /**
     * All products as an array, derived from the internal Map.
     *
     * @type {import('vue').ComputedRef<Product[]>}
     */
    const products = computed(() => Array.from(productMap.value.values()))

    /**
     * Live search input value bound directly to the search `<input>`.
     *
     * Changes to this ref are debounced (500 ms) before being copied into
     * {@link activeSearchQuery}, which drives the actual filtering logic.
     *
     * @type {import('vue').Ref<string>}
     */
    const rawSearchQuery = ref('')

    /**
     * Currently selected category filter.
     *
     * `'all'` means no category filter is applied. Any other value is matched
     * case-insensitively against each product's `category` field.
     *
     * @type {import('vue').Ref<string>}
     */
    const selectedCategory = ref('all')

    /**
     * Current sort strategy for filtered results.
     *
     * Supported values:
     * - `'default'` — no sorting (original catalogue order)
     * - `'price-low'` — ascending by price
     * - `'price-high'` — descending by price
     * - `'name'` — alphabetical by name (locale-aware)
     *
     * @type {import('vue').Ref<string>}
     */
    const sortBy = ref('default')

    /**
     * Debounced search query that drives product filtering.
     *
     * Updated 500 ms after the user stops typing in the search input.
     * Category and sort changes bypass this and apply immediately.
     *
     * @type {import('vue').Ref<string>}
     */
    const activeSearchQuery = ref('')

    /**
     * Timer handle for the search debounce.
     *
     * Stored outside Vue reactivity (plain `let`) because it is an
     * implementation detail that should not trigger re-renders.
     *
     * @type {ReturnType<typeof setTimeout>|null}
     */
    let debounceTimer = null

    /**
     * Retrieves a single product by its unique ID.
     *
     * Performs an O(1) Map lookup. Returns `undefined` if no product matches.
     *
     * @param {number} id - The unique product identifier.
     * @returns {Product|undefined} The matching product, or `undefined` if not found.
     *
     * @example
     * const product = productStore.getProductById(1)
     * // => { id: 1, name: 'Studio Wireless Headphones', ... }
     */
    function getProductById(id) {
        return productMap.value.get(id)
    }

    /**
     * All unique product categories, derived from the catalogue.
     *
     * Uses a `Set` internally to deduplicate. Order follows first occurrence
     * in the product Map.
     *
     * @type {import('vue').ComputedRef<string[]>}
     */
    const categories = computed(() => {
        const categorySet = new Set()
        productMap.value.forEach((product) => categorySet.add(product.category))
        return Array.from(categorySet)
    })

    /**
     * Returns all products belonging to a given category (case-insensitive).
     *
     * @param {string} category - The category slug to filter by.
     * @returns {Product[]} Array of products in the specified category.
     *   Returns an empty array if no products match.
     *
     * @example
     * productStore.getProductsByCategory('electronics')
     * // => [{ id: 1, ... }, { id: 2, ... }, { id: 4, ... }]
     */
    function getProductsByCategory(category) {
        return products.value.filter((product) => product.category?.toLowerCase() === category.toLowerCase())
    }

    /**
     * Filtered and sorted product list based on current search, category, and
     * sort selections.
     *
     * Applies filters in order: category → search text → sort.
     * Search matches against both `name` and `description` (case-insensitive).
     *
     * @type {import('vue').ComputedRef<Product[]>}
     *
     * @example
     * productStore.selectedCategory = 'electronics'
     * productStore.sortBy = 'price-low'
     * productStore.filteredProducts
     * // => products sorted by ascending price, electronics only
     */
    const filteredProducts = computed(() => {
        let result = [...products.value]

        if (selectedCategory.value !== 'all') {
            result = getProductsByCategory(selectedCategory.value)
        }

        if (activeSearchQuery.value.trim() !== '') {
            const query = activeSearchQuery.value.toLowerCase().trim();
            result = result.filter((product) => product.name.toLowerCase().includes(query) || (product.description.toLowerCase().includes(query)))
        }

        switch (sortBy.value) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }
        return result
    })

    /**
     * Resets all filter state (search, category, sort) to their defaults.
     *
     * Clears both `rawSearchQuery` and `activeSearchQuery` to ensure the
     * debounced value is also reset immediately (no stale debounce pending).
     *
     * @returns {void}
     *
     * @example
     * productStore.resetFilters()
     */
    function resetFilters() {
        rawSearchQuery.value = ''
        activeSearchQuery.value = '';
        selectedCategory.value = 'all';
        sortBy.value = 'default';
    }

    // Debounce watcher: only the search query is debounced (500 ms).
    // Category and sort changes are applied immediately by checking whether
    // the search value actually changed vs. category/sort.
    watch([rawSearchQuery, selectedCategory, sortBy], ([newSearch], [oldSearch]) => {
        clearTimeout(debounceTimer)

        if (newSearch !== oldSearch) {
            // Search text changed — debounce to avoid filtering on every keystroke.
            debounceTimer = setTimeout(() => {
                activeSearchQuery.value = newSearch
            }, 500)
        } else {
            // Category or sort changed — apply immediately, no debounce.
            activeSearchQuery.value = newSearch
        }
    })

    return {
        products,
        categories,
        filteredProducts,
        rawSearchQuery,
        selectedCategory,
        sortBy,
        getProductById,
        getProductsByCategory,
        resetFilters,
    }
})
