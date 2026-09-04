/** One captured content block, ready to be laid out on a page/slide. */
export interface CapturedBlock {
  dataUrl: string
  /** Natural CSS-pixel size (i.e. divided back out of the html2canvas render scale). */
  widthPx: number
  heightPx: number
}

export type ExportFormat = 'docx' | 'pdf' | 'pptx' | 'html'

export interface ExportProgress {
  done: number
  total: number
}
