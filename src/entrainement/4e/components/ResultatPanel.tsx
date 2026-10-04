import type { Exercice } from "../core/generateur.types";
import type { ResultatExercice } from "../moteur";
import { libelleCategorie } from "../ui/categorieLabels";
import { estSolutionUnique, formatTermesZerosAttendusLatex } from "../ui/formatEquation";
import { formatScore } from "../ui/formatScore";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExercice;
  exercice: Exercice;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function classeScore(score: number): string {
  return score === 100 ? "score-value is-good" : "score-value is-bad";
}

export function ResultatPanel({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  return (
    <div>
      <h2 className="result-title">{libelleCategorie(resultat.categorie)}</h2>
      <p className="result-subtitle">
        {resultat.categorieRevelee ? "La méthode a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      <ul className="score-list">
        {resultat.scoreSimplification !== null && (
          <li className="score-item">
            <span>Simplification</span>
            <span className={classeScore(resultat.scoreSimplification)}>{formatScore(resultat.scoreSimplification)}/100</span>
          </li>
        )}
        {resultat.scoreIsolement !== null && (
          <li className="score-item">
            <span>Isolement</span>
            <span className={classeScore(resultat.scoreIsolement)}>{formatScore(resultat.scoreIsolement)}/100</span>
          </li>
        )}
        {resultat.scoreDevelopper !== null && (
          <li className="score-item">
            <span>Développement</span>
            <span className={classeScore(resultat.scoreDevelopper)}>{formatScore(resultat.scoreDevelopper)}/100</span>
          </li>
        )}
        {resultat.scoreReconnaissance !== null && (
          <li className="score-item">
            <span>Reconnaissance</span>
            <span className={classeScore(resultat.scoreReconnaissance)}>{formatScore(resultat.scoreReconnaissance)}/100</span>
          </li>
        )}
        <li className="score-item">
          <span>Champ principal</span>
          <span className={classeScore(resultat.scoreChampPrincipal)}>{formatScore(resultat.scoreChampPrincipal)}/100</span>
        </li>
        <li className="score-item">
          <span>Solutions</span>
          <span className={classeScore(resultat.scoreZeros)}>{formatScore(resultat.scoreZeros)}/100</span>
        </li>
      </ul>
      {afficherReponseApresEchec && resultat.scoreChampPrincipal === 0 && (
        <p className="answer-reveal">
          Réponse attendue :{" "}
          <Katex
            expression={exercice.categorie === "cas_general" ? `\\Delta = ${exercice.solution.delta}` : `${exercice.solution.formeFactorisee} = 0`}
          />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreZeros === 0 && (
        <p className="answer-reveal">
          {estSolutionUnique(exercice) ? "Solution attendue" : "Solutions attendues"} :{" "}
          <span className="equation-box-termes">
            {formatTermesZerosAttendusLatex(exercice).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
