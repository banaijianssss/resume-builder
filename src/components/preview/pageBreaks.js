const A4_HEIGHT_MM = 297
const MIN_SECTION_HEIGHT_PX = 40
const MIN_REMAINING_ON_PAGE_PX = 48

/**
 * 计算 A4 分页线位置，尽量对齐到模块边界，避免虚线穿过模块中间
 */
export function calculateSmartPageBreaks(paperEl) {
  if (!paperEl?.offsetWidth) return []

  const pxW = paperEl.offsetWidth
  const mmPerPx = 210 / pxW
  const pageHeightPx = A4_HEIGHT_MM / mmPerPx

  const totalPx = paperEl.scrollHeight
  const pageCount = Math.ceil(totalPx / pageHeightPx)
  if (pageCount <= 1) return []

  const paperRect = paperEl.getBoundingClientRect()

  const sectionBounds = [...paperEl.querySelectorAll('[data-resume-section]')]
    .map((el) => {
      const rect = el.getBoundingClientRect()
      const top = rect.top - paperRect.top
      return { top, bottom: top + rect.height, height: rect.height }
    })
    .filter((s) => s.height >= MIN_SECTION_HEIGHT_PX)

  const breaks = []

  for (let page = 1; page < pageCount; page++) {
    let boundary = page * pageHeightPx

    const crossing = sectionBounds.find(
      (s) =>
        s.top < boundary &&
        s.bottom > boundary &&
        s.top > (page - 1) * pageHeightPx + MIN_REMAINING_ON_PAGE_PX
    )

    if (crossing) {
      boundary = Math.max(crossing.top - 4, (page - 1) * pageHeightPx + 8)
    }

    const last = breaks[breaks.length - 1]
    if (boundary > 0 && (!last || boundary > last + 16)) {
      breaks.push(boundary)
    }
  }

  return breaks
}
