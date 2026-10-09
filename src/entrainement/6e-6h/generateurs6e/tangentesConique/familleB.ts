import type { ConiqueCentree, ExerciceTangenteB } from "../../core6e/tangentesConique.types";
import { classifierConiqueCentree, elementsConiqueCentree, tirerTripletCanonique } from "../identificationConiques/classification";
import { resoudreTangentesParalleles } from "./algebreTangente";
import { reduireFraction, tirerEntier, tirerParmi, tirerSigne } from "./aleatoire";

/**
 * Couche A (6e) — génération famille B ("tangentes parallèles à une droite donnée"), `6gen62`.
 * HYPERBOLE UNIQUEMENT (voir `core6e/tangentesConique.types.ts`, en-tête, pour la justification).
 *
 * Réutilise `tirerTripletCanonique`/`classifierConiqueCentree`/`elementsConiqueCentree` (6gen58,
 * `identificationConiques/classification.ts`) pour produire une hyperbole entière "propre" — les
 * demi-axes `a`,`b` (entiers, garantis par construction) sont récupérés depuis `elementsConiqueCentree`
 * plutôt que retirés séparément, pour ne jamais dupliquer la logique de tirage déjà en place.
 *
 * La pente demandée `m` est choisie relativement à la pente `b/a` des ASYMPTOTES (`a` = demi-axe
 * TRANSVERSE, toujours celui associé au terme de même signe que `M`, convention `elementsConiqueCentree`) :
 * `|m|>b/a` ⟹ 2 tangentes réelles ; `|m|<b/a` ⟹ aucune — tirée à ~50/50 (`aSolution`).
 */

function construireHyperbole(): { conique: ConiqueCentree; a: number; b: number } {
  const categorie = tirerParmi(["hyperboleHorizontal", "hyperboleVertical"] as const);
  const { coeffX, coeffY, M } = tirerTripletCanonique(categorie);
  const nature = classifierConiqueCentree(coeffX, coeffY, M);
  const elements = elementsConiqueCentree(coeffX, coeffY, M, nature);
  const a = Math.round(elements.a as number);
  const b = Math.round(elements.b as number);
  return { conique: { coeffX, coeffY, M, nature }, a, b };
}

export interface OverridesFamilleB {
  aSolution?: boolean;
}

export function construireFamilleB(overrides: OverridesFamilleB = {}): ExerciceTangenteB {
  const aSolutionCible = overrides.aSolution ?? tirerParmi([true, false] as const);
  for (let essai = 0; essai < 30; essai++) {
    const { conique, a, b } = construireHyperbole();

    let mNumBrut: number;
    let mDenBrut: number;
    if (aSolutionCible) {
      // |m| = (b+extra)/a > b/a — plus raide que l'asymptote.
      mNumBrut = b + tirerEntier(1, 3);
      mDenBrut = a;
    } else {
      // |m| = extra/a < b/a — plus plate que l'asymptote (extra ∈ [1,b-1], b≥2 garanti).
      mNumBrut = tirerEntier(1, Math.max(1, b - 1));
      mDenBrut = a;
    }
    const signeM = tirerSigne();
    const { num: mNum, den: mDen } = reduireFraction(signeM * mNumBrut, mDenBrut);
    const m = mNum / mDen;

    const resultat = resoudreTangentesParalleles(conique, m);
    if (resultat.aSolution !== aSolutionCible) continue; // garde de robustesse (arrondi elements.a/b)

    let c0 = tirerSigne() * tirerEntier(1, 5);
    if (resultat.aSolution && resultat.tangentes.some((t) => Math.abs(t.k - c0) < 1e-6)) c0 += 1; // évite d≡une tangente

    return { famille: "B", conique, m, mNum, mDen, c0, aSolution: resultat.aSolution, tangentes: resultat.tangentes };
  }
  throw new Error(`construireFamilleB : impossible d'atteindre aSolution=${aSolutionCible} après 30 essais`);
}
