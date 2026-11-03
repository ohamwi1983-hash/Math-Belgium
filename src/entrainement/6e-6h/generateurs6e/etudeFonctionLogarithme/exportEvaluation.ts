import type { ExerciceEtudeFonctionLogarithme, ExerciceEtudeLogC } from "../../core6e/etudeFonctionLogarithme.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { construireSvgFonction } from "../../../export/svgGraph";
import {
  aideConcaviteNiveau2,
  aideCroissanceNiveau2,
  calculerViewBox,
  consigneAsymptotes,
  consigneConcavite,
  consigneCroissance,
  consigneDomaine,
  consigneGraphique,
  consigneLimites,
  contenuRecapLatex,
  evaluerCandidat,
  formatFonctionLatex,
  intervallesGrilleCLatex,
  LIBELLE_PHASE_ETUDE_LOG,
} from "../../ui6e/formatEtudeFonctionLogarithme";
import type { PhaseEtudeFonctionLogarithme } from "../../moteur6e/typesEtudeFonctionLogarithme";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeFonctionLogarithme } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudeFonctionLogarithme>` pour `6gen21` (Étudier
 * une fonction — synthèse, logarithmes) — feuille d'évaluation. Une question par écran interactif
 * (6 pour les 5 familles) ; chaque réponse du corrigé vient de `contenuRecapLatex`, la même
 * fonction que la réponse révélée et le récapitulatif de l'appli. Le corrigé de la croissance et
 * de la concavité donne aussi la dérivée utilisée (démarche), jamais seulement la conclusion.
 *
 * Famille C, écran "croissance" : vrai tableau de signe à 4 colonnes (`type: "tableau"`).
 */

const LETTRES_GRAPHIQUE = "ABCD";

function construireGrilleSvgCandidats(exercice: ExerciceEtudeFonctionLogarithme, indexCorrectAAfficher?: number): string {
  const viewBox = calculerViewBox(exercice);
  const svgs = exercice.candidats
    .map((_, i) =>
      construireSvgFonction((x) => evaluerCandidat(exercice, i, x), viewBox, {
        lettre: LETTRES_GRAPHIQUE[i] ?? String(i + 1),
        estCorrect: indexCorrectAAfficher === i,
      }),
    )
    .join("");
  return `<div class="grille-graphes-cyclo">${svgs}</div>`;
}

function paragrapheReponse(exercice: ExerciceEtudeFonctionLogarithme, phase: PhaseEtudeFonctionLogarithme): BlocCorrection {
  return { type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG[phase]} : `), latex(contenuRecapLatex(exercice, phase))] };
}

function paragrapheDemarche(fragmentsTexte: string, expression: string | null): BlocCorrection[] {
  if (expression === null) return [];
  return [{ type: "paragraphe", fragments: [texte(`${fragmentsTexte} `), latex(expression)] }];
}

/** Corrigé de l'écran "croissance", famille C — tableau de variation à 4 intervalles. */
function construireCorrectionCroissanceGrilleC(exercice: ExerciceEtudeLogC): BlocCorrection[] {
  const labelsIntervalles = intervallesGrilleCLatex(exercice).map((l) => l.replace(/\\,/g, " ").replace(/\\infty/g, "∞"));
  const labelsVariation = exercice.croissance.signes.map((s) => (s === "croissante" ? "Croissante" : "Décroissante"));
  return [
    { type: "tableau", libellesLignes: ["Intervalle", "Variation de f"], valeursParLigne: [labelsIntervalles, labelsVariation] },
    paragrapheReponse(exercice, "croissance"),
  ];
}

function construireEnonceEtudeFonctionLogarithme(exercice: ExerciceEtudeFonctionLogarithme): SectionExercice {
  const enteteFragments: FragmentConsigne[] = [texte("On considère la fonction suivante : "), latex(formatFonctionLatex(exercice))];
  const questions: QuestionExercice[] = [
    { consigne: consigneDomaine(exercice), reponse: { type: "lignes", nombre: 2 } },
    { consigne: consigneLimites(exercice), reponse: { type: "lignes", nombre: exercice.famille === "C" ? 6 : 2 } },
    { consigne: consigneAsymptotes(exercice), reponse: { type: "lignes", nombre: 2 } },
    exercice.famille === "C"
      ? { consigne: consigneCroissance(exercice), reponse: { type: "tableau", libellesLignes: ["Intervalle", "Variation de f"], nombreColonnes: 4 } }
      : { consigne: consigneCroissance(exercice), reponse: { type: "lignes", nombre: 3 } },
    { consigne: consigneConcavite(), reponse: { type: "lignes", nombre: 3 } },
    { consigne: consigneGraphique(), reponse: { type: "lignes", nombre: 1 } },
  ];
  return { enteteFragments, enteteHtml: construireGrilleSvgCandidats(exercice), questions };
}

function construireCorrectionEtudeFonctionLogarithme(exercice: ExerciceEtudeFonctionLogarithme): BlocCorrection[] {
  const blocs: BlocCorrection[] = [paragrapheReponse(exercice, "domaine"), paragrapheReponse(exercice, "limites"), paragrapheReponse(exercice, "asymptotes")];

  const derivee = aideCroissanceNiveau2(exercice);
  if (exercice.famille === "C") {
    blocs.push(...construireCorrectionCroissanceGrilleC(exercice));
  } else {
    blocs.push(...paragrapheDemarche("Démarche :", derivee.latex), paragrapheReponse(exercice, "croissance"));
  }

  blocs.push(...paragrapheDemarche("Démarche :", aideConcaviteNiveau2(exercice).latex), paragrapheReponse(exercice, "concavite"));

  const lettreCorrecte = LETTRES_GRAPHIQUE[exercice.indexCorrect] ?? String(exercice.indexCorrect + 1);
  blocs.push({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG.graphique} : le graphique ${lettreCorrecte}.`)] });
  blocs.push({ type: "html", html: construireGrilleSvgCandidats(exercice, exercice.indexCorrect) });

  return blocs;
}

export const adaptateurEvaluationEtudeFonctionLogarithme: AdaptateurFeuilleExercices<ExerciceEtudeFonctionLogarithme> = {
  titreDocument: "Étudier une fonction (synthèse, logarithmes) — Évaluation",
  nomFichierBase: "etude-fonction-logarithme",
  genererInstance: genererExerciceEtudeFonctionLogarithme,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceEtudeFonctionLogarithme,
  construireCorrection: construireCorrectionEtudeFonctionLogarithme,
};
