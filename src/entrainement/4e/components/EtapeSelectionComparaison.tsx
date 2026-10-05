import { useState } from "react";
import type { ExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import { Katex } from "./Katex";
import { VecteurGraph } from "./VecteurGraph";
import { consigneSelection, vecteursAffichesComparaison } from "../ui/formatComparaisonVecteurs";

interface Props {
  exercice: ExerciceComparaisonVecteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (labels: string[]) => void;
}

/**
 * Première étape : la figure (graphe Mafs, un vecteur par vecteur de l'exercice, axes cartésiens
 * masqués — cet exercice compare sens/direction/norme, jamais des coordonnées) + une rangée de
 * boutons à bascule, un par label en notation vectorielle réelle ($\vec{b}$, jamais une lettre
 * nue) — jamais de détection de clic directement sur la flèche du graphe (fragile en SVG), la
 * sélection se fait via ces boutons, dont l'état est reflété en temps réel par la couleur du
 * vecteur correspondant sur le graphe (sélection "sur la figure" au sens visuel, même si
 * l'interaction elle-même passe par les boutons).
 */
export function EtapeSelectionComparaison({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [selection, setSelection] = useState<string[]>([]);
  const consigne = consigneSelection(exercice);
  const { points, vecteurs } = vecteursAffichesComparaison(exercice, selection);

  function basculer(label: string) {
    setSelection((s) => (s.includes(label) ? s.filter((l) => l !== label) : [...s, label]));
  }

  return (
    <div>
      <VecteurGraph points={points} vecteurs={vecteurs} masquerAxes />
      <p className="prompt-text">
        {consigne.avant}
        <Katex expression={consigne.latex} />
        {consigne.apres}
      </p>

      <div className="options-grid-compact">
        {exercice.vecteurs
          .filter((v) => v.label !== exercice.labelReference)
          .map((v) => (
            <button
              key={v.label}
              type="button"
              className={selection.includes(v.label) ? "btn toggle-active" : "btn"}
              onClick={() => basculer(v.label)}
            >
              <Katex expression={`\\vec{${v.label}}`} />
            </button>
          ))}
      </div>

      <button type="button" className="btn btn-primary" disabled={selection.length === 0} onClick={() => onValider(selection)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
