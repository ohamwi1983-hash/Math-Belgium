import type { Enonce, ExerciceInequation } from "../core/inequation.types";

/**
 * Étape "simplification" (nouvelle, prompt utilisateur du 26/09 — généralise à ce générateur la
 * même étape déjà présente sur gen1, voir moteur/simplificationEquation.ts) : les 4 catégories
 * réutilisées par generateurs/inequations/construireDeltaXxx.ts (a=randomNonZeroInt(-4,4)) peuvent
 * produire un `enonce` dont les 3 coefficients partagent un facteur commun > 1, ex. 4x²-16x+16>0.
 * Contrat différent de gen1 (ax²+bx+c ◇ 0, jamais "=0") : `symbole`/`racines`/`solution` sont tous
 * inchangés par la réduction (diviser par un pgcd toujours POSITIF préserve le signe de chaque
 * coefficient, donc le signe de a et l'orientation de la comparaison à 0) — seuls `enonce` et
 * `delta` sont recalculés une fois la simplification confirmée (voir exerciceSimplifie).
 */

function pgcd(x: number, y: number): number {
  let a = Math.abs(x);
  let b = Math.abs(y);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** pgcd(|a|,|b|,|c|) — jamais 0 puisque a est toujours non nul (trinôme du 2nd degré). */
export function facteurCommun({ a, b, c }: Enonce): number {
  return pgcd(pgcd(a, b), c);
}

export function necessiteSimplification(exercice: ExerciceInequation): boolean {
  return facteurCommun(exercice.enonce) > 1;
}

/** Forme réduite (pgcd=1) de l'énoncé — coefficients divisés par leur pgcd. */
export function enonceSimplifie(enonce: Enonce): Enonce {
  const g = facteurCommun(enonce);
  return { a: enonce.a / g, b: enonce.b / g, c: enonce.c / g };
}

/**
 * Enonce opposé (a,b,c tous négés) — l'autre forme "coefficients entiers, sans facteur commun"
 * tout aussi valide que `enonceSimplifie` (prompt utilisateur du 26/09 : diviser par le pgcd
 * NÉGATIF plutôt que positif, ex. -4 plutôt que 4, pour rendre `a` positif). Contrairement à
 * `enonceSimplifie`, cette forme change le signe de `a` et donc, pour une inéquation, exige de
 * retourner le symbole de comparaison (voir verificationInequation.ts::diagnostiquerSimplification).
 */
export function enonceOppose(enonce: Enonce): Enonce {
  return { a: -enonce.a, b: -enonce.b, c: -enonce.c };
}

/**
 * Exercice recalculé sur la base des coefficients réduits, une fois l'étape de simplification
 * confirmée — remplace `exerciceCourant` dans la session (voir soumettreReponseSimplification) :
 * racines/signe_a/intervalle travaillent alors tous sur cette version. `racines` et `solution`
 * inchangés par construction (diviser a,b,c par un facteur commun positif ne change ni les zéros
 * ni le signe du trinôme) ; `delta` est recalculé directement depuis les coefficients réduits.
 */
export function exerciceSimplifie(exercice: ExerciceInequation): ExerciceInequation {
  const enonce = enonceSimplifie(exercice.enonce);
  const delta = enonce.b * enonce.b - 4 * enonce.a * enonce.c;
  return { ...exercice, enonce, delta };
}
