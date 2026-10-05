import type { ResultatExerciceOmbreSoleil } from "../moteur/typesOmbreSoleil";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceOmbreSoleil;
  labelBouton: string;
  onContinuer: () => void;
}

/**
 * Panneau de résultat — nombre de scores VARIABLE d'un exercice à l'autre (1 pour la variante
 * "simple", jusqu'à 5 pour "obstacle"/"directionInconnue" selon le nombre de piquets tirés, voir
 * `typesOmbreSoleil.ts`). Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/
 * `TotalPointsRecap`, convention CLAUDE.md "Récapitulatif final") — `revelees`/`niveauxAide` sont
 * parallèles à `scores`, capturés à la clôture de chaque écran (jamais dérivés du score seul).
 * Aucune révélation de "réponse attendue" : la direction de lumière n'est jamais montrée sous forme
 * numérique (spec), et le flux avance toujours vers l'écran de conclusion (le vrai point d'ombre)
 * quelle que soit la réponse de l'élève — rien à révéler après coup qui ne soit déjà visible sur le
 * croquis final, même principe que "Section plane d'un solide".
 */
export function ResultatPanelOmbreSoleil({ resultat, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = resultat.scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Ombre au soleil</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scores.map((_, index) => {
        const statut = statutRecap(resultat.revelees[index], resultat.niveauxAide[index]);
        return (
          <LigneRecap key={index} label={`Étape ${index + 1}`} statut={statut}>
            {libelleStatutRecap(statut)}
          </LigneRecap>
        );
      })}
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
