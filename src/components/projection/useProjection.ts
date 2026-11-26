import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'
import type { Diapo, Role } from '../../lib/projection/diapos'
import type { EtatInstruments } from './instruments'
import { cleDiapo, clePageBlanche, nouvellePageBlanche } from '../../lib/projection/annotations'
import type { ElementAnnotation, FondBlanc, PageBlanche, Trait, VueRepere } from '../../lib/projection/annotations'
import { vueDe } from '../../lib/projection/vue'

/** État PARTAGÉ entre la fenêtre des diapos et celle du professeur (mode deux écrans). */
export interface EtatProjection {
  index: number
  pas: number
  blanc: boolean
  /** Arrivée sur la diapo (horodatage) : minuteur des cartes « Teste-toi ». */
  debut: number
  /** Minuteur de la barre d'outils : fin prévue (horodatage), null = arrêté. */
  minuteur: { fin: number | null; duree: number }
  /** Fond proposé pour une NOUVELLE page de l'écran blanc (le dernier choisi) ; chaque page a le sien. */
  fond: FondBlanc
  /** Pages de l'écran blanc, rattachées à la clé de la diapo d'où on les a ouvertes, dans l'ordre. */
  blanches: Record<string, PageBlanche[]>
  /** Dernière page blanche vue, par clé de diapo (on y revient en rouvrant l'écran blanc). */
  vues: Record<string, string>
  /** Diapo d'atelier en plein écran (l'atelier seul occupe tout l'écran) ; retombe à faux en changeant de diapo. */
  atelierPlein: boolean
}

export type { Arc, Courbe, ElementAnnotation, Epingle, FondBlanc, PageBlanche, Trait } from '../../lib/projection/annotations'

export type MessageProjection =
  | { type: 'etat'; de: string; etat: EtatProjection }
  | { type: 'demande'; de: string }
  // `page` : clé STABLE de la page (`d:<clé de diapo>` ou `b:<id de page blanche>`, voir `lib/projection/annotations.ts`).
  | { type: 'trait'; de: string; page: string; trait: Trait }
  | { type: 'point'; de: string; page: string; id: string; x: number; y: number }
  | { type: 'effacer'; de: string; page: string }
  /** Ajout OU remplacement (même id) d'un élément : trait aimanté, arc en cours, étiquette déplacée. */
  | { type: 'element'; de: string; page: string; element: ElementAnnotation }
  | { type: 'retirer'; de: string; page: string; id: string }
  /** Toutes les annotations (réponse à une fenêtre qui s'ouvre ou se recharge ; « Nouvelle séance » : liste vide). */
  | { type: 'annotations'; de: string; toutes: [string, ElementAnnotation[]][] }
  | { type: 'instruments'; de: string; instruments: EtatInstruments }

type Ecouteur = (m: MessageProjection) => void

/** Page blanche affichée (null hors écran blanc). */
export function pageBlancheCourante(e: EtatProjection, diapos: Diapo[]): PageBlanche | null {
  if (!e.blanc) return null
  const cle = diapos[e.index]?.cle
  if (!cle) return null
  const liste = e.blanches[cle] ?? []
  return liste.find((p) => p.id === e.vues[cle]) ?? liste[liste.length - 1] ?? null
}

/** Clé de la page d'annotations affichée : la page blanche ouverte, sinon la diapo. */
export function clePageCourante(e: EtatProjection, diapos: Diapo[]): string {
  const p = pageBlancheCourante(e, diapos)
  if (p) return clePageBlanche(p.id)
  return cleDiapo(diapos[e.index]?.cle ?? String(e.index))
}

/**
 * Navigation (diapo, étape de révélation), écran blanc, minuteur ; synchronisés entre fenêtres du même
 * navigateur par `BroadcastChannel` (canal propre au chapitre). Chaque changement local est diffusé ;
 * un état reçu est appliqué sans être rediffusé. Une fenêtre qui s'ouvre (ou se recharge) demande
 * l'état ; seule une fenêtre « active » (le professeur, ou une fenêtre qui a déjà agi / reçu un état)
 * répond. Rien n'est envoyé hors du navigateur.
 */
export function useProjection(chapter: ChapterContent, diapos: Diapo[], role: Role, initial?: Pick<EtatProjection, 'fond' | 'blanches' | 'vues'>) {
  const [etat, setEtat] = useState<EtatProjection>(() => ({
    index: 0,
    pas: 0,
    blanc: false,
    debut: Date.now(),
    minuteur: { fin: null, duree: 300 },
    fond: initial?.fond ?? 'uni',
    blanches: initial?.blanches ?? {},
    vues: initial?.vues ?? {},
    atelierPlein: false,
  }))
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
        const etatRecu = { ...m.etat, index: n, fond: m.etat.fond ?? 'uni', blanches: m.etat.blanches ?? {}, vues: m.etat.vues ?? {}, atelierPlein: !!m.etat.atelierPlein }
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

  // Vue du repère (pincer, molette, glisser) : appliquée ici tout de suite, diffusée au plus une fois par image.
  const envoiDiffere = useRef<number | null>(null)
  useEffect(() => () => {
    if (envoiDiffere.current !== null) cancelAnimationFrame(envoiDiffere.current)
  }, [])
  const appliquer = useCallback(
    (f: (e: EtatProjection) => EtatProjection, differe = false) => {
      const avant = etatRef.current
      let apres = f(avant)
      if (apres === avant) return
      // Plein écran d'un atelier : propre à sa diapo. Écran blanc : ses pages sont rattachées à la diapo, il se
      // referme quand on la quitte (→ ← gardent leur rôle : diapo suivante / précédente).
      if (apres.index !== avant.index && apres.atelierPlein) apres = { ...apres, atelierPlein: false }
      if (apres.index !== avant.index && apres.blanc && avant.blanc) apres = { ...apres, blanc: false }
      actif.current = true
      etatRef.current = apres
      setEtat(apres)
      if (!differe) {
        envoyer({ type: 'etat', de: id, etat: apres })
        return
      }
      if (envoiDiffere.current !== null) return
      envoiDiffere.current = requestAnimationFrame(() => {
        envoiDiffere.current = null
        envoyer({ type: 'etat', de: id, etat: etatRef.current })
      })
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
  /** Écran blanc : à l'ouverture, la dernière page vue de cette diapo (ou une première page, au fond choisi en dernier). */
  const basculerBlanc = useCallback(
    () =>
      appliquer((e) => {
        if (e.blanc) return { ...e, blanc: false }
        const cle = diapos[e.index]?.cle
        if (!cle) return { ...e, blanc: true }
        const liste = e.blanches[cle] ?? []
        if (liste.length && liste.some((p) => p.id === e.vues[cle])) return { ...e, blanc: true }
        if (liste.length) return { ...e, blanc: true, vues: { ...e.vues, [cle]: liste[liste.length - 1].id } }
        const p = nouvellePageBlanche({ fond: e.fond })
        return { ...e, blanc: true, blanches: { ...e.blanches, [cle]: [p] }, vues: { ...e.vues, [cle]: p.id } }
      }),
    [appliquer, diapos],
  )
  const pageBlanche = (e: EtatProjection) => pageBlancheCourante(e, diapos)
  /** Modifie la page blanche affichée (fond, échelle, angles, points marqués). */
  const majPage = useCallback(
    (p: Partial<Omit<PageBlanche, 'id'>>) =>
      appliquer((e) => {
        const cle = diapos[e.index]?.cle
        const courante = pageBlanche(e)
        if (!cle || !courante) return e
        const nouvelle = { ...courante, ...p, marques: { ...courante.marques, ...p.marques } }
        return { ...e, fond: p.fond ?? e.fond, blanches: { ...e.blanches, [cle]: (e.blanches[cle] ?? []).map((x) => (x.id === courante.id ? nouvelle : x)) } }
      }),
    [appliquer, diapos],
  )
  const choisirFond = useCallback((fond: FondBlanc) => majPage({ fond }), [majPage])
  /** Vue du repère de la page affichée (zoom, déplacement ; `undefined` = vue de départ), partagée avec l'autre écran. */
  const majVue = useCallback(
    (vue: VueRepere | undefined) =>
      appliquer((e) => {
        const cle = diapos[e.index]?.cle
        const courante = pageBlanche(e)
        if (!cle || !courante) return e
        return { ...e, blanches: { ...e.blanches, [cle]: (e.blanches[cle] ?? []).map((x) => (x.id === courante.id ? { ...courante, vue } : x)) } }
      }, true),
    [appliquer, diapos],
  )
  /** Page blanche affichée, lue dans l'état le plus récent (gestes rapides : sans attendre le rendu). */
  const pageBlancheActuelle = useCallback(() => pageBlancheCourante(etatRef.current, diapos), [diapos])
  /** « + Nouvelle page » : la page remplie est gardée, une page vierge (même fond, même échelle) vient juste après. */
  const nouvellePage = useCallback(
    () =>
      appliquer((e) => {
        const cle = diapos[e.index]?.cle
        const courante = pageBlanche(e)
        if (!cle || !courante) return e
        // Même échelle que la page affichée (celle de sa vue), origine au centre.
        const v = vueDe(courante)
        const p = nouvellePageBlanche({ fond: courante.fond, ex: v.ex, ey: v.ey, angle: courante.angle, marques: courante.marques })
        const liste = [...(e.blanches[cle] ?? [])]
        liste.splice(liste.findIndex((x) => x.id === courante.id) + 1, 0, p)
        return { ...e, blanches: { ...e.blanches, [cle]: liste }, vues: { ...e.vues, [cle]: p.id } }
      }),
    [appliquer, diapos],
  )
  /** Page blanche précédente / suivante de cette diapo ; faux s'il n'y en a pas (rien ne change). */
  const allerPage = useCallback(
    (delta: number): boolean => {
      const e = etatRef.current
      const cle = diapos[e.index]?.cle
      const courante = pageBlanche(e)
      if (!cle || !courante) return false
      const liste = e.blanches[cle] ?? []
      const i = liste.findIndex((x) => x.id === courante.id) + delta
      if (i < 0 || i >= liste.length) return false
      appliquer((x) => ({ ...x, vues: { ...x.vues, [cle]: liste[i].id } }))
      return true
    },
    [appliquer, diapos],
  )
  /** Supprime la page blanche affichée (ses annotations sont retirées par l'appelant) ; la dernière est remplacée par une page vierge. */
  const supprimerPage = useCallback(
    (): string | null => {
      const e = etatRef.current
      const cle = diapos[e.index]?.cle
      const courante = pageBlanche(e)
      if (!cle || !courante) return null
      appliquer((x) => {
        const liste = (x.blanches[cle] ?? []).filter((p) => p.id !== courante.id)
        const i = Math.max(0, (x.blanches[cle] ?? []).findIndex((p) => p.id === courante.id) - 1)
        if (liste.length === 0) {
          const p = nouvellePageBlanche({ fond: courante.fond, ex: courante.ex, ey: courante.ey, angle: courante.angle })
          return { ...x, blanches: { ...x.blanches, [cle]: [p] }, vues: { ...x.vues, [cle]: p.id } }
        }
        return { ...x, blanches: { ...x.blanches, [cle]: liste }, vues: { ...x.vues, [cle]: liste[Math.min(i, liste.length - 1)].id } }
      })
      return courante.id
    },
    [appliquer, diapos],
  )
  /** « Nouvelle séance » : plus aucune page blanche (les annotations sont effacées par l'appelant). */
  const oublierPagesBlanches = useCallback(() => appliquer((e) => ({ ...e, blanc: false, blanches: {}, vues: {} })), [appliquer])
  const lancerMinuteur = useCallback((duree: number) => appliquer((e) => ({ ...e, minuteur: { duree, fin: Date.now() + duree * 1000 } })), [appliquer])
  const basculerAtelierPlein = useCallback((plein?: boolean) => appliquer((e) => ((plein ?? !e.atelierPlein) === e.atelierPlein ? e : { ...e, atelierPlein: plein ?? !e.atelierPlein })), [appliquer])
  const arreterMinuteur = useCallback(() => appliquer((e) => ({ ...e, minuteur: { ...e.minuteur, fin: null } })), [appliquer])

  const ecouter = useCallback((f: Ecouteur) => {
    ecouteurs.current.add(f)
    return () => {
      ecouteurs.current.delete(f)
    }
  }, [])

  return {
    etat,
    suivant,
    precedent,
    aller,
    basculerBlanc,
    choisirFond,
    majPage,
    majVue,
    pageBlancheActuelle,
    nouvellePage,
    allerPage,
    supprimerPage,
    oublierPagesBlanches,
    pageBlanche: () => pageBlanche(etat),
    /** Pages blanches de la diapo affichée, dans l'ordre. */
    pagesBlanches: () => etat.blanches[diapos[etat.index]?.cle ?? ''] ?? [],
    lancerMinuteur,
    arreterMinuteur,
    basculerAtelierPlein,
    envoyer,
    ecouter,
    id,
    synchro,
  }
}

export type Projection = ReturnType<typeof useProjection>
