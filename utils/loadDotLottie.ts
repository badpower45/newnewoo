let loadPromise: Promise<void> | null = null;

export const loadDotLottiePlayer = () => {
    if (typeof window === 'undefined') return Promise.resolve();
    const alreadyLoaded = (window as any)?.customElements?.get?.('dotlottie-player');
    if (alreadyLoaded) return Promise.resolve();
    if (!loadPromise) {
        loadPromise = import('@dotlottie/player-component').then(() => undefined);
    }
    return loadPromise;
};
