/**
 * Couche A — construction de la sous-étape "identifier x et y" de l'écran "contrainte"
 * (`spec-gen55-optimisation-second-degre.md`, section 4, écran 1), PARTAGÉE par les familles
 * `modelisation` où cette identification est réellement conditionnée au skin (`aireEnclos` mode
 * `cloture`, `revenuPrix`, `sommeDeuxCarres`) — motif purement mécanique (mélanger 2 candidats,
 * retrouver l'index du bon après mélange), jamais narratif, même principe que
 * `interpretation.ts::construireOptionsInterpretation`.
 */
import type { IdentificationXY } from "../../core/optimisation.types";
import { melanger } from "./aleatoire";

/**
 * `correctX`/`correctY` : la vraie grandeur nommée par x/y. `fauxX`/`fauxY` : une grandeur DÉRIVÉE
 * plausible mais fausse, propre au piège du skin (ex. "le côté du carré" plutôt que "la longueur du
 * morceau plié en carré") — jamais une seule paire générique valable pour toutes les familles.
 */
export function construireIdentificationXY(correctX: string, correctY: string, fauxX: string, fauxY: string): IdentificationXY {
  const optionsX = melanger([
    { texte: correctX, correcte: true },
    { texte: fauxX, correcte: false },
  ]);
  const optionsY = melanger([
    { texte: correctY, correcte: true },
    { texte: fauxY, correcte: false },
  ]);
  return {
    candidatsX: optionsX.map((o) => o.texte),
    indexCorrectX: optionsX.findIndex((o) => o.correcte),
    candidatsY: optionsY.map((o) => o.texte),
    indexCorrectY: optionsY.findIndex((o) => o.correcte),
  };
}
