import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

export default () => {
  const mainStore = useMainStore()
  const slidesStore = useSlidesStore()
  const { activeElementIdList, activeGroupElementId } = storeToRefs(mainStore)
  const { currentSlide } = storeToRefs(slidesStore)

  const { addHistorySnapshot } = useHistorySnapshot()

  // Deletes all selected elements
  // If there are individually selectable elements within a grouped element, delete the individual element first. Otherwise, delete all selected elements by default
  const deleteElement = () => {
    if (!activeElementIdList.value.length) return

    let newElementList: PPTElement[] = []
    if (activeGroupElementId.value) {
      newElementList = currentSlide.value.elements.filter(el => el.id !== activeGroupElementId.value)
    }
    else {
      newElementList = currentSlide.value.elements.filter(el => !activeElementIdList.value.includes(el.id))
    }

    mainStore.setActiveElementIdList([])
    slidesStore.updateSlide({ elements: newElementList })
    addHistorySnapshot()
  }

  // Deletes all elements within the slide (regardless of selection)
  const deleteAllElements = () => {
    if (!currentSlide.value.elements.length) return
    mainStore.setActiveElementIdList([])
    slidesStore.updateSlide({ elements: [] })
    addHistorySnapshot()
  }

  return {
    deleteElement,
    deleteAllElements,
  }
}
