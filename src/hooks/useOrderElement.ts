import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import { ElementOrderCommands } from '@/types/edit'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

export default () => {
  const slidesStore = useSlidesStore()
  const { currentSlide } = storeToRefs(slidesStore)
  const { addHistorySnapshot } = useHistorySnapshot()

  /**
   * Get the range of levels for combined elements
   * @param elementList List of all elements on the current slide
   * @param combineElementList List of combined elements
   */
  const getCombineElementLevelRange = (elementList: PPTElement[], combineElementList: PPTElement[]) => {
    return {
      minLevel: elementList.findIndex(_element => _element.id === combineElementList[0].id),
      maxLevel: elementList.findIndex(_element => _element.id === combineElementList[combineElementList.length - 1].id),
    }
  }

  /**
   * Move up one level
   * @param elementList List of all elements on the current slide
   * @param element The element to be moved
   */
  const moveUpElement = (elementList: PPTElement[], element: PPTElement) => {
    const copyOfElementList: PPTElement[] = JSON.parse(JSON.stringify(elementList))

    if (element.groupId) {
      const combineElementList = copyOfElementList.filter(_element => _element.groupId === element.groupId)
      const { minLevel, maxLevel } = getCombineElementLevelRange(elementList, combineElementList)
      if (maxLevel === elementList.length - 1) return

      const nextElement = copyOfElementList[maxLevel + 1]
      const movedElementList = copyOfElementList.splice(minLevel, combineElementList.length)

      if (nextElement.groupId) {
        const nextCombineElementList = copyOfElementList.filter(_element => _element.groupId === nextElement.groupId)
        copyOfElementList.splice(minLevel + nextCombineElementList.length, 0, ...movedElementList)
      } 
      else {
        copyOfElementList.splice(minLevel + 1, 0, ...movedElementList)
      }
    }
    else {
      const level = elementList.findIndex(item => item.id === element.id)
      if (level === elementList.length - 1) return

      const nextElement = copyOfElementList[level + 1]
      const movedElement = copyOfElementList.splice(level, 1)[0]

      if (nextElement.groupId) {
        const combineElementList = copyOfElementList.filter(_element => _element.groupId === nextElement.groupId)
        copyOfElementList.splice(level + combineElementList.length, 0, movedElement)
      } 
      else {
        copyOfElementList.splice(level + 1, 0, movedElement)
      }
    }

    return copyOfElementList
  }

  /**
   * Move down one level
   * @param elementList List of all elements on the current slide
   * @param element The element to be moved
   */
  const moveDownElement = (elementList: PPTElement[], element: PPTElement) => {
    const copyOfElementList: PPTElement[] = JSON.parse(JSON.stringify(elementList))

    if (element.groupId) {
      const combineElementList = copyOfElementList.filter(_element => _element.groupId === element.groupId)
      const { minLevel } = getCombineElementLevelRange(elementList, combineElementList)
      if (minLevel === 0) return

      const prevElement = copyOfElementList[minLevel - 1]
      const movedElementList = copyOfElementList.splice(minLevel, combineElementList.length)

      if (prevElement.groupId) {
        const prevCombineElementList = copyOfElementList.filter(_element => _element.groupId === prevElement.groupId)
        copyOfElementList.splice(minLevel - prevCombineElementList.length, 0, ...movedElementList)
      } 
      else {
        copyOfElementList.splice(minLevel - 1, 0, ...movedElementList)
      }
    } 
    else {
      const level = elementList.findIndex(item => item.id === element.id)
      if (level === 0) return

      const prevElement = copyOfElementList[level - 1]
      const movedElement = copyOfElementList.splice(level, 1)[0]

      if (prevElement.groupId) {
        const combineElementList = copyOfElementList.filter(_element => _element.groupId === prevElement.groupId)
        copyOfElementList.splice(level - combineElementList.length, 0, movedElement)
      } 
      else {
        copyOfElementList.splice(level - 1, 0, movedElement)
      }
    }

    return copyOfElementList
  }

  /**
   * Move to the top level
   * @param elementList List of all elements on the current slide
   * @param element The element to be moved
   */
  const moveTopElement = (elementList: PPTElement[], element: PPTElement) => {
    const copyOfElementList: PPTElement[] = JSON.parse(JSON.stringify(elementList))

    if (element.groupId) {
      const combineElementList = copyOfElementList.filter(_element => _element.groupId === element.groupId)
      const { maxLevel } = getCombineElementLevelRange(elementList, combineElementList)
      if (maxLevel === elementList.length - 1) return null

      const movedElementList = copyOfElementList.splice(maxLevel + 1 - combineElementList.length, combineElementList.length)
      copyOfElementList.push(...movedElementList)
    } 
    else {
      const level = elementList.findIndex(item => item.id === element.id)
      if (level === elementList.length - 1) return null

      const movedElement = copyOfElementList.splice(level, 1)[0]
      copyOfElementList.push(movedElement)
    }

    return copyOfElementList
  }

  /**
   * Move to the bottom level
   * @param elementList List of all elements on the current slide
   * @param element The element to be moved
   */
  const moveBottomElement = (elementList: PPTElement[], element: PPTElement) => {
    const copyOfElementList: PPTElement[] = JSON.parse(JSON.stringify(elementList))

    if (element.groupId) {
      const combineElementList = copyOfElementList.filter(_element => _element.groupId === element.groupId)
      const { minLevel } = getCombineElementLevelRange(elementList, combineElementList)
      if (minLevel === 0) return null

      const movedElementList = copyOfElementList.splice(minLevel, combineElementList.length)
      copyOfElementList.unshift(...movedElementList)
    } 
    else {
      const level = elementList.findIndex(item => item.id === element.id)
      if (level === 0) return null

      const movedElement = copyOfElementList.splice(level, 1)[0]
      copyOfElementList.unshift(movedElement)
    }

    return copyOfElementList
  }

  /**
   * Adjust the element order
   * @param element The element whose order needs to be adjusted
   * @param command The order adjustment command: up, down, top, bottom
   */
  const orderElement = (element: PPTElement, command: ElementOrderCommands) => {
    let newElementList

    if (command === ElementOrderCommands.UP) newElementList = moveUpElement(currentSlide.value.elements, element)
    else if (command === ElementOrderCommands.DOWN) newElementList = moveDownElement(currentSlide.value.elements, element)
    else if (command === ElementOrderCommands.TOP) newElementList = moveTopElement(currentSlide.value.elements, element)
    else if (command === ElementOrderCommands.BOTTOM) newElementList = moveBottomElement(currentSlide.value.elements, element)

    if (!newElementList) return

    slidesStore.updateSlide({ elements: newElementList })
    addHistorySnapshot()
  }

  return {
    orderElement,
  }
}
