import type { PolynomeLineaire } from "../core/simplification.types";
import { evaluerExpression } from "./expressionAlgebrique";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 1e-6;
/** 8 points suffisent à prouver l'identité de deux polynômes de degré ≤2 (linéaire×linéaire) par échantillonnage. */
const POINTS_ECHANTILLONNAGE = [-4, -3, -2, -1, 1, 2, 3, 4];

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

function evaluerPolynomeLineaire(poly: PolynomeLineaire, x: number): number {
  return poly.k * (x - poly.p);
}

/**
 * Extrait le coefficient "significatif" d'une saisie par échantillonnage, indépendamment de toute
 * forme syntaxique : la pente si la saisie est linéaire (kx+m), ou la valeur elle-même si la
 * saisie est une constante pure (kx+m avec k=0) — cas d'une fraction dont le numérateur et le
 * dénominateur partagent la même racine, qui se réduit intégralement à un nombre plutôt qu'à un
 * polynôme linéaire plus petit (prompt-4-chemin-lineaire.md, section 4 : sous-variante 3(a) de
 * "deux_fractions_lineaires", où P1_3/P1_4 est toujours proportionnel donc toujours réductible
 * jusqu'à une constante). Sans cette distinction, une saisie constante aurait toujours une pente
 * nulle, et pgcd(0,0) rejetterait à tort toute réponse correctement réduite à une constante.
 */
function coefficientSignificatif(saisie: string): number {
  const f0 = evaluerExpression(saisie, 0);
  const f1 = evaluerExpression(saisie, 1);
  const f2 = evaluerExpression(saisie, 2);
  if (Math.abs(f1 - f0) < TOLERANCE && Math.abs(f2 - f1) < TOLERANCE) return f0;
  return f1 - f0;
}

/**
 * Étape "CE" : compare l'ensemble des valeurs interdites saisies à `exercice.ce`, indépendamment
 * de l'ordre — générique sur le nombre de valeurs (1 pour la construction un_denominateur, 2 pour
 * deux_denominateurs), jamais câblé en dur sur une seule valeur.
 */
export function verifierCE(saisies: number[], ce: number[]): boolean {
  if (saisies.length !== ce.length) return false;
  const saisiesTriees = [...saisies].sort((a, b) => a - b);
  const ceTriees = [...ce].sort((a, b) => a - b);
  return saisiesTriees.every((valeur, index) => Math.abs(valeur - ceTriees[index]) < TOLERANCE);
}

/**
 * Racines distinctes de `racines` (préserve l'ordre d'origine) — `[r, r]` (racine unique, chemin
 * linéaire ou racine double d'un produit remarquable) devient `[r]`, `[r1, r2]` avec r1≠r2 reste
 * inchangé (prompt-5-deduplication-racines-etrangeres.md).
 */
export function racinesDistinctes(racines: [number, number]): number[] {
  const [r1, r2] = racines;
  return Math.abs(r1 - r2) < TOLERANCE ? [r1] : [r1, r2];
}

/**
 * Étape "racines étrangères" (section 2, point 4 de la spec) : pour chaque racine **distincte**
 * (voir `racinesDistinctes` — prompt-5-deduplication-racines-etrangeres.md : une racine double ou
 * une racine unique du chemin linéaire ne compte qu'une seule fois, jamais une carte par position
 * du tableau brut), l'élève doit déclarer "valide" (true) si elle ne viole aucune CE, "à rejeter"
 * (false) sinon. `reponses` doit avoir exactement une entrée par racine distincte, dans le même
 * ordre — un nombre différent est rejeté explicitement plutôt que de comparer partiellement.
 * Générique sur la liste des CE — dans cette V1 elle ne contient jamais aucune des racines par
 * construction (voir core/equationRationnelle.types.ts), donc la bonne réponse est souvent "toutes
 * valides", mais le code compare bien à l'ensemble des CE plutôt que de renvoyer une constante.
 */
export function verifierRacinesEtrangeres(
  racines: [number, number],
  reponses: boolean[],
  valeursCE: number[],
): boolean {
  const distinctes = racinesDistinctes(racines);
  if (reponses.length !== distinctes.length) return false;
  return distinctes.every((racine, index) => {
    const estValide = !valeursCE.some((ce) => Math.abs(ce - racine) < TOLERANCE);
    return reponses[index] === estValide;
  });
}

/**
 * Étape "simplifier" (prompt-3-simplifier-et-isolement-flexible.md, section 2) : vérifie par
 * produit en croix que la fraction saisie est équivalente à la fraction d'origine (même principe
 * que verifierSimplification, exercice "Simplifier"), puis vérifie structurellement qu'une
 * réduction a réellement eu lieu — pgcd des coefficients dominants de la saisie égal à 1 (jamais
 * une recopie non réduite). Contrairement à verifierSimplification (qui rejette un dénominateur
 * s'annulant en une racine commune), ici il n'y a jamais de racine partagée entre numérateur et
 * dénominateur (exclue à la construction — voir CLAUDE.md) : la seule réduction possible est
 * numérique, d'où ce contrôle structurel différent.
 */
/** Statut à 3 valeurs (convention CLAUDE.md) — voir diagnostiquerSimplification pour le même
 * principe de validation syntaxique unique en amont (x=0), avant l'échantillonnage. */
export function diagnostiquerFractionSimplifiee(
  numerateurOriginal: PolynomeLineaire,
  denominateurOriginal: PolynomeLineaire,
  numerateurSaisi: string,
  denominateurSaisi: string,
): StatutVerification {
  try {
    evaluerExpression(numerateurSaisi, 0);
    evaluerExpression(denominateurSaisi, 0);
  } catch {
    return "parse_error";
  }

  const equivalente = POINTS_ECHANTILLONNAGE.every((x) => {
    const gauche = evaluerExpression(numerateurSaisi, x) * evaluerPolynomeLineaire(denominateurOriginal, x);
    const droite = evaluerExpression(denominateurSaisi, x) * evaluerPolynomeLineaire(numerateurOriginal, x);
    return Math.abs(gauche - droite) < TOLERANCE;
  });
  if (!equivalente) return "not_equivalent";

  const kNumerateurSaisi = coefficientSignificatif(numerateurSaisi);
  const kDenominateurSaisi = coefficientSignificatif(denominateurSaisi);
  const diviseur = pgcd(Math.round(Math.abs(kNumerateurSaisi)), Math.round(Math.abs(kDenominateurSaisi)));
  return diviseur === 1 ? "correct" : "not_equivalent";
}

export function verifierFractionSimplifiee(
  numerateurOriginal: PolynomeLineaire,
  denominateurOriginal: PolynomeLineaire,
  numerateurSaisi: string,
  denominateurSaisi: string,
): boolean {
  return (
    diagnostiquerFractionSimplifiee(numerateurOriginal, denominateurOriginal, numerateurSaisi, denominateurSaisi) === "correct"
  );
}

/**
 * Étape "simplifier" (léger, prompt-3-simplifier-et-isolement-flexible.md) : une ou deux fractions
 * soumises en une seule tentative (tout ou rien) — le statut agrégé donne priorité à "parse_error"
 * dès qu'un des champs (numérateur ou dénominateur, n'importe laquelle des 1-2 fractions) est
 * illisible, même principe que les autres diagnostics combinant plusieurs champs (convention
 * CLAUDE.md, "Statut de vérification à 3 valeurs"). `reponses` doit avoir la même longueur que
 * `fractions`, sinon "not_equivalent" (nombre de réponses incorrect, jamais un problème de syntaxe).
 */
export function diagnostiquerSimplifierToutes(
  fractions: Array<{ numerateur: PolynomeLineaire; denominateur: PolynomeLineaire }>,
  reponses: Array<{ numerateur: string; denominateur: string }>,
): StatutVerification {
  if (reponses.length !== fractions.length) return "not_equivalent";

  const statuts = fractions.map((fraction, index) =>
    diagnostiquerFractionSimplifiee(fraction.numerateur, fraction.denominateur, reponses[index].numerateur, reponses[index].denominateur),
  );
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}
