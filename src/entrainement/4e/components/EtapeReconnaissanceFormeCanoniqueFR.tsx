import { useState } from "react";
import type { ExerciceFormeCanoniqueFonctionReference, FamilleReference } from "../core/formeCanoniqueFonctionsReference.types";
import { formatFormeDepartLatex } from "../ui/formatFormeCanoniqueFonctionsReference";
import { OPTIONS_FAMILLE } from "../ui/famillesReferenceLabels";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceFormeCanoniqueFonctionReference;
  tentativesUtilisees: number;
  tentativesMax: number;
  onChoisir: (choix: FamilleReference) => void;
}

/** Étape 0 (section 2 de la spec) : la forme de départ NON simplifiée est affichée (jamais le
 * graphe — contrairement à "Transformations graphiques — fonctions de référence", dont on ne
 * réutilise ici que la liste de boutons `OPTIONS_FAMILLE`) ; l'élève identifie la famille parmi
 * les 6. */
export function EtapeReconnaissanceFormeCanoniqueFR({ exercice, tentativesUtilisees, tentativesMax, onChoisir }: Props) {
  const [choix, setChoix] = useState<FamilleReference | null>(null);
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatFormeDepartLatex(exercice)} block />
      </div>
      <p className="prompt-text">À quelle fonction de référence appartient cette expression ?</p>
      <div className="options-grid">
        {OPTIONS_FAMILLE.map((option) => (
          <button
            key={option.valeur}
            type="button"
            className={`btn${choix === option.valeur ? " toggle-active" : ""}${erronee && choix === option.valeur ? " is-erronee" : ""}`}
            onClick={() => setChoix(option.valeur)}
          >
            {option.libelle}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onChoisir(choix)}>
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
