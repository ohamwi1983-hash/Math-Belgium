import type { ExerciceConjuguee, FormeIndeterminee } from "../core5e/limitesConjuguee";
import { cible, forme, limite, partielles, produit } from "../core5e/limitesConjuguee";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { coefX, exacteL, limiteL, limL, parL, plusL, polyL } from "./ecrituresLimitesLotG";

/**
 * Couche C — textes de `5gen64` « Limites avec racines carrées : expression conjuguée » :
 * écritures (fonction, conjuguée, produit, formes simplifiées), consignes, options, champs, aides à
 * deux niveaux, réponses. Source unique de l'écran, du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceConjuguee;
export type PhaseConjuguee = "forme" | "transformer" | "partielles" | "limite";
export const PHASES: PhaseConjuguee[] = ["forme", "transformer", "partielles", "limite"];

// ============================================================================
// Écritures.
// ============================================================================

/** « \sqrt{x+3} » (b = 0 : « \sqrt{x} »). */
const racLin = (a: number) => `\\sqrt{${polyL([1, a])}}`;

/** Radicande de A, E1, E2. */
export function radicandeL(e: E): string {
  const d = e.d;
  if (e.sous === "E1") return polyL([d.m * d.m, d.b, d.c]);
  return polyL([d.p * d.p, d.b, d.c]);
}

/** Valeur r = √c écrite (C) : « 3 » ou « \sqrt{5} ». */
export function rL(e: E): string {
  const r = Math.sqrt(e.d.c);
  return Number.isInteger(r) ? `${r}` : `\\sqrt{${e.d.c}}`;
}

/** a = n² − p (D). */
export const aD = (e: E): number => e.d.n * e.d.n - e.d.p;

/** « m(x − a) » (D) : « (x-4) » ou « 2(x-4) ». */
function mXmoinsA(e: E): string {
  const xa = polyL([1, -aD(e)]);
  return e.d.m === 1 ? `(${xa})` : `${e.d.m}(${xa})`;
}

/** Expression A − B que l'on multiplie par sa conjuguée (numérateur pour C et D). */
export function abL(e: E): string {
  const d = e.d;
  switch (e.sous) {
    case "A":
      return `\\sqrt{${radicandeL(e)}}-${coefX(d.p)}`;
    case "E2":
      return `\\sqrt{${radicandeL(e)}}+${coefX(d.p)}`;
    case "B1":
      return `${racLin(d.a)}-${racLin(d.b)}`;
    case "B2":
      return `\\sqrt{${polyL([1, d.a, d.c])}}-\\sqrt{${polyL([1, d.b, d.d])}}`;
    case "C":
      return `\\sqrt{${polyL([d.k, d.c])}}-${rL(e)}`;
    case "D":
      return `\\sqrt{${polyL([1, d.p])}}-${d.n}`;
    case "E1":
      return `\\sqrt{${radicandeL(e)}}`;
  }
}

/** Les deux termes A et B de « A − B » (B signé pour E2 : A + px = A − (−px)). */
export function termesAB(e: E): [string, string] {
  const d = e.d;
  switch (e.sous) {
    case "A":
      return [`\\sqrt{${radicandeL(e)}}`, coefX(d.p)];
    case "E2":
      return [`\\sqrt{${radicandeL(e)}}`, coefX(-d.p)];
    case "B1":
      return [racLin(d.a), racLin(d.b)];
    case "B2":
      return [`\\sqrt{${polyL([1, d.a, d.c])}}`, `\\sqrt{${polyL([1, d.b, d.d])}}`];
    case "C":
      return [`\\sqrt{${polyL([d.k, d.c])}}`, rL(e)];
    case "D":
      return [`\\sqrt{${polyL([1, d.p])}}`, `${d.n}`];
    case "E1":
      return [`\\sqrt{${radicandeL(e)}}`, ""];
  }
}

/** Expression conjuguée (A + B). */
export function conjL(e: E): string {
  const d = e.d;
  switch (e.sous) {
    case "A":
      return `\\sqrt{${radicandeL(e)}}+${coefX(d.p)}`;
    case "E2":
      return `\\sqrt{${radicandeL(e)}}-${coefX(d.p)}`;
    case "B1":
      return `${racLin(d.a)}+${racLin(d.b)}`;
    case "B2":
      return `\\sqrt{${polyL([1, d.a, d.c])}}+\\sqrt{${polyL([1, d.b, d.d])}}`;
    case "C":
      return `\\sqrt{${polyL([d.k, d.c])}}+${rL(e)}`;
    case "D":
      return `\\sqrt{${polyL([1, d.p])}}+${d.n}`;
    case "E1":
      return "";
  }
}

/** Dénominateur de départ (C, D, E1) ou null. */
export function denominateurL(e: E): string | null {
  const d = e.d;
  if (e.sous === "C") return "x";
  if (e.sous === "D") return polyL([d.m, -d.m * aD(e)]);
  if (e.sous === "E1") return polyL([d.p, d.q]);
  return null;
}

/** f(x). */
export function fL(e: E): string {
  const den = denominateurL(e);
  return den ? `\\dfrac{${abL(e)}}{${den}}` : abL(e);
}

/** « \lim\limits_{x\to+\infty}\left(…\right) » ou « \lim\limits_{x\to 0}\dfrac{…}{…} ». */
export function limiteEnonceL(e: E): string {
  const den = denominateurL(e);
  return den ? `${limL(cible(e))}${fL(e)}` : `${limL(cible(e))}\\left(${fL(e)}\\right)`;
}

export const produitL = (e: E): string => polyL(produit(e) ?? [0]);

/** √(m² + b/x + c/x²) : la racine après x² mis en évidence (A, B2, E1, E2). */
export function racineDiviseeL(c2: number, b: number, c: number): string {
  let s = `${c2}`;
  if (b !== 0) s += `${b < 0 ? "-" : "+"}\\dfrac{${Math.abs(b)}}{x}`;
  if (c !== 0) s += `${c < 0 ? "-" : "+"}\\dfrac{${Math.abs(c)}}{x^2}`;
  return `\\sqrt{${s}}`;
}

/** Racine de E1 après x² mis en évidence. */
export const racineE1L = (e: E): string => racineDiviseeL(e.d.m * e.d.m, e.d.b, e.d.c);

/** Numérateur et dénominateur de f(x) APRÈS le produit remarquable (ou x² mis en évidence en E1). */
export function apresProduitL(e: E): { num: string; den: string } {
  const d = e.d;
  switch (e.sous) {
    case "A":
    case "E2":
    case "B1":
    case "B2":
      return { num: produitL(e), den: conjL(e) };
    case "C":
      return { num: produitL(e), den: `x\\left(${conjL(e)}\\right)` };
    case "D":
      return { num: produitL(e), den: `${mXmoinsA(e)}\\left(${conjL(e)}\\right)` };
    case "E1":
      return { num: `-x${racineE1L(e)}`, den: polyL([d.p, d.q]) };
  }
}

/** Numérateur et dénominateur APRÈS simplification / division par x (formes où la limite se lit). */
export function apresSimplificationL(e: E): { num: string; den: string } {
  const d = e.d;
  switch (e.sous) {
    case "A":
      return { num: d.c === 0 ? `${d.b}` : `${d.b}${d.c < 0 ? "-" : "+"}\\dfrac{${Math.abs(d.c)}}{x}`, den: `${racineDiviseeL(d.p * d.p, d.b, d.c)}+${d.p}` };
    case "E2":
      return { num: d.c === 0 ? `${d.b}` : `${d.b}${d.c < 0 ? "-" : "+"}\\dfrac{${Math.abs(d.c)}}{x}`, den: `-${racineDiviseeL(d.p * d.p, d.b, d.c)}-${d.p}` };
    case "B1":
      return { num: `${d.a - d.b}`, den: conjL(e) };
    case "B2": {
      const k = d.c - d.d;
      return { num: k === 0 ? `${d.a - d.b}` : `${d.a - d.b}${k < 0 ? "-" : "+"}\\dfrac{${Math.abs(k)}}{x}`, den: `${racineDiviseeL(1, d.a, d.c)}+${racineDiviseeL(1, d.b, d.d)}` };
    }
    case "C":
      return { num: `${d.k}`, den: conjL(e) };
    case "D":
      return { num: "1", den: d.m === 1 ? conjL(e) : `${d.m}\\left(${conjL(e)}\\right)` };
    case "E1":
      return { num: `-${racineE1L(e)}`, den: d.q === 0 ? `${d.p}` : `${d.p}${d.q < 0 ? "-" : "+"}\\dfrac{${Math.abs(d.q)}}{x}` };
  }
}

/** Mode de simplification de l'écran 3. */
export function modeSimplification(e: E): "divX" | "simplifier" | "direct" {
  if (e.sous === "B1") return "direct";
  if (e.sous === "C" || e.sous === "D") return "simplifier";
  return "divX";
}

export const negatif = (e: E): boolean => e.sous === "E1" || e.sous === "E2";

export const FORMES: Record<FormeIndeterminee | "aucune", Frag[]> = {
  infMoinsInf: [lx("\\infty-\\infty")],
  zeroSurZero: [lx("\\dfrac{0}{0}")],
  infSurInf: [lx("\\dfrac{\\infty}{\\infty}")],
  aucune: [tx("Pas de forme indéterminée : la limite se lit directement")],
};

/** Limites des morceaux (écran 1) : [latex de la ligne, …]. */
export function morceauxL(e: E): string[] {
  const d = e.d;
  const L = limL(cible(e));
  switch (e.sous) {
    case "A":
      return [`${L}\\sqrt{${radicandeL(e)}}=+\\infty`, `${L}${coefX(d.p)}=+\\infty`];
    case "E2":
      return [`${L}\\sqrt{${radicandeL(e)}}=+\\infty`, `${L}${coefX(d.p)}=-\\infty`];
    case "B1":
      return [`${L}${racLin(d.a)}=+\\infty`, `${L}${racLin(d.b)}=+\\infty`];
    case "B2":
      return [`${L}\\sqrt{${polyL([1, d.a, d.c])}}=+\\infty`, `${L}\\sqrt{${polyL([1, d.b, d.d])}}=+\\infty`];
    case "C":
      return [`\\sqrt{${d.k}\\cdot 0+${d.c}}-${rL(e)}=${rL(e)}-${rL(e)}=0`, `${L}x=0`];
    case "D": {
      const a = aD(e);
      return [`\\sqrt{${a}${plusL(d.p)}}-${d.n}=${d.n}-${d.n}=0`, `${d.m === 1 ? "" : `${d.m}\\cdot `}${parL(a)}${plusL(-d.m * a)}=0`];
    }
    case "E1":
      return [`${L}\\sqrt{${radicandeL(e)}}=+\\infty`, `${L}\\left(${polyL([d.p, d.q])}\\right)=${d.p > 0 ? "-" : "+"}\\infty`];
  }
}

// ============================================================================
// Écrans.
// ============================================================================

export const LIBELLES: Record<PhaseConjuguee, string> = { forme: "Forme", transformer: "Transformation", partielles: "Limites partielles", limite: "Limite" };

export function libelle(_e: E, p: PhaseConjuguee): string {
  return LIBELLES[p];
}

export function consigneGenerale(e: E): Frag[] {
  return [tx("On cherche la valeur exacte de "), lx(limiteEnonceL(e)), tx(".")];
}

export function consigne(e: E, p: PhaseConjuguee): Frag[] {
  if (p === "forme")
    return e.sous === "C" || e.sous === "D"
      ? [tx("Remplace x par "), lx(e.sous === "D" ? `${aD(e)}` : "0"), tx(" dans le numérateur et dans le dénominateur : quelle forme obtient-on ?")]
      : [tx("Calcule la limite de chaque morceau : quelle forme obtient-on ?")];
  if (p === "transformer") {
    if (e.sous === "E1") return [tx("Pour x < 0, mets "), lx("x^2"), tx(" en évidence sous la racine : complète "), lx(`\\sqrt{${radicandeL(e)}}=\\ldots\\cdot${racineE1L(e)}`), tx(".")];
    const quoi = e.sous === "C" || e.sous === "D" ? "du numérateur " : "de ";
    return [tx(`Multiplie et divise par l'expression conjuguée ${quoi}`), lx(abL(e)), tx(". Donne cette expression conjuguée, puis le produit de "), lx(abL(e)), tx(" par sa conjuguée, développé et réduit.")];
  }
  if (p === "partielles") {
    const a = apresProduitL(e);
    const fx = [tx("On obtient "), lx(`f(x)=\\dfrac{${a.num}}{${a.den}}`), tx(". ")];
    const m = modeSimplification(e);
    if (m === "direct") return [...fx, tx("Vers quoi tendent le numérateur et le dénominateur ?")];
    if (m === "simplifier") return [...fx, tx("Simplifie la fraction par "), lx(e.sous === "C" ? "x" : `${polyL([1, -aD(e)])}`), tx(" (il n'est pas nul), puis donne la limite du numérateur et du dénominateur simplifiés.")];
    return [...fx, tx(`Divise le numérateur et le dénominateur par x (ici x ${negatif(e) ? "< 0" : "> 0"}) : vers quoi tend chacun d'eux ?`)];
  }
  return [tx("Conclus : donne la valeur exacte de la limite.")];
}

export function optionsForme(): OptionEcran[] {
  return (["infMoinsInf", "zeroSurZero", "infSurInf", "aucune"] as const).map((id) => ({ id, fragments: FORMES[id] }));
}

export const RACCOURCIS_LIMITE = [
  { libelle: "√", texte: "√" },
  { libelle: "∞", texte: "∞" },
  { libelle: "−", texte: "−" },
];

export function champsPartielles(e: E): ChampEcran[] {
  const m = modeSimplification(e);
  const [n, d] = m === "divX" ? ["Numérateur ÷ x tend vers", "Dénominateur ÷ x tend vers"] : m === "simplifier" ? ["Numérateur simplifié tend vers", "Dénominateur simplifié tend vers"] : ["Numérateur tend vers", "Dénominateur tend vers"];
  return [
    { label: n, placeholder: "ex. : 3, −2 ou +∞", raccourcis: RACCOURCIS_LIMITE },
    { label: d, placeholder: "ex. : 2√3 ou +∞", raccourcis: RACCOURCIS_LIMITE },
  ];
}

export function aide1(e: E, p: PhaseConjuguee): AideEcran {
  if (p === "forme") return { texte: [tx("Calcule séparément la limite de chaque morceau ; les formes indéterminées sont "), lx("\\infty-\\infty"), tx(", "), lx("\\dfrac{0}{0}"), tx(", "), lx("\\dfrac{\\infty}{\\infty}"), tx(" et "), lx("0\\cdot\\infty"), tx(".")] };
  if (p === "transformer") {
    if (e.sous === "E1") return { texte: [tx("Sous la racine, mets "), lx("x^2"), tx(" en évidence ; attention : la racine d'un carré est une valeur absolue :")], latex: "\\sqrt{x^2}=|x|" };
    return { texte: [tx("L'expression conjuguée de "), lx("A-B"), tx(" est "), lx("A+B"), tx(" (et inversement) ; leur produit est un produit remarquable :")], latex: "(A-B)(A+B)=A^2-B^2" };
  }
  if (p === "partielles") {
    const m = modeSimplification(e);
    if (m === "simplifier") return { texte: [tx("Le facteur qui donnait "), lx("\\dfrac{0}{0}"), tx(" apparaît maintenant au numérateur ET au dénominateur : simplifie-le, puis remplace x par la valeur visée dans ce qui reste.")] };
    if (m === "direct") return { texte: [tx("Un nombre fixe divisé par une quantité qui tend vers "), lx("+\\infty"), tx(" : regarde chaque morceau séparément.")] };
    return {
      texte: [tx("Divise chaque terme par x ; "), lx("\\dfrac{c}{x}"), tx(" et "), lx("\\dfrac{c}{x^2}"), tx(" tendent vers 0. Sous une racine, x entre comme "), lx("\\sqrt{x^2}=|x|"), tx(" :")],
      latex: negatif(e) ? "x<0\\ :\\ x=-\\sqrt{x^2}" : "x>0\\ :\\ x=\\sqrt{x^2}",
    };
  }
  return { texte: [tx("Si le numérateur et le dénominateur ont des limites finies (dénominateur non nul), la limite du quotient est le quotient des limites ; un nombre divisé par une quantité qui tend vers l'infini tend vers 0.")] };
}

export function aide2(e: E, p: PhaseConjuguee): AideEcran | null {
  const d = e.d;
  if (p === "forme") {
    const m = morceauxL(e);
    return { texte: [tx("Ici :")], latex: m.join("\\qquad ") };
  }
  if (p === "transformer") {
    if (e.sous === "E1") return { texte: [tx("Ici :")], latex: `\\sqrt{${radicandeL(e)}}=\\sqrt{x^2}\\cdot${racineE1L(e)}\\ \\text{ et }\\ x<0` };
    const [A, B] = termesAB(e);
    return { texte: [tx("Ici "), lx(`A=${A}`), tx(" et "), lx(`B=${B}`), tx(" : calcule "), lx("A^2"), tx(" (la racine disparaît) et "), lx("B^2"), tx(", puis leur différence.")] };
  }
  if (p === "partielles") {
    const m = modeSimplification(e);
    if (m === "simplifier") return { texte: [tx("Après simplification, remplace x par "), lx(e.sous === "C" ? "0" : `${aD(e)}`), tx(" dans le dénominateur "), lx(e.sous === "D" && d.m !== 1 ? `${d.m}\\left(${conjL(e)}\\right)` : conjL(e)), tx(".")] };
    if (m === "direct") return { texte: [tx("Le numérateur est le nombre "), lx(`${d.a - d.b}`), tx(" ; chaque racine du dénominateur tend vers "), lx("+\\infty"), tx(".")] };
    if (e.sous === "E1") return { texte: [tx("Ici x < 0 : "), lx(`\\dfrac{-x${racineE1L(e)}}{x}=-${racineE1L(e)}`), tx(" ; divise aussi "), lx(polyL([d.p, d.q])), tx(" par x.")] };
    const a = apresProduitL(e);
    return { texte: [tx(negatif(e) ? "Ici x < 0, donc pour la racine : " : "Ici x > 0, donc pour la racine : ")], latex: `\\dfrac{\\sqrt{${e.sous === "B2" ? polyL([1, d.a, d.c]) : radicandeL(e)}}}{x}=${negatif(e) ? "-" : ""}\\sqrt{\\dfrac{${e.sous === "B2" ? polyL([1, d.a, d.c]) : radicandeL(e)}}{x^2}}\\qquad\\dfrac{${a.num}}{x}` };
  }
  const [n, den] = partielles(e);
  return { texte: [tx("Ici le numérateur tend vers "), lx(limiteL(n)), tx(" et le dénominateur vers "), lx(limiteL(den)), tx(". Simplifie le résultat (dénominateur sans racine).")] };
}

export function reponse(e: E, p: PhaseConjuguee): Frag[] {
  if (p === "forme") return [tx("Forme "), ...FORMES[forme(e)], tx(" : "), lx(morceauxL(e).join("\\ ;\\ "))];
  if (p === "transformer") {
    if (e.sous === "E1") return [lx(`\\sqrt{${radicandeL(e)}}=-x${racineE1L(e)}`), tx(" (pour x < 0, "), lx("\\sqrt{x^2}=|x|=-x"), tx(")")];
    return [tx("Conjuguée : "), lx(conjL(e)), tx(" ; produit : "), lx(`\\left(${abL(e)}\\right)\\left(${conjL(e)}\\right)=${produitL(e)}`)];
  }
  if (p === "partielles") {
    const [n, d] = partielles(e);
    return [tx("Numérateur → "), lx(limiteL(n)), tx(", dénominateur → "), lx(limiteL(d))];
  }
  return [lx(`${limL(cible(e))}f(x)=${exacteL(limite(e))}`)];
}

export const recap = reponse;

export function messageIllisible(_e: E, p: PhaseConjuguee): string {
  if (p === "transformer") return "Expression non reconnue : écris une expression en x, par exemple √(x²+3x+1) + x, 3x + 1 ou −x (racine : √ ou sqrt). Cette saisie ne compte pas comme une tentative.";
  return "Valeur non reconnue : écris un nombre exact (3/2, −1/4, √3/6) ou un infini (+∞, −∞, « inf »). Cette saisie ne compte pas comme une tentative.";
}

export const MESSAGE_APPROCHEE = "C'est une valeur approchée : donne la valeur exacte (fraction ou racine, par exemple 3/2 ou √3/6). Cette saisie ne compte pas comme une tentative.";

export function libelleLimite(e: E): string {
  return `${limL(cible(e))}f(x)=`;
}
