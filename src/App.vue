<script setup>
/**
 * @component App
 * @description Root application component that provides the global layout shell.
 *
 * This component serves as the top-level wrapper for the entire application.
 * It renders the persistent Navbar and a RouterView for page-level components.
 *
 * Architecture note: By keeping App.vue minimal, we ensure that:
 * - Global providers (stores, router) are available to all child routes
 * - The Navbar persists across route transitions without re-rendering
 * - Route-level components can focus on their specific concerns
 *
 * @example
 * <!-- Used automatically by Vue Router as the root component -->
 * <App />
 */
import { RouterView } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
</script>

<template>
    <Navbar />
    <RouterView />
</template>
