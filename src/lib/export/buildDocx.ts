import { Document, Packer, Paragraph, ImageRun, AlignmentType } from 'docx'
import type { CapturedBlock } from './types'
import { fitNaturalSize, dataUrlToUint8Array } from './fitNaturalSize'

const PAGE_W_TWIPS = 11906
const PAGE_H_TWIPS = 16838
const MARGIN_TWIPS = 720 // 0,5 pouce
const USABLE_W_TWIPS = PAGE_W_TWIPS - MARGIN_TWIPS * 2
const USABLE_H_TWIPS = PAGE_H_TWIPS - MARGIN_TWIPS * 2
const GAP_TWIPS = 160
const MAX_W_PX = (USABLE_W_TWIPS / 1440) * 96
const MAX_H_PX = (USABLE_H_TWIPS / 1440) * 96

/** Word (.docx) A4, marges 0,5 pouce — saut de page explicite calculé bloc par bloc. */
export async function buildDocxBlob(images: CapturedBlock[]): Promise<Blob> {
  let cursorTwips = 0
  const paragraphs = images.map(({ dataUrl, widthPx, heightPx }) => {
    const { w: dispW, h: dispH } = fitNaturalSize(widthPx, heightPx, MAX_W_PX, MAX_H_PX, 1)
    const heightTwips = (dispH / 96) * 1440
    let breakBefore = false
    if (cursorTwips > 0 && cursorTwips + heightTwips > USABLE_H_TWIPS) {
      breakBefore = true
      cursorTwips = 0
    }
    cursorTwips += heightTwips + GAP_TWIPS

    return new Paragraph({
      pageBreakBefore: breakBefore,
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [
        new ImageRun({
          type: 'jpg',
          data: dataUrlToUint8Array(dataUrl),
          transformation: { width: Math.round(dispW), height: Math.round(dispH) },
        }),
      ],
    })
  })

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_W_TWIPS, height: PAGE_H_TWIPS },
            margin: { top: MARGIN_TWIPS, bottom: MARGIN_TWIPS, left: MARGIN_TWIPS, right: MARGIN_TWIPS },
          },
        },
        children: paragraphs,
      },
    ],
  })

  return Packer.toBlob(document)
}
