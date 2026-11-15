import type { ExerciceTransformationDonnees, FormeTransformation } from "../core/transformationDonnees.types";

/**
 * Contextes de gen108 (« Effet d'une transformation des données ») : UNE seule source pour les
 * plages de nombres (générateur) et les mots du récit (écran ET papier). Les phrases ne nomment
 * jamais a ni b : c'est l'élève qui traduit « prime de 50 € », « hausse de 3 % », « on multiplie
 * par 1,8 puis on ajoute 32 », « points manquants »… en y = a·x + b.
 *
 * Tout le hasard passe par `Math.random` (graine de `genererAvecCode` pour le QR code).
 */

/** [min, max, pas] — la valeur tirée est min + k·pas. */
export type Plage = [number, number, number];

export interface ParametresSerie {
  moyenne: Plage;
  ecartType: Plage;
  /** Pas de la médiane (0,5 pour des données entières : la médiane peut tomber entre deux). */
  pasMediane: number;
  pasEtendue: number;
  /** Bornes plausibles des données (notes entre 0 et 20…) : x̄ ± 0,55·étendue doit y tenir. */
  min?: number;
  max?: number;
}

export interface Coefficients {
  a: number;
  b: number;
  pourcentage: number | null;
  constante: number | null;
}

export interface ContexteTransformation {
  id: string;
  forme: FormeTransformation;
  n: [number, number];
  serie: ParametresSerie;
  coefficients: () => Coefficients;
  /** Unité des données de départ et de la nouvelle série (variance : unité au carré). */
  uniteX: string;
  uniteY: string;
  /** Une donnée (« salaire », « note »…), pour « à chaque salaire ». */
  singulier: string;
  /** x et y, pour la consigne de l'écran 1 (« le salaire de départ, en € »). */
  descX: string;
  descY: string;
  /** Changement d'unité ou d'échelle (forme `facteur`) : « dans une autre unité »… */
  motUnite?: string;
  /** Forme `facteur` : l'équivalence qui donne a (« 1 h = 60 min »). */
  equivalence?: (e: ExerciceTransformationDonnees) => string;
  /** Population étudiée (première phrase du récit). */
  population: (n: number) => string;
  /** La transformation, avec les mots du contexte. */
  transformation: (e: ExerciceTransformationDonnees) => string;
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

/** Nombre en texte (virgule décimale, espace fine pour les milliers à partir de 10 000). */
export function nombreTexteFr(valeur: number): string {
  const v = Math.round(valeur * 1e9) / 1e9;
  const signe = v < 0 ? "−" : "";
  const [entiere, decimale] = String(Math.abs(v)).split(".");
  const groupee = entiere!.length > 4 ? entiere!.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : entiere!;
  return `${signe}${groupee}${decimale ? "," + decimale : ""}`;
}

/** Coefficient d'un pourcentage : 1 ± t/100 (t signé). */
function depuisPourcentage(t: number): number {
  return Math.round((1 + t / 100) * 1e9) / 1e9;
}

const pc = (e: ExerciceTransformationDonnees) => nombreTexteFr(Math.abs(e.pourcentage!));
const cst = (e: ExerciceTransformationDonnees) => nombreTexteFr(Math.abs(e.constante!));
const bAbs = (e: ExerciceTransformationDonnees) => nombreTexteFr(Math.abs(e.b));
const aTxt = (e: ExerciceTransformationDonnees) => nombreTexteFr(e.a);

const SALAIRES: ParametresSerie = { moyenne: [1750, 2600, 5], ecartType: [90, 320, 10], pasMediane: 5, pasEtendue: 10 };
const NOTES_20: ParametresSerie = { moyenne: [8.5, 12.5, 0.1], ecartType: [1.8, 3.4, 0.1], pasMediane: 0.5, pasEtendue: 0.5, min: 0, max: 20 };
const TEMPERATURES: ParametresSerie = { moyenne: [6, 24, 0.1], ecartType: [1.5, 5, 0.1], pasMediane: 0.1, pasEtendue: 0.1 };
const PRIX: ParametresSerie = { moyenne: [20, 70, 0.5], ecartType: [4, 18, 0.5], pasMediane: 0.5, pasEtendue: 1, min: 2 };

export const CONTEXTES: ContexteTransformation[] = [
  // ------------------------------------------------------------------ constante : y = x + b
  {
    id: "prime",
    forme: "constante",
    n: [12, 40],
    serie: SALAIRES,
    coefficients: () => ({ a: 1, b: choisir([40, 50, 60, 75, 80, 100, 120, 150]), pourcentage: null, constante: null }),
    uniteX: "€",
    uniteY: "€",
    singulier: "salaire",
    descX: "le salaire de départ (en €)",
    descY: "le salaire avec la prime (en €)",
    population: (n) => `On a étudié les salaires mensuels nets des ${n} employés d'une PME.`,
    transformation: (e) => `Le patron accorde à chaque employé une prime de ${bAbs(e)} € par mois.`,
  },
  {
    id: "bonus-notes",
    forme: "constante",
    n: [18, 28],
    serie: { ...NOTES_20, max: 18 },
    coefficients: () => ({ a: 1, b: choisir([1, 1.5, 2]), pourcentage: null, constante: null }),
    uniteX: "points",
    uniteY: "points",
    singulier: "note",
    descX: "la note de départ (en points)",
    descY: "la note corrigée (en points)",
    population: (n) => `On a étudié les notes sur 20 des ${n} élèves d'une classe à un contrôle.`,
    transformation: (e) => `Une question était mal posée : le professeur ajoute ${bAbs(e)} point${Math.abs(e.b) >= 2 ? "s" : ""} à chaque copie.`,
  },
  {
    id: "thermometre",
    forme: "constante",
    n: [10, 31],
    serie: TEMPERATURES,
    coefficients: () => ({ a: 1, b: choisir([-0.5, -1, -1.5, -2]), pourcentage: null, constante: null }),
    uniteX: "°C",
    uniteY: "°C",
    singulier: "température",
    descX: "la température relevée (en °C)",
    descY: "la température corrigée (en °C)",
    population: (n) => `Une station météo a relevé la température à midi pendant ${n} jours.`,
    transformation: (e) => `On découvre que le thermomètre indiquait ${bAbs(e)} °C de trop : on corrige chaque relevé en lui retirant ${bAbs(e)} °C.`,
  },
  {
    id: "ages",
    forme: "constante",
    n: [15, 40],
    serie: { moyenne: [16, 45, 0.1], ecartType: [3, 12, 0.1], pasMediane: 0.5, pasEtendue: 1, min: 8 },
    coefficients: () => ({ a: 1, b: choisir([3, 4, 5, 10]), pourcentage: null, constante: null }),
    uniteX: "ans",
    uniteY: "ans",
    singulier: "âge",
    descX: "l'âge aujourd'hui (en ans)",
    descY: `l'âge dans quelques années (en ans)`,
    population: (n) => `On a étudié les âges des ${n} membres d'un club de théâtre.`,
    transformation: (e) => `Quels seront les âges de ces membres dans ${bAbs(e)} ans ?`,
  },
  {
    id: "kelvin",
    forme: "constante",
    n: [8, 20],
    serie: { moyenne: [15, 40, 0.1], ecartType: [0.5, 3, 0.1], pasMediane: 0.1, pasEtendue: 0.1 },
    coefficients: () => ({ a: 1, b: 273.15, pourcentage: null, constante: null }),
    uniteX: "°C",
    uniteY: "K",
    singulier: "température",
    descX: "la température en degrés Celsius",
    descY: "la température en kelvins",
    population: (n) => `Pendant une expérience de chimie, on a mesuré ${n} fois la température d'une solution, en degrés Celsius.`,
    transformation: () => "Le compte rendu doit donner les températures en kelvins (K) : pour convertir, on ajoute 273,15 à la température en degrés Celsius.",
  },
  {
    id: "chaussures",
    forme: "constante",
    n: [18, 28],
    serie: { moyenne: [152, 172, 0.1], ecartType: [4, 9, 0.1], pasMediane: 0.5, pasEtendue: 1 },
    coefficients: () => ({ a: 1, b: choisir([-2, -3]), pourcentage: null, constante: null }),
    uniteX: "cm",
    uniteY: "cm",
    singulier: "taille",
    descX: "la taille mesurée avec les chaussures (en cm)",
    descY: "la taille sans les chaussures (en cm)",
    population: (n) => `On a mesuré la taille des ${n} élèves d'une classe… sans leur faire enlever leurs chaussures.`,
    transformation: (e) => `Les semelles mesurent ${bAbs(e)} cm : on corrige chaque mesure en lui retirant ${bAbs(e)} cm.`,
  },
  // ------------------------------------------------------------------ pourcentage : y = (1 ± t/100)·x
  {
    id: "hausse-salaires",
    forme: "pourcentage",
    n: [12, 40],
    serie: SALAIRES,
    coefficients: () => {
      const t = choisir([2, 3, 4, 5]);
      return { a: depuisPourcentage(t), b: 0, pourcentage: t, constante: null };
    },
    uniteX: "€",
    uniteY: "€",
    singulier: "salaire",
    descX: "le salaire avant la hausse (en €)",
    descY: "le salaire après la hausse (en €)",
    population: (n) => `On a étudié les salaires mensuels nets des ${n} employés d'une entreprise.`,
    transformation: (e) => `Un accord prévoit une hausse de ${pc(e)} % de tous les salaires.`,
  },
  {
    id: "loyers",
    forme: "pourcentage",
    n: [8, 24],
    serie: { moyenne: [650, 1100, 5], ecartType: [60, 200, 10], pasMediane: 5, pasEtendue: 10 },
    coefficients: () => {
      const t = choisir([2, 3, 4]);
      return { a: depuisPourcentage(t), b: 0, pourcentage: t, constante: null };
    },
    uniteX: "€",
    uniteY: "€",
    singulier: "loyer",
    descX: "le loyer avant l'indexation (en €)",
    descY: "le loyer après l'indexation (en €)",
    population: (n) => `On a étudié les loyers mensuels des ${n} appartements d'un immeuble.`,
    transformation: (e) => `Le propriétaire indexe tous les loyers : chacun augmente de ${pc(e)} %.`,
  },
  {
    id: "soldes",
    forme: "pourcentage",
    n: [15, 40],
    serie: PRIX,
    coefficients: () => {
      const t = choisir([-20, -30, -40, -50]);
      return { a: depuisPourcentage(t), b: 0, pourcentage: t, constante: null };
    },
    uniteX: "€",
    uniteY: "€",
    singulier: "prix",
    descX: "le prix avant les soldes (en €)",
    descY: "le prix soldé (en €)",
    population: (n) => `On a étudié les prix des ${n} articles du rayon « sport » d'un magasin.`,
    transformation: (e) => `Pendant les soldes, tous les prix du rayon baissent de ${pc(e)} %.`,
  },
  // ------------------------------------------------------------------ facteur : changement d'unité
  {
    id: "heures-minutes",
    forme: "facteur",
    n: [15, 30],
    serie: { moyenne: [0.35, 1.2, 0.05], ecartType: [0.1, 0.4, 0.05], pasMediane: 0.05, pasEtendue: 0.05 },
    coefficients: () => ({ a: 60, b: 0, pourcentage: null, constante: null }),
    uniteX: "h",
    uniteY: "min",
    singulier: "durée",
    descX: "la durée en heures",
    descY: "la durée en minutes",
    motUnite: "dans une autre unité",
    equivalence: () => "1 h = 60 min",
    population: (n) => `On a demandé à ${n} élèves la durée de leur trajet entre la maison et l'école, en heures.`,
    transformation: () => "Pour l'affiche du conseil des élèves, on veut toutes ces durées en minutes.",
  },
  {
    id: "km-m",
    forme: "facteur",
    n: [10, 25],
    serie: { moyenne: [3, 12, 0.1], ecartType: [0.6, 3, 0.1], pasMediane: 0.1, pasEtendue: 0.1, min: 0.5 },
    coefficients: () => ({ a: 1000, b: 0, pourcentage: null, constante: null }),
    uniteX: "km",
    uniteY: "m",
    singulier: "distance",
    descX: "la distance en kilomètres",
    descY: "la distance en mètres",
    motUnite: "dans une autre unité",
    equivalence: () => "1 km = 1 000 m",
    population: (n) => `Un entraîneur a noté les distances parcourues par ${n} coureurs pendant un entraînement, en kilomètres.`,
    transformation: () => "Sa montre connectée affiche les distances en mètres : il convertit toutes les distances en mètres.",
  },
  {
    id: "grammes-kg",
    forme: "facteur",
    n: [10, 30],
    serie: { moyenne: [800, 4000, 10], ecartType: [100, 900, 10], pasMediane: 10, pasEtendue: 10, min: 100 },
    coefficients: () => ({ a: 0.001, b: 0, pourcentage: null, constante: null }),
    uniteX: "g",
    uniteY: "kg",
    singulier: "masse",
    descX: "la masse en grammes",
    descY: "la masse en kilogrammes",
    motUnite: "dans une autre unité",
    equivalence: () => "1 g = 0,001 kg",
    population: (n) => `Un service de livraison a pesé ${n} colis, en grammes.`,
    transformation: () => "Le transporteur demande les masses en kilogrammes : on convertit toutes les masses en kilogrammes.",
  },
  {
    id: "devise",
    forme: "facteur",
    n: [10, 25],
    serie: PRIX,
    coefficients: () => ({ a: choisir([1.1, 1.2]), b: 0, pourcentage: null, constante: null }),
    uniteX: "€",
    uniteY: "$",
    singulier: "prix",
    descX: "le prix en euros",
    descY: "le prix en dollars",
    motUnite: "dans une autre monnaie",
    equivalence: (e) => `1 € = ${aTxt(e)} $`,
    population: (n) => `Un site de vente a relevé les prix de ${n} jeux vidéo, en euros.`,
    transformation: (e) => `Pour ses clients américains, il affiche les prix en dollars : ce jour-là, 1 € vaut ${aTxt(e)} $.`,
  },
  {
    id: "notes-sur-10",
    forme: "facteur",
    n: [18, 28],
    serie: { moyenne: [4.5, 7.5, 0.1], ecartType: [0.9, 1.8, 0.1], pasMediane: 0.5, pasEtendue: 0.5, min: 0, max: 10 },
    coefficients: () => ({ a: 2, b: 0, pourcentage: null, constante: null }),
    uniteX: "points",
    uniteY: "points",
    singulier: "note",
    descX: "la note sur 10",
    descY: "la note sur 20",
    motUnite: "sur une autre échelle",
    equivalence: () => "une note sur 20 vaut le double de la note sur 10",
    population: (n) => `On a étudié les notes sur 10 des ${n} élèves d'une classe à une interrogation.`,
    transformation: () => "Pour le bulletin, le professeur ramène toutes ces notes sur 20.",
  },
  // ------------------------------------------------------------------ affine directe : y = a·x + b
  {
    id: "fahrenheit",
    forme: "direct",
    n: [10, 31],
    serie: TEMPERATURES,
    coefficients: () => ({ a: 1.8, b: 32, pourcentage: null, constante: null }),
    uniteX: "°C",
    uniteY: "°F",
    singulier: "température",
    descX: "la température en degrés Celsius",
    descY: "la température en degrés Fahrenheit",
    population: (n) => `Une station météo belge a relevé la température à midi pendant ${n} jours, en degrés Celsius.`,
    transformation: () => "Une correspondante américaine veut ces températures en degrés Fahrenheit : pour convertir, on multiplie la température en degrés Celsius par 1,8, puis on ajoute 32.",
  },
  {
    id: "taxi",
    forme: "direct",
    n: [10, 25],
    serie: { moyenne: [4, 18, 0.1], ecartType: [1.5, 6, 0.1], pasMediane: 0.1, pasEtendue: 0.1, min: 0.5 },
    coefficients: () => {
      const [a, b] = choisir([[2, 3], [2, 4], [1.5, 3], [2.5, 2]] as const);
      return { a, b, pourcentage: null, constante: null };
    },
    uniteX: "km",
    uniteY: "€",
    singulier: "course",
    descX: "la distance de la course (en km)",
    descY: "le prix de la course (en €)",
    population: (n) => `Un chauffeur de taxi a noté les distances de ses ${n} courses d'une journée, en kilomètres.`,
    transformation: (e) => `Le prix d'une course est de ${bAbs(e)} € de prise en charge, plus ${aTxt(e)} € par kilomètre parcouru.`,
  },
  {
    id: "notes-cent-bonus",
    forme: "direct",
    n: [18, 28],
    serie: { ...NOTES_20, max: 19 },
    coefficients: () => ({ a: 5, b: choisir([2, 3, 4, 5]), pourcentage: null, constante: null }),
    uniteX: "points",
    uniteY: "points",
    singulier: "note",
    descX: "la note sur 20",
    descY: "la note finale sur 100",
    population: (n) => `On a étudié les notes sur 20 des ${n} élèves d'une classe à un examen.`,
    transformation: (e) => `L'école note sur 100 : le professeur multiplie chaque note par 5, puis ajoute à chaque élève ${bAbs(e)} points de bonus pour un travail de groupe.`,
  },
  {
    id: "hausse-puis-prime",
    forme: "direct",
    n: [12, 40],
    serie: SALAIRES,
    coefficients: () => {
      const t = choisir([2, 3]);
      const c = choisir([20, 30, 50]);
      return { a: depuisPourcentage(t), b: c, pourcentage: t, constante: c };
    },
    uniteX: "€",
    uniteY: "€",
    singulier: "salaire",
    descX: "le salaire de départ (en €)",
    descY: "le nouveau salaire (en €)",
    population: (n) => `On a étudié les salaires mensuels nets des ${n} employés d'une entreprise.`,
    transformation: (e) => `Tous les salaires augmentent de ${pc(e)} %, puis chaque employé reçoit en plus une prime de ${cst(e)} € par mois.`,
  },
  {
    id: "devise-frais",
    forme: "direct",
    n: [10, 25],
    serie: PRIX,
    coefficients: () => ({ a: choisir([1.1, 1.2]), b: choisir([3, 4, 5]), pourcentage: null, constante: null }),
    uniteX: "€",
    uniteY: "$",
    singulier: "prix",
    descX: "le prix en euros",
    descY: "le prix payé en dollars",
    population: (n) => `Un site de vente a relevé les prix de ${n} jeux de société, en euros.`,
    transformation: (e) => `Un client américain paie en dollars : on convertit chaque prix (1 € vaut ${aTxt(e)} $), puis on ajoute ${bAbs(e)} $ de frais de livraison.`,
  },
  // ------------------------------------------------------------------ affine, constante AVANT : y = a·(x + c)
  {
    id: "bonus-puis-cent",
    forme: "avant",
    n: [18, 28],
    serie: { ...NOTES_20, max: 17.5 },
    coefficients: () => {
      const c = choisir([1, 1.5, 2]);
      return { a: 5, b: 5 * c, pourcentage: null, constante: c };
    },
    uniteX: "points",
    uniteY: "points",
    singulier: "note",
    descX: "la note sur 20 avant le bonus",
    descY: "la note finale sur 100",
    population: (n) => `On a étudié les notes sur 20 des ${n} élèves d'une classe à un examen.`,
    transformation: (e) => `Le professeur ajoute d'abord ${cst(e)} point${e.constante! >= 2 ? "s" : ""} à chaque copie (une question était trop difficile), puis il ramène toutes les notes sur 100 en les multipliant par 5.`,
  },
  {
    id: "prime-puis-hausse",
    forme: "avant",
    n: [12, 40],
    serie: SALAIRES,
    coefficients: () => {
      const t = choisir([2, 3]);
      const c = choisir([50, 100]);
      const a = depuisPourcentage(t);
      return { a, b: Math.round(a * c * 1e9) / 1e9, pourcentage: t, constante: c };
    },
    uniteX: "€",
    uniteY: "€",
    singulier: "salaire",
    descX: "le salaire de départ (en €)",
    descY: "le nouveau salaire (en €)",
    population: (n) => `On a étudié les salaires mensuels nets des ${n} employés d'une entreprise.`,
    transformation: (e) => `Chaque employé reçoit d'abord une prime fixe de ${cst(e)} € par mois ; ensuite, tous les salaires, prime comprise, augmentent de ${pc(e)} %.`,
  },
  {
    id: "frais-puis-devise",
    forme: "avant",
    n: [10, 25],
    serie: PRIX,
    coefficients: () => {
      const a = choisir([1.1, 1.2]);
      const c = choisir([2, 3, 5]);
      return { a, b: Math.round(a * c * 1e9) / 1e9, pourcentage: null, constante: c };
    },
    uniteX: "€",
    uniteY: "$",
    singulier: "prix",
    descX: "le prix en euros sans les frais",
    descY: "le prix payé en dollars",
    population: (n) => `Un site de vente a relevé les prix de ${n} livres, en euros.`,
    transformation: (e) => `Pour un client américain, on ajoute d'abord ${cst(e)} € de frais d'emballage à chaque prix, puis on convertit le total en dollars (1 € vaut ${aTxt(e)} $).`,
  },
  // ------------------------------------------------------------------ affine, a = −1 : y = b − x
  {
    id: "points-manquants",
    forme: "negatif",
    n: [18, 28],
    serie: NOTES_20,
    coefficients: () => ({ a: -1, b: 20, pourcentage: null, constante: null }),
    uniteX: "points",
    uniteY: "points",
    singulier: "note",
    descX: "la note sur 20",
    descY: "le nombre de points manquants",
    population: (n) => `On a étudié les notes sur 20 des ${n} élèves d'une classe à un contrôle.`,
    transformation: () => "Pour préparer la remédiation, le professeur s'intéresse plutôt au nombre de points qui ont manqué à chaque élève pour obtenir 20/20.",
  },
  {
    id: "minutes-restantes",
    forme: "negatif",
    n: [20, 60],
    serie: { moyenne: [32, 58, 0.1], ecartType: [12, 22, 0.1], pasMediane: 0.5, pasEtendue: 1, min: 1, max: 90 },
    coefficients: () => ({ a: -1, b: 90, pourcentage: null, constante: null }),
    uniteX: "min",
    uniteY: "min",
    singulier: "but",
    descX: "la minute à laquelle le but a été marqué",
    descY: "le temps restant avant la fin du match (en min)",
    population: (n) => `Lors d'un tournoi de football (matchs de 90 minutes, sans prolongation), on a noté la minute à laquelle chacun des ${n} buts a été marqué.`,
    transformation: () => "Un journaliste s'intéresse plutôt au temps qu'il restait à jouer, en minutes, au moment de chaque but.",
  },
];

export function contexteParId(id: string): ContexteTransformation {
  return CONTEXTES.find((c) => c.id === id)!;
}
