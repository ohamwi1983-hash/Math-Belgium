import type { ExerciceEtudeFonctionExponentielle } from "../../core6e/etudeFonctionExponentielle.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { construireGrilleSvgCandidatsEtudeExpo } from "../../export6e/svgGraphEtudeExpo";
import type { PhaseEtudeFonctionExponentielle } from "../../moteur6e/typesEtudeFonctionExponentielle";
import {
  calculerViewBox,
  consigneAsymptotes,
  consigneAsymptotesB,
  consigneConcavite,
  consigneCroissance,
  consigneDomaine,
  consigneGraphique,
  consigneLimites,
  contenuRecapPhase,
  formatFonctionLatex,
  LIBELLE_PHASE_ETUDE,
} from "../../ui6e/formatEtudeFonctionExponentielle";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeFonctionExponentielle } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudeFonctionExponentielle>` pour `6gen11` (Étude
 * complète d'une fonction exponentielle) — feuille d'évaluation.
 *
 * Condense les 6 écrans guidés côté interactif (domaine, limites, asymptotes, croissance,
 * concavité, graphique — séquence FIXE, identique pour les 4 familles, voir
 * `moteur6e/typesEtudeFonctionExponentielle.ts`) en 6 questions écrites. Le corrigé de chaque
 * sous-question lit la réponse déjà établie via `contenuRecapPhase` — la MÊME fonction qui
 * alimente déjà le récapitulatif final interactif, jamais recalculée indépendamment ici. Famille B
 * seule a une consigne d'asymptotes dédiée (`consigneAsymptotesB`, point exclu asymétrique) —
 * toutes les autres familles utilisent `consigneAsymptotes`.
 *
 * QCM graphique réel (4 candidats tracés en `<svg>` statique, `export/svgGraphEtudeExpo.ts`), même
 * principe que `graphiquesCyclometriques` (6gen5) et `graphiquesDeriveeExponentielles` (6gen8) —
 * jamais réduit à une question textuelle.
 */

const PHASES_ECRITES: PhaseEtudeFonctionExponentielle[] = ["domaine", "limites", "asymptotes", "croissance", "concavite"];

function fragmentsContenuRecap(exercice: ExerciceEtudeFonctionExponentielle, phase: PhaseEtudeFonctionExponentielle): FragmentConsigne[] {
  const { texte: texteReponse, latex: latexReponse } = contenuRecapPhase(exercice, phase);
  if (latexReponse !== null) return texteReponse !== null ? [texte(`${texteReponse} : `), latex(latexReponse)] : [latex(latexReponse)];
  return [texte(texteReponse ?? "")];
}

function consigneEcrite(exercice: ExerciceEtudeFonctionExponentielle, phase: PhaseEtudeFonctionExponentielle): string {
  switch (phase) {
    case "domaine":
      return consigneDomaine();
    case "limites":
      return consigneLimites(exercice);
    case "asymptotes":
      return exercice.famille === "B" ? consigneAsymptotesB() : consigneAsymptotes(exercice);
    case "croissance":
      return consigneCroissance();
    case "concavite":
      return consigneConcavite();
    case "graphique":
      return consigneGraphique();
  }
}

function construireEnonceEtudeFonctionExponentielle(exercice: ExerciceEtudeFonctionExponentielle): SectionExercice {
  const viewBox = calculerViewBox(exercice);
  const questionsEcrites = PHASES_ECRITES.map((phase) => ({
    consigne: [texte(consigneEcrite(exercice, phase))],
    reponse: { type: "lignes" as const, nombre: 3 },
  }));
  return {
    enteteFragments: [texte("On considère la fonction suivante :"), latex(formatFonctionLatex(exercice))],
    enteteHtml: construireGrilleSvgCandidatsEtudeExpo(exercice, viewBox),
    questions: [...questionsEcrites, { consigne: [texte(consigneGraphique())], reponse: { type: "lignes", nombre: 1 } }],
  };
}

function construireCorrectionEtudeFonctionExponentielle(exercice: ExerciceEtudeFonctionExponentielle): BlocCorrection[] {
  const viewBox = calculerViewBox(exercice);
  const blocsEcrits: BlocCorrection[] = PHASES_ECRITES.map((phase) => ({
    type: "paragraphe",
    fragments: [texte(`${LIBELLE_PHASE_ETUDE[phase]} : `), ...fragmentsContenuRecap(exercice, phase)],
  }));
  const lettreCorrecte = "ABCD"[exercice.indexCorrect] ?? String(exercice.indexCorrect + 1);
  return [
    ...blocsEcrits,
    { type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE.graphique} : le graphique ${lettreCorrecte}.`)] },
    { type: "html", html: construireGrilleSvgCandidatsEtudeExpo(exercice, viewBox, exercice.indexCorrect) },
  ];
}

export const adaptateurEvaluationEtudeFonctionExponentielle: AdaptateurFeuilleExercices<ExerciceEtudeFonctionExponentielle> = {
  titreDocument: "Étude complète d'une fonction exponentielle — Évaluation",
  nomFichierBase: "etude-fonction-exponentielle",
  genererInstance: genererExerciceEtudeFonctionExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceEtudeFonctionExponentielle,
  construireCorrection: construireCorrectionEtudeFonctionExponentielle,
};
