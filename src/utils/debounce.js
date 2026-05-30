/**
 * @param {(...args: unknown[]) => void} fn
 * @param {number} waitMs
 */
export function debounce(fn, waitMs = 400) {
  let timer = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, waitMs)
  }
}
