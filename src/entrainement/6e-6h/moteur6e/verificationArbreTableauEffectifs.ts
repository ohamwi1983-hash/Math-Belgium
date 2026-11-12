import type { CleBranche, CleCellule, ExerciceArbreTableauEffectifs } from "../core6e/arbreTableauEffectifs.types";
import { ORDRE_BRANCHES, ORDRE_CELLULES } from "../core6e/arbreTableauEffectifs.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseArbreTableauEffectifs } from "./typesArbreTableauEffectifs";
import { diagnostiquerProbabilite, sontIndependantsEffectifs } from "./verificationProbabilites";

/**
 * Couche B (6e) — valeurs attendues et vérification de `6gen74`. TOUTES les quantités dérivées
 * (probabilités des branches, cases inconnues, P(A|B), indépendance) sont calculées ICI à partir des
 * effectifs ENTIERS de l'instance — l'interface (`ui6e/formatArbreTableauEffectifs.ts`) et
 * l'adaptateur papier les réutilisent, jamais recalculées ailleurs.
 *
 * - Probabilités : `diagnostiquerProbabilite` (module partagé, audit 6e ch. 6, décision A) — forme
 *   exacte, décimal correctement arrondi (au moins 2 décimales ; 3 sous 0,1) ou pourcentage.
 * - Effectifs : entier exact (espaces de milliers tolérés).
 * - Indépendance : `sontIndependantsEffectifs` (égalité EXACTE n(A∩B)·N = n(A)·n(B), décision B).
 */

export interface Fraction {
  num: number;
  den: number;
}

export function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** Probabilité EXACTE d'une branche, comme rapport d'effectifs (non simplifié : n(A∩B)/n(A)…). */
export function fractionBranche(ex: ExerciceArbreTableauEffectifs, cle: CleBranche): Fraction {
  const n = ex.effectifs;
  switch (cle) {
    case "A":
      return { num: n.A, den: n.N };
    case "nA":
      return { num: n.nA, den: n.N };
    case "B_A":
      return { num: n.AB, den: n.A };
    case "nB_A":
      return { num: n.AnB, den: n.A };
    case "B_nA":
      return { num: n.nAB, den: n.nA };
    case "nB_nA":
      return { num: n.nAnB, den: n.nA };
  }
}

export function valeurBranche(ex: ExerciceArbreTableauEffectifs, cle: CleBranche): number {
  const f = fractionBranche(ex, cle);
  return f.num / f.den;
}

/** Branche complémentaire (même nœud de départ). */
export function brancheComplementaire(cle: CleBranche): CleBranche {
  return ({ A: "nA", nA: "A", B_A: "nB_A", nB_A: "B_A", B_nA: "nB_nA", nB_nA: "B_nA" } as const)[cle];
}

/** Branches à trouver à l'écran « arbre », dans l'ordre de lecture. */
export function branchesInconnues(ex: ExerciceArbreTableauEffectifs): CleBranche[] {
  return ORDRE_BRANCHES.filter((b) => !ex.branchesDonnees.includes(b));
}

/** Cases à trouver à l'écran « tableau », dans l'ordre de lecture. */
export function cellulesInconnues(ex: ExerciceArbreTableauEffectifs): CleCellule[] {
  return ORDRE_CELLULES.filter((c) => !ex.cellulesDonnees.includes(c));
}

/** P(B|A) — se lit sur l'arbre. */
export function fractionBSachantA(ex: ExerciceArbreTableauEffectifs): Fraction {
  return { num: ex.effectifs.AB, den: ex.effectifs.A };
}

/** P(A|B) — ne se lit PAS sur l'arbre : dénominateur n(B), total de la colonne de B. */
export function fractionASachantB(ex: ExerciceArbreTableauEffectifs): Fraction {
  return { num: ex.effectifs.AB, den: ex.effectifs.B };
}

export function fractionB(ex: ExerciceArbreTableauEffectifs): Fraction {
  return { num: ex.effectifs.B, den: ex.effectifs.N };
}

export function sontIndependantsArbreTableau(ex: ExerciceArbreTableauEffectifs): boolean {
  const n = ex.effectifs;
  return sontIndependantsEffectifs(n.A, n.B, n.AB, n.N);
}

// ============================================================================
// Remplissage du tableau de proche en proche (génération + corrigé)
// ============================================================================

/** Les 6 relations « total = partie + partie » du tableau. */
export const RELATIONS_TABLEAU: [CleCellule, CleCellule, CleCellule][] = [
  ["A", "AB", "AnB"],
  ["nA", "nAB", "nAnB"],
  ["N", "B", "nB"],
  ["B", "AB", "nAB"],
  ["nB", "AnB", "nAnB"],
  ["N", "A", "nA"],
];

export interface PasRemplissage {
  cle: CleCellule;
  /** La relation utilisée : [total, partie, partie]. */
  relation: [CleCellule, CleCellule, CleCellule];
}

/** Ordre dans lequel un élève remplit le tableau à partir des cases `connues` (une relation dont
 * une seule case manque donne cette case) ; `null` si le tableau n'est pas complétable ainsi. */
export function ordreRemplissage(connues: CleCellule[]): PasRemplissage[] | null {
  const su = new Set<CleCellule>(connues);
  const pas: PasRemplissage[] = [];
  let progres = true;
  while (progres && su.size < ORDRE_CELLULES.length) {
    progres = false;
    for (const rel of RELATIONS_TABLEAU) {
      const manquantes = rel.filter((c) => !su.has(c));
      if (manquantes.length === 1) {
        su.add(manquantes[0]);
        pas.push({ cle: manquantes[0], relation: rel });
        progres = true;
      }
    }
  }
  return su.size === ORDRE_CELLULES.length ? pas : null;
}

// ============================================================================
// Vérification
// ============================================================================

/** Effectif saisi : un entier (espaces de milliers tolérés). */
export function diagnostiquerEffectif(texte: string, attendu: number): StatutVerification {
  const propre = texte.replace(/[\s  ]/g, "");
  if (/^-?\d+$/.test(propre)) return Number(propre) === attendu ? "correct" : "not_equivalent";
  if (/^-?\d+(?:[.,]\d+)?$/.test(propre)) return "not_equivalent";
  return "parse_error";
}

export type ReponseIndependance = "oui" | "non";

/** Diagnostic CHAMP PAR CHAMP (l'écran signale seulement les champs faux). */
export function diagnostiquerChamps(ex: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs, valeurs: string[]): StatutVerification[] {
  switch (phase) {
    case "arbre":
      return branchesInconnues(ex).map((b, i) => diagnostiquerProbabilite(valeurs[i] ?? "", valeurBranche(ex, b)));
    case "tableau":
      return cellulesInconnues(ex).map((c, i) => diagnostiquerEffectif(valeurs[i] ?? "", ex.effectifs[c]));
    case "conditionnelles": {
      const bA = fractionBSachantA(ex);
      const aB = fractionASachantB(ex);
      return [diagnostiquerProbabilite(valeurs[0] ?? "", bA.num / bA.den), diagnostiquerProbabilite(valeurs[1] ?? "", aB.num / aB.den)];
    }
    case "independance": {
      const attendu: ReponseIndependance = sontIndependantsArbreTableau(ex) ? "oui" : "non";
      return [valeurs[0] === attendu ? "correct" : "not_equivalent"];
    }
  }
}

export function diagnostiquerEcran(ex: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(ex, phase, valeurs);
  if (statuts.every((s) => s === "correct")) return "correct";
  return statuts.includes("parse_error") ? "parse_error" : "not_equivalent";
}

export function verifierEcran(ex: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs, valeurs: string[]): boolean {
  return diagnostiquerEcran(ex, phase, valeurs) === "correct";
}
