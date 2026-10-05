/**
 * Couche présentation (5e) — pas de grille ADAPTATIF AU ZOOM, en arithmétique EXACTE (`RationnelPi`,
 * jamais un flottant), pour l'axe X (radians) et l'axe Y (amplitude) de 5gen9
 * (`components5e/SinusoideGraph.tsx`).
 *
 * Réimplémente `calculerPasGrille` (`ui/mafsTransformation.ts`, utilisée par `GrilleAdaptative` sur
 * tous les autres graphes Mafs de la plateforme) avec le MÊME algorithme (mantisses 1/2/5×10ⁿ, plus
 * {1,2,2,5,10/3,5} dans la décade unitaire pour un pas d'1/2/1/3/1/4 d'unité) — mais sur une UNITÉ
 * ATOMIQUE EXACTE (`RationnelPi`, ex. T/4 pour l'axe X — voir `quartPeriode`, `sinusoideGraph.ts`)
 * plutôt que l'unité 1 implicite de la version décimale. Nécessaire ici, contrairement à
 * `GrilleAdaptative` : l'axe X de 5gen9 est mesuré en RADIANS (souvent des multiples de π), et
 * l'utilisateur demande explicitement que le pas de grille reste un multiple EXACT de cette unité
 * (π, π/3, π/5... ou 1, 1/3, 1/5... selon ce dont T est lui-même multiple) — jamais une décimale
 * approchée (`0.333333...`), qui perdrait la nature exacte de la fraction dès qu'un pas comme 1/3
 * ou π/3 est choisi. `valeurNumerique(résultat)` reste néanmoins un flottant ordinaire, seul
 * nécessaire pour piloter `Coordinates.Cartesian` (qui ne connaît que des nombres) — c'est
 * l'AFFICHAGE (légende, `formatRationnelPiTexte`) qui a besoin de la représentation exacte,
 * jamais le rendu du quadrillage lui-même.
 */
import {
  multiplierRationnelPi,
  reduireRationnelPi,
  valeurNumerique,
  type RationnelPi,
} from "../generateurs5e/parametresSinusoide/rationnelPi";

const CIBLE_NOMBRE_LIGNES = 10;

/** Mantisses candidates (numérateur, dénominateur), triées croissant — décade "normale". */
const MANTISSES: [number, number][] = [
  [1, 1],
  [2, 1],
  [5, 1],
];

/** Décade UNITAIRE (exposant=-1, pas entre 0,1 et 1 unité) élargie à 1/2, 1/3 et 1/4 d'unité — même
 * justification que `MANTISSES_GRILLE_DECADE_UNITAIRE` (`ui/mafsTransformation.ts`) : sans cet
 * élargissement, `Coordinates.Cartesian` dessinerait une ligne PAR unité entière dès que le viewBox
 * dépasse une dizaine d'unités, saturant l'axe. */
const MANTISSES_DECADE_UNITAIRE: [number, number][] = [
  [1, 1],
  [2, 1],
  [5, 2],
  [10, 3],
  [5, 1],
];
const EXPOSANT_DECADE_UNITAIRE = -1;

function multiplicateurExact(mantisseNumerateur: number, mantisseDenominateur: number, exposant: number): RationnelPi {
  const puissanceDix = Math.pow(10, Math.abs(exposant));
  if (exposant >= 0) {
    return reduireRationnelPi({ numerateur: mantisseNumerateur * puissanceDix, denominateur: mantisseDenominateur, degrePi: 0 });
  }
  return reduireRationnelPi({ numerateur: mantisseNumerateur, denominateur: mantisseDenominateur * puissanceDix, degrePi: 0 });
}

/**
 * Pas de grille adaptatif — cible `cibleNombreLignes` lignes visibles sur `spanEnDonnees` (même
 * unité que `uniteAtomique`, ex. radians pour l'axe X), toujours un multiple 1/2/5×10ⁿ EXACT de
 * `uniteAtomique` (jamais une décimale approchée). `uniteAtomique` doit être non nulle (T/4 et
 * `pasAxeY` le sont toujours par construction sur ce générateur).
 */
export function calculerPasAdaptatifRationnelPi(
  spanEnDonnees: number,
  uniteAtomique: RationnelPi,
  cibleNombreLignes: number = CIBLE_NOMBRE_LIGNES,
): RationnelPi {
  const uniteValeur = valeurNumerique(uniteAtomique);
  const brut = spanEnDonnees / uniteValeur / cibleNombreLignes;
  const exposant = Math.floor(Math.log10(brut) + 1e-9);
  const mantisses = exposant === EXPOSANT_DECADE_UNITAIRE ? MANTISSES_DECADE_UNITAIRE : MANTISSES;
  for (const [mantisseNumerateur, mantisseDenominateur] of mantisses) {
    const candidat = multiplicateurExact(mantisseNumerateur, mantisseDenominateur, exposant);
    if (valeurNumerique(candidat) >= brut * (1 - 1e-9)) {
      return multiplierRationnelPi(uniteAtomique, candidat);
    }
  }
  return multiplierRationnelPi(uniteAtomique, multiplicateurExact(10, 1, exposant));
}
