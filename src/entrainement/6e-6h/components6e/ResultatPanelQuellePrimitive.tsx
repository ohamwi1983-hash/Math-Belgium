import { Katex } from "../components/Katex";
import type { PhaseQuellePrimitive, ResultatExerciceQuellePrimitive } from "../moteur6e/typesQuellePrimitive";
import { phasesPourExercice } from "../moteur6e/typesQuellePrimitive";
import { LIBELLE_PHASE, calculerTotalPointsQuellePrimitive, formatReponseAttenduePhaseLatexQuellePrimitive } from "../ui6e/formatQuellePrimitive";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseQuellePrimitive, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceQuellePrimitive;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

/** Récapitulatif final — patron plat/coloré standard (`LigneRecap`/`statutRecap`), une ligne PAR
 * ÉCRAN RÉELLEMENT TRAVERSÉ (`phasesPourExercice`, écrans empruntés à 6gen23 + l'écran final
 * nouveau, toujours en dernière ligne) — mirroir de `ResultatPanelCalculPrimitives.tsx` (6gen23). */
export function ResultatPanelQuellePrimitive({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = phasesPourExercice(exercice);
  const { total, maximum } = calculerTotalPointsQuellePrimitive(resultat);
  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      {phases.map((phase) => {
        const info = aideParPhase[phase];
        const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE[phase]} statut={statut}>
            <span className="equation-box-termes">
              {formatReponseAttenduePhaseLatexQuellePrimitive(exercice, phase).map((frag, i) => (
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
