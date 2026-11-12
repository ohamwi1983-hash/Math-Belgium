/**
 * Couche A (5e) — banque de contextes narratifs pour 5gen35 ("Vitesse et position"). Chaque entrée
 * porte 2 fonctions de phrase (variante A / variante B) et ses propres bornes RÉALISTES (audit 5c5d
 * point 13, décision G) : vitesse atteinte (`vMin`/`vMax`, en m/s), accélérations plausibles
 * (`aValeurs`), vitesses initiales possibles (`bValeurs`) et distances totales de la variante B.
 *
 * Deux récits par contexte : départ arrêté (b = 0 : « s'élance », « démarre ») ou mobile DÉJÀ LANCÉ
 * à b m/s au passage d'un repère (b > 0) — règle b = 0 ⇔ « s'élance / démarre », jamais l'un sans
 * l'autre. Le récit est choisi par la phrase elle-même selon b (`recit`). Le générateur tire le
 * type de départ à 50/50 (paramètre au choix « vitesse initiale » des évaluations : tous les
 * contextes peuvent être tirés dans les deux cas).
 *
 * La nageuse a été retirée : avec une accélération d'au moins 1 m/s² (contrainte arithmétique du
 * générateur, racine rejetée entière), elle atteint sa vitesse plafond (≈ 2 m/s) en 2 s et 2 m.
 * Variante B : la distance TOTALE est toujours dite explicitement (« longue de D m au total », « à
 * D m de … ») pour qu'elle ne se lise jamais comme la distance restante (audit point 15).
 */
import type { ContexteVitessePosition } from "../../core5e/vitessePosition.types";

/** « déjà lancé(e) à b m/s » — accord selon le genre du sujet. */
function lance(b: number, feminin: boolean): string {
  return `déjà lancé${feminin ? "e" : ""} à ${b} m/s`;
}

/** Distance parcourue « après t secondes » mesurée depuis le départ (b = 0) ou depuis le repère
 * franchi lancé (b > 0). */
function distance(sLatex: string, b: number, depuis: string, pronom: "il" | "elle"): string {
  return `La distance qu'${pronom} a parcourue ${b === 0 ? "" : `depuis ${depuis} `}après $t$ secondes vaut $${sLatex}$ (en m)`;
}

export const CONTEXTES_VITESSE_POSITION: ContexteVitessePosition[] = [
  {
    id: "sprint",
    sujet: "le coureur",
    pronom: "il",
    vMin: 6,
    vMax: 11,
    aValeurs: [1, 2],
    bValeurs: [0, 2, 3, 4],
    distancesTotalesB: [60, 100],
    phraseA: (sLatex, D, b) =>
      b === 0
        ? `Un sprinteur s'élance sur une piste rectiligne. ${distance(sLatex, b, "", "il")}, jusqu'à un repère situé à ${D} m du départ.`
        : `Lors d'un relais, un coureur ${lance(b, false)} reçoit le témoin au début de la zone de passage, puis accélère. ${distance(sLatex, b, "ce point", "il")}, jusqu'à un repère situé ${D} m plus loin.`,
    phraseB: (sLatex, D1, D, b) =>
      b === 0
        ? `Un sprinteur s'élance sur une piste rectiligne. ${distance(sLatex, b, "", "il")} jusqu'à un repère situé à ${D1} m du départ, où il cesse d'accélérer. Il termine ensuite la course, longue de ${D} m au total, à vitesse constante.`
        : `Lors d'un relais, un coureur ${lance(b, false)} reçoit le témoin, puis accélère. ${distance(sLatex, b, "ce point", "il")} jusqu'à un repère situé à ${D1} m, où il cesse d'accélérer. Il termine ensuite son relais, long de ${D} m au total depuis ce point, à vitesse constante.`,
  },
  {
    id: "cyclisme",
    sujet: "la cycliste",
    pronom: "elle",
    vMin: 8,
    vMax: 18,
    aValeurs: [1, 2],
    bValeurs: [0, 2, 3, 4],
    distancesTotalesB: [200, 250, 300],
    phraseA: (sLatex, D, b) =>
      b === 0
        ? `Une cycliste s'élance, à l'arrêt, au départ d'un sprint sur le plat. ${distance(sLatex, b, "", "elle")}, jusqu'à un repère situé à ${D} m du départ.`
        : `Une cycliste, ${lance(b, true)}, franchit la ligne de départ d'un sprint sur le plat puis accélère. ${distance(sLatex, b, "la ligne", "elle")}, jusqu'à un repère situé à ${D} m de la ligne.`,
    phraseB: (sLatex, D1, D, b) =>
      b === 0
        ? `Une cycliste s'élance, à l'arrêt, au départ d'un sprint sur le plat. ${distance(sLatex, b, "", "elle")} jusqu'à un repère situé à ${D1} m, où elle cesse d'accélérer. Elle maintient ensuite sa vitesse jusqu'à l'arrivée, à ${D} m du départ.`
        : `Une cycliste, ${lance(b, true)}, franchit la ligne de départ d'un sprint sur le plat. ${distance(sLatex, b, "la ligne", "elle")} jusqu'à un repère situé à ${D1} m, où elle cesse d'accélérer. Elle maintient ensuite sa vitesse jusqu'à l'arrivée, à ${D} m de la ligne de départ.`,
  },
  {
    id: "patinage",
    sujet: "le patineur",
    pronom: "il",
    vMin: 6,
    vMax: 14,
    aValeurs: [1, 2],
    bValeurs: [0, 2, 3, 4],
    distancesTotalesB: [100, 500],
    phraseA: (sLatex, D, b) =>
      b === 0
        ? `Un patineur de vitesse s'élance sur l'anneau de glace. ${distance(sLatex, b, "", "il")}, jusqu'à un repère situé à ${D} m du départ.`
        : `Un patineur de vitesse, ${lance(b, false)}, passe la ligne de départ d'un tour chronométré puis accélère. ${distance(sLatex, b, "la ligne", "il")}, jusqu'à un repère situé à ${D} m de la ligne.`,
    phraseB: (sLatex, D1, D, b) =>
      b === 0
        ? `Un patineur de vitesse s'élance sur l'anneau de glace. ${distance(sLatex, b, "", "il")} jusqu'à un repère situé à ${D1} m, où il cesse d'accélérer. Il termine ensuite la course, longue de ${D} m au total, à vitesse constante.`
        : `Un patineur de vitesse, ${lance(b, false)}, passe la ligne de départ d'un tour chronométré. ${distance(sLatex, b, "la ligne", "il")} jusqu'à un repère situé à ${D1} m, où il cesse d'accélérer. Il termine ensuite le tour, long de ${D} m au total, à vitesse constante.`,
  },
  {
    id: "aviron",
    sujet: "la rameuse",
    pronom: "elle",
    vMin: 3,
    vMax: 6,
    aValeurs: [1, 2],
    bValeurs: [0, 1, 2],
    distancesTotalesB: [100, 250, 500],
    phraseA: (sLatex, D, b) =>
      b === 0
        ? `Une rameuse s'élance au départ d'une course d'aviron. ${distance(sLatex, b, "", "elle")}, jusqu'à une bouée située à ${D} m du départ.`
        : `À l'entraînement, une rameuse ${lance(b, true)} passe une première bouée puis accélère. ${distance(sLatex, b, "cette bouée", "elle")}, jusqu'à une seconde bouée située ${D} m plus loin.`,
    phraseB: (sLatex, D1, D, b) =>
      b === 0
        ? `Une rameuse s'élance au départ d'une course d'aviron. ${distance(sLatex, b, "", "elle")} jusqu'à une bouée située à ${D1} m, où elle cesse d'accélérer. Elle termine ensuite la course, longue de ${D} m au total, à vitesse constante.`
        : `À l'entraînement, une rameuse ${lance(b, true)} passe une première bouée puis accélère. ${distance(sLatex, b, "cette bouée", "elle")} jusqu'à une bouée située à ${D1} m, où elle cesse d'accélérer. Elle rame ensuite à vitesse constante jusqu'à l'arrivée, à ${D} m de la première bouée.`,
  },
  {
    id: "voitureEssai",
    sujet: "la voiture",
    pronom: "elle",
    vMin: 10,
    vMax: 30,
    aValeurs: [1, 2],
    bValeurs: [0, 3, 4, 5],
    distancesTotalesB: [200, 300, 400],
    phraseA: (sLatex, D, b) =>
      b === 0
        ? `Sur une piste d'essai rectiligne, une voiture démarre à l'arrêt. ${distance(sLatex, b, "", "elle")}, jusqu'à un radar situé à ${D} m du départ.`
        : `Sur une piste d'essai rectiligne, une voiture ${lance(b, true)} passe un premier radar puis accélère. ${distance(sLatex, b, "ce radar", "elle")}, jusqu'à un second radar situé ${D} m plus loin.`,
    phraseB: (sLatex, D1, D, b) =>
      b === 0
        ? `Sur une piste d'essai rectiligne, une voiture démarre à l'arrêt. ${distance(sLatex, b, "", "elle")} jusqu'à un repère situé à ${D1} m, où la pilote cesse d'accélérer. Elle roule ensuite à vitesse constante jusqu'à un radar, à ${D} m du départ.`
        : `Sur une piste d'essai rectiligne, une voiture ${lance(b, true)} passe un premier radar puis accélère. ${distance(sLatex, b, "ce radar", "elle")} jusqu'à un repère situé à ${D1} m, où la pilote cesse d'accélérer. Elle roule ensuite à vitesse constante jusqu'à un second radar, à ${D} m du premier.`,
  },
  {
    id: "skiFond",
    sujet: "le skieur",
    pronom: "il",
    vMin: 4,
    vMax: 8,
    aValeurs: [1, 2],
    bValeurs: [0, 1, 2, 3],
    distancesTotalesB: [100, 200],
    phraseA: (sLatex, D, b) =>
      b === 0
        ? `Un skieur de fond s'élance sur une piste rectiligne et plate. ${distance(sLatex, b, "", "il")}, jusqu'à un panneau situé à ${D} m du départ.`
        : `Un skieur de fond, ${lance(b, false)}, passe devant un premier panneau sur une piste plate puis accélère. ${distance(sLatex, b, "ce panneau", "il")}, jusqu'à un second panneau situé ${D} m plus loin.`,
    phraseB: (sLatex, D1, D, b) =>
      b === 0
        ? `Un skieur de fond s'élance sur une piste rectiligne et plate. ${distance(sLatex, b, "", "il")} jusqu'à un panneau situé à ${D1} m, où il cesse d'accélérer. Il termine ensuite la piste, longue de ${D} m au total, à vitesse constante.`
        : `Un skieur de fond, ${lance(b, false)}, passe devant un premier panneau sur une piste plate puis accélère. ${distance(sLatex, b, "ce panneau", "il")} jusqu'à un repère situé à ${D1} m, où il cesse d'accélérer. Il glisse ensuite à vitesse constante jusqu'à l'arrivée, à ${D} m du premier panneau.`,
  },
  {
    id: "tram",
    sujet: "le tram",
    pronom: "il",
    vMin: 4,
    vMax: 12,
    aValeurs: [1],
    bValeurs: [0, 2, 3, 4],
    distancesTotalesB: [200, 300],
    phraseA: (sLatex, D, b) =>
      b === 0
        ? `Un tram démarre d'un arrêt sur une voie rectiligne. ${distance(sLatex, b, "", "il")}, jusqu'à un carrefour situé à ${D} m de l'arrêt.`
        : `Un tram, déjà en mouvement à ${b} m/s, passe devant un poteau puis accélère. ${distance(sLatex, b, "ce poteau", "il")}, jusqu'à un carrefour situé ${D} m plus loin.`,
    phraseB: (sLatex, D1, D, b) =>
      b === 0
        ? `Un tram démarre d'un arrêt sur une voie rectiligne. ${distance(sLatex, b, "", "il")} jusqu'à un poteau situé à ${D1} m, où il cesse d'accélérer. Il roule ensuite à vitesse constante jusqu'à l'arrêt suivant, à ${D} m du premier.`
        : `Un tram, déjà en mouvement à ${b} m/s, passe devant un poteau puis accélère. ${distance(sLatex, b, "ce poteau", "il")} jusqu'à un repère situé à ${D1} m, où il cesse d'accélérer. Il roule ensuite à vitesse constante jusqu'à l'arrêt suivant, à ${D} m du poteau.`,
  },
];
