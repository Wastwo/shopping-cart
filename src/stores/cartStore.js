import { defineStore } from "pinia";
import { ref, computed, toRaw } from "vue";

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
        const clonedProduct = structuredClone(toRaw(product))
        const existingIndex = items.value.findIndex((item) => item.id === product.id)

        if (existingIndex !== -1) {
            const updatedItems = structuredClone(toRaw(items.value))
            updatedItems[existingIndex].quantity++
            items.value = updatedItems
        } else {
            items.value = [...toRaw(items.value), { ...clonedProduct, quantity: 1 }]
        }

    }

    function removeItem(productId) {
        items.value = structuredClone(toRaw(items.value)).filter((item) => item.id !== productId)
    }

    function updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            removeItem(productId)
            return
        }

        items.value = toRaw(items.value).map(item => item.id === productId
            ? { ...structuredClone(toRaw(item)), quantity }
            : item)
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