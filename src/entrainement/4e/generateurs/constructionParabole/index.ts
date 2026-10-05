/**
 * Couche A — "Construction graphique de la parabole". Génère uniquement `foyer` (repère LOCAL,
 * directrice toujours `y=0` par convention — voir `core/constructionParabole.types.ts`) et `theta`
 * (angle de rendu uniquement).
 *
 * Choix de `foyer.y` — jamais un triplet pythagoricien (contrairement à l'ancien générateur, qui en
 * avait besoin uniquement parce que la directrice était oblique DANS LE SYSTÈME DE COORDONNÉES DE
 * VÉRIFICATION lui-même) : ici la distance foyer-directrice est simplement `foyer.y`, un entier
 * trivial. La "propreté" des rayons atteignables (`promptgen53remplacement.md`, "Contrainte de
 * génération") découle directement du choix de `foyer.y` parmi `FOYER_Y_CANDIDATS` : pour
 * `foyer.y=2h`, l'intersection cercle-droite à l'itération de rayon `r` a pour abscisse
 * `±√(foyer.y·(2r-foyer.y))` (voir `moteur/verificationConstructionParabole.ts`) — en posant
 * `2r-foyer.y = 2h·k²`, cette quantité vaut `(2hk)²`, un carré parfait, pour TOUT entier `k≥1`, donc
 * pour la famille infinie `r = h·(1+k²)` (`k=1,2,3,...`), chacune strictement supérieure à
 * `rMinimal=h`. Les 2 candidats retenus (`foyer.y∈{2,4}`) donnent chacun au moins 3 valeurs propres
 * dans une plage d'affichage raisonnable (r=2,5,10 pour foyer.y=2 ; r=4,10,20 pour foyer.y=4) —
 * verrouillé par test de propriété (recherche brute indépendante de cette dérivation) plutôt que
 * supposé correct.
 *
 * Choix de `theta` — tiré uniformément sur [0,2π[, ré-échantillonné (rejet) tant qu'il tombe dans un
 * voisinage de ±15° autour d'un multiple de π/2, pour garantir une obliquité nette de la directrice
 * à l'écran (jamais horizontale ni verticale, contrainte pédagogique explicite du prompt).
 */
import type { ExerciceConstructionParabole } from "../../core/constructionParabole.types";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const FOYER_Y_CANDIDATS = [2, 4];
const BORNE_FOYER_X = 2;
const DEMI_LARGEUR_EXCLUSION_AXE = Math.PI / 12; // 15°

function tirerTheta(): number {
  let theta = 0;
  let valide = false;
  while (!valide) {
    theta = Math.random() * 2 * Math.PI;
    const modulo = ((theta % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
    const distanceAxe = Math.min(modulo, Math.PI / 2 - modulo);
    valide = distanceAxe >= DEMI_LARGEUR_EXCLUSION_AXE;
  }
  return theta;
}

export function construireExercice(foyerY: number, foyerX: number, theta: number): ExerciceConstructionParabole {
  return { foyer: { x: foyerX, y: foyerY }, theta };
}

export function genererExerciceConstructionParabole(): ExerciceConstructionParabole {
  const foyerY = FOYER_Y_CANDIDATS[randomInt(0, FOYER_Y_CANDIDATS.length - 1)]!;
  const foyerX = randomInt(-BORNE_FOYER_X, BORNE_FOYER_X);
  return construireExercice(foyerY, foyerX, tirerTheta());
}
