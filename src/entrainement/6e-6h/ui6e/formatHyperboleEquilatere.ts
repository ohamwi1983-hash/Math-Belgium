import type { Exercice137, Phase137 } from "../core6e/hyperboleEquilatere";
import { branchesXY, c137, conique137, foyers137, phases137, sommets137, sommetsXY137 } from "../core6e/hyperboleEquilatere";
import { exL, nomPtExL, valP } from "../core6e/coniquesLotH1";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { ILLISIBLE, figureRepere, l, nb, t } from "./outilsLieuxLotH1";
import { COULEURS } from "./outilsLieuxLotH2";
import { figureConique } from "./figureConiquesLotH1";
import { apercuLibre } from "../moteur6e/saisieConiquesLotH1";

/**
 * Couche C — textes de `6gen137` « Hyperbole équilatère et xy = k » : énoncés, champs, aides à deux
 * niveaux (cours, puis posée pour l'instance — jamais la réponse), réponses, figures (la courbe et ses
 * asymptotes : rien de ce qui est demandé n'y est marqué).
 */

type E = Exercice137;
type Ph = Phase137;

export function situation137(e: E): Frag[] {
  if (e.variante === "versXY")
    return [t("Dans un repère orthonormé, on donne l'hyperbole équilatère "), l(`\\mathcal{H}\\equiv x^2-y^2=${e.a2}`), t(". Dans le repère orthonormé (X ; Y) dont les axes sont ses asymptotes (orienté pour que les branches soient dans les quadrants où X et Y ont le même signe), son équation s'écrit "), l("XY=k"), t(" avec k > 0.")];
  return [t("Dans un repère orthonormé, on donne l'hyperbole "), l(`\\mathcal{H}\\equiv xy=${e.k}`), t(". Ses asymptotes sont les axes du repère ; dans le repère orthonormé (X ; Y) dont les axes sont ses axes de symétrie (l'axe des X porté par la droite y = x), son équation s'écrit "), l("X^2-Y^2=a^2"), t(".")];
}

export function consigneGlobale137(e: E): Frag[] {
  if (e.variante === "versXY") return [t("Calcule la demi-distance focale c de "), l("\\mathcal{H}"), t(", puis la constante k, et donne les coordonnées des sommets de "), l("\\mathcal{H}"), t(" dans le repère (X ; Y) de ses asymptotes.")];
  return [t("Calcule "), l("a^2"), t(", puis donne, dans le repère de départ, les coordonnées des sommets et des foyers de "), l("\\mathcal{H}"), t(".")];
}

export const consigneGenerale137 = (e: E): Frag[] => [...situation137(e), t(" "), ...consigneGlobale137(e)];

const LIBELLE: Record<Ph, string> = { c: "Demi-distance focale c", k: "Constante k", sommetsXY: "Sommets dans le repère (X ; Y)", a2: "Constante a²", sommets: "Sommets", foyers: "Foyers" };
export const libelle137 = (_e: E, p: Ph) => LIBELLE[p];

export function consigne137(_e: E, p: Ph): Frag[] {
  switch (p) {
    case "c":
      return [t("Calcule la demi-distance focale c de l'hyperbole (valeur exacte).")];
    case "k":
      return [t("Calcule la constante k de l'équation "), l("XY=k"), t(".")];
    case "sommetsXY":
      return [t("Donne les coordonnées des deux sommets de l'hyperbole dans le repère (X ; Y) de ses asymptotes.")];
    case "a2":
      return [t("Calcule "), l("a^2"), t(" dans l'équation "), l("X^2-Y^2=a^2"), t(".")];
    case "sommets":
      return [t("Donne les coordonnées des deux sommets de l'hyperbole, dans le repère de départ (x ; y).")];
    case "foyers":
      return [t("Donne les coordonnées des deux foyers de l'hyperbole, dans le repère de départ (x ; y).")];
  }
}

export function champs137(_e: E, p: Ph): ChampEcran[] {
  if (p === "c" || p === "k" || p === "a2") {
    const lb: Record<string, [string, string]> = { c: ["Demi-distance focale c", "c="], k: ["Constante k", "k="], a2: ["Constante a²", "a^2="] };
    return [{ label: lb[p]![0], labelLatex: lb[p]![1], placeholder: "nombre exact", apercuLatex: apercuLibre }];
  }
  return [{ label: LIBELLE[p], placeholder: "(… ; …) ; (… ; …)", apercuLatex: apercuLibre }];
}

export const messageIllisible137 = (_e: E, p: Ph): string => (p === "c" || p === "k" || p === "a2" ? ILLISIBLE.nombre : ILLISIBLE.points);

const deux = (nom: string, pts: ReturnType<typeof sommets137>) => pts.map((q, i) => nomPtExL(i === 0 ? nom : `${nom}'`, q)).join("\\ ;\\ ");

export function reponse137(e: E, p: Ph): Frag[] {
  switch (p) {
    case "c":
      return [l(`c=${exL(c137(e))}`)];
    case "k":
      return [l(`k=\\dfrac{a^2}{2}=${nb(e.k)}`)];
    case "sommetsXY":
      return [l(deux("A", sommetsXY137(e)))];
    case "a2":
      return [l(`a^2=2k=${nb(e.a2)}`)];
    case "sommets":
      return [l(deux("A", sommets137(e)))];
    case "foyers":
      return [l(deux("F", foyers137(e)))];
  }
}

export const recap137 = reponse137;

export function aide1_137(_e: E, p: Ph): AideEcran {
  switch (p) {
    case "c":
      return { texte: [t("Cours, § 1 : pour une hyperbole, "), l("c^2=a^2+b^2"), t(" ; une hyperbole équilatère a b = a.")] };
    case "k":
      return { texte: [t("Cours, § 1 : dans le repère de ses asymptotes, l'hyperbole équilatère "), l("x^2-y^2=a^2"), t(" a pour équation :")], latex: "XY=\\dfrac{a^2}{2}" };
    case "sommetsXY":
      return { texte: [t("Cours, § 1 : les sommets sont sur l'axe de symétrie, qui est la bissectrice des asymptotes : leurs deux coordonnées (X ; Y) sont égales, et vérifient "), l("XY=k"), t(".")] };
    case "a2":
      return { texte: [t("Cours, § 1 : les deux formes "), l("X^2-Y^2=a^2"), t(" et "), l("xy=k"), t(" décrivent la même hyperbole équilatère, avec :")], latex: "k=\\dfrac{a^2}{2}" };
    case "sommets":
      return { texte: [t("Cours, § 1 : les sommets de "), l("xy=k"), t(" sont sur l'axe de symétrie y = x : remplace y par x dans l'équation.")] };
    case "foyers":
      return { texte: [t("Cours, § 1 : les foyers sont sur la droite y = x, à la distance "), l("c=a\\sqrt{2}"), t(" du centre O.")] };
  }
}

export function aide2_137(e: E, p: Ph): AideEcran | null {
  switch (p) {
    case "c":
      return { texte: [t("Ici, "), l(`a^2=b^2=${e.a2}`), t(".")] };
    case "k":
      return { texte: [t("Ici, "), l(`a^2=${e.a2}`), t(" : attention, k n'est pas a².")] };
    case "sommetsXY":
      return { texte: [t("Ici, cherche X > 0 tel que "), l(`X\\cdot X=${nb(e.k)}`), t(", puis l'opposé.")] };
    case "a2":
      return { texte: [t("Ici, "), l(`k=${e.k}`), t(".")] };
    case "sommets":
      return { texte: [t("Ici, résous "), l(`x^2=${e.k}`), t(".")] };
    case "foyers":
      return { texte: [t("Ici, "), l(`a^2=${e.a2}`), t(" : calcule c, puis le point de la droite y = x à la distance c de O (ses deux coordonnées valent "), l("\\dfrac{c}{\\sqrt{2}}"), t(").")] };
  }
}

export function figure137(e: E): string {
  if (e.variante === "versXY") return figureConique(conique137(e), { asymptotes: true, largeur: 280 });
  const s = Math.sqrt(2 * e.k) + 2;
  const borne = Math.ceil(s);
  return figureRepere({
    fenetre: { xMin: -borne, xMax: borne, yMin: -borne, yMax: borne },
    unite: Math.max(10, Math.min(24, Math.floor(280 / (2 * borne)))),
    graduationsLisibles: true,
    courbes: branchesXY(e.k, borne + 1).map((points) => ({ points, couleur: COULEURS.bleu })),
    droites: [{ d: { a: 1, b: -1, c: 0 }, couleur: COULEURS.gris, pointille: true, epaisseur: 1.2 }],
  });
}

export function figureCorrige137(e: E): string {
  if (e.variante === "versXY") return figureConique(conique137(e), { asymptotes: true, sommets: true, foyers: true, largeur: 280 });
  const s = Math.sqrt(2 * e.k) + 2;
  const borne = Math.ceil(s);
  return figureRepere({
    fenetre: { xMin: -borne, xMax: borne, yMin: -borne, yMax: borne },
    unite: Math.max(10, Math.min(24, Math.floor(280 / (2 * borne)))),
    graduationsLisibles: true,
    courbes: branchesXY(e.k, borne + 1).map((points) => ({ points, couleur: COULEURS.bleu })),
    droites: [{ d: { a: 1, b: -1, c: 0 }, couleur: COULEURS.gris, pointille: true, epaisseur: 1.2 }],
    points: [
      ...sommets137(e).map((q, i) => ({ P: valP(q), label: i === 0 ? "A" : "A′", couleur: COULEURS.noir })),
      ...foyers137(e).map((q, i) => ({ P: valP(q), label: i === 0 ? "F" : "F′", couleur: COULEURS.accent })),
    ],
  });
}

export { phases137 };
