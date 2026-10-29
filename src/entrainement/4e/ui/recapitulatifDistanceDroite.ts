import type { EtatSessionDistanceDroite } from "../moteur/typesDistanceDroite";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { calculerEtatActuelDistanceDroite, nomDroiteCible } from "./formatDistanceDroite";

/**
 * Récapitulatif "Ce qu'on sait déjà" — séquence TOUJOURS linéaire (`choixPoint?` → `equationB` →
 * `intersectionQ` → `distancePQ`, voir commentaire de `PhaseDistanceDroite` dans
 * `typesDistanceDroite.ts`) : chaque entrée est gardée par le champ `scoreXxxExercice` (`null` ⟺
 * écran pas encore clos pour CET exercice — `null` en permanence pour "choixPoint" sur la variante
 * "point", qui n'a pas cet écran), jamais une nouvelle logique de suivi. Réutilise TELLE QUELLE
 * `calculerEtatActuelDistanceDroite` (déjà écrite pour l'ancien bloc "état actuel"), appelée avec
 * un seul champ non-`null` à la fois pour en extraire la ligne isolée correspondant à CET écran
 * (elle rend alors directement cette ligne, sans l'emballage `\begin{gathered}` réservé à
 * plusieurs lignes — voir son corps). `\displaystyle` (audit chapitre 7, point 8) : le système
 * {b ; d} rendu en ligne était minuscule.
 */
export function calculerRecapitulatifDistanceDroite(etat: EtatSessionDistanceDroite): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const nomCible = nomDroiteCible(exercice).latex;
  const entrees: EntreeRecapitulatif[] = [];
  const vide = { point: null, droiteCible: null, bAttendue: null, qAttendu: null };

  if (etat.scoreChoixPointExercice !== null) {
    entrees.push({
      libelle: "Point choisi",
      estLatex: true,
      valeur: calculerEtatActuelDistanceDroite({ ...vide, variante: "paralleles", nomCible, point: etat.point! })!,
      revele: etat.choixPointRevele,
    });
  }

  if (etat.scoreEquationBExercice !== null) {
    entrees.push({
      libelle: "Équation de b",
      estLatex: true,
      valeur: `\\displaystyle ${calculerEtatActuelDistanceDroite({ ...vide, variante: exercice.variante, nomCible, droiteCible: etat.droiteCible!, bAttendue: etat.bAttendue! })!}`,
      revele: etat.equationBRevele,
    });
  }

  if (etat.scoreIntersectionQExercice !== null) {
    entrees.push({
      libelle: "Point Q",
      estLatex: true,
      valeur: `\\displaystyle ${calculerEtatActuelDistanceDroite({ ...vide, variante: exercice.variante, nomCible, qAttendu: etat.qAttendu! })!}`,
      revele: etat.intersectionQRevele,
    });
  }

  return entrees;
}
