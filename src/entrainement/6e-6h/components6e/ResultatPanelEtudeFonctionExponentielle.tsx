import { Katex } from "../components/Katex";
import type { PhaseEtudeFonctionExponentielle, ResultatExerciceEtudeFonctionExponentielle } from "../moteur6e/typesEtudeFonctionExponentielle";
import { LIBELLE_PHASE_ETUDE, contenuRecapPhase, totalPointsRecap } from "../ui6e/formatEtudeFonctionExponentielle";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceEtudeFonctionExponentielle;
  aideParPhase: Partial<Record<PhaseEtudeFonctionExponentielle, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

const PHASES: PhaseEtudeFonctionExponentielle[] = ["domaine", "limites", "asymptotes", "croissance", "concavite", "graphique"];

/**
 * Écran récapitulatif final — même patron plat/coloré que `components5e/ResultatPanelSuiteArithmetique.tsx`
 * (voir CLAUDE.md, "Récapitulatif final à plat, coloré") : toujours 6 lignes (séquence FIXE à 6
 * écrans pour les 4 familles, voir `moteur6e/typesEtudeFonctionExponentielle.ts`), jamais un score
 * fractionnaire `X/100`. `aideParPhase` (fourni par `App6gen11.tsx`, capturé au moment précis où
 * chaque écran se ferme) porte `niveauAide`/`revele`, absents de `ResultatExerciceEtudeFonctionExponentielle`.
 */
export function ResultatPanelEtudeFonctionExponentielle({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const { total, maximum } = totalPointsRecap(resultat);
  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      {PHASES.map((phase) => {
        const info = aideParPhase[phase];
        const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
        const contenu = contenuRecapPhase(resultat.exercice, phase);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE_ETUDE[phase]} statut={statut}>
            {contenu.latex !== null ? <Katex expression={contenu.latex} /> : contenu.texte}
          </LigneRecap>
        );
      })}
      <div className="recap-final-total">
        {/* Arrondi à l'affichage seulement (`Math.round`, même convention que `moyenneExercice` de
         * `ResumeSessionEtudeFonctionExponentielle.tsx`) — le score par écran peut être non entier
         * (pénalité par tentative = pointsDeBase/tentativesMax), `total` reste la somme EXACTE. */}
        <strong>Total</strong> : {Math.round(total)}/{maximum}
      </div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
