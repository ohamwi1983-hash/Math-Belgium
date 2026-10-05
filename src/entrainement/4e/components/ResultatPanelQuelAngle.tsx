import type { ExerciceQuelAngle } from "../core/quelAngle.types";
import type { ResultatExerciceQuelAngle } from "../moteur/typesQuelAngle";
import { Katex } from "./Katex";
import { formatTermesSolutionsLatex } from "../ui/formatQuelAngle";
import { LigneRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceQuelAngle;
  exercice: ExerciceQuelAngle;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Une seule note (bouton "Aide" unique, pénalité ×0,5 — voir `sessionQuelAngle.ts`) — structure
 * aussi simple que "Loi des sinus"/"Loi des cosinus" sur ce plan ; révélation sur score nul
 * uniquement, même convention que le reste du projet pour un simple bouton Aide standard.
 * Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`, point 10 de l'audit chapitre 3) —
 * une seule `LigneRecap` (orange si `aideUtilisee`, jamais de score fractionnaire `X/100`). */
export function ResultatPanelQuelAngle({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const reveler = afficherReponseApresEchec && resultat.score === 0;
  const statut = statutRecap(resultat.revele, resultat.aideUtilisee ? 1 : 0);

  return (
    <div>
      <h2 className="result-title">Trouver l'angle connaissant sin, cos ou tan</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneRecap label="Solutions" statut={statut}>
        {libelleStatutRecap(statut)}
      </LigneRecap>
      {reveler && (
        <div className="answer-reveal">
          Réponse attendue :{" "}
          <span className="equation-box-termes">
            {formatTermesSolutionsLatex(exercice).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
