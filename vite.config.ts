import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync } from 'fs'
import commonOptions from './vite.config.common'

export default defineConfig(({ mode }) => {
	const srcDir = resolve(__dirname, 'src')
	const files = readdirSync(srcDir, { encoding: 'utf-8', recursive: true })
	const entries = files.reduce((acc, file) => {
		if (
			(file.endsWith('.test.ts') && mode === 'development') ||
			file === 'extension.ts'
		) {
			const name = file.replace(/\.ts$/, '') // Remove file extension
			acc[name] = resolve(srcDir, file)
		}
		return acc
	}, {})
	return {
		...commonOptions,
		build: {
			lib: {
				entry: entries,
				formats: ['cjs'],
				fileName: '[name]',
			},
			rollupOptions: {
				external: [
					'vscode',
					'assert',
					'fs',
					'node:fs',
					'path',
					'node:path',
					'child_process',
				],
			},
			emptyOutDir: false,
		},
	}
})
