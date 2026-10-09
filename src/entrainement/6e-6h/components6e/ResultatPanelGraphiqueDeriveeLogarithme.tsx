import { Katex } from "../components/Katex";
import type { PhaseGraphiqueDeriveeLogarithme, ResultatExerciceGraphiqueDeriveeLogarithme } from "../moteur6e/typesGraphiqueDeriveeLogarithme";
import { calculerTotalRecapGraphiqueDeriveeLogarithme, calculerViewBoxGraphique, formatDeriveeCorrecteLatex } from "../ui6e/formatGraphiqueDeriveeLogarithme";
import { GrapheOptionDeriveeLogarithme } from "./GrapheOptionDeriveeLogarithme";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseGraphiqueDeriveeLogarithme, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceGraphiqueDeriveeLogarithme;
  /** Niveau d'aide/révélation PAR ÉCRAN, capturé par `App6gen20.tsx` au moment précis où chaque
   * écran se ferme (`etat.niveauAide`/`nouvelEtat.derniereTransitionRevelee`) — voir
   * `docs/historique-6e.md` (patron `terminerEtape`/`aideParPhase`, 6gen8/6gen16). */
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

function statutPhase(aideParPhase: AideParPhase, phase: PhaseGraphiqueDeriveeLogarithme) {
  const info = aideParPhase[phase];
  return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelGraphiqueDeriveeExponentielle.tsx`
 * (6gen8) : une `LigneRecap` PAR ÉCRAN (toujours 2 pour `6gen20`, les 3 familles traversent
 * systématiquement "derivee" ET "selection" — jamais de score fractionnaire `X/100`.
 *
 * La "réponse réellement attendue" de l'écran "selection" est VISUELLE (un graphique parmi 4,
 * jamais une formule) — on affiche donc directement le graphique CORRECT (même mini-composant,
 * même `viewBox` que le QCM lui-même), plutôt qu'une description textuelle approximative.
 */
export function ResultatPanelGraphiqueDeriveeLogarithme({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const { total, maximum } = calculerTotalRecapGraphiqueDeriveeLogarithme(resultat);
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <LigneRecap label="Calcul de f'(x)" statut={statutPhase(aideParPhase, "derivee")}>
        <Katex expression={formatDeriveeCorrecteLatex(exercice)} />
      </LigneRecap>
      <LigneRecap label="Sélection du graphique" statut={statutPhase(aideParPhase, "selection")}>
        <GrapheOptionDeriveeLogarithme exercice={exercice} index={exercice.indexCorrect} viewBox={calculerViewBoxGraphique(exercice)} largeur={150} hauteur={150} />
      </LigneRecap>
      <div className="recap-final-total">
        Total : {total}/{maximum}
      </div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
