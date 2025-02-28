import * as vscode from 'vscode'
import html from './index.html?raw'
import { getMediaUri, renderTemplate } from '@/utils'
import { DictionaryViewProvider } from '@/dictionaryView'
import Legexis from '@/legexis'

export class SearchViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'legexis.searchView'
	private static instance?: SearchViewProvider
	private readonly extension: Legexis
	private view?: vscode.WebviewView

	private constructor(extension: Legexis) {
		this.extension = extension
	}

	public static getInstance(extension?: Legexis) {
		if (!SearchViewProvider.instance) {
			if (!extension) {
				throw new Error(
					'The instance of SearchViewProvider has not been initialized. The extension argument must be provided.',
				)
			}
			SearchViewProvider.instance = new SearchViewProvider(extension)
		}
		return SearchViewProvider.instance
	}

	public resolveWebviewView(webviewView: vscode.WebviewView) {
		this.view = webviewView
		this.view.webview.options = {
			...this.view.webview.options,
			enableScripts: true,
		}
		this.view.webview.html = this.getHtmlForWebview()
		this.view.webview.onDidReceiveMessage((e) => {
			const dictionary = this.extension.dictionary
			switch (e.command) {
				case 'searchByPrefix':
					this.view?.webview.postMessage({
						matches: dictionary.search(e.prefix),
					})
					break
				case 'setWord':
					DictionaryViewProvider.getInstance().setWord(e.word)
					break
			}
		})
	}

	public search(word: string) {
		const matches = this.extension.dictionary.search(word)
		this.view?.webview.postMessage({
			input: word,
			matches: matches,
		})
	}

	private getHtmlForWebview() {
		const data: Record<string, string> = {
			js: getMediaUri(
				this.view!.webview,
				this.extension.context.extensionUri,
				'searchView.js',
			).toString(),
			css: getMediaUri(
				this.view!.webview,
				this.extension.context.extensionUri,
				'searchView.css',
			).toString(),
		}
		return renderTemplate(html, data)
	}
}
