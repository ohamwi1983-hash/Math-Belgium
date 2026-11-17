import {
  DECIMALES_ARGUMENT,
  DECIMALES_INTENSITE,
  DECIMALES_MODULE,
  argumentDegres,
  impedanceBobine,
  impedanceCondensateur,
  impedanceTotale,
  intensite,
  moduleZ,
  reactanceBranche,
} from "../core6e/impedancesComplexes";
import type { Complexe, ExerciceImpedances, NatureCircuit } from "../core6e/impedancesComplexes";
import type { StatutVerification } from "../moteur/statutVerification";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { evaluerValeurComplexe } from "./expressionComplexe";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseImpedances } from "./typesImpedances";

/**
 * Couche B (6e) — vérification de `6gen96` « Électricité : impédances complexes ». Toutes les
 * valeurs attendues viennent de `core6e/impedancesComplexes.ts` (source unique).
 *
 * - `composants` : Z_L et/ou Z_C, nombres complexes saisis avec j (« 80j », « −40j », « j·80 »,
 *   « −j/(25e-6·1000) »… — évaluateur complexe du chapitre, j lu comme i ; i accepté aussi) ;
 *   valeurs exactes (réactances entières).
 * - `totale` : Re Z et Im Z, valeurs exactes (entières en série, au plus deux décimales en
 *   parallèle).
 * - `polaire` : |Z| au dixième d'ohm, φ au dixième de degré ; `intensite` : I au centième d'ampère.
 *   Tolérance d'une unité de la précision demandée (et 0,8 % pour I, qui peut venir d'un |Z|
 *   arrondi).
 * - `nature` : choix fermé (identifiant de `OPTIONS_NATURE`).
 *
 * Refusés SANS tentative (`controleAvantSoumission`) : saisie illisible, « j » dans une partie
 * réelle ou imaginaire, angle donné en radians, valeur arrondie trop grossièrement (moins de
 * décimales que demandé, mais juste à sa propre précision), valeur seulement arrondie là où une
 * valeur exacte est attendue (parallèle).
 */

type TypeChamp = "complexe" | "exact" | "arrondi";

interface ChampAttendu {
  type: TypeChamp;
  /** Pour `complexe`. */
  complexe?: Complexe;
  /** Pour `exact` et `arrondi`. */
  valeur: number;
  /** Décimales demandées (`arrondi`). */
  decimales?: number;
  /** Tolérance absolue. */
  tolerance: number;
  /** Angle en degrés (contrôle « radians »). */
  angle?: boolean;
}

const TOLERANCE_EXACTE = 0.006;

function tolArrondi(dec: number): number {
  return 10 ** -dec + 1e-9;
}

export function champsAttendus(e: ExerciceImpedances, phase: PhaseImpedances): ChampAttendu[] {
  switch (phase) {
    case "composants": {
      const c: ChampAttendu[] = [];
      if (e.xL !== null) c.push({ type: "complexe", complexe: impedanceBobine(e), valeur: 0, tolerance: TOLERANCE_EXACTE });
      if (e.xC !== null) c.push({ type: "complexe", complexe: impedanceCondensateur(e), valeur: 0, tolerance: TOLERANCE_EXACTE });
      return c;
    }
    case "totale": {
      const z = impedanceTotale(e);
      return [
        { type: "exact", valeur: z.re, tolerance: TOLERANCE_EXACTE },
        { type: "exact", valeur: z.im, tolerance: TOLERANCE_EXACTE },
      ];
    }
    case "polaire":
      return [
        { type: "arrondi", valeur: moduleZ(e), decimales: DECIMALES_MODULE, tolerance: tolArrondi(DECIMALES_MODULE) },
        { type: "arrondi", valeur: argumentDegres(e), decimales: DECIMALES_ARGUMENT, tolerance: tolArrondi(DECIMALES_ARGUMENT), angle: true },
      ];
    case "intensite": {
      const i = intensite(e);
      return [{ type: "arrondi", valeur: i, decimales: DECIMALES_INTENSITE, tolerance: Math.max(tolArrondi(DECIMALES_INTENSITE), 0.008 * i) }];
    }
    case "nature":
      return [];
  }
}

// ============================================================================
// Lecture des saisies.
// ============================================================================

/** Retire les unités tolérées en fin de saisie (Ω, ohm(s), °, degré(s), A, V). */
function sansUnite(texte: string): string {
  return normaliserSigneMoins(texte)
    .replace(/(ohms?|Ω|°|degrés?|degres?)\s*$/i, "")
    .replace(/\s+A\s*$/, "")
    .replace(/(\d)\s*A\s*$/, "$1")
    .trim();
}

export function lireReel(texte: string): number | null {
  const s = sansUnite(texte);
  if (s === "" || /[ij]/i.test(s.replace(/sqrt|pi/gi, ""))) return null;
  const v = evaluerValeurExponentielle(s);
  return v !== null && Number.isFinite(v) ? v : null;
}

export function lireComplexe(texte: string): Complexe | null {
  const s = sansUnite(texte);
  if (s === "") return null;
  const v = evaluerValeurComplexe(s.replace(/j/gi, "i"));
  return v !== null && Number.isFinite(v.re) && Number.isFinite(v.im) ? v : null;
}

/** Nombre de décimales écrites (« 44,72 » → 2), `null` si la saisie n'est pas un simple nombre. */
function decimalesEcrites(texte: string): number | null {
  const m = sansUnite(texte).match(/^[-+]?\d+(?:[.,](\d+))?$/);
  return m ? (m[1]?.length ?? 0) : null;
}

function statutChamp(texte: string, a: ChampAttendu): StatutVerification {
  if (a.type === "complexe") {
    const z = lireComplexe(texte);
    if (z === null) return "parse_error";
    return Math.abs(z.re - a.complexe!.re) <= a.tolerance && Math.abs(z.im - a.complexe!.im) <= a.tolerance ? "correct" : "not_equivalent";
  }
  const v = lireReel(texte);
  if (v === null) return "parse_error";
  return Math.abs(v - a.valeur) <= a.tolerance ? "correct" : "not_equivalent";
}

export function diagnostiquerChamps(e: ExerciceImpedances, phase: PhaseImpedances, valeurs: string[]): StatutVerification[] {
  return champsAttendus(e, phase).map((a, i) => statutChamp(valeurs[i] ?? "", a));
}

export function verifierEcran(e: ExerciceImpedances, phase: PhaseImpedances, valeurs: string[]): boolean {
  if (phase === "nature") return (valeurs[0] as NatureCircuit) === e.nature;
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  return statuts.length > 0 && statuts.every((s) => s === "correct");
}

// ============================================================================
// Contrôle AVANT soumission — aucun de ces messages ne consomme de tentative.
// ============================================================================

const SANS_TENTATIVE = " Cette saisie ne compte pas comme une tentative.";

function precisionTexte(dec: number): string {
  return dec === 1 ? "au dixième" : "au centième";
}

/** Message qui ARRÊTE la soumission, `null` sinon. */
export function controleAvantSoumission(e: ExerciceImpedances, phase: PhaseImpedances, valeurs: string[]): string | null {
  if (phase === "nature") return null;
  const attendus = champsAttendus(e, phase);
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) {
    if (phase === "composants") return "Saisie non reconnue — écris l'impédance sous la forme bj, par exemple 25j ou −12j (le calcul peut aussi être écrit, comme −j/(25e-6·1000))." + SANS_TENTATIVE;
    if (valeurs.some((v) => /[ij]/i.test(v.replace(/sqrt|pi/gi, "")))) {
      return phase === "totale"
        ? "Écris chaque partie sans j : la partie réelle dans la première case, le nombre qui multiplie j dans la seconde." + SANS_TENTATIVE
        : "Écris un nombre réel, sans j." + SANS_TENTATIVE;
    }
    return "Saisie non reconnue — écris un nombre décimal, avec une virgule (par exemple 36,1)." + SANS_TENTATIVE;
  }
  for (let i = 0; i < attendus.length; i++) {
    const a = attendus[i];
    if (statuts[i] === "correct" || a.type === "complexe") continue;
    const v = lireReel(valeurs[i])!;
    if (a.angle && Math.abs(a.valeur) > 1 && Math.abs(v - (a.valeur * Math.PI) / 180) <= 0.006) {
      return "Cet angle est en radians : donne le déphasage en DEGRÉS (règle la calculatrice en mode degrés)." + SANS_TENTATIVE;
    }
    const d = decimalesEcrites(valeurs[i]);
    if (a.type === "arrondi" && d !== null && d < a.decimales! && Math.abs(v - a.valeur) <= 10 ** -d * 0.5 + 1e-9) {
      return `Arrondi trop grossier : donne la valeur ${precisionTexte(a.decimales!)}.` + SANS_TENTATIVE;
    }
    if (a.type === "exact" && Math.abs(v - a.valeur) <= 0.06) {
      return "Cette valeur n'est qu'un arrondi : donne la valeur EXACTE (ici, un nombre décimal qui tombe juste)." + SANS_TENTATIVE;
    }
  }
  return null;
}

// ============================================================================
// Pièges reconnus (jamais la valeur attendue).
// ============================================================================

function proche(a: number | null, b: number, tol = TOLERANCE_EXACTE): boolean {
  return a !== null && Math.abs(a - b) <= tol;
}

function piegeBobine(e: ExerciceImpedances, z: Complexe | null): string | null {
  if (z === null || e.xL === null) return null;
  const x = e.xL;
  if (proche(z.re, x) && proche(z.im, 0)) return "Une bobine a une impédance IMAGINAIRE pure : n'oublie pas le facteur j.";
  if (proche(z.re, 0) && proche(Math.abs(z.im), x * 1000)) return "Convertis l'inductance en henrys avant de calculer : 1 mH = 0,001 H.";
  if (proche(z.re, 0) && proche(z.im, -x)) return "L'impédance d'une bobine, jLω, a une partie imaginaire POSITIVE.";
  if (proche(z.re, 0) && proche(Math.abs(z.im), 1 / x, 1e-6)) return "Pour la bobine, on MULTIPLIE j par L et par ω (c'est le condensateur qui donne une fraction).";
  return null;
}

function piegeCondensateur(e: ExerciceImpedances, z: Complexe | null): string | null {
  if (z === null || e.xC === null) return null;
  const x = e.xC;
  if (proche(z.re, x) && proche(z.im, 0)) return "L'impédance d'un condensateur est IMAGINAIRE pure : il manque j.";
  if (proche(z.re, -x) && proche(z.im, 0)) return "L'impédance d'un condensateur est IMAGINAIRE pure : 1/j = −j, il reste j dans le résultat.";
  if (proche(z.re, 0) && proche(z.im, x)) return "Attention au signe : 1/j = j/j² = −j, donc l'impédance d'un condensateur a une partie imaginaire NÉGATIVE.";
  if (proche(z.re, 0) && proche(Math.abs(z.im), x / 1e6, 1e-9)) return "Convertis la capacité en farads avant de calculer : 1 µF = 0,000001 F.";
  if (proche(z.re, 0) && proche(Math.abs(z.im), 1 / x, 1e-9)) return "L'impédance du condensateur est 1/(jCω) : on DIVISE 1 par Cω, on ne multiplie pas C par ω.";
  return null;
}

function piegeTotale(e: ExerciceImpedances, re: number | null, im: number | null): string | null {
  const z = impedanceTotale(e);
  if (proche(re, z.im) && proche(im, z.re) && Math.abs(z.re - z.im) > TOLERANCE_EXACTE) return "Tu as inversé la partie réelle et la partie imaginaire.";
  if (e.variante === "parallele") {
    const X = reactanceBranche(e);
    if (proche(re, e.R) && proche(im, X)) return "En parallèle, on n'additionne pas les impédances : ce sont leurs INVERSES qui s'additionnent.";
    if (proche(re, 1 / e.R, 1e-4) && proche(im, -1 / X, 1e-4)) return "Tu as calculé 1/Z : il reste à prendre l'inverse pour obtenir Z.";
    const d = e.R * e.R + X * X;
    if (proche(re, e.R * X * X) || proche(im, e.R * e.R * X)) return `N'oublie pas de diviser par le dénominateur devenu réel, ${d}.`;
  } else {
    const xL = e.xL ?? 0;
    const xC = e.xC ?? 0;
    if (xC > 0 && proche(re, e.R) && proche(im, xL + xC)) return "L'impédance du condensateur a une partie imaginaire NÉGATIVE : sa réactance se soustrait.";
    if (proche(re, e.R + xL + xC) || proche(re, e.R + Math.abs(xL - xC))) return "Ne mélange pas les parties : R est la partie réelle, les termes en j forment la partie imaginaire.";
  }
  if (proche(re, z.re) && proche(im, -z.im) && z.im !== 0) return "La partie réelle est juste ; revois le signe de la partie imaginaire.";
  return null;
}

function piegePolaire(e: ExerciceImpedances, m: number | null, phi: number | null): string | null {
  const z = impedanceTotale(e);
  const mod = moduleZ(e);
  const ang = argumentDegres(e);
  const messages: string[] = [];
  if (m !== null && Math.abs(m - mod) > tolArrondi(DECIMALES_MODULE)) {
    if (proche(m, z.re + Math.abs(z.im), 0.11)) messages.push("Le module n'est pas la somme des parties : |Z| = √(a² + b²).");
    else if (proche(m, z.re * z.re + z.im * z.im, 0.11)) messages.push("N'oublie pas la racine carrée dans le module.");
  }
  if (phi !== null && Math.abs(phi - ang) > tolArrondi(DECIMALES_ARGUMENT) && z.im !== 0) {
    const inverse = (Math.atan2(z.re, Math.abs(z.im)) * 180) / Math.PI;
    if (proche(Math.abs(phi), inverse, 0.11)) messages.push("φ = arctan(b/a) : la partie imaginaire au numérateur, la partie réelle au dénominateur.");
    else if (proche(phi, -ang, 0.11)) messages.push("Revois le signe de φ : il est celui de la partie imaginaire de Z.");
  }
  return messages.length > 0 ? messages.join(" ") : null;
}

function piegeIntensite(e: ExerciceImpedances, i: number | null): string | null {
  if (i === null) return null;
  const z = impedanceTotale(e);
  const mod = moduleZ(e);
  const tol = 0.011;
  if (Math.abs(mod - z.re) > 0.05 && proche(i, e.U / z.re, Math.max(tol, 0.006 * (e.U / z.re)))) return "La loi d'Ohm utilise le MODULE de l'impédance |Z|, pas seulement sa partie réelle.";
  if (proche(i, e.U * mod, 0.5)) return "I = U/|Z| : on DIVISE la tension par le module de l'impédance.";
  if (proche(i, mod / e.U, tol)) return "I = U/|Z| : la tension au numérateur, le module au dénominateur.";
  if (z.im !== 0 && proche(i, e.U / (z.re + Math.abs(z.im)), tol)) return "Le module de Z n'est pas la somme de ses parties : |Z| = √(a² + b²).";
  return null;
}

/** Message ciblé sur une erreur classique, `null` si rien de reconnaissable (ou réponse juste). */
export function messagePiege(e: ExerciceImpedances, phase: PhaseImpedances, valeurs: string[]): string | null {
  switch (phase) {
    case "composants": {
      const messages: string[] = [];
      let k = 0;
      if (e.xL !== null) {
        const m = piegeBobine(e, lireComplexe(valeurs[k] ?? ""));
        if (m) messages.push(m);
        k++;
      }
      if (e.xC !== null) {
        const m = piegeCondensateur(e, lireComplexe(valeurs[k] ?? ""));
        if (m) messages.push(m);
      }
      return messages.length > 0 ? messages.join(" ") : null;
    }
    case "totale":
      return piegeTotale(e, lireReel(valeurs[0] ?? ""), lireReel(valeurs[1] ?? ""));
    case "polaire":
      return piegePolaire(e, lireReel(valeurs[0] ?? ""), lireReel(valeurs[1] ?? ""));
    case "intensite":
      return piegeIntensite(e, lireReel(valeurs[0] ?? ""));
    case "nature":
      return null;
  }
}
