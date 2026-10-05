import type { EtatListeMorceaux } from "../ui/listeMorceaux";
import { ajouterMorceau, remplacerMorceau, retirerMorceau } from "../ui/listeMorceaux";
import { MorceauIntervalleInput } from "./MorceauIntervalleInput";

interface Props {
  etat: EtatListeMorceaux;
  onChange: (etat: EtatListeMorceaux) => void;
}

/**
 * Liste extensible de morceaux d'intervalle (refonte points 1 et 5) : une ligne
 * `MorceauIntervalleInput` par morceau, bouton "+" pour en ajouter un, bouton "×" par ligne pour
 * en retirer un (jamais le dernier restant) — jamais fixé à 2 morceaux, contrairement à l'ancienne
 * construction "union" à 2 champs.
 */
export function ListeMorceauxInput({ etat, onChange }: Props) {
  return (
    <div className="liste-morceaux">
      {etat.map((morceau, index) => (
        <div key={index} className="liste-morceaux-ligne">
          <MorceauIntervalleInput etat={morceau} onChange={(nouveau) => onChange(remplacerMorceau(etat, index, nouveau))} />
          {etat.length > 1 && (
            <button
              type="button"
              className="btn liste-morceaux-retirer"
              aria-label={`Retirer le morceau ${index + 1}`}
              onClick={() => onChange(retirerMorceau(etat, index))}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn liste-morceaux-ajouter" onClick={() => onChange(ajouterMorceau(etat))}>
        + Ajouter un morceau
      </button>
    </div>
  );
}
