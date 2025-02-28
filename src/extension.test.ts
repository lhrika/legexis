import * as assert from 'assert'
import * as vscode from 'vscode'

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.')

	test('Check if extension is active', async () => {
		const extension = vscode.extensions.getExtension('lhrika.legexis')
		assert.ok(extension, 'Extension is not found')
		await extension?.activate()
		assert.strictEqual(extension?.isActive, true, 'Extension is not active')
	})
})
