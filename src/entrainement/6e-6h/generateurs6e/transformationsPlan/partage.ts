import type { AffixeEntiere } from "../../core6e/transformationsPlan.types";
import type { AngleRemarquable } from "../../core6e/formeTrigonometrique.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";
import { calculerArgument, calculerModule } from "../formeTrigonometrique/familleA";

/**
 * Couche A (6e) — briques partagées par les 3 familles de `6gen40`. Réutilise TEL QUEL le contrat
 * exposé par `generateurs6e/formeTrigonometrique/familleA.ts` (6gen37) : `calculerModule`,
 * `calculerArgument`, `tirerZAvecAngleRemarquable` — voir en-tête de ce fichier pour le contrat
 * complet. Couche A ↔ Couche A libre (CLAUDE.md).
 *
 * ============================================================================
 * **Arithmétique `a/b` locale — pourquoi pas `ajouterC`/`multiplierC` de
 * `generateurs6e/nombresComplexes/arithmetiqueComplexe.ts`**
 * ============================================================================
 * Mêmes opérations EXACTEMENT (Couche A ↔ Couche A, réutilisation libre), mais ce fichier-là
 * travaille sur `ValeurComplexe {re,im}` — convertir à chaque appel vers/depuis `AffixeEntiere
 * {a,b}` (convention "z=a+bi" déjà en place sur tout ce chapitre, `FacteurComplexe` de
 * `familleA.ts`/6gen37) aurait été moins lisible qu'une réimplication triviale de 3 lignes par
 * fonction avec le nommage `a/b` déjà en place ici — même duplication assumée, déjà documentée pour
 * ce genre de petit module (voir en-tête `arithmetiqueComplexe.ts`).
 */

/** Neutralise `-0` (ex. `k·0` pour `k<0`, `0-0`...) — même précaution que `expressionComplexe.ts`/
 * `arithmetiqueComplexe.ts` (chapitre 7 entier, voir leurs en-têtes), appliquée systématiquement au
 * plus près de la source pour ne jamais la laisser fuiter vers la Couche B/l'affichage. */
function normaliserZeroAffixe(v: number): number {
  return v === 0 ? 0 : v;
}
function normaliserAffixe(z: AffixeEntiere): AffixeEntiere {
  return { a: normaliserZeroAffixe(z.a), b: normaliserZeroAffixe(z.b) };
}

export function ajouterAffixe(z1: AffixeEntiere, z2: AffixeEntiere): AffixeEntiere {
  return normaliserAffixe({ a: z1.a + z2.a, b: z1.b + z2.b });
}
export function opposeAffixe(z: AffixeEntiere): AffixeEntiere {
  return normaliserAffixe({ a: -z.a, b: -z.b });
}
export function multiplierAffixe(z1: AffixeEntiere, z2: AffixeEntiere): AffixeEntiere {
  return normaliserAffixe({ a: z1.a * z2.a - z1.b * z2.b, b: z1.a * z2.b + z1.b * z2.a });
}
export function multiplierAffixeParEntier(z: AffixeEntiere, k: number): AffixeEntiere {
  return normaliserAffixe({ a: k * z.a, b: k * z.b });
}

// ============================================================================
// Angles d'axe non nuls {π/2, π, -π/2} — voir en-tête `core6e/transformationsPlan.types.ts` pour la
// raison de cette restriction (typabilité en a+bi entier de la rotation d'un point ARBITRAIRE).
// Construits via `calculerArgument`, réutilisé tel quel (jamais une nouvelle table d'angles
// redécouverte indépendamment).
// ============================================================================

export const ANGLES_AXE_NON_NULS: AngleRemarquable[] = [calculerArgument(0, 1), calculerArgument(-1, 0), calculerArgument(0, -1)];

export function tirerAngleAxeNonNul(): AngleRemarquable {
  return tirerParmi(ANGLES_AXE_NON_NULS);
}

/** `e^{iθ}·z`, θ un angle d'AXE non nul EXACT (voir `ANGLES_AXE_NON_NULS`) — le multiplicateur
 * `cos(θ)+i·sin(θ)` vaut EXACTEMENT `i`, `-1` ou `-i` pour ces 3 angles (`Math.round` absorbe
 * seulement le bruit flottant résiduel de `Math.cos`/`Math.sin`, ex. `cos(π/2)≈6·10⁻¹⁷`, jamais un
 * vrai arrondi mathématique) — le produit avec `z` (entier) reste donc TOUJOURS entier exact, pour
 * n'importe quel `z` de départ. */
export function appliquerRotationAxe(z: AffixeEntiere, angle: AngleRemarquable): AffixeEntiere {
  const cos = Math.round(Math.cos(angle.numerique));
  const sin = Math.round(Math.sin(angle.numerique));
  return normaliserAffixe({ a: z.a * cos - z.b * sin, b: z.a * sin + z.b * cos });
}

// ============================================================================
// Tirage d'affixes entières.
// ============================================================================

/** Point d'affixe entière ARBITRAIRE dans `[-portee;portee]²`, jamais l'origine (redemande tant que
 * `(0,0)`) — utilisé pour z_P (famille A), les points "C"/"D"/... (famille C). */
export function tirerAffixeEntiereArbitraire(portee: number): AffixeEntiere {
  let z: AffixeEntiere;
  do {
    z = { a: tirerEntier(-portee, portee), b: tirerEntier(-portee, portee) };
  } while (z.a === 0 && z.b === 0);
  return z;
}

const AMPLITUDES_AXE = [1, 2, 3, 4] as const;
const AMPLITUDES_QUART = [1, 2, 3] as const;
const SIGNES = [1, -1] as const;

/**
 * Point d'affixe entière "propre" : module entier × argument remarquable exact, MAIS `a`/`b`
 * TOUJOURS entiers — mirroir STRUCTUREL de `tirerZDepart` (`generateurs6e/formeTrigonometrique/
 * familleC.ts`, privée à ce fichier-là donc non importable — même besoin "entier de Gauss", voir
 * en-tête `core6e/transformationsPlan.types.ts`), réimplication délibérée plutôt qu'une
 * modification d'un fichier appartenant à `6gen37`. **Jamais** `tirerZAvecAngleRemarquable`
 * (`familleA.ts`) : celle-ci tire parmi les 16 angles remarquables SANS restriction, donnant des
 * `a`/`b` irrationnels dès qu'aucun des 2 n'est nul et que l'angle n'est pas du "quart" (ex.
 * r=2,θ=π/6 → a=√3) — inutilisable ici puisque `a`/`b` doivent rester des ENTIERS EXACTS (repris
 * tels quels dans `zA+zB`/`zA·zB`, retapés en a+bi par l'élève). Seuls l'axe (`a=0` ou `b=0`,
 * tangente nulle/infinie) et le "quart" (`|a|=|b|`, tangente ±1) ont une tangente RATIONNELLE, donc
 * seuls ces 2 cas peuvent produire un couple d'entiers non nul. Utilisé par la famille B (`zA`/
 * `zB`) — `r`/`angle` sont les module/argument EXACTS du point (jamais retapés en a+bi par l'élève,
 * `sqrt` accepté côté réel — voir `core6e/transformationsPlan.types.ts`).
 */
export function tirerAffixeEntiereRemarquable(): { a: number; b: number; r: number; angle: AngleRemarquable } {
  const surAxe = tirerParmi([true, false] as const);
  let a: number;
  let b: number;
  if (surAxe) {
    const k = tirerParmi(AMPLITUDES_AXE);
    const surReel = tirerParmi([true, false] as const);
    const signe = tirerParmi(SIGNES);
    a = surReel ? signe * k : 0;
    b = surReel ? 0 : signe * k;
  } else {
    const k = tirerParmi(AMPLITUDES_QUART);
    a = k * tirerParmi(SIGNES);
    b = k * tirerParmi(SIGNES);
  }
  const r = calculerModule(a, b);
  const angle = calculerArgument(a, b);
  return { a, b, r, angle };
}

// ============================================================================
// Amplitude d'homothétie/similitude — TOUJOURS un entier simple, jamais 0/±1 (transformation
// triviale ou dégénérée), jamais une fraction (garde `k·z` entier exact pour tout `z` entier de
// départ, sans introduire de machinerie de fraction supplémentaire à l'écran).
// ============================================================================

export const AMPLITUDES_HOMOTHETIE = [-3, -2, 2, 3] as const;

export function tirerAmplitudeHomothetie(): number {
  return tirerParmi(AMPLITUDES_HOMOTHETIE);
}
