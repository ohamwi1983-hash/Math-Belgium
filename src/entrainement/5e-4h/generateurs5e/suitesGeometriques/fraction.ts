/**
 * Couche A (5e) — arithmétique EXACTE sur fractions signées (`FractionQ`, `core5e/suitesGeometriques.types.ts`),
 * LOCALE à `suitesGeometriques/` (`prompt5gen155gen16arithmetiqueexacte.md`, correction du prompt de
 * rationalité précédent qui choisissait bien q comme fraction irréductible mais laissait ensuite
 * toute la chaîne de calcul DÉRIVÉE (u1/up/um/Sn/S∞...) passer par `Math.pow`/division flottante —
 * exact pour un dénominateur puissance de 2, mais PAS pour un dénominateur 3 (1/3, 2/3 : non
 * représentables exactement en binaire) ni au-delà d'un petit nombre de multiplications composées
 * (le dénominateur croît en `den^exposant`, largement hors de portée d'une reconstruction par
 * recherche bornée). Toute valeur DÉRIVÉE de q transite désormais par ce module de bout en bout —
 * jamais de conversion en flottant à aucune étape intermédiaire, y compris pour q entier (pool
 * `Q_ENTIER_POOL`, famille B) : même mécanique partout, aucune branche "heureusement déjà exacte sous
 * flottant" à justifier au cas par cas.
 *
 * Réutilisée telle quelle par `convergenceSuites/geometrique.ts` (5gen16, Couche A ↔ Couche A, même
 * chantier, CLAUDE.md) pour son seul paramètre `q` (jamais exponentié dans ce générateur, mais
 * affiché — même besoin d'affichage en fraction irréductible).
 *
 * Seul point de sortie légitime vers un flottant : `fractionQVersNombre`, réservé à la comparaison
 * tolérante avec une saisie libre de l'élève (`diagnostiquerNombre`/`evaluerExpressionGenerale`,
 * intrinsèquement décimale) — jamais réutilisé pour dériver ou afficher une AUTRE valeur.
 */
import type { FractionQ } from "../../core5e/suitesGeometriques.types";

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Construit une fraction réduite depuis 2 entiers quelconques (dénominateur non nul) — le signe est
 * toujours ramené sur le numérateur, le dénominateur reste strictement positif. */
export function fractionQ(num: number, den: number): FractionQ {
  if (den === 0) throw new Error("fractionQ : dénominateur nul");
  const signe = den < 0 ? -1 : 1;
  const n = signe * num;
  const d = signe * den;
  const g = pgcd(n, d);
  return { num: n / g, den: d / g };
}

export function entierVersFractionQ(n: number): FractionQ {
  return { num: n, den: 1 };
}

export function multiplierFractionQ(a: FractionQ, b: FractionQ): FractionQ {
  return fractionQ(a.num * b.num, a.den * b.den);
}

export function diviserFractionQ(a: FractionQ, b: FractionQ): FractionQ {
  if (b.num === 0) throw new Error("diviserFractionQ : division par zéro");
  return fractionQ(a.num * b.den, a.den * b.num);
}

export function additionnerFractionQ(a: FractionQ, b: FractionQ): FractionQ {
  return fractionQ(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function soustraireFractionQ(a: FractionQ, b: FractionQ): FractionQ {
  return fractionQ(a.num * b.den - b.num * a.den, a.den * b.den);
}

export function opposeFractionQ(a: FractionQ): FractionQ {
  return { num: -a.num, den: a.den };
}

/** `a^exposant`, exposant ENTIER (positif, négatif ou nul) — jamais une racine. `a` non nul si
 * `exposant<0` (réciproque). */
export function puissanceFractionQ(a: FractionQ, exposant: number): FractionQ {
  if (exposant === 0) return { num: 1, den: 1 };
  if (exposant < 0) return puissanceFractionQ(diviserFractionQ({ num: 1, den: 1 }, a), -exposant);
  let resultat: FractionQ = { num: 1, den: 1 };
  for (let i = 0; i < exposant; i++) resultat = multiplierFractionQ(resultat, a);
  return resultat;
}

export function estEntiereFractionQ(a: FractionQ): boolean {
  return a.den === 1;
}

/** Égalité EXACTE (jamais tolérante) — les 2 fractions sont supposées déjà réduites (toute valeur
 * produite par ce module l'est systématiquement), une simple égalité structurelle suffit donc. */
export function egaliteFractionQ(a: FractionQ, b: FractionQ): boolean {
  return a.num === b.num && a.den === b.den;
}

/** SEUL point de sortie vers un flottant — voir en-tête de fichier. */
export function fractionQVersNombre(a: FractionQ): number {
  return a.num / a.den;
}

// ============================================================================
// Formules de la suite géométrique un=u1*q^(n-1), version EXACTE (fractions) — miroir de
// `generateurs5e/suitesGeometriques/parametres.ts`, dont la version FLOTTANTE reste inchangée et
// continue de servir 5gen17 (`generateurs5e/suitesClassiques/{echiquier,carresEmboites,trianglesZigzag}.ts`
// — u1/q PARFOIS irrationnels dans ce générateur, ex. `h1=√3/2`, donc structurellement incompatibles
// avec une fraction exacte). Ces 2 modules restent volontairement DISTINCTS, jamais fusionnés ni l'un
// dérivé de l'autre — même principe que les autres duplications déjà établies sur ce chantier
// (CLAUDE.md : "chaque générateur garde sa propre implémentation").
// ============================================================================

export function termeGeometriqueQ(u1: FractionQ, q: FractionQ, n: number): FractionQ {
  return multiplierFractionQ(u1, puissanceFractionQ(q, n - 1));
}

export function sommeGeometriqueFinieQ(u1: FractionQ, q: FractionQ, n: number): FractionQ {
  if (q.num === q.den) return multiplierFractionQ(entierVersFractionQ(n), u1); // q=1
  const unMoinsQn = soustraireFractionQ(entierVersFractionQ(1), puissanceFractionQ(q, n));
  const unMoinsQ = soustraireFractionQ(entierVersFractionQ(1), q);
  return multiplierFractionQ(u1, diviserFractionQ(unMoinsQn, unMoinsQ));
}

/** Comparaison de magnitude EXACTE (produits croisés d'entiers, `|num|<den` une fois `den>0`),
 * jamais une conversion en flottant. */
export function sommeInfinieExisteQ(q: FractionQ): boolean {
  return Math.abs(q.num) < q.den;
}

export function sommeInfinieQ(u1: FractionQ, q: FractionQ): FractionQ | null {
  if (!sommeInfinieExisteQ(q)) return null;
  return diviserFractionQ(u1, soustraireFractionQ(entierVersFractionQ(1), q));
}
