import axios from 'axios'
import * as cheerio from 'cheerio'

interface Definition {
	meaning: string
	examples: string[]
}

export interface PartOfSpeech {
	pos: string
	definitions: Definition[]
}

export async function fetchAndParseDictionary(
	url: string,
): Promise<PartOfSpeech[]> {
	try {
		// Fetch the HTML content from the URL
		const { data: html } = await axios.get(url)

		// Load the HTML into Cheerio
		const $ = cheerio.load(html)

		// Find all parts of speech
		const partsOfSpeech = $('div[id^="partofspeech_"]')

		// Initialize an array to store the parsed data
		const parsedData: PartOfSpeech[] = []

		// Process each part of speech
		partsOfSpeech.each((_, element) => {
			const part = $(element)

			// Get the part of speech (e.g., "danh từ", "động từ", etc.)
			const posTag = part.find('div.ub')
			const pos = posTag.text().trim()

			// Get all meanings and examples
			const definitions: Definition[] = []
			let definition: Definition | undefined

			for (let tag = posTag.next(); tag.length > 0; tag = tag.next()) {
				if (tag.hasClass('m')) {
					// Push the previous definition if it exists
					if (definition) {
						definitions.push(definition)
					}
					// Start a new definition
					definition = { meaning: tag.text().trim(), examples: [] }
				} else if (tag.hasClass('e') && definition) {
					// Add example to the current definition
					definition.examples.push(tag.text().trim())
				}
			}

			// Push the last definition if it exists
			if (definition) {
				definitions.push(definition)
			}

			// Add the part of speech data to the parsed data
			parsedData.push({ pos: pos, definitions: definitions })
		})

		return parsedData
	} catch (error) {
		console.error('Error fetching or parsing the dictionary content:', error)
		throw error
	}
}
