import type { ExerciceGraphiqueDeriveeLogarithme } from "../../core6e/graphiqueDeriveeLogarithme.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EtapeAmenagee,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction } from "../../../export/svgGraph";
import {
  calculerViewBoxFonction,
  calculerViewBoxGraphique,
  evaluerCandidat,
  evaluerFonction,
  formatDeriveeCorrecteLatex,
  formatFonctionLatex,
  type ViewBoxGraphiqueDeriveeLogarithme,
} from "../../ui6e/formatGraphiqueDeriveeLogarithme";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiqueDeriveeLogarithme } from "./index";

const LETTRES = "ABCD";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGraphiqueDeriveeLogarithme>` pour `6gen20`
 * (Graphique de la dérivée, fonctions logarithmes) — feuille d'évaluation, même patron que
 * `generateurs6e/graphiquesDeriveeExponentielles/exportEvaluation.ts` (6gen8) : QCM graphique réel
 * (`export/svgGraph.ts::construireSvgFonction`), grille lettrée A→D construite localement.
 *
 * Même ordre que l'appli : a) choisir le graphique de f' à partir du GRAPHIQUE de f (imprimé en
 * tête, couleur distincte), b) calculer f'(x) pour confirmer.
 */

const COULEUR_FONCTION = "#c2410c";

function construireSvgFonctionF(exercice: ExerciceGraphiqueDeriveeLogarithme): string {
  return `<div class="grille-graphes-cyclo">${construireSvgFonction((x) => evaluerFonction(exercice, x), calculerViewBoxFonction(exercice), { lettre: "f", couleurCourbe: COULEUR_FONCTION })}</div>`;
}

function construireGrilleSvgCandidats(exercice: ExerciceGraphiqueDeriveeLogarithme, viewBox: ViewBoxGraphiqueDeriveeLogarithme, indexCorrectAAfficher?: number): string {
  const svgs = exercice.candidats
    .map((_, i) =>
      construireSvgFonction((x) => evaluerCandidat(exercice, i, x), viewBox, {
        lettre: LETTRES[i] ?? String(i + 1),
        estCorrect: indexCorrectAAfficher === i,
      }),
    )
    .join("");
  return `<div class="grille-graphes-cyclo">${svgs}</div>`;
}

function construireEnonceGraphiqueDeriveeLogarithme(exercice: ExerciceGraphiqueDeriveeLogarithme): SectionExercice {
  const viewBox = calculerViewBoxGraphique(exercice);
  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatFonctionLatex(exercice)), texte(", dont le graphique est donné (f), et quatre graphiques A à D.")],
    enteteHtml: construireSvgFonctionF(exercice) + construireGrilleSvgCandidats(exercice, viewBox),
    questions: [
      { consigne: [texte("En lisant le graphique de f (variations, extremums, pentes), indique lequel des graphiques A à D représente f'(x). Justifie.")], reponse: { type: "lignes", nombre: 3 } },
      { consigne: [texte("Calcule f'(x) et vérifie qu'elle confirme ton choix.")], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireCorrectionGraphiqueDeriveeLogarithme(exercice: ExerciceGraphiqueDeriveeLogarithme): BlocCorrection[] {
  const viewBox = calculerViewBoxGraphique(exercice);
  const lettreCorrecte = LETTRES[exercice.indexCorrect] ?? String(exercice.indexCorrect + 1);
  return [
    { type: "paragraphe", fragments: [texte(`a) Réponse : le graphique ${lettreCorrecte}.`)] },
    { type: "html", html: construireGrilleSvgCandidats(exercice, viewBox, exercice.indexCorrect) },
    { type: "paragraphe", fragments: [texte("b) "), latex(formatDeriveeCorrecteLatex(exercice))] },
  ];
}

// ============================================================================
// Feuille d'exercices / évaluation enrichies — difficulté, réponse brève, corrigé détaillé, barème,
// version aménagée. Toutes les valeurs viennent de l'instance (mêmes fonctions que l'appli).
// ============================================================================

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** Abscisse exacte de l'extremum de f en LaTeX : e (famille A), e^{−(k+p)/k} (famille C). */
function abscisseExtremumLatex(exercice: ExerciceGraphiqueDeriveeLogarithme): string | null {
  if (exercice.famille === "A") return "e";
  if (exercice.famille === "B") return null;
  let num = -(exercice.k + exercice.p);
  let den = exercice.k;
  if (num === 0) return "1";
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = pgcd(num, den);
  num /= g;
  den /= g;
  const exposant = den === 1 ? `${num}` : `${num < 0 ? "-" : ""}\\frac{${Math.abs(num)}}{${den}}`;
  return `e^{${exposant}}`;
}

/** Nature de l'extremum de f, lue sur le signe de f' (A : f' du signe de k avant e ; C : f' du
 * signe de −k avant le zéro). */
function natureExtremum(exercice: ExerciceGraphiqueDeriveeLogarithme): "maximum" | "minimum" | null {
  if (exercice.famille === "A") return exercice.k > 0 ? "maximum" : "minimum";
  if (exercice.famille === "C") return exercice.k > 0 ? "minimum" : "maximum";
  return null;
}

function lettreCorrecte(exercice: ExerciceGraphiqueDeriveeLogarithme): string {
  return LETTRES[exercice.indexCorrect] ?? String(exercice.indexCorrect + 1);
}

function lectureGraphique(exercice: ExerciceGraphiqueDeriveeLogarithme): FragmentConsigne[] {
  const nature = natureExtremum(exercice);
  const xe = abscisseExtremumLatex(exercice);
  if (nature === null || xe === null) {
    return [texte(`f est ${exercice.k > 0 ? "croissante" : "décroissante"} sur ]0 ; +∞[ et n'a aucun extremum : f'(x) est ${exercice.k > 0 ? "positive" : "négative"} partout et ne s'annule jamais.`)];
  }
  const avant = nature === "maximum" ? "croissante" : "décroissante";
  const apres = nature === "maximum" ? "décroissante" : "croissante";
  return [
    texte(`f est ${avant}, puis ${apres}, avec un ${nature} en `),
    latex(`x = ${xe}`),
    texte(` : f'(x) est ${nature === "maximum" ? "positive puis négative" : "négative puis positive"} et s'annule en `),
    latex(`x = ${xe}`),
    texte("."),
  ];
}

const REGLE_DERIVATION: Record<ExerciceGraphiqueDeriveeLogarithme["famille"], { nom: string; formule: string }> = {
  A: { nom: "règle du quotient", formule: "\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}" },
  B: { nom: "règle du produit", formule: "(uv)'=u'v+uv'" },
  C: { nom: "règle du produit (pour x·ln(x))", formule: "(uv)'=u'v+uv'" },
};

function difficulteGraphiqueDeriveeLogarithme(exercice: ExerciceGraphiqueDeriveeLogarithme): 1 | 2 | 3 {
  return exercice.famille === "A" ? 3 : 2;
}

function reponseBreveGraphiqueDeriveeLogarithme(exercice: ExerciceGraphiqueDeriveeLogarithme): FragmentConsigne[] {
  return [texte(`a) graphique ${lettreCorrecte(exercice)} ; b) `), latex(formatDeriveeCorrecteLatex(exercice))];
}

function correctionDetailleeGraphiqueDeriveeLogarithme(exercice: ExerciceGraphiqueDeriveeLogarithme): EtapeCorrection[] {
  const regle = REGLE_DERIVATION[exercice.famille];
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("f croissante ⇔ f'(x) > 0 ; f décroissante ⇔ f'(x) < 0 ; en un extremum de f, f'(x) = 0.")] },
    { label: "Lecture", sousQuestion: "a", fragments: lectureGraphique(exercice) },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(`Seul le graphique ${lettreCorrecte(exercice)} a ces signes${abscisseExtremumLatex(exercice) === null ? "" : " et ce zéro"}.`)] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte(`On dérive avec la ${regle.nom} : `), latex(regle.formule)] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(formatDeriveeCorrecteLatex(exercice))] },
    { label: "Vérification", sousQuestion: "b", fragments: abscisseExtremumLatex(exercice) === null ? [latex("e^{ax}>0"), texte(" et "), latex("a\\ln(x)+\\dfrac{1}{x}>0"), texte(" sur ]0 ; +∞[ : f'(x) a le signe de k et ne s'annule jamais, ce qui confirme le choix.")] : [texte("f'(x) s'annule en "), latex(`x = ${abscisseExtremumLatex(exercice)}`), texte(", ce qui confirme le choix.")] },
  ];
}

function baremeGraphiqueDeriveeLogarithme(exercice: ExerciceGraphiqueDeriveeLogarithme): BaremeExercice {
  const erreurs: BaremeExercice["erreursFrequentes"] = [{ description: [texte("Choisir le graphique de signe opposé (confondre croissance de f et signe de f')")], cout: "0 pt sur le choix" }];
  if (exercice.famille === "A") {
    erreurs.push({ description: [texte("Règle du quotient mal appliquée (oubli du carré x² au dénominateur)")], cout: "−1" });
    if (!exercice.baseEstE) erreurs.push({ description: [texte(`Oublier le facteur 1/ln(${exercice.base}) de la dérivée de log_${exercice.base}(x)`)], cout: "−1" });
  } else if (exercice.famille === "B") {
    erreurs.push({ description: [texte("Oublier un des deux termes de la règle du produit")], cout: "−1" });
  } else {
    erreurs.push({ description: [texte(exercice.p === 0 ? "Écrire (x·ln(x))' = ln(x) en oubliant le terme 1" : "Oublier la dérivée du terme en x")], cout: "−1" });
  }
  return {
    reponseFinale: [texte(`Graphique ${lettreCorrecte(exercice)} ; `), latex(formatDeriveeCorrecteLatex(exercice))],
    criteres: [
      { sousQuestion: "a", critere: [texte("Lit les variations (et l'extremum) de f sur son graphique")], points: 1 },
      { sousQuestion: "a", critere: [texte(`Choisit le graphique ${lettreCorrecte(exercice)} en justifiant par le signe de f'`)], points: 1 },
      { sousQuestion: "b", critere: [texte(`Applique la ${REGLE_DERIVATION[exercice.famille].nom}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Obtient f'(x) simplifiée")], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Toute écriture développée équivalente de f'(x)")]],
  };
}

function enonceAmenageGraphiqueDeriveeLogarithme(exercice: ExerciceGraphiqueDeriveeLogarithme): EtapeAmenagee[] {
  const regle = REGLE_DERIVATION[exercice.famille];
  return [
    { consigne: [texte("Sur le graphique de f, repère où f est croissante et où elle est décroissante.")], rappel: [texte("f croissante ⇔ f'(x) > 0.")], points: 0.5 },
    { consigne: [texte("Repère si f a un maximum ou un minimum, et à quelle abscisse.")], rappel: [texte("En un extremum de f, f'(x) = 0.")], points: 0.5 },
    { consigne: [texte(`Choisis le graphique (A, B, C ou D) qui a ces signes${exercice.famille === "B" ? "" : " et ce zéro"}.`)], points: 1 },
    { consigne: [texte(`Calcule f'(x) avec la ${regle.nom}.`)], rappel: [latex(regle.formule)], points: 1.5 },
    { consigne: [texte("Vérifie que ta dérivée confirme le graphique choisi.")], points: 0.5 },
  ];
}

export const adaptateurEvaluationGraphiqueDeriveeLogarithme: AdaptateurFeuilleExercices<ExerciceGraphiqueDeriveeLogarithme> = {
  titreDocument: "Graphique de la dérivée (fonctions logarithmes) — Évaluation",
  nomFichierBase: "graphique-derivee-logarithme",
  genererInstance: genererExerciceGraphiqueDeriveeLogarithme,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceGraphiqueDeriveeLogarithme,
  construireCorrection: construireCorrectionGraphiqueDeriveeLogarithme,
  difficulte: difficulteGraphiqueDeriveeLogarithme,
  reponseBreve: reponseBreveGraphiqueDeriveeLogarithme,
  correctionDetaillee: correctionDetailleeGraphiqueDeriveeLogarithme,
  bareme: baremeGraphiqueDeriveeLogarithme,
  enonceAmenage: enonceAmenageGraphiqueDeriveeLogarithme,
  dureeMinutes: 8,
};
