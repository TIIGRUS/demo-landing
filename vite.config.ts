import type { UserConfig } from 'vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default {
    base: "./",
    plugins: [
        ViteImageOptimizer({
            jpg: {
                quality: 85
            }
        })
    ]
} satisfies UserConfig;