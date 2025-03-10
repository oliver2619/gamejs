import { defineConfig } from 'vite';

export default defineConfig({
    root: './src',
    mode: 'development',
    publicDir: '../public',
    build: {
        outDir: '../dist'
    },
    server: {
        port: 8080
    }
});