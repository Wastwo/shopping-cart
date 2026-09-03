<script setup>
import { useCartStore } from '@/stores/cartStore';
import { ref } from 'vue';

const props = defineProps({
    item: {
        type: Object,
        required: true,
        validator: value => {
            return value.id && value.quantity > 0;
        },
    },
});

const emit = defineEmits({
    'quantity-change': payload => {
        return payload.id && typeof payload.quantity === 'number' && payload.quantity >= 0;
    },
    remove: id => typeof id === 'number',
});

const cartStore = useCartStore();
const isConfirmingDelete = ref(false);

function handleIncrement() {
    const newQty = props.item.quantity + 1;
    cartStore.updateQuantity(props.item.id, newQty);
    emit('quantity-change', { id: props.item.id, quantity: newQty });
}

function handleDecrement() {
    if (props.item.quantity <= 1) {
        isConfirmingDelete.value = true;
        return;
    }

    const newQty = props.item.quantity - 1;
    cartStore.updateQuantity(props.item.id, newQty);
    emit('quantity-change', { id: props.item.id, quantity: newQty });
}

function handleCancelDelete() {
    isConfirmingDelete.value = false;
}

function handleConfirmDelete() {
    cartStore.removeItem(props.item.id);
    emit('remove', props.item.id);
    isConfirmingDelete.value = false;
}

function handleRemoveClick() {
    isConfirmingDelete.value = true;
}
</script>

<template>
    <div
        class="group relative flex w-full items-center gap-3.5 sm:gap-4 rounded-xl border border-border bg-surface p-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-border-hover hover:shadow-[0_10px_25px_-10px_rgba(0,0,0,0.05)]"
    >
        <Transition
            enter-active-class="transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
            enter-from-class="opacity-0 scale-[0.98]"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-[0.98]"
        >
            <div v-if="isConfirmingDelete" class="absolute inset-0 z-10 flex items-center justify-between rounded-xl bg-surface/95 px-3.5 sm:px-4 backdrop-blur-md">
                <div class="flex items-center gap-2.5 min-w-0 pr-2">
                    <span class="flex h-1.5 w-1.5 shrink-0 rounded-full bg-danger"></span>
                    <p class="font-display text-xs font-medium tracking-tight text-primary truncate">Remove this item?</p>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                    <button
                        @click="handleCancelDelete"
                        type="button"
                        class="rounded-md px-2.5 py-1 font-display text-[11px] sm:text-xs font-medium text-secondary transition-colors duration-200 hover:text-primary active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        @click="handleConfirmDelete"
                        type="button"
                        class="rounded-md bg-primary px-3 py-1 font-display text-[11px] sm:text-xs font-medium text-surface shadow-xs transition-all duration-200 hover:bg-danger active:scale-95"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </Transition>

        <div class="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-lg bg-surface-muted border border-border/50">
            <slot name="media" :item="item">
                <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.name"
                    class="h-full w-full object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />

                <div v-else class="flex h-full w-full items-center justify-center text-secondary/60">
                    <svg class="h-5 w-5 stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                    </svg>
                </div>
            </slot>
        </div>

        <div class="flex flex-1 flex-col justify-between self-stretch min-w-0 py-0.5">
            <div class="flex items-start justify-between gap-2">
                <slot name="details" :item="item">
                    <div class="min-w-0 flex-1">
                        <h4 class="font-display text-xs sm:text-sm font-medium leading-snug tracking-tight text-primary truncate group-hover:text-secondary transition-colors duration-300">
                            {{ item.name }}
                        </h4>
                        <p v-if="item.price" class="mt-0.5 text-[10px] sm:text-xs font-normal font-sans text-secondary tracking-tight">
                            ${{ item.price.toFixed(2) }} <span class="text-secondary/50">/ unit</span>
                        </p>
                    </div>
                </slot>

                <slot name="actions" :item="item" :request-remove="handleRemoveClick">
                    <button
                        @click="handleRemoveClick"
                        type="button"
                        aria-label="Remove item"
                        class="grid h-6 w-6 place-items-center rounded-full text-secondary transition-all duration-200 hover:bg-surface-muted hover:text-danger active:scale-90 shrink-0"
                    >
                        <svg class="h-3.5 w-3.5 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </slot>
            </div>

            <div class="mt-2 flex items-center justify-between gap-2">
                <slot name="quantity" :item="item" :increment="handleIncrement" :decrement="handleDecrement">
                    <div class="inline-flex items-center rounded-full border border-border bg-surface p-0.5 shadow-xs">
                        <button
                            @click="handleDecrement"
                            type="button"
                            aria-label="Decrease quantity"
                            class="grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-full text-primary transition-colors duration-200 hover:bg-surface-muted active:scale-90"
                        >
                            <svg v-if="item.quantity === 1" class="h-3 w-3 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                            </svg>
                            <svg v-else class="h-3 w-3 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                            </svg>
                        </button>

                        <span class="min-w-6 text-center font-display text-xs font-semibold text-primary tabular-nums select-none">
                            {{ item.quantity }}
                        </span>

                        <button
                            @click="handleIncrement"
                            type="button"
                            aria-label="Increase quantity"
                            class="grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-full text-primary transition-colors duration-200 hover:bg-surface-muted active:scale-90"
                        >
                            <svg class="h-3 w-3 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>
                </slot>

                <slot name="price" :item="item">
                    <span class="font-display text-xs sm:text-sm font-semibold tracking-tight text-primary tabular-nums"> ${{ (item.price * item.quantity).toFixed(2) }} </span>
                </slot>
            </div>
        </div>
    </div>
</template>
