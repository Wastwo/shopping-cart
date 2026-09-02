import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useWishlistStore = defineStore('wishlist', () => {
    const wishlistIds = ref(new Set())

    const totalItems = computed(() => wishlistIds.value.size)

    function isInWishlist(productId) {
        return wishlistIds.value.has(productId)
    }

    function toggleWishlist(productId) {
        const updatedWishlistIds = new Set(wishlistIds.value)

        if (updatedWishlistIds.has(productId)) {
            updatedWishlistIds.delete(productId)
        } else {
            updatedWishlistIds.add(productId)
        }

        wishlistIds.value = updatedWishlistIds
    }

    function addToWishlist(productId) {
        const updatedWishlistIds = new Set(wishlistIds.value)
        updatedWishlistIds.add(productId)
        wishlistIds.value = updatedWishlistIds
    }

    function removeFromWishlist(productId) {
        const updatedWishlistIds = new Set(wishlistIds.value)
        updatedWishlistIds.delete(productId)
        wishlistIds.value = updatedWishlistIds
    }

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