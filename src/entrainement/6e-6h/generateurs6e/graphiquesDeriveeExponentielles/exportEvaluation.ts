import type { ExerciceGraphiqueDeriveeExponentielle } from "../../core6e/graphiquesDeriveeExponentielles.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireGrilleSvgCandidatsDeriveeExpo } from "../../export6e/svgGraphDeriveeExpo";
import { calculerViewBoxGraphique, formatDeriveeCorrecteLatex, formatFonctionLatex } from "../../ui6e/formatGraphiquesDeriveeExponentielles";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiqueDeriveeExponentielle } from "./index";

const LETTRES = "ABCD";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGraphiqueDeriveeExponentielle>` pour `6gen8`
 * (Graphique de la dérivée, fonctions exponentielles) — feuille d'évaluation.
 *
 * Même principe que `graphiquesCyclometriques` (6gen5) : QCM graphique réel (4 candidats tracés en
 * `<svg>` statique, `export/svgGraphDeriveeExpo.ts`), jamais réduit à des questions textuelles.
 * Familles B/D ajoutent, AVANT le QCM, la question « calcule f'(x) symboliquement » de l'écran
 * interactif (réponse toute faite via `formatDeriveeCorrecteLatex`) ; familles A/C n'ont qu'un
 * écran côté interactif (QCM direct, `formatDeriveeCorrecteLatex` renvoie `null`) — leur dérivée
 * exacte (donnée en toutes lettres dans `core6e/graphiquesDeriveeExponentielles.types.ts`) est
 * néanmoins donnée dans LE CORRIGÉ, pour que la justification du bon candidat reste vérifiable.
 */

function formatDeriveeExacteLatex(exercice: ExerciceGraphiqueDeriveeExponentielle): string {
  const deriveeConnue = formatDeriveeCorrecteLatex(exercice);
  if (deriveeConnue !== null) return deriveeConnue;
  if (exercice.famille === "A") return `f'(x) = ${exercice.a}e^{x}(1+x)`;
  // Famille C : f(x) = (e^{kx}+e^{-kx})/2, f'(x) = k(e^{kx}-e^{-kx})/2.
  const k = (exercice as Extract<typeof exercice, { famille: "C" }>).k;
  const kx = k === 1 ? "x" : `${k}x`;
  return `f'(x) = ${k === 1 ? "" : `${k}\\cdot`}\\dfrac{e^{${kx}}-e^{-${kx}}}{2}`;
}

function construireEnonceGraphiquesDeriveeExponentielles(exercice: ExerciceGraphiqueDeriveeExponentielle): SectionExercice {
  const viewBox = calculerViewBoxGraphique(exercice);
  const aEcranDerivee = formatDeriveeCorrecteLatex(exercice) !== null;
  const questions = aEcranDerivee
    ? [
        { consigne: [texte("Calcule f'(x) symboliquement.")], reponse: { type: "lignes" as const, nombre: 3 } },
        { consigne: [texte("Quel graphique correspond à f'(x) ?")], reponse: { type: "lignes" as const, nombre: 1 } },
      ]
    : [{ consigne: [texte("Quel graphique correspond à f'(x) ?")], reponse: { type: "lignes" as const, nombre: 1 } }];
  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatFonctionLatex(exercice))],
    enteteHtml: construireGrilleSvgCandidatsDeriveeExpo(exercice, viewBox),
    questions,
  };
}

function construireCorrectionGraphiquesDeriveeExponentielles(exercice: ExerciceGraphiqueDeriveeExponentielle): BlocCorrection[] {
  const viewBox = calculerViewBoxGraphique(exercice);
  const lettreCorrecte = LETTRES[exercice.indexCorrect] ?? String(exercice.indexCorrect + 1);
  const blocs: BlocCorrection[] = [{ type: "paragraphe", fragments: [texte("a) "), latex(formatDeriveeExacteLatex(exercice))] }];
  blocs.push({ type: "paragraphe", fragments: [texte(`b) Réponse : le graphique ${lettreCorrecte}.`)] });
  blocs.push({ type: "html", html: construireGrilleSvgCandidatsDeriveeExpo(exercice, viewBox, exercice.indexCorrect) });
  return blocs;
}

export const adaptateurEvaluationGraphiquesDeriveeExponentielles: AdaptateurFeuilleExercices<ExerciceGraphiqueDeriveeExponentielle> = {
  titreDocument: "Graphique de la dérivée (fonctions exponentielles) — Évaluation",
  nomFichierBase: "graphiques-derivee-exponentielles",
  genererInstance: genererExerciceGraphiqueDeriveeExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceGraphiquesDeriveeExponentielles,
  construireCorrection: construireCorrectionGraphiquesDeriveeExponentielles,
};
