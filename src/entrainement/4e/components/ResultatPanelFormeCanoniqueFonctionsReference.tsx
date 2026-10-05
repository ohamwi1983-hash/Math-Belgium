import type { ExerciceFormeCanoniqueFonctionReference } from "../core/formeCanoniqueFonctionsReference.types";
import type { ResultatExerciceFormeCanoniqueFonctionReference } from "../moteur/typesFormeCanoniqueFonctionsReference";
import { cibleFinale } from "../moteur/verificationFormeCanoniqueFonctionsReference";
import {
  formatCibleLatex,
  formatGabaritEtape2Latex,
  formatGabaritEtape3Latex,
  formatGabaritEtape4Latex,
  formatGabaritLatex,
} from "../ui/formatFormeCanoniqueFonctionsReference";
import { libelleFamille } from "../ui/famillesReferenceLabels";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceFormeCanoniqueFonctionReference;
  exercice: ExerciceFormeCanoniqueFonctionReference;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`, appliqué ici — jusque-là
 * resté au format `score-list`/`X/100`, hors du périmètre explicite de ce prompt) — même patron
 * que `ResultatPanelFormeCanoniqueTransformations.tsx` (chapitre 1) : aucun bouton "Aide" dans ce
 * générateur (jamais d'orange, seulement vert/rouge), points déjà calculés par le moteur réutilisés
 * tels quels. */
export function ResultatPanelFormeCanoniqueFonctionsReference({
  resultat,
  exercice,
  afficherReponseApresEchec,
  labelBouton,
  onContinuer,
}: Props) {
  const uneEtapeRevelee =
    resultat.reconnaissanceRevele ||
    resultat.canoniqueRevele ||
    resultat.ehChSoyRevele ||
    resultat.thRevele ||
    resultat.evCvSoxRevele ||
    resultat.tvRevele;
  const statutReconnaissance = statutRecap(resultat.reconnaissanceRevele, null);
  const statutCanonique = statutRecap(resultat.canoniqueRevele, null);
  const statutEhChSoy = statutRecap(resultat.ehChSoyRevele, null);
  const statutTh = statutRecap(resultat.thRevele, null);
  const statutEvCvSox = statutRecap(resultat.evCvSoxRevele, null);
  const statutTv = statutRecap(resultat.tvRevele, null);
  const totalPoints =
    resultat.scoreReconnaissance +
    resultat.scoreCanonique +
    resultat.scoreEhChSoy +
    resultat.scoreTh +
    resultat.scoreEvCvSox +
    resultat.scoreTv;

  return (
    <div>
      <h2 className="result-title">Forme canonique et transformations — fonctions de référence</h2>
      <p className="result-subtitle">
        {uneEtapeRevelee ? "Au moins une étape a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      <LigneRecap label="Famille" statut={statutReconnaissance}>
        {libelleStatutRecap(statutReconnaissance)}
      </LigneRecap>
      <LigneRecap label="Forme canonique" statut={statutCanonique}>
        {libelleStatutRecap(statutCanonique)}
      </LigneRecap>
      <LigneRecap label="Étirement / compression / symétrie horizontale" statut={statutEhChSoy}>
        {libelleStatutRecap(statutEhChSoy)}
      </LigneRecap>
      <LigneRecap label="Translation horizontale" statut={statutTh}>
        {libelleStatutRecap(statutTh)}
      </LigneRecap>
      <LigneRecap label="Étirement / compression / symétrie verticale" statut={statutEvCvSox}>
        {libelleStatutRecap(statutEvCvSox)}
      </LigneRecap>
      <LigneRecap label="Translation verticale" statut={statutTv}>
        {libelleStatutRecap(statutTv)}
      </LigneRecap>
      <TotalPointsRecap points={totalPoints} maxPoints={600} />
      {afficherReponseApresEchec && resultat.scoreReconnaissance === 0 && (
        <p className="answer-reveal">Famille attendue : {libelleFamille(exercice.famille)}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreCanonique === 0 && (
        <p className="answer-reveal">
          Fonction attendue : <Katex expression={formatCibleLatex(exercice.famille, cibleFinale(exercice))} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreEhChSoy === 0 && (
        <p className="answer-reveal">
          Fonction attendue (étirement / compression / symétrie horizontale) :{" "}
          <Katex expression={formatGabaritEtape2Latex(exercice)} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreTh === 0 && (
        <p className="answer-reveal">
          Fonction attendue (translation horizontale) : <Katex expression={formatGabaritEtape3Latex(exercice)} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreEvCvSox === 0 && (
        <p className="answer-reveal">
          Fonction attendue (étirement / compression / symétrie verticale) :{" "}
          <Katex expression={formatGabaritEtape4Latex(exercice)} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreTv === 0 && (
        <p className="answer-reveal">
          Fonction attendue (translation verticale) : <Katex expression={formatGabaritLatex(exercice)} />
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
