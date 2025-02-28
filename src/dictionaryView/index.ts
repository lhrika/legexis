import * as vscode from 'vscode'
import { getNonce, getMediaUri, renderTemplate, cspMeta } from '@/utils'
import html from './index.html?raw'
import Legexis from '@/legexis'

export class DictionaryViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'legexis.dictionaryView'
	private static instance?: DictionaryViewProvider
	private readonly extension: Legexis

	private view?: vscode.WebviewView
	private word: string = ''

	public static getInstance(extension?: Legexis) {
		if (!DictionaryViewProvider.instance) {
			if (!extension) {
				throw new Error(
					'The instance of DictionaryViewProvider has not been initialized. The extension argument must be provided.',
				)
			}
			DictionaryViewProvider.instance = new DictionaryViewProvider(extension)
		}
		return DictionaryViewProvider.instance
	}

	private constructor(extension: Legexis) {
		this.extension = extension
	}

	public resolveWebviewView(webviewView: vscode.WebviewView) {
		this.view = webviewView

		// Set the WebView options
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this.extension.context.extensionUri, 'dist/media'),
			],
		}
		// Set the WebView content
		this.view!.webview.html = this.getHtmlForWebview()

		// Handle messages from the WebView
		webviewView.webview.onDidReceiveMessage(
			(message) => {
				switch (message.command) {
					case 'saveNote':
						this.saveNote(message.text, message.note)
						return
					case 'saveDictionary':
						vscode.commands.executeCommand('legexis.saveDictionary')
						return
				}
			},
			null,
			[],
		)

		webviewView.onDidDispose(() => {
			this.extension.dictionary.dispose()
		})
	}

	public setWord(word: string) {
		this.word = word
		this.updateWebviewContent()
	}

	private updateWebviewContent() {
		if (!this.view) {
			return
		}
		const definition = this.extension.dictionary.query(this.word)
		this.view.webview.postMessage({
			word: this.word,
			note: definition,
		})
	}

	private saveNote(word: string, definition: string) {
		if (word) {
			this.extension.dictionary.record(word, definition)
			vscode.window.showInformationMessage(`Saved note for "${word}".`)
		}
	}

	private getHtmlForWebview(): string {
		const nonce = getNonce()
		const data: Record<string, string> = {
			jsPath: getMediaUri(
				this.view!.webview,
				this.extension.context.extensionUri,
				'dictionaryView.js',
			).toString(),
			cssPath: getMediaUri(
				this.view!.webview,
				this.extension.context.extensionUri,
				'dictionaryView.css',
			).toString(),
			nonce: nonce,
			cspMeta: cspMeta(this.view!.webview.cspSource, nonce),
		}
		return renderTemplate(html, data)
	}
}
