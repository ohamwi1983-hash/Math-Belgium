import { useEffect, useState } from 'react'
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
  pleinEcran: boolean
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

export function Bouton({ label, picto, actif, onClick, raccourci }: { label: string; picto: NomPictogramme; actif?: boolean; onClick: () => void; raccourci?: string }) {
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
    </button>
  )
}

/** Stylo (S) : ouvre / range la palette ; depuis le compas, revient au stylo. */
export const basculerStylo = (o: OutilsLocaux): OutilsLocaux =>
  o.stylo && o.outil !== 'compas' ? { ...o, stylo: false, menuMinuteur: false } : { ...o, stylo: true, outil: o.outil === 'compas' ? 'stylo' : o.outil, menuMinuteur: false }
/** Compas (C). */
export const basculerCompas = (o: OutilsLocaux): OutilsLocaux =>
  o.stylo && o.outil === 'compas' ? { ...o, stylo: false, outil: 'stylo' } : { ...o, stylo: true, outil: 'compas', menuMinuteur: false }
/** Surligneur (H). */
export const basculerFluo = (o: OutilsLocaux): OutilsLocaux => (o.stylo && o.outil === 'fluo' ? { ...o, outil: 'stylo' } : { ...o, stylo: true, outil: 'fluo', menuMinuteur: false })

const NOMS_EPAISSEUR: Record<Epaisseur, string> = { fin: 'fin', moyen: 'moyen', epais: 'épais' }

/** Palette de dessin (maquette D1) : stylo 4 couleurs, fluo 4 couleurs, 3 épaisseurs, gomme, annuler, tout effacer. */
export function PaletteDessin({ outils, setOutils }: { outils: OutilsLocaux; setOutils: (f: (o: OutilsLocaux) => OutilsLocaux) => void }) {
  const traitActif = outils.outil === 'stylo' || outils.outil === 'compas'
  return (
    <div className="projection-palette projection-palette--dessin" role="group" aria-label="Stylo, surligneur et gomme">
      <span className="projection-palette-nom" aria-hidden="true">
        {outils.outil === 'compas' ? 'Compas' : 'Stylo'}
      </span>
      {COULEURS_STYLO.map((c) => (
        <button
          key={c.valeur}
          type="button"
          className={`projection-couleur${traitActif && outils.couleur === c.valeur ? ' actif' : ''}`}
          style={{ ['--c' as string]: c.valeur }}
          aria-label={`Stylo ${c.nom.toLowerCase()}`}
          aria-pressed={traitActif && outils.couleur === c.valeur}
          title={`Stylo ${c.nom.toLowerCase()} (S)`}
          onClick={() => setOutils((o) => ({ ...o, outil: o.outil === 'compas' ? 'compas' : 'stylo', couleur: c.valeur }))}
        />
      ))}
      <span className="projection-separateur" aria-hidden="true" />
      <span className="projection-palette-nom" aria-hidden="true">
        Fluo
      </span>
      {COULEURS_FLUO.map((c) => (
        <button
          key={c.valeur}
          type="button"
          className={`projection-fluo${outils.outil === 'fluo' && outils.fluo === c.valeur ? ' actif' : ''}`}
          style={{ ['--c' as string]: c.valeur }}
          aria-label={`Surligneur ${c.nom.toLowerCase()}`}
          aria-pressed={outils.outil === 'fluo' && outils.fluo === c.valeur}
          title={`Surligneur ${c.nom.toLowerCase()} (H)`}
          onClick={() => setOutils((o) => ({ ...o, outil: 'fluo', fluo: c.valeur }))}
        />
      ))}
      <span className="projection-separateur" aria-hidden="true" />
      <span className="projection-palette-nom" aria-hidden="true">
        Trait
      </span>
      {(Object.keys(EPAISSEURS) as Epaisseur[]).map((e) => (
        <button
          key={e}
          type="button"
          className={`projection-epaisseur${outils.epaisseur === e ? ' actif' : ''}`}
          style={{ ['--e' as string]: `${EPAISSEURS[e] + 1}px` }}
          aria-label={`Trait ${NOMS_EPAISSEUR[e]}`}
          aria-pressed={outils.epaisseur === e}
          title={`Trait ${NOMS_EPAISSEUR[e]}`}
          onClick={() => setOutils((o) => ({ ...o, epaisseur: e, outil: o.outil === 'fluo' || o.outil === 'gomme' ? 'stylo' : o.outil }))}
        >
          <span />
        </button>
      ))}
      <span className="projection-separateur" aria-hidden="true" />
      <Bouton label="Gomme" picto="gomme" actif={outils.outil === 'gomme'} onClick={() => setOutils((o) => ({ ...o, outil: o.outil === 'gomme' ? 'stylo' : 'gomme' }))} />
      <Bouton label="Annuler le dernier trait" picto="annuler" raccourci="Ctrl+Z" onClick={() => window.dispatchEvent(new Event('projection:annuler'))} />
      <Bouton label="Tout effacer sur cette diapo" picto="effacer" onClick={() => window.dispatchEvent(new Event('projection:effacer'))} />
    </div>
  )
}

/** Fond de l'écran blanc : uni, quadrillé, repère (partagé avec l'autre écran). */
export function PaletteFond({ projection, compacte = false }: { projection: Projection; compacte?: boolean }) {
  return (
    <div className={compacte ? 'projection-fonds' : 'projection-palette'} role="group" aria-label="Fond de l'écran blanc">
      {!compacte && (
        <span className="projection-palette-nom" aria-hidden="true">
          Fond
        </span>
      )}
      {FONDS.map((f) => (
        <button key={f.valeur} type="button" className="projection-duree" aria-pressed={projection.etat.fond === f.valeur} onClick={() => projection.choisirFond(f.valeur)}>
          {f.nom}
        </button>
      ))}
    </div>
  )
}

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
}: {
  magasin: MagasinInstruments
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
      {etat.blanc && <PaletteFond projection={projection} />}
      {outils.stylo && <PaletteDessin outils={outils} setOutils={setOutils} />}
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
      <Bouton label="Stylo d'annotation" picto="crayon" actif={outils.stylo && outils.outil !== 'compas'} onClick={() => setOutils(basculerStylo)} raccourci="S ; surligneur : H" />
      <BoutonsInstruments outils={outils} setOutils={setOutils} magasin={magasin} />
      <span className="projection-separateur" aria-hidden="true" />
      <button
        type="button"
        className={`projection-outil${outils.menuMinuteur ? ' actif' : ''}${reste !== null ? ' avec-temps' : ''}`}
        aria-label={reste !== null ? `Minuteur : ${formatDuree(reste)} restantes` : 'Minuteur'}
        title="Minuteur"
        aria-expanded={outils.menuMinuteur}
        onClick={() => setOutils((o) => ({ ...o, menuMinuteur: !o.menuMinuteur, stylo: false }))}
      >
        <Pictogramme nom="minuteur" />
        {reste !== null && <span className="projection-temps">{formatDuree(reste)}</span>}
      </button>
      <Bouton label="Écran blanc" picto="ecran-blanc" actif={etat.blanc} onClick={basculerBlanc} raccourci="B" />
      <Bouton label="Vue d'ensemble" picto="grille" actif={outils.ensemble} onClick={() => setOutils((o) => ({ ...o, ensemble: !o.ensemble }))} raccourci="G" />
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
