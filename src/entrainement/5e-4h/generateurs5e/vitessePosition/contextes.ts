/**
 * Couche A (5e) — banque de contextes narratifs pour 5gen35 ("Vitesse et position"). Chaque entrée
 * porte 2 fonctions de phrase (variante A / variante B) plutôt qu'un gabarit générique, et ses
 * propres bornes RÉALISTES (audit 5c5d point 13, décision G) : vitesse atteinte (`vMin`/`vMax`, en
 * m/s), accélérations plausibles (`aValeurs`), vitesse initiale (`bValeurs` — `[0]` dès que le texte
 * dit « s'élance » ou « démarre ») et distances totales de la variante B (`distancesTotalesB`).
 *
 * La nageuse a été retirée : avec une accélération d'au moins 1 m/s² (contrainte arithmétique du
 * générateur, racine rejetée entière), elle atteint sa vitesse plafond (≈ 2 m/s) en 2 s et 2 m, ce
 * qui ne donne aucun énoncé crédible. Unités FIXÉES à m/s pour la conversion ×3,6.
 *
 * Variante B : la distance TOTALE est toujours dite explicitement (« longue de D m au total », « à
 * D m du départ ») pour qu'elle ne se lise jamais comme la distance restante (audit point 15).
 */
import type { ContexteVitessePosition } from "../../core5e/vitessePosition.types";

function lance(b: number, masculin: boolean): string {
  return `déjà lancé${masculin ? "" : "e"} à ${b} m/s`;
}

export const CONTEXTES_VITESSE_POSITION: ContexteVitessePosition[] = [
  {
    id: "sprint",
    sujet: "le sprinteur",
    pronom: "il",
    vMin: 6,
    vMax: 11,
    aValeurs: [1, 2],
    bValeurs: [0],
    distancesTotalesB: [60, 100],
    phraseA: (sLatex, D) =>
      `Un sprinteur s'élance sur une piste rectiligne. Pendant sa phase d'accélération, la distance qu'il a parcourue après $t$ secondes vaut $${sLatex}$ (en m), jusqu'à un repère situé à ${D} m du départ.`,
    phraseB: (sLatex, D1, D) =>
      `Un sprinteur s'élance sur une piste rectiligne. La distance qu'il a parcourue après $t$ secondes vaut $${sLatex}$ (en m) jusqu'à un repère situé à ${D1} m du départ, où il cesse d'accélérer. Il termine ensuite la course, longue de ${D} m au total, à vitesse constante.`,
  },
  {
    id: "cyclisme",
    sujet: "la cycliste",
    pronom: "elle",
    vMin: 8,
    vMax: 18,
    aValeurs: [1, 2],
    bValeurs: [2, 3, 4],
    distancesTotalesB: [200, 250, 300],
    phraseA: (sLatex, D, b) =>
      `Une cycliste, ${lance(b, false)}, franchit la ligne de départ d'un sprint sur le plat puis accélère. La distance qu'elle a parcourue depuis la ligne après $t$ secondes vaut $${sLatex}$ (en m), jusqu'à un repère situé à ${D} m de la ligne.`,
    phraseB: (sLatex, D1, D, b) =>
      `Une cycliste, ${lance(b, false)}, franchit la ligne de départ d'un sprint sur le plat. La distance qu'elle a parcourue depuis la ligne après $t$ secondes vaut $${sLatex}$ (en m) jusqu'à un repère situé à ${D1} m, où elle cesse d'accélérer. Elle maintient ensuite sa vitesse jusqu'à l'arrivée, à ${D} m de la ligne de départ.`,
  },
  {
    id: "patinage",
    sujet: "le patineur",
    pronom: "il",
    vMin: 6,
    vMax: 14,
    aValeurs: [1, 2],
    bValeurs: [0],
    distancesTotalesB: [100, 500],
    phraseA: (sLatex, D) =>
      `Un patineur de vitesse s'élance sur l'anneau de glace. La distance qu'il a parcourue après $t$ secondes vaut $${sLatex}$ (en m), jusqu'à un repère situé à ${D} m du départ.`,
    phraseB: (sLatex, D1, D) =>
      `Un patineur de vitesse s'élance sur l'anneau de glace. La distance qu'il a parcourue après $t$ secondes vaut $${sLatex}$ (en m) jusqu'à un repère situé à ${D1} m, où il cesse d'accélérer. Il termine ensuite la course, longue de ${D} m au total, à vitesse constante.`,
  },
  {
    id: "aviron",
    sujet: "la rameuse",
    pronom: "elle",
    vMin: 3,
    vMax: 6,
    aValeurs: [1, 2],
    bValeurs: [0],
    distancesTotalesB: [100, 250, 500],
    phraseA: (sLatex, D) =>
      `Une rameuse s'élance au départ d'une course d'aviron. La distance qu'elle a parcourue après $t$ secondes vaut $${sLatex}$ (en m), jusqu'à une bouée située à ${D} m du départ.`,
    phraseB: (sLatex, D1, D) =>
      `Une rameuse s'élance au départ d'une course d'aviron. La distance qu'elle a parcourue après $t$ secondes vaut $${sLatex}$ (en m) jusqu'à une bouée située à ${D1} m, où elle cesse d'accélérer. Elle termine ensuite la course, longue de ${D} m au total, à vitesse constante.`,
  },
  {
    id: "voitureEssai",
    sujet: "la voiture",
    pronom: "elle",
    vMin: 10,
    vMax: 30,
    aValeurs: [1, 2],
    bValeurs: [3, 4, 5],
    distancesTotalesB: [200, 300, 400],
    phraseA: (sLatex, D, b) =>
      `Sur une piste d'essai rectiligne, une voiture ${lance(b, false)} passe un premier radar puis accélère. La distance qu'elle a parcourue depuis ce radar après $t$ secondes vaut $${sLatex}$ (en m), jusqu'à un second radar situé ${D} m plus loin.`,
    phraseB: (sLatex, D1, D, b) =>
      `Sur une piste d'essai rectiligne, une voiture ${lance(b, false)} passe un premier radar puis accélère. La distance qu'elle a parcourue depuis ce radar après $t$ secondes vaut $${sLatex}$ (en m) jusqu'à un repère situé à ${D1} m, où la pilote cesse d'accélérer. Elle roule ensuite à vitesse constante jusqu'à un second radar, à ${D} m du premier.`,
  },
  {
    id: "skiFond",
    sujet: "le skieur",
    pronom: "il",
    vMin: 4,
    vMax: 8,
    aValeurs: [1, 2],
    bValeurs: [0],
    distancesTotalesB: [100, 200],
    phraseA: (sLatex, D) =>
      `Un skieur de fond s'élance sur une piste rectiligne et plate. La distance qu'il a parcourue après $t$ secondes vaut $${sLatex}$ (en m), jusqu'à un panneau situé à ${D} m du départ.`,
    phraseB: (sLatex, D1, D) =>
      `Un skieur de fond s'élance sur une piste rectiligne et plate. La distance qu'il a parcourue après $t$ secondes vaut $${sLatex}$ (en m) jusqu'à un panneau situé à ${D1} m, où il cesse d'accélérer. Il termine ensuite la piste, longue de ${D} m au total, à vitesse constante.`,
  },
  {
    id: "tram",
    sujet: "le tram",
    pronom: "il",
    vMin: 4,
    vMax: 12,
    aValeurs: [1],
    bValeurs: [0],
    distancesTotalesB: [200, 300],
    phraseA: (sLatex, D) =>
      `Un tram démarre d'un arrêt sur une voie rectiligne. La distance qu'il a parcourue après $t$ secondes vaut $${sLatex}$ (en m), jusqu'à un carrefour situé à ${D} m de l'arrêt.`,
    phraseB: (sLatex, D1, D) =>
      `Un tram démarre d'un arrêt sur une voie rectiligne. La distance qu'il a parcourue après $t$ secondes vaut $${sLatex}$ (en m) jusqu'à un poteau situé à ${D1} m, où il cesse d'accélérer. Il roule ensuite à vitesse constante jusqu'à l'arrêt suivant, à ${D} m du premier.`,
  },
];
