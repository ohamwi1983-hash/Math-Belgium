import type { Pt } from "./stat2vLotH1";
import { arrondi, entier, melanger, normale, parmi } from "./stat2vLotH1";

/**
 * Contextes du lot H1 du 5e ch. 6 : séries « réalistes » (contextes du document du professeur, nombres
 * RECALCULÉS : y = a·x + b + bruit, arrondis à la précision du relevé) et libellés des petites séries
 * conçues pour le calcul à la main. Seule donnée publique reprise telle quelle : l'espérance de vie à la
 * naissance en Belgique de 2000 à 2014 (Banque mondiale, comme le document).
 */

export interface ContexteSerie {
  id: string;
  /** Phrase d'énoncé (sans le tableau), terminée par un point. */
  phrase: string;
  /** En-têtes du tableau (texte brut, indice Unicode). */
  ent: { x: string; y: string };
  /** Titres des axes du nuage. */
  titreX: string;
  titreY: string;
  /** Décimales des relevés. */
  dx: number;
  dy: number;
  /** Prévision : « Estime … ». */
  questionY: (x0: string) => string;
  questionX: (y0: string) => string;
  /** Unité de la réponse (texte), facultative. */
  uniteY?: string;
  uniteX?: string;
  /** Abscisses possibles (triées) et modèle. */
  abscisses: () => number[];
  modele: { a: number; b: number; bruit: number };
  /** Données réelles fixes (espérance de vie) : remplace le modèle. */
  reelles?: Pt[];
}

const pas = (debut: number, fin: number, p: number): number[] => {
  const out: number[] = [];
  for (let v = debut; v <= fin + 1e-9; v += p) out.push(arrondi(v, 6));
  return out;
};
/** n abscisses distinctes tirées dans une liste, triées. */
export const tirerAbscisses = (liste: number[], n: number): number[] => melanger(liste).slice(0, n).sort((a, b) => a - b);

export const ESPERANCE_VIE_BELGIQUE: Pt[] = [
  { x: 2000, y: 77.72 },
  { x: 2002, y: 78.08 },
  { x: 2004, y: 78.88 },
  { x: 2006, y: 79.38 },
  { x: 2008, y: 79.68 },
  { x: 2010, y: 80.18 },
  { x: 2012, y: 80.39 },
  { x: 2014, y: 80.59 },
];

export const CONTEXTES_REELS: ContexteSerie[] = [
  {
    id: "puissance",
    phrase: "On a relevé la consommation d'essence y (en litres aux 100 km) de voitures neuves en fonction de leur puissance x (en chevaux, CV).",
    ent: { x: "Puissance xᵢ (CV)", y: "Consommation yᵢ (L/100 km)" },
    titreX: "Puissance (CV)",
    titreY: "Consommation (L/100 km)",
    dx: 0,
    dy: 1,
    questionY: (x0) => `Estime la consommation d'une voiture neuve de ${x0} CV.`,
    questionX: (y0) => `Estime la puissance d'une voiture qui consomme ${y0} litres aux 100 km.`,
    uniteY: "L/100 km",
    uniteX: "CV",
    abscisses: () => pas(70, 200, 5),
    modele: { a: 0.026, b: 2.8, bruit: 0.15 },
  },
  {
    id: "tension",
    phrase: "On a relevé la tension artérielle moyenne y (en cmHg) de femmes adultes en fonction de leur âge x (en années).",
    ent: { x: "Âge xᵢ (ans)", y: "Tension yᵢ (cmHg)" },
    titreX: "Âge (ans)",
    titreY: "Tension (cmHg)",
    dx: 0,
    dy: 1,
    questionY: (x0) => `Estime la tension artérielle moyenne d'une femme de ${x0} ans.`,
    questionX: (y0) => `Estime l'âge pour lequel la tension artérielle moyenne vaut ${y0} cmHg.`,
    uniteY: "cmHg",
    uniteX: "ans",
    abscisses: () => pas(30, 72, 2),
    modele: { a: 0.1, b: 8.6, bruit: 0.3 },
  },
  {
    id: "dilatation",
    phrase: "On chauffe une barre de métal et on mesure son allongement y (en mm) selon la température x (en °C).",
    ent: { x: "Température xᵢ (°C)", y: "Allongement yᵢ (mm)" },
    titreX: "Température (°C)",
    titreY: "Allongement (mm)",
    dx: 0,
    dy: 1,
    questionY: (x0) => `Estime l'allongement de la barre à ${x0} °C.`,
    questionX: (y0) => `Estime la température pour laquelle l'allongement vaut ${y0} mm.`,
    uniteY: "mm",
    uniteX: "°C",
    abscisses: () => pas(40, 220, 20),
    modele: { a: 0.14, b: -3.2, bruit: 0.3 },
  },
  {
    id: "pieces",
    phrase: "Une machine se dérègle au fil du temps : on relève chaque semaine x le pourcentage y de pièces défectueuses qu'elle produit.",
    ent: { x: "Semaine xᵢ", y: "Pièces défectueuses yᵢ (%)" },
    titreX: "Semaine",
    titreY: "Pièces défectueuses (%)",
    dx: 0,
    dy: 1,
    questionY: (x0) => `Estime le pourcentage de pièces défectueuses la semaine ${x0}.`,
    questionX: (y0) => `Estime la semaine où le pourcentage de pièces défectueuses atteindra ${y0} %.`,
    uniteY: "%",
    abscisses: () => pas(1, 12, 1),
    modele: { a: 0.33, b: 0.4, bruit: 0.18 },
  },
  {
    id: "grue",
    phrase: "Pour un même type de grue, on a relevé la charge maximale y (en tonnes) que la grue peut lever selon la longueur x de sa flèche (en mètres).",
    ent: { x: "Longueur xᵢ (m)", y: "Charge yᵢ (t)" },
    titreX: "Longueur de la flèche (m)",
    titreY: "Charge maximale (t)",
    dx: 0,
    dy: 1,
    questionY: (x0) => `Estime la charge maximale d'une grue dont la flèche mesure ${x0} m.`,
    questionX: (y0) => `Estime la longueur de flèche d'une grue qui lève au maximum ${y0} tonnes.`,
    uniteY: "t",
    uniteX: "m",
    abscisses: () => pas(20, 60, 5),
    modele: { a: -0.12, b: 9.4, bruit: 0.2 },
  },
  {
    id: "cinema",
    phrase: "Un comité culturel a demandé à des parents le prix maximal qu'ils paieraient pour une place de cinéma : y est le nombre de parents prêts à payer le prix x (en euros).",
    ent: { x: "Prix xᵢ (euros)", y: "Nombre de parents yᵢ" },
    titreX: "Prix (euros)",
    titreY: "Nombre de parents",
    dx: 1,
    dy: 0,
    questionY: (x0) => `Estime le nombre de parents prêts à payer ${x0} euros.`,
    questionX: (y0) => `Estime le prix que ${y0} parents seraient prêts à payer.`,
    uniteX: "euros",
    abscisses: () => pas(2, 10, 0.5),
    modele: { a: -3.1, b: 31, bruit: 1 },
  },
  {
    id: "esperance",
    phrase: "Le tableau donne l'espérance de vie à la naissance y (en années) en Belgique, où x est le nombre d'années écoulées depuis 2000 (source : Banque mondiale).",
    ent: { x: "Années depuis 2000 xᵢ", y: "Espérance de vie yᵢ (ans)" },
    titreX: "Années depuis 2000",
    titreY: "Espérance de vie (ans)",
    dx: 0,
    dy: 2,
    questionY: (x0) => `Estime l'espérance de vie à la naissance d'une personne née en ${2000 + Number(x0)}.`,
    questionX: (y0) => `Estime l'année de naissance d'une personne dont l'espérance de vie est de ${y0} ans.`,
    uniteY: "ans",
    abscisses: () => ESPERANCE_VIE_BELGIQUE.map((p) => p.x - 2000),
    modele: { a: 0.2, b: 77.9, bruit: 0 },
    reelles: ESPERANCE_VIE_BELGIQUE.map((p) => ({ x: p.x - 2000, y: p.y })),
  },
];

/** Série tirée d'un contexte : n abscisses distinctes, y = ax + b + bruit arrondi à `dy` (jamais négatif). */
export function serieDuContexte(c: ContexteSerie, n: number): Pt[] {
  if (c.reelles) return c.reelles.map((p) => ({ ...p }));
  for (;;) {
    const x = tirerAbscisses(c.abscisses(), n);
    const pts = x.map((v) => ({ x: v, y: arrondi(c.modele.a * v + c.modele.b + c.modele.bruit * normale(), c.dy) }));
    if (pts.some((p) => p.y <= 0)) continue;
    if (new Set(pts.map((p) => p.y)).size < Math.min(n, 4)) continue;
    return pts;
  }
}

/** Libellés des PETITES séries (calcul à la main) : x entier dans [xMin ; xMax]. */
export interface ContextePetit {
  id: string;
  phrase: string;
  ent: { x: string; y: string };
  titreX: string;
  titreY: string;
  xMin: number;
  xMax: number;
  /** ȳ visé et pente typique (signe compris). */
  yMoyen: [number, number];
  pentes: number[];
  questionY: (x0: string) => string;
}

export const CONTEXTES_PETITS: ContextePetit[] = [
  {
    id: "revision",
    phrase: "On a relevé, pour quelques élèves, le nombre d'heures de révision x et la note y obtenue à l'interrogation (sur 20).",
    ent: { x: "Heures de révision xᵢ", y: "Note yᵢ" },
    titreX: "Heures de révision",
    titreY: "Note (sur 20)",
    xMin: 1,
    xMax: 9,
    yMoyen: [10, 14],
    pentes: [0.6, 0.8, 1.2, 1.4, 1.5],
    questionY: (x0) => `Estime la note d'un élève qui révise ${x0} heures.`,
  },
  {
    id: "publicite",
    phrase: "Une entreprise compare chaque mois son budget de publicité x (en centaines d'euros) et ses ventes y (en milliers d'euros).",
    ent: { x: "Publicité xᵢ", y: "Ventes yᵢ" },
    titreX: "Publicité (centaines d'euros)",
    titreY: "Ventes (milliers d'euros)",
    xMin: 1,
    xMax: 10,
    yMoyen: [12, 20],
    pentes: [0.8, 1.2, 1.5, 2, 2.4],
    questionY: (x0) => `Estime les ventes d'un mois avec un budget de publicité de ${x0} centaines d'euros.`,
  },
  {
    id: "abonnements",
    phrase: "Une salle de sport a relevé le nombre de nouveaux abonnés y (en dizaines) selon le prix du forfait x (en dizaines d'euros).",
    ent: { x: "Prix xᵢ", y: "Abonnés yᵢ" },
    titreX: "Prix (dizaines d'euros)",
    titreY: "Abonnés (dizaines)",
    xMin: 2,
    xMax: 11,
    yMoyen: [8, 14],
    pentes: [-0.6, -0.8, -1.2, -1.4],
    questionY: (x0) => `Estime le nombre de nouveaux abonnés pour un forfait de ${x0} dizaines d'euros.`,
  },
  {
    id: "generique",
    phrase: "On considère la série statistique à deux variables suivante.",
    ent: { x: "xᵢ", y: "yᵢ" },
    titreX: "x",
    titreY: "y",
    xMin: 0,
    xMax: 10,
    yMoyen: [3, 9],
    pentes: [0.4, 0.6, -0.4, -0.6, 0.8, -0.8, 1.2, -1.2],
    questionY: (x0) => `Estime la valeur de y lorsque x vaut ${x0}.`,
  },
];

export const contextePetit = (): ContextePetit => parmi(CONTEXTES_PETITS);
export const contexteReel = (sansEsperance = false): ContexteSerie => parmi(CONTEXTES_REELS.filter((c) => !sansEsperance || !c.reelles));
export const entierEntre = entier;
