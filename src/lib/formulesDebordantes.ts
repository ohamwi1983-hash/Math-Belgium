/**
 * Formule trop large (fait d'office, planche 11, point 7) : une formule KaTeX qui ne tient pas dans sa
 * colonne défile dans son propre cadre (`.math-inline`, `overflow-x: auto`, barre masquée — voir
 * `index.css`). L'élève ne savait pas qu'elle continuait : on la marque `data-deborde` et le CSS
 * (`lecture.css`, § 4) pose un dégradé à droite ; `data-defile` (déjà défilée) ajoute un dégradé à
 * gauche, `data-fin` (arrivée au bout) retire celui de droite.
 *
 * Mesure : après chaque changement du DOM (nouvelle vue du parcours, tiroir ouvert…), de taille de
 * fenêtre, de réglage de lecture et au chargement des polices — regroupée (une mesure au plus par image,
 * au plus toutes les 150 ms). Seules les formules affichées comptent (`clientWidth` nul = masquée).
 *
 * Jamais pendant le pré-rendu (`window.__prerendu`, posé par `scripts/prerender.mjs`) : la page
 * pré-rendue garde le DOM d'avant, mesuré à une largeur qui n'est pas celle de l'élève.
 */
import { abonnerReglages } from './reglagesLecture'

declare global {
  interface Window {
    __prerendu?: boolean
  }
}

let prevu = false
let dernier = 0

function marquer(m: HTMLElement) {
  // Marge de 6 px : indices et exposants KaTeX dépassent de quelques pixels de leur boîte sans que la
  // formule soit coupée — seule une vraie formule trop large est marquée.
  const deborde = m.clientWidth > 0 && m.scrollWidth > m.clientWidth + 6
  basculer(m, 'data-deborde', deborde)
  basculer(m, 'data-defile', deborde && m.scrollLeft > 1)
  basculer(m, 'data-fin', deborde && m.scrollLeft + m.clientWidth >= m.scrollWidth - 1)
}

function basculer(m: HTMLElement, attr: string, oui: boolean) {
  if (oui === m.hasAttribute(attr)) return
  if (oui) m.setAttribute(attr, '')
  else m.removeAttribute(attr)
}

function toutMesurer() {
  prevu = false
  dernier = performance.now()
  document.querySelectorAll<HTMLElement>('.math-inline').forEach(marquer)
}

function planifier() {
  if (prevu) return
  prevu = true
  const attente = Math.max(0, 150 - (performance.now() - dernier))
  window.setTimeout(() => requestAnimationFrame(toutMesurer), attente)
}

export function surveillerFormulesDebordantes() {
  if (typeof window === 'undefined' || window.__prerendu) return
  // Nos propres attributs ne relancent pas la mesure (sinon boucle).
  new MutationObserver((liste) => {
    if (liste.some((r) => r.type === 'childList' || (r.attributeName !== null && !r.attributeName.startsWith('data-de') && r.attributeName !== 'data-fin'))) planifier()
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'open', 'aria-expanded'] })
  window.addEventListener('resize', planifier, { passive: true })
  abonnerReglages(planifier)
  document.fonts?.ready.then(planifier).catch(() => undefined)
  document.fonts?.addEventListener?.('loadingdone', planifier)
  document.addEventListener(
    'scroll',
    (e) => {
      const m = e.target
      if (m instanceof HTMLElement && m.classList.contains('math-inline')) marquer(m)
    },
    { capture: true, passive: true },
  )
  planifier()
}
