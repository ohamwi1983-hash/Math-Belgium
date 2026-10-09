import type { ExerciceFormeTrigC } from "../../core6e/formeTrigonometrique.types";
import { puissanceEntiereC } from "../nombresComplexes/arithmetiqueComplexe";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";
import { calculerArgument, calculerModule } from "./familleA";

/**
 * Couche A (6e) — génération, famille C ("Puissance via De Moivre, jusqu'à la forme a+bi") de
 * `6gen37`.
 *
 * ============================================================================
 * **Construction "entier de Gauss" — SEULE façon de garantir une forme finale a+bi TYPABLE**
 * ============================================================================
 * `moteur6e/expressionComplexe.ts` (fondation chapitre 7, `6gen34`) n'a AUCUNE fonction `sqrt` dans
 * sa grammaire (voir son en-tête) — un résultat final irrationnel (ex. `1+√3i`) serait donc
 * structurellement IMPOSSIBLE à saisir en écran 3. La seule façon de garantir que `z^n` reste
 * TOUJOURS un couple d'entiers exacts, quel que soit `n`, est de partir d'un `z=a+bi` à COEFFICIENTS
 * ENTIERS dès le départ — les entiers de Gauss (`ℤ[i]`) sont fermés par multiplication, donc
 * `z^n` (calculé via `puissanceEntiereC`, réutilisée telle quelle depuis
 * `generateurs6e/nombresComplexes/arithmetiqueComplexe.ts` — Couche A ↔ Couche A libre, CLAUDE.md)
 * reste EXACTEMENT entier, pour n'importe quel `n`, sans aucune boucle de rejet/nouveau tirage.
 *
 * Cette contrainte ("a,b entiers") restreint mécaniquement l'argument de départ aux seuls angles
 * remarquables dont la tangente est rationnelle : les axes (`0,π/2,π,-π/2`, `a=0` ou `b=0`) et le
 * "quart" (`±π/4,±3π/4`, `tan=±1`) — jamais `π/3`/`π/6` et dérivés (`tan=±√3`/`±√3/3`, irrationnel :
 * aucun couple d'entiers `(a,b)` non nul n'a un tel argument). `r`/`θ` de DÉPART restent malgré tout
 * "propres" au sens de la spec (module et argument remarquables, réutilisés via
 * `calculerModule`/`calculerArgument` de `familleA.ts`) — l'écran 1 les redemande à l'élève comme
 * toute la famille A.
 */

const AMPLITUDES_AXE = [1, 2, 3, 4] as const;
const AMPLITUDES_QUART = [1, 2, 3] as const;
const SIGNES = [1, -1] as const;

function tirerZDepart(): { a: number; b: number } {
  const surAxe = tirerParmi([true, false] as const);
  if (surAxe) {
    const k = tirerParmi(AMPLITUDES_AXE);
    const surReel = tirerParmi([true, false] as const);
    const signe = tirerParmi(SIGNES);
    return surReel ? { a: signe * k, b: 0 } : { a: 0, b: signe * k };
  }
  const k = tirerParmi(AMPLITUDES_QUART);
  return { a: k * tirerParmi(SIGNES), b: k * tirerParmi(SIGNES) };
}

export function construireFamilleC(): ExerciceFormeTrigC {
  const { a, b } = tirerZDepart();
  const r = calculerModule(a, b);
  const angle = calculerArgument(a, b);
  const n = tirerEntier(2, 5);
  const { re: aFinal, im: bFinal } = puissanceEntiereC({ re: a, im: b }, n);
  const rFinal = calculerModule(aFinal, bFinal);
  const angleFinal = calculerArgument(aFinal, bFinal);
  return { famille: "C", a, b, r, angle, n, rFinal, angleFinal, aFinal, bFinal };
}
