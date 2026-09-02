import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useProductStore = defineStore('product', () => {
    const productMap = ref(new Map([
        [1, {
            id: 1,
            name: 'Wireless Headphones',
            price: 79.99,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
            description: 'Premium wireless headphones with noise cancellation.',
            category: 'electronics',
            details: { color: 'black', weight: '250g' }
        }],
        [2, {
            id: 2,
            name: 'Smart Watch',
            price: 199.99,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
            description: 'Feature-rich smartwatch with health tracking.',
            category: 'electronics',
            details: { color: 'silver', weight: '45g' }
        }],
        [3, {
            id: 3,
            name: 'Laptop Backpack',
            price: 49.99,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
            description: 'Durable backpack with laptop compartment.',
            category: 'accessories',
            details: { color: 'gray', capacity: '25L' }
        }],
        [4, {
            id: 4,
            name: 'Mechanical Keyboard',
            price: 129.99,
            image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop',
            description: 'RGB mechanical keyboard with Cherry MX switches.',
            category: 'electronics',
            details: { color: 'black', switches: 'Cherry MX Blue' }
        }],
        [5, {
            id: 5,
            name: 'Phone Case',
            price: 19.99,
            image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',
            description: 'Shockproof phone case with military-grade protection.',
            category: 'accessories',
            details: { color: 'clear', material: 'TPU' }
        }],
        [6, {
            id: 6,
            name: 'USB-C Hub',
            price: 39.99,
            image: 'https://images.unsplash.com/photo-1625842268584-8f3c96140068?w=400&h=400&fit=crop',
            description: '7-in-1 USB-C hub with HDMI and SD card reader.',
            category: 'electronics',
            details: { color: 'space gray', ports: 7 }
        }]
    ]))

    const products = computed(() => Array.from(productMap.value.values()))

    function getProductById(id) {
        return productMap.value.get(id)
    }

    const categories = computed(() => {
        const categorySet = new Set()
        productMap.value.forEach((product) => categorySet.add(product.category))
        return Array.from(categorySet)
    })

    function getProductsByCategory(category) {
        return products.value.filter((product) => product.category === category)
    }


    return {
        products,
        categories,
        getProductById,
        getProductsByCategory,
    }
})