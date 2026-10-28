interface Props {
  /** Valeurs saisies (texte brut, une par point isolé) — vide tant que l'élève n'en ajoute pas. */
  valeurs: string[];
  onChange: (valeurs: string[]) => void;
}

/**
 * Points isolés ajoutés à une construction par intervalles (racine double avec ≤/≥, audit
 * gen5/gen6) : ex. ]−∞ ; 1] ∪ {3}. Facultatifs — aucun champ tant que l'élève n'appuie pas sur
 * « + Ajouter un point isolé » ; même présentation que `ListeMorceauxInput` (ligne + bouton ×).
 */
export function ListePointsIsolesInput({ valeurs, onChange }: Props) {
  return (
    <div className="liste-morceaux liste-points-isoles">
      {valeurs.map((valeur, index) => (
        <div key={index} className="liste-morceaux-ligne">
          <span className="liste-points-accolade" aria-hidden="true">
            ∪ {"{"}
          </span>
          <input
            className="text-input"
            inputMode="decimal"
            value={valeur}
            placeholder="point isolé"
            aria-label={`Point isolé ${index + 1}`}
            onChange={(e) => onChange(valeurs.map((v, i) => (i === index ? e.target.value : v)))}
          />
          <span className="liste-points-accolade" aria-hidden="true">
            {"}"}
          </span>
          <button
            type="button"
            className="btn liste-morceaux-retirer"
            aria-label={`Retirer le point isolé ${index + 1}`}
            onClick={() => onChange(valeurs.filter((_, i) => i !== index))}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="btn liste-morceaux-ajouter" onClick={() => onChange([...valeurs, ""])}>
        + Ajouter un point isolé
      </button>
    </div>
  );
}

/** Valeurs numériques des points isolés, ou null si un champ ajouté est vide ou invalide. */
export function construirePointsIsoles(valeurs: string[]): number[] | null {
  const nombres = valeurs.map((texte) => Number(texte.trim().replace(",", ".")));
  const valides = valeurs.every((texte) => texte.trim() !== "") && nombres.every((n) => Number.isFinite(n));
  return valides ? nombres : null;
}
