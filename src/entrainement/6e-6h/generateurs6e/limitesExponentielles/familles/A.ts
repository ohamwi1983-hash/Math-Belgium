import type { CibleLimite, DirectionX, DirectionZero, ExerciceLimiteA, ExerciceLimiteAFraction, ExerciceLimiteAPuissance } from "../../../core6e/limitesExponentielles.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";

const BASES_SUP = [2, 3, 4, 5] as const;
const BASES_INF = [0.5, 0.4, 0.3, 0.2] as const;

/**
 * Famille A — limite directe, 2 écrans (exposant, globale). "Cible d'abord" au sens fort : les
 * DEUX cibles catégorielles (`limiteExposant`/`limiteGlobale`) sont dérivées ALGÉBRIQUEMENT des
 * paramètres tirés (base, direction, forme de g/N), jamais devinées — chaque cas est TOUJOURS
 * infini par construction (aucun des deux sous-cas ne peut produire une limite finie), donc la
 * réponse "valeur" reste disponible côté UI (fidèle à la spec, "valeur, +∞ ou −∞/0") mais n'est
 * JAMAIS la bonne réponse — un distracteur pédagogiquement honnête, pas un bug.
 *
 * Sous-cas 1 "puissance" — f(x)=k^g(x), x→±∞. g(x) affine (m·x+n, m≠0) ou carré signé (±x²) :
 * dans les deux cas g(x)→±∞ (jamais fini), donc `limiteExposant` est toujours `plus_infini`/
 * `moins_infini`. `limiteGlobale` suit la règle base>1/base<1 appliquée à ce signe.
 *
 * Sous-cas 2 "fraction" — f(x)=e^(N(x)/x^s), x→0±, N(x)=a·x+b (b≠0 GARANTIT une vraie divergence
 * en 0 : N(x)→b≠0, x^s→0, donc N(x)/x^s→±∞ toujours). Base toujours e (>1) — jamais un k tiré,
 * contrairement au sous-cas 1.
 */
export function construireA(): ExerciceLimiteA {
  return Math.random() < 0.5 ? construirePuissance() : construireFraction();
}

function construirePuissance(): ExerciceLimiteAPuissance {
  const baseSuperieureA1 = Math.random() < 0.5;
  const base = tirerParmi(baseSuperieureA1 ? BASES_SUP : BASES_INF);
  const direction: DirectionX = Math.random() < 0.5 ? "plus_infini" : "moins_infini";
  const estAffine = Math.random() < 0.5;

  let gAffine: { m: number; n: number } | null = null;
  let gCarreSigne: 1 | -1 | null = null;
  let signeExposant: 1 | -1;

  if (estAffine) {
    const m = tirerEntierNonNul(-3, 3);
    const n = tirerEntier(-4, 4);
    gAffine = { m, n };
    // g(x)=mx+n → x→+∞ suit le signe de m ; x→−∞ inverse ce signe.
    signeExposant = (direction === "plus_infini" ? m : -m) > 0 ? 1 : -1;
  } else {
    const signe = tirerParmi([1, -1] as const);
    gCarreSigne = signe;
    // g(x)=signe·x² → x²→+∞ quelle que soit la direction, donc g(x)→signe·∞.
    signeExposant = signe;
  }

  const limiteExposant: CibleLimite = signeExposant === 1 ? { type: "plus_infini" } : { type: "moins_infini" };
  const limiteGlobale = limiteGlobalePuissance(baseSuperieureA1, signeExposant === 1);

  return { famille: "A", sousCas: "puissance", base, baseSuperieureA1, direction, gAffine, gCarreSigne, limiteExposant, limiteGlobale };
}

function construireFraction(): ExerciceLimiteAFraction {
  const directionZero: DirectionZero = Math.random() < 0.5 ? "zero_plus" : "zero_moins";
  const s = tirerParmi([1, 2, 3] as const);
  const a = tirerEntier(-3, 3);
  const b = tirerEntierNonNul(-3, 3);

  // Signe de x^s quand x→0± : pair → toujours 0+ ; impair → 0+ si zero_plus, 0− si zero_moins.
  const denominateurPositif = s % 2 === 0 ? true : directionZero === "zero_plus";
  const exposantVersPlusInfini = denominateurPositif ? b > 0 : b < 0;

  const limiteExposant: CibleLimite = exposantVersPlusInfini ? { type: "plus_infini" } : { type: "moins_infini" };
  // Base toujours e (>1) : la règle "base>1" s'applique directement.
  const limiteGlobale = limiteGlobalePuissance(true, exposantVersPlusInfini);

  return { famille: "A", sousCas: "fraction", directionZero, s, a, b, limiteExposant, limiteGlobale };
}

function limiteGlobalePuissance(baseSuperieureA1: boolean, exposantVersPlusInfini: boolean): CibleLimite {
  const versPlusInfini = baseSuperieureA1 ? exposantVersPlusInfini : !exposantVersPlusInfini;
  return versPlusInfini ? { type: "plus_infini" } : { type: "zero" };
}
