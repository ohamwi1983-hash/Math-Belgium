/**
 * Couche A — construction des 4 options de l'écran "interpretation" (QCM final), PARTAGÉE par les 4
 * familles : 3 pièges mécaniques (unité fautive, confusion "valeur transférée = grandeur demandée",
 * mauvais côté transféré) plutôt que narratifs, légitimement factorisés ici — même principe que
 * `generateurs/optimisation/interpretation.ts`.
 */
import type { OptionInterpretationTriangleLies } from "../../core/triangleLies.types";
import { melanger } from "./aleatoire";

export interface ParametresInterpretationTriangleLies {
  /** Phrase nommant la grandeur, ex. "L'aire du terrain", "La hauteur de l'arbre" — déjà
   * capitalisée, jamais recapitalisée ici. */
  labelGrandeur: string;
  valeurCorrecte: number;
  uniteCorrecte: string;
  /** Unité plausible mais fausse pour la grandeur (ex. "m" au lieu de "m²" pour une aire). */
  uniteFautive: string;
  /** Valeur transférée du triangle pont (`trianglePont.a`) — piège "confondre la valeur
   * transférée avec la grandeur finale demandée" (l'élève s'arrête à l'écran "pont"). */
  valeurTransferee: number;
  /** Une autre valeur du triangle pont, jamais transférée — piège "mauvais côté transféré". */
  valeurPontAlternative: number;
}

function arrondi(valeur: number): number {
  return Math.round(valeur * 100) / 100;
}

function phrase(labelGrandeur: string, valeur: number, unite: string): string {
  return `${labelGrandeur} vaut ${arrondi(valeur)} ${unite}.`;
}

export function construireOptionsInterpretationTriangleLies(p: ParametresInterpretationTriangleLies): OptionInterpretationTriangleLies[] {
  const correcte = phrase(p.labelGrandeur, p.valeurCorrecte, p.uniteCorrecte);
  const uniteFautive = phrase(p.labelGrandeur, p.valeurCorrecte, p.uniteFautive);
  const valeurTransfereeConfondue = phrase(p.labelGrandeur, p.valeurTransferee, p.uniteCorrecte);
  const mauvaisTransfert = phrase(p.labelGrandeur, p.valeurPontAlternative, p.uniteCorrecte);

  const dejaUtilises = new Set([correcte]);
  const distracteurs: string[] = [];
  for (const candidat of [uniteFautive, valeurTransfereeConfondue, mauvaisTransfert]) {
    let texte = candidat;
    // Filet ultime — chaque candidat en collision essaie un décalage croissant de sa propre valeur
    // jusqu'à obtenir un texte réellement distinct (garanti-unique en pratique : une infinité de
    // décalages possibles, jamais atteint au-delà de la 1re itération sur des données réelles).
    for (let decalage = 1; dejaUtilises.has(texte); decalage++) {
      texte = phrase(p.labelGrandeur, arrondi(p.valeurCorrecte + decalage * 3.7), p.uniteCorrecte);
    }
    dejaUtilises.add(texte);
    distracteurs.push(texte);
  }

  return melanger([
    { texte: correcte, correcte: true },
    ...distracteurs.map((texte) => ({ texte, correcte: false })),
  ]);
}
