/**
 * Couche A — "Comparaison visuelle de vecteurs sur figure" (chapitre "Calcul vectoriel, deuxième
 * générateur). Tire 2 ou 3 vecteurs de base, puis dérive tous les autres vecteurs affichés par des
 * transformations garanties exactes (translation = mêmes composantes, nouvel ancrage ; multiple
 * scalaire) — jamais un vecteur construit indépendamment, pour que toute relation demandée soit
 * vraie par construction (spec, section "Génération de la figure").
 */
import type {
  ExerciceComparaisonVecteurs,
  GenerateurExerciceComparaisonVecteurs,
  ProprieteComparaison,
  VecteurFigureCompare,
} from "../../core/comparaisonVecteurs.types";
import { randomInt } from "./aleatoire";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const MULTIPLES_NON_TRIVIAUX = [-3, -2, -1, 2, 3];
const PROPRIETES: ProprieteComparaison[] = ["longueur", "direction", "sens"];

function vecteurAleatoire(): { x: number; y: number } {
  let v = { x: 0, y: 0 };
  while (v.x === 0 && v.y === 0) {
    v = { x: randomInt(-4, 4), y: randomInt(-4, 4) };
  }
  return v;
}

function ancrageAleatoire(): { x: number; y: number } {
  return { x: randomInt(-5, 5), y: randomInt(-5, 5) };
}

/** Satisfait `propriete` par rapport à la référence (indexBase 0, coefficientBase 1) ⟺ le
 * vecteur est lui-même issu de la base 0, avec une contrainte de signe/magnitude sur son
 * coefficient effectif selon la propriété testée. */
function satisfaitPropriete(v: VecteurFigureCompare, propriete: ProprieteComparaison): boolean {
  if (v.indexBase !== 0) return false;
  if (propriete === "direction") return true;
  if (propriete === "sens") return v.coefficientBase > 0;
  return Math.abs(v.coefficientBase) === 1;
}

function coefficientForcePour(propriete: ProprieteComparaison): number {
  if (propriete === "longueur") return Math.random() < 0.5 ? 1 : -1;
  if (propriete === "sens") return [1, 2, 3][randomInt(0, 2)];
  return [1, ...MULTIPLES_NON_TRIVIAUX][randomInt(0, MULTIPLES_NON_TRIVIAUX.length)];
}

/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md) — `propriete` (`ProprieteComparaison`, déjà un axe discret réel testé par
 * `satisfaitPropriete`/`coefficientForcePour`) forcée plutôt que tirée aléatoirement.
 */
function construireAvecPropriete(propriete: ProprieteComparaison): ExerciceComparaisonVecteurs {
  const nombreBases = randomInt(2, 3);
  const bases = Array.from({ length: nombreBases }, () => vecteurAleatoire());

  const vecteurs: VecteurFigureCompare[] = bases.map((composantes, i) => ({
    label: ALPHABET[i],
    origine: ancrageAleatoire(),
    composantes,
    indexBase: i,
    coefficientBase: 1,
  }));

  const nombreDerives = randomInt(3, 5);
  for (let i = 0; i < nombreDerives; i++) {
    const indexBase = randomInt(0, nombreBases - 1);
    const estTranslation = Math.random() < 0.5;
    const coefficientBase = estTranslation ? 1 : MULTIPLES_NON_TRIVIAUX[randomInt(0, MULTIPLES_NON_TRIVIAUX.length - 1)];
    const base = bases[indexBase];
    vecteurs.push({
      label: ALPHABET[vecteurs.length],
      origine: ancrageAleatoire(),
      composantes: { x: coefficientBase * base.x, y: coefficientBase * base.y },
      indexBase,
      coefficientBase,
    });
  }

  const labelReference = vecteurs[0].label;

  let labelsCorrects = vecteurs.filter((v) => v.label !== labelReference && satisfaitPropriete(v, propriete)).map((v) => v.label);

  if (labelsCorrects.length === 0) {
    const coefficientBase = coefficientForcePour(propriete);
    const base = bases[0];
    vecteurs.push({
      label: ALPHABET[vecteurs.length],
      origine: ancrageAleatoire(),
      composantes: { x: coefficientBase * base.x, y: coefficientBase * base.y },
      indexBase: 0,
      coefficientBase,
    });
    labelsCorrects = [vecteurs[vecteurs.length - 1].label];
  }

  const cibleEgalite = labelsCorrects[randomInt(0, labelsCorrects.length - 1)];
  const coefficientEgalite = vecteurs.find((v) => v.label === cibleEgalite)!.coefficientBase;

  return {
    vecteurs,
    labelReference,
    propriete,
    labelsCorrects,
    cibleEgalite,
    coefficientEgalite,
  };
}

export function construireAvecVarianteId(varianteId: ProprieteComparaison): ExerciceComparaisonVecteurs {
  return construireAvecPropriete(varianteId);
}

export const CATALOGUE_VARIANTES: { id: ProprieteComparaison; label: string }[] = [
  { id: "longueur", label: "Longueur" },
  { id: "direction", label: "Direction" },
  { id: "sens", label: "Sens" },
];

export function genererExerciceComparaisonVecteurs(): ExerciceComparaisonVecteurs {
  const propriete = PROPRIETES[randomInt(0, PROPRIETES.length - 1)];
  return construireAvecPropriete(propriete);
}

export const genererExercice: GenerateurExerciceComparaisonVecteurs = genererExerciceComparaisonVecteurs;
