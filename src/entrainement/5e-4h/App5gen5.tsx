import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceProblemeContexte } from "./core5e/problemesContexte.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { genererExerciceProblemeContexte } from "./generateurs5e/problemesContexte";
import {
  construireScenarioAConteneur,
  construireScenarioADeuxParaboles,
  construireScenarioAIntensiteCable,
  construireScenarioARacineAffine,
  construireScenarioAStockCommande,
} from "./generateurs5e/problemesContexte/scenarioA";
import { construireScenarioBAvecModele } from "./generateurs5e/problemesContexte/scenarioB";
import { construireScenarioCAvecFormes } from "./generateurs5e/problemesContexte/scenarioC";
import type { FormeChiffreAffairesC, FormeCoutVariableC } from "./core5e/problemesContexte.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const LABEL_FORME_CV: Record<FormeCoutVariableC, string> = { racineCarree: "CV=k√x", racineCubique: "CV=k∛x", carre: "CV=kx²", cube: "CV=kx³" };
const LABEL_FORME_CA: Record<FormeChiffreAffairesC, string> = { affine: "CA=px", racineCarree: "CA=p√x", racineCubique: "CA=p∛x" };
const FORMES_CV: FormeCoutVariableC[] = ["racineCarree", "racineCubique", "carre", "cube"];
const FORMES_CA: FormeChiffreAffairesC[] = ["affine", "racineCarree", "racineCubique"];

const GENERATEURS_SCENARIO: Record<string, () => ExerciceProblemeContexte> = {
  A1: () => construireScenarioAConteneur(),
  A2: () => construireScenarioAStockCommande(),
  A3: () => construireScenarioARacineAffine(),
  A4: () => construireScenarioAIntensiteCable(),
  A5: () => construireScenarioADeuxParaboles(),
  B1: () => construireScenarioBAvecModele("B1"),
  B2: () => construireScenarioBAvecModele("B2"),
  B3: () => construireScenarioBAvecModele("B3"),
  B4: () => construireScenarioBAvecModele("B4"),
  B5: () => construireScenarioBAvecModele("B5"),
};
const OPTIONS_SCENARIO = [
  { id: "A1", label: "A1 — bidons cylindriques (k/x vs ax²)" },
  { id: "A2", label: "A2 — stock/commande (ax+b vs k/x)" },
  { id: "A3", label: "A3 — racine/affine (k√x vs b-ax)" },
  { id: "A4", label: "A4 — intensité/câble (k/x² vs ax)" },
  { id: "A5", label: "A5 — deux paraboles" },
  { id: "B1", label: "B1 — coût unitaire cu(x)=a+b/x" },
  { id: "B2", label: "B2 — coût unitaire cu(x)=a+bx" },
  { id: "B3", label: "B3 — coût unitaire cu(x)=a+b/x²" },
  { id: "B4", label: "B4 — coût unitaire cu(x)=a/x+b/x²" },
  { id: "B5", label: "B5 — coût unitaire cu(x)=ax+b/x" },
];
for (const formeCV of FORMES_CV) {
  for (const formeCA of FORMES_CA) {
    const id = `C-${formeCV}-${formeCA}`;
    GENERATEURS_SCENARIO[id] = () => construireScenarioCAvecFormes(formeCV, formeCA);
    OPTIONS_SCENARIO.push({ id, label: `C — ${LABEL_FORME_CV[formeCV]} / ${LABEL_FORME_CA[formeCA]}` });
  }
}
import {
  activerAideSuivante,
  demarrerSessionProblemeContexte,
  niveauAideMaxPhase,
  soumettreReponseBeneficeC,
  soumettreReponseCoutMoyenC,
  soumettreReponseEgaliteAiresA,
  soumettreReponseEvaluationB,
  soumettreReponseExtremumSimpleA,
  soumettreReponseFormuleB,
  soumettreReponseGeneralisationA,
  soumettreReponseGeneralisationSimpleA,
  soumettreReponseGraphiqueA,
  soumettreReponseIntersectionSimpleA,
  soumettreReponseJustificationA,
  soumettreReponseLectureC,
  soumettreReponseReconnaissanceC,
  soumettreReponseResolutionB,
  soumettreReponseSeuilC,
  soumettreReponseSystemeB,
  soumettreReponseTableauA,
} from "./moteur5e/sessionProblemesContexte";
import type {
  EtatSessionProblemeContexte,
  PhaseProblemeContexte,
  ResultatScenarioAConteneur,
  ResultatScenarioAReduit,
  ResultatScenarioB,
  ResultatScenarioC,
} from "./moteur5e/typesProblemesContexte";
import {
  consigneContexteAReduit,
  consigneContexteC,
  consigneVolumeA,
  formatTermeABLatex,
  formatTermeBeneficeC,
  formatTermeCoutMoyenC,
  formatTermeExtremumSimpleA,
  formatTermeFormuleBLatex,
  formatTermeHJustificationA,
  formatTermeIntersectionSimpleA,
  formatTermeSeuilC,
  formatTermeXEgaliteAiresA,
  formatTermeXOptimalA,
  formatTermesEvaluationBLatex,
  formatTermesFormulesGeneralisationA,
  formatTermesFormulesGeneralisationSimpleA,
  formatTermesLectureC,
  formatTermesReconnaissanceC,
  formatTermesSystemeBLatex,
  formatTermesTableauA,
} from "./ui5e/formatProblemesContexte";
import { BlocContexteB } from "./components5e/BlocContexteB";
import { EtapeBeneficeC } from "./components5e/EtapeBeneficeC";
import { EtapeCoutMoyenC } from "./components5e/EtapeCoutMoyenC";
import { EtapeEgaliteAiresA } from "./components5e/EtapeEgaliteAiresA";
import { EtapeEvaluationB } from "./components5e/EtapeEvaluationB";
import { EtapeExtremumSimpleA } from "./components5e/EtapeExtremumSimpleA";
import { EtapeFormuleB } from "./components5e/EtapeFormuleB";
import { EtapeGeneralisationA } from "./components5e/EtapeGeneralisationA";
import { EtapeGeneralisationSimpleA } from "./components5e/EtapeGeneralisationSimpleA";
import { EtapeGraphiqueA } from "./components5e/EtapeGraphiqueA";
import { EtapeIntersectionSimpleA } from "./components5e/EtapeIntersectionSimpleA";
import { EtapeJustificationA } from "./components5e/EtapeJustificationA";
import { EtapeLectureC } from "./components5e/EtapeLectureC";
import { EtapeReconnaissanceC } from "./components5e/EtapeReconnaissanceC";
import { EtapeResolutionB } from "./components5e/EtapeResolutionB";
import { EtapeSeuilC } from "./components5e/EtapeSeuilC";
import { EtapeSystemeB } from "./components5e/EtapeSystemeB";
import { EtapeTableauA } from "./components5e/EtapeTableauA";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { Katex } from "./components/Katex";
import { calculerRecapitulatifProblemeContexte } from "./ui5e/recapitulatifProblemesContexte";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type {
  ReponseGeneralisationA,
  ReponseGeneralisationSimpleA,
  ReponseLectureC,
  ReponseReconnaissanceC,
  ReponseResolutionB,
  ReponseSystemeB,
  ReponseTableauA,
} from "./moteur5e/verificationProblemesContexte";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProblemeContexte {
  return demarrerSessionProblemeContexte(REGLAGES_DEMO, genererExerciceProblemeContexte);
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

/** Révèle le champ `xxxRevele` de la phase qui vient de se terminer (`phase` = `etat.phase`, AVANT
 * la mise à jour) — pour les phases NON terminales, lu directement sur `nouvelEtat` (champ remis à
 * jour par le moteur à la clôture de la phase) ; pour les phases terminales (dernier écran de
 * chaque scénario), `cloturerExerciceOuSuivant` ne pose ce champ que DANS le `resultats` ajouté,
 * jamais au niveau racine — lu depuis `nouvelEtat.resultats[dernier]`. */
function releveDeLaPhase(phase: PhaseProblemeContexte, nouvelEtat: EtatSessionProblemeContexte): boolean {
  switch (phase) {
    case "tableau":
      return nouvelEtat.tableauRevele;
    case "generalisation":
      return nouvelEtat.generalisationRevele;
    case "egaliteAires":
      return nouvelEtat.egaliteAiresRevele;
    case "graphique":
      return nouvelEtat.graphiqueRevele;
    case "justification":
      return (nouvelEtat.resultats[nouvelEtat.resultats.length - 1] as ResultatScenarioAConteneur).justificationRevele;
    case "generalisationSimple":
      return nouvelEtat.generalisationSimpleRevele;
    case "intersectionSimple":
      return nouvelEtat.intersectionSimpleRevele;
    case "extremumSimple":
      return (nouvelEtat.resultats[nouvelEtat.resultats.length - 1] as ResultatScenarioAReduit).extremumSimpleRevele;
    case "systeme":
      return nouvelEtat.systemeRevele;
    case "resolution":
      return nouvelEtat.resolutionRevele;
    case "formule":
      return nouvelEtat.formuleRevele;
    case "evaluation":
      return (nouvelEtat.resultats[nouvelEtat.resultats.length - 1] as ResultatScenarioB).evaluationRevele;
    case "lecture":
      return nouvelEtat.lectureRevele;
    case "coutMoyen":
      return nouvelEtat.coutMoyenRevele;
    case "reconnaissance":
      return nouvelEtat.reconnaissanceRevele;
    case "benefice":
      return nouvelEtat.beneficeRevele;
    case "seuil":
      return (nouvelEtat.resultats[nouvelEtat.resultats.length - 1] as ResultatScenarioC).seuilRevele;
  }
}

/** Réponse attendue de la phase qui vient de se terminer — réplique exactement la `LigneRecap`
 * correspondante de l'ancien `ResultatPanelProblemeContexte.tsx`. `exercice`/`phase` viennent de
 * `etat` (AVANT mise à jour) ; `nouvelEtat` fournit les valeurs RETENUES par continuité
 * (xOptimalRetenu/aRetenu/bRetenu) déjà posées par le moteur à la clôture de cette même phase. */
function reponseAttenduePhase(exercice: ExerciceProblemeContexte, phase: PhaseProblemeContexte, nouvelEtat: EtatSessionProblemeContexte): ReactNode {
  switch (phase) {
    case "tableau":
      if (exercice.scenario !== "A" || exercice.combo !== "kInverseXAxCarre") throw new Error("reponseAttenduePhase : exercice inattendu (tableau)");
      return <LigneTermes termes={formatTermesTableauA(exercice)} />;
    case "generalisation":
      return <LigneTermes termes={formatTermesFormulesGeneralisationA()} />;
    case "egaliteAires":
      if (exercice.scenario !== "A" || exercice.combo !== "kInverseXAxCarre") throw new Error("reponseAttenduePhase : exercice inattendu (egaliteAires)");
      return <Katex expression={formatTermeXEgaliteAiresA(exercice)} />;
    case "graphique":
      if (exercice.scenario !== "A" || exercice.combo !== "kInverseXAxCarre") throw new Error("reponseAttenduePhase : exercice inattendu (graphique)");
      return <Katex expression={formatTermeXOptimalA(exercice)} />;
    case "justification": {
      if (exercice.scenario !== "A" || exercice.combo !== "kInverseXAxCarre") throw new Error("reponseAttenduePhase : exercice inattendu (justification)");
      const xOptimalRetenu = nouvelEtat.xOptimalRetenu as number;
      return (
        <>
          <Katex expression={formatTermeHJustificationA(exercice, xOptimalRetenu)} /> — le diamètre égale la hauteur au rayon optimal.
        </>
      );
    }
    case "generalisationSimple":
      if (exercice.scenario !== "A" || exercice.combo === "kInverseXAxCarre") throw new Error("reponseAttenduePhase : exercice inattendu (generalisationSimple)");
      return <LigneTermes termes={formatTermesFormulesGeneralisationSimpleA(exercice)} />;
    case "intersectionSimple":
      if (exercice.scenario !== "A" || exercice.combo === "kInverseXAxCarre") throw new Error("reponseAttenduePhase : exercice inattendu (intersectionSimple)");
      return <Katex expression={formatTermeIntersectionSimpleA(exercice)} />;
    case "extremumSimple":
      if (exercice.scenario !== "A" || exercice.combo === "kInverseXAxCarre") throw new Error("reponseAttenduePhase : exercice inattendu (extremumSimple)");
      return <Katex expression={formatTermeExtremumSimpleA(exercice)} />;
    case "systeme":
      if (exercice.scenario !== "B") throw new Error("reponseAttenduePhase : exercice inattendu (systeme)");
      return <LigneTermes termes={formatTermesSystemeBLatex(exercice)} />;
    case "resolution":
      if (exercice.scenario !== "B") throw new Error("reponseAttenduePhase : exercice inattendu (resolution)");
      return <Katex expression={formatTermeABLatex(exercice.aArrondiAttendu, exercice.bArrondiAttendu)} />;
    case "formule": {
      if (exercice.scenario !== "B") throw new Error("reponseAttenduePhase : exercice inattendu (formule)");
      const aRetenu = nouvelEtat.aRetenu as number;
      const bRetenu = nouvelEtat.bRetenu as number;
      return <Katex expression={formatTermeFormuleBLatex(aRetenu, bRetenu, exercice.modele)} />;
    }
    case "evaluation": {
      if (exercice.scenario !== "B") throw new Error("reponseAttenduePhase : exercice inattendu (evaluation)");
      const aRetenu = nouvelEtat.aRetenu as number;
      const bRetenu = nouvelEtat.bRetenu as number;
      return <LigneTermes termes={formatTermesEvaluationBLatex(exercice, aRetenu, bRetenu)} />;
    }
    case "lecture":
      if (exercice.scenario !== "C") throw new Error("reponseAttenduePhase : exercice inattendu (lecture)");
      return <LigneTermes termes={formatTermesLectureC(exercice)} />;
    case "coutMoyen":
      if (exercice.scenario !== "C") throw new Error("reponseAttenduePhase : exercice inattendu (coutMoyen)");
      return <Katex expression={formatTermeCoutMoyenC(exercice)} />;
    case "reconnaissance":
      if (exercice.scenario !== "C") throw new Error("reponseAttenduePhase : exercice inattendu (reconnaissance)");
      return <LigneTermes termes={formatTermesReconnaissanceC(exercice)} />;
    case "benefice":
      if (exercice.scenario !== "C") throw new Error("reponseAttenduePhase : exercice inattendu (benefice)");
      return <Katex expression={formatTermeBeneficeC(exercice)} />;
    case "seuil":
      if (exercice.scenario !== "C") throw new Error("reponseAttenduePhase : exercice inattendu (seuil)");
      return <Katex expression={formatTermeSeuilC(exercice)} />;
  }
}

/** Séquence RÉELLE de phases pour l'exercice en cours — 4 formes possibles selon
 * `scenario`/`combo` (voir `PhaseProblemeContexte`, `moteur5e/typesProblemesContexte.ts`), jamais
 * un unique `ORDRE_PHASES` fixe comme le gabarit 4e : scénario A/combo de référence (5 écrans),
 * scénario A/combos réduits (3 écrans), scénario B (4 écrans), scénario C (5 écrans) — même
 * principe que les 2 variantes d'`AppRelationVectorielle.tsx` (4e). */
const ORDRE_PHASES_A_CONTENEUR: PhaseProblemeContexte[] = ["tableau", "generalisation", "egaliteAires", "graphique", "justification"];
const ORDRE_PHASES_A_REDUIT: PhaseProblemeContexte[] = ["generalisationSimple", "intersectionSimple", "extremumSimple"];
const ORDRE_PHASES_B: PhaseProblemeContexte[] = ["systeme", "resolution", "formule", "evaluation"];
const ORDRE_PHASES_C: PhaseProblemeContexte[] = ["lecture", "coutMoyen", "reconnaissance", "benefice", "seuil"];

function ordrePhasesPourExercice(exercice: ExerciceProblemeContexte): PhaseProblemeContexte[] {
  if (exercice.scenario === "A") return exercice.combo === "kInverseXAxCarre" ? ORDRE_PHASES_A_CONTENEUR : ORDRE_PHASES_A_REDUIT;
  if (exercice.scenario === "B") return ORDRE_PHASES_B;
  return ORDRE_PHASES_C;
}

/** Score de la phase `phase` pour l'exercice en cours, `null` si pas encore close — les 4 phases
 * TERMINALES (`justification`/`extremumSimple`/`evaluation`/`seuil`) n'ont pas de champ
 * `scoreXxxExercice` dédié à la racine de `EtatSessionProblemeContexte` (seulement dans
 * `resultats`, une fois l'exercice ENTIER clos) : tant que l'exercice est en cours, elles ne sont
 * donc jamais "closes" au sens de cette fonction (`null`), ce qui est correct puisqu'une phase
 * terminale est forcément la phase COURANTE jusqu'à la fin de l'exercice. */
function scoreDeLaPhaseExercice(etat: EtatSessionProblemeContexte, phase: PhaseProblemeContexte): number | null {
  switch (phase) {
    case "tableau":
      return etat.scoreTableauExercice;
    case "generalisation":
      return etat.scoreGeneralisationExercice;
    case "egaliteAires":
      return etat.scoreEgaliteAiresExercice;
    case "graphique":
      return etat.scoreGraphiqueExercice;
    case "generalisationSimple":
      return etat.scoreGeneralisationSimpleExercice;
    case "intersectionSimple":
      return etat.scoreIntersectionSimpleExercice;
    case "systeme":
      return etat.scoreSystemeExercice;
    case "resolution":
      return etat.scoreResolutionExercice;
    case "formule":
      return etat.scoreFormuleExercice;
    case "lecture":
      return etat.scoreLectureExercice;
    case "coutMoyen":
      return etat.scoreCoutMoyenExercice;
    case "reconnaissance":
      return etat.scoreReconnaissanceExercice;
    case "benefice":
      return etat.scoreBeneficeExercice;
    case "justification":
    case "extremumSimple":
    case "evaluation":
    case "seuil":
      return null;
  }
}

/** Même ternaire que `releveDeLaPhase` (ci-dessus) pour lire le booléen `xxxRevele` FIXE de la
 * phase — jamais pour une phase terminale (toujours `false`, lue seulement via `scoreDeLaPhaseExercice`
 * ci-dessus qui renvoie déjà `null` pour elles, donc jamais appelée en pratique). */
function phaseExerciceRevelee(etat: EtatSessionProblemeContexte, phase: PhaseProblemeContexte): boolean {
  switch (phase) {
    case "tableau":
      return etat.tableauRevele;
    case "generalisation":
      return etat.generalisationRevele;
    case "egaliteAires":
      return etat.egaliteAiresRevele;
    case "graphique":
      return etat.graphiqueRevele;
    case "generalisationSimple":
      return etat.generalisationSimpleRevele;
    case "intersectionSimple":
      return etat.intersectionSimpleRevele;
    case "systeme":
      return etat.systemeRevele;
    case "resolution":
      return etat.resolutionRevele;
    case "formule":
      return etat.formuleRevele;
    case "lecture":
      return etat.lectureRevele;
    case "coutMoyen":
      return etat.coutMoyenRevele;
    case "reconnaissance":
      return etat.reconnaissanceRevele;
    case "benefice":
      return etat.beneficeRevele;
    default:
      return false;
  }
}

function calculerSegmentsProgression(
  etat: EtatSessionProblemeContexte,
  aideUtiliseeParPhase: Partial<Record<string, boolean>>,
): EtatPuceProgression[] {
  return ordrePhasesPourExercice(etat.exerciceCourant).map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = scoreDeLaPhaseExercice(etat, phase);
    if (score === null) return "a-venir";
    if (phaseExerciceRevelee(etat, phase)) return "revele";
    return aideUtiliseeParPhase[phase] ? "aide" : "correcte";
  });
}

/** Même libellé que `calculerRecapitulatifProblemeContexte` (ui5e/recapitulatifProblemesContexte.ts)
 * pour chaque phase qu'il couvre déjà — jamais un second vocabulaire. Les 4 phases TERMINALES
 * (jamais couvertes par ce récap, voir sa tête de fichier) ont un libellé propre ici, mais ne sont
 * de toute façon JAMAIS poussées dans l'historique (voir `terminerEtape`, ci-dessous) : leur puce
 * reste "courante" tant que `enAttente` est actif, puis l'exercice entier redémarre à zéro. */
const LIBELLE_PHASE: Record<PhaseProblemeContexte, string> = {
  tableau: "Tableau (r, h, aires)",
  generalisation: "Généralisation (h, f, g)",
  egaliteAires: "Égalité des aires",
  graphique: "Rayon optimal (lecture graphique)",
  justification: "Justification",
  generalisationSimple: "Généralisation (f, g)",
  intersectionSimple: "Intersection",
  extremumSimple: "Extremum",
  systeme: "Système (2 équations)",
  resolution: "Résolution (a, b)",
  formule: "Formule f(x)",
  evaluation: "Évaluation",
  lecture: "Lecture graphique (CF, CV, CP, CT)",
  coutMoyen: "Coût moyen",
  reconnaissance: "Reconnaissance CV(x)/CP(x)",
  benefice: "Bénéfice",
  seuil: "Seuil",
};

// ============================================================================
// Formatage de "votreReponse" (fiche de consultation) — un format court par type d'écran, même
// structure que les libellés ci-dessus.
// ============================================================================

function formatReponseTableauATexte(r: ReponseTableauA): string {
  return r.map((ligne, i) => `ligne ${i + 1} : h=${ligne.h} ; aire bases=${ligne.aireBases} ; aire latérale=${ligne.aireLaterale}`).join(" / ");
}

function formatReponseGeneralisationATexte(r: ReponseGeneralisationA): string {
  return `h=${r.h} ; f=${r.f} ; g=${r.g}`;
}

function formatReponseGeneralisationSimpleATexte(r: ReponseGeneralisationSimpleA): string {
  return `f=${r.f} ; g=${r.g}`;
}

function formatReponseSystemeBTexte(r: ReponseSystemeB): string {
  return `${r.equation1} ; ${r.equation2}`;
}

function formatReponseResolutionBTexte(r: ReponseResolutionB): string {
  return `a=${r.a} ; b=${r.b}`;
}

function formatReponseLectureCTexte(r: ReponseLectureC): string {
  return `CF=${r.cf} ; CV=${r.cv} ; CP=${r.cp} ; CT=${r.ct}`;
}

function formatReponseReconnaissanceCTexte(r: ReponseReconnaissanceC): string {
  return `CV=${r.cv} ; CP=${r.cp}`;
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionProblemeContexte;
  revele: boolean;
}

export function App5gen5() {
  const [etat, setEtat] = useState<EtatSessionProblemeContexte>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionProblemeContexte`, jamais dans le moteur (même principe que
   * `AppAnalyseFonction.tsx`, 4e). Remis à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<string, boolean>>>({});

  /** Réutilise `releveDeLaPhase`/`reponseAttenduePhase` — EXACTEMENT la même source que la bannière
   * `validation` ci-dessous pour l'écran COURANT revélé (jamais une valeur recalculée séparément). */
  function ajouterHistorique(votreReponse: ReactNode, phaseClose: PhaseProblemeContexte, nouvelEtat: EtatSessionProblemeContexte) {
    const revele = releveDeLaPhase(phaseClose, nouvelEtat);
    setHistorique((h) => [
      ...h,
      {
        titre: LIBELLE_PHASE[phaseClose],
        votreReponse,
        correcte: !revele,
        reponseAttendue: revele ? reponseAttenduePhase(nouvelEtat.exerciceCourant, phaseClose, nouvelEtat) : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT poussée dans l'historique quand l'écran se clôt RÉELLEMENT (même
   * garde `transitionDEcran` que celui qui déclenche déjà `setEnAttente`), et JAMAIS pour la phase
   * TERMINALE de l'exercice en cours (`justification`/`extremumSimple`/`evaluation`/`seuil` selon le
   * scénario — jamais "précédente" dans `calculerRecapitulatifProblemeContexte` non plus, voir sa
   * tête de fichier) : détecté dynamiquement via `nouvelEtat.resultats.length >
   * etat.resultats.length` plutôt que par le nom d'une phase fixe, puisque la phase terminale varie
   * selon le scénario/combo (A/B/C). */
  function terminerEtape(nouvelEtat: EtatSessionProblemeContexte, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      const exerciceTermine = nouvelEtat.resultats.length > etat.resultats.length;
      if (!exerciceTermine && votreReponse !== undefined) {
        ajouterHistorique(votreReponse, etat.phase, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: releveDeLaPhase(etat.phase, nouvelEtat) });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeParPhase({});
      setFicheOuverteIndex(null);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionProblemeContexte(REGLAGES_DEMO, GENERATEURS_SCENARIO[id]));
  }

  const exercice = etat.exerciceCourant;
  const niveauAideMax = niveauAideMaxPhase(etat.phase);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(exercice, etat.phase, enAttente.etatSuivant),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Problèmes-contexte</h1>
        <ProgressionPuces
          segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />
      </header>
      <SelecteurVarianteDev options={OPTIONS_SCENARIO} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifProblemeContexte(etat)} />
          {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "tableau" && (
            <EtapeTableauA
              exercice={exercice}
              donnees={<div className="equation-box">{consigneVolumeA(exercice)}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseTableauA(etat, r), formatReponseTableauATexte(r))}
              validation={validation}
            />
          )}
          {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "tableau" && <CalculatriceScientifique />}
          {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "generalisation" && (
            <EtapeGeneralisationA
              exercice={exercice}
              donnees={<div className="equation-box">{consigneVolumeA(exercice)}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseGeneralisationA(etat, r), formatReponseGeneralisationATexte(r))}
              validation={validation}
            />
          )}
          {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "egaliteAires" && (
            <EtapeEgaliteAiresA
              exercice={exercice}
              donnees={<div className="equation-box">{consigneVolumeA(exercice)}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseEgaliteAiresA(etat, r), `x = ${r}`)}
              validation={validation}
            />
          )}
          {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "egaliteAires" && <CalculatriceScientifique />}
          {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "graphique" && (
            <EtapeGraphiqueA
              exercice={exercice}
              donnees={<div className="equation-box">{consigneVolumeA(exercice)}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseGraphiqueA(etat, r), `x ≈ ${r}`)}
              validation={validation}
            />
          )}
          {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "justification" && etat.xOptimalRetenu !== null && (
            <EtapeJustificationA
              exercice={exercice}
              donnees={<div className="equation-box">{consigneVolumeA(exercice)}</div>}
              xOptimalRetenu={etat.xOptimalRetenu}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseJustificationA(etat, r))}
              validation={validation}
            />
          )}
          {exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre" && etat.phase === "justification" && etat.xOptimalRetenu !== null && (
            <CalculatriceScientifique />
          )}

          {exercice.scenario === "A" && exercice.combo !== "kInverseXAxCarre" && etat.phase === "generalisationSimple" && (
            <EtapeGeneralisationSimpleA
              exercice={exercice}
              donnees={<div className="equation-box">{consigneContexteAReduit(exercice)}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseGeneralisationSimpleA(etat, r), formatReponseGeneralisationSimpleATexte(r))}
              validation={validation}
            />
          )}
          {exercice.scenario === "A" && exercice.combo !== "kInverseXAxCarre" && etat.phase === "intersectionSimple" && (
            <EtapeIntersectionSimpleA
              exercice={exercice}
              donnees={<div className="equation-box">{consigneContexteAReduit(exercice)}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseIntersectionSimpleA(etat, r), `x = ${r}`)}
              validation={validation}
            />
          )}
          {exercice.scenario === "A" && exercice.combo !== "kInverseXAxCarre" && etat.phase === "intersectionSimple" && <CalculatriceScientifique />}
          {exercice.scenario === "A" && exercice.combo !== "kInverseXAxCarre" && etat.phase === "extremumSimple" && (
            <EtapeExtremumSimpleA
              exercice={exercice}
              donnees={<div className="equation-box">{consigneContexteAReduit(exercice)}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseExtremumSimpleA(etat, r))}
              validation={validation}
            />
          )}

          {exercice.scenario === "B" && etat.phase === "systeme" && (
            <EtapeSystemeB
              exercice={exercice}
              donnees={<BlocContexteB exercice={exercice} />}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseSystemeB(etat, r), formatReponseSystemeBTexte(r))}
              validation={validation}
            />
          )}
          {exercice.scenario === "B" && etat.phase === "resolution" && (
            <EtapeResolutionB
              exercice={exercice}
              donnees={<BlocContexteB exercice={exercice} />}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseResolutionB(etat, r), formatReponseResolutionBTexte(r))}
              validation={validation}
            />
          )}
          {exercice.scenario === "B" && etat.phase === "resolution" && <CalculatriceScientifique />}
          {exercice.scenario === "B" && etat.phase === "formule" && etat.aRetenu !== null && etat.bRetenu !== null && (
            <EtapeFormuleB
              exercice={exercice}
              donnees={<BlocContexteB exercice={exercice} />}
              aRetenu={etat.aRetenu}
              bRetenu={etat.bRetenu}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseFormuleB(etat, r), `f(x) = ${r}`)}
              validation={validation}
            />
          )}
          {exercice.scenario === "B" && etat.phase === "evaluation" && etat.aRetenu !== null && etat.bRetenu !== null && (
            <EtapeEvaluationB
              exercice={exercice}
              donnees={<BlocContexteB exercice={exercice} />}
              aRetenu={etat.aRetenu}
              bRetenu={etat.bRetenu}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseEvaluationB(etat, r))}
              validation={validation}
            />
          )}

          {exercice.scenario === "C" && etat.phase === "lecture" && (
            <EtapeLectureC
              exercice={exercice}
              donnees={<div className="equation-box">{consigneContexteC()}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseLectureC(etat, r), formatReponseLectureCTexte(r))}
              validation={validation}
            />
          )}
          {exercice.scenario === "C" && etat.phase === "lecture" && exercice.formeCV !== "racineCarree" && <CalculatriceScientifique />}
          {exercice.scenario === "C" && etat.phase === "coutMoyen" && (
            <EtapeCoutMoyenC
              exercice={exercice}
              donnees={<div className="equation-box">{consigneContexteC()}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseCoutMoyenC(etat, r), `Cm = ${r}`)}
              validation={validation}
            />
          )}
          {exercice.scenario === "C" && etat.phase === "coutMoyen" && <CalculatriceScientifique />}
          {exercice.scenario === "C" && etat.phase === "reconnaissance" && (
            <EtapeReconnaissanceC
              exercice={exercice}
              donnees={<div className="equation-box">{consigneContexteC()}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseReconnaissanceC(etat, r), formatReponseReconnaissanceCTexte(r))}
              validation={validation}
            />
          )}
          {exercice.scenario === "C" && etat.phase === "benefice" && (
            <EtapeBeneficeC
              exercice={exercice}
              donnees={<div className="equation-box">{consigneContexteC()}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseBeneficeC(etat, r), `B = ${r}`)}
              validation={validation}
            />
          )}
          {exercice.scenario === "C" && etat.phase === "benefice" && (exercice.formeCV !== "racineCarree" || exercice.formeCA !== "affine") && (
            <CalculatriceScientifique />
          )}
          {exercice.scenario === "C" && etat.phase === "seuil" && (
            <EtapeSeuilC
              exercice={exercice}
              donnees={<div className="equation-box">{consigneContexteC()}</div>}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseSeuilC(etat, r))}
              validation={validation}
            />
          )}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
