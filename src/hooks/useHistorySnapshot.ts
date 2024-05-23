import { debounce, throttle } from 'lodash'
import { useSnapshotStore } from '@/store'

export default () => {
  const snapshotStore = useSnapshotStore()

  // Adds a history snapshot
  const addHistorySnapshot = debounce(() => {
    snapshotStore.addSnapshot()
  }, 300, { trailing: true })

  // Redo action
  const redo = throttle(() => {
    snapshotStore.reDo()
  }, 100, { leading: true, trailing: false })

  // Undo action
  const undo = throttle(() => {
    snapshotStore.unDo()
  }, 100, { leading: true, trailing: false })

  return {
    addHistorySnapshot,
    redo,
    undo,
  }
}
