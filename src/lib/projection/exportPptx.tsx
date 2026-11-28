import { createRoot } from 'react-dom/client'
import { useEffect, useRef } from 'react'
import type { ChapterContent } from '../../content/types'
import type { ChoixProjection, Diapo as DonneesDiapo } from './diapos'
import { construireDiapos, latexEnTexte, texteBrut } from './diapos'
import { Diapo } from '../../components/projection/Diapo'
import { Paginateur } from '../../components/projection/Paginateur'
import { FondBlancTableau } from '../../components/projection/Tableau'
import { EtiquettesCourbes } from '../../components/projection/Traceur'
import { MathInline } from '../../components/Math'
import { inlinerPolices, retirerPreferenceSombre, toutesLesReglesCss } from '../export/buildHtml'
import { downloadBlob } from '../export/downloadBlob'
import { libelleChapitre, surtitreChapitre } from '../ordreChapitres'
import { cleDiapo, clePageBlanche, pageBlancheUtile } from './annotations'
import type { Courbe, DonneesAnnotations, ElementAnnotation, Epingle, PageBlanche } from './annotations'
import { peindreCourbes, peindreTraits } from './peinture'
import { transfoPage, versEcran } from './vue'
import { lireFonction } from './traceur'
import { aDesElementsEnrichis } from './traceurEnrichi'
import { NOMS_GABARITS } from './gabarits'
import { aDesObjets, ObjetsExport } from '../../components/projection/ObjetsPage'
import { EtiquettesTraceur } from '../../components/projection/TraceurEnrichi'

/**
 * « Télécharger en PowerPoint / PDF » du mode projection (avec ou sans annotations, voir `telechargerProjection`) : les MÊMES diapos (construites et découpées comme
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

/** Image 1 920 × 1 080 d'un nœud (SVG `<foreignObject>` autonome). `fond` null = transparent (calque d'étiquettes) ;
 * `masquerNatifs` : les textes posés en zones de texte PowerPoint ne sont pas dans l'image. */
async function rasteriser(noeud: HTMLElement, css: string, options: { fond: string | null; masquerNatifs?: boolean }): Promise<HTMLCanvasElement> {
  const clone = cloner(noeud) as HTMLElement
  if (options.masquerNatifs) clone.querySelectorAll<HTMLElement>('[data-pptx-natif]').forEach((e) => (e.style.visibility = 'hidden'))
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
  if (options.fond) {
    ctx.fillStyle = options.fond
    ctx.fillRect(0, 0, l, h)
  }
  ctx.drawImage(img, 0, 0, l, h)
  return canvas
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

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ---------- annotations (export annoté) ----------

/** Une diapo du fichier : une diapo de la projection, ou une page de l'écran blanc insérée juste après sa diapo. */
type Element =
  | { genre: 'diapo'; d: DonneesDiapo; page: string; rang: number }
  | { genre: 'blanche'; d: DonneesDiapo; p: PageBlanche; page: string; numero: number }

const L_IMG = LARGEUR * ECHELLE_IMAGE
const H_IMG = HAUTEUR * ECHELLE_IMAGE

function toile(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = L_IMG
  c.height = H_IMG
  return [c, c.getContext('2d')!]
}

/** Étiquettes KaTeX d'une page (résultats épinglés, noms des courbes, points remarquables) : calque transparent. */
function CalqueEtiquettes({ elements, page }: { elements: ElementAnnotation[]; page: PageBlanche | null }) {
  const courbes = elements.filter((e): e is Courbe => e.genre === 'courbe')
  // Page « repère » zoomée : exportée telle qu'elle est vue (dernière vue), résultats épinglés compris.
  const t = transfoPage(page)
  return (
    <>
      {page?.fond === 'repere' && courbes.length > 0 && <EtiquettesCourbes courbes={courbes} page={page} />}
      {page?.fond === 'repere' && <EtiquettesTraceur elements={elements} page={page} />}
      {elements
        .filter((e): e is Epingle => e.genre === 'epingle')
        .map((e) => {
          const [x, y] = versEcran(t, [e.x, e.y])
          return (
            <div key={e.id} className="projection-epingle" style={{ left: x, top: y }}>
              <MathInline tex={e.latex} />
            </div>
          )
        })}
    </>
  )
}

const aDesEtiquettes = (elements: ElementAnnotation[], page: PageBlanche | null) =>
  elements.some((e) => e.genre === 'epingle') || (page?.fond === 'repere' && (elements.some((e) => e.genre === 'courbe') || aDesElementsEnrichis(elements)))

/** Planche hors écran : chaque diapo dans son état final, chaque page blanche (fond), et les calques d'étiquettes. */
function Planche({ elements, pages, chapter, diapos, pret }: { elements: Element[]; pages: Map<string, ElementAnnotation[]>; chapter: ChapterContent; diapos: DonneesDiapo[]; pret: (el: HTMLElement) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const signal = useRef(pret)
  useEffect(() => {
    if (ref.current) signal.current(ref.current)
  }, [])
  const taille = { width: LARGEUR, height: HAUTEUR, marginBottom: 20, position: 'relative' as const }
  return (
    <div ref={ref}>
      {elements.map((e, i) => {
        const liste = pages.get(e.page) ?? []
        const blanche = e.genre === 'blanche' ? e.p : null
        return (
          <div key={`${e.page}-${i}`} data-i={i}>
            <div className="pptx-diapo" style={taille}>
              {e.genre === 'diapo' ? <Diapo diapo={e.d} chapter={chapter} pas={e.d.pas} mode="export" /> : <FondBlancTableau fond={e.p.fond} ex={e.p.ex} ey={e.p.ey} vue={e.p.vue} />}
              {/* Gabarits et morceaux collés (P2, P4) : dans le fond de la page blanche, sous le surligneur et le stylo. */}
              {e.genre === 'blanche' && aDesObjets(liste) && <ObjetsExport elements={liste} page={e.p} diapos={diapos} chapter={chapter} />}
            </div>
            {aDesEtiquettes(liste, blanche) && (
              <div className="pptx-calque" style={taille}>
                <CalqueEtiquettes elements={liste} page={blanche} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Calques d'annotation d'une page, à 1 920 × 1 080 :
 * - `fluo` : le surligneur « cuit » sur le fond — dans les zones surlignées, le fond multiplié par la couleur du
 *   fluo (exactement le `mix-blend-mode: multiply` de l'écran), ailleurs transparent ; posé SOUS les zones de
 *   texte du PowerPoint (le texte reste noir et modifiable par-dessus) ;
 * - `stylo` : courbes du traceur, traits, arcs du compas, étiquettes (KaTeX) ; transparent, posé par-dessus.
 * Les instruments (équerre, compas, calculatrice) ne sont jamais exportés.
 */
async function calques(elements: ElementAnnotation[], page: PageBlanche | null, fond: HTMLCanvasElement, etiquettes: HTMLElement | null, css: string): Promise<{ fluo: HTMLCanvasElement | null; stylo: HTMLCanvasElement | null }> {
  const [cf, xf] = toile()
  const [cs, xs] = toile()
  peindreTraits(xf, xs, elements, ECHELLE_IMAGE, transfoPage(page))
  const avecFluo = elements.some((e) => (e.genre === undefined || e.genre === 'trait') && e.fluo && !e.gomme)
  const avecStylo = elements.some((e) => e.genre === 'arc' || e.genre === 'epingle' || e.genre === 'courbe' || e.genre === 'point' || e.genre === 'liaison' || e.genre === 'tangente' || e.genre === 'aire' || ((e.genre === undefined || e.genre === 'trait') && !e.fluo && !e.gomme))
  let fluo: HTMLCanvasElement | null = null
  if (avecFluo) {
    const [c, x] = toile()
    x.drawImage(fond, 0, 0)
    x.globalCompositeOperation = 'multiply'
    x.drawImage(cf, 0, 0)
    x.globalCompositeOperation = 'destination-in'
    x.drawImage(cf, 0, 0)
    x.globalCompositeOperation = 'source-over'
    fluo = c
  }
  let stylo: HTMLCanvasElement | null = null
  if (avecStylo) {
    const [c, x] = toile()
    const courbes = elements.filter((e): e is Courbe => e.genre === 'courbe')
    if (page && (courbes.length || aDesElementsEnrichis(elements))) {
      const [cc, xc] = toile()
      peindreCourbes(xc, courbes, page, ECHELLE_IMAGE, elements)
      x.drawImage(cc, 0, 0)
    }
    x.drawImage(cs, 0, 0)
    if (etiquettes) x.drawImage(await rasteriser(etiquettes, css, { fond: null }), 0, 0)
    stylo = c
  }
  return { fluo, stylo }
}

/** Latin-1 seulement (polices standard du PDF, sans police embarquée) : le texte invisible sert à sélectionner / chercher. */
function versLatin1(t: string): string {
  return t
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[—–−]/g, '-')
    .replace(/…/g, '...')
    .replace(/[  ]/g, ' ')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/[^\u0000-ÿ]/g, '')
}

/**
 * « Chapitre 3 - Titre - annote.pptx » : « Chapitre n — titre — annoté » (numéro du PROFESSEUR s'il a rangé ses
 * chapitres, jamais celui du site) écrit en ASCII — un accent ou un tiret long dans `download` fait perdre le nom
 * dans Chromium (le fichier s'appellerait « download » ; même constat que le carnet, `nomFichierAgenda`).
 */
export function nomFichier(chapter: ChapterContent, annote: boolean, extension: string): string {
  const base = `${libelleChapitre(chapter, undefined, { titre: texteBrut(chapter.title) })}${annote ? ' — annoté' : ''}`
  const ascii = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[—–−]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/œ/g, 'oe')
    .replace(/[^\x20-\x7e]/g, '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
  return `${ascii || 'projection'}.${extension}`
}

export interface OptionsExport {
  format?: 'pptx' | 'pdf'
  /** Annotations à poser (export annoté) ; absent ou null = diapos seules. */
  annotations?: DonneesAnnotations | null
  /** Diapos déjà découpées (depuis la projection) : sinon construites et découpées ici. */
  diapos?: DonneesDiapo[]
  progression?: (fait: number, total: number) => void
}

/** Ancien point d'entrée (lanceur) : PowerPoint sans annotations. */
export function telechargerPptx(chapter: ChapterContent, choix: Pick<ChoixProjection, 'etapes' | 'inclure'>, progression?: (fait: number, total: number) => void): Promise<void> {
  return telechargerProjection(chapter, choix, { format: 'pptx', progression })
}

/**
 * PowerPoint ou PDF des diapos (état final, même découpage qu'à l'écran), avec ou sans annotations :
 * - diapo annotée : l'image de fond et les zones de texte modifiables restent ; l'annotation est une image
 *   transparente À PART (le professeur peut la supprimer) — deux images si la diapo est surlignée (le fluo,
 *   sous les zones de texte ; le stylo, par-dessus) ;
 * - pages de l'écran blanc : insérées juste après la diapo d'où elles ont été ouvertes, dans l'ordre, avec
 *   leur fond (uni, quadrillé, repère gradué à l'échelle choisie) et leurs annotations (courbes comprises) ;
 *   une page restée vierge (écran blanc ouvert pour masquer) n'est pas exportée ;
 * - PDF (16:9, une page par diapo) : fond en JPEG, annotations en PNG transparent par-dessus, textes simples en
 *   texte INVISIBLE (sélectionnable, cherchable ; caractères latins seulement, sans police embarquée).
 */
export async function telechargerProjection(chapter: ChapterContent, choix: Pick<ChoixProjection, 'etapes' | 'inclure'>, options: OptionsExport = {}): Promise<void> {
  const format = options.format ?? 'pptx'
  const ann = options.annotations ?? null
  const pages = new Map(ann?.pages ?? [])
  const hote = document.createElement('div')
  hote.className = 'projection-mesure'
  hote.setAttribute('aria-hidden', 'true')
  document.body.appendChild(hote)
  const racine = createRoot(hote)
  try {
    const [bibliotheque, css] = await Promise.all([format === 'pptx' ? import('pptxgenjs') : import('jspdf'), cssAutonome()])
    const finales =
      options.diapos ?? (await new Promise<DonneesDiapo[]>((resolve) => racine.render(<Paginateur diapos={construireDiapos(chapter, choix)} chapter={chapter} onFini={resolve} />)))
    const elements: Element[] = []
    finales.forEach((d, rang) => {
      elements.push({ genre: 'diapo', d, page: cleDiapo(d.cle), rang })
      let numero = 0
      for (const p of ann?.blanches[d.cle] ?? []) if (pageBlancheUtile(p, pages)) elements.push({ genre: 'blanche', d, p, page: clePageBlanche(p.id), numero: ++numero })
    })
    const annote = elements.some((e) => e.genre === 'blanche' || (pages.get(e.page)?.length ?? 0) > 0)
    const planche = await new Promise<HTMLElement>((resolve) => racine.render(<Planche elements={elements} pages={pages} chapter={chapter} diapos={finales} pret={resolve} />))
    await document.fonts?.ready
    // Ateliers (module chargé à la demande, Web Component construit) et ajustement des diapos.
    await pause(finales.some((d) => d.type === 'atelier') ? 1500 : 500)
    await document.fonts?.ready

    type Pptx = InstanceType<typeof import('pptxgenjs').default>
    type Pdf = InstanceType<typeof import('jspdf').jsPDF>
    let pptx: Pptx | null = null
    let pdf: Pdf | null = null
    if (format === 'pptx') {
      const PptxGenJS = (bibliotheque as typeof import('pptxgenjs')).default
      pptx = new PptxGenJS()
      pptx.layout = 'LAYOUT_16x9'
      pptx.title = `${texteBrut(chapter.title)} — projection${annote ? ' annotée' : ''}`
      pptx.subject = surtitreChapitre(chapter.level, chapter)
      pptx.company = 'Chapitres de maths — FWB'
    } else {
      const { jsPDF } = bibliotheque as typeof import('jspdf')
      pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [PDF_L, PDF_H], compress: true })
      pdf.setProperties({ title: `${texteBrut(chapter.title)}${annote ? ' — annoté' : ''}`, subject: surtitreChapitre(chapter.level, chapter), creator: 'Chapitres de maths — FWB' })
    }

    const blocs = Array.from(planche.children) as HTMLElement[]
    for (let i = 0; i < elements.length; i++) {
      options.progression?.(i + 1, elements.length)
      const e = elements[i]
      const bloc = blocs[i]
      const cadre = bloc.querySelector<HTMLElement>('.pptx-diapo')!
      const noeud = e.genre === 'diapo' ? cadre.querySelector<HTMLElement>('.diapo')! : cadre
      const liste = pages.get(e.page) ?? []
      const blanche = e.genre === 'blanche' ? e.p : null
      const textes = e.genre === 'diapo' ? textesNatifs(noeud) : []
      // PowerPoint : textes simples en zones de texte (masqués de l'image) ; PDF : tout dans l'image.
      const fond = await rasteriser(noeud, css, { fond: '#fbfaf7', masquerNatifs: format === 'pptx' })
      noeud.querySelectorAll('[data-pptx-natif]').forEach((n) => n.removeAttribute('data-pptx-natif'))
      const { fluo, stylo } = liste.length ? await calques(liste, blanche, fond, bloc.querySelector<HTMLElement>('.pptx-calque'), css) : { fluo: null, stylo: null }
      const notes = notesElement(e, liste)

      if (pptx) {
        const diapo = pptx.addSlide()
        diapo.background = { color: e.genre === 'blanche' ? 'FFFFFF' : 'FBFAF7' }
        diapo.addImage({ data: fond.toDataURL('image/png'), x: 0, y: 0, w: 10, h: 5.625, altText: notes.join(' — ').slice(0, 900) || texteBrut(chapter.title) })
        if (fluo) diapo.addImage({ data: fluo.toDataURL('image/png'), x: 0, y: 0, w: 10, h: 5.625, altText: 'Annotations du professeur (surligneur)' })
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
        if (stylo) diapo.addImage({ data: stylo.toDataURL('image/png'), x: 0, y: 0, w: 10, h: 5.625, altText: 'Annotations du professeur' })
        diapo.addNotes(notes.join('\n'))
      } else if (pdf) {
        if (i > 0) pdf.addPage([PDF_L, PDF_H], 'landscape')
        pdf.addImage(fond.toDataURL('image/jpeg', 0.88), 'JPEG', 0, 0, PDF_L, PDF_H, undefined, 'FAST')
        if (fluo || stylo) {
          // Une seule image d'annotation par page : surligneur cuit sur le fond (texte compris), puis stylo.
          const [c, x] = toile()
          if (fluo) x.drawImage(fluo, 0, 0)
          if (stylo) x.drawImage(stylo, 0, 0)
          pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, PDF_L, PDF_H, undefined, 'FAST')
        }
        for (const t of textes) {
          const texte = versLatin1(t.runs.map((r) => r.text).join(''))
          if (!texte.trim()) continue
          const k = PDF_L / LARGEUR
          pdf.setFont('helvetica', t.gras ? 'bold' : 'normal')
          pdf.setFontSize(t.taille * k)
          pdf.text(texte, t.x * k + (t.puce ? 30 * k : 0), t.y * k, { baseline: 'top', maxWidth: Math.max(10, (t.w - (t.puce ? 30 : 0)) * k), lineHeightFactor: t.interligne, renderingMode: 'invisible' })
        }
      }
      await pause(0)
    }
    if (pptx) downloadBlob((await pptx.write({ outputType: 'blob' })) as Blob, nomFichier(chapter, annote, 'pptx'))
    else if (pdf) downloadBlob(pdf.output('blob'), nomFichier(chapter, annote, 'pdf'))
  } finally {
    racine.unmount()
    hote.remove()
  }
}

/** Page PDF 16:9 en points (10 × 5,625 pouces, comme le PowerPoint). */
const PDF_L = 720
const PDF_H = 405

/** Notes du présentateur : titre de la diapo, corrigé / réponse ; page blanche : sa place et ses courbes. */
function notesElement(e: Element, liste: ElementAnnotation[]): string[] {
  if (e.genre === 'diapo') return [`${e.rang + 1}. ${texteBrut(e.d.section.title)}`, ...e.d.notes.map(texteBrut).filter(Boolean)]
  const courbes = liste
    .filter((x): x is Courbe => x.genre === 'courbe')
    .map((c) => {
      const l = lireFonction(c.saisie, e.p.angle)
      return `${c.nom}(x) = ${l.ok ? latexEnTexte(l.latex) : c.saisie}`
    })
  const fond = e.p.fond === 'repere' ? 'repère' : e.p.fond === 'quadrille' ? 'quadrillé' : 'uni'
  const autres = liste.flatMap((x) =>
    x.genre === 'gabarit' ? [NOMS_GABARITS[x.type]] : x.genre === 'morceau' ? ['Morceau collé de la diapo d’origine'] : x.genre === 'point' ? [`${x.nom}(${String(x.x).replace('.', ',')} ; ${String(x.y).replace('.', ',')})`] : x.genre === 'liaison' ? [`${x.sorte} ${x.a}${x.b}`] : [],
  )
  return [`Page blanche ${e.numero} (${fond}) — après « ${texteBrut(e.d.section.title)} »`, ...courbes, ...autres]
}
