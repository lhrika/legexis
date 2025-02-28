import Legexis from '@/legexis'
import * as vscode from 'vscode'

export default function () {
	const legexis = Legexis.getInstance()
	legexis.dictionary.save()
	vscode.window.showInformationMessage('Dictionary successfully saved.')
}
