<template>
	<div class="flex flex-col gap-4 py-4 px-2">
		<input
			v-model="word"
			type="text"
			class="block border-none bg-input-background text-input-foreground px-2 py-1 placeholder:text-input-placeholderForeground"
		/>
		<textarea
			id="note"
			v-model="note"
			class="border-none h-32 px-2 py-1 text-input-foreground bg-input-background placeholder:text-input-placeholderForeground"
		></textarea>
		<button
			type="button"
			class="text-button-foreground bg-button-background border border-transparent rounded-xs hover:bg-button-hoverBackground cursor-pointer py-1 px-2"
			@click="save"
		>
			Save
		</button>
		<button
			type="button"
			class="text-button-secondaryForeground bg-button-secondaryBackground border border-transparent rounded-xs hover:bg-button-secondaryHoverBackground cursor-pointer py-1 px-2"
			@click="saveDictionary"
		>
			Save Dictionary
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const word = ref('')
const note = ref('')
const vscode = acquireVsCodeApi()
function save() {
	vscode.postMessage({
		command: 'saveNote',
		text: word.value,
		note: note.value,
	})
}
function saveDictionary() {
	vscode.postMessage({
		command: 'saveDictionary',
	})
}
window.addEventListener('message', (e) => {
	word.value = e.data.word
	note.value = e.data.note
})
</script>
