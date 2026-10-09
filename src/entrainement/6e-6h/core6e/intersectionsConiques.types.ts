import type { Point } from "./identificationConiques.types";

/**
 * Couche core (6e) — contrat pur pour `6gen61` ("Intersections : droite-conique et conique-conique"),
 * chapitre "Les coniques" (suite de `6gen58`/`6gen59`, voir `docs/historique-6e.md`). Réutilise
 * `Point` de `core6e/identificationConiques.types.ts` (fondation du chapitre, CLAUDE.md) pour tout
 * point à coordonnées ENTIÈRES (sommet/foyer affichés dans le bloc données famille A) ; tout point
 * pouvant être FRACTIONNAIRE (résultat d'une construction géométrique inverse — médiane/hauteur,
 * ou point d'intersection lui-même) utilise `PointFrac` ci-dessous à la place — jamais de décimal
 * pour une valeur générée par la plateforme (CLAUDE.md).
 *
 * ============================================================================
 * Famille A — fonction réutilisable pour `6gen63` (à construire après ce générateur) :
 * `generateurs6e/intersectionsConiques/familleA.ts` exporte `resoudreIntersectionDroiteConique(
 * conique: ConiqueGenerale, droite: DroiteAffine): ResultatIntersectionDroiteConique` — logique
 * "substituer la droite dans la conique, résoudre le second degré, interpréter le discriminant"
 * TOTALEMENT indépendante de l'UI/session, à réutiliser telle quelle (voir en-tête de ce fichier).
 * ============================================================================
 */

/** Fraction exacte réduite — `den` toujours strictement positif. Jamais de décimal (CLAUDE.md) :
 * toute quantité générée par ce module qui n'est pas un entier passe par ce type. */
export interface Frac {
  n: number;
  d: number;
}

export interface PointFrac {
  x: Frac;
  y: Frac;
}

/** Conique centrée à l'origine, TOUJOURS sous la forme `p·x² + q·y² = n` (p,q,n entiers) — couvre
 * ellipse (p,q>0), hyperbole (p,q de signes opposés), cercle (p=q=1). Restriction délibérée à une
 * conique centrée à l'origine (jamais de terme linéaire x/y) : simplifie la construction "à
 * l'envers" garantissant des points d'intersection rationnels exacts (voir en-tête
 * `generateurs6e/intersectionsConiques/familleA.ts`) — cohérent avec le sous-type "même axe" de
 * `6gen59` déjà centré à l'origine, seul réutilisé ici depuis ce générateur. */
export interface ConiqueGenerale {
  p: number;
  q: number;
  n: number;
}

/** Droite `y = m·x + c` — jamais de droite verticale dans ce générateur (restriction documentée,
 * voir en-tête `familleA.ts` : chaque sous-type de construction de droite est bâti pour l'éviter
 * par construction). */
export interface DroiteAffine {
  m: Frac;
  c: Frac;
}

export type SousTypeDroiteA = "deuxPoints" | "mediatrice" | "hauteur";

export interface DonneesDeuxPoints {
  sousType: "deuxPoints";
  A: PointFrac;
  B: PointFrac;
}

/** Médiatrice du segment [A;B] — PIÈGE CENTRAL famille A (voir mission) : le segment de référence
 * pour la perpendicularité est [A;B] lui-même, jamais un autre segment de la figure. */
export interface DonneesMediatrice {
  sousType: "mediatrice";
  A: PointFrac;
  B: PointFrac;
}

/** Hauteur du triangle ABC issue de `sommet`, perpendiculaire au côté OPPOSÉ — PIÈGE CENTRAL
 * (voir mission) : le côté de référence pour la perpendicularité est le côté opposé au sommet
 * indiqué, jamais un côté adjacent. */
export interface DonneesHauteur {
  sousType: "hauteur";
  A: PointFrac;
  B: PointFrac;
  C: PointFrac;
  sommet: "A" | "B" | "C";
}

export type DonneesLigneA = DonneesDeuxPoints | DonneesMediatrice | DonneesHauteur;

/** Réutilisation de `6gen59` (familleA "même axe") quand la conique n'est PAS donnée directement —
 * champs strictement nécessaires à l'écran 1 (établir l'équation depuis a,c → nature → b² →
 * équation), voir `generateurs6e/intersectionsConiques/familleA.ts`. */
export interface CaracteristiquesConiqueA {
  a: number;
  c: number;
  bCarre: number;
  natureCible: "ellipse" | "hyperbole";
  axe: "horizontal" | "vertical";
  sommetS: Point;
  foyerF: Point;
}

export interface ExerciceIntersectionsConiquesA {
  famille: "A";
  /** `true` : la conique est donnée directement (écran 1 SAUTÉ, voir mission) ; `false` : établie
   * depuis ses caractéristiques (écran 1 présent, réutilise `CaracteristiquesConiqueA`). */
  coniqueDirecte: boolean;
  caracteristiques?: CaracteristiquesConiqueA;
  natureConique: "ellipse" | "hyperbole" | "cercle";
  axe?: "horizontal" | "vertical";
  /** Pour affichage direct (cercle, ou ellipse/hyperbole en mode `coniqueDirecte`) : demi-axes ou
   * rayon — TOUJOURS cohérents avec `conique` ci-dessous. */
  a?: number;
  bCarre?: number;
  rayon?: number;
  /** Forme `p·x²+q·y²=n` déjà résolue — réponse ATTENDUE de l'écran 1 (ou donnée directement dans
   * le bloc données si `coniqueDirecte`). */
  conique: ConiqueGenerale;
  sousTypeDroite: SousTypeDroiteA;
  donneesLigne: DonneesLigneA;
  /** Réponse ATTENDUE de l'écran 2. */
  droite: DroiteAffine;
  nombreSolutions: 0 | 1 | 2;
  /** Réponse ATTENDUE de l'écran 3 (valeur canonique, voir `familleA.ts`). */
  discriminant: number;
  /** Réponse ATTENDUE de l'écran 4 — 0, 1, ou 2 points. */
  points: PointFrac[];
}

/**
 * Famille B — C1 (parabole `y=x²+b1x+c1`) et C2 (`A2x²+B2y²+D2x+E2y+F2=0`) construites À L'ENVERS
 * depuis un cercle cible (`centre`,`rayon`) et des coefficients λ,μ simples, garantissant que
 * `λC1+μC2=0` élimine le terme croisé et égalise les coefficients de x²/y² (voir en-tête
 * `generateurs6e/intersectionsConiques/familleB.ts` pour la dérivation complète).
 */
export interface ExerciceIntersectionsConiquesB {
  famille: "B";
  b1: number;
  c1: number;
  A2: number;
  B2: number;
  D2: number;
  E2: number;
  F2: number;
  /** Une solution valide (λ,μ) — n'importe quel multiple non nul est également accepté à l'écran 1
   * (voir `moteur6e/verificationIntersectionsConiques.ts`, la vérification teste la RELATION, pas
   * l'égalité à cette paire précise). */
  lambda: number;
  mu: number;
  /** Coefficient commun de x²/y² dans `λC1+μC2` (=B2 par construction, voir dérivation). */
  K: number;
  /** Équation brute du cercle après substitution de λ,μ : `K·x²+K·y²+coeffX·x+coeffY·y+constanteBrute=0`
   * — réponse ATTENDUE de l'écran 2. */
  coeffX: number;
  coeffY: number;
  constanteBrute: number;
  /** Centre et rayon — réponse ATTENDUE de l'écran 3 (cercle cible, entiers par construction). */
  centre: Point;
  rayon: number;
}

export type ExerciceIntersectionsConiques = ExerciceIntersectionsConiquesA | ExerciceIntersectionsConiquesB;
export type FamilleIntersectionsConiques = ExerciceIntersectionsConiques["famille"];
