import { defineStore } from 'pinia'

export interface ScreenState {
  screening: boolean
}

export const useScreenStore = defineStore('screen', {
  state: (): ScreenState => ({
    screening: false, // Whether or not to enter the projection state
  }),

  actions: {
    setScreening(screening: boolean) {
      this.screening = screening
    },
  },
})