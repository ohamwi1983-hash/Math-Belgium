/**
 * Couche A — modèle de `6gen114` « Discrète ou continue ? » (6e ch. 8, § 4, Connaître). La NATURE de
 * la variable est le verdict : tirée à parts égales AVANT la situation. Situations réelles (dont les
 * pièges du cours : une mesure arrondie au centimètre est DISCRÈTE ; un comptage sans maximum — appels,
 * lancers jusqu'au premier 6 — reste DISCRET, dénombrable ; un temps ou une masse exacts sont
 * CONTINUS). Trois écrans, tous des choix fermés à une tentative : la nature, l'ensemble des valeurs
 * possibles (trois propositions), l'outil de calcul d'une probabilité (somme des P(X = k), P(X = c)
 * parfois non nulle / intégrale d'une densité, P(X = c) = 0).
 */

export type Nature114 = "discrete" | "continue";
export type Phase114 = "nature" | "valeurs" | "outil";
export const PHASES_114: Phase114[] = ["nature", "valeurs", "outil"];

export interface Situation114 {
  id: string;
  nature: Nature114;
  /** Énoncé (texte brut, sans formule). */
  texte: string;
  /** Ensemble juste puis deux leurres (LaTeX). */
  valeurs: [string, string, string];
  /** Raison (message d'un choix faux, corrigé). */
  raison: string;
}

const N = (a: number, b: number) => `\\{${a}\\,;${a + 1}\\,;\\ldots\\,;${b}\\}`;
const I = (a: string, b: string) => `[${a}\\,;${b}]`;

export const SITUATIONS_114: Situation114[] = [
  // --- discrètes
  { id: "appels", nature: "discrete", texte: "X est le nombre d'appels reçus par un standard téléphonique en une heure.", valeurs: ["\\{0\\,;1\\,;2\\,;3\\,;\\ldots\\}=\\mathbb{N}", "[0\\,;+\\infty\\mathclose{[}", N(0, 60)], raison: "On compte des appels : X prend des valeurs entières 0, 1, 2… sans maximum fixé, mais on peut les énumérer une à une (infini dénombrable)." },
  { id: "piles", nature: "discrete", texte: "On lance 10 fois une pièce de monnaie ; X est le nombre de « pile » obtenus.", valeurs: [N(0, 10), I("0", "10"), N(1, 10)], raison: "On compte les « pile » : X ne prend que les entiers de 0 à 10." },
  { id: "somme", nature: "discrete", texte: "On lance deux dés à six faces ; X est la somme des deux nombres obtenus.", valeurs: [N(2, 12), I("2", "12"), N(1, 12)], raison: "La somme de deux entiers de 1 à 6 est un entier de 2 à 12 : X prend un nombre fini de valeurs." },
  { id: "absents", nature: "discrete", texte: "Dans une classe de 25 élèves, X est le nombre d'élèves absents un jour donné.", valeurs: [N(0, 25), I("0", "25"), N(1, 25)], raison: "On compte des élèves : X prend les entiers de 0 à 25." },
  { id: "taille", nature: "discrete", texte: "On mesure la taille d'un élève de 6e, puis on l'arrondit au centimètre ; X est la taille arrondie (en cm), entre 150 et 200.", valeurs: [N(150, 200), I("150", "200"), "\\{150\\,;160\\,;\\ldots\\,;200\\}"], raison: "La taille exacte est continue, mais X est la taille arrondie au centimètre : elle ne prend que des valeurs entières, X est discrète." },
  { id: "premier6", nature: "discrete", texte: "On lance un dé jusqu'à obtenir un 6 ; X est le nombre de lancers effectués.", valeurs: ["\\{1\\,;2\\,;3\\,;\\ldots\\}", "[1\\,;+\\infty\\mathclose{[}", N(1, 6)], raison: "On compte des lancers : 1, 2, 3… sans maximum fixé, mais on peut énumérer les valeurs une à une (infini dénombrable)." },
  { id: "note", nature: "discrete", texte: "Un devoir est noté sur 20, en points entiers ; X est la note d'un élève choisi au hasard.", valeurs: [N(0, 20), I("0", "20"), "\\{0\\,;5\\,;10\\,;15\\,;20\\}"], raison: "La note est un nombre entier de points : X prend les entiers de 0 à 20." },
  { id: "voitures", nature: "discrete", texte: "X est le nombre de voitures qui passent à un péage en cinq minutes.", valeurs: ["\\{0\\,;1\\,;2\\,;3\\,;\\ldots\\}=\\mathbb{N}", "[0\\,;+\\infty\\mathclose{[}", N(1, 5)], raison: "On compte des voitures : X prend des valeurs entières 0, 1, 2… qu'on peut énumérer une à une." },
  // --- continues
  { id: "attente", nature: "continue", texte: "Un bus passe toutes les 15 minutes ; X est le temps d'attente exact (en minutes) d'un voyageur arrivé au hasard.", valeurs: [I("0", "15"), N(0, 15), "\\{0\\,;5\\,;10\\,;15\\}"], raison: "Un temps exact peut prendre n'importe quelle valeur réelle entre 0 et 15 (7,25 min, 7,251 min…) : X est continue." },
  { id: "sucre", nature: "continue", texte: "X est la masse exacte (en grammes) d'un paquet de sucre rempli par une machine, entre 990 et 1 010 g.", valeurs: [I("990", "1\\,010"), N(990, 1010), "\\{990\\,;1\\,000\\,;1\\,010\\}"], raison: "Une masse exacte peut prendre toutes les valeurs réelles d'un intervalle : X est continue." },
  { id: "ampoule", nature: "continue", texte: "X est la durée de vie exacte (en heures) d'une ampoule prise au hasard.", valeurs: ["[0\\,;+\\infty\\mathclose{[}", "\\{0\\,;1\\,;2\\,;3\\,;\\ldots\\}=\\mathbb{N}", I("0", "1\\,000")], raison: "Une durée exacte peut prendre n'importe quelle valeur réelle positive : X est continue." },
  { id: "aiguille", nature: "continue", texte: "On fait tourner l'aiguille d'une roue ; X est l'angle exact (en degrés) où elle s'arrête, mesuré depuis une graduation de départ.", valeurs: ["[0\\,;360\\mathclose{[}", N(0, 359), "\\{0\\,;90\\,;180\\,;270\\}"], raison: "L'angle exact peut prendre toutes les valeurs réelles entre 0 et 360 : X est continue." },
  { id: "lancer", nature: "continue", texte: "Lors d'un lancer de poids, X est la distance exacte (en mètres) atteinte par un athlète, entre 0 et 20 m.", valeurs: [I("0", "20"), N(0, 20), "\\{5\\,;10\\,;15\\,;20\\}"], raison: "Une distance exacte peut prendre toutes les valeurs réelles d'un intervalle : X est continue." },
  { id: "livreur", nature: "continue", texte: "Un livreur arrive au hasard entre 14 h et 16 h ; X est son heure d'arrivée exacte (en heures).", valeurs: [I("14", "16"), "\\{14\\,;15\\,;16\\}", N(14, 16)], raison: "L'instant d'arrivée peut être n'importe quel réel entre 14 et 16 : X est continue." },
  { id: "course", nature: "continue", texte: "X est le temps exact (en secondes) mis par un élève pour courir 100 m, entre 11 et 20 s.", valeurs: [I("11", "20"), N(11, 20), "\\{11\\,;15\\,;20\\}"], raison: "Un temps exact peut prendre toutes les valeurs réelles d'un intervalle : X est continue." },
  { id: "pluie", nature: "continue", texte: "X est la hauteur exacte de pluie (en millimètres) tombée un jour d'automne, entre 0 et 50 mm.", valeurs: [I("0", "50"), N(0, 50), "\\{0\\,;10\\,;\\ldots\\,;50\\}"], raison: "Une hauteur exacte peut prendre toutes les valeurs réelles d'un intervalle : X est continue." },
];

export interface Exercice114 {
  nature: Nature114;
  situation: string;
  /** Ordre d'affichage des trois ensembles (indices dans `valeurs`). */
  ordre: [number, number, number];
}

export const situation114 = (e: Exercice114): Situation114 => SITUATIONS_114.find((s) => s.id === e.situation)!;

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;

export function tirer114(nature: Nature114): Exercice114 {
  const s = parmi(SITUATIONS_114.filter((x) => x.nature === nature));
  const ordres: [number, number, number][] = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ];
  return { nature, situation: s.id, ordre: parmi(ordres) };
}
