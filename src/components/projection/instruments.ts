import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ModeAngle, Resultat } from '../../lib/projection/calculatrice'
import type { MessageProjection, Projection } from './useProjection'

/**
 * Instruments du mode projection (équerre, compas, calculatrice), PARTAGÉS entre les deux fenêtres
 * (deux écrans) comme les traits : l'écran de la classe voit l'équerre bouger, le compas s'ouvrir et
 * la calculatrice (sauf « Masquer à la classe »). Indépendants de la diapo (comme un instrument posé
 * au tableau). Magasin externe (`useSyncExternalStore`) : un déplacement ne fait redessiner que les
 * composants qui lisent la partie modifiée, jamais la diapo.
 */
export interface EtatEquerre {
  visible: boolean
  /** Milieu de l'hypoténuse (le 0 de la graduation), en px logiques de la diapo. */
  x: number
  y: number
  /** Rotation à l'écran, en degrés (sens horaire positif, 0 = hypoténuse horizontale en bas). */
  angle: number
}

export interface EtatCompas {
  cx: number
  cy: number
  r: number
  /** Angle de la mine (radians, repère de l'écran). */
  angle: number
  /** `rayon` : on écarte depuis le centre ; `arc` : rayon fixé, on tourne pour tracer. */
  phase: 'rayon' | 'arc'
}

export interface EtatCalculatrice {
  visible: boolean
  x: number
  y: number
  /** Deux écrans : cachée sur l'écran de la classe (le professeur cherche un calcul). */
  masque: boolean
  saisie: string
  mode: ModeAngle
  exact: boolean
  /** Touches sin / cos / tan en réciproques (sin⁻¹…). */
  inverse: boolean
  resultat: Resultat | null
  ans: number
}

export interface EtatInstruments {
  equerre: EtatEquerre
  compas: EtatCompas | null
  calc: EtatCalculatrice
}

export const LARGEUR_CALC = 336

const DEPART: EtatInstruments = {
  equerre: { visible: false, x: 640, y: 470, angle: 0 },
  compas: null,
  calc: { visible: false, x: 1280 - LARGEUR_CALC - 24, y: 24, masque: false, saisie: '', mode: 'deg', exact: true, inverse: false, resultat: null, ans: 0 },
}

export class MagasinInstruments {
  private etat: EtatInstruments = DEPART
  private abonnes = new Set<() => void>()
  /** Vrai dès qu'un instrument a servi ici ou qu'un état a été reçu : on répond alors aux nouvelles fenêtres. */
  private actif = false
  private envoyer: ((m: MessageProjection) => void) | null = null
  private id = ''

  relier(envoyer: (m: MessageProjection) => void, id: string) {
    this.envoyer = envoyer
    this.id = id
  }

  lire = () => this.etat

  abonner = (f: () => void) => {
    this.abonnes.add(f)
    return () => {
      this.abonnes.delete(f)
    }
  }

  private publier(etat: EtatInstruments) {
    this.etat = etat
    for (const f of this.abonnes) f()
  }

  /** Changement local : appliqué puis diffusé à l'autre fenêtre. */
  maj(f: (e: EtatInstruments) => EtatInstruments) {
    const apres = f(this.etat)
    if (apres === this.etat) return
    this.actif = true
    this.publier(apres)
    this.envoyer?.({ type: 'instruments', de: this.id, instruments: apres })
  }

  equerre(p: Partial<EtatEquerre>) {
    this.maj((e) => ({ ...e, equerre: { ...e.equerre, ...p } }))
  }
  calc(p: Partial<EtatCalculatrice>) {
    this.maj((e) => ({ ...e, calc: { ...e.calc, ...p } }))
  }
  compas(c: EtatCompas | null) {
    this.maj((e) => (c === null && e.compas === null ? e : { ...e, compas: c }))
  }

  recevoir(m: MessageProjection) {
    if (m.type === 'instruments') {
      this.actif = true
      // Parties inchangées : mêmes objets (les composants qui ne les lisent pas ne bougent pas).
      const r = m.instruments
      const e = this.etat
      this.publier({
        equerre: JSON.stringify(r.equerre) === JSON.stringify(e.equerre) ? e.equerre : r.equerre,
        compas: JSON.stringify(r.compas) === JSON.stringify(e.compas) ? e.compas : r.compas,
        calc: JSON.stringify(r.calc) === JSON.stringify(e.calc) ? e.calc : r.calc,
      })
    } else if (m.type === 'demande' && this.actif) {
      this.envoyer?.({ type: 'instruments', de: this.id, instruments: this.etat })
    }
  }
}

/** Un magasin par page de projection, branché sur le canal de `useProjection`. */
export function useMagasinInstruments(projection: Projection): MagasinInstruments {
  const [magasin] = useState(() => new MagasinInstruments())
  const { envoyer, ecouter, id } = projection
  magasin.relier(envoyer, id)
  useEffect(() => ecouter((m) => magasin.recevoir(m)), [ecouter, magasin])
  return magasin
}

/** Lecture d'une partie du magasin (valeur primitive ou objet partiel : redessin seulement s'il change). */
export function useInstrument<T>(magasin: MagasinInstruments, choisir: (e: EtatInstruments) => T): T {
  return useSyncExternalStore(magasin.abonner, () => choisir(magasin.lire()))
}
