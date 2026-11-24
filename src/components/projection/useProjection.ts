import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'
import type { Diapo, Role } from '../../lib/projection/diapos'
import type { EtatInstruments } from './instruments'

/** État PARTAGÉ entre la fenêtre des diapos et celle du professeur (mode deux écrans). */
export interface EtatProjection {
  index: number
  pas: number
  blanc: boolean
  /** Arrivée sur la diapo (horodatage) : minuteur des cartes « Teste-toi ». */
  debut: number
  /** Minuteur de la barre d'outils : fin prévue (horodatage), null = arrêté. */
  minuteur: { fin: number | null; duree: number }
  /** Fond de l'écran blanc : uni, quadrillé (carreaux de 40 px logiques) ou repère gradué. */
  fond: FondBlanc
}

export type FondBlanc = 'uni' | 'quadrille' | 'repere'

/** Trait d'annotation (stylo, surligneur ou gomme), en coordonnées de la diapo (1 280 × 720). */
export interface Trait {
  genre?: 'trait'
  id: string
  couleur: string
  gomme: boolean
  /** Surligneur : trait large et transparent (calque « multiply » sous le stylo). */
  fluo?: boolean
  /** Épaisseur en px logiques (défaut : 5 au stylo, 22 au surligneur, 44 à la gomme). */
  epaisseur?: number
  points: [number, number][]
}

/** Arc tracé au compas : centre, rayon, angles de départ et d'arrivée (radians, non ramenés à 2π). */
export interface Arc {
  genre: 'arc'
  id: string
  couleur: string
  epaisseur: number
  cx: number
  cy: number
  r: number
  a0: number
  a1: number
}

/** Résultat de la calculatrice épinglé sur la diapo (étiquette KaTeX déplaçable). */
export interface Epingle {
  genre: 'epingle'
  id: string
  x: number
  y: number
  latex: string
}

export type ElementAnnotation = Trait | Arc | Epingle

export type MessageProjection =
  | { type: 'etat'; de: string; etat: EtatProjection }
  | { type: 'demande'; de: string }
  | { type: 'trait'; de: string; index: number; trait: Trait }
  | { type: 'point'; de: string; index: number; id: string; x: number; y: number }
  | { type: 'effacer'; de: string; index: number }
  /** Ajout OU remplacement (même id) d'un élément : trait aimanté, arc en cours, étiquette déplacée. */
  | { type: 'element'; de: string; index: number; element: ElementAnnotation }
  | { type: 'retirer'; de: string; index: number; id: string }
  /** Toutes les annotations (réponse à une fenêtre qui s'ouvre ou se recharge). */
  | { type: 'annotations'; de: string; toutes: [number, ElementAnnotation[]][] }
  | { type: 'instruments'; de: string; instruments: EtatInstruments }

type Ecouteur = (m: MessageProjection) => void

/**
 * Navigation (diapo, étape de révélation), écran blanc, minuteur ; synchronisés entre fenêtres du même
 * navigateur par `BroadcastChannel` (canal propre au chapitre). Chaque changement local est diffusé ;
 * un état reçu est appliqué sans être rediffusé. Une fenêtre qui s'ouvre (ou se recharge) demande
 * l'état ; seule une fenêtre « active » (le professeur, ou une fenêtre qui a déjà agi / reçu un état)
 * répond. Rien n'est envoyé hors du navigateur.
 */
export function useProjection(chapter: ChapterContent, diapos: Diapo[], role: Role) {
  const [etat, setEtat] = useState<EtatProjection>(() => ({ index: 0, pas: 0, blanc: false, debut: Date.now(), minuteur: { fin: null, duree: 300 }, fond: 'uni' }))
  const etatRef = useRef(etat)
  etatRef.current = etat
  const id = useMemo(() => Math.random().toString(36).slice(2), [])
  const actif = useRef(role === 'prof')
  const ecouteurs = useRef(new Set<Ecouteur>())
  // Canal créé ET fermé dans le même effet (jamais dans un `useMemo` : un démontage / remontage —
  // StrictMode, rechargement à chaud — fermerait le canal mémorisé et la synchronisation se tairait).
  const canal = useRef<BroadcastChannel | null>(null)
  const [synchro, setSynchro] = useState(() => typeof BroadcastChannel !== 'undefined')
  const nomCanal = `math-belgium-projection:${chapter.levelSlug}/${chapter.slug}`

  const envoyer = useCallback((m: MessageProjection) => {
    try {
      canal.current?.postMessage(m)
    } catch {
      // Fenêtre fermée / canal indisponible : chaque fenêtre continue seule.
    }
  }, [])

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    let c: BroadcastChannel
    try {
      c = new BroadcastChannel(nomCanal)
    } catch {
      setSynchro(false)
      return
    }
    canal.current = c
    c.onmessage = (e: MessageEvent<MessageProjection>) => {
      const m = e.data
      if (!m || m.de === id) return
      if (m.type === 'etat') {
        actif.current = true
        const n = Math.max(0, Math.min(diapos.length - 1, m.etat.index))
        const etatRecu = { ...m.etat, index: n, fond: m.etat.fond ?? 'uni' }
        etatRef.current = etatRecu
        setEtat(etatRecu)
      } else if (m.type === 'demande') {
        if (actif.current) envoyer({ type: 'etat', de: id, etat: etatRef.current })
        // Annotations et instruments répondent aussi (chacun ce qu'il garde).
        for (const f of ecouteurs.current) f(m)
      } else for (const f of ecouteurs.current) f(m)
    }
    envoyer({ type: 'demande', de: id })
    return () => {
      c.onmessage = null
      c.close()
      if (canal.current === c) canal.current = null
    }
  }, [nomCanal, id, envoyer, diapos.length])

  const appliquer = useCallback(
    (f: (e: EtatProjection) => EtatProjection) => {
      const avant = etatRef.current
      const apres = f(avant)
      if (apres === avant) return
      actif.current = true
      etatRef.current = apres
      setEtat(apres)
      envoyer({ type: 'etat', de: id, etat: apres })
    },
    [envoyer, id],
  )

  const suivant = useCallback(() => {
    appliquer((e) => {
      const d = diapos[e.index]
      if (d && e.pas < d.pas) return { ...e, pas: e.pas + 1 }
      if (e.index < diapos.length - 1) return { ...e, index: e.index + 1, pas: 0, debut: Date.now() }
      return e
    })
  }, [appliquer, diapos])

  const precedent = useCallback(() => {
    appliquer((e) => {
      if (e.pas > 0) return { ...e, pas: e.pas - 1 }
      if (e.index > 0) return { ...e, index: e.index - 1, pas: diapos[e.index - 1].pas, debut: Date.now() }
      return e
    })
  }, [appliquer, diapos])

  const aller = useCallback(
    (i: number) => appliquer((e) => (i === e.index || i < 0 || i >= diapos.length ? e : { ...e, index: i, pas: 0, debut: Date.now() })),
    [appliquer, diapos.length],
  )
  const basculerBlanc = useCallback(() => appliquer((e) => ({ ...e, blanc: !e.blanc })), [appliquer])
  const choisirFond = useCallback((fond: FondBlanc) => appliquer((e) => (e.fond === fond ? e : { ...e, fond })), [appliquer])
  const lancerMinuteur = useCallback((duree: number) => appliquer((e) => ({ ...e, minuteur: { duree, fin: Date.now() + duree * 1000 } })), [appliquer])
  const arreterMinuteur = useCallback(() => appliquer((e) => ({ ...e, minuteur: { ...e.minuteur, fin: null } })), [appliquer])

  const ecouter = useCallback((f: Ecouteur) => {
    ecouteurs.current.add(f)
    return () => {
      ecouteurs.current.delete(f)
    }
  }, [])

  return { etat, suivant, precedent, aller, basculerBlanc, choisirFond, lancerMinuteur, arreterMinuteur, envoyer, ecouter, id, synchro }
}

export type Projection = ReturnType<typeof useProjection>
