import type { AideInfoEcran, PhaseEquationsCyclometriques, ResultatExerciceEquationsCyclometriques } from "../moteur6e/typesEquationsCyclometriques";
import { MAX_DEN, calculerTotalPointsEquationsCyclometriques, formatCandidatLatex, formatEquationNonCycloLatex, formatEquationOriginaleLatex } from "../ui6e/formatEquationsCyclometriques";
import { formatEnsembleReelLatex } from "../ui6e/formatEnsembleReel";
import { Katex } from "../components/Katex";
import { LigneRecap, statutRecap, type StatutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseEquationsCyclometriques, AideInfoEcran>>;

interface Props {
  resultat: ResultatExerciceEquationsCyclometriques;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

/** Statut d'une ligne, capturé PRÉCISÉMENT (niveau d'aide réellement utilisé + révélation
 * éventuelle) au moment où l'écran `phase` s'est fermé (`derniereCloture`, moteur), jamais déduit
 * d'un score déjà pénalisé. */
function statutPhase(aideParPhase: AideParPhase, phase: PhaseEquationsCyclometriques): StatutRecap {
  const info = aideParPhase[phase];
  return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
}

function ListeSolutions({ solutions }: { solutions: number[] }) {
  if (solutions.length === 0) return <>Aucune solution</>;
  return (
    <>
      {solutions.map((s, i) => (
        <span key={i}>
          {i > 0 && ", "}
          <Katex expression={formatCandidatLatex(s)} />
        </span>
      ))}
    </>
  );
}

export function ResultatPanelEquationsCyclometriques({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const { exercice } = resultat;
  const { points, maximum } = calculerTotalPointsEquationsCyclometriques(resultat);
  const acceptees = exercice.candidats.filter((c) => c.accepteAttendu).map((c) => c.x);

  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      <LigneRecap label="Équation" statut="verte">
        <Katex expression={formatEquationOriginaleLatex(exercice)} />
      </LigneRecap>
      <LigneRecap label="Condition d'existence (CE)" statut={statutPhase(aideParPhase, "ce")}>
        <Katex expression={formatEnsembleReelLatex(exercice.ce, MAX_DEN)} />
      </LigneRecap>
      {resultat.scoreCondition !== null && exercice.variante === "arcfonctionsDifferentes" && (
        <LigneRecap label="Condition de compatibilité des codomaines" statut={statutPhase(aideParPhase, "condition")}>
          <Katex expression={formatEnsembleReelLatex(exercice.conditionParasite, MAX_DEN)} />
        </LigneRecap>
      )}
      <LigneRecap label="Équation non cyclométrique" statut={statutPhase(aideParPhase, "equation")}>
        <Katex expression={formatEquationNonCycloLatex(exercice)} />
      </LigneRecap>
      <LigneRecap label="Solutions de l'équation (avant filtrage CE)" statut={statutPhase(aideParPhase, "solutions")}>
        <ListeSolutions solutions={exercice.candidats.map((c) => c.x)} />
      </LigneRecap>
      {resultat.scoreAcceptRejet !== null && (
        <LigneRecap label="Solution(s) finale(s), après acceptation/rejet" statut={statutPhase(aideParPhase, "acceptRejet")}>
          <ListeSolutions solutions={acceptees} />
        </LigneRecap>
      )}
      <p className="recap-final-total">
        Total : {Math.round(points)}/{maximum}
      </p>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
