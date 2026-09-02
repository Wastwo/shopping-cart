const componentMetadata = new WeakMap()

export function registerComponent(instance) {
    componentMetadata.set(instance, {
        mountedAt: Date.now(),
        renderCount: 0
    })
}

export function trackRender(instance) {
    const metadata = componentMetadata.get(instance)
    if (metadata) {
        metadata.renderCount++
    }
}

export function getMetadata(instance) {
    return componentMetadata.get(instance)
}

export function isTracked(instance) {
    return componentMetadata.has(instance)
}