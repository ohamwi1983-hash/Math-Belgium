import { Katex } from "../components/Katex";
import { phaseApres, phaseInitiale } from "../moteur6e/typesInequationsExponentielles";
import type { PhaseInequationExponentielle, ResultatExerciceInequationExponentielle } from "../moteur6e/typesInequationsExponentielles";
import { LIBELLE_PHASE_INEQ, contenuRecapPhase, totalPointsRecap } from "../ui6e/formatInequationsExponentielles";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceInequationExponentielle;
  aideParPhase: Partial<Record<PhaseInequationExponentielle, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Séquence RÉELLE de phases traversées par CETTE instance — dérivée de `phaseInitiale`/
 * `phaseApres` (Couche B, seule source de vérité pour l'enchaînement), jamais redupliquée ici. */
function ordrePhases(exercice: ResultatExerciceInequationExponentielle["exercice"]): PhaseInequationExponentielle[] {
  const phases: PhaseInequationExponentielle[] = [];
  let phase = phaseInitiale(exercice);
  for (;;) {
    phases.push(phase);
    const suivante = phaseApres(phase);
    if (suivante === "termine") return phases;
    phase = suivante;
  }
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `components5e/ResultatPanelSuiteArithmetique.tsx`
 * (voir CLAUDE.md, "Récapitulatif final à plat, coloré") : une `LigneRecap` PAR ÉCRAN RÉELLEMENT
 * TRAVERSÉ, contenant la réponse ATTENDUE — jamais un score fractionnaire `X/100`.
 *
 * `ResultatExerciceInequationExponentielle` ne trace ni `revele` ni `niveauAide` par écran côté
 * Couche B — `aideParPhase` (fourni par `App6gen10.tsx`, capturé au moment précis où chaque écran
 * se ferme, `etat.niveauAide`/`etat.etapeCourante.revelee`) porte cette information à la place.
 */
export function ResultatPanelInequationExponentielle({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const phases = ordrePhases(resultat.exercice);
  const { total, maximum } = totalPointsRecap(resultat);

  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      {phases.map((phase) => {
        const info = aideParPhase[phase];
        const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
        const contenu = contenuRecapPhase(resultat.exercice, phase);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE_INEQ[phase]} statut={statut}>
            {contenu.latex !== null ? <Katex expression={contenu.latex} /> : contenu.texte}
          </LigneRecap>
        );
      })}
      <div className="recap-final-total">
        {/* Arrondi à l'affichage seulement (`Math.round`, même convention que `moyenneExercice` de
         * `ResumeSessionInequationExponentielle.tsx`) — le score par écran peut être non entier
         * (pénalité par tentative = pointsDeBase/tentativesMax), `total` reste la somme EXACTE. */}
        <strong>Total</strong> : {Math.round(total)}/{maximum}
      </div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
