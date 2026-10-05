import type { ExerciceIntersectionDroites } from "../core/intersectionDroites.types";
import type { ResultatExerciceIntersectionDroites } from "../moteur/typesIntersectionDroites";
import { texteConclusionAttendue, texteReponsePointAttendue } from "../ui/formatIntersectionDroites";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceIntersectionDroites;
  exercice: ExerciceIntersectionDroites;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, revele, niveauAide }: { label: string; revele: boolean; niveauAide: number }) {
  const statut = statutRecap(revele, niveauAide);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
    </LigneRecap>
  );
}

/** Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`) — même patron que les
 * générateurs déjà convertis (ex. gen7/gen8/gen9/gen55/gen57) : liste `LigneRecap` à plat + un
 * résumé chiffré `TotalPointsRecap` en complément, jamais un score fractionnaire par ligne. Ce
 * fichier était resté à l'ancien format `score-list`/`X/100` — régression relevée par un audit
 * d'ergonomie (`promptcorrectionciblestactilesgen48.md`, point 3), corrigée ici. Ligne "Point"
 * conditionnelle sur `!== null` — jamais affichée pour un exercice non sécant, où cet écran n'a
 * jamais eu lieu. */
export function ResultatPanelIntersectionDroites({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [resultat.scoreDiagnostic, resultat.scorePoint].filter((score): score is number => score !== null);
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Intersection entre deux droites</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran label="Diagnostic" revele={resultat.diagnosticRevele} niveauAide={resultat.niveauAideDiagnostic} />
      {resultat.scorePoint !== null && <LigneEcran label="Point d'intersection" revele={resultat.pointRevele} niveauAide={resultat.niveauAidePoint} />}
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreDiagnostic === 0 && <div className="answer-reveal">{texteConclusionAttendue(exercice)}</div>}
      {afficherReponseApresEchec && resultat.scorePoint === 0 && (
        <div className="answer-reveal">Réponse attendue : {texteReponsePointAttendue(exercice)}.</div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
