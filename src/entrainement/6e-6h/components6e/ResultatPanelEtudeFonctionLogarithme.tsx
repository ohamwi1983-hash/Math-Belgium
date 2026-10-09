import { Katex } from "../components/Katex";
import type { ResultatExerciceEtudeFonctionLogarithme } from "../moteur6e/typesEtudeFonctionLogarithme";
import { LIBELLE_PHASE_ETUDE_LOG, contenuRecapPhase, phasesVisitees, totalPointsRecap } from "../ui6e/formatEtudeFonctionLogarithme";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceEtudeFonctionLogarithme;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelEtudeFonctionExponentielle.tsx`
 * (`6gen11`) : jamais un score fractionnaire `X/100`. Contrairement à `6gen11` (toujours 6 lignes),
 * le NOMBRE de lignes varie ici selon la famille (`phasesVisitees` — 6 pour A-D, 2 pour E).
 *
 * `revele`/`niveauAide` lus directement depuis `resultat.details` (capturés DANS le moteur au
 * moment précis de la clôture de chaque écran, voir `sessionEtudeFonctionLogarithme.ts`) — jamais
 * un `aideParPhase` recalculé côté App comme `6gen11` : ce générateur suit le patron plus récent de
 * `6gen16` (`detailsPartiels` porté directement par le résultat).
 */
export function ResultatPanelEtudeFonctionLogarithme({ resultat, onContinuer, dernier }: Props) {
  const { total, maximum } = totalPointsRecap(resultat);
  const phases = phasesVisitees(resultat.exercice.famille);
  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      {phases.map((phase) => {
        const info = resultat.details[phase];
        const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
        const contenu = contenuRecapPhase(resultat.exercice, phase);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE_ETUDE_LOG[phase]} statut={statut}>
            {contenu.latex !== null ? <Katex expression={contenu.latex} /> : contenu.texte}
          </LigneRecap>
        );
      })}
      <div className="recap-final-total">
        <strong>Total</strong> : {Math.round(total)}/{maximum}
      </div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
