import type { EtatListeMorceauxFraction } from "../ui/listeMorceauxFraction";
import { ajouterMorceauFraction, remplacerMorceauFraction, retirerMorceauFraction } from "../ui/listeMorceauxFraction";
import { MorceauFractionInput } from "./MorceauFractionInput";

interface Props {
  etat: EtatListeMorceauxFraction;
  onChange: (etat: EtatListeMorceauxFraction) => void;
}

/** Variante fraction-compatible de `ListeMorceauxInput.tsx` (douzième exercice) — même mécanisme
 * extensible ("+ Ajouter un morceau"/"×"), sur `MorceauFractionInput`. */
export function ListeMorceauxFractionInput({ etat, onChange }: Props) {
  return (
    <div className="liste-morceaux">
      {etat.map((morceau, index) => (
        <div key={index} className="liste-morceaux-ligne">
          <MorceauFractionInput etat={morceau} onChange={(nouveau) => onChange(remplacerMorceauFraction(etat, index, nouveau))} />
          {etat.length > 1 && (
            <button
              type="button"
              className="btn liste-morceaux-retirer"
              aria-label={`Retirer le morceau ${index + 1}`}
              onClick={() => onChange(retirerMorceauFraction(etat, index))}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn liste-morceaux-ajouter" onClick={() => onChange(ajouterMorceauFraction(etat))}>
        + Ajouter un morceau
      </button>
    </div>
  );
}
