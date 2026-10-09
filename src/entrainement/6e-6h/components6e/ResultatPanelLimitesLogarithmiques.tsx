import { Katex } from "../components/Katex";
import type { ResultatExerciceLimiteLogarithmique } from "../moteur6e/typesLimitesLogarithmiques";
import { formatCategorieLabel, formatCibleTexte, totalPointsLimiteLogarithmique } from "../ui6e/formatLimitesLogarithmiques";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceLimiteLogarithmique;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — liste à plat, une `LigneRecap` PAR ÉCRAN RÉELLEMENT TRAVERSÉ de
 * l'exercice, colorée selon `statutRecap(details[phase].revele, details[phase].niveauAide)` — même
 * patron que `ResultatPanelLimiteExponentielle.tsx` (6gen6). Les écrans "reformuler"/"exposant"/
 * "développer"/"simplifier" n'ont pas de cible unique canonique (équivalence NUMÉRIQUE, jamais une
 * chaîne de référence figée) — leur ligne affiche donc ce qui a été vérifié plutôt qu'une
 * expression, contrairement aux écrans à cible catégorielle/numérique fixe.
 */
export function ResultatPanelLimitesLogarithmiques({ resultat, onContinuer, dernier }: Props) {
  const d = resultat.details;
  const exercice = resultat.exercice;
  const total = totalPointsLimiteLogarithmique(resultat);

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {resultat.famille === "A" && exercice.famille === "A" && (
        <>
          <LigneRecap label="Dominance" statut={statutRecap(d.aDominance?.revele ?? false, d.aDominance?.niveauAide ?? null)}>
            Numérateur : {formatCategorieLabel(exercice.dominanceNumerateur)} — Dénominateur : {formatCategorieLabel(exercice.dominanceDenominateur)}
          </LigneRecap>
          <LigneRecap label="Limite globale" statut={statutRecap(d.aConclure?.revele ?? false, d.aConclure?.niveauAide ?? null)}>
            <Katex expression={formatCibleTexte(exercice.limiteGlobale)} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "B" && exercice.famille === "B" && (
        <>
          <LigneRecap label="Reformulation" statut={statutRecap(d.bReformuler?.revele ?? false, d.bReformuler?.niveauAide ?? null)}>
            Forme reformulée en u=x/x0−1, faisant apparaître la limite de référence, équivalente à f(x).
          </LigneRecap>
          <LigneRecap label="Conclusion" statut={statutRecap(d.bConclure?.revele ?? false, d.bConclure?.niveauAide ?? null)}>
            <Katex expression={String(exercice.limiteFinale)} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "C" && exercice.famille === "C" && (
        <>
          <LigneRecap label="Diagnostic" statut={statutRecap(d.cDiagnostic?.revele ?? false, d.cDiagnostic?.niveauAide ?? null)}>
            Numérateur et dénominateur (ou chaque facteur) évalués séparément, avant toute conclusion.
          </LigneRecap>
          <LigneRecap label="Limite finale" statut={statutRecap(d.cConclure?.revele ?? false, d.cConclure?.niveauAide ?? null)}>
            <Katex expression={formatCibleTexte(exercice.limiteFinale)} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "D" && exercice.famille === "D" && (
        <>
          <LigneRecap label="Exposant isolé" statut={statutRecap(d.dExposant?.revele ?? false, d.dExposant?.niveauAide ?? null)}>
            f^g réécrit e^(g·ln f), exposant g·ln(f) isolé, équivalent à la forme attendue.
          </LigneRecap>
          <LigneRecap label="Limite de l'exposant" statut={statutRecap(d.dLimiteExposant?.revele ?? false, d.dLimiteExposant?.niveauAide ?? null)}>
            <Katex expression={String(exercice.limiteExposant)} />
          </LigneRecap>
          <LigneRecap label="Conclusion" statut={statutRecap(d.dConclure?.revele ?? false, d.dConclure?.niveauAide ?? null)}>
            <Katex expression={`e^{${exercice.limiteExposant}}`} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "E" && exercice.famille === "E" && (
        <>
          <LigneRecap label="Numérateur développé (ordre 2)" statut={statutRecap(d.eDevelopper?.revele ?? false, d.eDevelopper?.niveauAide ?? null)}>
            <Katex expression="x^2\left(\ln 3+\frac12\right)" />
          </LigneRecap>
          <LigneRecap label="Rapport simplifié" statut={statutRecap(d.eSimplifier?.revele ?? false, d.eSimplifier?.niveauAide ?? null)}>
            <Katex expression="\frac{\ln 3+\frac12}{4}" />
          </LigneRecap>
          <LigneRecap label="Conclusion" statut={statutRecap(d.eConclure?.revele ?? false, d.eConclure?.niveauAide ?? null)}>
            <Katex expression="\frac{2\ln 3+1}{8}" />
          </LigneRecap>
        </>
      )}
      <div className="recap-final-total">
        Total : {Math.round(total.points)}/{total.maximum}
      </div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
