/**
 * @module wishlistStore
 * @description Pinia store managing the user's wishlist — a set of product IDs
 * the user has marked as favourites.
 *
 * Internally uses a `Set<number>` for O(1) membership checks and automatic
 * deduplication. Because Vue cannot track mutations on a `Set` directly, every
 * mutating operation creates a **new** `Set` instance and reassigns it to the
 * ref. This triggers Vue's reactivity system (new reference = change detected).
 *
 * This store does not persist to localStorage; the wishlist is session-scoped.
 */
import { defineStore } from "pinia";
import { computed, ref } from "vue";

/**
 * Pinia composition-API store for the wishlist.
 *
 * @returns {{
 *   wishlistIds: import('vue').Ref<Set<number>>,
 *   totalItems: import('vue').ComputedRef<number>,
 *   isInWishlist: function,
 *   toggleWishlist: function,
 *   addToWishlist: function,
 *   removeFromWishlist: function,
 *   clearWishlist: function
 * }}
 */
export const useWishlistStore = defineStore('wishlist', () => {
    /**
     * Reactive set of wishlisted product IDs.
     *
     * Always reassigned as a new `Set` instance on mutation to ensure Vue
     * reactivity triggers. Never mutate in-place (e.g., `wishlistIds.value.add()`),
     * as Vue will not detect the change.
     *
     * @type {import('vue').Ref<Set<number>>}
     */
    const wishlistIds = ref(new Set())

    /**
     * Total number of products in the wishlist.
     *
     * @type {import('vue').ComputedRef<number>}
     */
    const totalItems = computed(() => wishlistIds.value.size)

    /**
     * Checks whether a product is in the wishlist.
     *
     * @param {number} productId - The unique ID of the product to check.
     * @returns {boolean} `true` if the product is wishlisted, `false` otherwise.
     *
     * @example
     * wishlistStore.isInWishlist(1) // => false
     * wishlistStore.addToWishlist(1)
     * wishlistStore.isInWishlist(1) // => true
     */
    function isInWishlist(productId) {
        return wishlistIds.value.has(productId)
    }

    /**
     * Toggles a product's wishlist status.
     *
     * If the product is already wishlisted, it is removed; otherwise it is added.
     * Creates a new `Set` to trigger Vue reactivity.
     *
     * Edge-case: adding an already-present ID is a no-op (Set deduplicates);
     * removing an absent ID is also a no-op.
     *
     * @param {number} productId - The unique ID of the product to toggle.
     * @returns {void}
     *
     * @example
     * wishlistStore.toggleWishlist(1) // adds product 1
     * wishlistStore.toggleWishlist(1) // removes product 1
     */
    function toggleWishlist(productId) {
        const updatedWishlistIds = new Set(wishlistIds.value)

        if (updatedWishlistIds.has(productId)) {
            updatedWishlistIds.delete(productId)
        } else {
            updatedWishlistIds.add(productId)
        }

        wishlistIds.value = updatedWishlistIds
    }

    /**
     * Adds a product to the wishlist.
     *
     * If the product is already present, this is a no-op (Set deduplication).
     * Creates a new `Set` to trigger Vue reactivity.
     *
     * @param {number} productId - The unique ID of the product to add.
     * @returns {void}
     *
     * @example
     * wishlistStore.addToWishlist(3)
     */
    function addToWishlist(productId) {
        const updatedWishlistIds = new Set(wishlistIds.value)
        updatedWishlistIds.add(productId)
        wishlistIds.value = updatedWishlistIds
    }

    /**
     * Removes a product from the wishlist.
     *
     * If the product is not present, this is a no-op.
     * Creates a new `Set` to trigger Vue reactivity.
     *
     * @param {number} productId - The unique ID of the product to remove.
     * @returns {void}
     *
     * @example
     * wishlistStore.removeFromWishlist(3)
     */
    function removeFromWishlist(productId) {
        const updatedWishlistIds = new Set(wishlistIds.value)
        updatedWishlistIds.delete(productId)
        wishlistIds.value = updatedWishlistIds
    }

    /**
     * Removes all products from the wishlist.
     *
     * @returns {void}
     *
     * @example
     * wishlistStore.clearWishlist()
     */
    function clearWishlist() {
        wishlistIds.value = new Set()
    }

    return {
        wishlistIds,
        totalItems,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist
    }
})
