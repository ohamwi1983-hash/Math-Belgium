import type { ExerciceChaslesSansFigure, ExerciceCoefficients, ExerciceDemontrer, ExerciceInserer, ExerciceReduire, VarianteChasles } from "../../core/chaslesSansFigure.types";
import type { TermeVecteur } from "../../moteur/expressionChasles";
import { choisir, entier, melanger } from "../../ui/outilsAnalytiqueLotG";

/**
 * Générateur de gen130 « Chasles sans figure ». Tout le hasard passe par `Math.random`
 * (`genererAvecCode` : le QR code rouvre le MÊME exercice).
 *
 * - Réduire : le résultat (vecteur nul — chaîne fermée — une fois sur trois, sinon un vecteur) est
 *   tiré AVANT tout le reste ; n = 3 ou 4 vecteurs, 1 ou 2 écrits « à l'envers » avec un « − »
 *   (`forme`) ; les lettres de la chaîne sont mélangées (pas « de A à D » dans l'ordre alphabétique)
 *   et les termes affichés ne se relaient jamais déjà dans l'ordre ; le premier terme est positif.
 * - Simplifier : k ∈ {2, 3, 4}, puis le coefficient final r ∈ {−1, 0, 1, 2, 3} (r ≠ k) tiré à parts
 *   égales — r = 0 (vecteur nul) n'est jamais filtré : c'est la réponse.
 * - Démontrer : quatre lettres mélangées ; la bonne première ligne (insérer S dans PQ ou Q dans
 *   RS) et l'ordre des propositions sont tirés au hasard.
 * - Insérer : milieu (I milieu de [AB], M quelconque) ou point défini par a·MA + b·MB = 0, avec
 *   (a ; b) parmi sept couples (dont (1 ; 1) : M est alors le milieu).
 */

const POOLS = [
  ["A", "B", "C", "D", "E"],
  ["M", "N", "P", "Q", "R"],
  ["E", "F", "G", "H", "K"],
  ["R", "S", "T", "U", "V"],
];

const vec = (k: number, de: string, vers: string): TermeVecteur => ({ k, de, vers });

/** Les vecteurs affichés se relaient-ils déjà dans l'ordre (rotation de la chaîne comprise) ? */
function dejaEnChaine(indices: number[], n: number, ferme: boolean): boolean {
  for (let i = 0; i + 1 < indices.length; i++) {
    const suivant = indices[i]! + 1;
    if (indices[i + 1] !== (ferme ? suivant % n : suivant)) return false;
  }
  return true;
}

export function genererReduire(ferme?: boolean, n?: 3 | 4, nbRetournes?: 1 | 2): ExerciceReduire {
  const f = ferme ?? Math.random() < 1 / 3;
  const nn = n ?? choisir([3, 4] as const);
  const r = nbRetournes ?? choisir([1, 2] as const);
  const lettres = melanger(choisir(POOLS));
  const chaine = lettres.slice(0, f ? nn : nn + 1);
  const vecteurs = Array.from({ length: nn }, (_, i) => [chaine[i]!, chaine[(i + 1) % chaine.length]!] as const);
  const retournes = new Set(melanger(Array.from({ length: nn }, (_, i) => i)).slice(0, r));
  for (;;) {
    const ordre = melanger(Array.from({ length: nn }, (_, i) => i));
    if (retournes.has(ordre[0]!)) continue;
    if (dejaEnChaine(ordre, nn, f)) continue;
    const termes = ordre.map((i) => (retournes.has(i) ? vec(-1, vecteurs[i]![1], vecteurs[i]![0]) : vec(1, vecteurs[i]![0], vecteurs[i]![1])));
    return { variante: "reduire", chaine, ferme: f, termes, nbRetournes: r };
  }
}

export function genererCoefficients(retourneK?: boolean, retourneC?: boolean): ExerciceCoefficients {
  const rk = retourneK ?? Math.random() < 0.5;
  const rc = retourneC ?? Math.random() < 0.5;
  const [X, Y, Z] = melanger(choisir(POOLS)) as [string, string, string];
  const k = choisir([2, 3, 4]);
  const r = choisir([-1, 0, 1, 2, 3].filter((v) => v !== k));
  const c = r - k;
  let t1 = vec(k, X, Y);
  let t2 = vec(k, Y, Z);
  if (rk) {
    if (Math.random() < 0.5) t1 = vec(-k, Y, X);
    else t2 = vec(-k, Z, Y);
  }
  const t3 = rc ? vec(-c, Z, X) : vec(c, X, Z);
  let termes: TermeVecteur[];
  do termes = melanger([t1, t2, t3]);
  while (termes[0]!.k < 0);
  return { variante: "coefficients", X, Y, Z, k, c, groupe: [t1, t2], troisieme: t3, termes, retourneK: rk, retourneC: rc };
}

export function genererDemontrer(sousForme?: "echange" | "difference"): ExerciceDemontrer {
  const sf = sousForme ?? choisir(["echange", "difference"] as const);
  const [P, Q, R, S] = melanger(choisir(POOLS)) as [string, string, string, string];
  const gauche = sf === "echange" ? [vec(1, P, Q), vec(1, R, S)] : [vec(1, P, Q), vec(-1, R, Q)];
  let droite = sf === "echange" ? [vec(1, P, S), vec(1, R, Q)] : [vec(1, P, S), vec(-1, R, S)];
  if (sf === "echange" && Math.random() < 0.5) droite = [droite[1]!, droite[0]!];
  return { variante: "demontrer", sousForme: sf, P, Q, R, S, gauche, droite, insere: choisir(["S", "Q"] as const), ordre: melanger([0, 1, 2, 3]) };
}

const COUPLES: [number, number][] = [
  [1, 1],
  [2, 1],
  [1, 2],
  [3, 1],
  [1, 3],
  [3, 2],
  [2, 3],
];

export function genererInserer(sousForme?: "milieu" | "point"): ExerciceInserer {
  const sf = sousForme ?? choisir(["milieu", "point"] as const);
  const [A, B] = choisir([
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["R", "S"],
  ]) as [string, string];
  if (sf === "milieu") {
    return { variante: "inserer", sousForme: "milieu", A, B, I: choisir(["I", "J", "K"]), M: choisir(["M", "N", "P"]), a: 1, b: 1 };
  }
  const [a, b] = COUPLES[entier(0, COUPLES.length - 1)]!;
  return { variante: "inserer", sousForme: "point", A, B, I: choisir(["M", "N", "P", "X"]), M: "", a, b };
}

export function genererChasles(variante: VarianteChasles): ExerciceChaslesSansFigure {
  if (variante === "reduire") return genererReduire();
  if (variante === "coefficients") return genererCoefficients();
  if (variante === "demontrer") return genererDemontrer();
  return genererInserer();
}

export const CATALOGUE_VARIANTES: { id: VarianteChasles; label: string }[] = [
  { id: "reduire", label: "Réduire : retourner et réordonner" },
  { id: "demontrer", label: "Démontrer une égalité vectorielle" },
  { id: "inserer", label: "Insérer un point (milieu, point défini par une égalité)" },
  { id: "coefficients", label: "Simplifier avec des coefficients" },
];

export function construireAvecVariante(id: string): ExerciceChaslesSansFigure {
  if (id === "reduire" || id === "demontrer" || id === "inserer" || id === "coefficients") return genererChasles(id);
  return genererExerciceChasles();
}

export function genererExerciceChasles(): ExerciceChaslesSansFigure {
  return genererChasles(choisir(["reduire", "demontrer", "inserer", "coefficients"] as const));
}
