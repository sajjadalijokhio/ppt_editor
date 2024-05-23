import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { nanoid } from 'nanoid'
import { useSlidesStore, useMainStore } from '@/store'
import type { PPTElement, Slide } from '@/types/slides'
import { createSlideIdMap, createElementIdMap, getElementRange } from '@/utils/element'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

export default () => {
  const mainStore = useMainStore()
  const slidesStore = useSlidesStore()
  const { currentSlide, slides } = storeToRefs(slidesStore)

  const { addHistorySnapshot } = useHistorySnapshot()

  /**
   * Add specified element data (a group)
   * @param elements List of element data
   */
  const addElementsFromData = (elements: PPTElement[]) => {
    const { groupIdMap, elIdMap } = createElementIdMap(elements)

    const firstElement = elements[0]
    let offset = 0
    let lastSameElement: PPTElement | undefined
    
    do {
      lastSameElement = currentSlide.value.elements.find(el => {
        if (el.type !== firstElement.type) return false
  
        const { minX: oMinX, maxX: oMaxX, minY: oMinY, maxY: oMaxY } = getElementRange(el)
        const { minX: nMinX, maxX: nMaxX, minY: nMinY, maxY: nMaxY } = getElementRange({
          ...firstElement,
          left: firstElement.left + offset,
          top: firstElement.top + offset
        })
        if (
          oMinX === nMinX &&
          oMaxX === nMaxX &&
          oMinY === nMinY &&
          oMaxY === nMaxY
        ) return true
  
        return false
      })
      if (lastSameElement) offset += 10

    } while (lastSameElement)
    
    for (const element of elements) {
      element.id = elIdMap[element.id]

      element.left = element.left + offset
      element.top = element.top + offset

      if (element.groupId) element.groupId = groupIdMap[element.groupId]
    }
    slidesStore.addElement(elements)
    mainStore.setActiveElementIdList(Object.values(elIdMap))
    addHistorySnapshot()
  }

  /**
   * Add specified slide data
   * @param slide Slide data
   */
  const addSlidesFromData = (slides: Slide[]) => {
    const slideIdMap = createSlideIdMap(slides)
    const newSlides = slides.map(slide => {
      const { groupIdMap, elIdMap } = createElementIdMap(slide.elements)

      for (const element of slide.elements) {
        element.id = elIdMap[element.id]
        if (element.groupId) element.groupId = groupIdMap[element.groupId]
		
        // If the element is bound to a slide link
        if (element.link && element.link.type === 'slide') {

          // If the target slide exists in the slides to be added, replace the related binding
          if (slideIdMap[element.link.target]) {
            element.link.target = slideIdMap[element.link.target]
          }
          // If the target slide does not exist in the slides to be added, remove the link
          else delete element.link
        }
      }
      // Replace animation IDs
      if (slide.animations) {
        for (const animation of slide.animations) {
          animation.id = nanoid(10)
          animation.elId = elIdMap[animation.elId]
        }
      }
      return {
        ...slide,
        id: slideIdMap[slide.id],
      }
    })
    slidesStore.addSlide(newSlides)
    addHistorySnapshot()
  }

  const isEmptySlide = computed(() => {
    if (slides.value.length > 1) return false
    if (slides.value[0].elements.length > 0) return false
    return true
  })

  return {
    addElementsFromData,
    addSlidesFromData,
    isEmptySlide,
  }
}
