/**
 * @module cartStore
 * @description Pinia store managing the shopping cart state, including item
 * tracking, quantity management, price computation, and localStorage persistence.
 *
 * Persistence is delegated to {@link module:useCartPersistence} which handles
 * debounced writes, cross-tab synchronisation via the `storage` event, schema
 * migration, and deep-equality guards to avoid redundant writes.
 *
 * Vue reactivity edge-case: all mutations use `structuredClone(toRaw(...))` to
 * produce plain-object snapshots before reassignment. This ensures Vue's
 * reactivity system detects the change (new reference) while preventing proxy
 * objects from leaking into persisted data or triggering unintended watchers.
 */
import { defineStore } from "pinia";
import { ref, computed, toRaw } from "vue";
import { useCartPersistence } from "@/composables/useCartPersistence";

/**
 * Pinia composition-API store for the shopping cart.
 *
 * @returns {{
 *   items: import('vue').Ref<Array<Object>>,
 *   totalItems: import('vue').ComputedRef<number>,
 *   totalPrice: import('vue').ComputedRef<number>,
 *   isEmpty: import('vue').ComputedRef<boolean>,
 *   isBatching: import('vue').Ref<boolean>,
 *   addItem: function,
 *   removeItem: function,
 *   updateQuantity: function,
 *   clearCart: function,
 *   batchUpdate: function
 * }}
 */
export const useCartStore = defineStore('cart', () => {
    /**
     * Reactive array of cart line-items.
     *
     * Each item is a plain object shaped as:
     * ```
     * { id: number, name: string, price: number, quantity: number, ... }
     * ```
     *
     * Initialised from localStorage via {@link useCartPersistence.restore} so
     * the cart survives page reloads.
     *
     * @type {import('vue').Ref<Array<Object>>}
     */
    const items = ref([])

    /**
     * Flag indicating whether a {@link batchUpdate} operation is in progress.
     *
     * While `true`, the persistence watcher is suspended (debounced writes are
     * cancelled) and a single `persist()` call is issued after the batch
     * callback completes. This prevents N localStorage writes for N mutations
     * inside the batch.
     *
     * @type {import('vue').Ref<boolean>}
     */
    const isBatching = ref(false)

    const { persist, restore, clear, debouncedPersist } = useCartPersistence(items, {
        debounceMs: 300,
        crossTabSync: true
    })

    // Hydrate cart from localStorage on store initialisation.
    // migrateData inside restore() handles schema upgrades and validation.
    items.value = restore()

    /**
     * Total number of individual items in the cart (sum of all quantities).
     *
     * @type {import('vue').ComputedRef<number>}
     *
     * @example
     * // Cart: [{ quantity: 2 }, { quantity: 3 }]
     * cartStore.totalItems // => 5
     */
    const totalItems = computed(() => {
        return items.value.reduce((sum, item) => sum + item.quantity, 0)
    })

    /**
     * Total monetary value of the cart (sum of price * quantity for each item).
     *
     * @type {import('vue').ComputedRef<number>}
     *
     * @example
     * // Cart: [{ price: 10, quantity: 2 }, { price: 5, quantity: 3 }]
     * cartStore.totalPrice // => 35
     */
    const totalPrice = computed(() => {
        return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })

    /**
     * Whether the cart contains zero items.
     *
     * @type {import('vue').ComputedRef<boolean>}
     */
    const isEmpty = computed(() => {
        return items.value.length === 0
    })

    /**
     * Adds a product to the cart or increments its quantity if it already exists.
     *
     * Uses `structuredClone(toRaw(product))` to store a plain-object copy,
     * preventing Vue reactive proxies from being persisted to localStorage.
     *
     * @param {Object} product - The product to add. Must contain at least
     *   `id`, `name`, and `price` properties.
     * @param {number} product.id - Unique product identifier.
     * @param {string} product.name - Display name of the product.
     * @param {number} product.price - Unit price of the product.
     * @returns {void}
     *
     * @example
     * cartStore.addItem({ id: 1, name: 'Headphones', price: 249 })
     */
    function addItem(product) {
        const clonedProduct = structuredClone(toRaw(product))
        const existingIndex = items.value.findIndex((item) => item.id === product.id)

        if (existingIndex !== -1) {
            // Edge case: item already in cart — increment quantity.
            // Clone the array to trigger Vue reactivity (ref reassignment).
            const updatedItems = structuredClone(toRaw(items.value))
            updatedItems[existingIndex].quantity++
            items.value = updatedItems
        } else {
            // New item — append with quantity 1.
            items.value = [...toRaw(items.value), { ...clonedProduct, quantity: 1 }]
        }
    }

    /**
     * Removes an item from the cart by its product ID.
     *
     * If the ID is not found, the cart remains unchanged (no error thrown).
     *
     * @param {number} productId - The unique ID of the product to remove.
     * @returns {void}
     *
     * @example
     * cartStore.removeItem(1)
     */
    function removeItem(productId) {
        items.value = structuredClone(toRaw(items.value)).filter((item) => item.id !== productId)
    }

    /**
     * Sets the quantity for a specific cart item.
     *
     * Edge-case: if `quantity <= 0`, the item is removed entirely (delegates
     * to {@link removeItem}) rather than storing a zero/negative quantity.
     *
     * @param {number} productId - The unique ID of the product to update.
     * @param {number} quantity - The new quantity value. Must be a positive
     *   integer; values <= 0 trigger item removal.
     * @returns {void}
     *
     * @example
     * cartStore.updateQuantity(1, 5) // set quantity to 5
     * cartStore.updateQuantity(1, 0) // removes item with id 1
     */
    function updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            removeItem(productId)
            return
        }

        items.value = toRaw(items.value).map(item => item.id === productId
            ? { ...structuredClone(toRaw(item)), quantity }
            : item
        )
    }

    /**
     * Empties the cart and removes persisted data from localStorage.
     *
     * Calls {@link useCartPersistence.clear} to remove the storage entry and
     * reset the internal last-persisted-state cache.
     *
     * @returns {void}
     *
     * @example
     * cartStore.clearCart()
     */
    function clearCart() {
        items.value = []
        clear()
    }

    /**
     * Executes multiple cart mutations as a single atomic batch.
     *
     * Suspends debounced persistence during execution, then performs a single
     * immediate `persist()` after the callback completes. This avoids writing
     * to localStorage once per mutation inside the batch.
     *
     * Uses a try/finally block to guarantee `isBatching` is reset and
     * persistence fires even if the callback throws.
     *
     * @param {Function} callback - Synchronous function containing one or more
     *   cart mutations (e.g., addItem, removeItem, updateQuantity).
     * @returns {void}
     * @throws {Error} Re-throws any error from the callback after cleanup.
     *
     * @example
     * cartStore.batchUpdate(() => {
     *   cartStore.addItem(product1)
     *   cartStore.addItem(product2)
     *   cartStore.removeItem(3)
     * })
     */
    function batchUpdate(callback) {
        isBatching.value = true
        try {
            callback()
        } finally {
            isBatching.value = false
            debouncedPersist.cancel()
            persist()
        }
    }

    return {
        items,
        totalItems,
        totalPrice,
        isEmpty,
        isBatching,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        batchUpdate,
    }
})
