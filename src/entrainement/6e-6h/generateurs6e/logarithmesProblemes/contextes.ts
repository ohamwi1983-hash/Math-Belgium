/**
 * Couche A (6e) — bassins de contextes narratifs pour `6gen22`, même patron que
 * `generateurs6e/exponentiellesProblemes/contextes.ts` (6gen12) : chaque entrée porte un `id`
 * (résolution ui→génération), un `label` court (sélecteur dev), et une fonction `phrase(...)` qui
 * assemble l'énoncé contextualisé complet à partir des seules valeurs numériques nécessaires à
 * CETTE famille/CE sous-type (jamais un format générique unique).
 *
 * **Familles A (sous-types "resoudreT"/"tauxDecroissance") portent un sens croissance/
 * décroissance** — le contexte est choisi PARMI CEUX qui correspondent, jamais l'inverse (spec :
 * banque "finances, dépréciation, absorption lumineuse" pour la famille A).
 */

function fr(v: number): string {
  return String(v).replace(".", ",");
}

// ============================================================================
// Famille A — sous-type "resoudreT", croissance.
// ============================================================================

export interface ContexteACroissance {
  id: string;
  label: string;
  unite: string;
  grandeur: string;
  phrase: (Q0: number, p: number) => string;
}

export const CONTEXTES_A_CROISSANCE: ContexteACroissance[] = [
  {
    id: "placementInterets",
    label: "Placement à intérêts composés",
    unite: "ans",
    grandeur: "le capital (en €)",
    phrase: (Q0, p) => `Un capital de ${Q0} € est placé sur un compte qui rapporte ${fr(p)} % d'intérêts composés chaque année.`,
  },
  {
    id: "populationVille",
    label: "Population d'une ville",
    unite: "ans",
    grandeur: "la population",
    phrase: (Q0, p) => `Une ville compte actuellement ${Q0} habitants. Sa population augmente de ${fr(p)} % chaque année.`,
  },
  {
    id: "chiffreAffaires",
    label: "Chiffre d'affaires d'une entreprise",
    unite: "ans",
    grandeur: "le chiffre d'affaires (en €)",
    phrase: (Q0, p) => `Une entreprise réalise un chiffre d'affaires annuel de ${Q0} €. Celui-ci progresse de ${fr(p)} % chaque année.`,
  },
];

// ============================================================================
// Famille A — sous-type "resoudreT", décroissance (dépréciation, absorption lumineuse...).
// ============================================================================

export interface ContexteADecroissance {
  id: string;
  label: string;
  unite: string;
  grandeur: string;
  phrase: (Q0: number, p: number) => string;
}

export const CONTEXTES_A_DECROISSANCE: ContexteADecroissance[] = [
  {
    id: "depreciationVehicule",
    label: "Dépréciation d'un véhicule",
    unite: "ans",
    grandeur: "la valeur du véhicule (en €)",
    phrase: (Q0, p) => `Une voiture neuve vaut ${Q0} €. Sa valeur diminue de ${fr(p)} % chaque année.`,
  },
  {
    id: "absorptionLumineuse",
    label: "Absorption de la lumière dans l'eau",
    unite: "mètres de profondeur",
    grandeur: "l'intensité lumineuse (en %)",
    phrase: (Q0, p) => `À la surface d'un lac, l'intensité lumineuse vaut ${Q0} (en unité arbitraire). Chaque mètre de profondeur supplémentaire absorbe ${fr(p)} % de l'intensité restante.`,
  },
  {
    id: "eliminationMedicament",
    label: "Élimination d'un médicament",
    unite: "heures",
    grandeur: "la quantité de médicament dans le sang (en mg)",
    phrase: (Q0, p) => `Une dose de ${Q0} mg d'un médicament est injectée. L'organisme en élimine ${fr(p)} % chaque heure.`,
  },
];

// ============================================================================
// Famille A — sous-type "resoudreTaux".
// ============================================================================

export interface ContexteATaux {
  id: string;
  label: string;
  unite: string;
  phrase: (Q0: number, n: number, cibleAffiche: number) => string;
}

export const CONTEXTES_A_TAUX: ContexteATaux[] = [
  {
    id: "placementTauxCherche",
    label: "Placement, taux recherché",
    unite: "ans",
    phrase: (Q0, n, cible) => `Un capital de ${Q0} € est placé à intérêts composés annuels. On souhaite qu'il atteigne ${fr(cible)} € après ${n} ans.`,
  },
  {
    id: "immobilierTauxCherche",
    label: "Investissement immobilier, taux recherché",
    unite: "ans",
    phrase: (Q0, n, cible) => `Un bien immobilier acheté ${Q0} € doit, selon l'objectif fixé, valoir ${fr(cible)} € après ${n} ans.`,
  },
  {
    id: "epargneTauxCherche",
    label: "Épargne, taux recherché",
    unite: "ans",
    phrase: (Q0, n, cible) => `Une épargne de ${Q0} € doit atteindre ${fr(cible)} € après ${n} ans de placement à intérêts composés.`,
  },
];

// ============================================================================
// Famille A — sous-type "tauxDecroissance".
// ============================================================================

export interface ContexteATauxDecroissance {
  id: string;
  label: string;
  unite: string;
  phrase: (Q0: number, pourcentBaisse: number, h: number) => string;
}

export const CONTEXTES_A_TAUX_DECROISSANCE: ContexteATauxDecroissance[] = [
  {
    id: "polluantRiviere",
    label: "Dilution d'un polluant dans une rivière",
    unite: "heures",
    phrase: (Q0, pourcentBaisse, h) => `Une usine rejette accidentellement ${Q0} kg d'un polluant dans une rivière. Après ${h} heures, il n'en reste plus que ${fr(100 - pourcentBaisse)} % (dilution continue).`,
  },
  {
    id: "intensiteSonore",
    label: "Atténuation d'une intensité sonore",
    unite: "mètres",
    phrase: (Q0, pourcentBaisse, h) => `Le niveau d'une source sonore correspond à une intensité de ${Q0} (unité arbitraire) à la source. Après ${h} mètres, il n'en reste plus que ${fr(100 - pourcentBaisse)} %.`,
  },
  {
    id: "chargeCondensateur",
    label: "Décharge d'un condensateur",
    unite: "secondes",
    phrase: (Q0, pourcentBaisse, h) => `Un condensateur chargé à ${Q0} V se décharge. Après ${h} s, il ne reste plus que ${fr(100 - pourcentBaisse)} % de la charge initiale.`,
  },
];

// ============================================================================
// Famille B — modèle à 2 points, extrapolation à un multiple donné.
// ============================================================================

export interface ContexteB {
  id: string;
  label: string;
  unite: string;
  grandeur: string;
  v1Min: number;
  v1Max: number;
  /** Formulation de "quantité multipliée par k" propre au contexte (ex. "le coût aura quadruplé"). */
  multiple: (k: number) => string;
  phrase: (t1: number, v1: number, t2: number, v2Affiche: number) => string;
}

export const CONTEXTES_B: ContexteB[] = [
  {
    id: "audienceVirale",
    label: "Audience d'une vidéo virale",
    unite: "jours",
    grandeur: "le nombre de vues (en milliers)",
    v1Min: 5,
    v1Max: 50,
    multiple: (k) => `le nombre de vues aura été multiplié par ${k}`,
    phrase: (t1, v1, t2, v2Affiche) => `Une vidéo devenue virale comptait ${v1} milliers de vues au jour ${t1}, puis ${fr(v2Affiche)} milliers de vues au jour ${t2}.`,
  },
  {
    id: "objetCollection",
    label: "Valeur d'un objet de collection",
    unite: "ans",
    grandeur: "la valeur de revente (en €)",
    v1Min: 100,
    v1Max: 900,
    multiple: (k) => `sa valeur aura été multipliée par ${k}`,
    phrase: (t1, v1, t2, v2Affiche) => `Un objet de collection valait ${v1} € ${t1} ans après son acquisition, puis ${fr(v2Affiche)} € ${t2} ans après son acquisition.`,
  },
  {
    id: "populationBacteries",
    label: "Culture de bactéries",
    unite: "heures",
    grandeur: "le nombre de bactéries (en milliers)",
    v1Min: 10,
    v1Max: 100,
    multiple: (k) => `la population aura été multipliée par ${k}`,
    phrase: (t1, v1, t2, v2Affiche) => `Une culture de bactéries comptait ${v1} milliers d'individus après ${t1} heures, puis ${fr(v2Affiche)} milliers après ${t2} heures.`,
  },
];

// ============================================================================
// Famille C — radioactivité, demi-vie.
// ============================================================================

export interface ContexteC {
  id: string;
  label: string;
  element: string;
  phraseIntro: () => string;
}

export const CONTEXTES_C: ContexteC[] = [
  {
    id: "carbone14",
    label: "Carbone 14 (datation)",
    element: "le carbone 14",
    phraseIntro: () => "Le carbone 14 est un isotope radioactif utilisé pour dater des matériaux organiques.",
  },
  {
    id: "iode131",
    label: "Iode 131 (usage médical)",
    element: "l'iode 131",
    phraseIntro: () => "L'iode 131 est un isotope radioactif utilisé en médecine nucléaire.",
  },
  {
    id: "elementFictif",
    label: "Élément radioactif fictif (Zorium-X)",
    element: "le zorium-X",
    phraseIntro: () => "Le zorium-X est un élément radioactif (fictif) étudié en laboratoire.",
  },
];

// ============================================================================
// Famille D — asymptote non nulle.
// ============================================================================

export interface ContexteD {
  id: string;
  label: string;
  unite: string;
  grandeur: string;
  phrase: (Ta: number, T0: number) => string;
}

export const CONTEXTES_D: ContexteD[] = [
  {
    id: "refroidissementCafe",
    label: "Refroidissement d'un café",
    unite: "minutes",
    grandeur: "la température (en °C)",
    phrase: (Ta, T0) => `Une tasse de café à ${T0} °C est posée dans une pièce maintenue à ${Ta} °C. Elle refroidit progressivement en tendant vers la température de la pièce.`,
  },
  {
    id: "concentrationMedicament",
    label: "Concentration d'un médicament vers un résidu stable",
    unite: "heures",
    grandeur: "la concentration (en mg/L)",
    phrase: (Ta, T0) => `La concentration d'un médicament dans le sang vaut ${T0} mg/L juste après la prise, et tend vers un résidu constant de ${Ta} mg/L.`,
  },
  {
    id: "fourFroid",
    label: "Refroidissement d'un four",
    unite: "minutes",
    grandeur: "la température (en °C)",
    phrase: (Ta, T0) => `Un four à ${T0} °C est éteint dans un atelier maintenu à ${Ta} °C. Sa température tend vers celle de l'atelier.`,
  },
];

// ============================================================================
// Famille F — courbe logistique généralisée.
// ============================================================================

export interface ContexteF {
  id: string;
  label: string;
  unite: string;
  grandeurCapacite: string;
  phrase: (k: number, y0: number) => string;
}

export const CONTEXTES_F: ContexteF[] = [
  {
    id: "adoptionProduit",
    label: "Adoption d'un nouveau produit",
    unite: "mois",
    grandeurCapacite: "milliers de clients",
    phrase: (k, y0) => `Le nombre de clients (en milliers) d'un nouveau produit suit une courbe logistique de capacité maximale ${k} milliers de clients. Au lancement (t=0), on compte déjà ${fr(y0)} milliers de clients.`,
  },
  {
    id: "epidemieLogistique",
    label: "Propagation d'une épidémie (modèle logistique)",
    unite: "jours",
    grandeurCapacite: "milliers de personnes infectées",
    phrase: (k, y0) => `Le nombre de personnes infectées (en milliers) lors d'une épidémie suit une courbe logistique qui plafonne à ${k} milliers de personnes. Au jour 0, on compte ${fr(y0)} milliers de personnes infectées.`,
  },
  {
    id: "populationAnimale",
    label: "Croissance d'une population animale",
    unite: "années",
    grandeurCapacite: "individus (en centaines)",
    phrase: (k, y0) => `Une population animale réintroduite dans une réserve suit une croissance logistique dont la capacité d'accueil du milieu est ${k} centaines d'individus. À l'année 0, la population compte ${fr(y0)} centaines d'individus.`,
  },
];

// ============================================================================
// Famille G — équilibre offre/demande.
// ============================================================================

export interface ContexteG {
  id: string;
  label: string;
  phrase: () => string;
}

export const CONTEXTES_G: ContexteG[] = [
  {
    id: "marcheAgricole",
    label: "Marché d'un produit agricole",
    phrase: () => "Sur un marché, l'offre et la demande d'un produit dépendent toutes deux de son prix unitaire x (en €).",
  },
  {
    id: "marcheTechnologique",
    label: "Marché d'un objet technologique",
    phrase: () => "Le nombre d'unités qu'un fabricant est prêt à produire (offre) et le nombre d'unités que les clients sont prêts à acheter (demande) dépendent du prix de vente x (en €).",
  },
];
