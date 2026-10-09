import type { ExerciceComplexesA } from "../../core6e/complexesAvances.types";
import { ANGLES_REMARQUABLES } from "../formeTrigonometrique/familleA";
import { tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Condition sur (a,b) pour que (a+bi)ⁿ soit réel positif")
 * de `6gen42`, chapitre 7 "Nombres complexes" (générateur de CLÔTURE du chapitre).
 *
 * ============================================================================
 * **Dérivation complète — "réel" (mod π) vs "réel POSITIF" (mod 2π), le piège central**
 * ============================================================================
 * `a+bi=r·e^{iθ}` (r>0). `(a+bi)ⁿ=rⁿ·e^{inθ}`.
 * - `(a+bi)ⁿ` est RÉEL (positif OU négatif) ⟺ `sin(nθ)=0` ⟺ `nθ≡0 (mod π)`.
 * - `(a+bi)ⁿ` est RÉEL POSITIF ⟺ `e^{inθ}=1` (exactement, pas -1) ⟺ `nθ≡0 (mod 2π)`, un sous-cas
 *   STRICTEMENT plus restrictif : parmi les solutions de `nθ≡0 (mod π)`, une sur deux seulement
 *   donne `nθ≡0 (mod 2π)` (l'autre moitié donne `nθ≡π (mod 2π)`, résultat réel NÉGATIF).
 *
 * **n=4** — solutions de `4θ≡0 (mod π)` parmi les 16 angles remarquables : les 8 multiples de π/4
 * (axes ET diagonales). Sous-classement :
 * - AXES (θ∈{0,π/2,π,-π/2}) : `4θ∈{0,2π,4π,-2π}`, TOUS ≡0 (mod 2π) → RÉEL POSITIF (4 angles). Fait
 *   remarquable : même un `a+bi` réel NÉGATIF (θ=π) ou imaginaire pur négatif (θ=-π/2) donne un
 *   résultat POSITIF une fois élevé à la puissance 4 (paire) — piège symétrique à celui de l'élève
 *   qui croirait qu'il faut restreindre le signe de a/b, alors que non.
 * - DIAGONALES (θ∈{π/4,3π/4,-3π/4,-π/4}) : `4θ∈{π,3π,-3π,-π}`, TOUS ≡π (mod 2π) → RÉEL NÉGATIF (4
 *   angles) — piège CENTRAL : ces 4 angles vérifient bien `4θ≡0 (mod π)` ("réel" au sens large,
 *   piège si l'élève s'arrête à ce test), mais PAS `4θ≡0 (mod 2π)`.
 * - Condition (a,b) réel positif pour n=4 : `a=0 ou b=0` (axe), SANS aucune restriction de signe —
 *   le carré/la puissance 4 absorbe tout signe. Condition (a,b) piège ("réel" au sens large) :
 *   `a=0 ou b=0 ou a=b ou a=-b` (axes ET diagonales) — mais SEULS les axes sont positifs.
 *
 * **n=3** — solutions de `3θ≡0 (mod π)` parmi les 16 : les 6 multiples de π/3 (tous DÉJÀ multiples
 * de π/6, donc dans la banque). Sous-classement :
 * - θ∈{0, 2π/3, -2π/3} : `3θ∈{0,2π,-2π}`, ≡0 (mod 2π) → RÉEL POSITIF (3 angles).
 * - θ∈{π/3, π, -π/3} : `3θ∈{π,3π,-π}`, ≡π (mod 2π) → RÉEL NÉGATIF (3 angles) — piège CENTRAL,
 *   symétrique au cas n=4 (ici la puissance est IMPAIRE : le signe de a+bi n'est PAS absorbé,
 *   contrairement à n=4, ce qui rend la condition sur (a,b) réellement différente par branche —
 *   voir `ui6e/formatComplexesAvances.ts` pour la formulation Cartésienne complète des 3 branches
 *   positives : `b=0,a>0` (θ=0) ; `b=√3·a,a<0` (θ=2π/3) ; `b=-√3·a,a<0` (θ=-2π/3)).
 *
 * Régression exhaustive de cette classification (16 angles × n∈{3,4}) : `familleA.test.ts`.
 *
 * ============================================================================
 * **Conception 100% QCM (3 écrans à choix, jamais de saisie libre)**
 * ============================================================================
 * Les 3 champs de cette famille sont des CONDITIONS SYMBOLIQUES générales (sur θ, puis sur a,b, puis
 * sur a,b ET le module) — pas des valeurs numériques ni des expressions évaluables point par point.
 * Aucune brique de vérification de ce chantier ne compare des conditions algébriques AVEC
 * inégalités par échantillonnage (risque de faux rejet/faux accept élevé, hors de portée des
 * évaluateurs `expressionComplexe`/`expressionExponentielle`, tous deux des évaluateurs de VALEUR,
 * jamais de PRÉDICAT). Mirroir direct du précédent `EtapeChoixCongruenceFormeTrigonometrique`
 * (6gen37, famille D) — un choix parmi options `.btn.toggle-active` pré-écrites, dont une seule est
 * marquée `id:"correct"`, vérifiée par simple comparaison d'identifiant (jamais de `parse_error`
 * possible, même patron que `diagnostiquerAEcran1` de 6gen40). Contenu textuel des options : voir
 * `ui6e/formatComplexesAvances.ts`, `optionsEcran1A`/`optionsEcran2A`/`optionsEcran3A`.
 *
 * `k` (seuil du module, écran 3) : petit entier positif, condition finale formulée en `r>k^{1/n}`
 * (`r=√(a²+b²)`, JAMAIS `rⁿ>k` — équivalent mathématiquement mais évite d'avoir 2 formulations
 * "correctes" distinctes dans un même QCM, voir en-tête `ui6e/formatComplexesAvances.ts`).
 */

export function classifierPuissanceReelle(n: number, thetaNumerique: number): "positif" | "negatif" | "nonReel" {
  const deuxPi = 2 * Math.PI;
  const eps = 1e-6;
  let phi = (n * thetaNumerique) % deuxPi;
  if (phi < 0) phi += deuxPi;
  if (phi < eps || phi > deuxPi - eps) return "positif";
  if (Math.abs(phi - Math.PI) < eps) return "negatif";
  return "nonReel";
}

const N_POSSIBLES = [3, 4] as const;
const K_POSSIBLES = [2, 3, 4, 5] as const;

export function construireFamilleA(): ExerciceComplexesA {
  const n = tirerParmi(N_POSSIBLES);
  const k = tirerParmi(K_POSSIBLES);
  return { famille: "A", n, k };
}

export function construireFamilleAAvecN(n: 3 | 4): ExerciceComplexesA {
  const k = tirerParmi(K_POSSIBLES);
  return { famille: "A", n, k };
}

/** Réutilisé par `familleA.test.ts` — reclassement de tous les angles remarquables pour un `n`
 * donné (régression exhaustive, voir en-tête de fichier). */
export function classifierTousLesAngles(n: number): { positif: number; negatif: number; nonReel: number } {
  let positif = 0;
  let negatif = 0;
  let nonReel = 0;
  for (const angle of ANGLES_REMARQUABLES) {
    const c = classifierPuissanceReelle(n, angle.numerique);
    if (c === "positif") positif++;
    else if (c === "negatif") negatif++;
    else nonReel++;
  }
  return { positif, negatif, nonReel };
}
