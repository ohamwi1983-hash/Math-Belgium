/**
 * Taille NATURELLE d'une image (1 px CSS = 1/96 pouce), réduite seulement si elle dépasse la
 * largeur/hauteur imprimable — jamais agrandie. `pxPerUnit` convertit des px vers l'unité cible :
 * 96/25.4 pour des mm (PDF), 1 pour des px déjà à 96dpi (Word), 96 pour des pouces (PowerPoint).
 */
export function fitNaturalSize(
  widthPx: number,
  heightPx: number,
  maxW: number,
  maxH: number,
  pxPerUnit: number,
): { w: number; h: number } {
  let w = widthPx / pxPerUnit
  let h = heightPx / pxPerUnit
  if (w > maxW) {
    const s = maxW / w
    w *= s
    h *= s
  }
  if (h > maxH) {
    const s = maxH / h
    w *= s
    h *= s
  }
  return { w, h }
}

/** dataURL "data:image/jpeg;base64,...." -> Uint8Array des octets JPEG bruts. */
export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
