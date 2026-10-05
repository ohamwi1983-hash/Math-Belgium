import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import type { ResultatExerciceTriangleLies } from "../moteur/typesTriangleLies";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceTriangleLies;
  exercice: ExerciceTriangleLies;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function formatNombre(valeur: number): string {
  return Number(valeur.toFixed(2)).toString();
}

function LigneEcran({ label, revele, niveauAide }: { label: string; revele: boolean; niveauAide: number }) {
  const statut = statutRecap(revele, niveauAide);
  return <LigneRecap label={label} statut={statut}>{libelleStatutRecap(statut)}</LigneRecap>;
}

/** Panneau de révélation — 5 scores potentiels, `scoreAngles`/`scoreSoustraction` `null` selon la
 * configuration (écran absent de la séquence — `cotePartage`/`sommetPartage` n'ont pas "angles",
 * `cotePartage`/`anglePartage` n'ont pas "soustraction", voir `typesTriangleLies.ts`). Récapitulatif
 * final uniformisé (`promptuniformisationrecap4e.md`, converti lors de l'audit chapitre 3) — liste
 * plate colorée `LigneRecap`, jamais un score `X/100` par écran. */
export function ResultatPanelTriangleLies({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const optionCorrecte = exercice.optionsInterpretation.find((option) => option.correcte);
  const scores = [resultat.scorePont, resultat.scoreAngles, resultat.scoreSoustraction, resultat.scoreCible, resultat.scoreInterpretation].filter(
    (score): score is number => score !== null,
  );
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Triangles liés</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran label="Triangle pont" revele={resultat.pontRevele} niveauAide={resultat.niveauAidePont} />
      {resultat.scoreAngles !== null && <LigneEcran label="Angles du triangle cible" revele={resultat.anglesRevele} niveauAide={resultat.niveauAideAngles} />}
      {resultat.scoreSoustraction !== null && (
        <LigneEcran label="Côtés du triangle cible (soustraction)" revele={resultat.soustractionRevele} niveauAide={resultat.niveauAideSoustraction} />
      )}
      <LigneEcran label="Triangle cible" revele={resultat.cibleRevele} niveauAide={resultat.niveauAideCible} />
      <LigneEcran label="Interprétation" revele={resultat.interpretationRevele} niveauAide={resultat.niveauAideInterpretation} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scorePont === 0 && exercice.variante === "sommetPartage" && (
        <div className="answer-reveal">
          Angle attendu : {formatNombre(exercice.trianglePont.A)}° — côté 1 attendu : {formatNombre(exercice.trianglePont.b)} — côté 2 attendu : {formatNombre(exercice.trianglePont.c)}
        </div>
      )}
      {afficherReponseApresEchec && resultat.scorePont === 0 && exercice.variante !== "sommetPartage" && (
        <div className="answer-reveal">
          {exercice.labelCoteTransfere} attendu : {formatNombre(exercice.trianglePont.a)} m
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreAngles === 0 && (
        <div className="answer-reveal">
          Angles attendus : angle utile = {formatNombre(exercice.triangleCible.B)}° — angle (hypothèse) = {formatNombre(exercice.triangleCible.C)}°
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreSoustraction === 0 && (
        <div className="answer-reveal">
          Côtés attendus : côté 1 = {formatNombre(exercice.triangleCible.b)} — côté 2 = {formatNombre(exercice.triangleCible.c)}
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreCible === 0 && (
        <div className="answer-reveal">
          Réponse attendue : {formatNombre(exercice.valeurCibleAttendue)} {exercice.uniteGrandeurCible}
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreInterpretation === 0 && optionCorrecte && (
        <div className="answer-reveal">Interprétation attendue : {optionCorrecte.texte}</div>
      )}

      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
