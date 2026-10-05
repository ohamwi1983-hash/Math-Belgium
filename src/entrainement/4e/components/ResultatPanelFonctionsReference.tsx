import type { ExerciceFonctionReference } from "../core/fonctionsReference.types";
import type { ResultatExerciceFonctionReference } from "../moteur/typesFonctionsReference";
import { formatEquationFonctionReferenceLatex } from "../ui/formatFonctionsReference";
import { libelleFamille } from "../ui/famillesReferenceLabels";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceFonctionReference;
  exercice: ExerciceFonctionReference;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`, appliqué ici — jusque-là
 * resté au format `score-list`/`X/100`, hors du périmètre explicite de ce prompt) — même patron
 * que `ResultatPanelTransformationsGraphiques.tsx` (chapitre 1) : "reconnaissance" n'a jamais
 * d'aide (toujours close avant qu'elle ne devienne accessible), "équation"/"curseurs" utilisent
 * chacune leur propre flag `xxxAideUtilisee` figé au moment précis de leur propre clôture. */
export function ResultatPanelFonctionsReference({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const uneEtapeRevelee = resultat.reconnaissanceRevele || resultat.equationRevele || resultat.curseursRevele;
  const statutReconnaissance = statutRecap(resultat.reconnaissanceRevele, null);
  const statutEquation = statutRecap(resultat.equationRevele, resultat.equationAideUtilisee ? 1 : 0);
  const statutCurseurs = statutRecap(resultat.curseursRevele, resultat.curseursAideUtilisee ? 1 : 0);
  const totalPoints = resultat.scoreReconnaissance + resultat.scoreEquation + resultat.scoreCurseurs;

  return (
    <div>
      <h2 className="result-title">Transformations graphiques — fonctions de référence</h2>
      <p className="result-subtitle">
        {uneEtapeRevelee ? "Au moins une note a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      <LigneRecap label="Famille" statut={statutReconnaissance}>
        {libelleStatutRecap(statutReconnaissance)}
      </LigneRecap>
      <LigneRecap label="Équation" statut={statutEquation}>
        {libelleStatutRecap(statutEquation)}
      </LigneRecap>
      <LigneRecap label="Curseurs" statut={statutCurseurs}>
        {libelleStatutRecap(statutCurseurs)}
      </LigneRecap>
      <TotalPointsRecap points={totalPoints} maxPoints={300} />
      {afficherReponseApresEchec && resultat.scoreReconnaissance === 0 && (
        <p className="answer-reveal">Famille attendue : {libelleFamille(exercice.famille)}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreEquation === 0 && (
        <div className="answer-reveal">
          Fonction attendue : <Katex expression={formatEquationFonctionReferenceLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreCurseurs === 0 && (
        <p className="answer-reveal">
          Curseurs attendus : TH = {exercice.th} ; TV = {exercice.tv} ; CH = {exercice.ch} ; EH = {exercice.eh} ; EV = {exercice.ev} ; CV ={" "}
          {exercice.cv} ; SOX = {exercice.sox ? "Oui" : "Non"} ; SOY = {exercice.soy ? "Oui" : "Non"}
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
