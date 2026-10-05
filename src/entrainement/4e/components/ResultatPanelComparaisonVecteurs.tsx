import type { ExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import type { ResultatExerciceComparaisonVecteurs } from "../moteur/typesComparaisonVecteurs";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceComparaisonVecteurs;
  exercice: ExerciceComparaisonVecteurs;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Coefficient jamais explicite s'il vaut `1`/`-1` — même convention que le reste de la
 * plateforme (ex. `formatRelationVectorielle.ts::formatCoefficientTraduction`). */
function formatCoefficientLatex(coef: number): string {
  if (coef === 1) return "";
  if (coef === -1) return "-";
  return String(coef);
}

function formatVecteursAttendusLatex(labels: string[]): string {
  return labels.map((label) => `\\vec{${label}}`).join(", ");
}

function formatEgaliteAttendueLatex(exercice: ExerciceComparaisonVecteurs): string {
  return `\\vec{${exercice.cibleEgalite}} = ${formatCoefficientLatex(exercice.coefficientEgalite)}\\vec{${exercice.labelReference}}`;
}

function LigneEcran({ label, revele }: { label: string; revele: boolean }) {
  const statut = statutRecap(revele, null);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
    </LigneRecap>
  );
}

/**
 * Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100`. Aucun système
 * d'aide sur ce générateur (`niveauAide=null` pour les 2 écrans — jamais orange, uniquement
 * vert/rouge).
 */
export function ResultatPanelComparaisonVecteurs({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  return (
    <div>
      <h2 className="result-title">Comparaison visuelle de vecteurs</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran label="Sélection" revele={resultat.selectionRevele} />
      <LigneEcran label="Égalité" revele={resultat.egaliteRevele} />
      <TotalPointsRecap points={resultat.scoreSelection + resultat.scoreEgalite} maxPoints={200} />
      {afficherReponseApresEchec && resultat.scoreSelection === 0 && (
        <div className="answer-reveal">
          Vecteurs attendus : <Katex expression={formatVecteursAttendusLatex(exercice.labelsCorrects)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreEgalite === 0 && (
        <div className="answer-reveal">
          Égalité attendue : <Katex expression={formatEgaliteAttendueLatex(exercice)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
