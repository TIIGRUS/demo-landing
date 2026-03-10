import type { UserConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { imagetools } from 'vite-imagetools';

export default {
    base: './',
    plugins: [
        imagetools(),
        ViteImageOptimizer({
            // Оптимизация JPG
            jpg: {
                quality: 85,
            },
            // Генерация и оптимизация WebP
            webp: {
                quality: 82,
            },
            // Генерация и оптимизация AVIF
            avif: {
                quality: 75,
            },
            // Оптимизация PNG (если есть)
            png: {
                quality: 85,
            },
        }),
    ],
} satisfies UserConfig;
