import PptxGenJS from 'pptxgenjs'
import type { CapturedBlock } from './types'
import { fitNaturalSize } from './fitNaturalSize'

const MARGIN_IN = 0.4
const SLIDE_W_IN = 13.333 // LAYOUT_WIDE
const SLIDE_H_IN = 7.5
const USABLE_W_IN = SLIDE_W_IN - MARGIN_IN * 2
const USABLE_H_IN = SLIDE_H_IN - MARGIN_IN * 2
const GAP_IN = 0.15
const PX_PER_INCH = 96

/** PowerPoint (.pptx) 16:9 — même empilement glouton, une diapositive par page pleine. */
export async function buildPptxBlob(images: CapturedBlock[]): Promise<Blob> {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'

  let slide = pptx.addSlide()
  let cursorIn = 0

  images.forEach(({ dataUrl, widthPx, heightPx }) => {
    const { w, h } = fitNaturalSize(widthPx, heightPx, USABLE_W_IN, USABLE_H_IN, PX_PER_INCH)
    const xOffset = (USABLE_W_IN - w) / 2
    if (cursorIn > 0 && cursorIn + h > USABLE_H_IN) {
      slide = pptx.addSlide()
      cursorIn = 0
    }
    slide.addImage({ data: dataUrl, x: MARGIN_IN + xOffset, y: MARGIN_IN + cursorIn, w, h })
    cursorIn += h + GAP_IN
  })

  return (await pptx.write({ outputType: 'blob' })) as Blob
}
