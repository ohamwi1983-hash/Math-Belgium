import { createRoot } from 'react-dom/client'
import { useEffect, useRef } from 'react'
import type { ChapterContent } from '../../content/types'
import type { ChoixProjection, Diapo as DonneesDiapo } from './diapos'
import { construireDiapos, texteBrut } from './diapos'
import { Diapo } from '../../components/projection/Diapo'
import { Paginateur } from '../../components/projection/Paginateur'
import { inlinerPolices, retirerPreferenceSombre, toutesLesReglesCss } from '../export/buildHtml'
import { downloadBlob } from '../export/downloadBlob'
import { surtitreChapitre } from '../ordreChapitres'

/**
 * « Télécharger en PowerPoint » du mode projection : les MÊMES diapos (construites et découpées comme
 * à l'écran), chacune dans son état final (tout révélé). Chargé à la demande (`import()` depuis le
 * lanceur), avec `pptxgenjs`.
 *
 * Chaque diapo est rendue hors écran à 1 280 × 720 avec les composants du site, puis :
 * - les textes SANS formule ni figure (surtitre, titre, phrases de « L'essentiel », question, réponse)
 *   deviennent de vraies zones de texte PowerPoint, modifiables, à leur place mesurée ;
 * - tout le reste (formules KaTeX, figures SVG, encadrés, atelier) forme l'image de fond de la diapo,
 *   rastérisée par un SVG `<foreignObject>` autonome (CSS du site + polices en `data:` URI, même
 *   technique que `katexImage.ts` et `buildHtml.ts`), à 1,5× (1 920 × 1 080) ;
 * - les notes de la diapo (corrigé, réponse, légende) vont dans les notes du présentateur, en texte ;
 * - carte « S'entraîner » : QR code dans l'image, adresse en zone de texte cliquable ; vidéo : un iframe ne
 *   se capture pas → cadre + lien YouTube cliquable (`data-pptx-lien`).
 * Pas de diapo par étape de révélation : la diapo finale complète suffit (cahier des charges).
 */

const ECHELLE_IMAGE = 1.5
const LARGEUR = 1280
const HAUTEUR = 720
/** Pouces PowerPoint (LAYOUT_16x9 = 10 × 5,625 in) par pixel logique de diapo. */
const POUCE = 10 / LARGEUR
/** Points typographiques par pixel logique (10 in = 720 pt pour 1 280 px). */
const POINT = 720 / LARGEUR

const familles = /KaTeX_|Fraunces|Work Sans|IBM Plex Mono/

/** CSS autonome pour les images : règles du site + polices Google (Fraunces, Work Sans, IBM Plex Mono,
 * lues depuis la feuille `<link>` d'`index.html`), seulement les polices utilisées par les diapos
 * (sous-ensembles latin / latin-ext, woff2), toutes en `data:` URI. Mémoïsé. */
let cssPromesse: Promise<string> | null = null
function cssAutonome(): Promise<string> {
  cssPromesse ??= (async () => {
    let css = retirerPreferenceSombre(toutesLesReglesCss())
    for (const lien of Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href^="https://fonts.googleapis.com"]'))) {
      try {
        const texte = await (await fetch(lien.href)).text()
        // Garder les blocs « latin » et « latin-ext » (commentaire qui précède chaque @font-face).
        const blocs = texte.split(/(?=\/\*\s*[\w-]+\s*\*\/)/).filter((b) => /^\/\*\s*latin(-ext)?\s*\*\//.test(b))
        css += '\n' + blocs.join('\n')
      } catch {
        // Hors ligne / bloqué : les images utiliseront les polices de secours.
      }
    }
    css = css.replace(/@font-face\s*\{[^}]*\}/g, (bloc) => {
      if (!familles.test(bloc)) return ''
      // Un seul format (woff2) par police : inutile d'embarquer aussi woff et ttf.
      return bloc.replace(/src:\s*([^;]+);/, (_, src: string) => {
        const woff2 = src.split(/,(?=\s*url\()/).find((s) => /woff2/.test(s))
        return `src: ${(woff2 ?? src).trim()};`
      })
    })
    return inlinerPolices(css)
  })()
  return cssPromesse
}

let compteurHote = 0

/** Copie profonde d'un nœud, Shadow DOM aplati (atelier), canvas en image, valeurs des champs figées. */
function cloner(n: Node): Node {
  if (n.nodeType !== Node.ELEMENT_NODE) return n.cloneNode(false)
  const el = n as HTMLElement
  if (el.tagName === 'CANVAS') {
    const img = document.createElement('img')
    try {
      img.src = (el as HTMLCanvasElement).toDataURL('image/png')
    } catch {
      // canvas inaccessible : laissé vide
    }
    img.setAttribute('style', el.getAttribute('style') ?? '')
    img.width = el.clientWidth
    img.height = el.clientHeight
    return img
  }
  if (el.tagName === 'SCRIPT' || el.tagName === 'IFRAME') return document.createComment('')
  const c = el.cloneNode(false) as HTMLElement
  const ombre = el.shadowRoot
  if (ombre) {
    const id = `h${++compteurHote}`
    c.setAttribute('data-hote', id)
    const portee = (css: string) => css.replace(/:host\(([^)]*)\)/g, `[data-hote="${id}"]$1`).replace(/:host/g, `[data-hote="${id}"]`)
    for (const f of ombre.adoptedStyleSheets ?? []) {
      const s = document.createElement('style')
      s.textContent = portee(Array.from(f.cssRules, (r) => r.cssText).join('\n'))
      c.appendChild(s)
    }
    for (const k of Array.from(ombre.childNodes)) {
      const copie = cloner(k)
      if (copie instanceof HTMLStyleElement) copie.textContent = portee(copie.textContent ?? '')
      c.appendChild(copie)
    }
  }
  for (const k of Array.from(el.childNodes)) c.appendChild(cloner(k))
  if (el instanceof HTMLInputElement) {
    c.setAttribute('value', el.value)
    if (el.checked) c.setAttribute('checked', '')
  }
  return c
}

function chargerImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image de diapo illisible'))
    img.src = src
  })
}

async function rasteriser(noeud: HTMLElement, css: string): Promise<string> {
  const clone = cloner(noeud) as HTMLElement
  clone.querySelectorAll<HTMLElement>('[data-pptx-natif]').forEach((e) => (e.style.visibility = 'hidden'))
  const xhtml = new XMLSerializer().serializeToString(clone)
  const l = LARGEUR * ECHELLE_IMAGE
  const h = HAUTEUR * ECHELLE_IMAGE
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${h}" viewBox="0 0 ${LARGEUR} ${HAUTEUR}">` +
    `<foreignObject x="0" y="0" width="${LARGEUR}" height="${HAUTEUR}">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${LARGEUR}px;height:${HAUTEUR}px;margin:0"><style><![CDATA[${css}]]></style>${xhtml}</div>` +
    `</foreignObject></svg>`
  const img = await chargerImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
  const canvas = document.createElement('canvas')
  canvas.width = l
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fbfaf7'
  ctx.fillRect(0, 0, l, h)
  ctx.drawImage(img, 0, 0, l, h)
  return canvas.toDataURL('image/png')
}

interface TexteNatif {
  x: number
  y: number
  w: number
  h: number
  runs: { text: string; options: { bold?: boolean; hyperlink?: { url: string; tooltip?: string } } }[]
  taille: number
  gras: boolean
  couleur: string
  police: string
  interligne: number
  puce: boolean
}

function couleurHex(c: string): string {
  const m = c.match(/\d+(\.\d+)?/g)
  if (!m) return '182430'
  return m
    .slice(0, 3)
    .map((v) => Math.round(Number(v)).toString(16).padStart(2, '0'))
    .join('')
}

/** Textes sans formule ni figure d'une diapo, à poser en vraies zones de texte PowerPoint. */
function textesNatifs(diapo: HTMLElement): TexteNatif[] {
  const cadre = diapo.getBoundingClientRect()
  const res: TexteNatif[] = []
  for (const el of Array.from(diapo.querySelectorAll<HTMLElement>('[data-pptx]'))) {
    if (el.querySelector('.katex, svg, img') || !el.textContent?.trim()) continue
    const st = getComputedStyle(el)
    if (st.visibility === 'hidden' || el.closest('.est-cachee')) continue
    const r = el.getBoundingClientRect()
    const majuscules = st.textTransform === 'uppercase'
    const runs: TexteNatif['runs'] = []
    const parcourir = (n: Node, gras: boolean) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const t = (n.textContent ?? '').replace(/\s+/g, ' ')
        if (t) runs.push({ text: majuscules ? t.toUpperCase() : t, options: gras ? { bold: true } : {} })
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        const e = n as HTMLElement
        const g = gras || e.tagName === 'STRONG' || e.tagName === 'B'
        e.childNodes.forEach((k) => parcourir(k, g))
      }
    }
    el.childNodes.forEach((k) => parcourir(k, false))
    // Lien (carte « S'entraîner », vidéo) : zone de texte cliquable dans PowerPoint.
    const lien = el.dataset.pptxLien
    if (lien) for (const r of runs) r.options = { ...r.options, hyperlink: { url: lien, tooltip: lien } }
    if (runs.length) runs[0].text = runs[0].text.trimStart()
    if (runs.length) runs[runs.length - 1].text = runs[runs.length - 1].text.trimEnd()
    const taille = parseFloat(st.fontSize)
    const famille = st.fontFamily
    const puce = el.tagName === 'LI'
    const decalage = puce ? 30 : 0
    res.push({
      x: r.left - cadre.left - decalage,
      y: r.top - cadre.top,
      w: Math.min(LARGEUR - (r.left - cadre.left - decalage), r.width * 1.04 + decalage + 6),
      h: r.height,
      runs,
      taille,
      gras: Number(st.fontWeight) >= 600,
      couleur: couleurHex(st.color),
      police: /Fraunces/.test(famille) ? 'Georgia' : /Plex Mono/.test(famille) ? 'Consolas' : 'Calibri',
      interligne: (parseFloat(st.lineHeight) || taille * 1.3) / taille,
      puce,
    })
    el.setAttribute('data-pptx-natif', '')
  }
  return res
}

/** Planche hors écran : toutes les diapos dans leur état final. */
function Planche({ diapos, chapter, pret }: { diapos: DonneesDiapo[]; chapter: ChapterContent; pret: (el: HTMLElement) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const signal = useRef(pret)
  useEffect(() => {
    if (ref.current) signal.current(ref.current)
  }, [])
  return (
    <div ref={ref}>
      {diapos.map((d) => (
        <div key={d.cle} className="pptx-diapo" style={{ width: LARGEUR, height: HAUTEUR, marginBottom: 20 }}>
          <Diapo diapo={d} chapter={chapter} pas={d.pas} mode="export" />
        </div>
      ))}
    </div>
  )
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function telechargerPptx(chapter: ChapterContent, choix: Pick<ChoixProjection, 'etapes' | 'inclure'>, progression?: (fait: number, total: number) => void): Promise<void> {
  const brutes = construireDiapos(chapter, choix)
  const hote = document.createElement('div')
  hote.className = 'projection-mesure'
  hote.setAttribute('aria-hidden', 'true')
  document.body.appendChild(hote)
  const racine = createRoot(hote)
  try {
    const [{ default: PptxGenJS }, css] = await Promise.all([import('pptxgenjs'), cssAutonome()])
    const finales = await new Promise<DonneesDiapo[]>((resolve) => racine.render(<Paginateur diapos={brutes} chapter={chapter} onFini={resolve} />))
    const planche = await new Promise<HTMLElement>((resolve) => racine.render(<Planche diapos={finales} chapter={chapter} pret={resolve} />))
    await document.fonts?.ready
    // Ateliers (module chargé à la demande, Web Component construit) et ajustement des diapos.
    await pause(finales.some((d) => d.type === 'atelier') ? 1500 : 500)
    await document.fonts?.ready

    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_16x9'
    pptx.title = `${chapter.title} — projection`
    pptx.subject = surtitreChapitre(chapter.level, chapter)
    pptx.company = 'Chapitres de maths — FWB'

    const noeuds = Array.from(planche.querySelectorAll<HTMLElement>('.pptx-diapo > .diapo'))
    for (let i = 0; i < noeuds.length; i++) {
      progression?.(i + 1, noeuds.length)
      const noeud = noeuds[i]
      const d = finales[i]
      const textes = textesNatifs(noeud)
      const image = await rasteriser(noeud, css)
      noeud.querySelectorAll('[data-pptx-natif]').forEach((e) => e.removeAttribute('data-pptx-natif'))
      const diapo = pptx.addSlide()
      diapo.background = { color: 'FBFAF7' }
      const notes = d.notes.map(texteBrut).filter(Boolean)
      diapo.addImage({ data: image, x: 0, y: 0, w: 10, h: 5.625, altText: notes.join(' — ').slice(0, 900) || chapter.title })
      for (const t of textes) {
        diapo.addText(t.runs, {
          x: t.x * POUCE,
          y: t.y * POUCE,
          w: t.w * POUCE,
          h: Math.max(t.h, t.taille * t.interligne) * POUCE,
          fontSize: Math.round(t.taille * POINT * 10) / 10,
          fontFace: t.police,
          color: t.couleur,
          bold: t.gras,
          margin: 0,
          valign: 'top',
          lineSpacingMultiple: Math.round(t.interligne * 100) / 100,
          bullet: t.puce ? { indent: 30 * POINT } : false,
          isTextBox: true,
        })
      }
      const titreDiapo = `${i + 1}. ${texteBrut(d.section.title)}`
      diapo.addNotes([titreDiapo, ...notes].join('\n'))
      await pause(0)
    }
    const blob = (await pptx.write({ outputType: 'blob' })) as Blob
    downloadBlob(blob, `projection-${chapter.levelSlug}-${chapter.slug}.pptx`)
  } finally {
    racine.unmount()
    hote.remove()
  }
}
