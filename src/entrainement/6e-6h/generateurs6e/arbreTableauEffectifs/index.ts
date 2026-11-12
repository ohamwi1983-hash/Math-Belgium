import type { CleBranche, CleCellule, ContexteArbreTableau, ExerciceArbreTableauEffectifs, ModeDepart } from "../../core6e/arbreTableauEffectifs.types";
import { ORDRE_CELLULES } from "../../core6e/arbreTableauEffectifs.types";
import { ordreRemplissage, sontIndependantsArbreTableau } from "../../moteur6e/verificationArbreTableauEffectifs";
import { CONTEXTES } from "./contextes";

/**
 * Couche A (6e) — tirage de `6gen74` (« Arbre, tableau, effectifs : une situation, trois
 * écritures »). Les EFFECTIFS ENTIERS sont tirés d'abord :
 * 1. N ∈ {200, 400, 500, 1000} ;
 * 2. P(A) multiple de 0,05 dans la plage du contexte (≤ 0,6) → n(A) = N·P(A), entier ;
 * 3. P(B|A), P(B|Ā) multiples de 0,05 tels que n(A)·P(B|A) et n(Ā)·P(B|Ā) soient ENTIERS ;
 *    dépendance par défaut (P(B|A) ≠ P(B|Ā)), indépendance exacte (P(B|A) = P(B|Ā)) en cas
 *    particulier ;
 * 4. P(A|B) ≥ 0,1 (sa valeur décimale s'arrondit alors au centième, comme annoncé à l'écran).
 * Toutes les cases du tableau sont donc entières et toutes les branches de l'arbre sont des
 * décimaux exacts à au plus deux décimales.
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Multiples de 5 (points de %) de la plage [min ; max]. */
function pointsDePourcent([min, max]: [number, number]): number[] {
  const liste: number[] = [];
  for (let p = min; p <= max; p += 5) liste.push(p);
  return liste;
}

const EFFECTIFS_TOTAUX = [200, 400, 500, 1000] as const;

/** Part des tirages libres qui tombent sur le cas particulier « indépendants ». */
const PROBA_INDEPENDANCE_LIBRE = 0.15;

function tirerEffectifs(contexte: ContexteArbreTableau, independant: boolean): Record<CleCellule, number> | null {
  const N = tirerParmi(EFFECTIFS_TOTAUX);
  const pA = tirerParmi(pointsDePourcent(contexte.plageA).filter((p) => p <= 60 && (N * p) % 100 === 0));
  if (pA === undefined) return null;
  const nA = (N * pA) / 100;
  const nNA = N - nA;
  const candA = pointsDePourcent(contexte.plageBA).filter((q) => (nA * q) % 100 === 0);
  const candNA = pointsDePourcent(contexte.plageBnA).filter((q) => (nNA * q) % 100 === 0);
  let qA: number;
  let qNA: number;
  if (independant) {
    const communs = candA.filter((q) => candNA.includes(q));
    if (communs.length === 0) return null;
    qA = qNA = tirerParmi(communs);
  } else {
    if (candA.length === 0 || candNA.length === 0) return null;
    qA = tirerParmi(candA);
    const autres = candNA.filter((q) => q !== qA);
    if (autres.length === 0) return null;
    qNA = tirerParmi(autres);
  }
  const AB = (nA * qA) / 100;
  const nAB = (nNA * qNA) / 100;
  const B = AB + nAB;
  if (B === 0 || B === N || AB / B < 0.1) return null;
  return { AB, AnB: nA - AB, A: nA, nAB, nAnB: nNA - nAB, nA: nNA, B, nB: N - B, N };
}

/** `arbrePartiel` : une branche donnée par nœud, le plus souvent la « principale » (A, B|A, B|Ā),
 * parfois sa complémentaire. */
function tirerBranchesDonnees(): CleBranche[] {
  const paires: [CleBranche, CleBranche][] = [
    ["A", "nA"],
    ["B_A", "nB_A"],
    ["B_nA", "nB_nA"],
  ];
  return paires.map(([principale, complement]) => (Math.random() < 0.75 ? principale : complement));
}

/** `tableauPartiel` : N et 3 autres cases, tableau complétable de proche en proche (5 cases à
 * trouver), avec au moins une case intérieure donnée (sinon seuls des totaux se complètent). */
function tirerCellulesDonnees(): CleCellule[] {
  const autres: CleCellule[] = ORDRE_CELLULES.filter((c) => c !== "N");
  const interieures: CleCellule[] = ["AB", "AnB", "nAB", "nAnB"];
  for (let essai = 0; essai < 200; essai++) {
    const melange = [...autres].sort(() => Math.random() - 0.5).slice(0, 3);
    if (!melange.some((c) => interieures.includes(c))) continue;
    const donnees: CleCellule[] = ["N", ...ORDRE_CELLULES.filter((c) => melange.includes(c))];
    if (ordreRemplissage(donnees)) return donnees;
  }
  return ["N", "A", "AB", "nAB"];
}

export function construireExerciceArbreTableau(mode: ModeDepart, independant: boolean): ExerciceArbreTableauEffectifs {
  const contextes = independant ? CONTEXTES.filter((c) => c.independancePlausible) : CONTEXTES;
  for (let essai = 0; essai < 1000; essai++) {
    const contexte = tirerParmi(contextes);
    const effectifs = tirerEffectifs(contexte, independant);
    if (!effectifs) continue;
    const exercice: ExerciceArbreTableauEffectifs = {
      mode,
      contexte,
      effectifs,
      independant,
      branchesDonnees: mode === "arbrePartiel" ? tirerBranchesDonnees() : [],
      cellulesDonnees: mode === "tableauPartiel" ? tirerCellulesDonnees() : ["N"],
    };
    // Garde : l'indépendance annoncée est bien l'égalité EXACTE des effectifs.
    if (sontIndependantsArbreTableau(exercice) !== independant) continue;
    return exercice;
  }
  throw new Error("construireExerciceArbreTableau : aucun tirage valide");
}

export function genererExerciceArbreTableauEffectifs(): ExerciceArbreTableauEffectifs {
  const mode = tirerParmi(["pourcentages", "arbrePartiel", "tableauPartiel"] as const);
  return construireExerciceArbreTableau(mode, Math.random() < PROBA_INDEPENDANCE_LIBRE);
}

/** Identifiants de variante forcée : le sens de départ (structure des écrans), plus le cas
 * particulier « indépendants » (sens de départ tiré au hasard). */
export type IdVarianteArbreTableauEffectifs = "pourcentages" | "arbrePartiel" | "tableauPartiel" | "independance";

export const CATALOGUE_VARIANTES: { id: IdVarianteArbreTableauEffectifs; label: string }[] = [
  { id: "pourcentages", label: "Pourcentages → arbre → tableau" },
  { id: "arbrePartiel", label: "Arbre partiel → arbre complet → tableau" },
  { id: "tableauPartiel", label: "Tableau partiel → tableau complet → arbre" },
  { id: "independance", label: "Cas particulier : événements indépendants" },
];

export function construireAvecVarianteId(id: IdVarianteArbreTableauEffectifs): ExerciceArbreTableauEffectifs {
  if (id === "independance") return construireExerciceArbreTableau(tirerParmi(["pourcentages", "arbrePartiel", "tableauPartiel"] as const), true);
  return construireExerciceArbreTableau(id, false);
}
