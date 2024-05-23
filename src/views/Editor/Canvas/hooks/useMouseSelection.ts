import { type Ref, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import { getElementRange } from '@/utils/element'

export default (elementList: Ref<PPTElement[]>, viewportRef: Ref<HTMLElement | undefined>) => {
  const mainStore = useMainStore()
  const { canvasScale, hiddenElementIdList } = storeToRefs(mainStore)

  const mouseSelectionVisible = ref(false)
  const mouseSelectionQuadrant = ref(1)
  const mouseSelection = ref({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  })

  
  const updateMouseSelection = (e: MouseEvent) => {
    if (!viewportRef.value) return

    let isMouseDown = true
    const viewportRect = viewportRef.value.getBoundingClientRect()

    const minSelectionRange = 5
    
    const startPageX = e.pageX
    const startPageY = e.pageY

    const left = (startPageX - viewportRect.x) / canvasScale.value
    const top = (startPageY - viewportRect.y) / canvasScale.value

    
    mouseSelection.value = {
      top: top,
      left: left,
      width: 0,
      height: 0,
    }
    mouseSelectionVisible.value = false
    mouseSelectionQuadrant.value = 4

    document.onmousemove = e => {
      if (!isMouseDown) return

      const currentPageX = e.pageX
      const currentPageY = e.pageY

      const offsetWidth = (currentPageX - startPageX) / canvasScale.value
      const offsetHeight = (currentPageY - startPageY) / canvasScale.value

      const width = Math.abs(offsetWidth)
      const height = Math.abs(offsetHeight)

      if ( width < minSelectionRange || height < minSelectionRange ) return
      
      
      
      let quadrant = 0
      if ( offsetWidth > 0 && offsetHeight > 0 ) quadrant = 4
      else if ( offsetWidth < 0 && offsetHeight < 0 ) quadrant = 2
      else if ( offsetWidth > 0 && offsetHeight < 0 ) quadrant = 1
      else if ( offsetWidth < 0 && offsetHeight > 0 ) quadrant = 3

      
      mouseSelection.value = {
        ...mouseSelection.value,
        width: width,
        height: height,
      }
      mouseSelectionVisible.value = true
      mouseSelectionQuadrant.value = quadrant
    }

    document.onmouseup = () => {
      document.onmousemove = null
      document.onmouseup = null
      isMouseDown = false

      
      let inRangeElementList: PPTElement[] = []
      for (let i = 0; i < elementList.value.length; i++) {
        const element = elementList.value[i]
        const mouseSelectionLeft = mouseSelection.value.left
        const mouseSelectionTop = mouseSelection.value.top
        const mouseSelectionWidth = mouseSelection.value.width
        const mouseSelectionHeight = mouseSelection.value.height

        const { minX, maxX, minY, maxY } = getElementRange(element)

        
        let isInclude = false
        if (mouseSelectionQuadrant.value === 4) {
          isInclude = minX > mouseSelectionLeft && 
                      maxX < mouseSelectionLeft + mouseSelectionWidth && 
                      minY > mouseSelectionTop && 
                      maxY < mouseSelectionTop + mouseSelectionHeight
        }
        else if (mouseSelectionQuadrant.value === 2) {
          isInclude = minX > (mouseSelectionLeft - mouseSelectionWidth) && 
                      maxX < (mouseSelectionLeft - mouseSelectionWidth) + mouseSelectionWidth && 
                      minY > (mouseSelectionTop - mouseSelectionHeight) && 
                      maxY < (mouseSelectionTop - mouseSelectionHeight) + mouseSelectionHeight
        }
        else if (mouseSelectionQuadrant.value === 1) {
          isInclude = minX > mouseSelectionLeft && 
                      maxX < mouseSelectionLeft + mouseSelectionWidth && 
                      minY > (mouseSelectionTop - mouseSelectionHeight) && 
                      maxY < (mouseSelectionTop - mouseSelectionHeight) + mouseSelectionHeight
        }
        else if (mouseSelectionQuadrant.value === 3) {
          isInclude = minX > (mouseSelectionLeft - mouseSelectionWidth) && 
                      maxX < (mouseSelectionLeft - mouseSelectionWidth) + mouseSelectionWidth && 
                      minY > mouseSelectionTop && 
                      maxY < mouseSelectionTop + mouseSelectionHeight
        }

        
        if (isInclude && !element.lock && !hiddenElementIdList.value.includes(element.id)) inRangeElementList.push(element)
      }

      
      inRangeElementList = inRangeElementList.filter(inRangeElement => {
        if (inRangeElement.groupId) {
          const inRangeElementIdList = inRangeElementList.map(inRangeElement => inRangeElement.id)
          const groupElementList = elementList.value.filter(element => element.groupId === inRangeElement.groupId)
          return groupElementList.every(groupElement => inRangeElementIdList.includes(groupElement.id))
        }
        return true
      })
      const inRangeElementIdList = inRangeElementList.map(inRangeElement => inRangeElement.id)
      mainStore.setActiveElementIdList(inRangeElementIdList)

      mouseSelectionVisible.value = false
    }
  }

  return {
    mouseSelection,
    mouseSelectionVisible,
    mouseSelectionQuadrant,
    updateMouseSelection,
  }
}