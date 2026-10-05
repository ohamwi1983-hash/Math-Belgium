import type { ExerciceTransformationGraphique } from "../core/transformationsGraphiques.types";
import type { ResultatExerciceTransformationGraphique } from "../moteur/typesTransformationsGraphiques";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { formatEquationTransformationLatex } from "../ui/formatTransformationsGraphiques";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceTransformationGraphique;
  exercice: ExerciceTransformationGraphique;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`) — mécanisme de points déjà
 * calculé par le moteur réutilisé tel quel (`×0,5` si aide utilisée AVANT la clôture de la note
 * concernée, `equationAideUtilisee`/`curseursAideUtilisee`, jamais un flag partagé rétroactif). */
export function ResultatPanelTransformationsGraphiques({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const uneEtapeRevelee = resultat.equationRevele || resultat.curseursRevele;
  const statutEquation = statutRecap(resultat.equationRevele, resultat.equationAideUtilisee ? 1 : 0);
  const statutCurseurs = statutRecap(resultat.curseursRevele, resultat.curseursAideUtilisee ? 1 : 0);
  const totalPoints = resultat.scoreEquation + resultat.scoreCurseurs;

  return (
    <div>
      <h2 className="result-title">Transformations graphiques d'une parabole</h2>
      <p className="result-subtitle">
        {uneEtapeRevelee ? "Au moins une note a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      <LigneRecap label="Équation" statut={statutEquation}>
        {libelleStatutRecap(statutEquation)}
      </LigneRecap>
      <LigneRecap label="Curseurs" statut={statutCurseurs}>
        {libelleStatutRecap(statutCurseurs)}
      </LigneRecap>
      <TotalPointsRecap points={totalPoints} maxPoints={200} />
      {afficherReponseApresEchec && resultat.scoreEquation === 0 && (
        <div className="answer-reveal">
          Fonction attendue : <Katex expression={formatEquationTransformationLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreCurseurs === 0 && (
        <p className="answer-reveal">
          Curseurs attendus : TH = {exercice.p} ; TV = {exercice.q} ; EV = {exercice.ev} ; CV = {exercice.cv} ; SOX ={" "}
          {exercice.sox ? "Oui" : "Non"}
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
