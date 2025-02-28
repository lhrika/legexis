import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
	{
		ignores: ['dist', 'node_modules', '.vscode-test', '.husky/_', '.venv'],
	},
	{
		extends: [
			pluginJs.configs.recommended,
			...tseslint.configs.recommended,
			...pluginVue.configs['flat/recommended'],
		],
		files: ['**/*.{ts,js,mjs,cjs,vue}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				acquireVsCodeApi: 'readonly',
			},
			parserOptions: {
				parser: tseslint.parser,
			},
		},
		rules: {
			'vue/no-v-html': 'off',
		},
	},
	eslintConfigPrettier,
)
