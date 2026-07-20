import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Deployed as a GitHub Pages project site: https://lanthanum89.github.io/TFL-route-planner/
export default defineConfig({
    base: '/TFL-route-planner/',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icons/icon.svg'],
            manifest: {
                name: 'London Underground Route Planner',
                short_name: 'Tube Planner',
                description: 'Plan routes on the London Underground with colour-coded lines and step-by-step directions.',
                start_url: '/TFL-route-planner/',
                scope: '/TFL-route-planner/',
                display: 'standalone',
                background_color: '#0b1220',
                theme_color: '#003688',
                orientation: 'portrait-primary',
                icons: [
                    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
            },
        }),
    ],
});
