import type { ExerciceFormeCanoniqueTransformation } from "../core/formeCanoniqueTransformations.types";
import type { ResultatExerciceFormeCanoniqueTransformation } from "../moteur/typesFormeCanoniqueTransformations";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceFormeCanoniqueTransformation;
  exercice: ExerciceFormeCanoniqueTransformation;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`) — aucun bouton "Aide" dans ce
 * générateur (jamais d'orange, seulement vert/rouge), points déjà calculés par le moteur réutilisés
 * tels quels. */
export function ResultatPanelFormeCanoniqueTransformations({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const uneEtapeRevelee = resultat.canoniqueRevele || resultat.thRevele || resultat.evCvSoxRevele || resultat.tvRevele;
  const statutCanonique = statutRecap(resultat.canoniqueRevele, null);
  const statutTh = statutRecap(resultat.thRevele, null);
  const statutEvCvSox = statutRecap(resultat.evCvSoxRevele, null);
  const statutTv = statutRecap(resultat.tvRevele, null);
  const totalPoints = resultat.scoreCanonique + resultat.scoreTh + resultat.scoreEvCvSox + resultat.scoreTv;

  return (
    <div>
      <h2 className="result-title">Forme canonique et transformations — second degré</h2>
      <p className="result-subtitle">
        {uneEtapeRevelee ? "Au moins une étape a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      <LigneRecap label="Forme canonique" statut={statutCanonique}>
        {libelleStatutRecap(statutCanonique)}
      </LigneRecap>
      <LigneRecap label="Translation horizontale" statut={statutTh}>
        {libelleStatutRecap(statutTh)}
      </LigneRecap>
      <LigneRecap label="Étirement / compression / symétrie" statut={statutEvCvSox}>
        {libelleStatutRecap(statutEvCvSox)}
      </LigneRecap>
      <LigneRecap label="Translation verticale" statut={statutTv}>
        {libelleStatutRecap(statutTv)}
      </LigneRecap>
      <TotalPointsRecap points={totalPoints} maxPoints={400} />
      {afficherReponseApresEchec && resultat.scoreCanonique === 0 && (
        <p className="answer-reveal">
          Sommet attendu :{" "}
          <span className="equation-box-termes">
            <Katex expression={`x_S = ${exercice.xS}`} />
            <Katex expression={`y_S = ${exercice.yS}`} />
          </span>
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreTh === 0 && <p className="answer-reveal">TH attendu : {exercice.xS}</p>}
      {afficherReponseApresEchec && resultat.scoreEvCvSox === 0 && (
        <p className="answer-reveal">
          EV = {exercice.ev} ; CV = {exercice.cv} ; SOX = {exercice.sox ? "Oui" : "Non"}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreTv === 0 && <p className="answer-reveal">TV attendu : {exercice.yS}</p>}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
