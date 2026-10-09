import type { AngleRemarquable } from "../../core6e/formeTrigonometrique.types";
import type { ValeurExacte } from "../../core6e/cyclometrique.types";
import type { ExerciceComplexesDCoef, ExerciceComplexesDModules, ExerciceComplexesDRatio, ExerciceComplexesDReelles } from "../../core6e/complexesAvances.types";
import { angleDepuisFraction } from "../formeTrigonometrique/angles";
import { combinerModuleAngle } from "../formeTrigonometrique/familleA";
import { pointRemarquablePour } from "../racinesNiemes/fermeture";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille D ("Équations avec paramètre(s)") de `6gen42`, chapitre 7
 * "Nombres complexes" (générateur de clôture). 4 sous-types, UNE variante par sous-type retenue
 * (latitude explicitement accordée par la mission — voir en-tête de chaque section ci-dessous pour
 * la construction "depuis la cible" propre à chaque sous-type).
 *
 * ============================================================================
 * **Sous-type "ratio racine n-ième" — `(z+c)ⁿ=k·zⁿ`, `k=mⁿ` (angle DE DÉPART TOUJOURS 0)**
 * ============================================================================
 * `((z+c)/z)ⁿ=k` — pose `u=(z+c)/z`, `uⁿ=k`. Réutilise EXACTEMENT la technique ζ_k de 6gen39 famille
 * C (`racinesNiemes/familleC.ts` — `zetaDindice`/`racineDindice`, PRIVÉES à ce fichier, répliquées
 * ICI à la main plutôt qu'importées, convention CLAUDE.md "un motif nouveau se réplique à la main
 * plutôt que d'être extrait"), avec un choix délibéré : `w` (le "point de départ" avant application
 * des racines de l'unité) est TOUJOURS un réel positif pur `m` (angle 0, TOUJOURS fermé pour tout
 * n — trivialement, tous les `ζ_k` restent dans la banque pour `n∈{3,4,6}`, voir
 * `racinesNiemes/fermeture.ts`). Les `n` solutions `u_k=m·ζ_k` restent donc TOUTES typables en a+bi
 * exact (radicaux simples). `k=mⁿ` (entier, toujours "propre" pour l'affichage).
 *
 * **Pourquoi la ré-substitution `z=c/(u-1)` n'est PAS demandée pour LES `n` RACINES** : pour `u_k`
 * non réel (`k≥1`), `u_k-1` est un complexe quelconque (radical), et `c/(u_k-1)` implique une
 * division par un radical — un résultat généralement IRRATIONNEL et non factorisable en un radical
 * SIMPLE unique (contrairement à tout le reste du chapitre, construit pour rester dans un radical
 * simple). Seule la branche `u_0=m` (RÉELLE) donne un `z` RATIONNEL exact — écran 2 se limite donc à
 * cette seule branche, un choix de scope documenté (voir mission), le reste du travail
 * (extraction des `n` racines de l'unité) restant, lui, pleinement exercé à l'écran 1.
 *
 * ============================================================================
 * **Sous-type "solutions réelles imposées" — construction "depuis la cible" complète**
 * ============================================================================
 * Cibles choisies EN PREMIER : `x1,x2` (2 solutions réelles voulues), `m0` (valeur de `m` voulue),
 * `k` (constante ∉{x1,x2}, arbitraire). `A=x1+x2`, `P=x1x2`. Équation retenue :
 * ```
 * z² + [-A + (m0-m)i] z + [P + k(m-m0)i] = 0
 * ```
 * Substitution `z=x` (réel) :
 * ```
 * Réel(x,m) = x² - Ax + P                          (INDÉPENDANT de m — racines FIXES {x1,x2})
 * Imag(x,m) = (m0-m)x + k(m-m0) = (m0-m)(x-k)
 * ```
 * `Imag(x,m)=0` ⟺ `m=m0` (auquel cas Imag≡0 pour TOUT x, les 2 racines réelles du terme Réel
 * deviennent solutions) OU `x=k` (mais `k∉{x1,x2}`, donc cette branche ne rejoint JAMAIS le terme
 * Réel) — `m=m0` est donc la SEULE valeur de `m` donnant des solutions réelles à l'équation complète
 * (et en donne alors exactement 2 : `x1,x2`). Preuve vérifiée numériquement dans `familleD.test.ts`.
 *
 * ============================================================================
 * **Sous-type "coefficients depuis une racine donnée" — identité somme/produit classique**
 * ============================================================================
 * `z²+αz+β=0` (α,β réels inconnus), racine donnée `z0=p+qi` (q≠0). Substitution + séparation :
 * ```
 * Réel : p·α + β + (p²-q²) = 0
 * Imag : q·α + 2pq = 0  ⟹  α=-2p, puis β=q²-p²-αp=p²+q²
 * ```
 * (résultat = identité "somme/produit" standard : l'autre racine du polynôme réel est `z̄0=p-qi`,
 * somme=2p=-α, produit=p²+q²=β).
 *
 * ============================================================================
 * **Sous-type "modules simultanés" — variante retenue : `|z|=|1/z|` PUIS `|z|=|z-d|`**
 * ============================================================================
 * `|z|=|1/z|` ⟺ `|z|²=1` ⟺ `|z|=1` (écran 1, toujours 1 — fait établi, pas un vrai tirage). `d`
 * construit depuis un TRIPLET PYTHAGORICIEN `(p,q,r)` (`p²+q²=r²`) : `d=2p/r`. La perpendiculaire
 * `|z|=|z-d|` est `Re(z)=d/2=p/r` ; combinée à `x²+y²=1` : `y²=1-(p/r)²=(r²-p²)/r²=q²/r²` (car
 * `p²+q²=r²`) `⟹ y=±q/r` — RATIONNEL, jamais irrationnel (contrairement à un choix de `d`
 * arbitraire, qui donnerait générique­ment `y` irrationnel — typiquement injouable dans
 * `moteur6e/expressionComplexe.ts`, sans `sqrt`). 2 solutions : `z=p/r±iq/r`.
 */

// ============================================================================
// Sous-type "ratio racine n-ième".
// ============================================================================

const N_POSSIBLES = [3, 4, 6] as const;
const M_POSSIBLES = [2, 3] as const;

export interface RacineUniteExacte {
  angle: AngleRemarquable;
  re: ValeurExacte;
  im: ValeurExacte;
}

function angleDindice(k: number, n: number): AngleRemarquable {
  return angleDepuisFraction(2 * k, n);
}

/** Les `n` solutions exactes `u_k=m·ζ_k` de `uⁿ=mⁿ` (`ζ_k` = racine n-ième de l'unité d'indice `k`,
 * angle `2kπ/n` — TOUJOURS dans la banque des 16 remarquables pour `n∈{3,4,6}`, voir en-tête de
 * fichier) — réutilisé par `ui6e/formatComplexesAvances.ts` pour l'affichage et par
 * `moteur6e/verificationComplexesAvances.ts` pour la cible de l'écran 1. */
export function racinesRatio(n: number, m: number): RacineUniteExacte[] {
  const racines: RacineUniteExacte[] = [];
  for (let k = 0; k < n; k++) {
    const angle = angleDindice(k, n);
    const point = pointRemarquablePour(angle);
    racines.push({ angle, re: combinerModuleAngle(m, point.cos), im: combinerModuleAngle(m, point.sin) });
  }
  return racines;
}

export function construireFamilleDRatio(): ExerciceComplexesDRatio {
  const n = tirerParmi(N_POSSIBLES);
  const m = tirerParmi(M_POSSIBLES);
  const c = tirerEntierNonNul(-4, 4);
  return { famille: "D", sousType: "ratio", n, m, c };
}

// ============================================================================
// Sous-type "solutions réelles imposées".
// ============================================================================

export function construireFamilleDReelles(): ExerciceComplexesDReelles {
  let x1 = tirerEntier(-3, 3);
  let x2 = tirerEntier(-3, 3);
  while (x2 === x1) x2 = tirerEntier(-3, 3);
  const m0 = tirerEntier(1, 4);
  let k = tirerEntier(-5, 5);
  while (k === x1 || k === x2) k = tirerEntier(-5, 5);
  return { famille: "D", sousType: "reelles", x1, x2, m0, k };
}

// ============================================================================
// Sous-type "coefficients depuis une racine donnée".
// ============================================================================

export function construireFamilleDCoef(): ExerciceComplexesDCoef {
  const p = tirerEntier(-3, 3);
  const q = tirerEntierNonNul(-3, 3);
  return { famille: "D", sousType: "coef", p, q };
}

// ============================================================================
// Sous-type "modules simultanés".
// ============================================================================

const TRIPLETS_PYTHAGORICIENS: [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
];

export function construireFamilleDModules(): ExerciceComplexesDModules {
  const [p, q, r] = tirerParmi(TRIPLETS_PYTHAGORICIENS);
  return { famille: "D", sousType: "modules", p, q, r };
}

// ============================================================================
// Dispatcher.
// ============================================================================

export type ExerciceFamilleD = ExerciceComplexesDRatio | ExerciceComplexesDReelles | ExerciceComplexesDCoef | ExerciceComplexesDModules;

const CONSTRUCTEURS_D = [construireFamilleDRatio, construireFamilleDReelles, construireFamilleDCoef, construireFamilleDModules];

export function construireFamilleD(): ExerciceFamilleD {
  return tirerParmi(CONSTRUCTEURS_D)();
}
