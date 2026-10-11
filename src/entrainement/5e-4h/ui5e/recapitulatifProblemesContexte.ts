import type { ExerciceScenarioA } from "../core5e/problemesContexte.types";
import type { EtatSessionProblemeContexte } from "../moteur5e/typesProblemesContexte";
import type { EntreeRecapitulatif } from "./recapitulatif";
import {
  formatTermeABLatex,
  formatTermeBeneficeC,
  formatTermeCoutMoyenC,
  formatTermeFormuleBLatex,
  formatTermeIntersectionSimpleA,
  formatTermeXEgaliteAiresA,
  formatTermesFormulesGeneralisationA,
  formatTermesFormulesGeneralisationSimpleA,
  formatTermesLectureC,
  formatTermesReconnaissanceC,
  formatTermesSystemeBLatex,
  formatTermesTableauA,
} from "./formatProblemesContexte";

/** Même alias privé que `ui5e/formatProblemesContexte.ts::ExerciceScenarioAReduit` (non exporté) —
 * dupliqué ici pour la même raison que dans les autres cibles de cette tâche. */
type ExerciceScenarioAReduit = Exclude<ExerciceScenarioA, { combo: "kInverseXAxCarre" }>;

/** Même formule que la fonction privée `arrondi` de `ui5e/formatProblemesContexte.ts`. */
function arrondi(valeur: number, decimales = 0): number {
  const facteur = 10 ** decimales;
  return Math.round(valeur * facteur) / facteur;
}

function entreeUnique(libelle: string, valeur: string, revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex: true, valeur, revele };
}

function entreeMultiple(libelle: string, valeurs: string[], revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
}

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours, pour le scénario (A/B/C,
 * + combo pour A) réellement en cours de CET exercice — reprend les mêmes valeurs que l'ancien bloc
 * "état actuel" maison (`EtatActuelA`/`EtatActuelB`/`EtatActuelC`, dupliqués dans chacun des ~15
 * `Etape*.tsx` de ce générateur, alimentés par
 * `formatTermesEtatActuelA`/`AReduit`/`B`/`C`, `ui5e/formatProblemesContexte.ts`), seulement
 * reformaté en une entrée par écran (libellé + icône ✓/✗, via les booléens `xxxRevele` FIXES —
 * `moteur5e/typesProblemesContexte.ts`) plutôt qu'un flux unique de fragments KaTeX sans label.
 * `xOptimalRetenu`/`aRetenu`/`bRetenu` (continuité) sont lus directement sur `etat`, jamais
 * recalculés. "Close" = `scoreXxxExercice !== null` (même convention que `AppAnalyseFonction.tsx`,
 * 4e), jamais une comparaison de `etat.phase`.
 *
 * NOTE D'ARCHITECTURE (à signaler) : contrairement aux autres cibles de cette tâche, les ~15
 * `Etape*.tsx` de ce générateur calculent et affichent CHACUN leur propre bloc "état actuel" en
 * interne (jamais une prop reçue depuis `App5gen5.tsx`) — remplacer leur appel local aurait exigé
 * de modifier ces ~15 fichiers, hors du périmètre autorisé pour cette tâche (seulement
 * `App5gen5.tsx` + ce nouveau fichier). `RecapitulatifPanel` est donc ajouté EN PLUS, juste avant
 * l'écran en cours, sans retirer les anciens blocs `etat-actuel-box` existants (qui continuent de
 * s'afficher à l'intérieur de chaque écran, inchangés).
 */
export function calculerRecapitulatifProblemeContexte(etat: EtatSessionProblemeContexte): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (exercice.scenario === "A" && exercice.combo === "kInverseXAxCarre") {
    if (etat.scoreTableauExercice !== null) {
      entrees.push(entreeMultiple("Tableau (r, h, aires)", formatTermesTableauA(exercice), etat.tableauRevele));
    }
    if (etat.scoreGeneralisationExercice !== null) {
      entrees.push(entreeMultiple("Généralisation (h, f, g)", formatTermesFormulesGeneralisationA(), etat.generalisationRevele));
    }
    if (etat.scoreEgaliteAiresExercice !== null) {
      entrees.push(entreeUnique("Égalité des aires", formatTermeXEgaliteAiresA(exercice), etat.egaliteAiresRevele));
    }
    if (etat.scoreGraphiqueExercice !== null && etat.xOptimalRetenu !== null) {
      entrees.push(
        entreeUnique("Rayon optimal (lecture graphique)", `x\\approx${arrondi(etat.xOptimalRetenu)} \\ \\text{(rayon optimal retenu)}`, etat.graphiqueRevele),
      );
    }
  } else if (exercice.scenario === "A") {
    const exerciceReduit = exercice as ExerciceScenarioAReduit;
    if (etat.scoreGeneralisationSimpleExercice !== null) {
      entrees.push(entreeMultiple("Généralisation (f, g)", formatTermesFormulesGeneralisationSimpleA(exerciceReduit), etat.generalisationSimpleRevele));
    }
    if (etat.scoreIntersectionSimpleExercice !== null) {
      entrees.push(entreeUnique("Intersection", formatTermeIntersectionSimpleA(exerciceReduit), etat.intersectionSimpleRevele));
    }
  } else if (exercice.scenario === "B") {
    if (etat.scoreSystemeExercice !== null) {
      entrees.push(entreeMultiple("Système (2 équations)", formatTermesSystemeBLatex(exercice), etat.systemeRevele));
    }
    if (etat.scoreResolutionExercice !== null && etat.aRetenu !== null && etat.bRetenu !== null) {
      entrees.push(entreeUnique("Résolution (a, b)", formatTermeABLatex(etat.aRetenu, etat.bRetenu), etat.resolutionRevele));
    }
    if (etat.scoreFormuleExercice !== null && etat.aRetenu !== null && etat.bRetenu !== null) {
      entrees.push(entreeUnique("Formule f(x)", formatTermeFormuleBLatex(etat.aRetenu, etat.bRetenu, exercice.modele), etat.formuleRevele));
    }
  } else {
    if (etat.scoreLectureExercice !== null) {
      entrees.push(entreeMultiple("Lecture graphique (CF, CV, CP, CT)", formatTermesLectureC(exercice), etat.lectureRevele));
    }
    if (etat.scoreCoutMoyenExercice !== null) {
      entrees.push(entreeUnique("Coût moyen", formatTermeCoutMoyenC(exercice), etat.coutMoyenRevele));
    }
    if (etat.scoreReconnaissanceExercice !== null) {
      entrees.push(entreeMultiple("Reconnaissance CV(x)/CP(x)", formatTermesReconnaissanceC(exercice), etat.reconnaissanceRevele));
    }
    if (etat.scoreBeneficeExercice !== null) {
      entrees.push(entreeUnique("Bénéfice", formatTermeBeneficeC(exercice), etat.beneficeRevele));
    }
  }
  return entrees;
}
