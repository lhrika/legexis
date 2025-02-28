import { defineConfig } from 'vite'
import commonOptions from './vite.config.common'
import vue from '@vitejs/plugin-vue'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode }) => {
	return {
		...commonOptions,
		plugins: [vue()],
		build: {
			outDir: 'dist/media',
			rollupOptions: {
				input: {
					dictionaryView: '@/dictionaryView/main.ts',
					searchView: '@/searchView/main.ts',
					tratu: '@/tratu/main.ts',
					ollama: '@/ollama/main.ts',
				},
				output: {
					entryFileNames: '[name].js',
					format: 'es',
					assetFileNames: '[name].[ext]',
					chunkFileNames: '[name].js',
				},
			},
		},
	}
})
