import type { AideInfoEcran, PhaseDeriveesCyclometriques, ResultatExerciceDeriveesCyclometriques } from "../moteur6e/typesDeriveesCyclometriques";
import {
  calculerTotalPointsDeriveesCyclometriques,
  texteAideADeriveeFinaleNiveau2,
  texteAideADeriveeUNiveau2,
  texteAideBDeriveeArcNiveau2,
  texteAideBDeriveeFinaleNiveau2,
  texteAideBDeriveeUNiveau2,
  texteAideCDenominateurNiveau2,
  texteAideCDeriveeFinaleNiveau2,
  texteAideCNumerateurNiveau2,
  texteAideDBrutNiveau2,
  texteAideDDenominateurNiveau2,
  texteAideDNumerateurNiveau2,
  texteAideDSimplifieeNiveau2,
  texteAideEDeriveeFinaleNiveau2,
  texteAideEDeriveeInterneNiveau2,
  texteAideFBruteNiveau2,
  texteAideGDeriveeFinaleNiveau2,
  texteAideGDeriveeInterneNiveau2,
} from "../ui6e/formatDeriveesCyclometriques";
import { Katex } from "../components/Katex";
import { LigneRecap, statutRecap, type StatutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseDeriveesCyclometriques, AideInfoEcran>>;

interface Props {
  resultat: ResultatExerciceDeriveesCyclometriques;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

/** Statut d'une ligne, capturé PRÉCISÉMENT (niveau d'aide réellement utilisé + révélation
 * éventuelle) au moment où l'écran `phase` s'est fermé (`derniereCloture`, moteur), jamais déduit
 * d'un score déjà pénalisé. */
function statutPhase(aideParPhase: AideParPhase, phase: PhaseDeriveesCyclometriques): StatutRecap {
  const info = aideParPhase[phase];
  return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
}

/** La formule finale attendue de chaque écran réutilise le LaTeX déjà calculé pour l'aide de
 * niveau 2 (dernier palier avant révélation complète) — jamais recalculée séparément ici. */
function LignesRecap({ resultat, aideParPhase }: { resultat: ResultatExerciceDeriveesCyclometriques; aideParPhase: AideParPhase }) {
  if (resultat.famille === "A" && resultat.exercice.famille === "A") {
    const exercice = resultat.exercice;
    return (
      <>
        <LigneRecap label="Dériver u(x)" statut={statutPhase(aideParPhase, "aDeriveeU")}>
          <Katex expression={texteAideADeriveeUNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
        <LigneRecap label="Assembler f'(x)" statut={statutPhase(aideParPhase, "aDeriveeFinale")}>
          <Katex expression={texteAideADeriveeFinaleNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
      </>
    );
  }

  if (resultat.famille === "B" && resultat.exercice.famille === "B") {
    const exercice = resultat.exercice;
    return (
      <>
        <LigneRecap label="Dériver u(x)" statut={statutPhase(aideParPhase, "bDeriveeU")}>
          <Katex expression={texteAideBDeriveeUNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
        <LigneRecap label="Dériver arcfonction(v(x))" statut={statutPhase(aideParPhase, "bDeriveeArc")}>
          <Katex expression={texteAideBDeriveeArcNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
        <LigneRecap label="Assembler f'(x)" statut={statutPhase(aideParPhase, "bDeriveeFinale")}>
          <Katex expression={texteAideBDeriveeFinaleNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
      </>
    );
  }

  if (resultat.famille === "C" && resultat.exercice.famille === "C") {
    const exercice = resultat.exercice;
    return (
      <>
        <LigneRecap label="Dériver le numérateur" statut={statutPhase(aideParPhase, "cNumerateur")}>
          <Katex expression={texteAideCNumerateurNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
        <LigneRecap label="Dériver le dénominateur" statut={statutPhase(aideParPhase, "cDenominateur")}>
          <Katex expression={texteAideCDenominateurNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
        <LigneRecap label="Assembler f'(x)" statut={statutPhase(aideParPhase, "cDeriveeFinale")}>
          <Katex expression={texteAideCDeriveeFinaleNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
      </>
    );
  }

  if (resultat.famille === "D" && resultat.exercice.famille === "D") {
    const exercice = resultat.exercice;
    return (
      <>
        <LigneRecap label="Dériver le numérateur" statut={statutPhase(aideParPhase, "dNumerateur")}>
          <Katex expression={texteAideDNumerateurNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
        <LigneRecap label="Dériver le dénominateur" statut={statutPhase(aideParPhase, "dDenominateur")}>
          <Katex expression={texteAideDDenominateurNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
        <LigneRecap label="Assembler (brut)" statut={statutPhase(aideParPhase, "dBrut")}>
          <Katex expression={texteAideDBrutNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
        <LigneRecap label="Simplifier via l'identité" statut={statutPhase(aideParPhase, "dSimplifiee")}>
          <Katex expression={texteAideDSimplifieeNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
      </>
    );
  }

  if (resultat.famille === "E" && resultat.exercice.famille === "E") {
    const exercice = resultat.exercice;
    return (
      <>
        <LigneRecap label="Dériver l'arcfonction interne" statut={statutPhase(aideParPhase, "eDeriveeInterne")}>
          <Katex expression={texteAideEDeriveeInterneNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
        <LigneRecap label="Assembler f'(x)" statut={statutPhase(aideParPhase, "eDeriveeFinale")}>
          <Katex expression={texteAideEDeriveeFinaleNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
      </>
    );
  }

  if (resultat.famille === "F" && resultat.exercice.famille === "F") {
    const exercice = resultat.exercice;
    return (
      <>
        <LigneRecap label="Dériver (chaîne brute)" statut={statutPhase(aideParPhase, "fBrute")}>
          <Katex expression={texteAideFBruteNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
        <LigneRecap label="Simplifier via l'identité" statut={statutPhase(aideParPhase, "fSimplifiee")}>
          Forme simplifiée via l'identité trigonométrique adéquate (plusieurs écritures équivalentes acceptées).
        </LigneRecap>
      </>
    );
  }

  if (resultat.famille === "G" && resultat.exercice.famille === "G") {
    const exercice = resultat.exercice;
    return (
      <>
        <LigneRecap label="Dériver l'expression interne" statut={statutPhase(aideParPhase, "gDeriveeInterne")}>
          <Katex expression={texteAideGDeriveeInterneNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
        <LigneRecap label="Assembler f'(x)" statut={statutPhase(aideParPhase, "gDeriveeFinale")}>
          <Katex expression={texteAideGDeriveeFinaleNiveau2(exercice).latex ?? ""} />
        </LigneRecap>
      </>
    );
  }

  return null;
}

export function ResultatPanelDeriveesCyclometriques({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const { points, maximum } = calculerTotalPointsDeriveesCyclometriques(resultat);
  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      <LignesRecap resultat={resultat} aideParPhase={aideParPhase} />
      <p className="recap-final-total">
        Total : {Math.round(points)}/{maximum}
      </p>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
