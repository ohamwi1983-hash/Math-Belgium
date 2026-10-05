import type { PhaseProblemeContexte, ResultatExerciceProblemeContexte } from "../moteur5e/typesProblemesContexte";
import {
  formatTermeABLatex,
  formatTermeBeneficeC,
  formatTermeCoutMoyenC,
  formatTermeFormuleBLatex,
  formatTermeHJustificationA,
  formatTermeSeuilC,
  formatTermeExtremumSimpleA,
  formatTermeIntersectionSimpleA,
  formatTermeXEgaliteAiresA,
  formatTermeXOptimalA,
  formatTermesEvaluationBLatex,
  formatTermesFormulesGeneralisationA,
  formatTermesFormulesGeneralisationSimpleA,
  formatTermesLectureC,
  formatTermesReconnaissanceC,
  formatTermesSystemeBLatex,
  formatTermesTableauA,
} from "../ui5e/formatProblemesContexte";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseProblemeContexte, number>>;

interface Props {
  resultat: ResultatExerciceProblemeContexte;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

function LigneTermes({ termes }: { termes: string[] }) {
  return (
    <span className="equation-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </span>
  );
}

/** Écrans réellement traversés (même paire `{revele, niveauAide}` que chaque `LigneRecap` de la
 * séquence FIXE du scénario tiré), pour le total de points en pied de récapitulatif. */
function ecransProblemeContexte(resultat: ResultatExerciceProblemeContexte, aideParPhase: AideParPhase): { revele: boolean; niveauAide: number | null }[] {
  if (resultat.scenario === "A" && resultat.combo === "kInverseXAxCarre") {
    return [
      { revele: resultat.tableauRevele, niveauAide: aideParPhase.tableau ?? null },
      { revele: resultat.generalisationRevele, niveauAide: aideParPhase.generalisation ?? null },
      { revele: resultat.egaliteAiresRevele, niveauAide: aideParPhase.egaliteAires ?? null },
      { revele: resultat.graphiqueRevele, niveauAide: aideParPhase.graphique ?? null },
      { revele: resultat.justificationRevele, niveauAide: aideParPhase.justification ?? null },
    ];
  }
  if (resultat.scenario === "A") {
    return [
      { revele: resultat.generalisationSimpleRevele, niveauAide: aideParPhase.generalisationSimple ?? null },
      { revele: resultat.intersectionSimpleRevele, niveauAide: aideParPhase.intersectionSimple ?? null },
      { revele: resultat.extremumSimpleRevele, niveauAide: aideParPhase.extremumSimple ?? null },
    ];
  }
  if (resultat.scenario === "B") {
    return [
      { revele: resultat.systemeRevele, niveauAide: aideParPhase.systeme ?? null },
      { revele: resultat.resolutionRevele, niveauAide: aideParPhase.resolution ?? null },
      { revele: resultat.formuleRevele, niveauAide: aideParPhase.formule ?? null },
      { revele: resultat.evaluationRevele, niveauAide: aideParPhase.evaluation ?? null },
    ];
  }
  return [
    { revele: resultat.lectureRevele, niveauAide: aideParPhase.lecture ?? null },
    { revele: resultat.coutMoyenRevele, niveauAide: aideParPhase.coutMoyen ?? null },
    { revele: resultat.reconnaissanceRevele, niveauAide: aideParPhase.reconnaissance ?? null },
    { revele: resultat.beneficeRevele, niveauAide: aideParPhase.benefice ?? null },
    { revele: resultat.seuilRevele, niveauAide: aideParPhase.seuil ?? null },
  ];
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelDomaineDefinition.tsx`
 * (5gen1)/`ResultatPanelComposerFonctions.tsx` (5gen3) : une `LigneRecap` PAR ÉCRAN de la séquence
 * FIXE du scénario réellement tiré (jamais de garde `!== null` — les 3 scénarios de ce générateur
 * traversent TOUJOURS l'intégralité de leur propre séquence, voir `moteur5e/typesProblemesContexte.ts`),
 * contenant la réponse RÉELLEMENT attendue (jamais un score fractionnaire `X/100`).
 *
 * `ResultatExerciceProblemeContexte` ne trace, comme `ResultatExerciceComposerFonctions`, aucun
 * `niveauAideXxx` par écran (seuls `scoreXxx`/`xxxRevele` sont persistés côté Couche B) — le niveau
 * d'aide RÉELLEMENT utilisé sur chaque écran est donc capturé côté présentation (`App5gen5.tsx`,
 * `aideParPhase`, figé au moment où l'écran se ferme) et transmis ici en prop, jamais recalculé
 * depuis le score.
 */
export function ResultatPanelProblemeContexte({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {resultat.scenario === "A" && resultat.combo === "kInverseXAxCarre" && <RecapScenarioAConteneur resultat={resultat} aideParPhase={aideParPhase} />}
      {resultat.scenario === "A" && resultat.combo !== "kInverseXAxCarre" && <RecapScenarioAReduit resultat={resultat} aideParPhase={aideParPhase} />}
      {resultat.scenario === "B" && <RecapScenarioB resultat={resultat} aideParPhase={aideParPhase} />}
      {resultat.scenario === "C" && <RecapScenarioC resultat={resultat} aideParPhase={aideParPhase} />}
      <RecapTotalPoints ecrans={ecransProblemeContexte(resultat, aideParPhase)} />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}

function RecapScenarioAConteneur({ resultat, aideParPhase }: { resultat: Extract<ResultatExerciceProblemeContexte, { scenario: "A"; combo: "kInverseXAxCarre" }>; aideParPhase: AideParPhase }) {
  const ex = resultat.exercice;
  return (
    <>
      <LigneRecap label="Tableau" statut={statutRecap(resultat.tableauRevele, aideParPhase.tableau ?? null)}>
        <LigneTermes termes={formatTermesTableauA(ex)} />
      </LigneRecap>
      <LigneRecap label="Généralisation" statut={statutRecap(resultat.generalisationRevele, aideParPhase.generalisation ?? null)}>
        <LigneTermes termes={formatTermesFormulesGeneralisationA()} />
      </LigneRecap>
      <LigneRecap label="Égalité des aires" statut={statutRecap(resultat.egaliteAiresRevele, aideParPhase.egaliteAires ?? null)}>
        <Katex expression={formatTermeXEgaliteAiresA(ex)} />
      </LigneRecap>
      <LigneRecap label="Graphique" statut={statutRecap(resultat.graphiqueRevele, aideParPhase.graphique ?? null)}>
        <Katex expression={formatTermeXOptimalA(ex)} />
      </LigneRecap>
      <LigneRecap label="Justification" statut={statutRecap(resultat.justificationRevele, aideParPhase.justification ?? null)}>
        <Katex expression={formatTermeHJustificationA(ex, resultat.xOptimalRetenu)} /> — le diamètre égale la hauteur au rayon optimal.
      </LigneRecap>
    </>
  );
}

function RecapScenarioAReduit({ resultat, aideParPhase }: { resultat: Extract<ResultatExerciceProblemeContexte, { scenario: "A" }>; aideParPhase: AideParPhase }) {
  if (resultat.combo === "kInverseXAxCarre") return null;
  const ex = resultat.exercice;
  return (
    <>
      <LigneRecap label="Généralisation" statut={statutRecap(resultat.generalisationSimpleRevele, aideParPhase.generalisationSimple ?? null)}>
        <LigneTermes termes={formatTermesFormulesGeneralisationSimpleA(ex)} />
      </LigneRecap>
      <LigneRecap label="Intersection" statut={statutRecap(resultat.intersectionSimpleRevele, aideParPhase.intersectionSimple ?? null)}>
        <Katex expression={formatTermeIntersectionSimpleA(ex)} />
      </LigneRecap>
      <LigneRecap label="Extremum" statut={statutRecap(resultat.extremumSimpleRevele, aideParPhase.extremumSimple ?? null)}>
        <Katex expression={formatTermeExtremumSimpleA(ex)} />
      </LigneRecap>
    </>
  );
}

function RecapScenarioB({ resultat, aideParPhase }: { resultat: Extract<ResultatExerciceProblemeContexte, { scenario: "B" }>; aideParPhase: AideParPhase }) {
  const ex = resultat.exercice;
  return (
    <>
      <LigneRecap label="Système" statut={statutRecap(resultat.systemeRevele, aideParPhase.systeme ?? null)}>
        <LigneTermes termes={formatTermesSystemeBLatex(ex)} />
      </LigneRecap>
      <LigneRecap label="Résolution" statut={statutRecap(resultat.resolutionRevele, aideParPhase.resolution ?? null)}>
        <Katex expression={formatTermeABLatex(ex.aArrondiAttendu, ex.bArrondiAttendu)} />
      </LigneRecap>
      <LigneRecap label="Formule" statut={statutRecap(resultat.formuleRevele, aideParPhase.formule ?? null)}>
        <Katex expression={formatTermeFormuleBLatex(resultat.aRetenu, resultat.bRetenu, ex.modele)} />
      </LigneRecap>
      <LigneRecap label="Évaluation" statut={statutRecap(resultat.evaluationRevele, aideParPhase.evaluation ?? null)}>
        <LigneTermes termes={formatTermesEvaluationBLatex(ex, resultat.aRetenu, resultat.bRetenu)} />
      </LigneRecap>
    </>
  );
}

function RecapScenarioC({ resultat, aideParPhase }: { resultat: Extract<ResultatExerciceProblemeContexte, { scenario: "C" }>; aideParPhase: AideParPhase }) {
  const ex = resultat.exercice;
  return (
    <>
      <LigneRecap label="Lecture" statut={statutRecap(resultat.lectureRevele, aideParPhase.lecture ?? null)}>
        <LigneTermes termes={formatTermesLectureC(ex)} />
      </LigneRecap>
      <LigneRecap label="Coût moyen" statut={statutRecap(resultat.coutMoyenRevele, aideParPhase.coutMoyen ?? null)}>
        <Katex expression={formatTermeCoutMoyenC(ex)} />
      </LigneRecap>
      <LigneRecap label="Reconnaissance" statut={statutRecap(resultat.reconnaissanceRevele, aideParPhase.reconnaissance ?? null)}>
        <LigneTermes termes={formatTermesReconnaissanceC(ex)} />
      </LigneRecap>
      <LigneRecap label="Bénéfice" statut={statutRecap(resultat.beneficeRevele, aideParPhase.benefice ?? null)}>
        <Katex expression={formatTermeBeneficeC(ex)} />
      </LigneRecap>
      <LigneRecap label="Seuil" statut={statutRecap(resultat.seuilRevele, aideParPhase.seuil ?? null)}>
        <Katex expression={formatTermeSeuilC(ex)} />
      </LigneRecap>
    </>
  );
}
