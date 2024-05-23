import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

export default () => {
  const mainStore = useMainStore()
  const slidesStore = useSlidesStore()
  const { activeElementIdList } = storeToRefs(mainStore)
  const { currentSlide } = storeToRefs(slidesStore)
  const { addHistorySnapshot } = useHistorySnapshot()

  // Lock selected elements and clear active element status
  const lockElement = (): void => {
    const newElementList: PPTElement[] = currentSlide.value.elements.map(element => ({
      ...element,
      lock: activeElementIdList.value.includes(element.id),
    }))

    slidesStore.updateSlide({ elements: newElementList })
    mainStore.setActiveElementIdList([])
    addHistorySnapshot()
  }

  /**
   * Unlock an element and set it as the currently selected element
   * @param handleElement Element to unlock
   */
  const unlockElement = (handleElement: PPTElement): void => {
    const newElementList: PPTElement[] = currentSlide.value.elements.map(element => {
      if (element.groupId && element.groupId === handleElement.groupId) {
        return { ...element, lock: false }
      } 
      else if (element.id === handleElement.id) {
        return { ...element, lock: false }
      } 
      
      return element
      
    })

    slidesStore.updateSlide({ elements: newElementList })
    mainStore.setActiveElementIdList(handleElement.groupId ? newElementList.filter(element => element.groupId === handleElement.groupId).map(element => element.id) : [handleElement.id])
    addHistorySnapshot()
  }

  return {
    lockElement,
    unlockElement,
  }
}
