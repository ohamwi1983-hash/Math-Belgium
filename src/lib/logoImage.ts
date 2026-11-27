/**
 * Préparation du logo d'une école DANS LE NAVIGATEUR, avant tout envoi (`lib/logoEcole.ts`) : une
 * image PNG, JPG ou WEBP choisie par le professeur est redessinée sur un canevas, réduite à 600 px de
 * large au plus (et 300 px de haut : un logo s'imprime sur ≈ 1,5 cm de haut), puis encodée :
 * - en PNG si elle a de la transparence (fond transparent CONSERVÉ — le Word ne lit pas le WEBP) ;
 * - sinon en JPEG (qualité décroissante 0,92 → 0,6), plus léger pour une photo ou un scan.
 * Le résultat dépasse 150 Ko ? L'image est réduite encore (× 0,8, jusqu'à 120 px de large) ; un PNG
 * transparent qui ne tient toujours pas est posé sur fond blanc et passe en JPEG.
 * Aucune donnée ne quitte l'appareil avant que le professeur clique « Enregistrer » (ici : rien n'est envoyé).
 */
import { LOGO_MAX_CARACTERES, logoValide } from '../entrainement/export/cartouche'

export const LOGO_TYPES_ACCEPTES = ['image/png', 'image/jpeg', 'image/webp'] as const
export const LOGO_OCTETS_MAX = 150 * 1024
export const LOGO_LARGEUR_MAX = 600
export const LOGO_HAUTEUR_MAX = 300
/** Fichier d'origine refusé au-delà (une photo de 40 Mo n'a rien d'un logo). */
export const LOGO_FICHIER_MAX = 15 * 1024 * 1024

export class ErreurLogo extends Error {}

/** Taille réelle (octets) de l'image d'un data URL base64. */
export function octetsDataUrl(dataUrl: string): number {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const pad = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0
  return Math.floor((b64.length * 3) / 4) - pad
}

/** Message d'erreur avant tout calcul (type, taille du fichier), ou `null`. */
export function erreurFichierLogo(f: { type: string; size: number; name?: string }): string | null {
  const type = f.type || (/\.png$/i.test(f.name ?? '') ? 'image/png' : /\.jpe?g$/i.test(f.name ?? '') ? 'image/jpeg' : /\.webp$/i.test(f.name ?? '') ? 'image/webp' : '')
  if (!(LOGO_TYPES_ACCEPTES as readonly string[]).includes(type)) return 'Choisis une image PNG, JPG ou WEBP (le logo de ton école).'
  if (f.size > LOGO_FICHIER_MAX) return 'Image trop lourde (plus de 15 Mo) : choisis une image plus petite.'
  return null
}

async function decoder(fichier: Blob): Promise<{ source: CanvasImageSource; largeur: number; hauteur: number; fermer: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const b = await createImageBitmap(fichier)
      return { source: b, largeur: b.width, hauteur: b.height, fermer: () => b.close() }
    } catch {
      /* repli sur <img> */
    }
  }
  const url = URL.createObjectURL(fichier)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return { source: img, largeur: img.naturalWidth, hauteur: img.naturalHeight, fermer: () => URL.revokeObjectURL(url) }
  } catch {
    URL.revokeObjectURL(url)
    throw new ErreurLogo("Cette image n'a pas pu être lue : essaie une autre image PNG ou JPG.")
  }
}

function dessiner(source: CanvasImageSource, largeur: number, hauteur: number, fondBlanc: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = largeur
  canvas.height = hauteur
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ErreurLogo("Ton navigateur n'a pas pu préparer l'image.")
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  if (fondBlanc) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, largeur, hauteur)
  }
  ctx.drawImage(source, 0, 0, largeur, hauteur)
  return canvas
}

function aDeLaTransparence(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true
  return false
}

const tient = (url: string) => octetsDataUrl(url) <= LOGO_OCTETS_MAX && url.length <= LOGO_MAX_CARACTERES

/** Fichier choisi → data URL prêt à enregistrer (PNG transparent ou JPEG), ≤ 150 Ko, ≤ 600 px. */
export async function preparerLogo(fichier: File): Promise<{ dataUrl: string; largeur: number; hauteur: number; octets: number; transparent: boolean }> {
  const refus = erreurFichierLogo(fichier)
  if (refus) throw new ErreurLogo(refus)
  const img = await decoder(fichier)
  try {
    if (img.largeur < 8 || img.hauteur < 8) throw new ErreurLogo('Image trop petite pour un logo : choisis une image d’au moins 100 pixels de large.')
    const echelle0 = Math.min(1, LOGO_LARGEUR_MAX / img.largeur, LOGO_HAUTEUR_MAX / img.hauteur)
    let largeur = Math.max(1, Math.round(img.largeur * echelle0))
    let hauteur = Math.max(1, Math.round(img.hauteur * echelle0))
    const transparent = aDeLaTransparence(dessiner(img.source, largeur, hauteur, false))
    for (let essai = 0; essai < 12; essai++) {
      if (transparent) {
        const png = dessiner(img.source, largeur, hauteur, false).toDataURL('image/png')
        if (png.startsWith('data:image/png') && tient(png)) return { dataUrl: png, largeur, hauteur, octets: octetsDataUrl(png), transparent: true }
      } else {
        const canvas = dessiner(img.source, largeur, hauteur, true)
        for (const q of [0.92, 0.85, 0.75, 0.6]) {
          const jpg = canvas.toDataURL('image/jpeg', q)
          if (jpg.startsWith('data:image/jpeg') && tient(jpg)) return { dataUrl: jpg, largeur, hauteur, octets: octetsDataUrl(jpg), transparent: false }
        }
      }
      if (largeur <= 120) break
      largeur = Math.max(1, Math.round(largeur * 0.8))
      hauteur = Math.max(1, Math.round(hauteur * 0.8))
    }
    // Dernier recours (PNG transparent très détaillé) : fond blanc, JPEG.
    const jpg = dessiner(img.source, largeur, hauteur, true).toDataURL('image/jpeg', 0.7)
    if (tient(jpg) && logoValide(jpg)) return { dataUrl: jpg, largeur, hauteur, octets: octetsDataUrl(jpg), transparent: false }
    throw new ErreurLogo("Cette image reste trop lourde même réduite : essaie une version plus simple du logo.")
  } finally {
    img.fermer()
  }
}
