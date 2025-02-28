import * as vscode from 'vscode'

const accentsMap: Record<string, string> = {
	a: 'áàảãạ',
	ă: 'ắằẳẵặ',
	â: 'ấầẩẫậ',
	A: 'ÁÀẢÃẠ',
	Ă: 'ẮẰẲẴẶ',
	Â: 'ẤẦẨẪẬ',
	e: 'éèẻẽẹ',
	ê: 'ếềểễệ',
	E: 'ÉÈẺẼẸ',
	Ê: 'ẾỀỂỄỆ',
	i: 'íìỉĩị',
	I: 'ÍÌỈĨỊ',
	o: 'óòỏõọ',
	ô: 'ốồổỗộ',
	ơ: 'ớờởỡợ',
	O: 'ÓÒỎÕỌ',
	Ô: 'ỐỒỔỖỘ',
	Ơ: 'ỚỜỞỠỢ',
	u: 'úùủũụ',
	ư: 'ứừửữự',
	U: 'ÚÙỦŨỤ',
	Ư: 'ỨỪỬỮỰ',
	y: 'ýỳỷỹỵ',
	Y: 'ÝỲỶỸỴ',
}

enum Tone {
	Ngang = 'ngang', // No diacritic
	Sac = 'sắc', // Rising tone
	Huyen = 'huyền', // Falling tone
	Hoi = 'hỏi', // Questioning tone
	Nga = 'ngã', // Broken/rising-falling tone
	Nang = 'nặng', // Heavy/low tone
}

function detectAndRemoveTone(letter: string):
	| {
			letter: string
			tone: Tone
	  }
	| undefined {
	const letterWithoutTone = Object.keys(accentsMap).find((key) =>
		accentsMap[key].includes(letter),
	)
	if (letterWithoutTone) {
		const i = accentsMap[letterWithoutTone].indexOf(letter)
		let tone: Tone
		switch (i) {
			case 0:
				tone = Tone.Sac
				break
			case 1:
				tone = Tone.Huyen
				break
			case 2:
				tone = Tone.Hoi
				break
			case 3:
				tone = Tone.Nga
				break
			case 4:
				tone = Tone.Nang
				break
			default:
				tone = Tone.Ngang
		}
		return {
			letter: letterWithoutTone,
			tone: tone,
		}
	} else {
		return undefined
	}
}

function addTone(letter: string, tone: Tone) {
	if (letter in accentsMap) {
		let i: number
		switch (tone) {
			case Tone.Ngang:
				i = -1
				break
			case Tone.Sac:
				i = 0
				break
			case Tone.Huyen:
				i = 1
				break
			case Tone.Hoi:
				i = 2
				break
			case Tone.Nga:
				i = 3
				break
			case Tone.Nang:
				i = 4
				break
			default:
				i = -1
		}
		if (i < 0) {
			return letter
		}
		return accentsMap[letter][i]
	} else {
		return letter
	}
}

function convertToNewStyle(text: string) {
	const result = text.replaceAll(
		/(?<![\p{L}\p{M}])([\p{L}\p{M}]*)([óÓọỌỏỎõÕòÒ][aAeE]|[úÚủỦùÙũŨụỤ][yY])(?![\p{L}\p{M}])/gimu,
		(match, consonant: string, vowel: string) => {
			const { letter: firstVowel, tone } = detectAndRemoveTone(vowel[0])!
			const secondVowel = addTone(vowel[1], tone)
			return `${consonant}${firstVowel}${secondVowel}`
		},
	)
	return result
}

export default function () {
	const editor = vscode.window.activeTextEditor
	if (!editor) {
		vscode.window.showErrorMessage('No active editor found!')
		return
	}

	const document = editor.document
	const selection = editor.selection

	// Get the text from the editor
	const text = document.getText(selection.isEmpty ? undefined : selection)

	// Convert the text to modern orthography
	const convertedText = convertToNewStyle(text)

	// Replace the text in the editor
	editor.edit((editBuilder) => {
		if (selection.isEmpty) {
			const fullRange = new vscode.Range(
				document.positionAt(0),
				document.positionAt(document.getText().length),
			)
			editBuilder.replace(fullRange, convertedText)
		} else {
			editBuilder.replace(selection, convertedText)
		}
	})
	vscode.window.showInformationMessage('Successfully converted to new style!')
}
