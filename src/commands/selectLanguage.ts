import Legexis from '@/legexis'
import * as vscode from 'vscode'

interface Option extends vscode.QuickPickItem {
	code: string
}

export default async function selectLanguage() {
	const legexis = Legexis.getInstance()
	const options: Option[] = legexis.languages
	// Show the quick pick list
	const selectedOption = await vscode.window.showQuickPick(options, {
		placeHolder: 'Select a language',
		canPickMany: false,
	})
	if (selectedOption && selectedOption.code !== legexis.language) {
		vscode.window.showInformationMessage(
			`Language set to: ${selectedOption.label}`,
		)
		legexis.language = selectedOption.code
	}
}
