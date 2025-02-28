<template>
	<div class="flex flex-col gap-4 px-2 py-4">
		<input
			v-model="word"
			type="text"
			class="block text-input-foreground bg-input-background px-2 py-1 border-none"
		/>
		<button
			type="button"
			class="px-2 py-1 bg-button-background text-button-foreground hover:bg-button-hoverBackground border border-transparent cursor-pointer"
			@click="handleClick"
		>
			Tra Từ
		</button>
		<button
			type="button"
			class="px-2 py-1 bg-button-secondaryBackground text-button-secondaryForeground hover:bg-button-secondaryHoverBackground border border-transparent cursor-pointer"
			@click="handleTranslate"
		>
			Dịch
		</button>
		<div v-if="typeof data === 'string'">{{ data }}</div>
		<div v-if="typeof data === 'object'" class="flex flex-col gap-2">
			<div
				v-for="(pos, index) in data"
				:key="index"
				class="flex flex-col gap-1"
			>
				<p class="">[{{ pos.pos }}]</p>
				<div class="flex flex-col gap-2">
					<div
						v-for="(definition, definitionIndex) in pos.definitions"
						:key="definitionIndex"
						class="flex flex-col gap-1"
					>
						<p>{{ definition.meaning }}</p>
						<p
							v-for="(example, exampleIndex) in definition.examples"
							:key="exampleIndex"
						>
							- {{ example }}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PartOfSpeech } from './tratu'
const word = ref<string>()
const vscode = acquireVsCodeApi()
const data = ref<PartOfSpeech[] | string>()
function handleClick() {
	vscode.postMessage({
		command: 'search',
		word: word.value,
	})
}
function handleTranslate() {
	vscode.postMessage({
		command: 'translate',
		text: word.value,
	})
}
window.addEventListener('message', (e) => {
	data.value = e.data.data
})
</script>

<style lang="postcss">
@import '@assets/tailwind.css';
@source 'app.vue';
</style>
