import { useState } from "react";
import type { ExerciceNiveau2RacineCarree, ExerciceNiveau2ValeurAbsolue } from "../core/caracteristiquesAlgebriques.types";
import { racinesAValiderRacineCarree } from "../moteur/verificationCaracteristiquesAlgebriques";
import {
  formatConditionLatex,
  formatConditionNegeeLatex,
  formatEquationRechercheZerosLatex,
  formatFractionLatex,
  formatValeurExacteLatex,
} from "../ui/formatCaracteristiquesAlgebriques";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceNiveau2RacineCarree | ExerciceNiveau2ValeurAbsolue;
  etatActuel: string | null;
  index: number;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: boolean) => void;
}

/** La racine/branche concernée par la question, à l'index courant — `racine_carree` : une des
 * racines distinctes de l'équation du 2nd degré déjà confirmée ; `valeur_absolue` : la racine de la
 * branche 0 ou 1 (`racineBranche1`/`racineBranche2`, déjà confirmées à l'étape "résolution des
 * branches"). Retourne aussi la condition APPLICABLE à cette solution précise — la condition de
 * validité elle-même pour `racine_carree` (une seule condition, quelle que soit la racine) ou pour
 * la branche 0 de `valeur_absolue` ; sa NÉGATION pour la branche 1 (`P1<0`). */
function solutionEtCondition(exercice: ExerciceNiveau2RacineCarree | ExerciceNiveau2ValeurAbsolue, index: number): { racineLatex: string; conditionLatex: string } {
  if (exercice.famille === "racine_carree") {
    const racine = racinesAValiderRacineCarree(exercice)[index];
    return { racineLatex: formatValeurExacteLatex(racine), conditionLatex: formatConditionLatex(exercice.conditionValidite) };
  }
  const racine = index === 0 ? exercice.racineBranche1 : exercice.racineBranche2;
  const conditionLatex = index === 0 ? formatConditionLatex(exercice.conditionValidite) : formatConditionNegeeLatex(exercice.conditionValidite);
  return { racineLatex: formatFractionLatex(racine), conditionLatex };
}

/**
 * Étape "validation d'une solution" (niveau 2, `racine_carree`/`valeur_absolue`, section UX du
 * prompt) — répétée une fois par solution/branche restante (`nombreSolutionsAValider`,
 * `sessionCaracteristiquesAlgebriques.ts`). Réutilise le patron QCM Oui/Non déjà en place ailleurs
 * dans le projet (ex. "Il y a une ordonnée"/"Pas d'ordonnée") ; la condition est toujours rappelée
 * en toutes lettres, jamais implicite — prose HTML normale (`wrap` naturel sur mobile) avec la
 * condition elle-même comme un COURT fragment `<Katex>` inline, jamais la phrase entière passée à
 * `<Katex>` (piège rencontré et corrigé : `\text{...}` rend un bloc KaTeX insécable d'un seul tenant,
 * qui ne peut jamais se couper à la largeur de l'écran — débordement horizontal confirmé en
 * navigateur avant correctif, même principe que `formatFractionSigneeLatex`/`ResultatPanel.tsx`, qui
 * mélangent déjà texte brut et fragment `<Katex>` séparé plutôt qu'un unique appel monolithique).
 */
export function EtapeValidationSolution({ exercice, etatActuel, index, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const { racineLatex, conditionLatex } = solutionEtCondition(exercice, index);
  const [choix, setChoix] = useState<boolean | null>(null);
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationRechercheZerosLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={etatActuel} />
      <div className="equation-box">
        <Katex expression={`x = ${racineLatex}`} block />
      </div>
      <p className="prompt-text">
        La solution trouvée respecte-t-elle la condition <Katex expression={conditionLatex} /> ?
      </p>
      <div className="options-grid">
        <button
          type="button"
          className={`btn${choix === true ? " toggle-active" : ""}${erronee && choix === true ? " is-erronee" : ""}`}
          onClick={() => setChoix(true)}
        >
          Oui
        </button>
        <button
          type="button"
          className={`btn${choix === false ? " toggle-active" : ""}${erronee && choix === false ? " is-erronee" : ""}`}
          onClick={() => setChoix(false)}
        >
          Non
        </button>
      </div>
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
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
