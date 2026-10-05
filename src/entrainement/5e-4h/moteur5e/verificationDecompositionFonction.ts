/**
 * Couche B — vérification pour 5gen2 ("Décomposer une fonction composée"). Réutilise directement
 * `evaluerExpressionGenerale` (`src/moteur/expressionGenerale.ts`, 4e — petit évaluateur pur
 * générique à une variable, déjà réutilisé cross-chantier pour `EnsembleReelGuideBuilder`/
 * `parserNombreOuFraction`) : compose les lignes soumises par l'élève DANS L'ORDRE DÉCLARÉ en
 * chaînant les évaluations, et compare le résultat à f(x) évaluée directement — jamais une
 * comparaison à "la" décomposition canonique de l'exercice, uniquement à la reconstruction
 * effective (conformément à la spec).
 */
import type { ExerciceDecompositionFonction } from "../core5e/decompositionFonction.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";

const TOLERANCE_ABSOLUE = 1e-6;
const TOLERANCE_RELATIVE = 1e-6;
const MIN_COMPARAISONS_VALIDES = 15;

/**
 * Plage large (±15, pas 0.25 → 121 points) : une composition impliquant une racine a un domaine
 * restreint à une partie de la droite réelle (ex. sqrt(2x-5) valide seulement pour x≥2.5) — la
 * racine du radicande peut, par construction (`tirerParametresAffine`, |a|≤3, |b|≤9), se trouver
 * jusqu'à ±9 ; il faut assez de marge au-delà pour dépasser `MIN_COMPARAISONS_VALIDES` même dans le
 * pire cas (racine proche du bord, domaine restreint au côté étroit). Deux plages plus étroites
 * ([-3,3] puis [-6,6]) ont chacune produit un faux `not_equivalent` sur des décompositions
 * pourtant correctes, trouvé par le test croisé sur le vrai générateur — élargi jusqu'à ce que 3000
 * tirages réels passent tous sans faux négatif.
 */
function pointsEchantillon(): number[] {
  const pts: number[] = [];
  for (let x = -15; x <= 15; x += 0.25) pts.push(Math.round(x * 4) / 4);
  return pts;
}

/** Tolérance absolue+relative combinée — nécessaire dès qu'une composition enchaîne plusieurs
 * puissances 4 (magnitudes énormes, où une tolérance purement absolue de 1e-6 échouerait sur du
 * simple bruit d'arrondi flottant, sans rapport avec une vraie non-équivalence). */
function proches(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOLERANCE_ABSOLUE + TOLERANCE_RELATIVE * Math.max(Math.abs(a), Math.abs(b));
}

/**
 * Compose `lignes` (dans l'ordre déclaré, la première appliquée en premier — g avant h avant i…)
 * en x0 — ne s'arrête JAMAIS prématurément sur un résultat intermédiaire non fini (NaN/±Infinity) :
 * laisse l'arithmétique flottante native se propager d'un bout à l'autre de la chaîne, exactement
 * comme `evaluerExpressionGenerale(exercice.fFormule, x)` le fait pour l'expression imbriquée en
 * un seul passage (même convention déjà documentée dans expressionGenerale.ts : NaN/Infinity
 * filtrés seulement à la fin via `Number.isFinite`, jamais traités comme un arrêt anticipé —
 * bug trouvé par le test croisé sur le vrai générateur : `1/(1/x)` évalué en 2 étapes coupait à
 * tort au passage par ±Infinity à x=0, alors que l'expression imbriquée équivalente y renvoie une
 * valeur finie par arithmétique IEEE754 native).
 */
function composerEnPoint(lignes: string[], x0: number): number {
  let valeur = x0;
  for (const ligne of lignes) {
    valeur = evaluerExpressionGenerale(ligne, valeur);
  }
  return valeur;
}

export function diagnostiquerDecomposition(exercice: ExerciceDecompositionFonction, lignes: string[]): StatutVerification {
  if (lignes.length === 0 || lignes.some((l) => l.trim() === "")) return "parse_error";

  let comparaisonsValides = 0;
  try {
    for (const x0 of pointsEchantillon()) {
      const composeBrut = composerEnPoint(lignes, x0);
      const compose = Number.isFinite(composeBrut) ? composeBrut : null;
      const attenduBrut = evaluerExpressionGenerale(exercice.fFormule, x0);
      const attendu = Number.isFinite(attenduBrut) ? attenduBrut : null;

      if (compose === null && attendu === null) continue; // les deux non définis ici, rien à comparer
      if ((compose === null) !== (attendu === null)) return "not_equivalent"; // domaine différent
      if (!proches(compose as number, attendu as number)) return "not_equivalent";
      comparaisonsValides++;
    }
  } catch {
    return "parse_error";
  }

  return comparaisonsValides >= MIN_COMPARAISONS_VALIDES ? "correct" : "not_equivalent";
}

export function verifierDecomposition(exercice: ExerciceDecompositionFonction, lignes: string[]): boolean {
  return diagnostiquerDecomposition(exercice, lignes) === "correct";
}
