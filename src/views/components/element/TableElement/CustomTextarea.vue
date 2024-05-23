<template>
  <div 
    class="custom-textarea"
    ref="textareaRef"
    :contenteditable="true"
    @focus="handleFocus()"
    @blur="handleBlur()"
    @input="handleInput()"
    v-html="text"
  ></div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { pasteCustomClipboardString, pasteExcelClipboardString } from '@/utils/clipboard'

const props = withDefaults(defineProps<{
  value?: string
}>(), {
  value: '',
})

const emit = defineEmits<{
  (event: 'updateValue', payload: string): void
  (event: 'insertExcelData', payload: string[][]): void
}>()

const textareaRef = ref<HTMLElement>()
const text = ref('')
const isFocus = ref(false)

// Custom v-model for data synchronization
// Do not sync data when the textarea is focused
watch(() => props.value, () => {
  if (isFocus.value) return
  text.value = props.value
  if (textareaRef.value) textareaRef.value.innerHTML = props.value
}, { immediate: true })

const handleInput = () => {
  if (!textareaRef.value) return
  const text = textareaRef.value.innerHTML
  emit('updateValue', text)
}

// Update focus flag on focus and listen for paste events
const handleFocus = () => {
  isFocus.value = true

  if (!textareaRef.value) return
  textareaRef.value.onpaste = (e: ClipboardEvent) => {
    e.preventDefault()
    if (!e.clipboardData) return

    const clipboardDataFirstItem = e.clipboardData.items[0]

    if (clipboardDataFirstItem && clipboardDataFirstItem.kind === 'string' && clipboardDataFirstItem.type === 'text/plain') {
      clipboardDataFirstItem.getAsString(text => {
        const clipboardData = pasteCustomClipboardString(text)
        if (typeof clipboardData === 'object') return
 
        const excelData = pasteExcelClipboardString(text)
        if (excelData) {
          emit('insertExcelData', excelData)
          if (textareaRef.value) textareaRef.value.innerHTML = excelData[0][0]
          return
        }

        document.execCommand('insertText', false, text)
      })
    }
  }
}

// Update focus flag on blur and remove paste event listener
const handleBlur = () => {
  isFocus.value = false
  if (textareaRef.value) textareaRef.value.onpaste = null
}

// Remove paste event listener on component unmount
onBeforeUnmount(() => {
  if (textareaRef.value) textareaRef.value.onpaste = null
})
</script>

<style lang="scss" scoped>
.custom-textarea {
  border: 0;
  outline: 0;
  -webkit-user-modify: read-write-plaintext-only;
}
</style>
