import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import { copyText, readClipboard } from '@/utils/clipboard'
import { encrypt, decrypt } from '@/utils/crypto'
import message from '@/utils/message'
import usePasteTextClipboardData from '@/hooks/usePasteTextClipboardData'
import useDeleteElement from './useDeleteElement'

export default () => {
  const mainStore = useMainStore()
  const { activeElementIdList, activeElementList } = storeToRefs(mainStore)

  const { pasteTextClipboardData } = usePasteTextClipboardData()
  const { deleteElement } = useDeleteElement()

  // Copies the selected element data to the clipboard after encrypting it
  const copyElement = () => {
    if (!activeElementIdList.value.length) return

    const text = encrypt(JSON.stringify({
      type: 'elements',
      data: activeElementList.value,
    }))

    copyText(text).then(() => {
      mainStore.setEditorareaFocus(true)
    })
  }

  // Copies the selected element data to the clipboard and deletes (cuts) it
  const cutElement = () => {
    copyElement()
    deleteElement()
  }

  // Attempts to decrypt clipboard element data and paste it
  const pasteElement = () => {
    readClipboard().then(text => {
      const decryptedText = decrypt(text)
      if (decryptedText) {
        pasteTextClipboardData(decryptedText)
      } 
      else {
        message.warning('Failed to decrypt clipboard data.')
      }
    }).catch(err => message.warning(err))
  }

  // Copies the selected element data to the clipboard and immediately pastes it
  const quickCopyElement = () => {
    copyElement()
    pasteElement()
  }

  return {
    copyElement,
    cutElement,
    pasteElement,
    quickCopyElement,
  }
}
