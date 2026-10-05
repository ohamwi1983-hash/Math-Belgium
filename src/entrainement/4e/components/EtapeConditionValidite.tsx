import { useState } from "react";
import type { ExerciceNiveau2RacineCarree, ExerciceNiveau2ValeurAbsolue, ReponseCondition } from "../core/caracteristiquesAlgebriques.types";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import type { SymboleConditionSimple } from "../ui/conditionValiditeSimple";
import { construireConditionValiditeSimple, formatApercuConditionValiditeSimple } from "../ui/conditionValiditeSimple";
import {
  TRANSITION_CONDITION_VALIDITE,
  expressionConditionValiditeLatex,
  formatEquationNiveau1Latex,
} from "../ui/formatCaracteristiquesAlgebriques";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceNiveau2RacineCarree | ExerciceNiveau2ValeurAbsolue;
  etatActuel: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseCondition) => void;
}

const SYMBOLES: SymboleConditionSimple[] = ["≥", "≤"];

/**
 * Étape "condition de validité de l'équation" (niveau 2, `racine_carree`/`valeur_absolue`
 * uniquement, `prompt-niveau2caracteristiquesalgebriques.md`, section UX) — insérée après
 * "isolement" (voir `phaseApresIsolement`, `sessionCaracteristiquesAlgebriques.ts`). Nom
 * délibérément distinct de "Conditions d'existence" (CE) — jamais le même titre, pour ne jamais
 * laisser croire à l'élève qu'il s'agit à nouveau du domaine de `f`, déjà établi plus haut ;
 * `TRANSITION_CONDITION_VALIDITE` rend cette distinction explicite en tête d'écran. La consigne
 * cite l'expression RÉELLEMENT concernée — le membre de droite de l'équation isolée pour
 * `racine_carree`, le contenu à l'intérieur de la valeur absolue pour `valeur_absolue`
 * (`expressionConditionValiditeLatex`) — jamais une notation générique de conception ("P1(x)",
 * "-k(x)", `prompt-corrections-niveau2-tests.md`, point 2). Composée en JSX (texte brut + court
 * fragment `<Katex>` inline), jamais un unique bloc `\text{...}` monolithique — même piège déjà
 * rencontré et corrigé pour `EtapeValidationSolution.tsx`.
 *
 * Widget SIMPLIFIÉ (`prompt-corrections-niveau2-vague3.md`, point 1) — la condition est TOUJOURS
 * structurellement une demi-droite fermée (`x ≥ v` ou `x ≤ v`, jamais `ℝ`/`∅`/une union), le
 * composant complet de construction d'intervalle (réutilisé ailleurs pour le domaine de `f`, voir
 * `EtapeDomaineNiveau1.tsx` — **jamais touché** par cette simplification) était donc surdimensionné
 * ici. Remplacé par un sélecteur `≥`/`≤` + un champ libre (fraction-compatible,
 * `parserNombreOuFraction`) + un aperçu en temps réel (`formatApercuConditionValiditeSimple`) —
 * `ReponseCondition`/`verifierConditionValidite` restent inchangés, seule la mécanique de saisie
 * change (`construireConditionValiditeSimple` produit exactement le même `Morceau` demi-droite
 * qu'avant).
 */
export function EtapeConditionValidite({ exercice, etatActuel, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [symbole, setSymbole] = useState<SymboleConditionSimple | null>(null);
  const [valeurTexte, setValeurTexte] = useState("");

  const valeur = parserNombreOuFraction(valeurTexte);
  const intervalle = construireConditionValiditeSimple(symbole, valeur);
  const reponse: ReponseCondition | null = intervalle === null ? null : { forme: "intervalle", intervalle };
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationNiveau1Latex(exercice)} block />
      </div>
      <EtatActuelPanel latex={etatActuel} />
      <p className="prompt-text">{TRANSITION_CONDITION_VALIDITE}</p>
      <p className="prompt-text">
        Établis la condition pour que <Katex expression={expressionConditionValiditeLatex(exercice)} /> ≥ 0.
      </p>
      <div className="options-grid">
        {SYMBOLES.map((s) => (
          <button key={s} type="button" className={symbole === s ? "btn toggle-active" : "btn"} onClick={() => setSymbole(s)}>
            x {s}
          </button>
        ))}
      </div>
      <div className="field field-inline">
        <input
          className={`text-input${erronee ? " is-erronee" : ""}`}
          value={valeurTexte}
          onChange={(e) => setValeurTexte(e.target.value)}
          placeholder="valeur, ex : -1/3"
          aria-label="Valeur seuil de la condition"
        />
      </div>
      <p className="prompt-text">
        <Katex expression={formatApercuConditionValiditeSimple(symbole, valeur)} />
      </p>

      <button
        type="button"
        className="btn btn-primary"
        disabled={reponse === null}
        onClick={() => reponse !== null && onValider(reponse)}
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
