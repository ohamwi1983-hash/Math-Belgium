import { jsPDF } from 'jspdf'
import type { CapturedBlock } from './types'
import { fitNaturalSize } from './fitNaturalSize'

const MARGIN_MM = 15
const PAGE_W_MM = 210
const PAGE_H_MM = 297
const USABLE_W_MM = PAGE_W_MM - MARGIN_MM * 2
const USABLE_H_MM = PAGE_H_MM - MARGIN_MM * 2
const GAP_MM = 4
const PX_PER_MM = 96 / 25.4

/** PDF A4 — empilement glouton : un bloc suivant tient tant qu'il reste de la place, sinon nouvelle page. */
export function buildPdfBlob(images: CapturedBlock[]): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let cursorY = MARGIN_MM
  let firstOnPage = true

  images.forEach(({ dataUrl, widthPx, heightPx }) => {
    const { w, h } = fitNaturalSize(widthPx, heightPx, USABLE_W_MM, USABLE_H_MM, PX_PER_MM)
    if (!firstOnPage && cursorY + h > MARGIN_MM + USABLE_H_MM) {
      doc.addPage()
      cursorY = MARGIN_MM
      firstOnPage = true
    }
    const x = MARGIN_MM + (USABLE_W_MM - w) / 2
    doc.addImage(dataUrl, 'JPEG', x, cursorY, w, h)
    cursorY += h + GAP_MM
    firstOnPage = false
  })

  return doc.output('blob')
}
