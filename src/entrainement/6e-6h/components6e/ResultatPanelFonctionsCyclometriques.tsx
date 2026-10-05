import type { ResultatExerciceFonctionsCyclometriques } from "../moteur6e/typesFonctionsCyclometriques";
import { Katex } from "../components/Katex";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceFonctionsCyclometriques;
  /** Niveau d'aide RÉELLEMENT utilisé sur l'unique écran — capturé côté présentation (voir
   * `App6gen2.tsx`), la Couche B ne le persiste pas (seul le score/`revele` le sont). */
  niveauAide: number;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — `6gen2` (REFONTE TOTALE) n'a plus qu'UN SEUL écran par exercice
 * (contrairement à l'ancienne variante "composite" à 2 écrans notés séparément) : une seule
 * `LigneRecap`, jamais un score fractionnaire `X/100`. Le contenu affiché est la réponse
 * RÉELLEMENT attendue (Existe/valeur, ou "N'existe pas"), jamais recalculée depuis la saisie brute
 * de l'élève.
 */
export function ResultatPanelFonctionsCyclometriques({ resultat, niveauAide, onContinuer, dernier }: Props) {
  const { exercice, score, revele } = resultat;
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <LigneRecap label="Réponse attendue" statut={statutRecap(revele, niveauAide)}>
        {exercice.existe ? <Katex expression={exercice.valeurLatex as string} /> : "N'existe pas"}
      </LigneRecap>
      <p className="recap-final-total">Total : {Math.round(score)}/100</p>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
