import { useState } from "react";
import type { ExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import { Katex } from "./Katex";
import { FigureComparaison } from "./FigureComparaison";
import { aideSelectionComparaison, consigneSelection } from "../ui/formatComparaisonVecteurs";
import { aidesParNiveau } from "../ui/retoursVecteurs";
import { AidesNiveaux } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceComparaisonVecteurs;
  onActiverAide: () => void;
  onValider: (labels: string[]) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentative épuisée) — gèle la sélection,
   * remplace "Valider" par le bloc `ValidationEcran`. */
  validation?: ValidationEtapeProps | null;
}

/**
 * Première étape : la figure (graphe Mafs, axes cartésiens masqués — cet exercice compare
 * sens/direction/norme, jamais des coordonnées) + une case par vecteur, en notation vectorielle
 * réelle ($\vec{b}$). Sélection MULTIPLE : cases carrées (`.options-multiples`), jamais les
 * pastilles rondes d'un choix unique (audit 4e ch. 6, G13). Choix fermé : UNE tentative (moteur,
 * G3), aides à deux niveaux. L'état de chaque case est reflété en direct par la couleur du vecteur.
 */
export function EtapeSelectionComparaison({ exercice, onActiverAide, onValider, validation }: Props) {
  const [selection, setSelection] = useState<string[]>([]);
  const consigne = consigneSelection(exercice);

  function basculer(label: string) {
    setSelection((s) => (s.includes(label) ? s.filter((l) => l !== label) : [...s, label]));
  }

  return (
    <div>
      <FigureComparaison exercice={exercice} selection={selection} />
      <p className="prompt-text">
        {consigne.avant}
        <Katex expression={consigne.latex} />
        {consigne.apres}
      </p>

      <div className="options-grid-compact options-multiples" role="group">
        {exercice.vecteurs
          .filter((v) => v.label !== exercice.labelReference)
          .map((v) => (
            <button
              key={v.label}
              type="button"
              role="checkbox"
              aria-checked={selection.includes(v.label)}
              className={selection.includes(v.label) ? "btn toggle-active" : "btn"}
              disabled={Boolean(validation)}
              onClick={() => basculer(v.label)}
            >
              <Katex expression={`\\vec{${v.label}}`} />
            </button>
          ))}
      </div>

      {!validation && (
        <>
          <AidesNiveaux aides={aidesParNiveau((n) => aideSelectionComparaison(exercice, n))} onPremiereAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={selection.length === 0} onClick={() => onValider(selection)}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
