import { useState } from "react";
import type { ExerciceNiveau2ValeurAbsolue, ReponseResolutionBranches } from "../core/caracteristiquesAlgebriques.types";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import {
  formatBranchesAvecConditionsLatex,
  formatConditionNegeeTexte,
  formatConditionTexte,
  formatEquationRechercheZerosLatex,
} from "../ui/formatCaracteristiquesAlgebriques";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceNiveau2ValeurAbsolue;
  etatActuel: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseResolutionBranches) => void;
}

/**
 * Étape "résolution des branches" (niveau 2, `valeur_absolue` uniquement) — après "condition de
 * validité", avant "validation d'une solution" (une fois par branche, voir
 * `EtapeValidationSolution.tsx`). Les deux équations de branche, chacune avec sa condition de signe
 * rappelée explicitement à côté (`formatBranchesAvecConditionsLatex`, spec section `valeur_absolue`,
 * point 2) — deux champs numériques (fraction-compatibles, `parserNombreOuFraction`), soumis
 * ensemble en une seule tentative (même principe "tout ou rien" que `EtapeSeparation`).
 *
 * Terminologie "conditions" plutôt que "branches" (`prompt-corrections-niveau2-vague3.md`, point 3)
 * : la consigne et les labels de champ citent désormais la condition RÉELLE de l'exercice
 * (`formatConditionTexte`/`formatConditionNegeeTexte`, texte brut — jamais un `<label>` HTML
 * ordinaire ne peut rendre du KaTeX), jamais "branche 1"/"branche 2", un texte générique qui ne
 * disait rien de la condition effectivement en jeu.
 */
export function EtapeResolutionBranches({ exercice, etatActuel, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [racine1, setRacine1] = useState("");
  const [racine2, setRacine2] = useState("");
  const v1 = parserNombreOuFraction(racine1);
  const v2 = parserNombreOuFraction(racine2);
  const complet = v1 !== null && v2 !== null;
  const erronee = tentativesUtilisees > 0;
  const condition1 = formatConditionTexte(exercice.conditionValidite);
  const condition2 = formatConditionNegeeTexte(exercice.conditionValidite);

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationRechercheZerosLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={etatActuel} />
      <p className="prompt-text">Résous chacune des deux conditions ci-dessous (arrondi au centième accepté si besoin).</p>
      <div className="equation-box">
        <Katex
          expression={formatBranchesAvecConditionsLatex(exercice.a, exercice.b, exercice.c, exercice.d, exercice.conditionValidite)}
          block
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="racine-branche-1">
          Racine ({condition1})
        </label>
        <input
          id="racine-branche-1"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          value={racine1}
          onChange={(e) => setRacine1(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="racine-branche-2">
          Racine ({condition2})
        </label>
        <input
          id="racine-branche-2"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          value={racine2}
          onChange={(e) => setRacine2(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => complet && onValider({ racineBranche1: v1, racineBranche2: v2 })}
      >
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
