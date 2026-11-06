import type { ExerciceEchiquier } from "../../core5e/suitesClassiques.types";
import { choisirParmi, entierAleatoire } from "./aleatoire";

/** Production mondiale annuelle de blé, donnée dans l'énoncé (ordre de grandeur actuel). */
export const PRODUCTION_MONDIALE_TONNES = 800_000_000;
const POIDS_GRAIN_GRAMMES = [0.04, 0.05, 0.06] as const;

/** Scénario 1 — la légende de l'échiquier : 1 grain sur la 1re case, on double à chaque case
 * (u₁ = 1, q = 2, 64 cases — la légende reste intacte). Varient : la case dont on demande le nombre
 * de grains (20 à 64) et le poids d'un grain (0,04 / 0,05 / 0,06 g).
 *
 * `uCase`/`sommeTotale` sont calculés en `BigInt` : 2⁶³ et 2⁶⁴ − 1 dépassent
 * `Number.MAX_SAFE_INTEGER`, un flottant en fausserait les derniers chiffres. `poidsTotalTonnes`
 * part du `BigInt` exact (grains × poids en centièmes de gramme, puis tonnes) et n'est arrondi
 * qu'à la toute fin. */
export function construireEchiquier(): ExerciceEchiquier {
  const u1 = 1;
  const q = 2;
  const caseDemandee = entierAleatoire(20, 64);
  const uCase = 2n ** BigInt(caseDemandee - 1); // u₁ × q^(n−1), u₁ = 1, q = 2
  const sommeTotale = 2n ** 64n - 1n; // u₁ × (q⁶⁴ − 1)/(q − 1)

  const poidsGrainGrammes = choisirParmi(POIDS_GRAIN_GRAMMES);
  // grammes = grains × poids ; poids en centièmes de gramme entier (4, 5 ou 6) pour rester exact.
  const centiemesDeGramme = BigInt(Math.round(poidsGrainGrammes * 100));
  const centiemesTotaux = sommeTotale * centiemesDeGramme; // en centièmes de gramme
  // 1 t = 10⁶ g = 10⁸ centièmes de gramme ; on garde 2 décimales de tonne (÷ 10⁶).
  const centiemesDeTonne = (centiemesTotaux + 500_000n) / 1_000_000n;
  const poidsTotalTonnes = Number(centiemesDeTonne) / 100;

  const facteurComparaison = poidsTotalTonnes / PRODUCTION_MONDIALE_TONNES;
  return {
    scenario: "echiquier",
    u1,
    q,
    caseDemandee,
    uCase,
    sommeTotale,
    poidsGrainGrammes,
    poidsTotalTonnes,
    productionMondialeTonnes: PRODUCTION_MONDIALE_TONNES,
    facteurComparaison,
  };
}
