import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ATTRIBUT_ANNEE } from '../../lib/anneeAccueil'

/** Clé `localStorage` : la visite a été faite ou passée (rien d'autre n'est gardé, rien n'est envoyé). */
export const CLE_VISITE = 'accueil:visite'
/** Événement local : « Revoir la visite guidée » (bulle « ? » de l'accueil). */
export const EVENEMENT_RELANCER_VISITE = 'visite:relancer'

const ETAPES: { cible: string; titre: string; texte: string }[] = [
  { cible: 'annees', titre: 'Ton année', texte: 'Choisis ici ton année : ton cours, tes exercices et ton interro suivent ce choix. Il reste sur cet appareil.' },
  { cible: 'portes', titre: 'Trois portes', texte: '« Mon cours » pour lire point par point, « M’entraîner » pour les exercices corrigés, « Préparer mon interro » pour un plan jour par jour.' },
  { cible: 'aide', titre: 'Besoin d’aide ?', texte: 'Touche « ? » sur chaque page : deux phrases te disent à quoi elle sert. « Aa » règle la taille et les couleurs du texte.' },
]

function dejaFaite(): boolean {
  try {
    return window.localStorage.getItem(CLE_VISITE) === '1'
  } catch {
    return true // sans stockage, on ne la remontrerait à chaque visite : on ne la propose pas d'office
  }
}

function noterFaite(): void {
  try {
    window.localStorage.setItem(CLE_VISITE, '1')
  } catch {
    /* rien à faire */
  }
}

/** Élément visible portant `data-visite="…"` (l'accueil garde les quatre années dans le DOM). */
function cibleVisible(nom: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(`[data-visite="${nom}"]`)) if (el.getClientRects().length > 0) return el
  return null
}

interface Place {
  top: number
  left: number
  largeur: number
  fleche: number
  dessous: boolean
  cadre: { top: number; left: number; width: number; height: number }
}

/**
 * Visite FACULTATIVE de l'accueil (trois bulles, maquettes du 27/11/2026) : à la première venue, une fois
 * l'année choisie ; « Passer » à tout moment (Échap aussi), mémorisée sur l'appareil. Bulles non modales,
 * sans voile : la page reste utilisable. Rien au pré-rendu.
 */
export function VisiteAccueil() {
  const [etape, setEtape] = useState<number | null>(null)
  const [place, setPlace] = useState<Place | null>(null)
  const bulle = useRef<HTMLDivElement>(null)

  const finir = useCallback(() => {
    noterFaite()
    setEtape(null)
  }, [])

  // Démarrage : première venue, année choisie (sinon on attend que l'élève la choisisse).
  useEffect(() => {
    if ((window as Window & { __prerendu?: boolean }).__prerendu) return
    const relancer = () => setEtape(0)
    window.addEventListener(EVENEMENT_RELANCER_VISITE, relancer)
    if (dejaFaite()) return () => window.removeEventListener(EVENEMENT_RELANCER_VISITE, relancer)
    let minuteur = 0
    const essayer = () => {
      if (!document.documentElement.hasAttribute(ATTRIBUT_ANNEE)) return false
      minuteur = window.setTimeout(() => setEtape((e) => e ?? 0), 700)
      return true
    }
    let obs: MutationObserver | null = null
    if (!essayer()) {
      obs = new MutationObserver(() => {
        if (essayer()) obs?.disconnect()
      })
      obs.observe(document.documentElement, { attributes: true, attributeFilter: [ATTRIBUT_ANNEE] })
    }
    return () => {
      window.removeEventListener(EVENEMENT_RELANCER_VISITE, relancer)
      obs?.disconnect()
      clearTimeout(minuteur)
    }
  }, [])

  // Placement sous (ou au-dessus de) la cible, recalculé au défilement et au redimensionnement.
  useLayoutEffect(() => {
    if (etape === null) {
      setPlace(null)
      return
    }
    const cible = cibleVisible(ETAPES[etape].cible)
    if (!cible) {
      // Cible absente (aucune année choisie, bouton masqué) : on passe à la suivante, ou on s'arrête.
      if (etape < ETAPES.length - 1) setEtape(etape + 1)
      else setEtape(null)
      return
    }
    const r0 = cible.getBoundingClientRect()
    // Cible amenée vers le haut de l'écran (sous l'en-tête) pour laisser la place à la bulle dessous.
    if (r0.top < 70 || r0.bottom > window.innerHeight - 200) window.scrollBy({ top: r0.top - 80, behavior: 'auto' })
    const placer = () => {
      const r = cible.getBoundingClientRect()
      const largeur = Math.min(340, window.innerWidth - 24)
      const hauteur = bulle.current?.offsetHeight ?? 200
      // Bas libre : au-dessus de la barre du bas (téléphone) s'il y en a une.
      const barre = document.querySelector<HTMLElement>('.ge-barre')
      const bas = window.innerHeight - (barre && barre.getClientRects().length ? barre.offsetHeight : 0) - 8
      const placeDessous = bas - (r.bottom + 12)
      const placeDessus = r.top - 12 - 8
      const dessous = placeDessous >= hauteur || placeDessous >= placeDessus
      const left = Math.max(12, Math.min(window.innerWidth - largeur - 12, r.left + r.width / 2 - largeur / 2))
      const voulu = dessous ? r.bottom + 12 : r.top - 12 - hauteur
      // Cible très haute (les trois portes sur téléphone) : la bulle chevauche son bas plutôt que de sortir de l'écran.
      const top = Math.max(8, Math.min(bas - hauteur, voulu))
      const fleche = top === voulu ? Math.max(18, Math.min(largeur - 18, r.left + r.width / 2 - left)) : -100
      setPlace({ top, left, largeur, fleche, dessous, cadre: { top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 } })
    }
    placer()
    const raf = requestAnimationFrame(placer)
    window.addEventListener('resize', placer)
    window.addEventListener('scroll', placer, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', placer)
      window.removeEventListener('scroll', placer)
    }
  }, [etape])

  useEffect(() => {
    if (etape === null) return
    bulle.current?.focus({ preventScroll: true })
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        finir()
      }
    }
    document.addEventListener('keydown', touche)
    return () => document.removeEventListener('keydown', touche)
  }, [etape, finir])

  if (etape === null) return null
  const e = ETAPES[etape]
  const derniere = etape === ETAPES.length - 1
  return (
    <>
      {place && <div className="ge-visite-cadre" aria-hidden="true" style={place.cadre} />}
      <div
        ref={bulle}
        className={`ge-visite${place?.dessous === false ? ' au-dessus' : ''}${place && place.fleche < 0 ? ' sans-fleche' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby="ge-visite-titre"
        aria-describedby="ge-visite-texte"
        tabIndex={-1}
        style={place ? { top: place.top, left: place.left, width: place.largeur, ['--fleche' as string]: `${place.fleche}px` } : { visibility: 'hidden' }}
      >
        <p className="ge-visite-compte">
          {etape + 1} / {ETAPES.length}
        </p>
        <p id="ge-visite-titre" className="ge-visite-titre">
          {e.titre}
        </p>
        <p id="ge-visite-texte" className="ge-visite-texte">
          {e.texte}
        </p>
        <div className="ge-visite-actions">
          <button type="button" className="ge-bouton-discret" onClick={finir}>
            Passer
          </button>
          <button type="button" className="ge-bouton-plein" onClick={() => (derniere ? finir() : setEtape(etape + 1))}>
            {derniere ? 'C’est parti' : 'Suivant'}
          </button>
        </div>
      </div>
    </>
  )
}
