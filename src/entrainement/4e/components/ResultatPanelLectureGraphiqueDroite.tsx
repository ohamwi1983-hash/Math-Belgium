import type { ExerciceLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import type { ResultatExerciceLectureGraphiqueDroite } from "../moteur/typesLectureGraphiqueDroite";
import { formatReponseAttendueLatex } from "../ui/formatLectureGraphiqueDroite";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceLectureGraphiqueDroite;
  exercice: ExerciceLectureGraphiqueDroite;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Un seul écran par exercice (comme "Quel angle ?"), une seule note — structure aussi simple que
 * les autres générateurs mono-écran du projet. */
export function ResultatPanelLectureGraphiqueDroite({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const reveler = afficherReponseApresEchec && resultat.score === 0;
  const statut = statutRecap(resultat.revele, resultat.aideUtilisee ? 1 : 0);

  return (
    <div>
      <h2 className="result-title">Lecture graphique — équation d'une droite</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneRecap label="Équation" statut={statut}>
        {libelleStatutRecap(statut)}
      </LigneRecap>
      <TotalPointsRecap points={resultat.score} maxPoints={100} />
      {reveler && (
        <div className="answer-reveal">
          Réponse attendue : <Katex expression={formatReponseAttendueLatex(exercice)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
