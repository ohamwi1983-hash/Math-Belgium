import type { ResultatExerciceConstructionParabole } from "../moteur/typesConstructionParabole";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceConstructionParabole;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, revele, aideUtilisee }: { label: string; revele: boolean; aideUtilisee: boolean }) {
  const statut = statutRecap(revele, aideUtilisee ? 1 : 0);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
    </LigneRecap>
  );
}

/**
 * Panneau de bilan — récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`,
 * convention CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par
 * écran. Vérification par COHÉRENCE INTERNE (voir CLAUDE.md), donc AUCUNE valeur de référence fixe
 * à révéler en cas d'échec (contrairement au reste de la plateforme) : le rayon `r` est un choix
 * libre de l'élève, jamais une réponse attendue. Les révélations restent donc qualitatives — même
 * principe que "Construction d'une parabole par foyer et directrice", l'ancien générateur remplacé.
 * L'écran "Tracé final" n'a jamais de bouton Aide (aucun bouton n'y a jamais existé) — toujours
 * `aideUtilisee={false}`, jamais orange.
 */
export function ResultatPanelConstructionParabole({ resultat, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.iterations.reduce((somme, iteration) => somme + iteration.scoreConstruction, 0) + resultat.scoreTrace;
  const maxPoints = (resultat.iterations.length + 1) * 100;

  return (
    <div>
      <h2 className="result-title">Construction de la parabole au compas et à l'équerre</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.iterations.map((iteration, index) => (
        <LigneEcran key={index} label={`Itération ${index + 1} — construction`} revele={iteration.constructionRevele} aideUtilisee={iteration.constructionAideUtilisee} />
      ))}
      <LigneEcran label="Tracé final" revele={resultat.traceRevele} aideUtilisee={false} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.iterations.some((iteration) => iteration.scoreConstruction === 0) && (
        <div className="answer-reveal">
          Sur une itération ratée : le rayon choisi ne respectait pas la contrainte (strictement supérieur à la moitié de la distance entre le foyer et la
          directrice), ou la droite construite n'était pas exactement à cette même distance, du côté du foyer.
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreTrace === 0 && (
        <div className="answer-reveal">Les 6 points doivent être sélectionnés dans l'ordre, du côté gauche vers le côté droit.</div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
