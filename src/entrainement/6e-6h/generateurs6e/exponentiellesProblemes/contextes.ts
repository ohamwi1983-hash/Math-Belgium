/**
 * Couche A (6e) — bassins de contextes narratifs pour `6gen12`, un bassin par famille (A à G),
 * même patron que `generateurs5e/suiteRecurrenteAffine/contextes.ts` : chaque entrée porte un
 * `id` (résolution ui→génération), un `label` court (sélecteur dev), et une fonction `phrase(...)`
 * qui assemble l'énoncé contextualisé complet à partir des seules valeurs numériques nécessaires à
 * CETTE famille (jamais un format générique unique — chaque famille a sa propre trame narrative).
 *
 * **Familles A et C portent un `direction`** (`"croissance"|"decroissance"`) : le sens
 * croissance/décroissance est tiré à la génération (voir `familles/A.ts`/`familles/C.ts`), puis le
 * contexte est choisi PARMI CEUX qui correspondent à ce sens — jamais l'inverse (éviter un contexte
 * "population" présenté comme décroissante ou un "véhicule qui se déprécie" présenté comme
 * croissant). Même principe pour **famille D**, avec un `signe` (`"haut"|"bas"`) correspondant au
 * signe de `C` (positif=approche la stabilisation par le haut, négatif=par le bas).
 */

/** Décimal FRANÇAIS (virgule) pour un nombre interpolé dans une phrase en PROSE (jamais de LaTeX
 * ici, contrairement à `formatDecimal` de `ui6e/formatExponentiellesProblemes.ts`) — nécessaire
 * dès qu'un argument de `phrase(...)` peut être décimal (ex. `v2Affiche`, `sAffiche`, `g`) : sans
 * cette conversion un nombre JS comme 9.9 s'afficherait "9.9" (point anglais) au milieu d'une
 * phrase française. Les arguments toujours entiers (Q0, p, t1, t2, T, k, d, N, F, V, n1, n2...)
 * n'en ont pas besoin, mais l'appliquer systématiquement ne change rien pour un entier. */
function fr(v: number): string {
  return String(v).replace(".", ",");
}

// ============================================================================
// Famille A — sous-type "évaluer" (croissance/décroissance en pourcentage constant).
// ============================================================================

export interface ContexteExpoProbAEvaluer {
  id: string;
  label: string;
  direction: "croissance" | "decroissance";
  unite: string;
  phrase: (Q0: number, p: number) => string;
}

export const CONTEXTES_A_EVALUER: ContexteExpoProbAEvaluer[] = [
  {
    id: "population",
    label: "Population d'une ville",
    direction: "croissance",
    unite: "ans",
    phrase: (Q0, p) => `Une ville compte actuellement ${Q0} habitants. Sa population augmente de ${p} % chaque année.`,
  },
  {
    id: "placement",
    label: "Placement financier",
    direction: "croissance",
    unite: "ans",
    phrase: (Q0, p) => `Un capital de ${Q0} € est placé sur un compte qui rapporte ${p} % d'intérêts composés chaque année.`,
  },
  {
    id: "bacteries",
    label: "Culture de bactéries",
    direction: "croissance",
    unite: "heures",
    phrase: (Q0, p) => `Une culture de bactéries compte ${Q0} individus. Elle croît de ${p} % chaque heure.`,
  },
  {
    id: "vehicule",
    label: "Dépréciation d'un véhicule",
    direction: "decroissance",
    unite: "ans",
    phrase: (Q0, p) => `Une voiture neuve vaut ${Q0} €. Sa valeur diminue de ${p} % chaque année.`,
  },
  {
    id: "medicament",
    label: "Élimination d'un médicament",
    direction: "decroissance",
    unite: "heures",
    phrase: (Q0, p) => `Une dose de ${Q0} mg d'un médicament est injectée. L'organisme en élimine ${p} % chaque heure.`,
  },
];

// ============================================================================
// Famille A — sous-type "doublement/fraction" (propagation périodique).
// ============================================================================

export interface ContexteExpoProbADoublement {
  id: string;
  label: string;
  unite: string;
  phrase: (T: number) => string;
}

export const CONTEXTES_A_DOUBLEMENT: ContexteExpoProbADoublement[] = [
  {
    id: "algues",
    label: "Prolifération d'algues",
    unite: "jours",
    phrase: (T) => `Une algue envahissante double sa surface chaque jour. Elle recouvre tout l'étang (100 % de sa surface) après ${T} jours.`,
  },
  {
    id: "epidemie",
    label: "Propagation d'une épidémie",
    unite: "jours",
    phrase: (T) => `Le nombre de personnes contaminées par une épidémie double chaque jour. L'épidémie atteint son pic actuel (100 %) après ${T} jours.`,
  },
  {
    id: "rumeur",
    label: "Propagation d'une rumeur",
    unite: "heures",
    phrase: (T) => `Le nombre de personnes ayant entendu une rumeur double chaque heure. Toute l'école est au courant (100 %) après ${T} heures.`,
  },
];

// ============================================================================
// Famille B — modèle complémentaire.
// ============================================================================

export interface ContexteExpoProbB {
  id: string;
  label: string;
  unite: string;
  /** Nom de la grandeur RESTANTE (ce que `reste(t)` mesure). */
  nomReste: string;
  /** Nom de la grandeur COMPLÉMENTAIRE (ce que `complément(t)` mesure). */
  nomComplement: string;
  phrase: (Q0: number, p: number) => string;
}

export const CONTEXTES_B: ContexteExpoProbB[] = [
  {
    id: "perteDePoids",
    label: "Perte de poids",
    unite: "semaines",
    nomReste: "le poids qu'il reste à perdre",
    nomComplement: "le poids déjà perdu",
    phrase: (Q0, p) => `Une personne souhaite perdre ${Q0} kg. Chaque semaine, elle perd ${p} % du poids qu'il lui reste encore à perdre.`,
  },
  {
    id: "avancementTache",
    label: "Avancement d'une tâche",
    unite: "jours",
    nomReste: "le travail qu'il reste à faire",
    nomComplement: "le travail déjà réalisé",
    phrase: (Q0, p) => `Une tâche représente ${Q0} heures de travail. Chaque jour, ${p} % du travail restant est accompli.`,
  },
  {
    id: "remplissageReservoir",
    label: "Remplissage d'un réservoir",
    unite: "minutes",
    nomReste: "le volume qu'il reste à remplir",
    nomComplement: "le volume déjà rempli",
    phrase: (Q0, p) => `Un réservoir vide a une capacité de ${Q0} litres. Chaque minute, un système de remplissage comble ${p} % du volume qu'il reste à remplir.`,
  },
  {
    id: "apprentissageTexte",
    label: "Apprentissage d'un texte par cœur",
    unite: "jours",
    nomReste: "le nombre de mots qu'il reste à apprendre",
    nomComplement: "le nombre de mots déjà mémorisés",
    phrase: (Q0, p) => `Un texte compte ${Q0} mots à mémoriser. Chaque jour, un élève retient ${p} % des mots qu'il ne connaissait pas encore.`,
  },
];

// ============================================================================
// Famille C — modèle à 2 points, taux inconnu.
// ============================================================================

export interface ContexteExpoProbC {
  id: string;
  label: string;
  direction: "croissance" | "decroissance";
  unite: string;
  grandeur: string;
  /** Plage réaliste de `v1` POUR CE CONTEXTE (l'ordre de grandeur d'une tension en volts n'a rien
   * à voir avec celui d'une population en milliers — jamais un pool `v1` unique et générique
   * partagé par les 5 contextes, contrairement à Q0 en familles A/B où l'ordre de grandeur reste
   * comparable d'un contexte à l'autre). */
  v1Min: number;
  v1Max: number;
  phrase: (t1: number, v1: number, t2: number, v2Affiche: number) => string;
}

export const CONTEXTES_C: ContexteExpoProbC[] = [
  {
    id: "condensateur",
    label: "Décharge d'un condensateur",
    direction: "decroissance",
    unite: "secondes",
    grandeur: "la tension aux bornes du condensateur (en volts)",
    v1Min: 8,
    v1Max: 20,
    phrase: (t1, v1, t2, v2Affiche) => `Un condensateur se décharge. On mesure une tension de ${v1} V à t=${t1} s, puis de ${fr(v2Affiche)} V à t=${t2} s.`,
  },
  {
    id: "contamination",
    label: "Contamination qui diminue",
    direction: "decroissance",
    unite: "jours",
    grandeur: "le nombre de personnes encore contaminées",
    v1Min: 200,
    v1Max: 800,
    phrase: (t1, v1, t2, v2Affiche) => `Après une épidémie, le nombre de personnes contaminées diminue. On en compte ${v1} au jour ${t1}, puis ${fr(v2Affiche)} au jour ${t2}.`,
  },
  {
    id: "populationCroissante",
    label: "Population qui croît",
    direction: "croissance",
    unite: "années",
    grandeur: "la population (en milliers d'habitants)",
    v1Min: 10,
    v1Max: 100,
    phrase: (t1, v1, t2, v2Affiche) => `Une ville en expansion comptait ${v1} milliers d'habitants ${t1} ans après sa fondation, puis ${fr(v2Affiche)} milliers d'habitants ${t2} ans après sa fondation.`,
  },
  {
    id: "radioactivite",
    label: "Radioactivité résiduelle",
    direction: "decroissance",
    unite: "années",
    grandeur: "l'activité radioactive résiduelle (en becquerels)",
    v1Min: 300,
    v1Max: 1000,
    phrase: (t1, v1, t2, v2Affiche) => `L'activité d'un échantillon radioactif vaut ${v1} Bq après ${t1} ans, puis ${fr(v2Affiche)} Bq après ${t2} ans.`,
  },
  {
    id: "audienceVirale",
    label: "Audience d'une vidéo virale",
    direction: "croissance",
    unite: "jours",
    grandeur: "le nombre de vues (en milliers)",
    v1Min: 5,
    v1Max: 50,
    phrase: (t1, v1, t2, v2Affiche) => `Une vidéo devenue virale comptait ${v1} milliers de vues au jour ${t1}, puis ${fr(v2Affiche)} milliers de vues au jour ${t2}.`,
  },
];

// ============================================================================
// Famille D — asymptote non nulle.
// ============================================================================

export interface ContexteExpoProbD {
  id: string;
  label: string;
  signe: "haut" | "bas";
  unite: string;
  grandeur: string;
  phrase: (aAffiche: number, bAffiche: number, cAffiche: number, d: number) => string;
}

export const CONTEXTES_D: ContexteExpoProbD[] = [
  {
    id: "refroidissement",
    label: "Refroidissement vers la température ambiante",
    signe: "haut",
    unite: "minutes",
    grandeur: "la température (en °C)",
    phrase: (aAffiche, bAffiche, cAffiche, d) => `Une tasse de café refroidit dans une pièce. On mesure sa température : ${aAffiche} °C au début, ${bAffiche} °C après ${d} min, ${cAffiche} °C après ${2 * d} min. Elle se stabilise ensuite vers la température de la pièce.`,
  },
  {
    id: "concentrationDiminue",
    label: "Concentration d'un médicament vers un résidu stable",
    signe: "haut",
    unite: "heures",
    grandeur: "la concentration (en mg/L)",
    phrase: (aAffiche, bAffiche, cAffiche, d) => `La concentration d'un médicament dans le sang évolue : ${aAffiche} mg/L au début, ${bAffiche} mg/L après ${d} h, ${cAffiche} mg/L après ${2 * d} h, puis elle se stabilise vers un résidu constant.`,
  },
  {
    id: "vitesseLimite",
    label: "Vitesse limite d'un parachutiste",
    signe: "bas",
    unite: "secondes",
    grandeur: "la vitesse de chute (en m/s)",
    phrase: (aAffiche, bAffiche, cAffiche, d) => `Un parachutiste en chute libre accélère puis se stabilise. Sa vitesse vaut ${aAffiche} m/s au début du saut, ${bAffiche} m/s après ${d} s, ${cAffiche} m/s après ${2 * d} s, avant de tendre vers sa vitesse limite.`,
  },
  {
    id: "apprentissagePlafond",
    label: "Apprentissage qui plafonne",
    signe: "bas",
    unite: "semaines",
    grandeur: "le score au test (en %)",
    phrase: (aAffiche, bAffiche, cAffiche, d) => `Le score d'un élève à un test répété progresse puis plafonne : ${aAffiche} % au début, ${bAffiche} % après ${d} semaines, ${cAffiche} % après ${2 * d} semaines.`,
  },
];

// ============================================================================
// Famille E — optimisation.
// ============================================================================

export interface ContexteExpoProbE {
  id: string;
  label: string;
  unite: string;
  grandeur: string;
  phrase: () => string;
}

export const CONTEXTES_E: ContexteExpoProbE[] = [
  {
    id: "ventesCampagne",
    label: "Ventes suite à une campagne publicitaire",
    unite: "jours",
    grandeur: "le nombre de ventes quotidiennes (en centaines)",
    phrase: () => "Suite à une campagne publicitaire, le nombre de ventes quotidiennes d'un produit augmente d'abord, puis diminue à mesure que l'effet de la campagne s'estompe.",
  },
  {
    id: "epidemiePropagation",
    label: "Propagation d'une épidémie",
    unite: "jours",
    grandeur: "le nombre de nouveaux cas par jour (en centaines)",
    phrase: () => "Le nombre de nouveaux cas par jour d'une épidémie augmente d'abord, atteint un pic, puis diminue progressivement.",
  },
  {
    id: "concentrationSang",
    label: "Concentration d'un médicament dans le sang",
    unite: "heures",
    grandeur: "la concentration du médicament dans le sang (en mg/L)",
    phrase: () => "Après une prise orale, la concentration d'un médicament dans le sang augmente le temps de l'absorption, puis diminue à mesure que l'organisme l'élimine.",
  },
];

// ============================================================================
// Famille F — saturation donnée, coûts/revenus.
// ============================================================================

export interface ContexteExpoProbF {
  id: string;
  label: string;
  unite: string;
  phrase: (N: number, g: number, F: number, V: number) => string;
}

export const CONTEXTES_F: ContexteExpoProbF[] = [
  {
    id: "campagneReseauSocial",
    label: "Campagne publicitaire sur les réseaux sociaux",
    unite: "jours",
    phrase: (N, g, F, V) => `Une entreprise lance une campagne publicitaire visant ${N} personnes. La proportion de personnes touchées après t jours est modélisée par p(t)=1-e^(-kt). Chaque réaction positive rapporte ${fr(g)} € ; la campagne coûte ${F} € de frais fixes, plus ${V} € par jour de diffusion.`,
  },
  {
    id: "sensibilisationSante",
    label: "Campagne de sensibilisation santé publique",
    unite: "jours",
    phrase: (N, g, F, V) => `Une campagne de sensibilisation vise une population de ${N} personnes. La proportion sensibilisée après t jours suit p(t)=1-e^(-kt). Chaque personne sensibilisée fait économiser ${fr(g)} € en soins évités ; la campagne coûte ${F} € de mise en place, plus ${V} € par jour de diffusion.`,
  },
  {
    id: "lancementInfluenceurs",
    label: "Lancement produit avec influenceurs",
    unite: "jours",
    phrase: (N, g, F, V) => `Un lancement produit cible ${N} clients potentiels via des influenceurs. La proportion de clients touchés après t jours vaut p(t)=1-e^(-kt). Chaque client acquis rapporte ${fr(g)} € ; le partenariat coûte ${F} € de frais fixes, plus ${V} € par jour de campagne.`,
  },
];

// ============================================================================
// Famille G — seuil critique, décision.
// ============================================================================

export interface ContexteExpoProbG {
  id: string;
  label: string;
  unite: string;
  grandeur: string;
  phrase: (sAffiche: number) => string;
}

export const CONTEXTES_G: ContexteExpoProbG[] = [
  {
    id: "pneuPerce",
    label: "Pression d'un pneu percé",
    unite: "heures",
    grandeur: "la pression du pneu (en bars)",
    phrase: (sAffiche) => `Un pneu percé perd de la pression au cours du temps. En dessous de ${fr(sAffiche)} bars, le pneu est considéré comme dangereux à rouler.`,
  },
  {
    id: "batterieDecharge",
    label: "Décharge d'une batterie",
    unite: "heures",
    grandeur: "le niveau de charge de la batterie (en %)",
    phrase: (sAffiche) => `La charge d'une batterie diminue au cours du temps. En dessous de ${fr(sAffiche)} %, l'appareil se met automatiquement en veille.`,
  },
  {
    id: "moteurRefroidissement",
    label: "Refroidissement d'un moteur",
    unite: "minutes",
    grandeur: "la température du moteur (en °C)",
    phrase: (sAffiche) => `La température d'un moteur diminue après son arrêt. En dessous de ${fr(sAffiche)} °C, il est possible de le redémarrer sans risque de surchauffe.`,
  },
];
