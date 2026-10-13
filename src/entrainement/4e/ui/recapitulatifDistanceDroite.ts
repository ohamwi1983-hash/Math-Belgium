import type { EtatSessionDistanceDroite } from "../moteur/typesDistanceDroite";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { calculerEtatActuelDistanceDroite } from "./formatDistanceDroite";

/**
 * Récapitulatif "Ce qu'on sait déjà" — séquence TOUJOURS linéaire (`choixPoint?` → `equationB` →
 * `intersectionQ` → `distancePQ`, voir commentaire de `PhaseDistanceDroite` dans
 * `typesDistanceDroite.ts`) : chaque entrée est gardée par le champ `scoreXxxExercice` (`null` ⟺
 * écran pas encore clos pour CET exercice — `null` en permanence pour "choixPoint" sur la variante
 * "point", qui n'a pas cet écran), jamais une nouvelle logique de suivi. Réutilise TELLE QUELLE
 * `calculerEtatActuelDistanceDroite` (déjà écrite pour l'ancien bloc "état actuel"), appelée avec
 * un seul champ non-`null` à la fois pour en extraire la ligne isolée correspondant à CET écran
 * (elle rend alors directement cette ligne, sans l'emballage `\begin{gathered}` réservé à
 * plusieurs lignes — voir son corps).
 */
export function calculerRecapitulatifDistanceDroite(etat: EtatSessionDistanceDroite): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreChoixPointExercice !== null) {
    entrees.push({
      libelle: "Point choisi",
      estLatex: true,
      valeur: calculerEtatActuelDistanceDroite({ variante: "paralleles", point: etat.point!, droiteCible: null, bAttendue: null, qAttendu: null })!,
      revele: etat.choixPointRevele,
    });
  }

  if (etat.scoreEquationBExercice !== null) {
    entrees.push({
      libelle: "Équation de b",
      estLatex: true,
      valeur: calculerEtatActuelDistanceDroite({ variante: exercice.variante, point: null, droiteCible: etat.droiteCible!, bAttendue: etat.bAttendue!, qAttendu: null })!,
      revele: etat.equationBRevele,
    });
  }

  if (etat.scoreIntersectionQExercice !== null) {
    entrees.push({
      libelle: "Point Q",
      estLatex: true,
      valeur: calculerEtatActuelDistanceDroite({ variante: exercice.variante, point: null, droiteCible: null, bAttendue: null, qAttendu: etat.qAttendu! })!,
      revele: etat.intersectionQRevele,
    });
  }

  return entrees;
}
