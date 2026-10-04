import type { Enonce, Exercice } from "../core/generateur.types";

/**
 * Étape "simplification" (nouvelle, prompt utilisateur du 06/09 — équations non réduites comme
 * 2x²-10x=0) : certaines catégories du générateur (mise_en_evidence/binome_conjugue/
 * produit_remarquable/cas_general, `a = randomInt(1,4)`) produisent un `enonce` dont les 3
 * coefficients partagent un facteur commun > 1 — jamais le cas pour mise_en_evidence_generalisee
 * (a=1 fixe) ni pour les variantes irrationnelles (a=1 fixe également, voir
 * generateurs/secondDegre/categories/*Irrationnelle.ts). Cette étape, quand nécessaire, précède
 * désormais toutes les autres (voir phaseInitiale dans session.ts) : l'élève réduit l'équation au
 * maximum avant de continuer, et "tout le reste de l'écran se fait sur base de la forme
 * simplifiée" — voir exerciceSimplifie ci-dessous.
 */

function pgcd(x: number, y: number): number {
  let a = Math.abs(x);
  let b = Math.abs(y);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** pgcd(|a|,|b|,|c|) — jamais 0 puisque a est toujours non nul (équation du 2nd degré). */
export function facteurCommun({ a, b, c }: Enonce): number {
  return pgcd(pgcd(a, b), c);
}

export function necessiteSimplification(exercice: Exercice): boolean {
  return facteurCommun(exercice.enonce) > 1;
}

/** Forme réduite (pgcd=1) de l'énoncé — coefficients divisés par leur pgcd. */
export function enonceSimplifie(enonce: Enonce): Enonce {
  const g = facteurCommun(enonce);
  return { a: enonce.a / g, b: enonce.b / g, c: enonce.c / g };
}

/** (x - r) ou (x + |r|) selon le signe de r — jamais appelé avec r=0. */
function formatFacteurRacine(r: number): string {
  return r > 0 ? `x - ${r}` : `x + ${Math.abs(r)}`;
}

/** (x - r) parenthésé, ou "x" nu si r=0 — jamais "(x - 0)". */
function formatFacteurSeul(r: number): string {
  return r === 0 ? "x" : `(${formatFacteurRacine(r)})`;
}

/** Contenu négé de formatFacteurRacine (sans les parenthèses) : "r - x" ou "-x - |r|" — jamais appelé avec r=0. */
function formatFacteurRacineNegatif(r: number): string {
  return r > 0 ? `${r} - x` : `-x - ${Math.abs(r)}`;
}

/**
 * Réplique locale de `ui/formatEquation.ts:formatFormeFactoriseeDepuisRacines` — moteur/ n'importe
 * jamais ui/ (règle non négociable de CLAUDE.md sur la dépendance à sens unique des couches), donc
 * cette petite reconstruction (a(x-r1)(x-r2), a(x-r)² pour une racine double) est dupliquée ici
 * plutôt que partagée.
 *
 * a=-1 avec une racine nulle (mise_en_evidence, prompt utilisateur du 26/09 — gen5, seul générateur
 * dont le facteur factorisable tire un `a` de signe libre, cf. construireFacteurFactorisable.ts) :
 * jamais "-x(...)", qui cache le facteur "x" derrière une négation externe. Bug latent confirmé
 * empiriquement : `estUnProduitAvecXExplicite` (expressionAlgebrique.ts) exige "x" explicite au
 * premier niveau d'un produit, or "-x(...)" est structurellement une négation ENGLOBANT un produit,
 * pas un produit dont x serait un facteur — la forme de référence reconstruite ici devenait alors
 * elle-même rejetée par le vérificateur censé la valider. Corrigé en poussant le signe dans le
 * second facteur plutôt que de préfixer tout le produit : "x(-x - r)" plutôt que "-x(x + r)".
 */
function formeFactoriseeDepuisRacines(a: number, racines: [number, number]): string {
  const [r1, r2] = [...racines].sort((x, y) => y - x);
  if (r1 === r2) {
    const prefixe = a === 1 ? "" : a === -1 ? "-" : String(a);
    return r1 === 0 ? `${prefixe}x^2` : `${prefixe}(${formatFacteurRacine(r1)})^2`;
  }
  const [premier, second] = r2 === 0 ? [r2, r1] : [r1, r2];
  if (a === -1 && premier === 0) {
    return `x(${formatFacteurRacineNegatif(second)})`;
  }
  const prefixe = a === 1 ? "" : a === -1 ? "-" : String(a);
  return `${prefixe}${formatFacteurSeul(premier)}${formatFacteurSeul(second)}`;
}

/**
 * Exercice recalculé sur la base des coefficients réduits, une fois l'étape de simplification
 * confirmée — remplace `exerciceCourant` dans la session (voir soumettreReponseSimplification) :
 * isolement/reconnaissance/champ1/zéros travaillent alors tous sur cette version. Les racines sont
 * inchangées par construction (diviser a,b,c par un facteur commun ne change pas les zéros de
 * l'équation) ; `formeFactorisee`, quand elle existe, est reconstruite depuis les nouveaux
 * coefficients (son préfixe `a` doit refléter la réduction) ; `delta` (cas_general, seule
 * catégorie sans formeFactorisee ici) est recalculé directement depuis les coefficients réduits.
 */
export function exerciceSimplifie(exercice: Exercice): Exercice {
  const enonce = enonceSimplifie(exercice.enonce);
  const solution =
    exercice.solution.formeFactorisee !== undefined
      ? { ...exercice.solution, formeFactorisee: formeFactoriseeDepuisRacines(enonce.a, exercice.solution.racines) }
      : { ...exercice.solution, delta: enonce.b * enonce.b - 4 * enonce.a * enonce.c };
  return { ...exercice, enonce, solution };
}
