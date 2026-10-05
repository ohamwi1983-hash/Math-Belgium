import { Katex } from "../components/Katex";
import type { PhaseGraphiqueDeriveeExponentielle, ResultatExerciceGraphiqueDeriveeExponentielle } from "../moteur6e/typesGraphiquesDeriveeExponentielles";
import { calculerTotalRecapGraphiqueDeriveeExponentielle, calculerViewBoxGraphique, formatDeriveeCorrecteLatex } from "../ui6e/formatGraphiquesDeriveeExponentielles";
import { GrapheOptionDeriveeExpo } from "./GrapheOptionDeriveeExpo";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseGraphiqueDeriveeExponentielle, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceGraphiqueDeriveeExponentielle;
  /** Niveau d'aide/révélation PAR ÉCRAN, capturé par `App6gen8.tsx` au moment précis où chaque écran
   * se ferme (`etat.niveauAide`/`etat.etapeCourante.revelee`) — `ResultatExerciceGraphiqueDeriveeExponentielle`
   * ne les trace pas lui-même côté Couche B. Voir `docs/historique-6e.md` pour le patron
   * `terminerEtape`/`aideParPhase`, répliqué depuis `components5e/ResultatPanelSuiteArithmetique.tsx`. */
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

function statutPhase(aideParPhase: AideParPhase, phase: PhaseGraphiqueDeriveeExponentielle) {
  const info = aideParPhase[phase];
  return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelSuiteArithmetique.tsx`
 * (5gen14) : une `LigneRecap` PAR ÉCRAN RÉELLEMENT TRAVERSÉ ("derivee" absent pour les familles
 * A/C, `resultat.scoreDerivee===null` dans ce cas), jamais de score fractionnaire `X/100`.
 *
 * La "réponse réellement attendue" de l'écran "selection" est VISUELLE (un graphique parmi 4,
 * jamais une formule) — on affiche donc directement le graphique CORRECT (même mini-composant,
 * même `viewBox` que le QCM lui-même), plutôt qu'une description textuelle approximative.
 */
export function ResultatPanelGraphiqueDeriveeExponentielle({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const deriveeLatex = formatDeriveeCorrecteLatex(exercice);
  const { total, maximum } = calculerTotalRecapGraphiqueDeriveeExponentielle(resultat);
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {resultat.scoreDerivee !== null && deriveeLatex && (
        <LigneRecap label="Calcul de f'(x)" statut={statutPhase(aideParPhase, "derivee")}>
          <Katex expression={deriveeLatex} />
        </LigneRecap>
      )}
      <LigneRecap label="Sélection du graphique" statut={statutPhase(aideParPhase, "selection")}>
        <GrapheOptionDeriveeExpo exercice={exercice} index={exercice.indexCorrect} viewBox={calculerViewBoxGraphique(exercice)} largeur={150} hauteur={150} />
      </LigneRecap>
      <div className="etat-actuel-box">
        <strong>Total : </strong>
        {total}/{maximum}
      </div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
