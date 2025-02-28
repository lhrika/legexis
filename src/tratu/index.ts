import * as vscode from 'vscode'
import Legexis from '@/legexis'
import html from './index.html?raw'
import { getMediaUri, renderTemplate } from '@/utils'
import { fetchAndParseDictionary } from './tratu'
import { exec } from 'child_process'
import { isSet } from '@/utils'
import '@assets/translate-vi-en.py?url&no-inline'

export class TratuViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'legexis.tratuView'
	private static instance?: TratuViewProvider
	private readonly extension: Legexis
	private view?: vscode.WebviewView

	private constructor(extension: Legexis) {
		this.extension = extension
	}

	public static getInstance(extension?: Legexis) {
		if (!TratuViewProvider.instance) {
			if (!extension) {
				throw new Error(
					'The instance of TratuViewProvider has not been initialized. The extension argument must be provided.',
				)
			}
			TratuViewProvider.instance = new TratuViewProvider(extension)
		}
		return TratuViewProvider.instance
	}

	public resolveWebviewView(webviewView: vscode.WebviewView) {
		this.view = webviewView
		this.view.webview.options = {
			...this.view.webview.options,
			enableScripts: true,
		}
		this.view.webview.html = this.getHtmlForWebview()
		this.view.webview.onDidReceiveMessage(async (e) => {
			if (e.command === 'search') {
				const data = await fetchAndParseDictionary(
					`https://tratu.coviet.vn/hoc-tieng-anh/tu-dien/lac-viet/V-V/${encodeURIComponent(e.word)}.html`,
				)
				this.view?.webview.postMessage({
					data: data,
				})
			} else if (e.command === 'translate') {
				const config = vscode.workspace.getConfiguration('legexis')
				const python = config.get<string>('tratu.python')
				const translationScriptValue = config.get<string>(
					'tratu.translationScript',
				)
				const translationScriptInspected = config.inspect<string>(
					'tratu.translationScript',
				)
				const translationScript = isSet<string>(translationScriptInspected)
					? translationScriptValue
					: `${this.extension.context.extensionPath}/${translationScriptValue}`
				exec(
					`${python} ${translationScript} "${e.text}"`,
					(error, stdout, stderr) => {
						if (error) {
							vscode.window.showErrorMessage(`Error: ${error.message}`)
						} else if (stderr) {
							vscode.window.showErrorMessage(`Stderr: ${stderr}`)
						} else {
							this.view?.webview.postMessage({
								data: stdout,
							})
						}
					},
				)
			}
		})
	}

	private getHtmlForWebview() {
		const data: Record<string, string> = {
			js: getMediaUri(
				this.view!.webview,
				this.extension.context.extensionUri,
				'tratu.js',
			).toString(),
			css: getMediaUri(
				this.view!.webview,
				this.extension.context.extensionUri,
				'tratu.css',
			).toString(),
		}
		return renderTemplate(html, data)
	}
}
