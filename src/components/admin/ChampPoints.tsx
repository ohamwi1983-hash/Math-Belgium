import { useState } from 'react'
import { lirePoints } from '../../lib/pointsAutomatiques'
import { useEstimationsCalculees } from './RepereNiveauDuree'

/**
 * Champ « points » d'une rangée du panneau (évaluation, examen) — points pré-remplis
 * (`lib/pointsAutomatiques.ts`) et VERROU :
 * - la valeur affichée est lue à chaque rendu par `valeur()` (automatique tant que la rangée n'est pas
 *   verrouillée) ; le composant se re-rend quand une estimation de durée arrive en cache, pour qu'une
 *   rangée pas encore choisie affiche sa valeur automatique dès qu'elle est connue ;
 * - saisie en TEXTE LIBRE (règle du dépôt : jamais `type="number"` ni filtre de frappe) lue avec
 *   tolérance (« 2 », « 2,5 », « 2.5 pts ») : lisible → la valeur est gardée et la rangée VERROUILLÉE ;
 *   illisible → le champ est signalé, rien n'est écrasé ; en quittant le champ, il reprend la valeur ;
 * - petit cadenas : fermé = verrouillé (clic : déverrouiller → la règle automatique reprend) ; ouvert
 *   = automatique ou ajusté (clic : verrouiller la valeur affichée).
 */
export function ChampPoints({
  valeur,
  verrouille,
  ajuste,
  disabled,
  libelle,
  onSaisie,
  onVerrou,
}: {
  valeur: () => number
  verrouille: boolean
  ajuste?: boolean
  disabled?: boolean
  libelle: string
  onSaisie: (points: number) => void
  onVerrou: (verrouiller: boolean) => void
}) {
  useEstimationsCalculees()
  const [brouillon, setBrouillon] = useState<string | null>(null)
  const v = valeur()
  const affiche = brouillon ?? String(v).replace('.', ',')
  const illisible = brouillon !== null && lirePoints(brouillon) === null
  const etat = verrouille ? 'verrouillé (saisi à la main) — clic : revenir aux points automatiques' : ajuste ? 'ajusté au total — clic : verrouiller' : 'automatique — clic : verrouiller'
  return (
    <span className="admin-eval-points-champ">
      <input
        type="text"
        autoComplete="off"
        className={`admin-eval-points-input${illisible ? ' admin-eval-points-illisible' : ''}`}
        aria-label={libelle}
        aria-invalid={illisible || undefined}
        title={illisible ? 'Points illisibles : écris par exemple 2 ou 2,5 (demi-points).' : libelle}
        value={affiche}
        disabled={disabled}
        onChange={(e) => {
          const texte = e.target.value
          setBrouillon(texte)
          const lu = lirePoints(texte)
          if (lu !== null) onSaisie(lu)
        }}
        onBlur={() => setBrouillon(null)}
      />
      <button
        type="button"
        className={`admin-eval-verrou${verrouille ? ' admin-eval-verrou-ferme' : ''}`}
        aria-pressed={verrouille}
        aria-label={`Points ${etat}`}
        title={`Points ${etat}`}
        disabled={disabled}
        onClick={() => onVerrou(!verrouille)}
      >
        <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
          <rect x="3" y="7" width="10" height="7.5" rx="1.5" fill="currentColor" />
          <path d={verrouille ? 'M5 7V5a3 3 0 0 1 6 0v2' : 'M5 7V5a3 3 0 0 1 5.6-1.5'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  )
}
