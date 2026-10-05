import { useState } from "react";
import type { ExerciceApplicationPhysique, VarianteApplicationPhysique } from "../core/applicationPhysique.types";
import { formatEnonceApplicationPhysique, segmentsConsigneConfiguration } from "../ui/formatApplicationPhysique";
import { RenduFragments } from "./RenduFragments";
import { SchemaApplicationPhysique } from "./SchemaApplicationPhysique";

interface Props {
  exercice: ExerciceApplicationPhysique;
  tentativesUtilisees: number;
  tentativesMax: number;
  onChoisir: (choix: VarianteApplicationPhysique) => void;
}

const OPTIONS: { valeur: VarianteApplicationPhysique; libelle: string }[] = [
  { valeur: "angleDroit", libelle: "Angle droit" },
  { valeur: "angleQuelconque", libelle: "Angle quelconque" },
];

/** Première étape, toujours la même : contexte narratif + schéma, affichés ici et persistants sur
 * les 3 écrans suivants (jamais d'écran "énoncé" séparé sans question, même leçon déjà établie
 * ailleurs dans le projet — voir CLAUDE.md). */
export function EtapeModelisationApplicationPhysique({ exercice, tentativesUtilisees, tentativesMax, onChoisir }: Props) {
  const [choix, setChoix] = useState<VarianteApplicationPhysique | null>(null);
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <p className="prompt-text">{formatEnonceApplicationPhysique(exercice)}</p>
      <SchemaApplicationPhysique exercice={exercice} />

      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneConfiguration(exercice)} />
      </p>
      <div className="options-grid-compact">
        {OPTIONS.map((option) => (
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
