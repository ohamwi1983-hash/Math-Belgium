/**
 * Couche A — moteur numérique PARTAGÉ par les 5 familles de "Problèmes d'optimisation" (gen55) —
 * math générique, aucune connaissance narrative (jamais de contexte, jamais de famille). Module
 * FRÈRE (jamais importé depuis `src/moteur/`), même principe que `generateurs/triangle/resoudreTriangle.ts`
 * partagé par les générateurs "triangle" du chapitre 3.
 *
 * `optimumSurDomaine` encode un fait mathématique général, indépendant du sens (max/min) : quand
 * le sommet d'une parabole est hors d'un intervalle, la fonction y est STRICTEMENT monotone (le
 * sommet est le seul extremum), donc l'optimum sur cet intervalle est TOUJOURS atteint à la borne
 * la plus proche du sommet — que la parabole soit concave vers le bas (maximum, familles
 * `aireEnclos`/`revenuPrix`/`trajectoire`/`archePont`) ou vers le haut (minimum, `coutProduction`).
 * Une seule primitive suffit donc pour les 5 familles, jamais une branche par `sens`.
 */
import type { CoefficientsQuadratiques, DomaineOptimisation, PointOptimisation } from "../../core/optimisation.types";
import { randomInt } from "./aleatoire";

export function evaluerQuadratique(fonction: CoefficientsQuadratiques, x: number): number {
  return fonction.a * x * x + fonction.b * x + fonction.c;
}

export function sommetDansIntervalle(sommetX: number, domaine: DomaineOptimisation): boolean {
  return sommetX >= domaine.inf && sommetX <= domaine.sup;
}

/** Le VRAI optimum de la grandeur sur le domaine — le sommet lui-même si `sommetDansDomaine`,
 * sinon la borne du domaine la plus proche du sommet (voir en-tête de fichier). */
export function optimumSurDomaine(
  fonction: CoefficientsQuadratiques,
  domaine: DomaineOptimisation,
  sommet: PointOptimisation,
  sommetDansDomaine: boolean,
): PointOptimisation {
  if (sommetDansDomaine) return sommet;
  const borneRetenue = domaine.sup < sommet.x ? domaine.sup : domaine.inf;
  return { x: borneRetenue, y: evaluerQuadratique(fonction, borneRetenue) };
}

const RATIO_DANS_DOMAINE = 0.75;

/**
 * Génère un domaine `[inf,sup]` (toujours entier) autour de `xS`, avec la contrainte de génération
 * confirmée par `promptimplementationgen55.md` : 75 % des tirages placent le sommet DANS le
 * domaine (marge aléatoire de chaque côté, dans `[margeMin,margeMax]`), 25 % le placent HORS du
 * domaine (domaine entièrement à gauche ou à droite, tiré 50/50) — jamais un domaine dégénéré
 * (`inf<sup` toujours strict) ni sous `xMinPossible`. **Invariant à la charge de l'appelant** :
 * chaque famille doit choisir `xS` avec une marge d'au moins `margeMax` par rapport à
 * `xMinPossible` (`xS - xMinPossible > margeMax`), faute de quoi le clamp sur `xMinPossible`
 * pourrait produire un domaine hors-cas mal formé — vérifié empiriquement par tirage massif dans
 * `optimum.test.ts` et dans le test de chaque famille consommatrice, jamais supposé sans preuve.
 */
export function genererDomaine(
  xS: number,
  xMinPossible: number,
  margeMin: number,
  margeMax: number,
): { domaine: DomaineOptimisation; sommetDansDomaine: boolean } {
  if (Math.random() < RATIO_DANS_DOMAINE) {
    const margeGauche = randomInt(margeMin, margeMax);
    const margeDroite = randomInt(margeMin, margeMax);
    return {
      domaine: { inf: Math.max(xMinPossible, xS - margeGauche), sup: xS + margeDroite },
      sommetDansDomaine: true,
    };
  }

  const ecart = randomInt(margeMin, margeMax);
  const largeur = randomInt(margeMin, margeMax);
  if (Math.random() < 0.5) {
    const sup = xS - ecart;
    return { domaine: { inf: Math.max(xMinPossible, sup - largeur), sup }, sommetDansDomaine: false };
  }
  const inf = xS + ecart;
  return { domaine: { inf, sup: inf + largeur }, sommetDansDomaine: false };
}
