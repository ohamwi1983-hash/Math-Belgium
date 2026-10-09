import type { Arcfonction, Trigfonction, ValeurExacte } from "../../core6e/cyclometrique.types";
import type { ExerciceCycloArcTrig, ExerciceCycloDirecte, ExerciceCycloTrigArc, ExerciceFonctionsCyclometriques } from "../../core6e/fonctionsCyclometriques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { CONSIGNE_GENERALE, formatExpressionLatex } from "../../ui6e/formatFonctionsCyclometriques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionsCyclometriques } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFonctionsCyclometriques>` pour `6gen2` (Valeurs
 * cyclométriques : existence et calcul) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Un seul écran côté interactif (existence + valeur exacte) : une seule question ici aussi, en
 * reprenant `CONSIGNE_GENERALE` déjà écrite côté écran (`ui6e/formatFonctionsCyclometriques.ts`),
 * jamais reformulée indépendamment.
 *
 * Correction enrichie (par rapport à la version précédente qui n'affichait que la valeur finale,
 * sans aucune étape) : pour "arcTrig", la valeur intermédiaire trigfonction(θ) est déjà connue sur
 * l'instance (`exercice.theta[exercice.trigfonction]`) — jamais recalculée, simplement montrée.
 * Pour "trigArc", l'angle intermédiaire arcfonction(nombre) n'est volontairement JAMAIS montré
 * (spec explicite, voir `core6e/fonctionsCyclometriques.types.ts`) : on développe plutôt la
 * résolution via l'IDENTITÉ trigonométrique générique correspondant à la paire (trigfonction,
 * arcfonction) — un fait mathématique général, valable pour tout argument, jamais une
 * re-dérivation de la valeur cachée propre à cette instance — puis on affiche le résultat final
 * déjà connu et testé (`exercice.valeurLatex`).
 */

const NOM_LATEX: Record<Arcfonction, string> = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" };
const NOM_FRANCAIS: Record<Arcfonction, string> = { arcsin: "arcsin", arccos: "arccos", arctan: "arctan" };
const NOM_TRIG_LATEX: Record<Trigfonction, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };
const NOM_TRIG_FRANCAIS: Record<Trigfonction, string> = { sin: "sinus", cos: "cosinus", tan: "tangente" };

function construireEnonceFonctionsCyclometriques(exercice: ExerciceFonctionsCyclometriques): SectionExercice {
  return {
    enteteFragments: [latex(`${formatExpressionLatex(exercice)} = ?`)],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE)], reponse: { type: "lignes", nombre: 4 } }],
  };
}

function construireParagrapheDirecte(exercice: ExerciceCycloDirecte): FragmentConsigne[] {
  if (exercice.arcfonction === "arctan") {
    return [texte("arctan est définie sur ℝ tout entier : l'expression existe toujours, et vaut "), latex(`${formatExpressionLatex(exercice)} = ${exercice.valeurLatex}`), texte(".")];
  }
  return [
    texte(`Le nombre de départ appartient bien à l'intervalle `),
    latex("[-1\\,;\\,1]"),
    texte(` (domaine de ${NOM_FRANCAIS[exercice.arcfonction]} inverse) : l'expression existe, et vaut `),
    latex(`${formatExpressionLatex(exercice)} = ${exercice.valeurLatex}`),
    texte("."),
  ];
}

function construireParagrapheArcTrig(exercice: ExerciceCycloArcTrig): FragmentConsigne[] {
  const valeurIntermediaire = exercice.theta[exercice.trigfonction] as ValeurExacte;
  const fragments: FragmentConsigne[] = [
    texte(`On calcule d'abord la valeur intermédiaire ${NOM_TRIG_FRANCAIS[exercice.trigfonction]}(θ) : `),
    latex(`${NOM_TRIG_LATEX[exercice.trigfonction]}\\left(${exercice.theta.angle.latex}\\right) = ${valeurIntermediaire.latex}`),
    texte("."),
  ];
  if (exercice.arcfonction === "arctan") {
    fragments.push(texte(" arctan est définie sur ℝ tout entier : l'expression existe toujours, et vaut "), latex(`${formatExpressionLatex(exercice)} = ${exercice.valeurLatex}`), texte("."));
    return fragments;
  }
  if (exercice.existe) {
    fragments.push(
      texte(" Cette valeur appartient à l'intervalle "),
      latex("[-1\\,;\\,1]"),
      texte(` (domaine de ${NOM_FRANCAIS[exercice.arcfonction]} inverse) : l'expression existe, et vaut `),
      latex(`${formatExpressionLatex(exercice)} = ${exercice.valeurLatex}`),
      texte("."),
    );
  } else {
    fragments.push(
      texte(" Cette valeur n'appartient PAS à l'intervalle "),
      latex("[-1\\,;\\,1]"),
      texte(` (domaine de ${NOM_FRANCAIS[exercice.arcfonction]} inverse) : l'expression n'existe pas.`),
    );
  }
  return fragments;
}

/** Identité trigonométrique GÉNÉRIQUE pour trigfonction(arcfonction(n)) — fait mathématique
 * valable pour tout n du domaine, jamais une valeur propre à cette instance (voir en-tête de
 * fichier). `null` pour les 3 couples triviaux (trigfonction = arcfonction de la même fonction). */
function identiteTrigArcLatex(trigfonction: Trigfonction, arcfonction: Arcfonction, nombreLatex: string): string | null {
  if ((trigfonction === "sin" && arcfonction === "arcsin") || (trigfonction === "cos" && arcfonction === "arccos") || (trigfonction === "tan" && arcfonction === "arctan")) {
    return null;
  }
  if ((trigfonction === "cos" && arcfonction === "arcsin") || (trigfonction === "sin" && arcfonction === "arccos")) {
    return `\\sqrt{1-\\left(${nombreLatex}\\right)^{2}}`;
  }
  if (trigfonction === "tan" && arcfonction === "arcsin") {
    return `\\dfrac{${nombreLatex}}{\\sqrt{1-\\left(${nombreLatex}\\right)^{2}}}`;
  }
  if (trigfonction === "tan" && arcfonction === "arccos") {
    return `\\dfrac{\\sqrt{1-\\left(${nombreLatex}\\right)^{2}}}{${nombreLatex}}`;
  }
  if (trigfonction === "sin" && arcfonction === "arctan") {
    return `\\dfrac{${nombreLatex}}{\\sqrt{1+\\left(${nombreLatex}\\right)^{2}}}`;
  }
  return `\\dfrac{1}{\\sqrt{1+\\left(${nombreLatex}\\right)^{2}}}`;
}

function construireParagrapheTrigArc(exercice: ExerciceCycloTrigArc): FragmentConsigne[] {
  if (exercice.causeInexistence === "horsDomaine") {
    return [
      texte("Le nombre de départ, "),
      latex(exercice.nombreLatex),
      texte(`, n'appartient pas à l'intervalle `),
      latex("[-1\\,;\\,1]"),
      texte(` (domaine de ${NOM_FRANCAIS[exercice.arcfonction]} inverse) : `),
      latex(`${NOM_LATEX[exercice.arcfonction]}\\left(${exercice.nombreLatex}\\right)`),
      texte(" n'est donc pas défini, et l'expression n'existe pas."),
    ];
  }

  const identite = identiteTrigArcLatex(exercice.trigfonction, exercice.arcfonction, exercice.nombreLatex);

  if (exercice.causeInexistence === "anglePiSur2") {
    return [
      texte(`Le nombre de départ appartient bien au domaine de ${NOM_FRANCAIS[exercice.arcfonction]} inverse, mais `),
      latex(identite as string),
      texte(" fait apparaître une division par 0 : l'angle intermédiaire vaut exactement π/2, où la tangente n'est pas définie. L'expression n'existe donc pas."),
    ];
  }

  if (identite === null) {
    return [
      texte(`${NOM_TRIG_FRANCAIS[exercice.trigfonction]} et ${NOM_FRANCAIS[exercice.arcfonction]} sont des fonctions réciproques l'une de l'autre sur leur domaine commun : `),
      latex(`${formatExpressionLatex(exercice)} = ${exercice.valeurLatex}`),
      texte("."),
    ];
  }
  return [texte("D'après l'identité trigonométrique correspondante : "), latex(`${formatExpressionLatex(exercice)} = ${identite} = ${exercice.valeurLatex}`), texte(".")];
}

function construireCorrectionFonctionsCyclometriques(exercice: ExerciceFonctionsCyclometriques): BlocCorrection[] {
  const fragments =
    exercice.variante === "directe" ? construireParagrapheDirecte(exercice) : exercice.variante === "arcTrig" ? construireParagrapheArcTrig(exercice) : construireParagrapheTrigArc(exercice);
  return [{ type: "paragraphe", fragments }];
}

export const adaptateurEvaluationFonctionsCyclometriques: AdaptateurFeuilleExercices<ExerciceFonctionsCyclometriques> = {
  titreDocument: "Valeurs cyclométriques — Évaluation",
  nomFichierBase: "fonctions-cyclometriques",
  genererInstance: genererExerciceFonctionsCyclometriques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceFonctionsCyclometriques,
  construireCorrection: construireCorrectionFonctionsCyclometriques,
  // Une seule question par instance, consigne GÉNÉRIQUE (`CONSIGNE_GENERALE`, constante) — voir
  // `AdaptateurFeuilleExercices.regroupable`, `AppEvaluation6e.tsx::construireItemRegroupe`.
  regroupable: true,
};
