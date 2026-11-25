import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { PhraseVoix } from '../../lib/voixLecture'
import {
  VITESSES,
  allerAPhrase,
  arreter,
  basculerPause,
  etatLecture,
  phrasePrecedente,
  phraseSuivante,
  useLecture,
} from '../../lib/voixLecture'
import { animationsReduites, changerReglages, useReglagesLecture } from '../../lib/reglagesLecture'
import type { Vitesse } from '../../lib/reglagesLecture'
import './lecteurVoix.css'

/**
 * Barre de lecture à voix haute (planche 08) : phrase précédente / pause / suivante, vitesse 0,75 × /
 * 1 × / 1,25 ×, « Arrêter ». En bas d'écran, sous le pouce, AU-DESSUS des barres fixes du bas (barre de
 * l'étape, barre et tiroir d'aide des générateurs, barre du corrigé ligne par ligne) ; le bouton « Bloc
 * suivant » (un bloc à la fois) et les flèches de la règle remontent au-dessus d'elle
 * (`--voix-haut` sur `<html>`). Ordinateur : 380 px en bas à droite.
 *
 * Aussi, tant qu'une lecture est en cours : surlignage de la phrase lue (`CSS.highlights`, sans toucher au
 * DOM ; sinon attribut `data-voix-bloc` sur son bloc), formule entourée (`data-voix-formule`), défilement
 * doux vers la phrase (direct si animations réduites), toucher une phrase pour lire à partir d'elle (zone
 * de la lecture seulement, jamais sur un lien, un bouton, un atelier, un tableau lu case par case), Échap
 * pour arrêter.
 */

const NOM_SURLIGNAGE = 'voix-phrase'

function registre(): HighlightRegistry | null {
  try {
    return typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight === 'function' ? CSS.highlights : null
  } catch {
    return null
  }
}

function nettoyerSurlignage() {
  registre()?.delete(NOM_SURLIGNAGE)
  document.querySelectorAll('[data-voix-bloc]').forEach((el) => el.removeAttribute('data-voix-bloc'))
}

function surligner(p: PhraseVoix | undefined) {
  nettoyerSurlignage()
  if (!p) return
  const reg = registre()
  if (reg && p.range && !p.range.collapsed) reg.set(NOM_SURLIGNAGE, new Highlight(p.range))
  else if (p.bloc?.isConnected) p.bloc.setAttribute('data-voix-bloc', '')
}

/** Hauteur des barres collantes du haut (en-tête d'étape, en-tête du site, barre du générateur). */
function hautLibre(): number {
  let bas = 0
  for (const el of document.querySelectorAll<HTMLElement>('.etape-entete, .site-header, .gen-barre')) {
    const pos = getComputedStyle(el).position
    if (pos !== 'sticky' && pos !== 'fixed') continue
    const r = el.getBoundingClientRect()
    if (r.height > 0 && r.top <= 1 && r.bottom > bas && r.bottom < window.innerHeight / 2) bas = r.bottom
  }
  return bas
}

/** Place prise en bas de l'écran par les barres fixes (ou collées) : la barre de lecture se pose dessus. */
function basLibre(): number {
  const h = window.innerHeight
  let bas = 0
  for (const el of document.querySelectorAll<HTMLElement>('.etape-nav, .gen-barre-fond, .gen-tiroir, .corrige-pas-boutons')) {
    const pos = getComputedStyle(el).position
    if (pos !== 'fixed' && pos !== 'sticky') continue
    const r = el.getBoundingClientRect()
    if (r.height <= 0 || r.top >= h || r.top < h * 0.2 || r.bottom < h - 200) continue
    bas = Math.max(bas, h - r.top)
  }
  return bas
}

/** Élément qu'on touche pour agir : jamais « lire à partir d'ici ». */
const INTERACTIF =
  'a, button, input, select, textarea, label, summary, video, iframe, [role="button"], [role="gridcell"], [role="slider"], [role="tab"], [tabindex], [contenteditable], .carte-manipuler, .carte-atoi, .carte-video, .tiroir-bouton, .lecture-tableau, .lecteur-voix'

function dansWidget(el: Element | null): boolean {
  for (let e = el; e; e = e.parentElement) if (e.tagName.includes('-')) return true
  return false
}

function pointDansRange(r: Range, x: number, y: number): boolean {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
    caretRangeFromPoint?: (x: number, y: number) => Range | null
  }
  try {
    const pos = doc.caretPositionFromPoint?.(x, y)
    if (pos) return r.comparePoint(pos.offsetNode, pos.offset) === 0
    const cr = doc.caretRangeFromPoint?.(x, y)
    if (cr) return r.comparePoint(cr.startContainer, cr.startOffset) === 0
  } catch {
    // point hors du document de la phrase
  }
  return Array.from(r.getClientRects()).some((b) => x >= b.left && x <= b.right && y >= b.top && y <= b.bottom)
}

/** Dialogue modal ouvert le plus haut (loupe, « Je bloque », panneau « Aa ») : la barre y est rendue, sinon
 * elle serait sous son voile et inerte. */
function dialogueModal(): HTMLDialogElement | null {
  const ouverts = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]')).filter((d) => {
    try {
      return d.matches(':modal')
    } catch {
      return false
    }
  })
  return ouverts[ouverts.length - 1] ?? null
}

function useHote(): HTMLElement {
  const [hote, setHote] = useState<HTMLElement>(() => dialogueModal() ?? document.body)
  useEffect(() => {
    const maj = () => setHote(dialogueModal() ?? document.body)
    const obs = new MutationObserver(maj)
    obs.observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true })
    maj()
    return () => obs.disconnect()
  }, [])
  return hote
}

export default function LecteurVoix() {
  const lecture = useLecture()
  const r = useReglagesLecture()
  const barre = useRef<HTMLElement>(null)
  const hote = useHote()

  // Position au-dessus des barres du bas, et place réservée pour « Bloc suivant », les flèches de la règle
  // et le bas de la page (`--voix-haut`, `--voix-hauteur`).
  useLayoutEffect(() => {
    const el = barre.current
    if (!el) return
    const html = document.documentElement
    let raf = 0
    const poser = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const bas = basLibre()
        const large = window.matchMedia('(min-width: 760px)').matches
        const bottom = bas > 0 ? bas + 8 : large ? 24 : 12
        el.style.bottom = `${Math.round(bottom)}px`
        const hauteur = el.offsetHeight
        html.style.setProperty('--voix-haut', `${Math.round(bottom + hauteur + 10)}px`)
        html.style.setProperty('--voix-hauteur', `${Math.round(hauteur + 16)}px`)
      })
    }
    html.setAttribute('data-voix-lecteur', '')
    poser()
    const obs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(poser) : null
    obs?.observe(el)
    const apresClic = () => requestAnimationFrame(poser)
    window.addEventListener('resize', poser)
    window.addEventListener('scroll', poser, { passive: true })
    document.addEventListener('click', apresClic, true)
    window.visualViewport?.addEventListener('resize', poser)
    return () => {
      cancelAnimationFrame(raf)
      obs?.disconnect()
      window.removeEventListener('resize', poser)
      window.removeEventListener('scroll', poser)
      document.removeEventListener('click', apresClic, true)
      window.visualViewport?.removeEventListener('resize', poser)
      html.removeAttribute('data-voix-lecteur')
      html.style.removeProperty('--voix-haut')
      html.style.removeProperty('--voix-hauteur')
    }
  }, [hote, lecture?.sansBarre])

  // Phrase surlignée et ramenée dans la vue.
  const id = lecture?.id
  const index = lecture?.index
  useEffect(() => {
    const e = etatLecture()
    if (!e || e.erreur) {
      nettoyerSurlignage()
      return
    }
    const p = e.phrases[e.index]
    surligner(p)
    const cible = p?.range ?? null
    const bloc = p?.bloc ?? null
    if (!cible && !bloc) return
    const rect = cible ? cible.getBoundingClientRect() : (bloc as Element).getBoundingClientRect()
    if (rect.height === 0 && rect.width === 0) return
    const doux = animationsReduites() ? 'auto' : 'smooth'
    if (bloc?.closest('.gen-tiroir, dialog, .gen-tiroir-contenu')) {
      bloc.scrollIntoView({ block: 'nearest', behavior: doux })
      return
    }
    const haut = hautLibre() + 8
    const basBarre = barre.current?.getBoundingClientRect().top ?? window.innerHeight
    const bas = basBarre - 12
    if (rect.top >= haut && rect.bottom <= bas) return
    const visee = haut + Math.max(0, (bas - haut - rect.height) / 3)
    window.scrollBy({ top: rect.top - visee, behavior: doux })
  }, [id, index])

  // Formule entourée (événements `boundary`, ou phrase qui n'est qu'une formule).
  const formule = lecture?.formule ?? null
  useEffect(() => {
    if (!formule) return
    formule.setAttribute('data-voix-formule', '')
    return () => formule.removeAttribute('data-voix-formule')
  }, [formule])

  useEffect(() => () => nettoyerSurlignage(), [])

  // Toucher une phrase de la zone : lire à partir d'elle. Échap : arrêter.
  const zone = lecture?.zone ?? null
  useEffect(() => {
    if (!zone) return
    zone.setAttribute('data-voix-zone', '')
    const surClic = (ev: MouseEvent) => {
      const t = ev.target instanceof Element ? ev.target : null
      if (!t || !zone.contains(t) || t.closest(INTERACTIF) || dansWidget(t)) return
      if (window.getSelection()?.toString()) return
      const e = etatLecture()
      if (!e || e.erreur) return
      const i = e.phrases.findIndex((p) => p.range && pointDansRange(p.range, ev.clientX, ev.clientY))
      if (i >= 0) allerAPhrase(i)
    }
    document.addEventListener('click', surClic)
    return () => {
      document.removeEventListener('click', surClic)
      zone.removeAttribute('data-voix-zone')
    }
  }, [zone])

  useEffect(() => {
    const surTouche = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape' || ev.defaultPrevented || document.querySelector('dialog[open]')) return
      arreter()
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [])

  if (!lecture || lecture.sansBarre) return null
  const total = lecture.phrases.length
  const p = lecture.phrases[lecture.index]
  return createPortal(
    <section ref={barre} className="lecteur-voix no-export" aria-label="Lecture à voix haute">
      {lecture.erreur ? (
        <div className="lv-ligne lv-ligne-erreur">
          <p className="lv-erreur" role="status">
            {lecture.erreur}
          </p>
          <button type="button" className="lv-arreter" onClick={arreter}>
            Fermer
          </button>
        </div>
      ) : (
        <>
          <div className="lv-ligne">
            {total > 1 && (
            <button type="button" className="lv-btn" aria-label="Phrase précédente" disabled={lecture.index === 0} onClick={phrasePrecedente}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M6 5h2v14H6zM20 5v14L9 12z" />
              </svg>
            </button>
            )}
            <button type="button" className="lv-btn lv-lecture" aria-label={lecture.enPause ? 'Reprendre la lecture' : 'Pause'} onClick={basculerPause}>
              {lecture.enPause ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
                </svg>
              )}
            </button>
            {total > 1 && (
              <button type="button" className="lv-btn" aria-label="Phrase suivante" disabled={lecture.index >= total - 1} onClick={phraseSuivante}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
                </svg>
              </button>
            )}
            <div className="lv-texte">
              <p className="lv-titre">«&nbsp;{p?.texte ?? ''}&nbsp;»</p>
              <p className="lv-sous">
                {lecture.titre ? `${lecture.titre} · ` : ''}
                {total > 1 ? `Phrase ${lecture.index + 1} sur ${total}` : 'Une phrase'}
                {lecture.enPause ? ' · en pause' : ''}
              </p>
            </div>
          </div>
          <div className="lv-ligne lv-ligne-reglages">
            <div className="lv-vitesse" role="group" aria-label="Vitesse de la voix">
              {VITESSES.map((v) => (
                <button key={v.v} type="button" aria-pressed={r.vitesse === v.v} onClick={() => changerReglages({ vitesse: v.v as Vitesse })}>
                  {v.nom}
                </button>
              ))}
            </div>
            <button type="button" className="lv-arreter" onClick={arreter}>
              Arrêter
            </button>
          </div>
          {total > 1 && (
            <div className="lv-progression" aria-hidden="true">
              <span style={{ width: `${(100 * (lecture.index + 1)) / total}%` }} />
            </div>
          )}
        </>
      )}
    </section>,
    hote,
  )
}
