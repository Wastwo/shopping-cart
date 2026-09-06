import { watch, onScopeDispose } from "vue";

const CART_STORAGE_KEY = 'shopping-cart'
const CART_SCHEMA_VERSION = 3

function debounce(fn, delay) {
    let timeoutId = null

    const debounced = (...args) => {
        if (timeoutId !== null) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            fn(...args)
            timeoutId = null
        }, delay)
    }

    debounced.cancel = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
    }

    return debounced
}

function deepEqual(a, b) {
    if (a === b) return true
    if (a === null || b === null) return false
    if (typeof a !== 'object' || typeof b !== 'object') return false

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
        if (!keysB.includes(key)) return false
        if (!deepEqual(a[key], b[key])) return false
    }
    return true
}

function isValidCartItem(item) {
    return (
        item &&
        typeof item.id === 'number' &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
    )
}

function migrateData(data) {
    if (!data.version) {
        if (Array.isArray(data)) {
            return data.filter(isValidCartItem).map(item => ({
                ...item,
                price: item.price || 0,
                category: item.category || 'uncategorized',
                details: item.details || {}
            }))
        }
        return []
    }

    let items = data.items || []

    if (data.version < 2) {
        items = items.map(item => ({ ...item, category: item.category || 'uncategorized' }))
    }

    if (data.version < 3) {
        items = items.map(item => ({ ...item, details: item.details || {} }))
    }

    return items.filter(isValidCartItem)
}

export function useCartPersistence(itemsRef, options = {}) {
    const { debounceMs = 300, crossTabSync = true } = options
    let lastPersistedState = null

    function persist() {
        try {
            const items = itemsRef.value
            if (lastPersistedState && deepEqual(items, lastPersistedState)) return

            const data = {
                version: CART_SCHEMA_VERSION,
                timestamp: Date.now(),
                items: structuredClone(items)
            }

            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data))
            lastPersistedState = structuredClone(items)
        } catch (error) {
            console.error('[CartPersistence] Failed to persist:', error)
        }
    }

    function restore() {
        try {
            const raw = localStorage.getItem(CART_STORAGE_KEY)
            if (!raw) return []

            const data = JSON.parse(raw)
            const items = migrateData(data)
            lastPersistedState = structuredClone(items)
            return items
        } catch (error) {
            console.error('[CartPersistence] Failed to restore:', error)
            return []
        }
    }

    function clear() {
        try {
            localStorage.removeItem(CART_STORAGE_KEY)
            lastPersistedState = null
        } catch (error) {
            console.error('[CartPersistence] Failed to clear:', error)
        }
    }

    const debouncedPersist = debounce(persist, debounceMs)

    const stopWatch = watch(itemsRef, () => debouncedPersist(), { deep: true })

    let cleanupStorageListener = null

    if (crossTabSync) {
        function handleStorage(event) {
            if (event.key !== CART_STORAGE_KEY) return

            if (event.newValue === null) {
                itemsRef.value = []
                lastPersistedState = null
                return
            }

            try {
                const data = JSON.parse(event.newValue)
                const items = migrateData(data)
                itemsRef.value = items
                lastPersistedState = structuredClone(items)
            } catch (error) {
                console.error('[CartPersistence] Cross-tab sync failed:', error)
            }
        }

        window.addEventListener('storage', handleStorage)
        cleanupStorageListener = () => window.removeEventListener('storage', handleStorage)
    }

    onScopeDispose(() => {
        stopWatch()
        debouncedPersist.cancel()
        if (cleanupStorageListener) cleanupStorageListener()
    })

    return {
        persist,
        restore,
        clear,
        debouncedPersist
    }
}