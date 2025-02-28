import * as vscode from 'vscode'

export function getNonce() {
	let text = ''
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

export function cspMeta(cspSource: string, nonce: string) {
	// return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource}; img-src ${cspSource} https:; script-src 'nonce-${nonce}';">`
	return `<meta http-equiv="Content-Security-Policy" script-src 'nonce-${nonce}';">`
}

export function getMediaUri(
	webview: vscode.Webview,
	extensionUri: vscode.Uri,
	file: string,
) {
	return webview.asWebviewUri(
		vscode.Uri.joinPath(extensionUri, 'dist/media', file),
	)
}

export function renderTemplate(template: string, data: Record<string, string>) {
	return template.replace(/\{\{([^{}]*?)\}\}/g, (_, key: string) => {
		return data[key.trim()] || ''
	})
}

export function isSet<T>(
	setting:
		| {
				key: string
				defaultValue?: T
				globalValue?: T
				workspaceValue?: T
				workspaceFolderValue?: T
				defaultLanguageValue?: T
				globalLanguageValue?: T
				workspaceLanguageValue?: T
				workspaceFolderLanguageValue?: T
				languageIds?: string[]
		  }
		| undefined,
) {
	return (
		setting?.globalValue ||
		setting?.workspaceFolderValue ||
		setting?.workspaceValue ||
		setting?.defaultLanguageValue ||
		setting?.workspaceLanguageValue ||
		setting?.workspaceFolderLanguageValue
	)
}
