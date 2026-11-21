import type { Arcfonction, Trigfonction } from "../core6e/cyclometrique.types";
import type { ExerciceFonctionsCyclometriques } from "../core6e/fonctionsCyclometriques.types";

/**
 * Aides et messages ciblés de `6gen2` (audit du 6e ch. 1, lot B : G3, G4, G5). Niveau 1 : la
 * définition à appliquer ; niveau 2 : la définition POSÉE pour l'instance, sans la conclusion
 * (jamais « existe / n'existe pas », jamais la valeur). Une phrase (formules courtes entre `$…$`)
 * terminée par « : », puis la formule en KaTeX.
 */

export interface AideCycloValeur {
  texte: string;
  latex: string | null;
}

const NOM_LATEX: Record<Arcfonction, string> = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" };
const NOM_TRIG_LATEX: Record<Trigfonction, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };
/** Avec l'article ou le possessif accordé : « la tangente », « sa tangente » (jamais « le tangente »). */
const LE_TRIG: Record<Trigfonction, string> = { sin: "le sinus", cos: "le cosinus", tan: "la tangente" };
const SON_TRIG: Record<Trigfonction, string> = { sin: "son sinus", cos: "son cosinus", tan: "sa tangente" };
const TRIG_DE: Record<Arcfonction, Trigfonction> = { arcsin: "sin", arccos: "cos", arctan: "tan" };
const DOMAINE_LATEX: Record<Arcfonction, string> = { arcsin: "[-1\\,;1]", arccos: "[-1\\,;1]", arctan: "\\mathbb{R}" };
export const IMAGE_ARC_LATEX: Record<Arcfonction, string> = {
  arcsin: "\\left[-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right]",
  arccos: "[0\\,;\\pi]",
  arctan: "\\left]-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right[",
};

function definition(arc: Arcfonction): string {
  return `$${NOM_LATEX[arc]}\\,y$ est l'angle de $${IMAGE_ARC_LATEX[arc]}$ dont ${LE_TRIG[TRIG_DE[arc]]} vaut $y$ ; il existe pour $y \\in ${DOMAINE_LATEX[arc]}$.`;
}

export function aideValeur1(exercice: ExerciceFonctionsCyclometriques): AideCycloValeur {
  switch (exercice.variante) {
    case "directe":
      return { texte: definition(exercice.arcfonction), latex: null };
    case "arcTrig":
      return { texte: `Calcule d'abord la valeur intermédiaire, ${LE_TRIG[exercice.trigfonction]} de l'angle donné. Ensuite, ${definition(exercice.arcfonction)}`, latex: null };
    case "trigArc":
      return {
        texte: `${definition(exercice.arcfonction)} Une fois cet angle connu, calcule ${SON_TRIG[exercice.trigfonction]}${exercice.trigfonction === "tan" ? " (la tangente n'est pas définie en $-\\frac{\\pi}{2}$ ni en $\\frac{\\pi}{2}$)" : ""}.`,
        latex: null,
      };
  }
}

export function aideValeur2(exercice: ExerciceFonctionsCyclometriques): AideCycloValeur {
  switch (exercice.variante) {
    case "directe":
      return {
        texte: "Cherche l'angle $\\alpha$ qui vérifie les deux conditions :",
        latex: `${NOM_TRIG_LATEX[TRIG_DE[exercice.arcfonction]]}\\,\\alpha = ${exercice.nombreLatex} \\quad\\text{et}\\quad \\alpha \\in ${IMAGE_ARC_LATEX[exercice.arcfonction]}`,
      };
    case "arcTrig": {
      const valeur = `${NOM_TRIG_LATEX[exercice.trigfonction]}\\left(${exercice.theta.angle.latex}\\right)`;
      if (exercice.arcfonction === "arctan") {
        return { texte: "Cherche l'angle $\\alpha$ de l'image qui a la même tangente, sans supposer que c'est l'angle donné :", latex: `\\tan\\alpha = ${valeur} \\quad\\text{et}\\quad \\alpha \\in ${IMAGE_ARC_LATEX.arctan}` };
      }
      return {
        texte: "Calcule la valeur intermédiaire et compare-la à $-1$ et à $1$ ; si elle convient, cherche l'angle $\\alpha$ de l'image (pas forcément l'angle donné) :",
        latex: `${NOM_TRIG_LATEX[TRIG_DE[exercice.arcfonction]]}\\,\\alpha = ${valeur} \\quad\\text{et}\\quad \\alpha \\in ${IMAGE_ARC_LATEX[exercice.arcfonction]}`,
      };
    }
    case "trigArc":
      return {
        texte: `Pose $\\alpha = ${NOM_LATEX[exercice.arcfonction]}\\left(${exercice.nombreLatex}\\right)$ : vérifie que ce nombre est dans le domaine, place $\\alpha$ dans l'image, puis calcule :`,
        latex: `${NOM_TRIG_LATEX[exercice.trigfonction]}\\,\\alpha \\quad\\text{avec}\\quad \\alpha \\in ${IMAGE_ARC_LATEX[exercice.arcfonction]}`,
      };
  }
}

/**
 * Message ciblé sur la valeur fausse (« Existe » juste) : arcsin(sin θ) = θ hors de l'image, angle
 * hors de l'image de l'arcfonction, signe opposé. Jamais la réponse.
 */
export function cibleValeur(exercice: ExerciceFonctionsCyclometriques, valeur: number): string | null {
  if (!exercice.existe || exercice.valeurNumerique === null) return null;
  const proche = (a: number, b: number) => Math.abs(a - b) < 1e-6;
  if (exercice.variante === "arcTrig" && proche(valeur, exercice.theta.angle.numerique)) {
    return `$${NOM_LATEX[exercice.arcfonction]}(${NOM_TRIG_LATEX[exercice.trigfonction]}\\,\\theta) = \\theta$ seulement si $\\theta$ est dans l'image $${IMAGE_ARC_LATEX[exercice.arcfonction]}$ : cherche l'angle de cette image qui a la même valeur.`;
  }
  if (exercice.variante !== "trigArc") {
    const arc = exercice.arcfonction;
    const dansImage = arc === "arccos" ? valeur >= -1e-9 && valeur <= Math.PI + 1e-9 : arc === "arcsin" ? Math.abs(valeur) <= Math.PI / 2 + 1e-9 : Math.abs(valeur) < Math.PI / 2 - 1e-9;
    if (!dansImage) return `Cet angle n'est pas dans l'image de ${arc}, $${IMAGE_ARC_LATEX[arc]}$.`;
  }
  if (proche(valeur, -exercice.valeurNumerique) && !proche(valeur, 0)) return "Relis le signe : dans quel quadrant se trouve l'angle intermédiaire ?";
  return null;
}
