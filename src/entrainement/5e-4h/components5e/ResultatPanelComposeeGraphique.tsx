import type { ResultatExerciceComposeeGraphique } from "../moteur5e/typesComposeeGraphique";
import { consigneQuestion } from "../ui5e/formatComposeeGraphique";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceComposeeGraphique;
  /** Niveau d'aide utilisé PAR QUESTION, même index que `resultat.resultatsQuestions` — voir
   * `App5gen4.tsx` pour la capture (`ResultatQuestionComposeeGraphique` ne le porte pas lui-même). */
  niveauAidesQuestions: number[];
  onContinuer: () => void;
  dernier: boolean;
}

function formatResultatAttendu(resultatAttendu: number | null): string {
  return resultatAttendu === null ? "n'existe pas" : String(resultatAttendu);
}

/**
 * Écran récapitulatif final — une LIGNE `LigneRecap` PAR QUESTION (l'unité de résolution de ce
 * générateur, pas un écran nommé unique — voir `moteur5e/typesComposeeGraphique.ts`), colorée selon
 * le statut de CETTE question (jamais un statut global pour tout l'exercice) : verte (correcte sans
 * aide), orange (correcte avec aide), rouge (révélée). Même patron que
 * `ResultatPanelDomaineDefinition.tsx` (5gen1) — liste à plat, jamais de score fractionnaire par
 * question.
 */
export function ResultatPanelComposeeGraphique({ resultat, niveauAidesQuestions, onContinuer, dernier }: Props) {
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {resultat.resultatsQuestions.map((r, i) => (
        <LigneRecap key={i} label={`Question ${i + 1}`} statut={statutRecap(r.revele, niveauAidesQuestions[i] ?? null)}>
          {consigneQuestion(r.question)} — b = {r.question.bAttendu}, résultat = {formatResultatAttendu(r.question.resultatAttendu)}
        </LigneRecap>
      ))}
      <RecapTotalPoints ecrans={resultat.resultatsQuestions.map((r, i) => ({ revele: r.revele, niveauAide: niveauAidesQuestions[i] ?? null }))} />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
