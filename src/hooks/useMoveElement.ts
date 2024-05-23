import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import { KEYS } from '@/configs/hotkey'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

export default () => {
  const mainStore = useMainStore()
  const slidesStore = useSlidesStore()
  const { activeElementIdList, activeGroupElementId } = storeToRefs(mainStore)
  const { currentSlide } = storeToRefs(slidesStore)
  const { addHistorySnapshot } = useHistorySnapshot()

  /**
   * Move elements in the specified direction by the given distance
   * If there are individually operable elements within a group, move the priority element.
   * Otherwise, move all selected elements by default.
   * @param command Direction of movement
   * @param step Distance to move
   */
  const moveElement = (command: string, step = 1): void => {
    const move = (el: PPTElement): PPTElement => {
      const { left, top } = el
      switch (command) {
        case KEYS.LEFT: 
          return { ...el, left: left - step }
        case KEYS.RIGHT: 
          return { ...el, left: left + step }
        case KEYS.UP: 
          return { ...el, top: top - step }
        case KEYS.DOWN: 
          return { ...el, top: top + step }
        default: 
          return el
      }
    }

    const newElementList: PPTElement[] = currentSlide.value.elements.map(el => {
      if (activeGroupElementId.value && activeGroupElementId.value === el.id) {
        return move(el)
      } 
      else if (activeElementIdList.value.includes(el.id)) {
        return move(el)
      } 
      
      return el
      
    })

    slidesStore.updateSlide({ elements: newElementList })
    addHistorySnapshot()
  }

  return {
    moveElement,
  }
}
