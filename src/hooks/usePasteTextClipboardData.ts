import { pasteCustomClipboardString } from '@/utils/clipboard'
import { parseText2Paragraphs } from '@/utils/textParser'
import useCreateElement from '@/hooks/useCreateElement'
import useAddSlidesOrElements from '@/hooks/useAddSlidesOrElements'

interface PasteTextClipboardDataOptions {
  onlySlide?: boolean
  onlyElements?: boolean
}

export default () => {
  const { createTextElement } = useCreateElement()
  const { addElementsFromData, addSlidesFromData } = useAddSlidesOrElements()

  /**
   * Paste regular text: create a new text element
   * @param text Text
   */
  const createTextElementFromClipboard = (text: string) => {
    createTextElement({
      left: 0,
      top: 0,
      width: 600,
      height: 50,
    }, { content: text })
  }

  /**
   * Parse clipboard content and choose the appropriate pasting method based on the parsing result
   * @param text Clipboard content
   * @param options Configuration options: onlySlide -- process only slide pasting; onlyElements -- process only element pasting;
   */
  const pasteTextClipboardData = (text: string, options?: PasteTextClipboardDataOptions) => {
    const onlySlide = options?.onlySlide || false
    const onlyElements = options?.onlyElements || false

    const clipboardData = pasteCustomClipboardString(text)

    // Element or slide
    if (typeof clipboardData === 'object') {
      const { type, data } = clipboardData

      if (type === 'elements' && !onlySlide) addElementsFromData(data)
      else if (type === 'slides' && !onlyElements) addSlidesFromData(data)
    }

    // Regular text
    else if (!onlyElements && !onlySlide) {
      const string = parseText2Paragraphs(clipboardData)
      createTextElementFromClipboard(string)
    }
  }

  return {
    pasteTextClipboardData,
  }
}
