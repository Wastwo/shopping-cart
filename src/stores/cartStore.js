import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCartStore = defineStore('cart', () => {
    const items = ref([])

    const totalItems = computed(() => {
        return items.value.reduce((sum, item) => sum + item.quantity, 0)
    })

    const totalPrice = computed(() => {
        return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })

    const isEmpty = computed(() => {
        return items.value.length === 0
    })

    function addItem(product) {
        const existing = items.value.find((item) => item.id === product.id)

        if (existing) {
            existing.quantity++
        } else {
            items.value.push({ ...product, quantity: 1 })
        }
    }

    function removeItem(productId) {
        items.value = items.value.filter((item) => item.id !== productId)
    }

    function updateQuantity(productId, quantity) {
        const item = items.value.find((item) => item.id === productId)
        if (item) {
            item.quantity = Math.max(0, quantity)
            if (item.quantity === 0) {
                removeItem(productId)
            }
        }
    }

    function clearCart() {
        items.value = []
    }

    return {
        items,
        totalItems,
        totalPrice,
        isEmpty,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
    }
})