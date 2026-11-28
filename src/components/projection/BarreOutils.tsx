import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Pictogramme } from './Pictogrammes'
import type { NomPictogramme } from './Pictogrammes'
import { useInstrument } from './instruments'
import type { MagasinInstruments } from './instruments'
import type { FondBlanc, Projection } from './useProjection'

export const COULEURS_STYLO = [
  { valeur: '#b23a3a', nom: 'Rouge' },
  { valeur: '#1d52a8', nom: 'Bleu' },
  { valeur: '#2f7a4f', nom: 'Vert' },
  { valeur: '#182430', nom: 'Noir' },
]

/** Surligneur : couleurs pastel posées en `multiply` (le texte noir reste noir dessous). */
export const COULEURS_FLUO = [
  { valeur: '#ffe14d', nom: 'Jaune' },
  { valeur: '#86e8a0', nom: 'Vert' },
  { valeur: '#ff9ccf', nom: 'Rose' },
  { valeur: '#86ccff', nom: 'Bleu' },
]

/** Épaisseurs du stylo (et des arcs du compas), en px logiques de la diapo. */
export const EPAISSEURS = { fin: 3, moyen: 5, epais: 9 } as const
export type Epaisseur = keyof typeof EPAISSEURS

export const FONDS: { valeur: FondBlanc; nom: string }[] = [
  { valeur: 'uni', nom: 'Uni' },
  { valeur: 'quadrille', nom: 'Quadrillé' },
  { valeur: 'repere', nom: 'Repère' },
]

/** `stylo` : outil de dessin actif (palette ouverte) ; `outil` : lequel (le compas dessine aussi). */
export type OutilDessin = 'stylo' | 'fluo' | 'gomme' | 'compas'

export const DUREES_MINUTEUR = [1, 2, 3, 5, 10]

export interface OutilsLocaux {
  stylo: boolean
  outil: OutilDessin
  couleur: string
  fluo: string
  epaisseur: Epaisseur
  ensemble: boolean
  menuMinuteur: boolean
  /** Palette « Télécharger » (PowerPoint / PDF annotés, nouvelle séance). */
  menuExport: boolean
  /** Traceur (page « repère ») déplié sous la barre de l'écran blanc ; replié dès qu'une courbe est tracée ou qu'on écrit. */
  traceur: boolean
  pleinEcran: boolean
  /** Colonne du dessin ouverte (pastille touchée) ; repliée dès qu'on écrit, à Échap ou en re-touchant la pastille. LOCAL. */
  palette: boolean
  /** Nuancier ouvert à côté de la colonne. */
  nuancier: boolean
  /** Menu « fond ▾ » de l'écran blanc ouvert. */
  menuFond: boolean
  /** Menu « Gabarit ▾ » de l'écran blanc ouvert (P2). LOCAL. */
  menuGabarit?: boolean
  /** Onglet du traceur : Courbes, Points, Tangente, Aire (P3). LOCAL. */
  ongletTraceur?: 'courbes' | 'points' | 'tangente' | 'aire'
  /** Outil « Copier » pris (P4, X) : entourer un morceau de la diapo. LOCAL. */
  copier?: boolean
}

export function formatDuree(s: number): string {
  const t = Math.max(0, Math.ceil(s))
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}

/** Secondes restantes du minuteur de la barre (null = arrêté), mises à jour 4 fois par seconde. */
export function useResteMinuteur(fin: number | null): number | null {
  const [maintenant, setMaintenant] = useState(() => Date.now())
  useEffect(() => {
    if (fin === null) return
    const t = window.setInterval(() => setMaintenant(Date.now()), 250)
    return () => window.clearInterval(t)
  }, [fin])
  return fin === null ? null : Math.max(0, (fin - maintenant) / 1000)
}

export function Bouton({ label, picto, actif, onClick, raccourci, pastille }: { label: string; picto: NomPictogramme; actif?: boolean; onClick: () => void; raccourci?: string; pastille?: number }) {
  return (
    <button
      type="button"
      className={`projection-outil${actif ? ' actif' : ''}`}
      aria-label={label}
      title={raccourci ? `${label} (${raccourci})` : label}
      aria-pressed={actif === undefined ? undefined : actif}
      onClick={onClick}
    >
      <Pictogramme nom={picto} />
      {!!pastille && (
        <span className="projection-outil-pastille" aria-hidden="true">
          {pastille}
        </span>
      )}
    </button>
  )
}

/** Outil de dessin rangé : pastille, colonne et nuancier disparaissent. */
const range = (o: OutilsLocaux): OutilsLocaux => ({ ...o, stylo: false, palette: false, nuancier: false })
/** Outil de dessin pris : seule la pastille apparaît (maquette 1 : « toute la diapo est libre ») ; la toucher ouvre la colonne. */
const pris = (o: OutilsLocaux, outil: OutilDessin): OutilsLocaux => ({ ...o, stylo: true, outil, menuMinuteur: false, traceur: false, menuFond: false, menuGabarit: false, copier: false })
/** Stylo (S) : prend / range le stylo ; depuis le compas, revient au stylo. */
export const basculerStylo = (o: OutilsLocaux): OutilsLocaux =>
  o.stylo && o.outil !== 'compas' ? { ...range(o), menuMinuteur: false } : pris(o, o.outil === 'compas' ? 'stylo' : o.outil)
/** Compas (C). */
export const basculerCompas = (o: OutilsLocaux): OutilsLocaux => (o.stylo && o.outil === 'compas' ? { ...range(o), outil: 'stylo' } : pris(o, 'compas'))
/** Surligneur (H). */
export const basculerFluo = (o: OutilsLocaux): OutilsLocaux => (o.stylo && o.outil === 'fluo' ? { ...o, outil: 'stylo' } : pris(o, 'fluo'))

/** Équerre (Q), compas (C), calculatrice (K) : équerre et calculatrice sont partagées avec l'autre écran. */
export function BoutonsInstruments({ outils, setOutils, magasin }: { outils: OutilsLocaux; setOutils: (f: (o: OutilsLocaux) => OutilsLocaux) => void; magasin: MagasinInstruments }) {
  const equerre = useInstrument(magasin, (e) => e.equerre.visible)
  const calc = useInstrument(magasin, (e) => e.calc.visible)
  return (
    <>
      <Bouton label="Équerre" picto="equerre" actif={equerre} onClick={() => magasin.equerre({ visible: !equerre })} raccourci="Q" />
      <Bouton label="Compas" picto="compas" actif={outils.stylo && outils.outil === 'compas'} onClick={() => setOutils(basculerCompas)} raccourci="C" />
      <Bouton label="Calculatrice" picto="calculatrice" actif={calc} onClick={() => magasin.calc({ visible: !calc })} raccourci="K" />
    </>
  )
}

/**
 * Barre d'outils du bas (maquettes Titre / Essentiel / Exemple / Teste, outils D1–D3) : fil « chapitre ·
 * § n titre », stylo / surligneur (palette), équerre, compas, calculatrice, minuteur, écran blanc (fond
 * uni / quadrillé / repère), vue d'ensemble, plein écran, ‹ n / N ›, quitter. Masquée après 3 s
 * sans mouvement (`visible`), revient au moindre mouvement de la souris ou toucher.
 */
export function BarreOutils({
  projection,
  total,
  fil,
  outils,
  setOutils,
  visible,
  basculerPleinEcran,
  quitter,
  magasin,
  paletteExport,
  boutonCopier,
  pagesEcrites,
}: {
  /** Outil « Copier » (P4), à gauche du stylo. */
  boutonCopier?: ReactNode
  /** Pages blanches écrites de la diapo affichée : pastille « n » sur le bouton Écran blanc (P4). */
  pagesEcrites?: number
  magasin: MagasinInstruments
  /** Palette « Télécharger » (absente sur l'écran de la classe en deux écrans). */
  paletteExport?: ReactNode
  projection: Projection
  total: number
  fil: string
  outils: OutilsLocaux
  setOutils: (f: (o: OutilsLocaux) => OutilsLocaux) => void
  visible: boolean
  basculerPleinEcran: () => void
  quitter: () => void
}) {
  const { etat, suivant, precedent, basculerBlanc, lancerMinuteur, arreterMinuteur } = projection
  const reste = useResteMinuteur(etat.minuteur.fin)
  return (
    <div className={`projection-barre${visible ? '' : ' masquee'}`} role="toolbar" aria-label="Outils de projection" onClick={(e) => e.stopPropagation()}>
      <span className="projection-fil">{fil}</span>
      <div className="projection-palettes">
      {outils.menuExport && paletteExport}
      {outils.menuMinuteur && (
        <div className="projection-palette" role="group" aria-label="Minuteur">
          {DUREES_MINUTEUR.map((m) => (
            <button
              key={m}
              type="button"
              className="projection-duree"
              onClick={() => {
                lancerMinuteur(m * 60)
                setOutils((o) => ({ ...o, menuMinuteur: false }))
              }}
            >
              {m} min
            </button>
          ))}
          {etat.minuteur.fin !== null && (
            <button
              type="button"
              className="projection-duree projection-duree--stop"
              onClick={() => {
                arreterMinuteur()
                setOutils((o) => ({ ...o, menuMinuteur: false }))
              }}
            >
              Arrêter
            </button>
          )}
        </div>
      )}
      </div>
      {boutonCopier}
      <Bouton label="Stylo d'annotation" picto="crayon" actif={outils.stylo && outils.outil !== 'compas'} onClick={() => setOutils(basculerStylo)} raccourci="S ; surligneur : H" />
      <BoutonsInstruments outils={outils} setOutils={setOutils} magasin={magasin} />
      <span className="projection-separateur" aria-hidden="true" />
      <button
        type="button"
        className={`projection-outil${outils.menuMinuteur ? ' actif' : ''}${reste !== null ? ' avec-temps' : ''}`}
        aria-label={reste !== null ? `Minuteur : ${formatDuree(reste)} restantes` : 'Minuteur'}
        title="Minuteur"
        aria-expanded={outils.menuMinuteur}
        onClick={() => setOutils((o) => ({ ...o, menuMinuteur: !o.menuMinuteur, menuExport: false, palette: false, nuancier: false }))}
      >
        <Pictogramme nom="minuteur" />
        {reste !== null && <span className="projection-temps">{formatDuree(reste)}</span>}
      </button>
      <Bouton label={pagesEcrites ? `Écran blanc (${pagesEcrites} page${pagesEcrites > 1 ? 's' : ''} blanche${pagesEcrites > 1 ? 's' : ''} pour cette diapo)` : 'Écran blanc'} picto="ecran-blanc" actif={etat.blanc} onClick={basculerBlanc} raccourci="B" pastille={pagesEcrites} />
      <Bouton label="Vue d'ensemble" picto="grille" actif={outils.ensemble} onClick={() => setOutils((o) => ({ ...o, ensemble: !o.ensemble }))} raccourci="G" />
      {paletteExport && (
        <button
          type="button"
          className={`projection-outil${outils.menuExport ? ' actif' : ''}`}
          aria-label="Télécharger le PowerPoint ou le PDF annoté"
          title="Télécharger le PowerPoint ou le PDF annoté · Nouvelle séance"
          aria-expanded={outils.menuExport}
          onClick={() => setOutils((o) => ({ ...o, menuExport: !o.menuExport, menuMinuteur: false, palette: false, nuancier: false }))}
        >
          <Pictogramme nom="telecharger" />
        </button>
      )}
      <Bouton label={outils.pleinEcran ? 'Quitter le plein écran' : 'Plein écran'} picto={outils.pleinEcran ? 'quitter-plein-ecran' : 'plein-ecran'} onClick={basculerPleinEcran} raccourci="F" />
      <span className="projection-separateur" aria-hidden="true" />
      <Bouton label="Précédent" picto="precedent" onClick={precedent} raccourci="←" />
      <span className="projection-compteur" aria-live="polite">
        {etat.index + 1} / {total}
      </span>
      <Bouton label="Suivant" picto="suivant" onClick={suivant} raccourci="→" />
      <span className="projection-separateur" aria-hidden="true" />
      <Bouton label="Quitter la projection" picto="fermer" onClick={quitter} />
    </div>
  )
}
