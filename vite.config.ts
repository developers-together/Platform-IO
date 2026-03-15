import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';

const shouldSkipWayfinder =
    process.env.SKIP_WAYFINDER === 'true' ||
    process.env.VITE_SKIP_WAYFINDER === 'true';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.ts'],
            ssr: 'resources/js/ssr.ts',
            refresh: true,
        }),
        tailwindcss(),
        svelte(),
        ...(shouldSkipWayfinder
            ? []
            : [
                  wayfinder({
                      formVariants: true,
                  }),
              ]),
    ],
});
