import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { ChapterContent } from '../../content/types'
import { enregistrerAnnotations } from '../../lib/projection/annotations'
import type { Courbe, DonneesAnnotations, ElementAnnotation, Epingle, Trait } from '../../lib/projection/annotations'
import type { EtatProjection, MessageProjection, Projection } from './useProjection'

type Abonne = (page: string | null, structure: boolean) => void

const copier = (el: ElementAnnotation): ElementAnnotation => (el.genre === undefined || el.genre === 'trait' ? { ...el, points: [...el.points] } : { ...el })

/**
 * Annotations de TOUTES les pages (diapos et pages de l'écran blanc), par clé stable de page, pour la page
 * de projection : le tableau (`Annotations`) les dessine, le traceur liste les courbes, l'export et la
 * conservation dans le navigateur les lisent. Chaque action locale est appliquée puis envoyée à l'autre
 * fenêtre (deux écrans) ; ce qui arrive de l'autre fenêtre est appliqué sans être renvoyé.
 *
 * Deux sortes d'avis aux abonnés : `structure` (élément ajouté / retiré : épingles et liste des courbes à
 * redessiner en React) ou simple dessin (un point de plus dans un trait : seul le canvas est repeint).
 */
export class MagasinAnnotations {
  pages = new Map<string, ElementAnnotation[]>()
  /** Résultats épinglés retirés au × (par page) : « Annuler » les remet, dans l'ordre inverse. `longueur` =
   * nombre d'éléments de la page juste après le retrait (si on a ajouté autre chose depuis, « Annuler »
   * retire d'abord ces ajouts). */
  retraits = new Map<string, { el: Epingle; longueur: number }[]>()
  private abonnes = new Set<Abonne>()
  private version = 0
  private envoyer: ((m: MessageProjection) => void) | null = null
  private id = ''

  constructor(initiales?: [string, ElementAnnotation[]][]) {
    if (initiales) this.pages = new Map(initiales.map(([k, l]) => [k, l.map(copier)]))
  }

  relier(envoyer: (m: MessageProjection) => void, id: string) {
    this.envoyer = envoyer
    this.id = id
  }

  abonner = (f: Abonne) => {
    this.abonnes.add(f)
    return () => {
      this.abonnes.delete(f)
    }
  }
  lireVersion = () => this.version

  private avis(page: string | null, structure: boolean) {
    if (structure) this.version++
    for (const f of this.abonnes) f(page, structure)
  }

  liste(page: string): ElementAnnotation[] {
    let l = this.pages.get(page)
    if (!l) {
      l = []
      this.pages.set(page, l)
    }
    return l
  }

  courbes(page: string): Courbe[] {
    return (this.pages.get(page) ?? []).filter((e): e is Courbe => e.genre === 'courbe')
  }

  /** Pages non vides (export, conservation, réponse à une fenêtre qui s'ouvre). */
  instantane(): [string, ElementAnnotation[]][] {
    return [...this.pages].filter(([, l]) => l.length > 0).map(([k, l]) => [k, l.map(copier)])
  }

  // ---------- actions locales (appliquées puis diffusées) ----------

  ajouter(page: string, el: ElementAnnotation) {
    this.liste(page).push(el)
    this.envoyer?.({ type: 'element', de: this.id, page, element: el })
    this.avis(page, true)
  }
  remplacer(page: string, el: ElementAnnotation) {
    const l = this.liste(page)
    const i = l.findIndex((x) => x.id === el.id)
    if (i >= 0) l[i] = el
    else l.push(el)
    this.envoyer?.({ type: 'element', de: this.id, page, element: el })
    this.avis(page, el.genre === 'epingle' || i < 0)
  }
  retirer(page: string, id: string) {
    const l = this.liste(page)
    const i = l.findIndex((x) => x.id === id)
    if (i < 0) return
    l.splice(i, 1)
    this.envoyer?.({ type: 'retirer', de: this.id, page, id })
    this.avis(page, true)
  }
  /** Trait libre commencé (les points suivent un à un). */
  commencerTrait(page: string, trait: Trait) {
    this.liste(page).push(trait)
    this.envoyer?.({ type: 'trait', de: this.id, page, trait })
    this.avis(page, false)
  }
  point(page: string, trait: Trait, p: [number, number]) {
    trait.points.push(p)
    this.envoyer?.({ type: 'point', de: this.id, page, id: trait.id, x: p[0], y: p[1] })
    this.avis(page, false)
  }
  effacer(page: string) {
    this.retraits.delete(page)
    this.liste(page).length = 0
    this.envoyer?.({ type: 'effacer', de: this.id, page })
    this.avis(page, true)
  }
  /** Page blanche supprimée : ses annotations partent avec elle. */
  oublierPage(page: string) {
    this.effacer(page)
    this.pages.delete(page)
  }
  /** × d'une étiquette épinglée : retrait annulable (Ctrl/Cmd+Z, bouton « Annuler »). */
  retirerEpingle(page: string, el: Epingle) {
    this.retirer(page, el.id)
    const pile = this.retraits.get(page) ?? []
    pile.push({ el, longueur: this.liste(page).length })
    this.retraits.set(page, pile)
  }
  annuler(page: string) {
    const l = this.liste(page)
    const pile = this.retraits.get(page)
    const dernier = pile?.[pile.length - 1]
    if (dernier && l.length <= dernier.longueur) {
      pile!.pop()
      this.ajouter(page, dernier.el)
      return
    }
    if (l.length) this.retirer(page, l[l.length - 1].id)
  }
  /** « Nouvelle séance » : tout part, ici et dans l'autre fenêtre. */
  toutEffacer() {
    this.pages = new Map()
    this.retraits = new Map()
    this.envoyer?.({ type: 'annotations', de: this.id, toutes: [] })
    this.avis(null, true)
  }

  // ---------- messages de l'autre fenêtre ----------

  recevoir(m: MessageProjection) {
    switch (m.type) {
      case 'demande':
        // Toujours répondre (même vide) : la fenêtre qui s'ouvre a pu lire une conservation plus ancienne.
        this.envoyer?.({ type: 'annotations', de: this.id, toutes: this.instantane() })
        return
      case 'annotations':
        this.pages = new Map(m.toutes.map(([k, l]) => [k, l.map(copier)]))
        this.retraits = new Map()
        this.avis(null, true)
        return
      case 'trait':
        this.liste(m.page).push(copier(m.trait))
        this.avis(m.page, false)
        return
      case 'point': {
        const t = this.liste(m.page).find((x) => x.id === m.id)
        if (t && (t.genre === undefined || t.genre === 'trait')) t.points.push([m.x, m.y])
        this.avis(m.page, false)
        return
      }
      case 'effacer':
        this.liste(m.page).length = 0
        this.retraits.delete(m.page)
        this.avis(m.page, true)
        return
      case 'element': {
        const l = this.liste(m.page)
        const i = l.findIndex((x) => x.id === m.element.id)
        if (i >= 0) l[i] = m.element
        else l.push(m.element)
        this.avis(m.page, m.element.genre === 'epingle' || i < 0)
        return
      }
      case 'retirer': {
        const l = this.liste(m.page)
        const i = l.findIndex((x) => x.id === m.id)
        if (i >= 0) l.splice(i, 1)
        this.avis(m.page, true)
        return
      }
    }
  }
}

/** Un magasin par page de projection, branché sur le canal de `useProjection`. */
export function useMagasinAnnotations(projection: Projection, initiales?: [string, ElementAnnotation[]][]): MagasinAnnotations {
  const [magasin] = useState(() => new MagasinAnnotations(initiales))
  const { envoyer, ecouter, id } = projection
  magasin.relier(envoyer, id)
  useEffect(() => ecouter((m) => magasin.recevoir(m)), [ecouter, magasin])
  return magasin
}

/** Re-rendu quand un élément est ajouté ou retiré (pas à chaque point d'un trait). */
export function useVersionAnnotations(magasin: MagasinAnnotations): number {
  return useSyncExternalStore(magasin.abonner, magasin.lireVersion)
}

/** Ce qui est conservé / exporté : annotations + pages de l'écran blanc. */
export function donneesAnnotations(magasin: MagasinAnnotations, etat: Pick<EtatProjection, 'blanches' | 'vues' | 'fond'>): DonneesAnnotations {
  return { v: 1, pages: magasin.instantane(), blanches: etat.blanches, vues: etat.vues, fond: etat.fond, maj: Date.now() }
}

/**
 * Conservation dans le navigateur du professeur (IndexedDB, rien sur le serveur) : enregistrée 600 ms après le
 * dernier changement (annotation, page blanche, fond), et tout de suite quand la page se cache ou se ferme.
 * Renvoie `sauver` (immédiat), pour « Nouvelle séance ».
 */
export function useConservation(chapter: ChapterContent, magasin: MagasinAnnotations, etat: EtatProjection): () => void {
  const etatRef = useRef(etat)
  etatRef.current = etat
  const minuterie = useRef<number | undefined>(undefined)
  const sauverRef = useRef(() => {})
  sauverRef.current = () => {
    window.clearTimeout(minuterie.current)
    minuterie.current = undefined
    void enregistrerAnnotations(chapter, donneesAnnotations(magasin, etatRef.current))
  }
  const planifier = () => {
    window.clearTimeout(minuterie.current)
    minuterie.current = window.setTimeout(() => sauverRef.current(), 600)
  }
  const premier = useRef(true)
  useEffect(() => {
    if (premier.current) {
      premier.current = false
      return
    }
    planifier()
  }, [etat.blanches, etat.vues, etat.fond])
  useEffect(() => magasin.abonner(() => planifier()), [magasin])
  useEffect(() => {
    const vite = () => {
      if (minuterie.current !== undefined) sauverRef.current()
    }
    const surVisibilite = () => document.visibilityState === 'hidden' && vite()
    window.addEventListener('pagehide', vite)
    document.addEventListener('visibilitychange', surVisibilite)
    return () => {
      window.removeEventListener('pagehide', vite)
      document.removeEventListener('visibilitychange', surVisibilite)
      vite()
    }
  }, [])
  return () => sauverRef.current()
}
