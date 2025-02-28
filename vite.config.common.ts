import { resolve } from 'path'
import { defineConfig } from 'vite'
export default defineConfig({
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
			'@assets': resolve(__dirname, 'assets'),
		},
	},
	build: {
		outDir: 'dist',
		sourcemap: true,
	},
})
