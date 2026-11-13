import type { ComparateurGraphique, IdContexteGraphique } from "../../core/graphiqueContexte.types";

/**
 * gen70 — textes de chaque situation (écran ET papier : une seule source). Les questions sont en
 * langage courant ; c'est à l'élève de reconnaître la caractéristique demandée.
 */

/** Nombre écrit à la française : virgule décimale, « − » typographique. */
export function formatNombreTexte(valeur: number): string {
  const arrondi = Math.round(valeur * 1000) / 1000;
  return `${arrondi}`.replace(".", ",").replace("-", "−");
}

export interface TextesContexte {
  label: string;
  /** Description de la situation (énoncé). */
  situation: string;
  /** Unité des ordonnées / des abscisses, telle qu'affichée à côté d'un champ de saisie. */
  uniteY: string;
  uniteX: string;
  /** Grandeur portée par chaque axe, avec article (« la température », « le moment »). */
  grandeurY: string;
  grandeurX: string;
  valeurY: (y: number) => string;
  valeurX: (x: number) => string;
  /** Complément de temps/lieu d'un extremum : « à 15 h », « à 6 km du départ », « au bout de 15 min ». */
  moment: (x: number) => string;
  questionImage: (x: number) => string;
  questionAntecedent: (k: number) => string;
  questionInequation: (comparateur: ComparateurGraphique, k: number) => string;
  questionExtremum: (nature: "max" | "min") => string;
  questionVariation: (sens: "croissante" | "decroissante") => string;
  questionTendance: () => string;
  /** Libellés de saisie de l'écran d'extremum. */
  libelleMoment: string;
  libelleValeurExtremum: (nature: "max" | "min") => string;
}

const avecUnite = (unite: string) => (v: number) => `${formatNombreTexte(v)} ${unite}`;

/** « d'au moins 12 °C », « de plus de 12 °C »… — tournure commune à toutes les situations. */
function comparaison(comparateur: ComparateurGraphique, kTexte: string): string {
  switch (comparateur) {
    case ">=":
      return `d'au moins ${kTexte}`;
    case ">":
      return `de plus de ${kTexte}`;
    case "<":
      return `de moins de ${kTexte}`;
    case "<=":
      return `d'au plus ${kTexte}`;
  }
}

/** « au moins 120 personnes », « plus de 120 personnes »… (tournure avec « il y a »). */
function quantite(comparateur: ComparateurGraphique, kTexte: string): string {
  switch (comparateur) {
    case ">=":
      return `au moins ${kTexte}`;
    case ">":
      return `plus de ${kTexte}`;
    case "<":
      return `moins de ${kTexte}`;
    case "<=":
      return `au plus ${kTexte}`;
  }
}

const SANS_TENDANCE = () => "";

export const TEXTES_CONTEXTES: Record<IdContexteGraphique, TextesContexte> = {
  temperature: {
    label: "Température sur une journée",
    situation:
      "Une station météo a relevé la température de l'air pendant toute une journée, de 0 h à 24 h. Le graphique donne la température (en °C) en fonction de l'heure (en h).",
    uniteY: "°C",
    uniteX: "h",
    grandeurY: "la température",
    grandeurX: "l'heure",
    valeurY: avecUnite("°C"),
    valeurX: avecUnite("h"),
    moment: (x) => `à ${formatNombreTexte(x)} h`,
    questionImage: (x) => `Quelle température faisait-il à ${formatNombreTexte(x)} h ?`,
    questionAntecedent: (k) => `À quelle(s) heure(s) la température était-elle de ${formatNombreTexte(k)} °C ?`,
    questionInequation: (c, k) => `Pendant quelle(s) période(s) de la journée la température a-t-elle été ${comparaison(c, `${formatNombreTexte(k)} °C`)} ?`,
    questionExtremum: (n) =>
      n === "max"
        ? "À quelle heure a-t-il fait le plus chaud, et quelle température faisait-il alors ?"
        : "À quelle heure a-t-il fait le plus froid, et quelle température faisait-il alors ?",
    questionVariation: (s) =>
      s === "croissante" ? "Pendant quelle(s) période(s) de la journée la température a-t-elle augmenté ?" : "Pendant quelle(s) période(s) de la journée la température a-t-elle diminué ?",
    questionTendance: SANS_TENDANCE,
    libelleMoment: "Heure",
    libelleValeurExtremum: (n) => (n === "max" ? "Température la plus haute" : "Température la plus basse"),
  },
  piscine: {
    label: "Fréquentation d'une piscine",
    situation:
      "Une piscine est ouverte de 8 h à 20 h. Le graphique donne le nombre de personnes présentes dans la piscine en fonction de l'heure (en h).",
    uniteY: "personnes",
    uniteX: "h",
    grandeurY: "le nombre de personnes présentes",
    grandeurX: "l'heure",
    valeurY: avecUnite("personnes"),
    valeurX: avecUnite("h"),
    moment: (x) => `à ${formatNombreTexte(x)} h`,
    questionImage: (x) => `Combien de personnes étaient présentes dans la piscine à ${formatNombreTexte(x)} h ?`,
    questionAntecedent: (k) => `À quelle(s) heure(s) y avait-il ${formatNombreTexte(k)} personnes dans la piscine ?`,
    questionInequation: (c, k) => `Pendant quelle(s) période(s) y avait-il ${quantite(c, `${formatNombreTexte(k)} personnes`)} dans la piscine ?`,
    questionExtremum: (n) =>
      n === "max"
        ? "À quelle heure y avait-il le plus de monde dans la piscine, et combien de personnes y avait-il alors ?"
        : "À quelle heure y avait-il le moins de monde dans la piscine, et combien de personnes y avait-il alors ?",
    questionVariation: (s) =>
      s === "croissante"
        ? "Pendant quelle(s) période(s) le nombre de personnes présentes a-t-il augmenté ?"
        : "Pendant quelle(s) période(s) le nombre de personnes présentes a-t-il diminué ?",
    questionTendance: SANS_TENDANCE,
    libelleMoment: "Heure",
    libelleValeurExtremum: (n) => (n === "max" ? "Nombre de personnes le plus grand" : "Nombre de personnes le plus petit"),
  },
  randonnee: {
    label: "Altitude au cours d'une randonnée",
    situation:
      "Lors d'une randonnée de 16 km, un GPS a enregistré l'altitude tout au long du parcours. Le graphique donne l'altitude (en m) en fonction de la distance parcourue depuis le départ (en km).",
    uniteY: "m",
    uniteX: "km",
    grandeurY: "l'altitude",
    grandeurX: "la distance parcourue",
    valeurY: avecUnite("m"),
    valeurX: avecUnite("km"),
    moment: (x) => (x === 0 ? "au départ (0 km)" : `à ${formatNombreTexte(x)} km du départ`),
    questionImage: (x) => `Quelle était l'altitude après ${formatNombreTexte(x)} km de marche ?`,
    questionAntecedent: (k) => `À quelle(s) distance(s) du départ l'altitude était-elle de ${formatNombreTexte(k)} m ?`,
    questionInequation: (c, k) => `Sur quelle(s) portion(s) du parcours l'altitude était-elle ${comparaison(c, `${formatNombreTexte(k)} m`)} ?`,
    questionExtremum: (n) =>
      n === "max"
        ? "À quelle distance du départ se trouve le point le plus haut du parcours, et quelle est son altitude ?"
        : "À quelle distance du départ se trouve le point le plus bas du parcours, et quelle est son altitude ?",
    questionVariation: (s) => (s === "croissante" ? "Sur quelle(s) portion(s) du parcours monte-t-on ?" : "Sur quelle(s) portion(s) du parcours descend-on ?"),
    questionTendance: SANS_TENDANCE,
    libelleMoment: "Distance du départ",
    libelleValeurExtremum: (n) => (n === "max" ? "Altitude la plus haute" : "Altitude la plus basse"),
  },
  reservoir: {
    label: "Volume d'eau d'un château d'eau",
    situation:
      "Le graphique donne le volume d'eau (en m³) contenu dans un château d'eau en fonction de l'heure (en h), sur une journée de 0 h à 24 h. Pendant certaines périodes, la pompe et les robinets du quartier sont à l'arrêt.",
    uniteY: "m³",
    uniteX: "h",
    grandeurY: "le volume d'eau",
    grandeurX: "l'heure",
    valeurY: avecUnite("m³"),
    valeurX: avecUnite("h"),
    moment: (x) => `à ${formatNombreTexte(x)} h`,
    questionImage: (x) => `Quel volume d'eau le château d'eau contenait-il à ${formatNombreTexte(x)} h ?`,
    questionAntecedent: (k) => `À quelle(s) heure(s) le château d'eau contenait-il ${formatNombreTexte(k)} m³ d'eau ?`,
    questionInequation: (c, k) => `Pendant quelle(s) période(s) le château d'eau contenait-il ${quantite(c, `${formatNombreTexte(k)} m³`)} d'eau ?`,
    questionExtremum: (n) =>
      n === "max"
        ? "À quelle heure le château d'eau contenait-il le plus d'eau, et quel était alors ce volume ?"
        : "À quelle heure le château d'eau contenait-il le moins d'eau, et quel était alors ce volume ?",
    questionVariation: (s) =>
      s === "croissante" ? "Pendant quelle(s) période(s) le volume d'eau a-t-il augmenté ?" : "Pendant quelle(s) période(s) le volume d'eau a-t-il diminué ?",
    questionTendance: SANS_TENDANCE,
    libelleMoment: "Heure",
    libelleValeurExtremum: (n) => (n === "max" ? "Volume le plus grand" : "Volume le plus petit"),
  },
  cycliste: {
    label: "Vitesse d'un cycliste",
    situation:
      "Le graphique donne la vitesse (en km/h) d'un cycliste en fonction du temps écoulé depuis son départ (en min), pendant une sortie de 90 minutes.",
    uniteY: "km/h",
    uniteX: "min",
    grandeurY: "la vitesse",
    grandeurX: "le temps écoulé",
    valeurY: avecUnite("km/h"),
    valeurX: avecUnite("min"),
    moment: (x) => `au bout de ${formatNombreTexte(x)} min`,
    questionImage: (x) => `Quelle était la vitesse du cycliste au bout de ${formatNombreTexte(x)} min ?`,
    questionAntecedent: (k) => `Au bout de combien de minutes la vitesse du cycliste était-elle de ${formatNombreTexte(k)} km/h ?`,
    questionInequation: (c, k) => `Pendant quelle(s) période(s) la vitesse du cycliste a-t-elle été ${comparaison(c, `${formatNombreTexte(k)} km/h`)} ?`,
    questionExtremum: () => "Au bout de combien de minutes le cycliste a-t-il roulé le plus vite, et quelle était alors sa vitesse ?",
    questionVariation: (s) =>
      s === "croissante" ? "Pendant quelle(s) période(s) le cycliste a-t-il accéléré ?" : "Pendant quelle(s) période(s) le cycliste a-t-il ralenti ?",
    questionTendance: SANS_TENDANCE,
    libelleMoment: "Temps écoulé",
    libelleValeurExtremum: () => "Vitesse la plus grande",
  },
  cafe: {
    label: "Refroidissement d'un café",
    situation:
      "On sert un café chaud dans une pièce dont la température ne change pas. Le graphique donne la température du café (en °C) en fonction du temps écoulé depuis qu'il a été servi (en min).",
    uniteY: "°C",
    uniteX: "min",
    grandeurY: "la température du café",
    grandeurX: "le temps écoulé",
    valeurY: avecUnite("°C"),
    valeurX: avecUnite("min"),
    moment: (x) => (x === 0 ? "dès qu'il est servi (0 min)" : `au bout de ${formatNombreTexte(x)} min`),
    questionImage: (x) => `Quelle était la température du café au bout de ${formatNombreTexte(x)} min ?`,
    questionAntecedent: (k) => `Au bout de combien de minutes le café était-il à ${formatNombreTexte(k)} °C ?`,
    questionInequation: (c, k) =>
      `Sur la période représentée, pendant quelle période la température du café a-t-elle été ${comparaison(c, `${formatNombreTexte(k)} °C`)} ?`,
    questionExtremum: () => "À quel moment le café était-il le plus chaud, et quelle était alors sa température ?",
    questionVariation: SANS_TENDANCE,
    questionTendance: () => "Si on attend très longtemps, de quelle température la température du café va-t-elle se rapprocher ?",
    libelleMoment: "Temps écoulé",
    libelleValeurExtremum: () => "Température la plus haute",
  },
  population: {
    label: "Population de bouquetins réintroduits",
    situation:
      "Des bouquetins ont été réintroduits dans une réserve naturelle. Le graphique donne le nombre de bouquetins de la réserve en fonction du temps écoulé depuis leur réintroduction (en années).",
    uniteY: "bouquetins",
    uniteX: "ans",
    grandeurY: "le nombre de bouquetins",
    grandeurX: "le temps écoulé",
    valeurY: avecUnite("bouquetins"),
    valeurX: avecUnite("ans"),
    moment: (x) => (x === 0 ? "au moment de la réintroduction (0 an)" : `au bout de ${formatNombreTexte(x)} ans`),
    questionImage: (x) => `Combien de bouquetins y avait-il dans la réserve au bout de ${formatNombreTexte(x)} ans ?`,
    questionAntecedent: (k) => `Au bout de combien d'années la réserve comptait-elle ${formatNombreTexte(k)} bouquetins ?`,
    questionInequation: (c, k) => `Sur la période représentée, pendant quelle période la réserve a-t-elle compté ${quantite(c, `${formatNombreTexte(k)} bouquetins`)} ?`,
    questionExtremum: () => "À quel moment la réserve comptait-elle le moins de bouquetins, et combien y en avait-il alors ?",
    questionVariation: SANS_TENDANCE,
    questionTendance: () => "La réserve ne peut pas nourrir un nombre illimité d'animaux. De quel nombre de bouquetins la population se rapproche-t-elle à long terme ?",
    libelleMoment: "Temps écoulé",
    libelleValeurExtremum: () => "Nombre de bouquetins le plus petit",
  },
};
