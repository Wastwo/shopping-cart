import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

export const useProductStore = defineStore('product', () => {
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

    const products = computed(() => Array.from(productMap.value.values()))
    const rawSearchQuery = ref('')
    const selectedCategory = ref('all')
    const sortBy = ref('default')

    const activeSearchQuery = ref('')
    let debounceTimer = null

    function getProductById(id) {
        return productMap.value.get(id)
    }

    const categories = computed(() => {
        const categorySet = new Set()
        productMap.value.forEach((product) => categorySet.add(product.category))
        return Array.from(categorySet)
    })

    function getProductsByCategory(category) {
        return products.value.filter((product) => product.category?.toLowerCase() === category.toLowerCase())
    }

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

    function resetFilters() {
        rawSearchQuery.value = ''
        activeSearchQuery.value = '';
        selectedCategory.value = 'all';
        sortBy.value = 'default';
    }

    watch([rawSearchQuery, selectedCategory, sortBy], ([newSearch], [oldSearch]) => {
        clearTimeout(debounceTimer)

        if (newSearch !== oldSearch) {
            debounceTimer = setTimeout(() => {
                activeSearchQuery.value = newSearch
            }, 500)
        } else {
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