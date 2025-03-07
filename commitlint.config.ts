import type { UserConfig } from '@commitlint/types'

const Configuration: UserConfig = {
	formatter: '@commitlint/format',
	parserPreset: {
		parserOpts: {
			mergePattern: undefined,
			mergeCorrespondence: undefined,
			headerPattern: /^(#\d+)? ?(.+)$/,
			headerCorrespondence: ['id', 'subject'],
			breakingHeaderPattern: undefined,
			referenceActions: undefined,
			issuePrefixes: ['#'],
			issuePrefixesCaseSensitive: true,
			noteKeywords: undefined,
			notesPattern: undefined,
			fieldPattern: undefined,
			revertPattern: undefined,
			revertCorrespondence: undefined,
			commentChar: undefined,
		},
	},
	rules: {
		'body-full-stop': [0],
		'body-leading-blank': [2, 'always'],
		'body-empty': [0],
		'body-max-length': [0],
		'body-max-line-length': [2, 'always', 72],
		'body-min-length': [0],
		'body-case': [2, 'always', 'sentence-case'],
		'footer-leading-blank': [0],
		'footer-empty': [2, 'always'],
		'footer-max-length': [0],
		'footer-max-line-length': [0],
		'footer-min-length': [0],
		'header-case': [0],
		'header-full-stop': [2, 'never', '.'],
		'header-max-length': [2, 'always', 50],
		'header-min-length': [0],
		'header-trim': [2, 'always'],
		'references-empty': [0],
		'scope-enum': [0],
		'scope-case': [0],
		'scope-empty': [0],
		'scope-max-length': [0],
		'scope-min-length': [0],
		'subject-case': [2, 'always', 'sentence-case'],
		'subject-empty': [2, 'never'],
		'subject-full-stop': [2, 'never', '.'],
		'subject-max-length': [0],
		'subject-min-length': [0],
		'type-enum': [0],
		'type-case': [0],
		'type-empty': [2, 'always'],
		'type-max-length': [0],
		'type-min-length': [0],
		'signed-off-by': [0],
		'trailer-exists': [0],
	},
}

export default Configuration
