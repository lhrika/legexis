import * as vscode from 'vscode'
import Legexis from '@/legexis'
import '@vscode/codicons/src/icons/notebook.svg?no-inline'

export function activate(context: vscode.ExtensionContext) {
	const legexis = Legexis.getInstance(context)
	legexis.activate()
}

export function deactivate() {}
