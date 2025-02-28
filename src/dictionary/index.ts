import fs from 'fs'
import path from 'path'
import * as vscode from 'vscode'
import TrieSearch from 'trie-search'
import Legexis from '@/legexis'
export class Dictionary implements vscode.Disposable {
	// Path to the dictionary file
	private path: string
	// Dictionary data (JSON object)
	private data: {
		[language: string]: Record<string, string>
	}
	// Tries for each language
	private tries: {
		[language: string]: TrieSearch<{
			_key_: string
			value: string
		}>
	}
	constructor(filePath: string) {
		this.path = filePath
		this.data = this.load()
		this.tries = {}
	}

	public dispose() {
		this.save()
	}

	public record(word: string, definition: string) {
		word = word.trim()
		definition = definition.trim()
		if (word) {
			const language = Legexis.getInstance().language
			if (!(language in this.data)) {
				this.data[language] = {}
			}
			// If word exists and definition is empty, delete the word
			if (word in this.data[language] && !definition) {
				delete this.data[language][word]
				if (language in this.tries) {
					this.tries[language].remove(word)
				}
			} else {
				this.data[language][word] = definition
				if (language in this.tries) {
					this.tries[language].addFromObject({
						[word]: definition,
					})
				}
			}
		}
	}

	public query(word: string): string | undefined {
		const language = Legexis.getInstance().language
		if (this.data[language] === undefined) {
			return undefined
		}
		return this.data[language][word]
	}

	public search(prefix: string): string[] {
		prefix = prefix.trim()
		const language = Legexis.getInstance().language
		if (this.data[language] === undefined) {
			return []
		}
		if (!prefix) {
			return Object.keys(this.data[language])
		}
		if (this.tries[language] === undefined) {
			this.tries[language] = new TrieSearch([], { splitOnRegEx: false })
			this.tries[language].addFromObject(this.data[language])
		}
		const results = this.tries[language].search(prefix)
		const matches = results.map((result) => result._key_)
		return matches
	}

	private load(): typeof this.data {
		// If the file exists, load it. Otherwise, return an empty object.
		if (fs.existsSync(this.path)) {
			return JSON.parse(fs.readFileSync(this.path, 'utf-8'))
		}
		return {}
	}

	public save() {
		const dir = path.dirname(this.path)
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true })
		}
		fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2))
	}
}
