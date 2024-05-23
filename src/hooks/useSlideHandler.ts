import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { nanoid } from 'nanoid'
import { useMainStore, useSlidesStore } from '@/store'
import type { Slide } from '@/types/slides'
import { copyText, readClipboard } from '@/utils/clipboard'
import { encrypt } from '@/utils/crypto'
import { createElementIdMap } from '@/utils/element'
import { KEYS } from '@/configs/hotkey'
import message from '@/utils/message'
import usePasteTextClipboardData from '@/hooks/usePasteTextClipboardData'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import useAddSlidesOrElements from '@/hooks/useAddSlidesOrElements'

export default () => {
  const mainStore = useMainStore()
  const slidesStore = useSlidesStore()
  const { selectedSlidesIndex: _selectedSlidesIndex, activeElementIdList } = storeToRefs(mainStore)
  const { currentSlide, slides, theme, slideIndex } = storeToRefs(slidesStore)

  const selectedSlidesIndex = computed(() => [..._selectedSlidesIndex.value, slideIndex.value])
  const selectedSlides = computed(() => slides.value.filter((item, index) => selectedSlidesIndex.value.includes(index)))
  const selectedSlidesId = computed(() => selectedSlides.value.map(item => item.id))

  const { pasteTextClipboardData } = usePasteTextClipboardData()
  const { addSlidesFromData } = useAddSlidesOrElements()
  const { addHistorySnapshot } = useHistorySnapshot()

  // Reset slides
  const resetSlides = () => {
    const emptySlide: Slide = {
      id: nanoid(10),
      elements: [],
      background: {
        type: 'solid',
        color: theme.value.backgroundColor,
      },
    }
    slidesStore.updateSlideIndex(0)
    mainStore.setActiveElementIdList([])
    slidesStore.setSlides([emptySlide])
  }

  /**
   * Move slide focus
   * @param command Move slide focus command: up, down
   */
  const updateSlideIndex = (command: string) => {
    if (command === KEYS.UP && slideIndex.value > 0) {
      if (activeElementIdList.value.length) mainStore.setActiveElementIdList([])
      slidesStore.updateSlideIndex(slideIndex.value - 1)
    }
    else if (command === KEYS.DOWN && slideIndex.value < slides.value.length - 1) {
      if (activeElementIdList.value.length) mainStore.setActiveElementIdList([])
      slidesStore.updateSlideIndex(slideIndex.value + 1)
    }
  }

  // Copy current slide data encrypted to clipboard
  const copySlide = () => {
    const text = encrypt(JSON.stringify({
      type: 'slides',
      data: selectedSlides.value,
    }))

    copyText(text).then(() => {
      mainStore.setThumbnailsFocus(true)
    })
  }

  // Attempt to decrypt clipboard slide data and add to next page (paste)
  const pasteSlide = () => {
    readClipboard().then(text => {
      pasteTextClipboardData(text, { onlySlide: true })
    }).catch(err => message.warning(err))
  }

  // Create a new blank slide and add it to the next page
  const createSlide = () => {
    const emptySlide: Slide = {
      id: nanoid(10),
      elements: [],
      background: {
        type: 'solid',
        color: theme.value.backgroundColor,
      },
    }
    mainStore.setActiveElementIdList([])
    slidesStore.addSlide(emptySlide)
    addHistorySnapshot()
  }

  // Create a new slide based on the template
  const createSlideByTemplate = (slide: Slide) => {
    const { groupIdMap, elIdMap } = createElementIdMap(slide.elements)

    for (const element of slide.elements) {
      element.id = elIdMap[element.id]
      if (element.groupId) element.groupId = groupIdMap[element.groupId]
    }
    const newSlide = {
      ...slide,
      id: nanoid(10),
    }
    mainStore.setActiveElementIdList([])
    slidesStore.addSlide(newSlide)
    addHistorySnapshot()
  }

  // Copy the current page and paste it to the next page
  const copyAndPasteSlide = () => {
    const slide = JSON.parse(JSON.stringify(currentSlide.value))
    addSlidesFromData([slide])
  }

  // Delete the current page. If all pages are to be deleted, perform the reset slides operation.
  const deleteSlide = (targetSlidesId = selectedSlidesId.value) => {
    if (slides.value.length === targetSlidesId.length) resetSlides()
    else slidesStore.deleteSlide(targetSlidesId)

    mainStore.updateSelectedSlidesIndex([])

    addHistorySnapshot()
  }

  // Copy the current page, then delete it (cut)
  // Since copying will cause the multi-select state to disappear, the IDs of the pages to be deleted need to be cached in advance
  const cutSlide = () => {
    const targetSlidesId = [...selectedSlidesId.value]
    copySlide()
    deleteSlide(targetSlidesId)
  }

  // Select all slides
  const selectAllSlide = () => {
    const newSelectedSlidesIndex = Array.from(Array(slides.value.length), (item, index) => index)
    mainStore.setActiveElementIdList([])
    mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
  }

  // Synchronize data when dragging to adjust the slide order
  const sortSlides = (newIndex: number, oldIndex: number) => {
    if (oldIndex === newIndex) return
  
    const _slides = JSON.parse(JSON.stringify(slides.value))
    const _slide = _slides[oldIndex]
    _slides.splice(oldIndex, 1)
    _slides.splice(newIndex, 0, _slide)
    slidesStore.setSlides(_slides)
    slidesStore.updateSlideIndex(newIndex)
  }

  return {
    resetSlides,
    updateSlideIndex,
    copySlide,
    pasteSlide,
    createSlide,
    createSlideByTemplate,
    copyAndPasteSlide,
    deleteSlide,
    cutSlide,
    selectAllSlide,
    sortSlides,
  }
}
