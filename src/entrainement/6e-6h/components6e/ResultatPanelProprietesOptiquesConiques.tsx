import { Katex } from "../components/Katex";
import type { PhaseProprietesOptiquesConiques, ResultatExerciceProprietesOptiquesConiques } from "../moteur6e/typesProprietesOptiquesConiques";
import { TOUTES_LES_PHASES } from "../moteur6e/typesProprietesOptiquesConiques";
import { LIBELLE_PHASE, calculerTotalPointsProprietesOptiquesConiques, formatReponseAttenduePhaseLatex } from "../ui6e/formatProprietesOptiquesConiques";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseProprietesOptiquesConiques, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceProprietesOptiquesConiques;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

/** Récapitulatif final — patron plat/coloré standard (`LigneRecap`/`statutRecap`), une ligne PAR
 * ÉCRAN — mirroir `ResultatPanelIntersectionsConiques.tsx` (6gen61), simplifié : `6gen63` traverse
 * TOUJOURS les 4 mêmes écrans (`TOUTES_LES_PHASES`), jamais `phasesPourExercice`. */
export function ResultatPanelProprietesOptiquesConiques({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const { total, maximum } = calculerTotalPointsProprietesOptiquesConiques(resultat);
  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      {TOUTES_LES_PHASES.map((phase) => {
        const info = aideParPhase[phase];
        const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE[phase]} statut={statut}>
            <span className="equation-box-termes">
              {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
                <Katex key={i} expression={frag} />
              ))}
            </span>
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
