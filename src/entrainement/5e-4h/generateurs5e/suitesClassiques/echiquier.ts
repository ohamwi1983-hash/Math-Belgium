import type { ExerciceEchiquier } from "../../core5e/suitesClassiques.types";

const POIDS_GRAIN_GRAMMES = 0.05;
const PRODUCTION_MONDIALE_TONNES = 713_000_000;

/** Scénario 1 — l'échiquier et les grains de blé. Instance FIXE (u1=1,q=2) — toutes les valeurs
 * affichées sont DÉRIVÉES par formule (jamais recopiées de l'énoncé) pour rester cross-vérifiables.
 *
 * `u64`/`sommeTotale` sont calculés en `BigInt` (`2n**63n`/`2n**64n-1n`) plutôt qu'en réutilisant
 * `termeGeometrique`/`sommeGeometriqueFinie` (`suitesGeometriques/parametres.ts`, réutilisées telles
 * quelles ailleurs sur ce générateur, mais qui passent par `Math.pow` en `number` IEEE-754) : ces 2
 * valeurs dépassent `Number.MAX_SAFE_INTEGER` (2⁵³−1) — un flottant les représenterait avec les
 * derniers chiffres FAUX (`9223372036854776000` au lieu de `9223372036854775808`), alors que la
 * formule est purement entière ici (u1=1, q=2 entiers), donc exactement représentable en `BigInt`.
 * `poidsTotalTonnes` est dérivé à partir du `BigInt` exact, arrondi à 2 décimales SEULEMENT à la toute
 * fin (`Math.round`/division par 100 après conversion en `Number` — cette conversion finale est sans
 * perte, la valeur en tonnes ne comportant plus que ~12 chiffres significatifs, bien en-deçà de la
 * précision d'un double) — jamais affiché via `formatValeurLatex`/sa recherche de fraction
 * (`ui5e/formatSuiteClassique.ts`), qui produirait une fraction pédagogique absurde pour une quantité
 * physique en tonnes qui n'a jamais vocation à être une fraction. */
export function construireEchiquier(): ExerciceEchiquier {
  const u1 = 1;
  const q = 2;
  const u64 = 2n ** 63n; // = u1 × q^(64-1), u1=1 et q=2 entiers
  const sommeTotale = 2n ** 64n - 1n; // = u1 × (q^64-1)/(q-1), u1=1 et q=2 entiers

  // poidsTotalTonnes = sommeTotale(grains) × 0,05(g/grain) / 1 000 000(g/tonne)
  //                  = sommeTotale / 20 000 000, calculé en BigInt en centièmes de tonne (÷200 000)
  //                  pour rester exact jusqu'à l'arrondi final à 2 décimales.
  const CENTIEMES_DE_TONNE_PAR_GRAIN_DENOMINATEUR = 200_000n;
  const quotientCentiemes = sommeTotale / CENTIEMES_DE_TONNE_PAR_GRAIN_DENOMINATEUR;
  const resteCentiemes = sommeTotale % CENTIEMES_DE_TONNE_PAR_GRAIN_DENOMINATEUR;
  const centiemesDeTonneArrondis = resteCentiemes * 2n >= CENTIEMES_DE_TONNE_PAR_GRAIN_DENOMINATEUR ? quotientCentiemes + 1n : quotientCentiemes;
  const poidsTotalTonnes = Number(centiemesDeTonneArrondis) / 100;

  const facteurComparaison = poidsTotalTonnes / PRODUCTION_MONDIALE_TONNES;
  return {
    scenario: "echiquier",
    u1,
    q,
    u64,
    sommeTotale,
    poidsGrainGrammes: POIDS_GRAIN_GRAMMES,
    poidsTotalTonnes,
    productionMondialeTonnes: PRODUCTION_MONDIALE_TONNES,
    facteurComparaison,
  };
}
