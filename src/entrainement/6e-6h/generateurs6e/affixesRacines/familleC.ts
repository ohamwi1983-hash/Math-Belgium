import type { ExerciceFamilleC } from "../../core6e/affixesRacines.types";
import { tirerEntierNonNul } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Racines carrées d'un nombre complexe") de `6gen35`.
 * Construite À L'ENVERS depuis une racine cible x+yi (même principe que familles F/G de 6gen34) :
 * x,y entiers non nuls tirés d'abord, puis a=x²-y², b=2xy calculés — garantit ALGÉBRIQUEMENT que
 * a+bi=(x+yi)², jamais par coïncidence.
 *
 * ============================================================================
 * **Pourquoi x,y sont TOUJOURS entiers ici — jamais le facteur √2/√3 évoqué par la spec en variante**
 * ============================================================================
 * La spec autorise en variante "x,y entiers, ou l'un des deux impliquant un facteur √2 ou √3
 * simple". Décision délibérée de NE JAMAIS exercer cette branche, pour 2 raisons qui se recoupent :
 *
 * 1. `moteur6e/expressionComplexe.ts` n'a AUCUN support de fonction (voir son en-tête : "AUCUNE
 *    fonction (sqrt/sin/...) hors de portée de ce chapitre" — un identifiant multi-lettres autre que
 *    "i" lève une erreur ; `^` est en outre restreint à un exposant ENTIER ≥0, donc même
 *    `12^0.5` échoue). Un x ou y irrationnel (m·√k) ne serait donc structurellement PAS saisissable
 *    exactement par l'élève avec l'évaluateur partagé de ce chapitre — modifier cet évaluateur pour
 *    ajouter un support `sqrt` serait une extension hors du périmètre de ce générateur (et briserait
 *    le contrat stable documenté dans son en-tête, "6gen35 à 6gen42 en dépendent directement").
 * 2. La spec de vérification de CE générateur est explicite : "Toutes les réponses : égalité EXACTE
 *    des parties réelle et imaginaire" — pas de tolérance décimale prévue nulle part pour ce
 *    générateur (contrairement, par exemple, à une mesure du chapitre 8). Un x irrationnel forcerait
 *    soit une saisie décimale approximative (contradiction directe avec "égalité exacte"), soit une
 *    notation radicale que l'évaluateur ne comprend pas.
 *
 * **Preuve que rester sur x,y entiers ne perd RIEN de la mécanique pédagogique visée** (le système
 * biquadratique x⁴-a·x²-b²/4=0 reste TOUJOURS résoluble exactement, sans jamais un radical réel à
 * calculer) : en posant u=x², les 2 racines de u²-a·u-b²/4=0 sont u=[a±√(a²+b²)]/2. Or, pour x,y
 * entiers :
 *   a²+b² = (x²-y²)² + (2xy)² = x⁴-2x²y²+y⁴ + 4x²y² = x⁴+2x²y²+y⁴ = (x²+y²)²
 * — TOUJOURS un carré parfait, donc √(a²+b²) = x²+y² (un entier, jamais un radical réel à évaluer).
 * La branche "+" donne u = [(x²-y²)+(x²+y²)]/2 = x² (toujours positive, x≠0) — LA solution filtrée
 * "x²>0" de la spec ; la branche "-" donne u = [(x²-y²)-(x²+y²)]/2 = -y² (toujours négative ou
 * nulle, rejetée). Testé explicitement ci-dessous (`familleC.test.ts`, "identité a²+b²=(x²+y²)²").
 *
 * `xPositif` (écran 2) = |x| — TOUJOURS la racine positive de x² (convention : l'écran 2 demande LA
 * valeur positive, l'écran 3 reconstruit ensuite les 2 racines ±(...) à partir d'elle et de y déduit
 * — voir `core6e/affixesRacines.types.ts`).
 */

const XY_MIN = -5;
const XY_MAX = 5;

export function construireFamilleC(): ExerciceFamilleC {
  const x = tirerEntierNonNul(XY_MIN, XY_MAX);
  const y = tirerEntierNonNul(XY_MIN, XY_MAX);
  const a = x * x - y * y;
  const b = 2 * x * y;
  const xPositif = Math.abs(x);
  // yDeduit = b/(2·xPositif) = y·sign(x) — toujours un entier exact (voir preuve en en-tête).
  const yDeduit = b / (2 * xPositif);
  const racines: [{ re: number; im: number }, { re: number; im: number }] = [
    { re: xPositif, im: yDeduit },
    { re: -xPositif, im: -yDeduit },
  ];
  return { famille: "C", x, y, a, b, xPositif, yDeduit, racines };
}
