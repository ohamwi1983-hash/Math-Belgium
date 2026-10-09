import type { ExerciceTangenteE } from "../../core6e/tangentesConique.types";
import { distancePointDroite } from "./algebreTangente";
import { construireFamilleB } from "./familleB";
import { tirerEntier, tirerSigne } from "./aleatoire";

/**
 * Couche A (6e) — génération famille E ("point d'une conique le plus proche d'une droite"), `6gen62`.
 *
 * **RÉUTILISE DIRECTEMENT `construireFamilleB`** (appel de fonction, pas une réimplémentation
 * parallèle) — mission : "réutilise intégralement la famille B" pour trouver les 2 tangentes
 * parallèles à `d` et leurs points de tangence. `aSolution` est FORCÉ à `true` (`construireFamilleB({
 * aSolution: true })`) : famille E a structurellement besoin des 2 points réels pour poser la
 * question "lequel est le plus proche" — un tirage "aucune tangente" n'aurait ici aucun sens (à la
 * différence de familles B/C elles-mêmes, où ce cas EST la moitié du propos).
 *
 * La droite `d` elle-même (contrairement à celle de la famille B, purement narrative — "seule la
 * pente compte") doit ici être une droite RÉELLE et CONCRÈTE : son ordonnée à l'origine `c0` sert au
 * calcul de distance (`distancePointDroite`, `algebreTangente.ts`, déjà éprouvée par ses propres
 * tests). Choisie à l'écart des deux `k` des tangentes (jamais `d` elle-même tangente — le calcul de
 * distance resterait valide mais rendrait l'écran "trouver le point le plus proche" trivial/dégénéré
 * si `d` coïncidait avec l'une des deux tangentes trouvées).
 */

export interface OverridesFamilleE {
  aSolution?: boolean; // toujours forcé à true en interne — voir en-tête, exposé pour les tests uniquement.
}

export function construireFamilleE(_overrides: OverridesFamilleE = {}): ExerciceTangenteE {
  const base = construireFamilleB({ aSolution: true });
  const [k1, k2] = base.tangentes.map((t) => t.k);
  const kMin = Math.min(k1, k2);
  const kMax = Math.max(k1, k2);

  // c0=0 (droite passant par le centre) donnerait 2 distances TOUJOURS égales (les 2 points de
  // tangence sont symétriques par rapport au centre pour des pentes ±k opposées) — un cas "lequel
  // est le plus proche" sans réponse unique, exclu explicitement (jamais un exercice ambigu).
  let c0: number;
  for (;;) {
    c0 = tirerSigne() * tirerEntier(1, Math.max(1, Math.round(Math.max(Math.abs(kMin), Math.abs(kMax))) + 3));
    if (Math.abs(c0 - k1) > 1e-6 && Math.abs(c0 - k2) > 1e-6) break;
  }

  const distances: [number, number] = [distancePointDroite(base.tangentes[0]!.point, base.m, c0), distancePointDroite(base.tangentes[1]!.point, base.m, c0)];
  const indexPlusProche: 0 | 1 = distances[0] <= distances[1] ? 0 : 1;

  return { famille: "E", base, c0, distances, indexPlusProche };
}
