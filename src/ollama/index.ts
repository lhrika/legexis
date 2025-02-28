import * as vscode from 'vscode'
import Legexis from '@/legexis'
import html from './index.html?raw'
import { getMediaUri, renderTemplate } from '@/utils'
import { Ollama } from 'ollama'
import type { Message, ChatRequest } from 'ollama'

export class OllamaViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'legexis.ollamaView'
	private static instance?: OllamaViewProvider
	private readonly extension: Legexis
	private view?: vscode.WebviewView
	private messages: Message[]
	private model?: string

	private constructor(extension: Legexis) {
		this.extension = extension
		this.messages = []
	}

	public static getInstance(extension?: Legexis) {
		if (!OllamaViewProvider.instance) {
			if (!extension) {
				throw new Error(
					'The instance of OllamaViewProvider has not been initialized. The extension argument must be provided.',
				)
			}
			OllamaViewProvider.instance = new OllamaViewProvider(extension)
		}
		return OllamaViewProvider.instance
	}

	public resolveWebviewView(webviewView: vscode.WebviewView) {
		this.view = webviewView
		this.view.webview.options = {
			...this.view.webview.options,
			enableScripts: true,
		}
		this.view.webview.html = this.getHtmlForWebview()
		this.view.webview.onDidReceiveMessage((message) => {
			const ollama = new Ollama()
			switch (message.command) {
				case 'list':
					ollama.list().then((listResponse) => {
						this.view?.webview.postMessage({
							message: 'list',
							models: listResponse.models,
						})
					})
					break
				case 'setModel':
					this.model = message.model
					break
				case 'chat':
					{
						const request = this.buildChatRequest(
							message.message,
							message.images.map((image: number[]) => new Uint8Array(image)),
						)
						if (request) {
							ollama.chat(request).then(async (response) => {
								let partIndex = 0
								const message: Message = { role: '', content: '' }
								for await (const part of response) {
									message.role = part.message.role
									message.content += part.message.content
									this.view?.webview.postMessage({
										message: 'chat',
										role: part.message.role,
										isFirstPart: partIndex === 0,
										content: part.message.content,
									})
									partIndex++
								}
								this.messages.push(message)
							})
						}
					}
					break
				case 'clear':
					this.clearChatHistory()
					break
				default:
					break
			}
		})
	}

	private getHtmlForWebview() {
		const data: Record<string, string> = {
			js: getMediaUri(
				this.view!.webview,
				this.extension.context.extensionUri,
				'ollama.js',
			).toString(),
			css: getMediaUri(
				this.view!.webview,
				this.extension.context.extensionUri,
				'ollama.css',
			).toString(),
		}
		return renderTemplate(html, data)
	}

	private clearChatHistory() {
		this.messages = []
	}

	private buildChatRequest(message: string, images: Uint8Array[]) {
		if (!this.model || !message) {
			return undefined
		}
		if (this.messages === undefined) {
			this.messages = []
		}
		this.messages.push({
			role: 'user',
			content: message,
			images: images,
		})
		const request: ChatRequest & {
			stream: true
		} = {
			model: this.model,
			messages: this.messages,
			stream: true,
		}
		return request
	}
}
