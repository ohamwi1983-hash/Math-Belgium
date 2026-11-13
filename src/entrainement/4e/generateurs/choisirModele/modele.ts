import type { ContexteModele, ExerciceChoisirModele, FamilleModele } from "./types";
import type { StatutVerification } from "../../moteur/statutVerification";
import { evaluerExpressionGenerale } from "../../moteur/expressionGenerale";

/**
 * Calcul, mise en forme et vérification du modèle de gen69 — partagés par l'écran interactif
 * (`AppChoisirModele.tsx`) et l'adaptateur papier (`exportEvaluation.ts`) : une seule source.
 */

export interface InfoContexte {
  famille: FamilleModele;
  /** Variable de la situation (saisie de l'expression, axe horizontal). */
  variable: string;
  /** Nom de la fonction (« h », « L »…). */
  fonction: string;
  axeX: { nom: string; unite: string };
  axeY: { nom: string; unite: string };
}

export const INFOS_CONTEXTE: Record<ContexteModele, InfoContexte> = {
  pont: { famille: "carre", variable: "x", fonction: "h", axeX: { nom: "x", unite: "m" }, axeY: { nom: "h", unite: "m" } },
  jet: { famille: "racine_carree", variable: "p", fonction: "L", axeX: { nom: "p", unite: "bar" }, axeY: { nom: "L", unite: "m" } },
  glacon: { famille: "racine_cubique", variable: "V", fonction: "c", axeX: { nom: "V", unite: "cm³" }, axeY: { nom: "c", unite: "cm" } },
  gaz: { famille: "inverse", variable: "V", fonction: "P", axeX: { nom: "V", unite: "L" }, axeY: { nom: "P", unite: "bar" } },
  velo: { famille: "inverse", variable: "v", fonction: "T", axeX: { nom: "v", unite: "km/h" }, axeY: { nom: "T", unite: "h" } },
  chauffage: { famille: "valeur_absolue", variable: "T", fonction: "E", axeX: { nom: "T", unite: "°C" }, axeY: { nom: "E", unite: "kWh" } },
  toboggan: { famille: "cube", variable: "x", fonction: "h", axeX: { nom: "x", unite: "m" }, axeY: { nom: "h", unite: "m" } },
};

/** Unité en LaTeX (texte droit), pour les réponses révélées et le corrigé. */
export const UNITE_LATEX: Record<string, string> = {
  m: "\\text{ m}",
  bar: "\\text{ bar}",
  "cm³": "\\text{ cm}^3",
  cm: "\\text{ cm}",
  L: "\\text{ L}",
  "km/h": "\\text{ km/h}",
  h: "\\text{ h}",
  "°C": "\\,{}^{\\circ}\\text{C}",
  kWh: "\\text{ kWh}",
};

export function g(famille: FamilleModele, t: number): number {
  switch (famille) {
    case "carre":
      return t * t;
    case "cube":
      return t * t * t;
    case "racine_carree":
      return t < 0 ? NaN : Math.sqrt(t);
    case "racine_cubique":
      return Math.cbrt(t);
    case "inverse":
      return t === 0 ? NaN : 1 / t;
    case "valeur_absolue":
      return Math.abs(t);
  }
}

export function evaluerModele(e: Pick<ExerciceChoisirModele, "famille" | "th" | "tv" | "a">, t: number): number {
  return e.a * g(e.famille, t - e.th) + e.tv;
}

/** Arrondi d'affichage (supprime le bruit flottant : 0,1 + 0,2…). */
function propre(v: number): number {
  return Math.round(v * 1e9) / 1e9;
}

/** Nombre en texte, à la française : virgule décimale, vrai signe moins. */
export function nombreTexte(v: number): string {
  const s = String(Math.abs(propre(v))).replace(".", ",");
  return v < 0 && propre(v) !== 0 ? `−${s}` : s;
}

/** Nombre en LaTeX : virgule décimale sans espace parasite (`{,}`). */
export function nombreLatex(v: number): string {
  const s = String(Math.abs(propre(v))).replace(".", "{,}");
  return v < 0 && propre(v) !== 0 ? `-${s}` : s;
}

/** « variable − TH » en LaTeX (variable seule si TH = 0). */
function argumentLatex(variable: string, th: number): string {
  if (th === 0) return variable;
  return th > 0 ? `${variable}-${nombreLatex(th)}` : `${variable}+${nombreLatex(-th)}`;
}

function coefficientLatex(a: number): string {
  if (a === 1) return "";
  if (a === -1) return "-";
  return nombreLatex(a);
}

/** Membre de droite du modèle, sous sa forme la plus simple. `variableLatex` : remplace la
 * variable (par une valeur, pour montrer une substitution). */
export function expressionModeleLatex(e: Pick<ExerciceChoisirModele, "famille" | "th" | "tv" | "a" | "contexte">, variableLatex?: string): string {
  const variable = variableLatex ?? INFOS_CONTEXTE[e.contexte].variable;
  const arg = argumentLatex(variable, e.th);
  const paren = e.th === 0 ? arg : `\\left(${arg}\\right)`;
  let corps: string;
  switch (e.famille) {
    case "carre":
      corps = `${coefficientLatex(e.a)}${paren}^2`;
      break;
    case "cube":
      corps = `${coefficientLatex(e.a)}${paren}^3`;
      break;
    case "racine_carree":
      corps = `${coefficientLatex(e.a)}\\sqrt{${arg}}`;
      break;
    case "racine_cubique":
      corps = `${coefficientLatex(e.a)}\\sqrt[3]{${arg}}`;
      break;
    case "inverse":
      corps = `${e.a < 0 ? "-" : ""}\\dfrac{${nombreLatex(Math.abs(e.a))}}{${arg}}`;
      break;
    case "valeur_absolue":
      corps = `${coefficientLatex(e.a)}\\left|${arg}\\right|`;
      break;
  }
  if (e.tv === 0) return corps;
  return e.tv > 0 ? `${corps}+${nombreLatex(e.tv)}` : `${corps}-${nombreLatex(-e.tv)}`;
}

/** « h(x) = … » complet. */
export function modeleLatex(e: Pick<ExerciceChoisirModele, "famille" | "th" | "tv" | "a" | "contexte">): string {
  const info = INFOS_CONTEXTE[e.contexte];
  return `${info.fonction}(${info.variable}) = ${expressionModeleLatex(e)}`;
}

/** Libellé du champ de saisie (« h(x) = »). */
export function libelleFonction(contexte: ContexteModele): string {
  const info = INFOS_CONTEXTE[contexte];
  return `${info.fonction}(${info.variable}) =`;
}

// ---------------------------------------------------------------------------------------------
// Saisies
// ---------------------------------------------------------------------------------------------

/** Nombre saisi : entier, décimal (virgule ou point) ou fraction ; signe « - » ou « − ». `null` si
 * la saisie n'est pas un nombre. */
export function lireNombre(saisie: string): number | null {
  const s = saisie.replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/,/g, ".");
  const m = /^(-?)(\d+(?:\.\d+)?|\.\d+)(?:\/(\d+(?:\.\d+)?))?$/.exec(s);
  if (!m) return null;
  const num = Number(m[2]);
  const den = m[3] === undefined ? 1 : Number(m[3]);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  return (m[1] === "-" ? -1 : 1) * (num / den);
}

export function egalNombre(saisie: string, attendu: number): boolean {
  const v = lireNombre(saisie);
  return v !== null && Math.abs(v - attendu) < 1e-9;
}

export interface DiagnosticExpression {
  statut: StatutVerification;
  /** L'élève a écrit la variable x alors que la situation en utilise une autre. */
  mauvaiseVariable?: boolean;
}

/** Retire un éventuel « h(x) = » ou « y = » recopié devant l'expression, normalise le signe moins. */
function nettoyerExpression(saisie: string): string {
  return saisie
    .replace(/[−–]/g, "-")
    .replace(/^\s*[A-Za-z]\s*\(\s*[A-Za-z]\s*\)\s*=/, "")
    .replace(/^\s*y\s*=/i, "")
    .trim();
}

/** Points d'échantillonnage du domaine de la situation (irréguliers, pour ne pas tomber que sur des
 * entiers). */
function pointsEchantillon(e: ExerciceChoisirModele): number[] {
  const [d0, d1] = e.domaine;
  const pts: number[] = [];
  const n = 31;
  for (let i = 0; i < n; i++) pts.push(d0 + ((d1 - d0) * (i + 0.37 * ((i * 7) % 3) / 3)) / (n - 1));
  return pts.filter((t) => t >= d0 && t <= d1);
}

/**
 * Vérification de l'expression par équivalence (échantillonnage sur le domaine de la situation) :
 * toute écriture équivalente est acceptée (fraction ou décimal, facteur dans la parenthèse, valeur
 * absolue d'une racine…). Au moins 6 points comparés, tolérance 1e-6 relative.
 */
export function diagnostiquerExpression(e: ExerciceChoisirModele, saisie: string): DiagnosticExpression {
  const expression = nettoyerExpression(saisie);
  if (expression === "") return { statut: "parse_error" };
  const variable = INFOS_CONTEXTE[e.contexte].variable;
  const autreVariable = variable.toLowerCase() !== "x";
  let compares = 0;
  try {
    for (const t of pointsEchantillon(e)) {
      const attendu = evaluerModele(e, t);
      if (!Number.isFinite(attendu)) continue;
      // Variable de la situation passée par `variables` ; « x » vaut NaN si la situation utilise
      // une autre lettre (une expression en x n'est alors jamais équivalente).
      const valeur = evaluerExpressionGenerale(expression, autreVariable ? NaN : t, autreVariable ? { [variable]: t } : {});
      if (!Number.isFinite(valeur) || Math.abs(valeur - attendu) > 1e-6 * Math.max(1, Math.abs(attendu))) {
        return { statut: "not_equivalent", mauvaiseVariable: autreVariable && /(^|[^A-Za-z])x([^A-Za-z]|$)/i.test(expression) };
      }
      compares++;
    }
  } catch {
    return { statut: "parse_error" };
  }
  return { statut: compares >= 6 ? "correct" : "not_equivalent" };
}

/** Réponses de l'écran 4, dans l'ordre affiché (une valeur, ou la plus petite puis la plus
 * grande). L'ordre des deux solutions n'est pas imposé. */
export function verifierUtilisation(e: ExerciceChoisirModele, saisies: string[]): boolean[] {
  const q = e.question4;
  if (q.type === "predire") return [egalNombre(saisies[0] ?? "", q.y)];
  if (q.solutions.length === 1) return [egalNombre(saisies[0] ?? "", q.solutions[0])];
  const [s0, s1] = [saisies[0] ?? "", saisies[1] ?? ""];
  const dansLOrdre = [egalNombre(s0, q.solutions[0]), egalNombre(s1, q.solutions[1])];
  const inverse = [egalNombre(s0, q.solutions[1]), egalNombre(s1, q.solutions[0])];
  return inverse[0] && inverse[1] ? inverse : dansLOrdre;
}

/** Réponses attendues de l'écran 2 (transformations lues). */
export interface TransformationsAttendues {
  th: number;
  tv: number;
  facteur: number;
  symetrie: boolean;
}

export function transformationsAttendues(e: ExerciceChoisirModele): TransformationsAttendues {
  return { th: e.th, tv: e.tv, facteur: Math.abs(e.a), symetrie: e.a < 0 };
}

/** Une seule transformation (cas particulier : le modèle se lit en une étape). */
export function uneSeuleTransformation(e: ExerciceChoisirModele): boolean {
  const n = (e.th !== 0 ? 1 : 0) + (e.tv !== 0 ? 1 : 0) + (Math.abs(e.a) !== 1 ? 1 : 0) + (e.a < 0 ? 1 : 0);
  return n <= 1;
}
