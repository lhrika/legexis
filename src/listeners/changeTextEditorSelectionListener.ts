import * as vscode from 'vscode'
import { DictionaryViewProvider } from '@/dictionaryView'
import { SearchViewProvider } from '@/searchView'
export default (e: vscode.TextEditorSelectionChangeEvent) => {
	const editor = e.textEditor
	const selection = editor.selection
	if (!selection.isEmpty) {
		const selectedText = editor.document.getText(selection).trim()
		if (!selectedText) {
			return
		}
		DictionaryViewProvider.getInstance().setWord(selectedText)
		SearchViewProvider.getInstance().search(selectedText)
	}
}
