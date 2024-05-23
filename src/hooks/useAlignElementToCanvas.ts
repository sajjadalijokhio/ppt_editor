import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import { ElementAlignCommands } from '@/types/edit'
import { getElementListRange } from '@/utils/element'
import { VIEWPORT_SIZE } from '@/configs/canvas'
import useHistorySnapshot from './useHistorySnapshot'

export default () => {
  const slidesStore = useSlidesStore()
  const { activeElementIdList, activeElementList } = storeToRefs(useMainStore())
  const { currentSlide, viewportRatio } = storeToRefs(slidesStore)

  const { addHistorySnapshot } = useHistorySnapshot()

  /**
   * Aligns all selected elements to the canvas.
   * @param command The alignment command.
   */
  const alignElementToCanvas = (command: ElementAlignCommands) => {
    const viewportWidth = VIEWPORT_SIZE
    const viewportHeight = VIEWPORT_SIZE * viewportRatio.value
    const { minX, maxX, minY, maxY } = getElementListRange(activeElementList.value)
  
    const newElementList: PPTElement[] = JSON.parse(JSON.stringify(currentSlide.value.elements))
    for (const element of newElementList) {
      if (!activeElementIdList.value.includes(element.id)) continue
      
      // Center horizontally and vertically
      if (command === ElementAlignCommands.CENTER) {
        const offsetY = minY + (maxY - minY) / 2 - viewportHeight / 2
        const offsetX = minX + (maxX - minX) / 2 - viewportWidth / 2
        element.top -= offsetY 
        element.left -= offsetX           
      }

      // Align to the top
      if (command === ElementAlignCommands.TOP) {
        const offsetY = minY - 0
        element.top -= offsetY            
      }

      // Center vertically
      else if (command === ElementAlignCommands.VERTICAL) {
        const offsetY = minY + (maxY - minY) / 2 - viewportHeight / 2
        element.top -= offsetY            
      }

      // Align to the bottom
      else if (command === ElementAlignCommands.BOTTOM) {
        const offsetY = maxY - viewportHeight
        element.top -= offsetY       
      }
      
      // Align to the left
      else if (command === ElementAlignCommands.LEFT) {
        const offsetX = minX - 0
        element.left -= offsetX            
      }

      // Center horizontally
      else if (command === ElementAlignCommands.HORIZONTAL) {
        const offsetX = minX + (maxX - minX) / 2 - viewportWidth / 2
        element.left -= offsetX            
      }

      // Align to the right
      else if (command === ElementAlignCommands.RIGHT) {
        const offsetX = maxX - viewportWidth
        element.left -= offsetX            
      }
    }

    slidesStore.updateSlide({ elements: newElementList })
    addHistorySnapshot()
  }

  return {
    alignElementToCanvas,
  }
}
