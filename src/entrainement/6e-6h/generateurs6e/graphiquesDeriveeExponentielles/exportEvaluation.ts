import type { ExerciceGraphiqueDeriveeExponentielle } from "../../core6e/graphiquesDeriveeExponentielles.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { construireGrilleSvgCandidatsDeriveeExpo } from "../../export6e/svgGraphDeriveeExpo";
import { calculerViewBoxGraphique, consigneEcranDerivee, consigneEcranSelection, formatDeriveeCorrecteLatex, formatFonctionLatex } from "../../ui6e/formatGraphiquesDeriveeExponentielles";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiqueDeriveeExponentielle } from "./index";
import { correctionDetailleeGraphiquesDeriveeExponentielles as correction, lettreCorrecteGraphiqueDeriveeExpo, sequenceGraphiquesDeriveeExponentielles } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGraphiqueDeriveeExponentielle>` pour `6gen8`
 * (Graphique de la dérivée, fonctions exponentielles) — feuille d'exercices et évaluation.
 *
 * `construireEnonce` : une question par ÉCRAN (« Calcule f′(x) » pour B et D, puis la sélection du
 * graphique) — titres d'étapes du corrigé. Papier : la fonction, les quatre graphiques A à D et la
 * consigne globale. Corrigé détaillé partagé avec l'appli (`corrigeDetaille.ts`) ; la figure des
 * candidats, le bon mis en évidence, va dans le corrigé (`figureHtml`), jamais dans l'énoncé.
 */

function entete(exercice: ExerciceGraphiqueDeriveeExponentielle): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(formatFonctionLatex(exercice)), texte(".")];
}

function construireEnonceGraphiquesDeriveeExponentielles(exercice: ExerciceGraphiqueDeriveeExponentielle): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    enteteHtml: construireGrilleSvgCandidatsDeriveeExpo(exercice, calculerViewBoxGraphique(exercice)),
    questions: sequenceGraphiquesDeriveeExponentielles(exercice).map((phase) => ({ consigne: [texte(phase === "derivee" ? consigneEcranDerivee() : consigneEcranSelection())] })),
  };
}

function aEcranDerivee(exercice: ExerciceGraphiqueDeriveeExponentielle): boolean {
  return exercice.famille === "B" || exercice.famille === "D";
}

function reponseBreve(exercice: ExerciceGraphiqueDeriveeExponentielle): FragmentConsigne[] {
  const lettre = lettreCorrecteGraphiqueDeriveeExpo(exercice);
  return aEcranDerivee(exercice) ? [latex(formatDeriveeCorrecteLatex(exercice) as string), texte(` ; graphique ${lettre}`)] : [texte(`Graphique ${lettre}`)];
}

function construireCorrectionGraphiquesDeriveeExponentielles(exercice: ExerciceGraphiqueDeriveeExponentielle): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(exercice) }, { type: "html", html: construireGrilleSvgCandidatsDeriveeExpo(exercice, calculerViewBoxGraphique(exercice), exercice.indexCorrect) }];
}

/** Énoncé PAPIER : la fonction, les quatre graphiques et la consigne globale. */
function enoncePapier(exercice: ExerciceGraphiqueDeriveeExponentielle): EnoncePapier {
  const consigne = aEcranDerivee(exercice) ? " Calcule f′(x), puis indique lequel des graphiques A à D représente f′. Justifie." : " Indique lequel des graphiques A à D représente f′. Justifie à partir de f′(x).";
  return {
    section: { enteteFragments: [...entete(exercice), texte(consigne)], enteteHtml: construireGrilleSvgCandidatsDeriveeExpo(exercice, calculerViewBoxGraphique(exercice)), questions: [] },
  };
}

/** f′(x) des familles A et C (écran unique) — mêmes écritures que le corrigé détaillé. */
function deriveeAC(e: ExerciceGraphiqueDeriveeExponentielle): string {
  if (e.famille === "A") return `f'(x)=${e.a === 1 ? "" : e.a === -1 ? "-" : e.a}e^{x}(1+x)`;
  if (e.famille === "C") {
    const k = e.k === 1 ? "" : String(e.k);
    return `f'(x)=${k === "" ? "" : `${k}\\cdot`}\\dfrac{e^{${k}x}-e^{-${k}x}}{2}`;
  }
  return formatDeriveeCorrecteLatex(e) ?? "";
}

function bareme(exercice: ExerciceGraphiqueDeriveeExponentielle): BaremeExercice {
  const lettre = lettreCorrecteGraphiqueDeriveeExpo(exercice);
  const sel = aEcranDerivee(exercice) ? "b" : "a";
  const criteres = [
    ...(aEcranDerivee(exercice)
      ? [
          { sousQuestion: "a", critere: [texte(exercice.famille === "B" ? "Règle du quotient appliquée (u′v − uv′)/v²" : "Règle de 1/u : −u′/u²")], points: 1 },
          { sousQuestion: "a", critere: [texte("Dérivée simplifiée : "), latex(formatDeriveeCorrecteLatex(exercice) as string)], points: 1 },
        ]
      : [{ sousQuestion: "a", critere: [texte(exercice.famille === "A" ? "f′(x) calculée par la règle du produit : " : "f′(x) calculée terme à terme : "), latex(deriveeAC(exercice))], points: 2 }]),
    { sousQuestion: sel, critere: [texte(exercice.famille === "A" ? "Caractéristiques testées : zéro en x = −1, extremum en x = −2, limite 0 à gauche" : exercice.famille === "B" ? "Caractéristiques testées : signe constant, f′(0), limites nulles" : exercice.famille === "C" ? "Caractéristiques testées : f′(0) = 0, imparité, non bornée" : "Caractéristiques testées : x = 0 exclu, signe constant, limites nulles")], points: 1 },
    { sousQuestion: sel, critere: [texte(`Graphique ${lettre}`)], points: 1 },
  ];
  const erreursFrequentes =
    exercice.famille === "A"
      ? [{ description: [texte("Dériver x·eˣ en eˣ seul (courbe monotone)")], cout: "0 pt sur le graphique" }]
      : exercice.famille === "B"
        ? [{ description: [texte("Signe de ln(b) mal lu quand la base est entre 0 et 1")], cout: "−1" }]
        : exercice.famille === "C"
          ? [{ description: [texte("Signe oublié dans la dérivée de "), latex(exercice.famille === "C" && exercice.k !== 1 ? `e^{-${exercice.k}x}` : "e^{-x}"), texte(" : courbe paire")], cout: "0 pt sur le graphique" }]
          : [{ description: [texte("Oublier le −1 du dénominateur (courbe continue en x = 0)")], cout: "−1" }];
  return { reponseFinale: reponseBreve(exercice), criteres, erreursFrequentes };
}

/**
 * Niveau 1–7 — méthode 1 (relever les bonnes caractéristiques de f′ et les confronter aux quatre
 * graphiques), piège dans les données : base entre 0 et 1 (B, dérivée négative), point exclu x = 0
 * (D). Écran de pure lecture : la sélection après une dérivée déjà calculée (B, D), où l'on ne fait
 * que lire les caractéristiques sur les graphiques. Nombres 0 (aucune valeur à calculer).
 */
function criteresDifficulte(e: ExerciceGraphiqueDeriveeExponentielle): CriteresDifficulte {
  const piege: 0 | 1 = (e.famille === "B" && e.base < 1) || e.famille === "D" ? 1 : 0;
  return { ...etapesDuCorrige(correction(e), aEcranDerivee(e) ? ["b"] : []), methode: 1, piege, nombres: 0 };
}

export const adaptateurEvaluationGraphiquesDeriveeExponentielles: AdaptateurFeuilleExercices<ExerciceGraphiqueDeriveeExponentielle> = {
  titreDocument: "Graphique de la dérivée (fonctions exponentielles) — Évaluation",
  nomFichierBase: "graphiques-derivee-exponentielles",
  genererInstance: genererExerciceGraphiqueDeriveeExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceGraphiquesDeriveeExponentielles,
  construireCorrection: construireCorrectionGraphiquesDeriveeExponentielles,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correction,
  bareme,
  enoncePapier,
};
