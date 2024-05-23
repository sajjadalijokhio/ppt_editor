import { onMounted, onUnmounted, ref } from 'vue'
import { throttle } from 'lodash'
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import { KEYS } from '@/configs/hotkey'
import { ANIMATION_CLASS_PREFIX } from '@/configs/animation'
import message from '@/utils/message'

export default () => {
  const slidesStore = useSlidesStore()
  const { slides, slideIndex, formatedAnimations } = storeToRefs(slidesStore)

  
  const animationIndex = ref(0)

  
  const inAnimation = ref(false)

  
  const playedSlidesMinIndex = ref(slideIndex.value)

  
  const runAnimation = () => {
    
    if (inAnimation.value) return

    const { animations, autoNext } = formatedAnimations.value[animationIndex.value]
    animationIndex.value += 1

    
    inAnimation.value = true

    let endAnimationCount = 0

    
    for (const animation of animations) {
      const elRef: HTMLElement | null = document.querySelector(`#screen-element-${animation.elId} [class^=base-element-]`)
      if (!elRef) {
        endAnimationCount += 1
        continue
      }

      const animationName = `${ANIMATION_CLASS_PREFIX}${animation.effect}`
      
      
      elRef.style.removeProperty('--animate-duration')
      for (const classname of elRef.classList) {
        if (classname.indexOf(ANIMATION_CLASS_PREFIX) !== -1) elRef.classList.remove(classname, `${ANIMATION_CLASS_PREFIX}animated`)
      }
      
      
      elRef.style.setProperty('--animate-duration', `${animation.duration}ms`)
      elRef.classList.add(animationName, `${ANIMATION_CLASS_PREFIX}animated`)

      
      const handleAnimationEnd = () => {
        if (animation.type !== 'out') {
          elRef.style.removeProperty('--animate-duration')
          elRef.classList.remove(animationName, `${ANIMATION_CLASS_PREFIX}animated`)
        }

        
        endAnimationCount += 1
        if (endAnimationCount === animations.length) {
          inAnimation.value = false
          if (autoNext) runAnimation()
        }
      }
      elRef.addEventListener('animationend', handleAnimationEnd, { once: true })
    }
  }

  
  const revokeAnimation = () => {
    animationIndex.value -= 1
    const { animations } = formatedAnimations.value[animationIndex.value]

    for (const animation of animations) {
      const elRef: HTMLElement | null = document.querySelector(`#screen-element-${animation.elId} [class^=base-element-]`)
      if (!elRef) continue
      
      elRef.style.removeProperty('--animate-duration')
      for (const classname of elRef.classList) {
        if (classname.indexOf(ANIMATION_CLASS_PREFIX) !== -1) elRef.classList.remove(classname, `${ANIMATION_CLASS_PREFIX}animated`)
      }
    }

    
    if (animations.every(item => item.type === 'attention')) execPrev()
  }

  
  const autoPlayTimer = ref(0)
  const closeAutoPlay = () => {
    if (autoPlayTimer.value) {
      clearInterval(autoPlayTimer.value)
      autoPlayTimer.value = 0
    }
  }
  onUnmounted(closeAutoPlay)

  
  const loopPlay = ref(false)
  const setLoopPlay = (loop: boolean) => {
    loopPlay.value = loop
  }

  const throttleMassage = throttle(function(msg) {
    message.success(msg)
  }, 1000, { leading: true, trailing: false })

  
  
  
  
  const execPrev = () => {
    if (formatedAnimations.value.length && animationIndex.value > 0) {
      revokeAnimation()
    }
    else if (slideIndex.value > 0) {
      slidesStore.updateSlideIndex(slideIndex.value - 1)
      if (slideIndex.value < playedSlidesMinIndex.value) {
        animationIndex.value = 0
        playedSlidesMinIndex.value = slideIndex.value
      }
      else animationIndex.value = formatedAnimations.value.length
    }
    else {
      if (loopPlay.value) turnSlideToIndex(slides.value.length - 1)
      else throttleMassage('Its already the first page')
    }
    inAnimation.value = false
  }
  const execNext = () => {
    if (formatedAnimations.value.length && animationIndex.value < formatedAnimations.value.length) {
      runAnimation()
    }
    else if (slideIndex.value < slides.value.length - 1) {
      slidesStore.updateSlideIndex(slideIndex.value + 1)
      animationIndex.value = 0
      inAnimation.value = false
    }
    else {
      if (loopPlay.value) turnSlideToIndex(0)
      else {
        throttleMassage('Its already the first page')
        closeAutoPlay()
      }
      inAnimation.value = false
    }
  }

  
  const autoPlayInterval = ref(2500)
  const autoPlay = () => {
    closeAutoPlay()
    message.success('start自动放映')
    autoPlayTimer.value = setInterval(execNext, autoPlayInterval.value)
  }

  const setAutoPlayInterval = (interval: number) => {
    closeAutoPlay()
    autoPlayInterval.value = interval
    autoPlay()
  }

  
  const mousewheelListener = throttle(function(e: WheelEvent) {
    if (e.deltaY < 0) execPrev()
    else if (e.deltaY > 0) execNext()
  }, 500, { leading: true, trailing: false })

  
  const touchInfo = ref<{ x: number; y: number; } | null>(null)

  const touchStartListener = (e: TouchEvent) => {
    touchInfo.value = {
      x: e.changedTouches[0].pageX,
      y: e.changedTouches[0].pageY,
    }
  }
  const touchEndListener = (e: TouchEvent) => {
    if (!touchInfo.value) return

    const offsetX = Math.abs(touchInfo.value.x - e.changedTouches[0].pageX)
    const offsetY = e.changedTouches[0].pageY - touchInfo.value.y

    if ( Math.abs(offsetY) > offsetX && Math.abs(offsetY) > 50 ) {
      touchInfo.value = null

      if (offsetY > 0) execPrev()
      else execNext()
    }
  }

  
  const keydownListener = (e: KeyboardEvent) => {
    const key = e.key.toUpperCase()

    if (key === KEYS.UP || key === KEYS.LEFT || key === KEYS.PAGEUP) execPrev()
    else if (
      key === KEYS.DOWN || 
      key === KEYS.RIGHT ||
      key === KEYS.SPACE || 
      key === KEYS.ENTER ||
      key === KEYS.PAGEDOWN
    ) execNext()
  }

  onMounted(() => document.addEventListener('keydown', keydownListener))
  onUnmounted(() => document.removeEventListener('keydown', keydownListener))

  
  const turnPrevSlide = () => {
    slidesStore.updateSlideIndex(slideIndex.value - 1)
    animationIndex.value = 0
  }
  const turnNextSlide = () => {
    slidesStore.updateSlideIndex(slideIndex.value + 1)
    animationIndex.value = 0
  }

  
  const turnSlideToIndex = (index: number) => {
    slidesStore.updateSlideIndex(index)
    animationIndex.value = 0
  }
  const turnSlideToId = (id: string) => {
    const index = slides.value.findIndex(slide => slide.id === id)
    if (index !== -1) {
      slidesStore.updateSlideIndex(index)
      animationIndex.value = 0
    }
  }

  return {
    autoPlayTimer,
    autoPlayInterval,
    setAutoPlayInterval,
    autoPlay,
    closeAutoPlay,
    loopPlay,
    setLoopPlay,
    mousewheelListener,
    touchStartListener,
    touchEndListener,
    turnPrevSlide,
    turnNextSlide,
    turnSlideToIndex,
    turnSlideToId,
    execPrev,
    execNext,
    animationIndex,
  }
}
