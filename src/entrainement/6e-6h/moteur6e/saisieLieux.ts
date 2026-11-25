import type { StatutVerification } from "../moteur/statutVerification";
import type { VerificationChamp } from "./attentesCombinatoire";
import { ErreurLecture, lireEquation, lireExpressionPoly, lireNombre, lirePoint, polyAdd, polyCoef, polyDegre, polyEstConstant, polyEstNul, polyEval, polySub, polyVariables, proportionnels, qNum } from "./algebreLieux";
import type { Poly } from "./algebreLieux";

/**
 * Champs du 6e ch. 9 (6gen54–6gen57, audit, lot B) : une vérification par NATURE de champ, branchée
 * sur le socle commun du ch. 7 (`Attente { verif }`). Règles :
 * - une saisie illisible, une inéquation ou une valeur ARRONDIE quand l'exact est demandé est
 *   refusée SANS tentative (`refus` rend le message) ;
 * - nombres et points comparés exactement (fractions, racines) ; équations comparées par
 *   proportionnalité EXACTE (tout multiple non nul) ; listes (centres, sommets, droites) comparées
 *   comme des ENSEMBLES, dans n'importe quel ordre.
 */

const SANS = " Cette saisie ne compte pas comme une tentative.";

export const MESSAGES_LIEUX = {
  nombre: `Nombre non reconnu : écris par exemple −3, 7/2, 2√5 ou √13 (virgule ou point).${SANS}`,
  approche: `Donne la valeur exacte (entier, fraction ou racine), pas une valeur arrondie.${SANS}`,
  point: `Point non reconnu : écris ses deux coordonnées séparées par « ; », par exemple (2 ; −1/2).${SANS}`,
  points: `Point non reconnu : un point par ligne, coordonnées séparées par « ; », par exemple (2 ; −1/2).${SANS}`,
  equation: `Équation non reconnue : écris-la avec « = », par exemple 2x − 3y + 1 = 0 (tape ² ou ^2 pour un carré, vérifie les parenthèses).${SANS}`,
  inequation: `C'est une inéquation : écris une équation, avec « = ».${SANS}`,
  racine: `Pas de racine dans une équation : écris le carré du rayon (par exemple 13 au lieu de (√13)²).${SANS}`,
  division: `Division non reconnue : on ne peut diviser que par un nombre non nul.${SANS}`,
  factorise: `Ton équation est juste, mais elle n'est pas factorisée : écris-la comme un produit de facteurs égal à 0.${SANS}`,
  degenere: `Ce n'est l'équation d'aucune droite : les coefficients de x et de y ne peuvent pas être nuls tous les deux.${SANS}`,
  coefficients: `Écris des coefficients exacts (entiers ou fractions), pas des valeurs arrondies.${SANS}`,
};

function messageVariables(variables: readonly string[]): string {
  const noms = variables.map((v) => `« ${v} »`);
  const liste = noms.length > 1 ? `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}` : noms[0];
  return `Lettre non reconnue : ${noms.length > 1 ? `seules les lettres ${liste} sont attendues` : `seule la lettre ${liste} est attendue`} ici${variables.includes("α") ? " (si ton clavier n'a pas α, écris le mot alpha)" : ""}.${SANS}`;
}

function egalNum(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
}
function proche(a: number, b: number): boolean {
  return Math.abs(a - b) <= 0.02 * Math.max(1, Math.abs(b));
}

/** Texte d'un nombre pour les contrôles automatiques (jamais affiché). */
export function texteReference(x: number): string {
  if (Number.isInteger(x)) return String(x);
  for (let d = 2; d <= 1000; d++) if (Math.abs(Math.round(x * d) - x * d) < 1e-9) return `${Math.round(x * d)}/${d}`;
  const c = x * x;
  for (let d = 1; d <= 100; d++) if (Math.abs(Math.round(c * d * d) - c * d * d) < 1e-6) return `${x < 0 ? "-" : ""}√${Math.round(c * d * d)}/${d}`;
  return String(x);
}

// ---------------------------------------------------------------------------
// Nombre
// ---------------------------------------------------------------------------

function refusNombre(v: string, cible: number, exact: boolean): string | null {
  try {
    const n = lireNombre(v);
    if (exact && n.decimal && !egalNum(n.valeur, cible) && proche(n.valeur, cible)) return MESSAGES_LIEUX.approche;
    return null;
  } catch {
    return MESSAGES_LIEUX.nombre;
  }
}

export function champNombre(cible: number, exact = true): VerificationChamp {
  return {
    refus: (v) => refusNombre(v, cible, exact),
    statut: (v) => {
      try {
        return egalNum(lireNombre(v).valeur, cible) ? "correct" : "not_equivalent";
      } catch {
        return "parse_error";
      }
    },
    reference: texteReference(cible),
  };
}

/** Plusieurs nombres attendus (ensemble), un par ligne d'un champ « liste ». */
export function champNombres(cibles: number[]): VerificationChamp {
  const lignes = (v: string) => v.split("\n").filter((l) => l.trim() !== "");
  return {
    refus: (v) => {
      for (const l of lignes(v)) {
        const m = cibles.map((c) => refusNombre(l, c, true)).find((x) => x === MESSAGES_LIEUX.nombre || x === null);
        if (m === MESSAGES_LIEUX.nombre) return m;
        if (m === undefined) return MESSAGES_LIEUX.approche;
      }
      return null;
    },
    statut: (v) => {
      try {
        const lus = lignes(v).map((l) => lireNombre(l).valeur);
        return ensembleEgal(lus, cibles, egalNum) ? "correct" : "not_equivalent";
      } catch {
        return "parse_error";
      }
    },
    reference: cibles.map(texteReference).join("\n"),
  };
}

function ensembleEgal<T, U>(lus: T[], cibles: U[], eg: (a: T, b: U) => boolean): boolean {
  if (lus.length !== cibles.length) return false;
  const pris = new Set<number>();
  for (const l of lus) {
    const i = cibles.findIndex((c, j) => !pris.has(j) && eg(l, c));
    if (i < 0) return false;
    pris.add(i);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Points
// ---------------------------------------------------------------------------

export interface PointNum {
  x: number;
  y: number;
}

function refusPoint(v: string, cibles: PointNum[], message: string): string | null {
  try {
    const p = lirePoint(v);
    if ((p.x.decimal || p.y.decimal) && !cibles.some((c) => egalNum(p.x.valeur, c.x) && egalNum(p.y.valeur, c.y)) && cibles.some((c) => proche(p.x.valeur, c.x) && proche(p.y.valeur, c.y))) return MESSAGES_LIEUX.approche;
    return null;
  } catch {
    return message;
  }
}

export function champPoint(cible: PointNum): VerificationChamp {
  return {
    refus: (v) => refusPoint(v, [cible], MESSAGES_LIEUX.point),
    statut: (v) => {
      try {
        const p = lirePoint(v);
        return egalNum(p.x.valeur, cible.x) && egalNum(p.y.valeur, cible.y) ? "correct" : "not_equivalent";
      } catch {
        return "parse_error";
      }
    },
    reference: `(${texteReference(cible.x)} ; ${texteReference(cible.y)})`,
  };
}

/** Ensemble de points (un par ligne), dans n'importe quel ordre. */
export function champPoints(cibles: PointNum[]): VerificationChamp {
  const lignes = (v: string) => v.split("\n").filter((l) => l.trim() !== "");
  return {
    refus: (v) => {
      for (const l of lignes(v)) {
        const m = refusPoint(l, cibles, MESSAGES_LIEUX.points);
        if (m) return m;
      }
      return null;
    },
    statut: (v) => {
      try {
        const lus = lignes(v).map((l) => {
          const p = lirePoint(l);
          return { x: p.x.valeur, y: p.y.valeur };
        });
        return ensembleEgal(lus, cibles, (a, b) => egalNum(a.x, b.x) && egalNum(a.y, b.y)) ? "correct" : "not_equivalent";
      } catch {
        return "parse_error";
      }
    },
    reference: cibles.map((c) => `(${texteReference(c.x)} ; ${texteReference(c.y)})`).join("\n"),
  };
}

// ---------------------------------------------------------------------------
// Équations
// ---------------------------------------------------------------------------

export interface OptionsEquation {
  /** Lettres admises (défaut : x et y). */
  variables?: readonly string[];
  /** Équation de droite : a = b = 0 refusé sans tentative. */
  droite?: boolean;
  /** Nombre de facteurs non constants attendus (forme factorisée exigée si ≥ 2). */
  facteurs?: number;
  /** Saisie juste pour les contrôles automatiques. */
  reference?: string;
}

function messageErreur(e: unknown, variables: readonly string[]): string {
  if (e instanceof ErreurLecture) {
    if (e.raison === "inequation") return MESSAGES_LIEUX.inequation;
    if (e.raison === "racine") return MESSAGES_LIEUX.racine;
    if (e.raison === "variable") return messageVariables(variables);
    if (e.raison === "division") return MESSAGES_LIEUX.division;
  }
  return MESSAGES_LIEUX.equation;
}

/** Coefficients d'un polynôme sur une liste de monômes (approximation numérique). */
function presqueProportionnels(a: Poly, b: Poly, variables: readonly string[]): boolean {
  // Comparaison numérique en quelques points (rapport presque constant).
  const essais = [
    [0.37, -1.21, 0.83],
    [1.7, 0.45, -0.66],
    [-0.9, 2.3, 1.4],
    [2.6, -1.8, 0.29],
  ];
  let rapport: number | null = null;
  for (const e of essais) {
    const val: Record<string, number> = {};
    variables.forEach((v, i) => (val[v] = e[i % 3] + i * 0.11));
    const va = polyEval(a, val);
    const vb = polyEval(b, val);
    if (Math.abs(vb) < 1e-9) continue;
    const r = va / vb;
    if (rapport === null) rapport = r;
    else if (Math.abs(r - rapport) > 0.02 * Math.max(1, Math.abs(rapport))) return false;
  }
  return rapport !== null && Math.abs(rapport) > 1e-9;
}

export function lireEquationLieux(v: string, variables: readonly string[]) {
  return lireEquation(v, variables);
}

function statutEquation(v: string, attendu: Poly, o: OptionsEquation): StatutVerification {
  const variables = o.variables ?? ["x", "y"];
  try {
    const e = lireEquation(v, variables);
    return proportionnels(e.poly, attendu) ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

function refusEquation(v: string, attendus: Poly[], o: OptionsEquation): string | null {
  const variables = o.variables ?? ["x", "y"];
  try {
    const e = lireEquation(v, variables);
    if (o.droite && polyDegre(e.poly) <= 1 && polyCoef(e.poly, { x: 1 }).n === 0n && polyCoef(e.poly, { y: 1 }).n === 0n) return MESSAGES_LIEUX.degenere;
    if (polyEstConstant(e.poly)) return o.droite ? MESSAGES_LIEUX.degenere : MESSAGES_LIEUX.equation;
    const juste = attendus.some((a) => proportionnels(e.poly, a));
    if (o.facteurs && o.facteurs >= 2 && juste && e.facteurs < 2) return MESSAGES_LIEUX.factorise;
    if (e.decimal && !juste && attendus.some((a) => presqueProportionnels(e.poly, a, [...polyVariablesUnion(e.poly, a)]))) return MESSAGES_LIEUX.coefficients;
    return null;
  } catch (err) {
    return messageErreur(err, variables);
  }
}

function polyVariablesUnion(a: Poly, b: Poly): Set<string> {
  const s = polyVariables(a);
  polyVariables(b).forEach((v) => s.add(v));
  return s;
}

export function champEquation(attendu: Poly, o: OptionsEquation = {}): VerificationChamp {
  return {
    refus: (v) => refusEquation(v, [attendu], o),
    statut: (v) => statutEquation(v, attendu, o),
    reference: o.reference ?? textePoly(attendu),
  };
}

/** Ensemble d'équations (une par ligne), dans n'importe quel ordre. */
export function champEquations(attendus: Poly[], o: OptionsEquation = {}): VerificationChamp {
  const variables = o.variables ?? ["x", "y"];
  const lignes = (v: string) => v.split("\n").filter((l) => l.trim() !== "");
  return {
    refus: (v) => {
      for (const l of lignes(v)) {
        const m = refusEquation(l, attendus, o);
        if (m) return m;
      }
      return null;
    },
    statut: (v) => {
      try {
        const lus = lignes(v).map((l) => lireEquation(l, variables).poly);
        return ensembleEgal(lus, attendus, (a, b) => proportionnels(a, b)) ? "correct" : "not_equivalent";
      } catch {
        return "parse_error";
      }
    },
    reference: attendus.map((a) => textePoly(a)).join("\n"),
  };
}

/** Expression (sans « = ») égale à `attendu` ou à son opposé (contenu d'une valeur absolue). */
export function champExpressionAuSigne(attendu: Poly, variables: readonly string[], reference: string): VerificationChamp {
  const juste = (v: string) => {
    const p = lireExpressionPoly(v, variables).poly;
    return polyEstNul(polySub(p, attendu)) || polyEstNul(polyAdd(p, attendu));
  };
  return {
    refus: (v) => {
      try {
        lireExpressionPoly(v, variables);
        return null;
      } catch (err) {
        if (err instanceof ErreurLecture && err.raison === "variable") return messageVariables(variables);
        return `Expression non reconnue : écris une expression en ${variables.join(", ")}, par exemple 3 − 2t (sans « = »).${SANS}`;
      }
    },
    statut: (v) => {
      try {
        return juste(v) ? "correct" : "not_equivalent";
      } catch {
        return "parse_error";
      }
    },
    reference,
  };
}

/** Écriture clavier d'un polynôme « = 0 » (contrôles automatiques seulement, jamais affichée). */
export function textePoly(p: Poly): string {
  const morceaux: string[] = [];
  for (const [k, c] of p) {
    const coef = `(${c.n}/${c.d})`;
    const lettres = k === "" ? "" : k.split(",").map((m) => {
      const [v, e] = m.split(":");
      return e === "1" ? `*${v}` : `*${v}^${e}`;
    }).join("");
    morceaux.push(`${coef}${lettres}`);
  }
  return `${morceaux.join("+") || "0"}=0`;
}

export { qNum };
