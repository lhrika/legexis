<template>
	<div class="h-full flex flex-col gap-4 py-4 px-2">
		<div class="flex">
			<select
				id="model"
				v-model="currentModel"
				name="model"
				class="bg-input-background text-input-foreground focus:border-focusBorder px-2 py-1 grow"
			>
				<option v-for="model in models" :key="model.model" :value="model.model">
					{{ model.name }}
				</option>
			</select>
			<button
				class="text-button-foreground bg-button-background hover:bg-button-hoverBackground border-none flex justify-center items-center p-1 cursor-pointer"
				@click="getModelList"
			>
				<i class="codicon codicon-refresh"></i>
			</button>
		</div>
		<!-- messages -->
		<div class="overflow-auto grow">
			<div
				v-for="(message, index) in messages"
				:key="index"
				class="rounded py-2 flex flex-wrap items-start"
				:class="{
					'bg-terminal-ansiBlue': message.role === 'user',
					'ml-4': message.role === 'user',
					'px-2': message.role === 'user',
				}"
			>
				<div class="markdown" v-html="marked.parse(message.content)"></div>
				<span v-if="message.images && message.images.length > 0" class="ml-auto"
					><i class="codicon codicon-file-media"></i>x{{
						message.images.length
					}}</span
				>
			</div>
		</div>
		<!-- /messages -->
		<div class="flex flex-col gap-2">
			<textarea
				v-model="messageToSend"
				class="bg-input-background text-input-foreground focus:border-focusBorder border-none px-2 py-1"
				@keydown="handleKeydown"
			></textarea>
			<div class="flex gap-2 justify-end">
				<button
					type="button"
					class="flex justify-center items-center text-button-secondaryForeground bg-button-secondaryBackground hover:bg-button-secondaryHoverBackground cursor-pointer border-none p-1"
					@click="clear"
				>
					<i class="codicon codicon-clear-all"></i>
				</button>
				<button
					type="button"
					class="flex justify-center items-center text-button-secondaryForeground bg-button-secondaryBackground hover:bg-button-secondaryHoverBackground cursor-pointer border-none p-1"
					@click="triggerFileInput"
				>
					<i class="codicon codicon-file-media"></i>
				</button>
				<input
					ref="file-input"
					type="file"
					multiple
					accept="image/*"
					hidden
					class="hidden"
					@change="handleFileChange"
				/>
				<div v-if="files" class="flex items-center">
					{{ files.length }} selected
				</div>
				<button
					type="button"
					class="flex justify-center items-center text-button-foreground bg-button-background hover:bg-button-hoverBackground cursor-pointer border-none p-1 grow md:max-w-96"
					@click="send"
				>
					<i class="codicon codicon-send"></i>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import '@vscode/codicons/dist/codicon.ttf'
import type { Message, ModelResponse } from 'ollama'
const vscode = acquireVsCodeApi()
// Model list
const models = ref<ModelResponse[]>()
// Current selected model name
const _currentModel = ref('')
const currentModel = computed({
	get() {
		return _currentModel.value
	},
	set(newValue) {
		vscode.postMessage({
			command: 'setModel',
			model: newValue,
		})
		clear()
		_currentModel.value = newValue
	},
})
// Message to send
const messageToSend = ref<string>('')
// File input element
const fileInput = useTemplateRef<HTMLInputElement>('file-input')
// Image files selected
const files = ref<FileList>()
// Chat history messages
const messages = ref<Message[]>([])
// Whether is Mac OS
let isMac = false

// Get local model list
function getModelList() {
	vscode.postMessage({
		command: 'list',
	})
}

// Handle user click choose file button
function triggerFileInput() {
	fileInput.value?.click()
}

// Handle file change
function handleFileChange(e: Event) {
	if (e.target) {
		const target = e.target as HTMLInputElement
		if (target.files) {
			files.value = target.files
		}
	}
}

// Handle keydown event in input textarea
function handleKeydown(e: KeyboardEvent) {
	if (
		(isMac && e.metaKey && e.key === 'Enter') || // Command + Enter on macOS
		(!isMac && e.ctrlKey && e.key === 'Enter') // Ctrl + Enter on other OS
	) {
		e.preventDefault()
		send()
	}
}

// Send chat message
async function send() {
	if (!messageToSend.value) {
		return
	}
	const images: Uint8Array[] = []
	if (files.value) {
		for (let i = 0; i < files.value.length; i++) {
			const file = files.value[i]
			const arrayBuffer = await file.arrayBuffer()
			const uint8Array = new Uint8Array(arrayBuffer)
			images.push(uint8Array)
		}
	}
	const serializedImages = images.map((image) => Array.from(image))
	vscode.postMessage({
		command: 'chat',
		message: messageToSend.value,
		images: serializedImages,
	})
	messages.value.push({
		role: 'user',
		content: messageToSend.value,
		images: images,
	})
	messageToSend.value = ''
	if (fileInput.value) {
		fileInput.value.value = ''
		files.value = undefined
	}
}

// Clear chat history
function clear() {
	messages.value = []
	vscode.postMessage({
		command: 'clear',
	})
}

window.addEventListener('message', (e) => {
	if (e.data.message === 'list') {
		models.value = e.data.models
		if (models.value && models.value.length > 0) {
			currentModel.value = models.value[0].model
		}
	} else if (e.data.message === 'chat') {
		if (e.data.isFirstPart) {
			messages.value.push({
				role: e.data.role,
				content: e.data.content,
			})
		} else {
			messages.value[messages.value.length - 1].content += e.data.content
		}
	}
})
onMounted(() => {
	getModelList()
	isMac = navigator.userAgent.toLowerCase().includes('mac')
})
</script>

<style lang="postcss">
@import '@assets/tailwind.css';
@import '@vscode/codicons/dist/codicon.css';
@source 'app.vue';
@source 'index.html';
.markdown {
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		@apply font-bold;
	}
}
</style>
