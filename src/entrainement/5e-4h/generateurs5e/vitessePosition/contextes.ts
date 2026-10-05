/**
 * Couche A (5e) — banque de contextes narratifs pour 5gen35 ("Vitesse et position"), patron
 * "banque de contextes" déjà établi ailleurs sur la plateforme (ex. `generateurs/
 * bienaymeTchebychev/contextes.ts` en 4e). Chaque entrée porte 2 fonctions de phrase (variante A/
 * variante B) plutôt qu'un jeu de champs grammaticaux à recombiner — même esprit que les "SKINS"
 * de `generateurs/equationInequationSecondDegre/familles/distanceFreinage.ts` : une phrase
 * d'énoncé COMPLÈTE par contexte, pas un gabarit générique qui finirait par sonner mécanique sur
 * 7 sujets aussi différents (course à pied, natation, cyclisme...).
 *
 * Unités FIXÉES m/s pour tous les contextes (voir `core5e/vitessePosition.types.ts`, en-tête de
 * `ContexteVitessePosition`) — nécessaire pour que la conversion ×3,6 de l'écran "conversion"
 * (variante A) soit correcte sur CHAQUE contexte, jamais reconfigurable par entrée.
 */
import type { ContexteVitessePosition } from "../../core5e/vitessePosition.types";

export const CONTEXTES_VITESSE_POSITION: ContexteVitessePosition[] = [
  {
    id: "sprint",
    sujet: "le sprinteur",
    pronom: "il",
    phraseA: (eLatex, D) =>
      `Un sprinteur s'élance sur une piste rectiligne. Sa distance parcourue en fonction du temps (t en s) vaut $${eLatex}$ (e(t) en m), jusqu'à franchir la ligne d'arrivée, à ${D} m du départ.`,
    phraseB: (eLatex, D1, D) =>
      `Un sprinteur s'élance sur une piste rectiligne : sa distance parcourue vaut $${eLatex}$ (t en s, e(t) en m) jusqu'à un repère situé à ${D1} m, où il cesse d'accélérer. Il termine ensuite la course, longue de ${D} m au total, à vitesse constante.`,
  },
  {
    id: "natation",
    sujet: "la nageuse",
    pronom: "elle",
    phraseA: (eLatex, D) =>
      `Une nageuse s'élance dans le grand bassin. Sa distance parcourue en fonction du temps (t en s) vaut $${eLatex}$ (e(t) en m), jusqu'à toucher le mur, à ${D} m du plot de départ.`,
    phraseB: (eLatex, D1, D) =>
      `Une nageuse s'élance dans le grand bassin : sa distance parcourue vaut $${eLatex}$ (t en s, e(t) en m) jusqu'à une bouée de repère située à ${D1} m, où elle cesse d'accélérer. Elle termine ensuite les ${D} m de l'épreuve à vitesse constante.`,
  },
  {
    id: "cyclisme",
    sujet: "la cycliste",
    pronom: "elle",
    phraseA: (eLatex, D) =>
      `Une cycliste s'élance au départ d'un contre-la-montre. Sa distance parcourue en fonction du temps (t en s) vaut $${eLatex}$ (e(t) en m), jusqu'à la ligne d'arrivée, à ${D} m du départ.`,
    phraseB: (eLatex, D1, D) =>
      `Une cycliste s'élance au départ d'un contre-la-montre : sa distance parcourue vaut $${eLatex}$ (t en s, e(t) en m) jusqu'au sommet d'une côte situé à ${D1} m, où elle cesse d'accélérer. Elle termine ensuite les ${D} m de l'épreuve à vitesse constante, en descente.`,
  },
  {
    id: "patinage",
    sujet: "le patineur",
    pronom: "il",
    phraseA: (eLatex, D) =>
      `Un patineur de vitesse s'élance sur l'anneau de glace. Sa distance parcourue en fonction du temps (t en s) vaut $${eLatex}$ (e(t) en m), jusqu'à la ligne d'arrivée, à ${D} m du départ.`,
    phraseB: (eLatex, D1, D) =>
      `Un patineur de vitesse s'élance sur l'anneau de glace : sa distance parcourue vaut $${eLatex}$ (t en s, e(t) en m) jusqu'à un repère situé à ${D1} m, où il cesse d'accélérer. Il termine ensuite les ${D} m de la course à vitesse constante.`,
  },
  {
    id: "aviron",
    sujet: "la rameuse",
    pronom: "elle",
    phraseA: (eLatex, D) =>
      `Une rameuse s'élance au départ d'une course d'aviron. Sa distance parcourue en fonction du temps (t en s) vaut $${eLatex}$ (e(t) en m), jusqu'à la ligne d'arrivée, à ${D} m du départ.`,
    phraseB: (eLatex, D1, D) =>
      `Une rameuse s'élance au départ d'une course d'aviron : sa distance parcourue vaut $${eLatex}$ (t en s, e(t) en m) jusqu'à une bouée de repère située à ${D1} m, où elle cesse d'accélérer. Elle termine ensuite le parcours de ${D} m à vitesse constante.`,
  },
  {
    id: "voitureEssai",
    sujet: "le pilote",
    pronom: "il",
    phraseA: (eLatex, D) =>
      `Une voiture de course s'élance sur une piste d'essai rectiligne. Sa distance parcourue en fonction du temps (t en s) vaut $${eLatex}$ (e(t) en m), jusqu'à un radar situé à ${D} m du départ.`,
    phraseB: (eLatex, D1, D) =>
      `Une voiture de course s'élance sur une piste d'essai rectiligne : sa distance parcourue vaut $${eLatex}$ (t en s, e(t) en m) jusqu'à un repère situé à ${D1} m, où le pilote cesse d'accélérer. Il maintient ensuite une vitesse constante jusqu'à un second radar, à ${D} m du départ.`,
  },
  {
    id: "skiFond",
    sujet: "le skieur",
    pronom: "il",
    phraseA: (eLatex, D) =>
      `Un skieur de fond s'élance sur une piste rectiligne. Sa distance parcourue en fonction du temps (t en s) vaut $${eLatex}$ (e(t) en m), jusqu'à la ligne d'arrivée, à ${D} m du départ.`,
    phraseB: (eLatex, D1, D) =>
      `Un skieur de fond s'élance sur une piste rectiligne : sa distance parcourue vaut $${eLatex}$ (t en s, e(t) en m) jusqu'à un panneau situé à ${D1} m, où il cesse d'accélérer. Il termine ensuite les ${D} m de la piste à vitesse constante.`,
  },
];
