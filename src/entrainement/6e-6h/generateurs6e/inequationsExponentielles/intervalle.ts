import type { EnsembleReelGuide, MorceauIntervalle } from "../../core6e/ensembleReel.types";
import type { Comparateur, DirectionSigne } from "../../core6e/inequationsExponentielles.types";
import { ensembleDeuxMorceaux, ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../ensembleReel";
import { comparateurNonStrict, comparateurVersLeBas, estVraiPourValeur, inverserComparateur } from "./comparateur";

/**
 * Couche A (6e) — résolution PURE d'inéquations élémentaires en `EnsembleReelGuide`, partagée par
 * les familles A/D/E de `6gen10` (design decision #4 : un mécanisme partagé, jamais 5 versions
 * ad hoc). Chaque fonction ici encode un fait algébrique simple ; la CORRECTION de chaque fait est
 * cross-vérifiée dans `intervalle.test.ts` par échantillonnage numérique indépendant de
 * l'inéquation RÉELLE (jamais en réutilisant la même formule).
 */

/** `m·x+n [comparateur] cible` — `m≠0` garanti par l'appelant (sinon la "solution" dégénère en ℝ
 * ou ∅, hors du domaine de ce générateur — voir `core6e/inequationsExponentielles.types.ts`).
 * Diviser par `m` inverse le sens ssi `m<0`. */
export function resoudreAffine(m: number, n: number, comparateur: Comparateur, cible: number): MorceauIntervalle {
  const comparateurApresDivision = m > 0 ? comparateur : inverserComparateur(comparateur);
  const seuil = (cible - n) / m;
  const inclus = comparateurNonStrict(comparateurApresDivision);
  return comparateurVersLeBas(comparateurApresDivision) ? versLeBasJusque(seuil, inclus) : versLeHautDepuis(seuil, inclus);
}

/** `x² - r² [comparateur] 0`, `r>0` — parabole coefficient dominant `+1` (toujours vers le haut),
 * racines `±r`. `>`/`>=` → hors des racines (union de 2 demi-droites) ; `<`/`<=` → entre les
 * racines (1 intervalle fermé/ouvert). */
export function resoudreQuadratiqueSymetrique(r: number, comparateur: Comparateur): EnsembleReelGuide {
  const inclus = comparateurNonStrict(comparateur);
  if (comparateur === ">" || comparateur === ">=") {
    return ensembleDeuxMorceaux(versLeBasJusque(-r, inclus), versLeHautDepuis(r, inclus));
  }
  return ensembleUnMorceau({ inf: -r, sup: r, infInclus: inclus, supInclus: inclus });
}

function signeFacteur(sens: DirectionSigne, x: number, zero: number): -1 | 0 | 1 {
  if (x === zero) return 0;
  const avant = x < zero;
  if (sens === "negatif_puis_positif") return avant ? -1 : 1;
  return avant ? 1 : -1;
}

/**
 * Combine 2 facteurs à zéro UNIQUE (`zero1≠zero2`) en la solution de leur PRODUIT `[comparateur] 0`
 * — 3 régions disjointes ordonnées par les 2 zéros triés, signe du produit échantillonné au milieu
 * de chaque région (le signe de chaque facteur individuel est constant sur toute région ouverte
 * puisqu'un facteur à zéro unique ne change de signe qu'à SON zéro). Bornes des 2 zéros incluses
 * ssi `comparateur` non strict (le produit y vaut exactement 0). Preuve que les régions 1 et 3
 * (les 2 régions extrêmes) partagent TOUJOURS le même signe de produit, jamais la région 2 (voir
 * `intervalle.test.ts`) — n'empêche pas ce code de rester générique (boucle sur les 3 régions,
 * jamais un hardcode de cette propriété).
 */
export function combinerSignesDeuxZeros(zero1: number, sens1: DirectionSigne, zero2: number, sens2: DirectionSigne, comparateur: Comparateur): EnsembleReelGuide {
  if (zero1 === zero2) throw new Error("combinerSignesDeuxZeros : les 2 zéros doivent être distincts");
  const zA = Math.min(zero1, zero2);
  const zB = Math.max(zero1, zero2);
  const inclusFrontiere = comparateurNonStrict(comparateur);

  const regions: { inf: number | null; sup: number | null; testX: number }[] = [
    { inf: null, sup: zA, testX: zA - 1 },
    { inf: zA, sup: zB, testX: (zA + zB) / 2 },
    { inf: zB, sup: null, testX: zB + 1 },
  ];

  const morceaux: MorceauIntervalle[] = [];
  for (const region of regions) {
    const signeProduit = signeFacteur(sens1, region.testX, zero1) * signeFacteur(sens2, region.testX, zero2);
    if (estVraiPourValeur(signeProduit, comparateur, 0)) {
      morceaux.push({
        inf: region.inf,
        sup: region.sup,
        infInclus: region.inf !== null && inclusFrontiere,
        supInclus: region.sup !== null && inclusFrontiere,
      });
    }
  }
  if (morceaux.length === 0) throw new Error("combinerSignesDeuxZeros : aucune région satisfaite — comparateur/sens incohérents");
  if (morceaux.length === 1) return { forme: "intervalles", points: [], morceaux };
  return { forme: "intervalles", points: [], morceaux: morceaux.sort((a, b) => (a.inf ?? -Infinity) - (b.inf ?? -Infinity)) };
}
