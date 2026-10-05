import { Katex } from "../components/Katex";
import type { PhaseEquationExponentielle, ResultatExerciceEquationExponentielle } from "../moteur6e/typesEquationsExponentielles";
import { calculerTotalRecapEquationExponentielle, formatReponseAttenduePhaseLatex } from "../ui6e/formatEquationsExponentielles";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseEquationExponentielle, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceEquationExponentielle;
  /** Niveau d'aide/révélation PAR ÉCRAN, capturé par `App6gen9.tsx` au moment précis où chaque écran
   * se ferme (`etat.niveauAide`/`etat.etapeCourante.revelee`) — `ResultatExerciceEquationExponentielle`
   * ne les trace pas lui-même côté Couche B (discriminée par famille, jamais un `Record<Phase,score>`
   * générique). Voir `docs/historique-6e.md` pour le patron `terminerEtape`/`aideParPhase`, répliqué
   * depuis `components5e/ResultatPanelSuiteArithmetique.tsx`. */
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

function statutPhase(aideParPhase: AideParPhase, phase: PhaseEquationExponentielle) {
  const info = aideParPhase[phase];
  return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
}

function Reponse({ exercice, phase }: { exercice: ResultatExerciceEquationExponentielle["exercice"]; phase: PhaseEquationExponentielle }) {
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelSuiteArithmetique.tsx`
 * (5gen14) : une `LigneRecap` PAR ÉCRAN RÉELLEMENT TRAVERSÉ (le nombre/l'identité des écrans dépend
 * de la famille — `moteur6e/typesEquationsExponentielles.ts::phaseApres`), contenant la réponse
 * ATTENDUE — jamais un score fractionnaire `X/100`.
 */
export function ResultatPanelEquationExponentielle({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const { total, maximum } = calculerTotalRecapEquationExponentielle(resultat);
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {resultat.famille === "A" && (
        <>
          <LigneRecap label="Étape 1 (reconnaissance)" statut={statutPhase(aideParPhase, "aEcran1")}>
            <Reponse exercice={exercice} phase="aEcran1" />
          </LigneRecap>
          <LigneRecap label="Étape 2 (résolution)" statut={statutPhase(aideParPhase, "aEcran2")}>
            <Reponse exercice={exercice} phase="aEcran2" />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "B" && (
        <>
          <LigneRecap label="Étape 1 (simplification)" statut={statutPhase(aideParPhase, "bEcran1")}>
            <Reponse exercice={exercice} phase="bEcran1" />
          </LigneRecap>
          <LigneRecap label="Étape 2 (résolution / ∅)" statut={statutPhase(aideParPhase, "bEcran2")}>
            <Reponse exercice={exercice} phase="bEcran2" />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "C" && (
        <>
          <LigneRecap label="Étape 1 (équation en t)" statut={statutPhase(aideParPhase, "cEcran1")}>
            <Reponse exercice={exercice} phase="cEcran1" />
          </LigneRecap>
          <LigneRecap label="Étape 2 (résolution en t)" statut={statutPhase(aideParPhase, "cEcran2")}>
            <Reponse exercice={exercice} phase="cEcran2" />
          </LigneRecap>
          <LigneRecap label="Étape 3 (filtrage + retour à x)" statut={statutPhase(aideParPhase, "cEcran3")}>
            <Reponse exercice={exercice} phase="cEcran3" />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "D" && (
        <LigneRecap label="Reconnaissance (∅)" statut={statutPhase(aideParPhase, "dEcran")}>
          <Reponse exercice={exercice} phase="dEcran" />
        </LigneRecap>
      )}
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
