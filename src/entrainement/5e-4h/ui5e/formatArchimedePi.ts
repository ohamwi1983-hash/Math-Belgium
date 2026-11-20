import type { ExerciceArchimedePi } from "../core5e/archimedePi";
import { parDefaut, parExces } from "../core5e/archimedePi";
import type { AideEcran, ChampEcran, Frag } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { exactA, nbL, nbT } from "./nombresTrigo";

/**
 * Couche C — textes de `5gen56` « Encadrer π comme Archimède » (notations du cours, § 1 : C centre,
 * [AB] côté du polygone inscrit, H milieu de [AB], [DE] côté du polygone circonscrit tangent en F,
 * α = 180°/n). Source unique de l'écran, du corrigé et du papier.
 */

type E = ExerciceArchimedePi;
export type PhaseArchimede = "angle" | "cotes" | "encadrement" | "doublement" | "precision";
export const PHASES_ARCHIMEDE: PhaseArchimede[] = ["angle", "cotes", "encadrement", "doublement", "precision"];

const NOMS: Record<number, string> = { 4: "un carré", 5: "un pentagone régulier", 6: "un hexagone régulier", 8: "un octogone régulier", 10: "un décagone régulier", 12: "un dodécagone régulier" };

/** Angle en degrés : « 30^\circ », « 22{,}5^\circ ». */
export const degL = (d: number) => `${nbL(d, 4)}^\\circ`;
/** Valeur au millième (≈). */
export const milL = (x: number) => nbL(x, 3, true);
export const cenL = (x: number) => nbL(x, 2, true);
/** Largeur : trois chiffres significatifs. */
export function largeurL(w: number): string {
  const dec = Math.max(3, -Math.floor(Math.log10(w)) + 2);
  return nbL(w, dec, true);
}
export const seuilL = (e: E) => nbL(e.seuil, 3);
export const seuilT = (e: E) => nbT(e.seuil, 3);

export function situation(e: E): Frag[] {
  return [
    tx(`Un cercle de centre C a un rayon de ${e.r} cm. Comme Archimède, on l'encadre entre deux polygones réguliers à ${e.n} côtés (${NOMS[e.n]}) : l'un inscrit dans le cercle (côté [AB], de milieu H), l'autre circonscrit (côté [DE], tangent au cercle en F). L'angle `),
    lx("\\alpha=\\widehat{HCB}"),
    tx(" est la moitié de l'angle au centre qui intercepte un côté."),
  ];
}

export function consigneGenerale(e: E): Frag[] {
  return situation(e);
}

export function libelle(_e: E, phase: PhaseArchimede): string {
  switch (phase) {
    case "angle":
      return "Angle α";
    case "cotes":
      return "Côtés";
    case "encadrement":
      return `Encadrement (${_e.n} côtés)`;
    case "doublement":
      return `Encadrement (${2 * _e.n} côtés)`;
    case "precision":
      return "Nombre de côtés";
  }
}

export function consigne(e: E, phase: PhaseArchimede): Frag[] {
  switch (phase) {
    case "angle":
      return [tx("Calcule l'angle "), lx("\\alpha"), tx(" (en degrés).")];
    case "cotes":
      return [tx("Calcule la longueur des côtés "), lx("|AB|"), tx(" et "), lx("|DE|"), tx(" des deux polygones, en cm, au centième.")];
    case "encadrement":
      return [tx(`Déduis-en un encadrement de π : compare le périmètre du cercle à ceux des deux polygones et simplifie. Donne le minorant et le majorant au millième.`)];
    case "doublement":
      return [tx(`Comme Archimède, double le nombre de côtés : donne l'encadrement de π obtenu avec ${2 * e.n} côtés, au millième.`)];
    case "precision":
      return [tx(`Archimède continue de doubler le nombre de côtés (${e.n}, ${2 * e.n}, ${4 * e.n}…). À partir de combien de côtés la largeur de l'encadrement (majorant − minorant) devient-elle inférieure à ${seuilT(e)} ?`)];
  }
}

export function champs(e: E, phase: PhaseArchimede): ChampEcran[] {
  switch (phase) {
    case "angle":
      return [{ label: "α", labelLatex: "\\alpha =", unite: "degrés", placeholder: "ex. : 30" }];
    case "cotes":
      return [
        { label: "|AB|", labelLatex: "|AB| =", unite: "cm", placeholder: "ex. : 5,18" },
        { label: "|DE|", labelLatex: "|DE| =", unite: "cm", placeholder: "ex. : 5,36" },
      ];
    case "encadrement":
    case "doublement":
      return [
        { label: "minorant", labelLatex: "\\text{minorant} =", placeholder: "ex. : 3,106" },
        { label: "majorant", labelLatex: "\\text{majorant} =", placeholder: "ex. : 3,215" },
      ];
    case "precision":
      return [{ label: "nombre de côtés", labelLatex: "\\text{nombre de côtés} =", placeholder: `ex. : ${8 * e.n}` }];
  }
}

export function aide1(_e: E, phase: PhaseArchimede): AideEcran {
  switch (phase) {
    case "angle":
      return { texte: [tx("Le polygone découpe le cercle en "), lx("n"), tx(" triangles isocèles de même angle au centre ; la hauteur [CH] partage cet angle en deux (cours, § 1) :")], latex: "\\text{angle au centre}=\\dfrac{360^\\circ}{n}" };
    case "cotes":
      return { texte: [tx("Dans le triangle rectangle CHB, [HB] est le côté opposé à "), lx("\\alpha"), tx(" ; dans le triangle rectangle CFD, [FD] aussi. Chaque côté vaut le double (cours, § 1) :")], latex: "|AB|=2r\\sin\\alpha\\qquad |DE|=2r\\tan\\alpha" };
    case "encadrement":
      return { texte: [tx("Le périmètre du cercle est entre les périmètres des deux polygones ; divise tout par "), lx("2r"), tx(" :")], latex: "n\\cdot 2r\\sin\\alpha\\leq 2\\pi r\\leq n\\cdot 2r\\tan\\alpha" };
    case "doublement":
      return { texte: [tx("Avec deux fois plus de côtés, le demi-angle au centre est deux fois plus petit :")], latex: "2n\\sin\\dfrac{\\alpha}{2}\\leq\\pi\\leq 2n\\tan\\dfrac{\\alpha}{2}" };
    case "precision":
      return { texte: [tx("La largeur de l'encadrement à "), lx("n"), tx(" côtés vaut ci-dessous ; calcule-la pour chaque doublement, jusqu'à passer sous le seuil :")], latex: "w_n=n\\tan\\dfrac{180^\\circ}{n}-n\\sin\\dfrac{180^\\circ}{n}" };
  }
}

export function aide2(e: E, phase: PhaseArchimede): AideEcran | null {
  const a = degL(e.alphaDeg);
  switch (phase) {
    case "angle":
      return { texte: [tx(`Ici, ${e.n} côtés :`)], latex: `\\alpha=\\dfrac{1}{2}\\cdot\\dfrac{360^\\circ}{${e.n}}` };
    case "cotes":
      return { texte: [tx("Ici, avec la calculatrice en mode degré :")], latex: `|AB|=2\\cdot ${e.r}\\cdot\\sin ${a}\\qquad |DE|=2\\cdot ${e.r}\\cdot\\tan ${a}` };
    case "encadrement":
      return { texte: [tx("Ici, après simplification par "), lx("2r"), tx(" :")], latex: `${e.n}\\sin ${a}\\leq\\pi\\leq ${e.n}\\tan ${a}` };
    case "doublement":
      return { texte: [tx(`Ici, ${2 * e.n} côtés et un demi-angle de `), lx(degL(e.alphaDeg / 2)), tx(" :")], latex: `${2 * e.n}\\sin ${degL(e.alphaDeg / 2)}\\leq\\pi\\leq ${2 * e.n}\\tan ${degL(e.alphaDeg / 2)}` };
    case "precision": {
      const n4 = 4 * e.n;
      return { texte: [tx(`Ici, tu connais déjà les largeurs pour ${e.n} et ${2 * e.n} côtés (écrans précédents) ; continue avec ${n4} côtés, puis ${8 * e.n}… :`)], latex: `w_{${n4}}=${n4}\\tan ${degL(180 / n4)}-${n4}\\sin ${degL(180 / n4)}` };
    }
  }
}

export function messageIllisible(_e: E, phase: PhaseArchimede): string {
  if (phase === "precision") return "Nombre non reconnu : écris un nombre entier de côtés, par exemple 48. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre décimal comme 3,106 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
}

function egalOuEnviron(x: number, dec: number): string {
  return exactA(x, dec) ? `=${nbL(x, dec)}` : `\\approx ${nbL(x, dec, true)}`;
}

export function encadrementL(min: number, max: number): string {
  return `${milL(parDefaut(min))}\\leq\\pi\\leq ${milL(parExces(max))}`;
}

export function reponse(e: E, phase: PhaseArchimede): Frag[] {
  switch (phase) {
    case "angle":
      return [lx(`\\alpha=${degL(e.alphaDeg)}`)];
    case "cotes":
      return [lx(`|AB|${egalOuEnviron(e.coteInscrit, 2)}`), tx(" cm ; "), lx(`|DE|${egalOuEnviron(e.coteCirconscrit, 2)}`), tx(" cm")];
    case "encadrement":
      return [lx(encadrementL(e.minorant, e.majorant))];
    case "doublement":
      return [lx(encadrementL(e.minorant2, e.majorant2))];
    case "precision":
      return [tx(`À partir de ${e.nSeuil} côtés.`)];
  }
}

export function recap(e: E, phase: PhaseArchimede): Frag[] {
  return reponse(e, phase);
}
