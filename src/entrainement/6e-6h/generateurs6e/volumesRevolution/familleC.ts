import type { ExerciceVolumeC, OrdreCourbes } from "../../core6e/volumesRevolution.types";
import { tirerEntier, tirerEntierNonNul } from "../calculPrimitives/aleatoire";
import { additionnerPolynomes, evaluerTermes, polynomeDepuisRacines, polynomeVersTermes, primitiverTermes, soustrairePolynomes } from "../calculAires/polynome";
import { multiplierPolynomes } from "./polynome";
import { tirerRacinesDistinctes } from "./familleB";

/**
 * Couche A (6e) — génération, famille C ("Volume entre une courbe et une droite") de `6gen27`.
 * Même construction "h=f-g depuis les racines cibles" que `generateurs6e/calculAires/familleD.ts`
 * (6gen26, RÉUTILISÉE — `polynomeDepuisRacines`/`additionnerPolynomes`/`evaluerTermes`, Couche A ↔
 * Couche A libre) : h(x)=A(x-r1)(x-r2) s'annule EXACTEMENT en r1,r2 et garde un signe CONSTANT sur
 * ]r1,r2[ (un seul facteur linéaire change de signe dans cet intervalle ouvert) — l'ordre
 * (laquelle de f/g est au-dessus) est donc garanti constant PAR CONSTRUCTION, jamais une
 * coïncidence à vérifier a posteriori (portée volontairement exclue : voir en-tête
 * `core6e/volumesRevolution.types.ts`, "cas exclu").
 *
 * sup(x)²−inf(x)² est développée en élevant sup et inf (choisis selon `ordre`) au carré
 * SÉPARÉMENT via `multiplierPolynomes` (`polynome.ts` de CE générateur — produit général,
 * nécessaire ici car sup/inf peuvent être de degrés différents, contrairement à `carreTermes`
 * utilisé par les familles A/B qui élève TOUJOURS le MÊME polynôme au carré), puis en soustrayant
 * (`soustrairePolynomes`, 6gen26) — jamais (sup−inf)², qui redonnerait une formule
 * mathématiquement DIFFÉRENTE (le piège central de cette famille, voir
 * `moteur6e/verificationVolumesRevolution.ts`).
 *
 * **Dégénérescence trouvée par un test répété en boucle** (`familleC.test.ts`, "LE PIÈGE —
 * l'intégrale ... diffère génériquement") : ∫[r1;r2] sup²−inf² et ∫[r1;r2] (sup−inf)² coïncident
 * EXACTEMENT (le piège devient mathématiquement inoffensif pour cette instance précise, pas un bug
 * de calcul) chaque fois que `g` s'annule exactement au MILIEU de [r1;r2] — développement :
 * (sup²−inf²)−(sup−inf)²=2·inf·(sup−inf)=±2·g·h (selon `ordre`, h=f−g=A(x−r1)(x−r2)), et
 * ∫[r1;r2] g·h ne s'annule QUE quand g(milieu)=0 (h est symétrique/pair autour du milieu, `g` s'y
 * décompose en partie paire nulle en moyenne + partie impaire dont le produit avec h s'annule par
 * parité — la valeur de `g` AU milieu pilote donc seule le résultat). Rejeté PAR CONSTRUCTION
 * ci-dessous (décalage tant que `g(milieu)=0`), jamais laissé au hasard.
 *
 * **Bug trouvé par vérification VISUELLE Playwright (pas par les tests unitaires)** : la formule
 * "washer" V=π∫(sup²−inf²)dx n'est géométriquement valide QUE si sup ET inf restent tous deux DE
 * MÊME SIGNE (idéalement ≥0 — la distance à l'axe de rotation) sur tout l'intervalle. Si l'une des
 * 2 courbes devient négative, `sup` (algébriquement plus grand, donc plus proche de 0 quand les 2
 * valeurs sont négatives) a une valeur ABSOLUE plus PETITE que `inf` — `sup²−inf²` devient alors
 * NÉGATIF, un volume impossible (repéré à l'écran : `V≈-3.351` dans le récapitulatif d'un tirage
 * réel). Fix : un DÉCALAGE VERTICAL entier (`decalage`, ajouté à `nAffine`, donc à f ET g de la
 * MÊME quantité — h=f−g, donc `ordre`/`r1`/`r2` restent EXACTEMENT inchangés) est calculé pour
 * garantir `min(f,g) ≥ 1` sur tout `[r1;r2]` (échantillonnage dense, une parabole/droite n'a
 * d'extremum qu'au sommet ou aux bornes sur un intervalle borné — voir `calculerMinimumSurIntervalle`).
 */

/** Minimum d'une fonction sur `[r1;r2]` par échantillonnage dense (suffisant ici : `evaluerFn` est
 * toujours une parabole ou une droite, jamais oscillante — un balayage fin capture son extremum
 * réel à une précision largement suffisante pour un DÉCALAGE de marge). */
function calculerMinimumSurIntervalle(evaluerFn: (x: number) => number, r1: number, r2: number, echantillons = 60): number {
  let min = Infinity;
  for (let i = 0; i <= echantillons; i++) {
    const x = r1 + ((r2 - r1) * i) / echantillons;
    min = Math.min(min, evaluerFn(x));
  }
  return min;
}

const MARGE_POSITIVITE = 1;

export function construireFamilleVolumeC(): ExerciceVolumeC {
  const [r1, r2] = tirerRacinesDistinctes(-3, 3);
  const coefDominant = tirerEntierNonNul(-2, 2);
  const polyH = polynomeDepuisRacines([r1, r2], coefDominant); // h = f-g
  const milieu = (r1 + r2) / 2;

  const mAffine = tirerEntier(-2, 2);
  const nAffineBrut = tirerEntierNonNul(-3, 3);
  const polyGBrut = [nAffineBrut, mAffine];
  const polyFBrut = additionnerPolynomes(polyH, polyGBrut);

  // Décalage vertical entier (voir en-tête de fichier, "Bug trouvé par vérification visuelle") —
  // f ET g décalés de la MÊME quantité (h=f-g inchangé, donc ordre/r1/r2 inchangés).
  const minSurIntervalle = Math.min(
    calculerMinimumSurIntervalle((x) => evaluerTermes(polynomeVersTermes(polyFBrut), x), r1, r2),
    calculerMinimumSurIntervalle((x) => evaluerTermes(polynomeVersTermes(polyGBrut), x), r1, r2),
  );
  const decalage = minSurIntervalle < MARGE_POSITIVITE ? Math.ceil(MARGE_POSITIVITE - minSurIntervalle) : 0;
  let nAffine = nAffineBrut + decalage;
  while (mAffine * milieu + nAffine === 0) nAffine += 1; // voir en-tête, "dégénérescence"

  const polyG = [nAffine, mAffine]; // g(x) = mAffine*x + nAffine
  const polyF = additionnerPolynomes(polyH, polyG);

  const termesF = polynomeVersTermes(polyF);
  const termesG = polynomeVersTermes(polyG);
  const termesH = polynomeVersTermes(polyH);

  const ordre: OrdreCourbes = evaluerTermes(termesH, milieu) > 0 ? "fSurG" : "gSurF";

  const polySup = ordre === "fSurG" ? polyF : polyG;
  const polyInf = ordre === "fSurG" ? polyG : polyF;
  const polyDeveloppe = soustrairePolynomes(multiplierPolynomes(polySup, polySup), multiplierPolynomes(polyInf, polyInf));
  const developpe = polynomeVersTermes(polyDeveloppe);

  return {
    famille: "C",
    termesF,
    termesG,
    r1,
    r2,
    ordre,
    developpe,
    fReference: (x) => evaluerTermes(termesF, x),
    gReference: (x) => evaluerTermes(termesG, x),
    developpeReference: (x) => evaluerTermes(developpe, x),
    primitiveDeveloppeReference: (x) => primitiverTermes(developpe, x),
  };
}
