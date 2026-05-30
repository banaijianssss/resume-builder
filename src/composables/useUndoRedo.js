import { ref, computed } from 'vue'

const MAX_STACK = 40

/**
 * @param {() => object} getSnapshot
 * @param {(snap: object) => void} applySnapshot
 */
export function useUndoRedo(getSnapshot, applySnapshot) {
  const undoStack = ref([])
  const redoStack = ref([])
  let recordingPaused = false

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  function record() {
    if (recordingPaused) return
    const snap = JSON.stringify(getSnapshot())
    const last = undoStack.value[undoStack.value.length - 1]
    if (last === snap) return
    undoStack.value.push(snap)
    if (undoStack.value.length > MAX_STACK) undoStack.value.shift()
    redoStack.value = []
  }

  function pauseRecording(fn) {
    recordingPaused = true
    try {
      return fn()
    } finally {
      recordingPaused = false
    }
  }

  function undo() {
    if (!canUndo.value) return false
    redoStack.value.push(JSON.stringify(getSnapshot()))
    const prev = undoStack.value.pop()
    recordingPaused = true
    applySnapshot(JSON.parse(prev))
    recordingPaused = false
    return true
  }

  function redo() {
    if (!canRedo.value) return false
    undoStack.value.push(JSON.stringify(getSnapshot()))
    const next = redoStack.value.pop()
    recordingPaused = true
    applySnapshot(JSON.parse(next))
    recordingPaused = false
    return true
  }

  function clearHistory() {
    undoStack.value = []
    redoStack.value = []
  }

  return { canUndo, canRedo, record, undo, redo, clearHistory, pauseRecording }
}
