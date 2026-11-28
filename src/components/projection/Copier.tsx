import { useEffect, useRef, useState } from 'react'
import type { Diapo as DonneesDiapo } from '../../lib/projection/diapos'
import { titreCourt } from '../../lib/parcoursChapitre'
import { clePageBlanche, pageBlancheUtile } from '../../lib/projection/annotations'
import type { Role } from '../../lib/projection/diapos'
import { cadreDuLasso, garderCopie, placerMorceau, simplifierLasso } from '../../lib/projection/morceaux'
import type { Copie, Morceau } from '../../lib/projection/morceaux'
import type { OutilsLocaux } from './BarreOutils'
import type { MagasinAnnotations } from './magasinAnnotations'
import { useVersionAnnotations } from './magasinAnnotations'
import { selectionnerObjet, suivrePointeur } from './ObjetsPage'
import { Pictogramme } from './Pictogrammes'
import { PictoBlanc } from './PictosEcranBlanc'
import type { Projection } from './useProjection'
import './ecran-blanc.css'

/**
 * Outil « Copier » (planche P4 du 28/11/2026, raccourci X) : entourer un morceau de la diapo (rectangle d'office, ou
 * lasso), puis « Coller sur une page blanche » (nouvelle page de cette diapo, ouverte aussitôt) ou « Copier » (gardé en
 * mémoire : bouton « Coller » de la petite barre de l'écran blanc). Rien ne change sur la diapo elle-même.
 */

type SetOutils = (f: (o: OutilsLocaux) => OutilsLocaux) => void
type P = [number, number]
type Cadre = { x: number; y: number; w: number; h: number }

const nouvelId = (id: string) => `${id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
const borne = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

/** Prendre / ranger l'outil « Copier » (il range le stylo : comme lui, il ne fait plus « diapo suivante » au clic). */
export const basculerCopier = (o: OutilsLocaux): OutilsLocaux =>
  o.copier ? { ...o, copier: false } : { ...o, copier: true, stylo: false, palette: false, nuancier: false, menuFond: false, menuGabarit: false, traceur: false, menuMinuteur: false, menuExport: false }

/** Bouton « Copier » de la barre du bas (à gauche du stylo). Sur l'écran blanc, il revient d'abord à la diapo. */
export function BoutonCopier({ projection, outils, setOutils, avecTexte = false }: { projection: Projection; outils: OutilsLocaux; setOutils: SetOutils; avecTexte?: boolean }) {
  return (
    <button
      type="button"
      className={`projection-outil${outils.copier ? ' actif' : ''}`}
      aria-pressed={!!outils.copier}
      aria-label="Copier un morceau de la diapo"
      title="Copier un morceau de la diapo sur une page blanche (X)"
      onClick={() => {
        if (!outils.copier && projection.etat.blanc) projection.basculerBlanc()
        setOutils(basculerCopier)
      }}
    >
      <PictoBlanc nom="copier" />
      {(avecTexte || outils.copier) && <span>Copier</span>}
    </button>
  )
}

/** Pages blanches ÉCRITES de la diapo affichée (pastille « n » du bouton Écran blanc, repère « n pages blanches »). */
export function usePagesEcrites(projection: Projection, annotations: MagasinAnnotations): number {
  useVersionAnnotations(annotations)
  const cle = projection.diapos[projection.etat.index]?.cle
  return (projection.etat.blanches[cle ?? ''] ?? []).filter((p) => pageBlancheUtile(p, annotations.pages)).length
}

function etiquetteDiapo(d: DonneesDiapo): string {
  const nom = {
    titre: `Étape ${d.section.number}`,
    essentiel: 'L’essentiel',
    figure: 'Figure',
    exemple: 'Exemple',
    libre: d.type === 'libre' && d.demo ? 'Démonstration' : 'Exemple',
    teste: 'Teste-toi',
    atelier: 'Atelier',
    entrainement: 'S’entraîner',
    video: 'Vidéo',
  }[d.type]
  return `${nom} · ${titreCourt(d.section)}`
}

/** Sélection d'un morceau de la diapo (calque par-dessus la diapo, tant que l'outil « Copier » est pris). */
export function SelectionCopie({
  projection,
  annotations,
  page,
  echelle,
  versDiapo,
  finir,
}: {
  projection: Projection
  annotations: MagasinAnnotations
  page: string
  echelle: number
  versDiapo: (cx: number, cy: number) => P
  finir: () => void
}) {
  const [mode, setMode] = useState<'rectangle' | 'lasso'>('rectangle')
  const [cadre, setCadre] = useState<Cadre | null>(null)
  const [lasso, setLasso] = useState<P[] | null>(null)
  const [trace, setTrace] = useState<P[] | null>(null)
  const cible = Math.max(44, echelle > 0 ? 44 / echelle : 44)
  useEffect(() => {
    setCadre(null)
    setLasso(null)
  }, [page])
  // Échap : efface la sélection, puis range l'outil (avant les raccourcis de la projection).
  const etat = useRef({ cadre, finir })
  etat.current = { cadre, finir }
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      e.preventDefault()
      if (etat.current.cadre) {
        setCadre(null)
        setLasso(null)
      } else etat.current.finir()
    }
    window.addEventListener('keydown', f, true)
    return () => window.removeEventListener('keydown', f, true)
  }, [])

  const cleSource = page.startsWith('d:') ? page.slice(2) : null
  const copie = (): Copie | null => {
    if (!cadre || !cleSource) return null
    return { source: cleSource, pas: projection.etat.pas, cadre: { x: Math.round(cadre.x), y: Math.round(cadre.y), w: Math.round(cadre.w), h: Math.round(cadre.h) }, ...(lasso ? { lasso: lasso.map(([a, b]) => [Math.round(a - cadre.x), Math.round(b - cadre.y)] as P) } : {}) }
  }

  const surCalque = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    const p0 = versDiapo(e.clientX, e.clientY)
    if (mode === 'rectangle') {
      setLasso(null)
      suivrePointeur(
        e,
        (ev) => {
          const p = versDiapo(ev.clientX, ev.clientY)
          const x = borne(Math.min(p0[0], p[0]), 0, 1280)
          const y = borne(Math.min(p0[1], p[1]), 0, 720)
          setCadre({ x, y, w: borne(Math.max(p0[0], p[0]), 0, 1280) - x, h: borne(Math.max(p0[1], p[1]), 0, 720) - y })
        },
        () => setCadre((c) => (c && c.w >= 12 && c.h >= 12 ? c : null)),
      )
    } else {
      const points: P[] = [p0]
      setCadre(null)
      setTrace(points)
      suivrePointeur(
        e,
        (ev) => {
          points.push(versDiapo(ev.clientX, ev.clientY))
          setTrace([...points])
        },
        () => {
          setTrace(null)
          const l = simplifierLasso(points.map(([a, b]) => [borne(a, 0, 1280), borne(b, 0, 720)] as P))
          const c = cadreDuLasso(l)
          if (l.length < 3 || c.w < 12 || c.h < 12) return
          setCadre(c)
          setLasso(l)
        },
      )
    }
  }

  /** Poignée d'un coin (rectangle) : ajuste le cadre avant de valider. */
  const surPoignee = (e: React.PointerEvent, coin: P) => {
    e.stopPropagation()
    e.preventDefault()
    const c0 = cadre!
    const fixe: P = [coin[0] ? c0.x : c0.x + c0.w, coin[1] ? c0.y : c0.y + c0.h]
    suivrePointeur(
      e,
      (ev) => {
        const p = versDiapo(ev.clientX, ev.clientY)
        const x = borne(Math.min(fixe[0], p[0]), 0, 1280)
        const y = borne(Math.min(fixe[1], p[1]), 0, 720)
        setCadre({ x, y, w: Math.max(12, borne(Math.max(fixe[0], p[0]), 0, 1280) - x), h: Math.max(12, borne(Math.max(fixe[1], p[1]), 0, 720) - y) })
      },
      () => undefined,
    )
  }

  const coller = () => {
    const c = copie()
    if (!c) return
    garderCopie(c)
    const idPage = projection.ouvrirNouvellePage()
    if (!idPage) return
    const m = placerMorceau(c, nouvelId(projection.id))
    annotations.ajouter(clePageBlanche(idPage), m)
    finir()
    selectionnerObjet(m.id)
  }
  const copier = () => {
    const c = copie()
    if (!c) return
    garderCopie(c)
    finir()
  }

  const contour = lasso ? `M ${lasso.map((p) => p.join(' ')).join(' L ')} Z` : cadre ? `M ${cadre.x} ${cadre.y} h ${cadre.w} v ${cadre.h} h ${-cadre.w} Z` : ''
  const barreW = 5 * cible + 300
  const barreY = cadre ? (cadre.y + cadre.h + 16 + cible + 16 <= 660 ? cadre.y + cadre.h + 16 : Math.max(8, cadre.y - cible - 32)) : 16
  const barreX = cadre ? borne(cadre.x, 8, 1272 - barreW) : 640 - barreW / 2
  return (
    <>
      <div className="copie-calque projection-interactif" aria-label="Copier : tirer un cadre autour du morceau voulu" onPointerDown={surCalque} onClick={(e) => e.stopPropagation()}>
        <svg width={1280} height={720} viewBox="0 0 1280 720" aria-hidden="true">
          {cadre && <path className="copie-voile" d={`M 0 0 H 1280 V 720 H 0 Z ${contour}`} fillRule="evenodd" />}
          {contour && <path className="copie-contour" d={contour} />}
          {trace && trace.length > 1 && <path className="copie-contour" d={`M ${trace.map((p) => p.join(' ')).join(' L ')}`} />}
        </svg>
        {cadre &&
          !lasso &&
          (
            [
              [0, 0],
              [1, 0],
              [0, 1],
              [1, 1],
            ] as P[]
          ).map((coin) => (
            <span
              key={coin.join('')}
              className="copie-poignee"
              style={{ left: cadre.x + (coin[0] ? cadre.w : 0), top: cadre.y + (coin[1] ? cadre.h : 0), ['--cible' as string]: `${cible}px` }}
              role="slider"
              aria-label="Ajuster le cadre"
              aria-valuenow={Math.round(cadre.w)}
              onPointerDown={(e) => surPoignee(e, [coin[0] ? 0 : 1, coin[1] ? 0 : 1] as P)}
            />
          ))}
      </div>
      <div className="copie-barre projection-interactif" role="toolbar" aria-label="Copier un morceau de la diapo" style={{ left: barreX, top: barreY, ['--cible' as string]: `${cible}px` }} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        {(
          [
            ['rectangle', 'Rectangle'],
            ['lasso', 'Lasso'],
          ] as const
        ).map(([m, nom]) => (
          <button key={m} type="button" className="copie-bouton" aria-pressed={mode === m} onClick={() => setMode(m)} title={m === 'rectangle' ? 'Tirer un cadre' : 'Entourer à main levée'}>
            <PictoBlanc nom={m} taille={Math.round(cible * 0.4)} /> {nom}
          </button>
        ))}
        <span className="copie-sep" aria-hidden="true" />
        {cadre ? (
          <>
            <button type="button" className="copie-bouton" onClick={copier} title="Garder en mémoire : « Coller » sur une page blanche déjà ouverte">
              Copier
            </button>
            <button type="button" className="copie-bouton accent" onClick={coller}>
              <PictoBlanc nom="coller" taille={Math.round(cible * 0.4)} /> Coller sur une page blanche
            </button>
          </>
        ) : (
          <span className="copie-aide">{mode === 'rectangle' ? 'Tire un cadre autour du morceau à copier.' : 'Entoure le morceau à main levée.'}</span>
        )}
        <button type="button" className="copie-bouton" aria-label="Fermer l’outil Copier" title="Fermer (Échap)" onClick={finir}>
          <Pictogramme nom="fermer" taille={Math.round(cible * 0.38)} />
        </button>
      </div>
    </>
  )
}

/** Morceaux copiés depuis cette diapo (toutes ses pages blanches). */
function morceauxDeLaDiapo(projection: Projection, annotations: MagasinAnnotations, cle: string): Morceau[] {
  const res: Morceau[] = []
  for (const p of projection.etat.blanches[cle] ?? []) for (const e of annotations.pages.get(clePageBlanche(p.id)) ?? []) if (e.genre === 'morceau' && e.source === cle) res.push(e)
  return res
}

/**
 * Sur la diapo : un léger pointillé montre, quelques secondes, d'où viennent les morceaux copiés (puis disparaît) ; en
 * haut à droite, « n pages blanches › » rouvre la dernière page vue (pas sur l'écran de la classe en deux écrans ; masqué
 * avec la barre). Sur une page blanche qui contient un morceau collé : « Page blanche de « … » » dit d'où elle vient.
 */
export function ReperesPagesBlanches({ projection, annotations, page, role, echelle, blanche }: { projection: Projection; annotations: MagasinAnnotations; page: string; role: Role; echelle: number; blanche: boolean }) {
  const d = projection.diapos[projection.etat.index]
  const cle = d?.cle ?? ''
  const morceaux = !blanche && d ? morceauxDeLaDiapo(projection, annotations, cle) : []
  const [traces, setTraces] = useState(false)
  const avec = morceaux.length > 0
  useEffect(() => {
    if (blanche || !avec) return
    setTraces(true)
    const t = window.setTimeout(() => setTraces(false), 4000)
    return () => window.clearTimeout(t)
  }, [page, blanche, avec])
  const cible = Math.max(44, echelle > 0 ? 44 / echelle : 44)
  const ecrites = (projection.etat.blanches[cle] ?? []).filter((p) => pageBlancheUtile(p, annotations.pages)).length
  const minuteur = projection.etat.minuteur.fin !== null
  const elementsPage = annotations.pages.get(page) ?? []
  const colle = blanche && elementsPage.some((e) => e.genre === 'morceau')
  return (
    <>
      {traces &&
        morceaux.map((m) =>
          m.lasso && m.lasso.length > 2 ? (
            <svg key={m.id} className="morceau-origine" width={1280} height={720} viewBox="0 0 1280 720" aria-hidden="true">
              <path d={`M ${m.lasso.map(([a, b]) => `${a + m.cadre.x} ${b + m.cadre.y}`).join(' L ')} Z`} />
            </svg>
          ) : (
            <span key={m.id} className="morceau-origine-cadre" style={{ left: m.cadre.x, top: m.cadre.y, width: m.cadre.w, height: m.cadre.h }} aria-hidden="true" />
          ),
        )}
      {role !== 'diapos' && !blanche && ecrites > 0 && (
        <button
          type="button"
          className="repere-blanches projection-interactif"
          style={{ top: minuteur ? 84 : 14, ['--cible' as string]: `${cible}px` }}
          title="Rouvrir la dernière page blanche vue (B)"
          onClick={(e) => {
            e.stopPropagation()
            projection.basculerBlanc()
          }}
        >
          <PictoBlanc nom="page-blanche" taille={Math.round(cible * 0.42)} />
          {ecrites} page{ecrites > 1 ? 's' : ''} blanche{ecrites > 1 ? 's' : ''}
          <Pictogramme nom="suivant" taille={Math.round(cible * 0.36)} />
        </button>
      )}
      {role !== 'diapos' && colle && d && (
        <span className="repere-blanches repere-rattache" style={{ top: minuteur ? 84 : 14, ['--cible' as string]: `${cible}px` }}>
          <PictoBlanc nom="page-blanche" taille={Math.round(cible * 0.42)} />
          Page blanche de « {etiquetteDiapo(d)} »
        </span>
      )}
    </>
  )
}
