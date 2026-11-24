import { useEffect, useState } from 'react'
import { Pictogramme } from './Pictogrammes'
import type { OutilStylo } from './Scene'
import type { Projection } from './useProjection'

export const COULEURS_STYLO = [
  { valeur: '#b23a3a', nom: 'Rouge' },
  { valeur: '#1d52a8', nom: 'Bleu' },
  { valeur: '#2f7a4f', nom: 'Vert' },
  { valeur: '#182430', nom: 'Noir' },
]

export const DUREES_MINUTEUR = [1, 2, 3, 5, 10]

export interface OutilsLocaux {
  stylo: boolean
  outil: OutilStylo
  couleur: string
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

function Bouton({ label, picto, actif, onClick, raccourci }: { label: string; picto: Parameters<typeof Pictogramme>[0]['nom']; actif?: boolean; onClick: () => void; raccourci?: string }) {
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

/**
 * Barre d'outils du bas (maquettes Titre / Essentiel / Exemple / Teste) : fil « chapitre · § n titre »,
 * stylo, minuteur, écran blanc, vue d'ensemble, plein écran, ‹ n / N ›, quitter. Masquée après 3 s
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
}: {
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
      {outils.stylo && (
        <div className="projection-palette" role="group" aria-label="Stylo">
          {COULEURS_STYLO.map((c) => (
            <button
              key={c.valeur}
              type="button"
              className={`projection-couleur${outils.outil === 'stylo' && outils.couleur === c.valeur ? ' actif' : ''}`}
              style={{ ['--c' as string]: c.valeur }}
              aria-label={`Stylo ${c.nom.toLowerCase()}`}
              aria-pressed={outils.outil === 'stylo' && outils.couleur === c.valeur}
              title={c.nom}
              onClick={() => setOutils((o) => ({ ...o, outil: 'stylo', couleur: c.valeur }))}
            />
          ))}
          <span className="projection-separateur" aria-hidden="true" />
          <Bouton label="Gomme" picto="gomme" actif={outils.outil === 'gomme'} onClick={() => setOutils((o) => ({ ...o, outil: o.outil === 'gomme' ? 'stylo' : 'gomme' }))} />
          <Bouton label="Tout effacer" picto="effacer" onClick={() => window.dispatchEvent(new Event('projection:effacer'))} />
        </div>
      )}
      {outils.menuMinuteur && (
        <div className="projection-palette projection-palette--minuteur" role="group" aria-label="Minuteur">
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
      <Bouton label="Stylo d'annotation" picto="crayon" actif={outils.stylo} onClick={() => setOutils((o) => ({ ...o, stylo: !o.stylo, menuMinuteur: false }))} raccourci="S" />
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
