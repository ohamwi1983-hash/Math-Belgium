import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ConfigurationResolution, ElementTriangle, ExerciceResoudreTriangle, LoiResolution } from "../core/resoudreTriangle.types";
import type { CoteTriangle, SommetTriangle } from "../core/triangle.types";
import { COTES, SOMMETS, autresCotes, coteOppose, angleOppose, estCoteElement, plusGrandAngle, premiereLoi, type EtapeResolution } from "../moteur/resolutionTriangle";
import { etapeControle, planExercice, type StatutChamp } from "../moteur/verificationResoudreTriangle";
import { nombreFr, nombreFrLatex } from "./nombreFr";

/**
 * Textes de gen73 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale. Précision de gen19 : côtés au centième, angles au dixième de degré,
 * valeur approchée acceptée à environ 1 % près à l'écran.
 */

export const TITRES_ECRANS = ["Configuration des données", "Première loi", "Les éléments manquants", "Contrôle"];

export const CONSIGNE_GENERALE =
  "Dans le triangle ABC, chaque côté est désigné par la lettre minuscule du sommet qui lui fait face : a = BC, b = AC, c = AB. On veut résoudre complètement ce triangle, c'est-à-dire calculer ses trois éléments manquants.";

export const CONSIGNE_PAPIER =
  "Résous complètement le triangle ABC : calcule les trois éléments manquants (côtés au centième, angles au dixième de degré), puis contrôle ton résultat.";

export const LIBELLES_CONFIGURATION: Record<ConfigurationResolution, string> = {
  AAS: "2 angles et 1 côté",
  SAS: "2 côtés et l'angle compris",
  SSS: "3 côtés",
  SSA: "2 côtés et un angle non compris",
};

export const ORDRE_CONFIGURATIONS: ConfigurationResolution[] = ["AAS", "SAS", "SSS", "SSA"];

export const LIBELLES_LOI: Record<LoiResolution, string> = {
  somme: "Somme des angles",
  sinus: "Loi des sinus",
  kashiCote: "Al-Kashi pour un côté",
  kashiAngle: "Al-Kashi pour un angle",
};

export const ORDRE_LOIS: LoiResolution[] = ["sinus", "kashiCote", "kashiAngle", "somme"];

// ---------------------------------------------------------------------------------------------
// Notation et nombres
// ---------------------------------------------------------------------------------------------

/** « a » ou « \hat{A} ». */
export function elementLatex(e: ElementTriangle): string {
  return estCoteElement(e) ? e : `\\hat{${e}}`;
}

const SEGMENT: Record<CoteTriangle, string> = { a: "BC", b: "AC", c: "AB" };

export function segment(c: CoteTriangle): string {
  return SEGMENT[c];
}

/** Arrondi d'affichage : côtés au centième, angles au dixième. */
export function arrondi(e: ElementTriangle, v: number): number {
  return estCoteElement(e) ? Math.round(v * 100) / 100 : Math.round(v * 10) / 10;
}

/** Valeur arrondie en LaTeX, avec unité (côté) ou degré (angle). */
export function valeurLatex(ex: ExerciceResoudreTriangle, e: ElementTriangle, v = ex.triangle[e]): string {
  const n = nombreFrLatex(arrondi(e, v));
  return estCoteElement(e) ? `${n}\\text{ ${ex.unite}}` : `${n}^\\circ`;
}

/** Même valeur en texte brut (figure SVG) : « 7 cm », « 112° ». */
export function valeurTexte(ex: ExerciceResoudreTriangle, e: ElementTriangle): string {
  const n = nombreFr(arrondi(e, ex.triangle[e]));
  return estCoteElement(e) ? `${n} ${ex.unite}` : `${n}°`;
}

/** Nombre sans unité dans une formule substituée (données exactes, résultats arrondis). */
function nombreDans(ex: ExerciceResoudreTriangle, e: ElementTriangle): string {
  const n = nombreFrLatex(arrondi(e, ex.triangle[e]));
  return estCoteElement(e) ? n : `${n}^\\circ`;
}

export function estDonnee(ex: ExerciceResoudreTriangle, e: ElementTriangle): boolean {
  return ex.donnees.includes(e);
}

function listeEt(items: FragmentConsigne[][]): FragmentConsigne[] {
  return items.flatMap((f, i) => [...(i === 0 ? [] : [texte(i === items.length - 1 ? " et " : ", ")]), ...f]);
}

export function donneesFragments(ex: ExerciceResoudreTriangle): FragmentConsigne[] {
  // Pas de point final : seul après la formule, il passait à la ligne sur téléphone.
  return [texte("Données : "), ...listeEt(ex.donnees.map((e) => [latex(`${elementLatex(e)} = ${valeurLatex(ex, e)}`)]))];
}

export function inconnues(ex: ExerciceResoudreTriangle): ElementTriangle[] {
  return planExercice(ex).map((e) => e.inconnue);
}

// ---------------------------------------------------------------------------------------------
// Consignes
// ---------------------------------------------------------------------------------------------

export const CONSIGNE_CALCULS =
  "Calcule les trois éléments manquants, dans l'ordre de la méthode : côtés au centième, angles au dixième de degré (une valeur approchée à environ 1 % près est acceptée).";

export function consigneControle(ex: ExerciceResoudreTriangle): FragmentConsigne[] {
  const X = etapeControle(ex).inconnue;
  return [
    texte("Contrôle : "),
    latex(elementLatex(X)),
    texte(" a été obtenu par la somme des angles. Recalcule-le autrement, par Al-Kashi avec les trois côtés. Si tu retrouves la même valeur, tes trois angles vérifient bien "),
    latex("\\hat{A} + \\hat{B} + \\hat{C} = 180^\\circ"),
    texte("."),
  ];
}

export function consignesEcrans(ex: ExerciceResoudreTriangle): FragmentConsigne[][] {
  return [
    [texte("Quelle est la configuration des données ?")],
    [texte(ex.configuration === "SSS" ? "Quelle loi appliques-tu en premier, et pour quel angle ?" : "Quelle loi appliques-tu en premier ?")],
    [texte(CONSIGNE_CALCULS)],
    consigneControle(ex),
  ];
}

/** Libellé d'un champ de l'écran 3 : « 1. Angle Ĉ (au dixième de degré) ». */
export function libelleChamp(e: ElementTriangle, rang?: number): FragmentConsigne[] {
  const prefixe = rang !== undefined ? `${rang}. ` : "";
  if (estCoteElement(e)) return [texte(`${prefixe}Côté `), latex(e), texte(` = ${segment(e)} (au centième)`)];
  return [texte(`${prefixe}Angle `), latex(elementLatex(e)), texte(" (au dixième de degré)")];
}

export function uniteChamp(ex: ExerciceResoudreTriangle, e: ElementTriangle): string {
  return estCoteElement(e) ? ex.unite : "°";
}

// ---------------------------------------------------------------------------------------------
// Formules
// ---------------------------------------------------------------------------------------------

function troisiemeAngle(e: SommetTriangle): [SommetTriangle, SommetTriangle] {
  return SOMMETS.filter((s) => s !== e) as [SommetTriangle, SommetTriangle];
}

/** Formule littérale, résolue pour l'inconnue (aide, corrigé). */
export function formuleLatex(etape: EtapeResolution): string {
  const e = etape.inconnue;
  switch (etape.loi) {
    case "somme": {
      const [X, Y] = troisiemeAngle(e as SommetTriangle);
      return `${elementLatex(e)} = 180^\\circ - ${elementLatex(X)} - ${elementLatex(Y)}`;
    }
    case "sinus": {
      const [x, X] = etape.couple!;
      if (estCoteElement(e)) return `\\dfrac{${e}}{\\sin ${elementLatex(angleOppose(e))}} = \\dfrac{${x}}{\\sin ${elementLatex(X)}} \\;\\Rightarrow\\; ${e} = \\dfrac{${x} \\cdot \\sin ${elementLatex(angleOppose(e))}}{\\sin ${elementLatex(X)}}`;
      const y = coteOppose(e as SommetTriangle);
      return `\\dfrac{\\sin ${elementLatex(e)}}{${y}} = \\dfrac{\\sin ${elementLatex(X)}}{${x}} \\;\\Rightarrow\\; \\sin ${elementLatex(e)} = \\dfrac{${y} \\cdot \\sin ${elementLatex(X)}}{${x}}`;
    }
    case "kashiCote": {
      const [p, q] = COTES.filter((c) => c !== e) as [CoteTriangle, CoteTriangle];
      return `${e}^2 = ${p}^2 + ${q}^2 - 2${p}${q}\\cos ${elementLatex(angleOppose(e as CoteTriangle))}`;
    }
    case "kashiAngle": {
      const [p, q] = autresCotes(e as SommetTriangle);
      return `\\cos ${elementLatex(e)} = \\dfrac{${p}^2 + ${q}^2 - ${coteOppose(e as SommetTriangle)}^2}{2${p}${q}}`;
    }
  }
}

/** Formule substituée (sans le résultat) : données exactes, éléments déjà calculés arrondis. */
export function substitutionLatex(ex: ExerciceResoudreTriangle, etape: EtapeResolution): string {
  const e = etape.inconnue;
  const v = (x: ElementTriangle) => nombreDans(ex, x);
  switch (etape.loi) {
    case "somme": {
      const [X, Y] = troisiemeAngle(e as SommetTriangle);
      return `${elementLatex(e)} = 180^\\circ - ${v(X)} - ${v(Y)}`;
    }
    case "sinus": {
      const [x, X] = etape.couple!;
      if (estCoteElement(e)) return `${e} = \\dfrac{${v(x)} \\cdot \\sin ${v(angleOppose(e))}}{\\sin ${v(X)}}`;
      return `\\sin ${elementLatex(e)} = \\dfrac{${v(coteOppose(e as SommetTriangle))} \\cdot \\sin ${v(X)}}{${v(x)}}`;
    }
    case "kashiCote": {
      const [p, q] = COTES.filter((c) => c !== e) as [CoteTriangle, CoteTriangle];
      return `${e}^2 = ${v(p)}^2 + ${v(q)}^2 - 2 \\cdot ${v(p)} \\cdot ${v(q)} \\cdot \\cos ${v(angleOppose(e as CoteTriangle))}`;
    }
    case "kashiAngle": {
      const [p, q] = autresCotes(e as SommetTriangle);
      return `\\cos ${elementLatex(e)} = \\dfrac{${v(p)}^2 + ${v(q)}^2 - ${v(coteOppose(e as SommetTriangle))}^2}{2 \\cdot ${v(p)} \\cdot ${v(q)}}`;
    }
  }
}

/** Fin du calcul (corrigé, réponse attendue) : valeur intermédiaire éventuelle puis résultat. */
export function resultatLatex(ex: ExerciceResoudreTriangle, etape: EtapeResolution): string {
  const e = etape.inconnue;
  const t = ex.triangle;
  const fin = `${elementLatex(e)} \\approx ${valeurLatex(ex, e)}`;
  if (etape.loi === "kashiCote") return `${e}^2 \\approx ${nombreFrLatex(Math.round(t[e as CoteTriangle] ** 2 * 100) / 100)} \\;\\Rightarrow\\; ${fin}`;
  if (etape.loi === "kashiAngle") return `\\cos ${elementLatex(e)} \\approx ${nombreFrLatex(Math.round(Math.cos((t[e] * Math.PI) / 180) * 10000) / 10000)} \\;\\Rightarrow\\; ${fin}`;
  if (etape.loi === "sinus" && !estCoteElement(e)) return `\\sin ${elementLatex(e)} \\approx ${nombreFrLatex(Math.round(Math.sin((t[e] * Math.PI) / 180) * 10000) / 10000)} \\;\\Rightarrow\\; ${fin}`;
  if (etape.loi === "somme") return `${elementLatex(e)} = ${valeurLatex(ex, e)}`;
  return fin;
}

/** Description courte d'une étape : « Ĉ : somme des angles », « a : loi des sinus avec le couple (c ; Ĉ) ». */
export function descriptionEtape(etape: EtapeResolution): FragmentConsigne[] {
  const e = etape.inconnue;
  const debut = [latex(elementLatex(e)), texte(" : ")];
  switch (etape.loi) {
    case "somme":
      return [...debut, texte("somme des angles")];
    case "sinus":
      return [...debut, texte("loi des sinus, avec le couple complet "), latex(`(${etape.couple![0]} \\,;\\, ${elementLatex(etape.couple![1])})`)];
    case "kashiCote":
      return [...debut, texte("Al-Kashi, avec les deux côtés connus et l'angle compris")];
    case "kashiAngle":
      return [...debut, texte("Al-Kashi résolue en cosinus, avec les trois côtés")];
  }
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais le résultat final : il reste toujours un calcul à faire)
// ---------------------------------------------------------------------------------------------

/** Une aide = des lignes ; chaque ligne = des fragments (phrase terminée par « : » puis formule). */
export type Aide = FragmentConsigne[][];

function nomsDonnees(ex: ExerciceResoudreTriangle, cotes: boolean): FragmentConsigne[] {
  return listeEt(ex.donnees.filter((e) => estCoteElement(e) === cotes).map((e) => [latex(elementLatex(e))]));
}

export function aidesConfiguration(ex: ExerciceResoudreTriangle): Aide[] {
  const angles = ex.donnees.filter((e) => !estCoteElement(e)) as SommetTriangle[];
  const nbCotes = ex.donnees.length - angles.length;
  const ligne2: FragmentConsigne[] = [texte(`Les données : ${nbCotes} côté${nbCotes > 1 ? "s" : ""}`)];
  if (nbCotes > 0) ligne2.push(texte(" ("), ...nomsDonnees(ex, true), texte(")"));
  ligne2.push(texte(angles.length === 0 ? " et aucun angle." : ` et ${angles.length} angle${angles.length > 1 ? "s" : ""} (`));
  if (angles.length > 0) ligne2.push(...nomsDonnees(ex, false), texte(")."));
  if (angles.length === 1) {
    const [p, q] = autresCotes(angles[0]!);
    ligne2.push(texte(" Les deux côtés qui forment l'angle "), latex(elementLatex(angles[0]!)), texte(" sont "), latex(p), texte(" et "), latex(q), texte("."));
  }
  return [
    [[texte("Compte les côtés et les angles connus. Avec deux côtés et un angle, regarde si l'angle est formé par ces deux côtés (angle compris) ou non : sur la figure, l'angle compris est au sommet commun aux deux côtés.")]],
    [ligne2],
  ];
}

export function aidesPremiereLoi(ex: ExerciceResoudreTriangle): Aide[] {
  const niveau1: Aide = [
    [texte("Ce qu'il faut connaître pour chaque loi. Somme des angles : deux angles. Loi des sinus : un couple complet (un côté et l'angle qui lui fait face) et un autre élément. Al-Kashi pour un côté : deux côtés et l'angle compris. Al-Kashi pour un angle : les trois côtés.")],
  ];
  let niveau2: FragmentConsigne[];
  switch (ex.configuration) {
    case "AAS":
      niveau2 = [texte("Deux angles sont connus : que peux-tu calculer tout de suite, sans aucune fonction trigonométrique ?")];
      break;
    case "SAS":
      niveau2 = [texte("Aucun côté donné ne fait face à l'angle donné : il n'y a pas de couple complet, la loi des sinus est impossible au départ. Quel élément manque pour former un couple avec l'angle "), latex(elementLatex(ex.donnees.find((e) => !estCoteElement(e))!)), texte(" ?")];
      break;
    case "SSS":
      niveau2 = [
        texte("Avec trois côtés, commence par le PLUS GRAND angle, celui qui fait face au plus grand côté : c'est le seul qui peut être obtus, et l'arc sinus renvoie toujours un angle aigu. Seul l'arc cosinus le donne sans risque."),
      ];
      break;
    case "SSA": {
      const X = ex.donnees.find((e) => !estCoteElement(e)) as SommetTriangle;
      niveau2 = [texte("Le côté "), latex(coteOppose(X)), texte(" fait face à l'angle "), latex(elementLatex(X)), texte(" : ils forment un couple complet. Quelle loi relie un côté et l'angle qui lui fait face ?")];
      break;
    }
  }
  return [niveau1, [niveau2]];
}

export function aidesCalculs(ex: ExerciceResoudreTriangle): Aide[] {
  const plan = planExercice(ex);
  const methode: Aide = [
    [texte("L'ordre de la méthode :")],
    ...plan.map((etape, i) => [texte(`${i + 1}. `), ...descriptionEtape(etape), texte(".")]),
  ];
  if (ex.configuration === "SAS" || ex.configuration === "SSS") {
    methode.push([texte("Le plus grand angle se calcule par Al-Kashi : la loi des sinus ne donnerait que l'angle aigu, même si l'angle cherché est obtus.")]);
  }
  methode.push([texte("Calculatrice en degrés ; garde en mémoire les valeurs non arrondies pour les calculs suivants.")]);
  const formules: Aide = plan.map((etape, i) => [texte(`Pour `), latex(elementLatex(etape.inconnue)), texte(" :"), latex(i === 0 ? substitutionLatex(ex, etape) : formuleLatex(etape))]);
  return [methode, formules];
}

export function aidesControle(ex: ExerciceResoudreTriangle): Aide[] {
  const etape = etapeControle(ex);
  return [
    [[texte("Al-Kashi résolue en cosinus pour "), latex(elementLatex(etape.inconnue)), texte(" :"), latex(formuleLatex(etape))]],
    [[texte("Avec les trois côtés (arrondis au centième) :"), latex(substitutionLatex(ex, etape))], [texte("Il reste à appliquer l'arc cosinus, calculatrice en degrés.")]],
  ];
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues et messages
// ---------------------------------------------------------------------------------------------

export function reponsePremiereLoi(ex: ExerciceResoudreTriangle): FragmentConsigne[] {
  const loi = premiereLoi(ex.configuration);
  if (ex.configuration === "SSS") return [texte(`${LIBELLES_LOI[loi]}, pour le plus grand angle `), latex(elementLatex(plusGrandAngle(ex.triangle)))];
  return [texte(LIBELLES_LOI[loi])];
}

export function resultatsLatex(ex: ExerciceResoudreTriangle, elements: ElementTriangle[]): string {
  return elements.map((e) => `${elementLatex(e)} \\approx ${valeurLatex(ex, e)}`).join(" \\;;\\; ");
}

export function messageStatut(statut: StatutChamp): string {
  switch (statut) {
    case "aigu-arcsin":
      return "c'est l'angle aigu que donne l'arc sinus, or cet angle est obtus : calcule-le par Al-Kashi (arc cosinus)";
    case "radians":
      return "ta calculatrice semble être en radians : passe-la en degrés";
    case "parse_error":
      return "valeur illisible";
    default:
      return "valeur à revoir";
  }
}
