/**
 * Couche B — vérification pour "L'un sans l'autre" (chapitre 3, seizième générateur). Deux
 * mécanismes totalement indépendants (section "Tolérance sur la simplification", spec) :
 *  1. correction NUMÉRIQUE de la valeur (statut à 3 valeurs, `evaluerExpressionGenerale` — module
 *     frère, jamais dupliqué) ;
 *  2. détection STRUCTURELLE d'une forme non simplifiée (fraction réductible, racine non
 *     simplifiée, racine au dénominateur non rationalisée) — jamais un statut incorrect, seulement
 *     une pénalité additive appliquée côté moteur de session (voir sessionUnSansLautre.ts).
 */
import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 0.005;

function diagnostiquerReponseNumerique(cible: number, texte: string): StatutVerification {
  let valeur: number;
  try {
    valeur = evaluerExpressionGenerale(texte, 0);
  } catch {
    return "parse_error";
  }
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

export function diagnostiquerCarre(exercice: ExerciceUnSansLautre, texte: string): StatutVerification {
  return diagnostiquerReponseNumerique(exercice.carreCibleNum / exercice.carreCibleDen, texte);
}

export function verifierCarre(exercice: ExerciceUnSansLautre, texte: string): boolean {
  return diagnostiquerCarre(exercice, texte) === "correct";
}

export function diagnostiquerValeurSignee(exercice: ExerciceUnSansLautre, texte: string): StatutVerification {
  return diagnostiquerReponseNumerique(exercice.valeurCible, texte);
}

export function verifierValeurSignee(exercice: ExerciceUnSansLautre, texte: string): boolean {
  return diagnostiquerValeurSignee(exercice, texte) === "correct";
}

export function diagnostiquerTangente(exercice: ExerciceUnSansLautre, texte: string): StatutVerification {
  return diagnostiquerReponseNumerique(exercice.tanValeur, texte);
}

export function verifierTangente(exercice: ExerciceUnSansLautre, texte: string): boolean {
  return diagnostiquerTangente(exercice, texte) === "correct";
}

// --- Détection structurelle "forme non simplifiée" -------------------------------------------

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

/** `n` est sans facteur carré (aucun facteur premier au carré ne le divise) — un radicande déjà
 * pleinement extrait, ex. 2, 5, 6, 7... mais pas 8 (=2²·2) ni 12 (=2²·3). */
function estSansFacteurCarre(n: number): boolean {
  for (let k = 2; k * k <= n; k++) {
    if (n % (k * k) === 0) return false;
  }
  return true;
}

function normaliserTexte(texte: string): string {
  return texte.replace(/\s+/g, "").replace(",", ".");
}

/** Index du premier "/" à profondeur de parenthèses nulle (jamais celui, éventuel, à l'intérieur
 * d'un `sqrt(...)` — grammaire de ce générateur, jamais de fraction imbriquée dans le radicande). */
function indexBarreDivisionPrincipale(texte: string): number {
  let profondeur = 0;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (c === "(") profondeur++;
    else if (c === ")") profondeur--;
    else if (c === "/" && profondeur === 0) return i;
  }
  return -1;
}

/** `<entier>` ou `<coefficient>?sqrt(<entier>)` (coefficient optionnel, multiplication implicite ou
 * "*" explicite) — les deux seules formes de numérateur produites par ce générateur. `null` si le
 * texte ne correspond à aucune des deux (grammaire étroite, volontairement non exhaustive — voir
 * `estFormeSimplifiee`). */
function analyserNumerateur(texte: string): { coefficient: number; radicande: number } | null {
  let m = /^(\d+)$/.exec(texte);
  if (m) return { coefficient: Number(m[1]), radicande: 1 };
  m = /^(\d*)\*?sqrt\((\d+)\)$/.exec(texte);
  if (m) return { coefficient: m[1] === "" ? 1 : Number(m[1]), radicande: Number(m[2]) };
  return null;
}

/**
 * Une réponse mathématiquement correcte est-elle déjà sous forme pleinement simplifiée ? Couvre
 * les 3 cas de la spec : fraction irréductible, racine simplifiée (radicande sans facteur carré),
 * racine au dénominateur rationalisée (jamais de `sqrt(...)` après la barre de division). Grammaire
 * volontairement étroite (les formes réellement produites par ce générateur, cf.
 * `formatUnSansLautre.ts`) — un texte qui n'y correspond pas (formulation créative, décimal...) est
 * traité PAR DÉFAUT comme déjà simplifié (aucune pénalité) : la correctness NUMÉRIQUE a déjà été
 * validée séparément par `diagnostiquerReponseNumerique`, cette fonction n'est qu'un bonus de
 * pénalité, jamais un second gate — un faux négatif (pénalité manquée sur une forme exotique non
 * reconnue) est bien moins problématique qu'un faux positif (pénaliser à tort une réponse correcte
 * et déjà simplifiée écrite différemment de ce que prévoit la grammaire).
 */
export function estFormeSimplifiee(texteBrut: string): boolean {
  const texte = normaliserTexte(texteBrut);
  const reste = texte.startsWith("-") || texte.startsWith("+") ? texte.slice(1) : texte;

  const indexBarre = indexBarreDivisionPrincipale(reste);
  const numerateurTexte = indexBarre === -1 ? reste : reste.slice(0, indexBarre);
  const denominateurTexte = indexBarre === -1 ? "1" : reste.slice(indexBarre + 1);

  // Racine au dénominateur, jamais rationalisée : toujours non simplifiée.
  if (denominateurTexte.includes("sqrt(")) return false;
  if (!/^\d+$/.test(denominateurTexte)) return true; // dénominateur non reconnu — tolérant par défaut
  const denominateur = Number(denominateurTexte);

  const numerateur = analyserNumerateur(numerateurTexte);
  if (!numerateur) return true; // forme non reconnue par la grammaire étroite — tolérant par défaut

  const { coefficient, radicande } = numerateur;
  if (radicande !== 1 && !estSansFacteurCarre(radicande)) return false; // racine non simplifiée
  if (pgcd(coefficient, denominateur) !== 1) return false; // fraction non irréductible
  return true;
}
