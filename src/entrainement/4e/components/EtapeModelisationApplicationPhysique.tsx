import { useState } from "react";
import type { ExerciceApplicationPhysique, VarianteApplicationPhysique } from "../core/applicationPhysique.types";
import { formatEnonceApplicationPhysique, segmentsConsigneConfiguration } from "../ui/formatApplicationPhysique";
import { RenduFragments } from "./RenduFragments";
import { SchemaApplicationPhysique } from "./SchemaApplicationPhysique";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceApplicationPhysique;
  tentativesUtilisees: number;
  tentativesMax: number;
  onChoisir: (choix: VarianteApplicationPhysique) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

const OPTIONS: { valeur: VarianteApplicationPhysique; libelle: string }[] = [
  { valeur: "angleDroit", libelle: "Angle droit" },
  { valeur: "angleQuelconque", libelle: "Angle quelconque" },
];

/** Première étape, toujours la même : contexte narratif + schéma, affichés ici et persistants sur
 * les 3 écrans suivants (jamais d'écran "énoncé" séparé sans question, même leçon déjà établie
 * ailleurs dans le projet — voir CLAUDE.md). */
export function EtapeModelisationApplicationPhysique({ exercice, tentativesUtilisees, tentativesMax, onChoisir, validation}: Props) {
  const [choix, setChoix] = useState<VarianteApplicationPhysique | null>(null);
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={formatEnonceApplicationPhysique(exercice)}
        blocDonnees={<SchemaApplicationPhysique exercice={exercice} />}
      />

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
      {!validation && (
        <>
        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onChoisir(choix)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
