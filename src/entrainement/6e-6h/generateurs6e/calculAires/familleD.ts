import type { ExerciceAireD, ExerciceAireD_Courbes, ExerciceAireD_Parametre, MotifParametreAireD, OrdreCourbes, SousTypeAireD } from "../../core6e/calculAires.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../calculPrimitives/aleatoire";
import { additionnerPolynomes, evaluerTermes, polynomeDepuisRacines, polynomeVersTermes, primitiverTermes } from "./polynome";
import { tirerRacinesDistinctes } from "./familleB";

/**
 * Couche A (6e) — génération, famille D ("Aire entre deux courbes, avec variante paramètre") de
 * `6gen26`. 3 sous-types (spec) :
 * - "bornesDonnees"/"bornesATrouver" : f(x) = A(x-r1)(x-r2) + g(x) (quadratique + droite), h=f-g de
 *   signe constant sur ]r1,r2[ (même construction "depuis les racines cibles" que la famille B —
 *   voir `familleB.ts`, réutilise `tirerRacinesDistinctes`). Les bornes de l'aire sont EXACTEMENT
 *   r1,r2 (les points d'intersection de f et g) — "bornesDonnees" les affiche directement,
 *   "bornesATrouver" demande de résoudre f(x)=g(x) pour les retrouver.
 * - "parametre" : **portée volontairement restreinte à 2 motifs** (m³ et m^(3/2), les 2 formes
 *   "puissance" explicitement citées par la spec) plutôt qu'un solveur symbolique général pour une
 *   équation exponentielle/logarithmique arbitraire — voir en-tête `core6e/calculAires.types.ts`,
 *   "construction depuis la réponse" : m est choisi D'ABORD, la "cible" en est DÉRIVÉE via la
 *   formule fermée `aireDeMReference`, jamais résolue symboliquement à la volée. Les bornes
 *   (dépendant de m) sont DONNÉES dans l'énoncé pour ce sous-type (jamais "à trouver" — élégamment
 *   cohérent avec "écran 1 sauté si les bornes sont déjà données").
 */

function construireCourbes(sousType: "bornesDonnees" | "bornesATrouver"): ExerciceAireD_Courbes {
  const [r1, r2] = tirerRacinesDistinctes(-4, 4);
  const coefDominant = tirerEntierNonNul(-3, 3);
  const polyH = polynomeDepuisRacines([r1, r2], coefDominant);

  const mAffine = tirerEntier(-3, 3);
  const nAffine = tirerEntier(-4, 4);
  const polyG = [nAffine, mAffine]; // g(x) = mAffine*x + nAffine

  const polyF = additionnerPolynomes(polyH, polyG);

  const termesH = polynomeVersTermes(polyH);
  const termesF = polynomeVersTermes(polyF);
  const termesG = polynomeVersTermes(polyG);

  const milieu = (r1 + r2) / 2;
  const ordre: OrdreCourbes = evaluerTermes(termesH, milieu) > 0 ? "fSurG" : "gSurF";

  return {
    famille: "D",
    sousType,
    ordre,
    termesF,
    termesG,
    termesH,
    r1,
    r2,
    fReference: (x) => evaluerTermes(termesF, x),
    gReference: (x) => evaluerTermes(termesG, x),
    primitiveHReference: (x) => primitiverTermes(termesH, x),
  };
}

export function construireFamilleAireD_BornesDonnees(): ExerciceAireD_Courbes {
  return construireCourbes("bornesDonnees");
}

export function construireFamilleAireD_BornesATrouver(): ExerciceAireD_Courbes {
  return construireCourbes("bornesATrouver");
}

/** Motif "droite par l'origine" — f(x)=x², g(x)=m·x (m>0), intersections en x=0 et x=m,
 * g≥f sur ]0,m[ (g-f = mx-x² = x(m-x) ≥ 0 sur cet intervalle). aire(m) = ∫[0,m](mx-x²)dx = m³/6. */
function construireParametreDroiteParOrigine(m: number): ExerciceAireD_Parametre {
  const aireDeMReference = (mm: number) => (mm * mm * mm) / 6;
  return {
    famille: "D",
    sousType: "parametre",
    ordre: "gSurF",
    motif: "droiteParOrigine",
    m,
    cible: aireDeMReference(m),
    aireDeMReference,
  };
}

/** Motif "parabole / droite horizontale" — f(x)=x², g(x)=m (m>0), intersections en x=±√m, g≥f sur
 * ]-√m,√m[ (g-f = m-x² ≥ 0 sur cet intervalle). aire(m) = ∫[-√m,√m](m-x²)dx = (4/3)m^(3/2). */
function construireParametreParaboleDroiteHorizontale(m: number): ExerciceAireD_Parametre {
  const aireDeMReference = (mm: number) => (4 / 3) * Math.pow(mm, 1.5);
  return {
    famille: "D",
    sousType: "parametre",
    ordre: "gSurF",
    motif: "paraboleDroiteHorizontale",
    m,
    cible: aireDeMReference(m),
    aireDeMReference,
  };
}

const MOTIFS_PARAMETRE: MotifParametreAireD[] = ["droiteParOrigine", "paraboleDroiteHorizontale"];

export function construireFamilleAireD_Parametre(): ExerciceAireD_Parametre {
  const motif = tirerParmi(MOTIFS_PARAMETRE);
  const m = tirerEntier(2, 6);
  return motif === "droiteParOrigine" ? construireParametreDroiteParOrigine(m) : construireParametreParaboleDroiteHorizontale(m);
}

const SOUS_TYPES: SousTypeAireD[] = ["bornesDonnees", "bornesATrouver", "parametre"];

const CONSTRUCTEURS_PAR_SOUS_TYPE: Record<SousTypeAireD, () => ExerciceAireD> = {
  bornesDonnees: construireFamilleAireD_BornesDonnees,
  bornesATrouver: construireFamilleAireD_BornesATrouver,
  parametre: construireFamilleAireD_Parametre,
};

/** Tirage équiprobable du sous-type. */
export function construireFamilleAireD(): ExerciceAireD {
  const sousType = tirerParmi(SOUS_TYPES);
  return CONSTRUCTEURS_PAR_SOUS_TYPE[sousType]();
}
