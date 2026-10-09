import type { Point } from "../../core6e/identificationConiques.types";
import type { ConiqueGenerale, DroiteAffine, Frac, PointFrac } from "../../core6e/intersectionsConiques.types";
import type { ExerciceProprietesOptiquesConiques, NatureOptique } from "../../core6e/proprietesOptiquesConiques.types";
import { construireMemeAxe } from "../equationConiqueCaracteristiques/familleA";
import { resoudreIntersectionDroiteConique } from "../intersectionsConiques/familleA";
import { tirerParmi, tirerSigne } from "./aleatoire";
import { fracDiv, fracEntier, fracEquals, fracEstNul, fracMul, fracNeg, fracSub, fracToNumber } from "./fraction";

/**
 * Couche A (6e) — famille UNIQUE de `6gen63` ("Propriétés optiques des coniques"), générateur DE
 * CLÔTURE du chapitre "Les coniques". RÉUTILISE :
 * - `construireMemeAxe` (`equationConiqueCaracteristiques/familleA.ts`, 6gen59) pour tirer a,c,b²
 *   d'une ellipse/hyperbole — axe forcé HORIZONTAL (jamais vertical, voir en-tête
 *   `core6e/proprietesOptiquesConiques.types.ts`).
 * - `resoudreIntersectionDroiteConique` (`intersectionsConiques/familleA.ts`, 6gen61) DEUX FOIS (voir
 *   ci-dessous) — jamais une résolution de second degré réimplémentée localement.
 *
 * ============================================================================
 * PROBLÈME DE CONSTRUCTION — garantir des points d'intersection RATIONNELS EXACTS pour une droite
 * qui doit passer par un point PRÉCIS (le foyer F), contrairement à `6gen61` où la droite est libre
 * de passer par n'importe quel point "sympa" de son choix.
 *
 * La technique de `6gen61` (droite passant par le point du "latus rectum" `(c,b²/a)`, TOUJOURS sur
 * la conique) ne se transpose PAS directement ici : ce point est à l'abscisse `x=c`, exactement
 * celle de F' — une droite par F et ce point donnerait, une fois réfléchie (écran 4, droite par ce
 * même point et F'), une droite VERTICALE dégénérée (x=c), hors du contrat `DroiteAffine` (jamais de
 * droite verticale). Le point `(-c,·)` est écarté pour la même raison symétrique (verticale par
 * rapport à F lui-même).
 *
 * SOLUTION — parenthèse à 2 niveaux, chacun réutilisant `resoudreIntersectionDroiteConique` :
 * 1. Un sommet `S=(±a,0)` est TOUJOURS exactement sur la conique (`p·a²=n` par construction de
 *    `construireMemeAxe`/`formeGeneraleHorizontale`, quelle que soit la nature). Une droite `y=t·
 *    (x∓a)` de pente `t` RATIONNELLE quelconque passant par S a donc, par le MÊME argument de Vieta
 *    que `6gen61` (une racine connue rationnelle ⟹ l'autre est rationnelle, voir preuve dans l'en-tête
 *    de `intersectionsConiques/familleA.ts`), une 2e intersection `Q` avec la conique qui est
 *    EXACTEMENT rationnelle — à une abscisse `x_Q` qui n'est PAS pégée à `±c` (contrairement au
 *    "latus rectum"), donc sans le problème de verticale ci-dessus.
 * 2. La droite F→Q a alors une pente RATIONNELLE (`Q` et `F` ont tous 2 des coordonnées rationnelles
 *    exactes) — c'est le rayon incident cherché. Un second appel à
 *    `resoudreIntersectionDroiteConique` avec CETTE droite retrouve `Q` comme une de ses 2
 *    intersections (garanti, puisque `Q` est PAR CONSTRUCTION sur cette droite et sur la conique) et,
 *    par le même argument de Vieta, une 2e intersection également rationnelle — les 2 points
 *    d'intersection RÉELS du rayon incident avec la conique (réponse de l'écran 2).
 *
 * Tirage par ESSAIS (`essayerConstruction`, jusqu'à `MAX_TENTATIVES`) plutôt qu'une garantie
 * algébrique a priori sur CHAQUE étape : `resoudreIntersectionDroiteConique` peut légitimement lever
 * (droite parallèle à une asymptote) ou renvoyer 1 solution (tangence accidentelle) pour certaines
 * combinaisons (a,c,sommet,pente) — un échec relance simplement un nouveau tirage complet, chaque
 * tentative étant une poignée d'opérations arithmétiques exactes (aucun risque de boucle longue en
 * pratique, confirmé par `familleUnique.test.ts` sur des centaines de tirages).
 *
 * ============================================================================
 * PIÈGE ÉCRAN 3 (sélection du point de réflexion) — le rayon se propage depuis F vers les abscisses
 * CROISSANTES (F a toujours l'abscisse la plus négative de la figure, voir mission : "rayon...
 * faisant un angle α avec l'axe des abscisses", émis dans le sens qui l'amène à traverser la
 * conique). Le point de réflexion RÉEL est celui des 2 intersections dont l'abscisse dépasse celle
 * de F (paramètre `t=x-x_F>0` sur la demi-droite de propagation) — s'il y en a 2 (le rayon "shallow"
 * d'une hyperbole peut traverser les 2 branches, laissant F en dehors du segment reliant les 2
 * points), le PREMIER atteint est celui de plus petit `t`, jamais nécessairement celui numériquement
 * le plus proche de F en valeur absolue : un point "derrière" F (`t<0`, donc écarté) peut très bien
 * être, en distance brute, plus proche de F que le point réellement atteint devant lui — piège vérifié
 * concrètement dans `familleUnique.test.ts` et dans le rapport de fin de tâche (dérivation chiffrée).
 */

const CANDIDATS_MAGNITUDE_T: Frac[] = [
  { n: 1, d: 1 },
  { n: 2, d: 1 },
  { n: 3, d: 1 },
  { n: 1, d: 2 },
  { n: 3, d: 2 },
  { n: 2, d: 3 },
];

function formeGeneraleHorizontale(natureConique: NatureOptique, a: number, bCarre: number): ConiqueGenerale {
  const aCarre = a * a;
  return natureConique === "ellipse" ? { p: bCarre, q: aCarre, n: aCarre * bCarre } : { p: bCarre, q: -aCarre, n: aCarre * bCarre };
}

export interface OverridesFamilleUnique {
  natureConique?: NatureOptique;
  /** Force le signe de la pente `t` de la droite auxiliaire (sommet→Q, étape 1 de la construction,
   * voir en-tête) — influence indirectement (jamais de façon garantie) le signe final de `tanAlpha`
   * affiché à l'écran ; utilisé uniquement pour varier les tirages du catalogue de variantes (voir
   * `index.ts`). */
  signeT?: 1 | -1;
}

function essayerConstruction(overrides: OverridesFamilleUnique): ExerciceProprietesOptiquesConiques | null {
  const natureConique = overrides.natureConique ?? tirerParmi(["ellipse", "hyperbole"] as const);
  const base = construireMemeAxe({ natureCible: natureConique, axe: "horizontal" });
  const { a, c, bCarre } = base;
  const conique = formeGeneraleHorizontale(natureConique, a, bCarre);

  const foyerF: Point = { x: -c, y: 0 };
  const foyerFPrime: Point = { x: c, y: 0 };

  // Étape 1 — droite auxiliaire par un sommet (±a,0), TOUJOURS sur la conique (voir en-tête).
  const signeSommet = tirerSigne();
  const sommet: Frac = fracEntier(signeSommet * a);
  const signeT = overrides.signeT ?? tirerSigne();
  const t: Frac = fracMul(tirerParmi(CANDIDATS_MAGNITUDE_T), fracEntier(signeT));
  const droiteSommet: DroiteAffine = { m: t, c: fracNeg(fracMul(t, sommet)) }; // y=t(x-sommet)

  let resultatSommet;
  try {
    resultatSommet = resoudreIntersectionDroiteConique(conique, droiteSommet);
  } catch {
    return null;
  }
  if (resultatSommet.nombreSolutions !== 2) return null;
  const [s0, s1] = resultatSommet.points;
  const Q = fracEquals(s0.x, sommet) ? s1 : s0;
  if (fracEquals(Q.x, sommet)) return null; // dégénéré (tangence confondue) — ne devrait pas arriver

  // Étape 2 — droite F→Q, garantie rationnelle, réponse ATTENDUE (rayon incident) de l'écran 2.
  const denomM = fracSub(Q.x, fracEntier(foyerF.x)); // Q.x-(-c)=Q.x+c
  if (fracEstNul(denomM)) return null; // Q directement au-dessus/dessous de F — droite verticale
  const m = fracDiv(Q.y, denomM);
  const droiteIncidente: DroiteAffine = { m, c: fracMul(m, fracEntier(c)) };

  let resultatFinal;
  try {
    resultatFinal = resoudreIntersectionDroiteConique(conique, droiteIncidente);
  } catch {
    return null;
  }
  if (resultatFinal.nombreSolutions !== 2) return null;
  const pointsIntersection = resultatFinal.points;

  // Sélection du point de réflexion — voir piège en en-tête.
  const t0 = fracToNumber(pointsIntersection[0].x) - foyerF.x;
  const t1 = fracToNumber(pointsIntersection[1].x) - foyerF.x;
  const candidats: { index: 0 | 1; t: number }[] = [];
  if (t0 > 1e-9) candidats.push({ index: 0, t: t0 });
  if (t1 > 1e-9) candidats.push({ index: 1, t: t1 });
  if (candidats.length === 0) return null; // ne devrait jamais arriver (foyer intérieur/proche branche)
  candidats.sort((x, y) => x.t - y.t);
  const indexReflexion = candidats[0]!.index;
  const pointReflexion = pointsIntersection[indexReflexion];

  // Garde — réflexion verticale (point de réflexion à la même abscisse que F') exclue, cas dégénéré
  // hors du contrat `DroiteAffine` (jamais de droite verticale).
  if (fracEquals(pointReflexion.x, fracEntier(foyerFPrime.x))) return null;

  // Écran 4 — propriété focale : droite (pointReflexion ; F'), jamais une tangente.
  const dx = fracSub(fracEntier(foyerFPrime.x), pointReflexion.x);
  const dy = fracSub(fracEntier(foyerFPrime.y), pointReflexion.y);
  const mReflechie = fracDiv(dy, dx);
  const cReflechie = fracSub(fracEntier(foyerFPrime.y), fracMul(mReflechie, fracEntier(foyerFPrime.x)));
  const droiteReflechie: DroiteAffine = { m: mReflechie, c: cReflechie };

  return { natureConique, a, c, bCarre, conique, foyerF, foyerFPrime, droiteIncidente, pointsIntersection, indexReflexion, droiteReflechie };
}

const MAX_TENTATIVES = 300;

export function construireExercice(overrides: OverridesFamilleUnique = {}): ExerciceProprietesOptiquesConiques {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const resultat = essayerConstruction(overrides);
    if (resultat) return resultat;
  }
  throw new Error("construireExercice : échec après de nombreuses tentatives — incohérence de génération (voir en-tête familleUnique.ts)");
}

// Re-export pour usage direct par `points` typé strictement `[PointFrac, PointFrac]` ailleurs
// (session.integration.test.ts notamment).
export type { PointFrac };
