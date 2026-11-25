import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Attente, VerificationChamp } from "./attentesCombinatoire";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import { lireValeur, normaliserSaisieCombinatoire, versNombre } from "./saisieCombinatoire";
import type { Rationnel } from "./saisieCombinatoire";

/**
 * Lecture et vérification des saisies du 6e ch. 8 « Variables aléatoires » (6gen49–6gen53, audit,
 * lot B). Elle complète la grammaire EXACTE du ch. 7 (`saisieCombinatoire.ts` : fractions, « ! »,
 * C(n ; k), « % », espaces de milliers) par les valeurs RÉELLES du chapitre (e, ln, √ : loi de
 * Poisson, logarithme du « trouver n ») et par des vérifications propres :
 * - `valeurArrondie` : la consigne annonce l'arrondi (« arrondis à 10⁻⁴ ») ; une écriture exacte
 *   (calcul, fraction) est jugée exactement, un décimal doit être l'arrondi correct de la cible, avec
 *   au moins les décimales annoncées (moins : refus SANS tentative) ; plusieurs cibles possibles (table
 *   de Φ ou calculatrice) ; tolérance supplémentaire facultative (somme de termes arrondis) ;
 * - `entier` : un entier (« 22 », « n = 22 ») ;
 * - `inequationEnN` : une inéquation en n, jugée par son ENSEMBLE DE SOLUTIONS (« 1 − 0,9ⁿ > 0,9 » et
 *   « 0,9ⁿ < 0,1 » sont équivalentes ; « > » et « ≥ » aussi, la frontière n'étant jamais entière) ;
 * - `valeurParmi` : une valeur parmi une liste exacte (lecture inverse de la table : les deux valeurs
 *   voisines sont acceptées).
 * Rien n'est imposé pendant la frappe (règle « jamais de blocage ») : ce module ne lit qu'au moment
 * de la validation. Une saisie illisible ou trop grossière rend un message de refus : le moteur
 * commun (`sessionCombinatoire.ts`) ne décompte alors aucune tentative.
 */

const FIN = " Cette saisie ne compte pas comme une tentative.";

export const MESSAGE_NOMBRE_ILLISIBLE = "Nombre non reconnu : écris un décimal (virgule ou point), une fraction, un pourcentage ou un calcul (avec « ! », e ou ln, par exemple)." + FIN;
export const MESSAGE_ENTIER_ILLISIBLE = "Écris un nombre entier." + FIN;
export const MESSAGE_N_ISOLE = "Isole n : écris n seul d'un côté (n > …, n < …), avec un nombre ou un calcul de l'autre." + FIN;
export const MESSAGE_INEQUATION_ILLISIBLE ="Inéquation non reconnue : écris une expression en n, un signe <, >, ≤ ou ≥, puis l'autre membre (ln pour le logarithme)." + FIN;

function factorielle(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** Remplace « 19! » par sa valeur (jusqu'à 170!) pour l'analyseur réel. */
function remplacerFactorielles(s: string): string | null {
  let ok = true;
  const r = s.replace(/(\d+)\s*!/g, (_m, n: string) => {
    const k = Number(n);
    if (k > 170) ok = false;
    return `(${factorielle(k)})`;
  });
  return ok ? r : null;
}

/** Valeur réelle d'une saisie (sans variable), ou null : exacte d'abord, sinon e, ln, √, « ! ». */
export function lireReel(texte: string): number | null {
  if (texte.trim() === "") return null;
  const exacte = lireValeur(texte);
  if (exacte) return versNombre(exacte);
  return evaluerAvecVariables(texte, {});
}

function preparer(texte: string): { s: string; pourcent: boolean } | null {
  let s = normaliserSigneMoins(texte).replace(/[  ]/g, " ").trim();
  const pourcent = /%\s*$/.test(s);
  if (pourcent) s = s.replace(/%\s*$/, "");
  s = s.replace(/(\d) (?=\d{3}(?!\d))/g, "$1");
  const sansFact = remplacerFactorielles(s);
  if (sansFact === null) return null;
  return { s: sansFact, pourcent };
}

function evaluerAvecVariables(texte: string, variables: Record<string, number>): number | null {
  const p = preparer(texte);
  if (!p || p.s === "") return null;
  try {
    const v = evaluerExpressionExponentielle(p.s, variables);
    if (!Number.isFinite(v)) return null;
    return p.pourcent ? v / 100 : v;
  } catch {
    return null;
  }
}

/** Écriture décimale nue (ou pourcentage) : valeur et nombre de décimales effectives. */
export function ecritureDecimale(texte: string): { valeur: number; decimales: number } | null {
  const s = normaliserSaisieCombinatoire(texte).replace(/\s+/g, "");
  const pourcent = /%$/.test(s);
  const corps = pourcent ? s.slice(0, -1) : s;
  const m = /^(-?)(\d+)(?:[.,](\d+))?$/.exec(corps);
  if (!m) return null;
  const frac = m[3] ?? "";
  const v = Number(`${m[1]}${m[2]}.${frac || "0"}`);
  return { valeur: pourcent ? v / 100 : v, decimales: frac.length + (pourcent ? 2 : 0) };
}

const EPS = 1e-9;

function proche(a: number, b: number): boolean {
  return Math.abs(a - b) <= EPS * Math.max(1, Math.abs(b));
}

export interface OptionsArrondi {
  /** Décimales exigées par la consigne (refus sans tentative en dessous, sauf valeur exacte). */
  decimales: number;
  /** Tolérance ajoutée à la demi-unité (somme de termes arrondis chacun à 10⁻ᵈ). */
  tolerance?: number;
  /** Message de refus d'un arrondi trop grossier (défaut : « Arrondis à 10⁻ᵈ… »). */
  messageArrondi?: string;
}

const EXPOSANTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

/** « 10⁻⁴ » en texte (les messages de refus sont du texte brut). */
export function dixPuissanceMoins(d: number): string {
  return "10⁻" + String(d).split("").map((c) => EXPOSANTS[Number(c)]).join("");
}

function messageArrondiDefaut(d: number): string {
  if (d === 0) return "Arrondis à l'unité." + FIN;
  return `Donne le résultat arrondi à ${dixPuissanceMoins(d)} près : écris ${d} décimale${d > 1 ? "s" : ""}.` + FIN;
}

/** Le décimal écrit est-il l'arrondi (à SA précision) d'une des cibles ? */
function arrondiGrossier(dec: { valeur: number; decimales: number }, cibles: number[], tolerance: number): boolean {
  const demi = 0.5 * 10 ** -dec.decimales + tolerance + 1e-12;
  return cibles.some((c) => Math.abs(dec.valeur - c) <= demi);
}

/** Une valeur réelle annoncée « arrondie à 10⁻ᵈ » ; `cibles` : valeurs de référence acceptées. */
export function valeurArrondie(cibles: number | number[], options: OptionsArrondi): Attente {
  const liste = Array.isArray(cibles) ? cibles : [cibles];
  const verif: VerificationChamp = {
    refus(v) {
      const x = lireReel(v);
      if (x === null) return MESSAGE_NOMBRE_ILLISIBLE;
      const dec = ecritureDecimale(v);
      // Arrondi trop grossier MAIS juste à sa précision : refus sans tentative. Une valeur loin de la
      // cible est une réponse fausse (elle compte).
      if (dec && dec.decimales < options.decimales && !liste.some((c) => proche(dec.valeur, c)) && arrondiGrossier(dec, liste, options.tolerance ?? 0)) return options.messageArrondi ?? messageArrondiDefaut(options.decimales);
      return null;
    },
    statut(v) {
      const x = lireReel(v);
      if (x === null) return "parse_error";
      const dec = ecritureDecimale(v);
      if (!dec) return liste.some((c) => proche(x, c)) ? "correct" : "not_equivalent";
      const demi = 0.5 * 10 ** -dec.decimales;
      const tol = demi + (options.tolerance ?? 0) + 1e-12;
      return liste.some((c) => Math.abs(dec.valeur - c) <= tol) ? "correct" : "not_equivalent";
    },
    reference: liste[0].toFixed(options.decimales).replace(".", ","),
  };
  return { verif };
}

/** Une valeur EXACTE (rationnelle) : écriture exacte, ou décimal arrondi correct avec au moins
 * `decimales` décimales (moins : refus sans tentative). */
export function valeurExacteOuArrondie(cible: Rationnel | number, decimales: number): Attente {
  const c = typeof cible === "number" ? cible : versNombre(cible);
  return valeurArrondie(c, { decimales, messageArrondi: `Donne la valeur exacte (une fraction) ou un arrondi à ${dixPuissanceMoins(decimales)} près (${decimales} décimale${decimales > 1 ? "s" : ""}).` + FIN });
}

export const MESSAGE_EXACTE_ATTENDUE = "On demande ici la valeur exacte : écris une fraction (avec « / ») ou le décimal exact, pas un arrondi." + FIN;

/** Une valeur EXACTE seulement : un arrondi correct est refusé SANS tentative (message), pas compté
 * faux. Pourcentage accepté (« 20 % »). */
export function valeurExacte(cible: Rationnel | number): Attente {
  const c = typeof cible === "number" ? cible : versNombre(cible);
  const verif: VerificationChamp = {
    refus(v) {
      const x = lireReel(v);
      if (x === null) return MESSAGE_NOMBRE_ILLISIBLE;
      if (proche(x, c)) return null;
      const dec = ecritureDecimale(v);
      if (dec && Math.abs(dec.valeur - c) <= 0.5 * 10 ** -dec.decimales + 1e-12) return MESSAGE_EXACTE_ATTENDUE;
      return null;
    },
    statut(v) {
      const x = lireReel(v);
      if (x === null) return "parse_error";
      return proche(x, c) ? "correct" : "not_equivalent";
    },
    reference: typeof cible === "number" ? String(Number(c.toFixed(10))).replace(".", ",") : `${cible.n}/${cible.d}`,
  };
  return { verif };
}

/** Une valeur parmi une liste (lecture de table : deux valeurs voisines), écrite avec `decimales`
 * décimales ; `continues` : valeurs réelles aussi acceptées (calculatrice), arrondies correctement. */
export function valeurParmi(exactes: number[], decimales: number, continues: number[] = [], messageArrondi?: string): Attente {
  const verif: VerificationChamp = {
    refus(v) {
      const x = lireReel(v);
      if (x === null) return MESSAGE_NOMBRE_ILLISIBLE;
      const dec = ecritureDecimale(v);
      if (dec && dec.decimales < decimales && ![...exactes, ...continues].some((c) => proche(dec.valeur, c)) && arrondiGrossier(dec, [...exactes, ...continues], 0)) return messageArrondi ?? messageArrondiDefaut(decimales);
      return null;
    },
    statut(v) {
      const x = lireReel(v);
      if (x === null) return "parse_error";
      if (exactes.some((c) => proche(x, c))) return "correct";
      const dec = ecritureDecimale(v);
      const demi = dec ? 0.5 * 10 ** -dec.decimales + 1e-12 : EPS;
      return continues.some((c) => Math.abs(x - c) <= demi) ? "correct" : "not_equivalent";
    },
    reference: (exactes[0] ?? continues[0]).toFixed(decimales).replace(".", ","),
  };
  return { verif };
}

/** Un entier (« 22 », « n = 22 », « 2 345 »). `acceptes` : toutes les valeurs justes. */
export function entier(acceptes: number | number[]): Attente {
  const liste = Array.isArray(acceptes) ? acceptes : [acceptes];
  const lire = (v: string): number | null => {
    const s = normaliserSigneMoins(v).replace(/^\s*[a-zA-Zλμ]\s*(=|≈)\s*/, "").replace(/[\s  ]/g, "");
    return /^-?\d+$/.test(s) ? Number(s) : null;
  };
  const verif: VerificationChamp = {
    refus: (v) => (lire(v) === null ? MESSAGE_ENTIER_ILLISIBLE : null),
    statut: (v) => {
      const n = lire(v);
      if (n === null) return "parse_error";
      return liste.includes(n) ? "correct" : "not_equivalent";
    },
    reference: String(liste[0]),
  };
  return { verif };
}

// ============================================================================
// Inéquations en n
// ============================================================================

const OPERATEURS: { motif: RegExp; sens: "<" | ">" }[] = [
  { motif: /<=|≤|=</, sens: "<" },
  { motif: />=|≥|=>/, sens: ">" },
  { motif: /</, sens: "<" },
  { motif: />/, sens: ">" },
];

interface Inequation {
  gauche: string;
  droite: string;
  sens: "<" | ">";
}

function decouperInequation(texte: string): Inequation | null {
  const s = normaliserSigneMoins(texte);
  for (const { motif, sens } of OPERATEURS) {
    const m = motif.exec(s);
    if (!m) continue;
    const gauche = s.slice(0, m.index);
    const droite = s.slice(m.index + m[0].length);
    if (/[<>≤≥]/.test(gauche) || /[<>≤≥]/.test(droite)) return null;
    if (gauche.trim() === "" || droite.trim() === "") return null;
    return { gauche, droite, sens };
  }
  return null;
}

function contientN(texte: string): boolean {
  return /(^|[^a-zA-Z])[nN]([^a-zA-Z]|$)/.test(texte);
}

function evaluerCote(texte: string, n: number): number | null {
  return evaluerAvecVariables(texte.replace(/(^|[^a-zA-Z])N([^a-zA-Z]|$)/g, "$1n$2"), { n });
}

/** Vraie, fausse, ou null (illisible) pour une valeur de n. */
function vraiPour(ineq: Inequation, n: number): boolean | null {
  const a = evaluerCote(ineq.gauche, n);
  const b = evaluerCote(ineq.droite, n);
  if (a === null || b === null) return null;
  return ineq.sens === "<" ? a < b : a > b;
}

/** Points où comparer deux inéquations : entiers et réels jusqu'à 3 fois la frontière, loin d'elle. */
function pointsTest(frontiere: number): number[] {
  const max = Math.max(10, Math.ceil(frontiere * 3) + 5);
  const pts: number[] = [];
  for (let k = 0; k <= max; k++) {
    for (const d of [0, 0.37, 0.71]) {
      const x = k + d;
      if (Math.abs(x - frontiere) > 0.006 + 0.0005 * frontiere) pts.push(x);
    }
  }
  return pts;
}

/** Une inéquation en n dont l'ensemble de solutions est celui de `reference` (frontière réelle
 * `frontiere`, jamais entière). Lue au moment de la validation seulement. */
export function inequationEnN(reference: (n: number) => boolean, frontiere: number, isolee = false): Attente {
  const lire = (v: string): Inequation | null => {
    const ineq = decouperInequation(v);
    if (!ineq || !contientN(v)) return null;
    // Lisible : chaque membre s'évalue en au moins un point.
    if (vraiPour(ineq, 1) === null && vraiPour(ineq, 2) === null) return null;
    return ineq;
  };
  const estIsolee = (ineq: Inequation): boolean => {
    const g = ineq.gauche.trim().toLowerCase();
    const d = ineq.droite.trim().toLowerCase();
    return (g === "n" && !contientN(d)) || (d === "n" && !contientN(g));
  };
  const verif: VerificationChamp = {
    refus: (v) => {
      const ineq = lire(v);
      if (!ineq) return MESSAGE_INEQUATION_ILLISIBLE;
      if (isolee && !estIsolee(ineq)) return MESSAGE_N_ISOLE;
      return null;
    },
    statut: (v) => {
      const ineq = lire(v);
      if (!ineq) return "parse_error";
      for (const x of pointsTest(frontiere)) {
        const r = vraiPour(ineq, x);
        if (r === null) continue;
        if (r !== reference(x)) return "not_equivalent";
      }
      return "correct";
    },
  };
  return { verif };
}

/** Sens d'une inéquation lisible (pour un message ciblé « le sens a changé »). */
export function inequationInverse(v: string, reference: (n: number) => boolean, frontiere: number): boolean {
  const ineq = decouperInequation(v);
  if (!ineq || !contientN(v)) return false;
  const pts = pointsTest(frontiere);
  let compares = 0;
  for (const x of pts) {
    const r = vraiPour(ineq, x);
    if (r === null) continue;
    compares++;
    if (r === reference(x)) return false;
  }
  return compares > 0;
}

/** Valeur lue (réelle) d'une saisie, pour les messages ciblés. */
export function valeurLue(v: string): number | null {
  return lireReel(v);
}

/** La saisie vaut-elle `c` (exactement, ou arrondie avec ses propres décimales) ? */
export function vautEnviron(v: string, c: number, tolerance = 0): boolean {
  const x = lireReel(v);
  if (x === null) return false;
  const dec = ecritureDecimale(v);
  const demi = dec ? 0.5 * 10 ** -dec.decimales : EPS;
  return Math.abs(x - c) <= demi + tolerance + 1e-12;
}

export type { StatutVerification };
