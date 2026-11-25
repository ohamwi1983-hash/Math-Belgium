import type { Champ123, Exercice123, Phase123, Support123 } from "../core6e/demontrerAnalytique";
import { LETTRES_123, PHASES_123, champsCalcul, champsCoordonnees } from "../core6e/demontrerAnalytique";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { expressionLibreVersLatex } from "../../5e-4h/ui/formatExpressionLatex";
import { ILLISIBLE, l, t } from "./outilsLieuxLotH1";

/**
 * Couche C — textes de `6gen123` « Démontrer par la géométrie analytique » : énoncé « Démontre que… »
 * (jamais la méthode), trois repères et quatre égalités par propriété (ordre propre à l'instance),
 * champs en lettres, aides à deux niveaux (méthode du cours § 3, puis posée pour l'instance — jamais le
 * résultat), messages d'un choix faux, figure de la configuration (valeurs d'illustration, sans
 * coordonnées).
 */

type E = Exercice123;
type Ph = Phase123;

const pt = (nom: string, x: string, y: string) => `${nom}(${x}\\,;${y})`;

export function enonce123(e: E): Frag[] {
  const [A, B, C, D] = e.noms;
  switch (e.support) {
    case "parallelogramme":
      return [t(`Démontre que les diagonales d'un parallélogramme ${A}${B}${C}${D} quelconque se coupent en leur milieu.`)];
    case "medianes":
      return [t(`Démontre que les trois médianes d'un triangle ${A}${B}${C} quelconque sont concourantes (on note ${A}', ${B}', ${C}' les milieux des côtés opposés à ${A}, ${B}, ${C}).`)];
    case "varignon":
      return [t(`Démontre que les milieux I, J, K, L des côtés [${A}${B}], [${B}${C}], [${C}${D}], [${D}${A}] d'un quadrilatère ${A}${B}${C}${D} quelconque forment un parallélogramme.`)];
    case "rectangleMediane":
      return [t(`Démontre que, dans un triangle ${A}${B}${C} rectangle en ${A}, la médiane issue de ${A} mesure la moitié de l'hypoténuse [${B}${C}] (on note M le milieu de [${B}${C}]).`)];
    case "losange":
      return [t(`Démontre que les diagonales d'un losange ${A}${B}${C}${D} sont perpendiculaires.`)];
  }
}

export const consigneGlobale123 = (): Frag[] => [t("Rédige la démonstration par la géométrie analytique : choix d'un repère, coordonnées des points utiles, égalité à établir et calcul.")];
export const consigneGenerale123 = (e: E): Frag[] => [...enonce123(e), t(" "), ...consigneGlobale123()];

const LIBELLE: Record<Ph, string> = { repere: "Repère", coordonnees: "Coordonnées", egalite: "Égalité à établir", calcul: "Calcul" };
export const libelle123 = (_e: E, p: Ph) => LIBELLE[p];

export function consigne123(e: E, p: Ph): Frag[] {
  switch (p) {
    case "repere":
      return [t("Quel repère choisir pour que la démonstration vaille dans tous les cas ?")];
    case "coordonnees":
      return [t("Dans ce repère, calcule les coordonnées des points utiles, en fonction des lettres.")];
    case "egalite":
      return [t("Quelle égalité faut-il établir pour conclure ?")];
    case "calcul":
      return [t(e.support === "losange" ? "Calcule cette expression en fonction de a, b et c (sans encore utiliser l'hypothèse sur b et c)." : "Calcule les deux membres de cette égalité en fonction des lettres.")];
  }
}

/** Les trois repères : 0 = adapté et général, 1 = trop particulier, 2 = exemple numérique. */
export function reperes123(e: E): Frag[][] {
  const [A, B, C, D] = e.noms;
  const ex = e.exemple;
  switch (e.support) {
    case "parallelogramme":
      return [
        [l(`${pt(A, "0", "0")},\\ ${pt(B, "2a", "0")},\\ ${pt(D, "2b", "2c")}`), t(", avec a, b, c réels quelconques (a et c non nuls)")],
        [l(`${pt(A, "0", "0")},\\ ${pt(B, "2a", "0")},\\ ${pt(D, "0", "2c")}`), t(", avec a et c non nuls")],
        [l([`${pt(A, "0", "0")},\\ ${pt(B, "4", "0")},\\ ${pt(D, "1", "3")}`, `${pt(A, "0", "0")},\\ ${pt(B, "6", "0")},\\ ${pt(D, "2", "4")}`, `${pt(A, "0", "0")},\\ ${pt(B, "5", "0")},\\ ${pt(D, "3", "2")}`][ex]!)],
      ];
    case "medianes":
      return [
        [l(`${pt(A, "0", "0")},\\ ${pt(B, "2a", "0")},\\ ${pt(C, "2b", "2c")}`), t(", avec a, b, c réels quelconques (a et c non nuls)")],
        [l(`${pt(A, "0", "0")},\\ ${pt(B, "2a", "0")},\\ ${pt(C, "a", "2c")}`), t(", avec a et c non nuls")],
        [l([`${pt(A, "0", "0")},\\ ${pt(B, "6", "0")},\\ ${pt(C, "2", "4")}`, `${pt(A, "0", "0")},\\ ${pt(B, "4", "0")},\\ ${pt(C, "1", "3")}`, `${pt(A, "0", "0")},\\ ${pt(B, "8", "0")},\\ ${pt(C, "3", "6")}`][ex]!)],
      ];
    case "varignon":
      return [
        [l(`${pt(A, "0", "0")},\\ ${pt(B, "2a", "0")},\\ ${pt(C, "2b", "2c")},\\ ${pt(D, "2d", "2e")}`), t(", avec a, b, c, d, e quelconques")],
        [l(`${pt(A, "0", "0")},\\ ${pt(B, "2a", "0")},\\ ${pt(C, "2a", "2c")},\\ ${pt(D, "0", "2c")}`), t(", avec a et c non nuls")],
        [l([`${pt(A, "0", "0")},\\ ${pt(B, "6", "0")},\\ ${pt(C, "4", "4")},\\ ${pt(D, "0", "2")}`, `${pt(A, "0", "0")},\\ ${pt(B, "8", "0")},\\ ${pt(C, "6", "6")},\\ ${pt(D, "2", "4")}`, `${pt(A, "0", "0")},\\ ${pt(B, "4", "0")},\\ ${pt(C, "6", "2")},\\ ${pt(D, "2", "4")}`][ex]!)],
      ];
    case "rectangleMediane":
      return [
        [l(`${pt(A, "0", "0")},\\ ${pt(B, "2a", "0")},\\ ${pt(C, "0", "2b")}`), t(", avec a et b non nuls")],
        [l(`${pt(A, "0", "0")},\\ ${pt(B, "2a", "0")},\\ ${pt(C, "0", "2a")}`), t(", avec a non nul")],
        [l([`${pt(A, "0", "0")},\\ ${pt(B, "6", "0")},\\ ${pt(C, "0", "4")}`, `${pt(A, "0", "0")},\\ ${pt(B, "8", "0")},\\ ${pt(C, "0", "6")}`, `${pt(A, "0", "0")},\\ ${pt(B, "4", "0")},\\ ${pt(C, "0", "2")}`][ex]!)],
      ];
    case "losange":
      return [
        [l(`${pt(A, "0", "0")},\\ ${pt(B, "a", "0")},\\ ${pt(D, "b", "c")}`), t(", avec "), l("b^2+c^2=a^2"), t(` (${A}${D} = ${A}${B}), a et c non nuls`)],
        [l(`${pt(A, "0", "0")},\\ ${pt(B, "a", "0")},\\ ${pt(D, "0", "a")}`), t(", avec a non nul")],
        [l([`${pt(A, "0", "0")},\\ ${pt(B, "5", "0")},\\ ${pt(D, "3", "4")}`, `${pt(A, "0", "0")},\\ ${pt(B, "10", "0")},\\ ${pt(D, "6", "8")}`, `${pt(A, "0", "0")},\\ ${pt(B, "13", "0")},\\ ${pt(D, "5", "12")}`][ex]!)],
      ];
  }
}

const NOM_FIGURE: Record<Support123, { tous: string; particulier: string }> = {
  parallelogramme: { tous: "parallélogrammes", particulier: "un angle droit : ce repère ne décrit que des rectangles" },
  medianes: { tous: "triangles", particulier: "un sommet au-dessus du milieu du côté opposé : ce repère ne décrit que des triangles isocèles" },
  varignon: { tous: "quadrilatères", particulier: "des angles droits : ce repère ne décrit que des rectangles" },
  rectangleMediane: { tous: "triangles rectangles", particulier: "deux côtés de l'angle droit égaux : ce repère ne décrit que des triangles rectangles isocèles" },
  losange: { tous: "losanges", particulier: "un angle droit : ce repère ne décrit que des carrés" },
};

export function messageRepere(e: E, i: number): Frag[] {
  if (i === 1) return [t(`Ce repère impose ${NOM_FIGURE[e.support].particulier}. La démonstration ne vaudrait pas pour tous les ${NOM_FIGURE[e.support].tous}.`)];
  return [t(`Avec des nombres, on ne vérifie la propriété que pour une seule figure : un exemple n'est pas une démonstration. Il faut des lettres (paramètres génériques) pour couvrir tous les ${NOM_FIGURE[e.support].tous}.`)];
}

/** Les quatre égalités : 0 = celle à établir. */
export function egalites123(e: E): { fr: Frag[]; message: string }[] {
  const [A, B, C, D] = e.noms;
  const prod = (u: string, v: string) => `x_{\\vec{${u}}}\\,x_{\\vec{${v}}}+y_{\\vec{${u}}}\\,y_{\\vec{${v}}}=0`;
  switch (e.support) {
    case "parallelogramme":
      return [
        { fr: [t(`Le milieu de [${A}${C}] et le milieu de [${B}${D}] ont les mêmes coordonnées.`)], message: "" },
        { fr: [l(`${A}${C}^2=${B}${D}^2`)], message: "Des diagonales de même longueur : c'est vrai pour un rectangle, pas pour tout parallélogramme." },
        { fr: [l(prod(`${A}${C}`, `${B}${D}`))], message: "Des diagonales perpendiculaires : c'est une propriété du losange, pas ce qu'on demande." },
        { fr: [l(`\\vec{${A}${B}}=\\vec{${D}${C}}`)], message: "C'est l'hypothèse (la définition du parallélogramme), pas la conclusion à démontrer." },
      ];
    case "medianes":
      return [
        { fr: [t(`Le point situé aux deux tiers de [${A}${A}'] depuis ${A} et celui situé aux deux tiers de [${B}${B}'] depuis ${B} ont les mêmes coordonnées (et de même pour [${C}${C}']).`)], message: "" },
        { fr: [l(`${A}${A}'^2=${B}${B}'^2`)], message: "Deux médianes n'ont pas la même longueur en général ; et des longueurs égales ne prouveraient pas qu'elles se coupent en un même point." },
        { fr: [t(`Le milieu de [${A}${A}'] et le milieu de [${B}${B}'] ont les mêmes coordonnées.`)], message: "Les médianes ne se coupent pas en leur milieu : leur point commun est aux deux tiers à partir du sommet." },
        { fr: [l(prod(`${A}${A}'`, `${B}${B}'`))], message: "Deux médianes ne sont pas perpendiculaires en général ; on cherche un point commun aux trois." },
      ];
    case "varignon":
      return [
        { fr: [l("\\vec{IJ}=\\vec{LK}")], message: "" },
        { fr: [l("IJ^2=JK^2")], message: "Deux côtés consécutifs égaux : ce serait un losange, ce n'est pas vrai en général." },
        { fr: [l("IK^2=JL^2")], message: "Des diagonales de même longueur : ce serait un rectangle, ce n'est pas vrai en général." },
        { fr: [l(prod("IJ", "JK"))], message: "Deux côtés consécutifs perpendiculaires : ce serait un rectangle, ce n'est pas vrai en général." },
      ];
    case "rectangleMediane":
      return [
        { fr: [l(`4\\,${A}M^2=${B}${C}^2`), t(` (c'est-à-dire ${A}M = ${B}${C} ÷ 2)`)], message: "" },
        { fr: [l(`${A}M^2=${B}${C}^2`)], message: "La médiane mesure la moitié de l'hypoténuse : il manque le facteur 1/2 (ou 4 pour les carrés)." },
        { fr: [l(`\\vec{${A}M}=\\vec{M${B}}`)], message: "Cette égalité dirait que M est le milieu de l'autre segment : ce n'est ni vrai, ni ce qu'on demande." },
        { fr: [l(prod(`${A}M`, `${B}${C}`))], message: "La médiane n'est pas perpendiculaire à l'hypoténuse en général (seulement si le triangle est isocèle)." },
      ];
    case "losange":
      return [
        { fr: [l(prod(`${A}${C}`, `${B}${D}`))], message: "" },
        { fr: [l(`${A}${C}^2=${B}${D}^2`)], message: "Des diagonales de même longueur : c'est vrai pour un carré, pas pour tout losange." },
        { fr: [t(`Le milieu de [${A}${C}] et le milieu de [${B}${D}] ont les mêmes coordonnées.`)], message: "C'est vrai (tout losange est un parallélogramme), mais cela ne prouve pas que les diagonales sont perpendiculaires." },
        { fr: [l(`\\vec{${A}${C}}=\\vec{${B}${D}}`)], message: "Les diagonales n'ont pas la même direction : cette égalité est fausse." },
      ];
  }
}

export const estChoix123 = (_e: E, p: Ph) => p === "repere" || p === "egalite";

export function options123(e: E, p: Ph): OptionEcran[] {
  if (p === "repere") {
    const r = reperes123(e);
    return e.ordreRepere.map((i) => ({ id: String(i), fragments: r[i]! }));
  }
  const g = egalites123(e);
  return e.ordreEgalite.map((i) => ({ id: String(i), fragments: g[i]!.fr }));
}

export const champs123Modele = (e: E, p: Ph): Champ123[] => (p === "coordonnees" ? champsCoordonnees(e) : p === "calcul" ? champsCalcul(e) : []);

/** Aperçu KaTeX d'un point en lettres « (a+b ; c) ». */
function apercuPointLettres(s: string): string | null {
  const m = /^\s*\(\s*([^;]+);([^;]+)\)\s*$/.exec(s.replace(/^\s*[A-Za-z][A-Za-z0-9_′']*\s*=\s*/, ""));
  if (!m) return null;
  try {
    return `\\left(${expressionLibreVersLatex(m[1]!.trim())}\\,;${expressionLibreVersLatex(m[2]!.trim())}\\right)`;
  } catch {
    return null;
  }
}

export function champs123(e: E, p: Ph): ChampEcran[] {
  return champs123Modele(e, p).map((c) =>
    c.type === "point"
      ? { label: c.label, labelLatex: `${c.nom.startsWith("milieu") ? `\\text{${c.nom}}` : c.nom}=`, placeholder: "(… ; …)", apercuLatex: apercuPointLettres }
      : { label: c.label, labelLatex: `${c.nom}=`, placeholder: `expression en ${LETTRES_123[e.support].join(", ")}`, apercu: true },
  );
}

export function messageIllisible123(e: E, p: Ph): string {
  const lettres = LETTRES_123[e.support];
  const cs = champs123Modele(e, p);
  return cs.some((c) => c.type === "point") ? ILLISIBLE.pointLettres(lettres) : ILLISIBLE.lettres(lettres);
}

export const bonneOption123 = (_e: E, _p: Ph) => "0";

export const champLatex = (c: Champ123) => (c.type === "point" ? `${c.nom.startsWith("milieu") ? `\\text{${c.nom}}` : c.nom}=\\left(${c.xL}\\,;${c.yL}\\right)` : `${c.nom}=${c.fL}`);

export function reponse123(e: E, p: Ph): Frag[] {
  if (p === "repere") return reperes123(e)[0]!;
  if (p === "egalite") return egalites123(e)[0]!.fr;
  const cs = champs123Modele(e, p);
  return cs.flatMap((c, i) => [...(i > 0 ? [t(" ; ")] : []), l(champLatex(c))]);
}

export const recap123 = (e: E, p: Ph): Frag[] => reponse123(e, p);

export function aide1_123(_e: E, p: Ph): AideEcran {
  switch (p) {
    case "repere":
      return { texte: [t(`Méthode du cours, § 3 : un repère adapté place un sommet à l'origine et un côté sur un axe, puis donne aux autres coordonnées des lettres quelconques (paramètres génériques) — le facteur 2 évite les fractions dans les milieux.`)] };
    case "coordonnees":
      return {
        texte: [t(`Cours, § 3 et § 1 : le milieu a pour coordonnées la moyenne de celles des extrémités ; dans un parallélogramme ABCD, `), l("\\vec{AB}=\\vec{DC}"), t(", donc :")],
        latex: "x_C=x_B+x_D-x_A\\qquad y_C=y_B+y_D-y_A",
      };
    case "egalite":
      return { texte: [t(`Cours, § 3 : on traduit la conclusion en égalité — « se coupent en leur milieu » : mêmes coordonnées de milieux ; « parallélogramme » : deux vecteurs égaux ; « perpendiculaires » : `), l("x\\,x'+y\\,y'=0"), t(" ; « longueur moitié » : égalité de carrés de longueurs.")] };
    case "calcul":
      return { texte: [t(`Cours, § 3 : on calcule les deux membres avec les coordonnées en lettres, puis on vérifie qu'ils coïncident quelles que soient les lettres :`)], latex: "AB^2=(x_B-x_A)^2+(y_B-y_A)^2" };
  }
}

export function aide2_123(e: E, p: Ph): AideEcran | null {
  const [A, B, C, D] = e.noms;
  switch (p) {
    case "repere":
      return { texte: [t(`Ici, le repère doit représenter tous les ${NOM_FIGURE[e.support].tous} : impose-t-il un angle droit, deux côtés égaux, ou des valeurs numériques ?`)] };
    case "coordonnees":
      switch (e.support) {
        case "parallelogramme":
        case "losange":
          return { texte: [t(`Ici, ${C} se déduit de ${A}, ${B} et ${D} par `), l(`\\vec{${A}${B}}=\\vec{${D}${C}}`), t(".")] };
        default:
          return { texte: [t("Ici, chaque milieu est la moyenne des coordonnées des extrémités : additionne, puis divise par 2.")] };
      }
    case "egalite":
      return { texte: [t("Ici, relis la phrase « Démontre que… » : quelle propriété exacte faut-il obtenir ?")] };
    case "calcul":
      switch (e.support) {
        case "parallelogramme":
          return { texte: [t(`Ici, prends les coordonnées de ${A}, ${C} puis de ${B}, ${D} dans le repère choisi.`)] };
        case "medianes":
          return { texte: [t(`Ici, le point aux deux tiers de [${A}${A}'] depuis ${A} est `), l(`${A}+\\dfrac{2}{3}\\,\\vec{${A}${A}'}`), t(` ; de même depuis ${B}.`)] };
        case "varignon":
          return { texte: [t("Ici, "), l("\\vec{IJ}"), t(" a pour composantes "), l("(x_J-x_I\\,;y_J-y_I)"), t(".")] };
        case "rectangleMediane":
          return { texte: [t(`Ici, utilise ${A}(0 ; 0), M et ${B}, ${C} dans la formule de la longueur au carré.`)] };
        case "losange":
          return { texte: [t("Ici, "), l(`\\vec{${A}${C}}`), t(" et "), l(`\\vec{${B}${D}}`), t(" se calculent avec les coordonnées de l'écran précédent.")] };
      }
  }
}

export function piegeChoix123(e: E, p: Ph, choix: string): Frag[] | null {
  if (choix === "0") return null;
  const i = Number(choix);
  return p === "repere" ? messageRepere(e, i) : [t(egalites123(e)[i]?.message ?? "")];
}

// ---------------------------------------------------------------------------------------------
// Figure de la configuration (valeurs d'illustration, sans coordonnées)
// ---------------------------------------------------------------------------------------------

interface Pt {
  x: number;
  y: number;
}

function sommetsIllustration(e: E): Pt[] {
  switch (e.support) {
    case "parallelogramme":
      return [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 8, y: 4 }, { x: 2, y: 4 }];
    case "medianes":
      return [{ x: 0, y: 0 }, { x: 7, y: 0 }, { x: 2, y: 5 }];
    case "varignon":
      return [{ x: 0, y: 0 }, { x: 7, y: 0 }, { x: 6, y: 5 }, { x: 1.5, y: 4 }];
    case "rectangleMediane":
      return [{ x: 0, y: 0 }, { x: 7, y: 0 }, { x: 0, y: 4.5 }];
    case "losange":
      return [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 8, y: 4 }, { x: 3, y: 4 }];
  }
}

const f1 = (v: number) => String(Math.round(v * 10) / 10);

export function figure123(e: E): string {
  const S = sommetsIllustration(e);
  const n = S.length;
  const xs = S.map((p) => p.x);
  const ys = S.map((p) => p.y);
  const xMin = Math.min(...xs, 0) - 1;
  const xMax = Math.max(...xs) + 1;
  const yMin = Math.min(...ys, 0) - 1;
  const yMax = Math.max(...ys) + 1;
  const k = 30;
  const W = (xMax - xMin) * k;
  const H = (yMax - yMin) * k;
  const X = (x: number) => (x - xMin) * k;
  const Y = (y: number) => (yMax - y) * k;
  const noir = "#1b1d22";
  const parts: string[] = [`<rect x="0" y="0" width="${f1(W)}" height="${f1(H)}" fill="#ffffff"/>`];
  // Axes (le premier sommet à l'origine).
  parts.push(`<line x1="${f1(X(xMin))}" y1="${f1(Y(0))}" x2="${f1(X(xMax) - 4)}" y2="${f1(Y(0))}" stroke="#6b7280" stroke-width="1"/>`);
  parts.push(`<line x1="${f1(X(0))}" y1="${f1(Y(yMin))}" x2="${f1(X(0))}" y2="${f1(Y(yMax) + 4)}" stroke="#6b7280" stroke-width="1"/>`);
  parts.push(`<polygon points="${f1(X(xMax))},${f1(Y(0))} ${f1(X(xMax) - 8)},${f1(Y(0) - 4)} ${f1(X(xMax) - 8)},${f1(Y(0) + 4)}" fill="#6b7280"/>`);
  parts.push(`<polygon points="${f1(X(0))},${f1(Y(yMax))} ${f1(X(0) - 4)},${f1(Y(yMax) + 8)} ${f1(X(0) + 4)},${f1(Y(yMax) + 8)}" fill="#6b7280"/>`);
  const seg = (P: Pt, Q: Pt, couleur = noir, pointille = false, w = 2) =>
    parts.push(`<line x1="${f1(X(P.x))}" y1="${f1(Y(P.y))}" x2="${f1(X(Q.x))}" y2="${f1(Y(Q.y))}" stroke="${couleur}" stroke-width="${w}"${pointille ? ' stroke-dasharray="5 4"' : ""}/>`);
  for (let i = 0; i < n; i++) seg(S[i]!, S[(i + 1) % n]!);
  const acc = "#c2410c";
  const mil = (P: Pt, Q: Pt): Pt => ({ x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 });
  const labels: { P: Pt; txt: string; couleur?: string }[] = S.map((P, i) => ({ P, txt: e.noms[i]! }));
  if (e.support === "parallelogramme" || e.support === "losange") {
    seg(S[0]!, S[2]!, acc, true, 1.5);
    seg(S[1]!, S[3]!, acc, true, 1.5);
  } else if (e.support === "medianes") {
    for (let i = 0; i < 3; i++) {
      const M = mil(S[(i + 1) % 3]!, S[(i + 2) % 3]!);
      seg(S[i]!, M, acc, true, 1.5);
      labels.push({ P: M, txt: `${e.noms[i]}'`, couleur: acc });
    }
  } else if (e.support === "varignon") {
    const M = [0, 1, 2, 3].map((i) => mil(S[i]!, S[(i + 1) % 4]!));
    for (let i = 0; i < 4; i++) seg(M[i]!, M[(i + 1) % 4]!, acc, false, 1.6);
    ["I", "J", "K", "L"].forEach((nom, i) => labels.push({ P: M[i]!, txt: nom, couleur: acc }));
  } else if (e.support === "rectangleMediane") {
    const M = mil(S[1]!, S[2]!);
    seg(S[0]!, M, acc, true, 1.5);
    labels.push({ P: M, txt: "M", couleur: acc });
    parts.push(`<polyline points="${f1(X(0.45))},${f1(Y(0))} ${f1(X(0.45))},${f1(Y(0.45))} ${f1(X(0))},${f1(Y(0.45))}" fill="none" stroke="${noir}" stroke-width="1.2"/>`);
  }
  const G = { x: xs.reduce((a, b) => a + b, 0) / n, y: ys.reduce((a, b) => a + b, 0) / n };
  for (const lb of labels) {
    const dx = lb.P.x - G.x;
    const dy = lb.P.y - G.y;
    const d = Math.hypot(dx, dy) || 1;
    parts.push(`<circle cx="${f1(X(lb.P.x))}" cy="${f1(Y(lb.P.y))}" r="3" fill="${lb.couleur ?? noir}"/>`);
    parts.push(`<text x="${f1(X(lb.P.x) + (dx / d) * 13)}" y="${f1(Y(lb.P.y) - (dy / d) * 13 + 5)}" font-size="14" text-anchor="middle" font-family="sans-serif" font-weight="600" fill="${lb.couleur ?? noir}" stroke="#ffffff" stroke-width="3" paint-order="stroke">${lb.txt}</text>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${f1(W)}" height="${f1(H)}" viewBox="0 0 ${f1(W)} ${f1(H)}" role="img">${parts.join("")}</svg>`;
}

export { PHASES_123 };
