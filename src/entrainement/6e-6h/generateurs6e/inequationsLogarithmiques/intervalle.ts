import type { EnsembleReelGuide, MorceauIntervalle } from "../../core6e/ensembleReel.types";
import type { Comparateur } from "../../core6e/inequationsLogarithmiques.types";
import { ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../ensembleReel";
import { comparateurNonStrict, comparateurVersLeBas, inverserComparateur } from "./comparateur";

/**
 * Couche A (6e) — résolution PURE d'inéquations/intersections d'intervalles, partagée par les
 * familles de `6gen15`. Chaque fonction encode un fait algébrique simple ; la correction de
 * chaque fait est cross-vérifiée dans `intervalle.test.ts` par échantillonnage numérique
 * indépendant de l'inéquation RÉELLE (jamais en réutilisant la même formule) — même principe que
 * `generateurs6e/inequationsExponentielles/intervalle.ts` (6gen10).
 */

/** `m·x+n [comparateur] cible` — `m≠0` garanti par l'appelant. Diviser par `m` inverse le sens ssi
 * `m<0`. Réplique `resoudreAffine` (6gen10). */
export function resoudreAffine(m: number, n: number, comparateur: Comparateur, cible: number): MorceauIntervalle {
  const comparateurApresDivision = m > 0 ? comparateur : inverserComparateur(comparateur);
  const seuil = (cible - n) / m;
  const inclus = comparateurNonStrict(comparateurApresDivision);
  return comparateurVersLeBas(comparateurApresDivision) ? versLeBasJusque(seuil, inclus) : versLeHautDepuis(seuil, inclus);
}

/**
 * Intersection de 2 morceaux convexes (représentation `null`=infini) — résultat `null` si
 * l'intersection est vide. Gère le cas frontière : si les deux bornes coïncident exactement, le
 * résultat n'est un singleton valide que si les DEUX morceaux incluent ce point ; sinon `null`.
 * Fonction générique (pas seulement 2 demi-droites) : réutilisée pour combiner CE + réponse, où
 * l'un des deux opérandes peut déjà être un intervalle borné (résultat d'une intersection
 * précédente).
 */
export function intersecterMorceaux(a: MorceauIntervalle, b: MorceauIntervalle): MorceauIntervalle | null {
  let inf: number | null;
  let infInclus: boolean;
  if (a.inf === null) {
    inf = b.inf;
    infInclus = b.infInclus;
  } else if (b.inf === null) {
    inf = a.inf;
    infInclus = a.infInclus;
  } else if (a.inf > b.inf) {
    inf = a.inf;
    infInclus = a.infInclus;
  } else if (b.inf > a.inf) {
    inf = b.inf;
    infInclus = b.infInclus;
  } else {
    inf = a.inf;
    infInclus = a.infInclus && b.infInclus;
  }

  let sup: number | null;
  let supInclus: boolean;
  if (a.sup === null) {
    sup = b.sup;
    supInclus = b.supInclus;
  } else if (b.sup === null) {
    sup = a.sup;
    supInclus = a.supInclus;
  } else if (a.sup < b.sup) {
    sup = a.sup;
    supInclus = a.supInclus;
  } else if (b.sup < a.sup) {
    sup = b.sup;
    supInclus = b.supInclus;
  } else {
    sup = a.sup;
    supInclus = a.supInclus && b.supInclus;
  }

  if (inf !== null && sup !== null) {
    if (inf > sup) return null;
    if (inf === sup && !(infInclus && supInclus)) return null;
  }
  return { inf, sup, infInclus: inf === null ? false : infInclus, supInclus: sup === null ? false : supInclus };
}

/** Intersecte CHAQUE morceau de `ensemble` avec `morceau` — résultat filtré des intersections
 * vides. Réutilisé pour intersecter une CE (1 morceau) avec une réponse pouvant déjà compter
 * plusieurs morceaux (ex. une quadratique à 2 racines). */
export function intersecterEnsembleAvecMorceau(ensemble: EnsembleReelGuide, morceau: MorceauIntervalle): MorceauIntervalle[] {
  const resultats: MorceauIntervalle[] = [];
  for (const m of ensemble.morceaux) {
    const r = intersecterMorceaux(m, morceau);
    if (r !== null) resultats.push(r);
  }
  return resultats;
}

/** Intersection GÉNÉRALE de 2 `EnsembleReelGuide` (forme `"intervalles"` obligatoire pour les
 * deux) — produit cartésien des morceaux, filtré des intersections vides, trié par borne inf. */
export function intersecterEnsembles(a: EnsembleReelGuide, b: EnsembleReelGuide): EnsembleReelGuide {
  const morceaux: MorceauIntervalle[] = [];
  for (const ma of a.morceaux) {
    morceaux.push(...intersecterEnsembleAvecMorceau(b, ma));
  }
  return { forme: "intervalles", points: [], morceaux: morceaux.sort((x, y) => (x.inf ?? -Infinity) - (y.inf ?? -Infinity)) };
}

/**
 * `A·(x-z1)·(x-z2) [comparateur] 0`, `A≠0`, `z1≠z2` — parabole de coefficient dominant `A` de
 * signe quelconque (généralise `resoudreQuadratiqueSymetrique` de 6gen10, qui suppose toujours
 * `A>0` et des racines opposées `±r`). Si `A<0`, la parabole s'ouvre vers le bas — le signe entre
 * les racines et hors des racines est INVERSÉ par rapport au cas `A>0` (équivalent à résoudre avec
 * le comparateur inversé après division par `A`).
 */
export function resoudreQuadratiqueFacteurs(A: number, z1: number, z2: number, comparateur: Comparateur): EnsembleReelGuide {
  if (A === 0) throw new Error("resoudreQuadratiqueFacteurs : A doit être non nul");
  if (z1 === z2) throw new Error("resoudreQuadratiqueFacteurs : z1 et z2 doivent être distincts");
  const zA = Math.min(z1, z2);
  const zB = Math.max(z1, z2);
  const comparateurEffectif = A > 0 ? comparateur : inverserComparateur(comparateur);
  const inclus = comparateurNonStrict(comparateurEffectif);

  if (comparateurEffectif === ">" || comparateurEffectif === ">=") {
    return { forme: "intervalles", points: [], morceaux: [versLeBasJusque(zA, inclus), versLeHautDepuis(zB, inclus)] };
  }
  return ensembleUnMorceau({ inf: zA, sup: zB, infInclus: inclus, supInclus: inclus });
}

/**
 * Convertit un `EnsembleReelGuide` en `y` (solution de `Ay²+By+C [comparateur] 0`) en son
 * équivalent en `x` via `x=base^y` — bijection croissante ℝ→(0,+∞) si `base>1`, DÉCROISSANTE si
 * `base<1` (piège central de la famille D). Chaque morceau en `y` devient EXACTEMENT un morceau en
 * `x` (bijection), avec inclusivité conservée mais bornes/direction inversées si `base<1`.
 */
export function convertirIntervalleYVersX(ensembleY: EnsembleReelGuide, base: number): EnsembleReelGuide {
  const versX = (y: number | null, versLeHaut: boolean): number | null => {
    // versLeHaut : true si cette borne est atteinte quand y→+∞ (mappé à x→+∞ si base>1, x→0 si base<1)
    if (y === null) return base > 1 ? (versLeHaut ? null : 0) : versLeHaut ? 0 : null;
    return Math.pow(base, y);
  };

  const morceaux: MorceauIntervalle[] = ensembleY.morceaux.map((m) => {
    if (base > 1) {
      return {
        inf: versX(m.inf, false),
        sup: versX(m.sup, true),
        infInclus: m.inf === null ? false : m.infInclus,
        supInclus: m.sup === null ? false : m.supInclus,
      };
    }
    // base<1 : décroissante — la borne SUP en y devient la borne INF en x, et inversement.
    return {
      inf: versX(m.sup, true),
      sup: versX(m.inf, false),
      infInclus: m.sup === null ? false : m.supInclus,
      supInclus: m.inf === null ? false : m.infInclus,
    };
  });

  return { forme: "intervalles", points: [], morceaux: morceaux.sort((a, b) => (a.inf ?? -Infinity) - (b.inf ?? -Infinity)) };
}
