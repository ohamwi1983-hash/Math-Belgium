/**
 * Bassin de 60 contextes narratifs pour 5gen19 ("Suite récurrente affine et régime permanent"),
 * 30 pour la branche générale (`regime="convergent"`, |a|<1, "perte périodique % puis ajout
 * constant") et 30 pour la branche spéciale (`regime="divergent"`, |a|≥1, "croissance périodique %
 * combinée à un retrait/perte constant") — jamais la même trame réutilisée entre les 2 branches
 * avec seulement `a` changé (chaque contexte est réservé à SA branche par construction, via son
 * `regime`).
 *
 * `variableGrandeur` — une lettre distincte de `a`/`b`/`L`/`n`/`x` (déjà réservées par la formule
 * de récurrence elle-même et le placeholder générique de saisie), jamais unique à travers les 60
 * contextes (rien n'empêche 2 contextes différents de partager une lettre, un seul contexte étant
 * actif par exercice).
 *
 * Branche divergente — `b` est tiré NÉGATIF (bMin/bMax tous deux négatifs) pour représenter le
 * retrait/perte constant demandé par la spec, plutôt que l'ancien "toujours ajouté" (qui aurait
 * fallacieusement décrit un retrait comme un ajout). Avec `a>1` et `b<0`, le point fixe
 * `L*=b/(1-a)=|b|/(a-1)` est POSITIF (l'ancien commentaire le disait à tort toujours négatif) : si
 * `u1<L*`, la suite décroît puis devient négative (bactéries, abonnés… négatifs, audit 5c3c). Le
 * tirage (`index.ts`, `tirerParametres`) impose donc `u1 ≥ 1,2·L*` : suite croissante et positive.
 */
import type { RegimeSuiteRecurrenteAffine } from "../../core5e/suiteRecurrenteAffine.types";

/** Nombre écrit dans un énoncé : virgule décimale, espace insécable fine entre les milliers. */
function fr(valeur: number): string {
  const [entier, decimales] = String(Math.abs(valeur)).split(".");
  const groupe = entier.length > 3 ? entier.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f") : entier;
  return `${valeur < 0 ? "−" : ""}${groupe}${decimales ? "," + decimales : ""}`;
}

export interface ContexteSuiteRecurrenteAffine {
  id: string;
  regime: RegimeSuiteRecurrenteAffine;
  variableGrandeur: string;
  /** Libellé court pour le sélecteur dev — jamais affiché à l'élève. */
  label: string;
  phrase: (u1: number, pct: number, b: number) => string;
  pctMin: number;
  pctMax: number;
  bMin: number;
  bMax: number;
  u1Min: number;
  u1Max: number;
}

// ============================================================================
// Branche générale (convergent, |a|<1) — 30 contextes.
// ============================================================================

export const CONTEXTES_CONVERGENT: ContexteSuiteRecurrenteAffine[] = [
  {
    id: "medicamentSang",
    regime: "convergent",
    variableGrandeur: "C",
    label: "Concentration médicament dans le sang",
    phrase: (u1, pct, b) =>
      `Un patient a une concentration initiale de ${fr(u1)} mg/L d'un médicament dans le sang. Chaque heure, ${fr(pct)} % du médicament est éliminé par l'organisme, puis on lui administre une nouvelle dose qui augmente la concentration de ${fr(b)} mg/L.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 1,
    bMax: 10,
    u1Min: 0,
    u1Max: 20,
  },
  {
    id: "chlorePiscine",
    regime: "convergent",
    variableGrandeur: "T",
    label: "Taux de chlore d'une piscine",
    phrase: (u1, pct, b) =>
      `Une piscine contient initialement un taux de chlore de ${fr(u1)} mg/L. Chaque jour, ${fr(pct)} % du chlore se dissipe naturellement, puis on en rajoute ${fr(b)} mg/L pour désinfecter l'eau.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 1,
    bMax: 10,
    u1Min: 0,
    u1Max: 20,
  },
  {
    id: "reservoirSel",
    regime: "convergent",
    variableGrandeur: "S",
    label: "Sel dissous dans un réservoir",
    phrase: (u1, pct, b) =>
      `Un réservoir contient initialement ${fr(u1)} g de sel dissous. Chaque heure, on évacue ${fr(pct)} % du sel présent (vidange partielle), puis on y ajoute ${fr(b)} g de sel.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 1,
    bMax: 10,
    u1Min: 0,
    u1Max: 20,
  },
  {
    id: "batterieTelephone",
    regime: "convergent",
    variableGrandeur: "Q",
    label: "Charge d'une batterie de téléphone",
    phrase: (u1, pct, b) =>
      `Une batterie de téléphone a une charge de ${fr(u1)} mAh. Chaque heure d'utilisation intensive, elle perd ${fr(pct)} % de sa charge, puis on la recharge partiellement de ${fr(b)} mAh grâce à un chargeur solaire d'appoint.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 20,
    bMax: 150,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "stockEntrepot",
    regime: "convergent",
    variableGrandeur: "S",
    label: "Stock de pièces détachées",
    phrase: (u1, pct, b) =>
      `Un entrepôt contient ${fr(u1)} unités de pièces détachées. Chaque semaine, ${fr(pct)} % du stock est écoulé (ventes), puis on réapprovisionne de ${fr(b)} unités.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 5,
    bMax: 30,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "effectifSalaries",
    regime: "convergent",
    variableGrandeur: "E",
    label: "Effectif de salariés",
    phrase: (u1, pct, b) =>
      `Une entreprise compte ${fr(u1)} salariés. Chaque année, ${fr(pct)} % de l'effectif quitte l'entreprise (turnover), puis on recrute ${fr(b)} nouveaux salariés.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 5,
    bMax: 30,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "populationRenards",
    regime: "convergent",
    variableGrandeur: "P",
    label: "Population de renards en réserve",
    phrase: (u1, pct, b) =>
      `Une population de renards compte ${fr(u1)} individus dans une réserve naturelle. Chaque année, ${fr(pct)} % de la population disparaît (prédation, maladie), puis ${fr(b)} nouveaux individus sont introduits pour préserver la biodiversité.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 5,
    bMax: 30,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "humiditeSerre",
    regime: "convergent",
    variableGrandeur: "H",
    label: "Eau dans le sol d'une serre",
    phrase: (u1, pct, b) =>
      `Le sol d'une serre contient ${fr(u1)} g d'eau par m². Chaque jour, ${fr(pct)} % de cette eau s'évapore, puis un système d'irrigation en ajoute ${fr(b)} g par m².`,
    pctMin: 10,
    pctMax: 40,
    bMin: 2,
    bMax: 15,
    u1Min: 10,
    u1Max: 50,
  },
  {
    id: "capitalEpargne",
    regime: "convergent",
    variableGrandeur: "V",
    label: "Compte d'épargne (frais de gestion)",
    phrase: (u1, pct, b) =>
      `Un compte d'épargne contient ${fr(u1)} €. Chaque année, ${fr(pct)} % du capital est prélevé pour des frais de gestion, puis on y dépose ${fr(b)} € supplémentaires.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 10,
    bMax: 50,
    u1Min: 100,
    u1Max: 500,
  },
  {
    id: "co2Serre",
    regime: "convergent",
    variableGrandeur: "C",
    label: "Surplus de CO₂ dans une serre",
    phrase: (u1, pct, b) =>
      `Une serre contient un surplus de CO₂ de ${fr(u1)} ppm par rapport au niveau ambiant. Chaque heure, ${fr(pct)} % de ce surplus est absorbé par les plantes, puis un système d'injection en ajoute ${fr(b)} ppm.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 2,
    bMax: 10,
    u1Min: 20,
    u1Max: 80,
  },
  {
    id: "neigeArtificielle",
    regime: "convergent",
    variableGrandeur: "Q",
    label: "Stock de neige artificielle",
    phrase: (u1, pct, b) =>
      `Un stock de neige artificielle sur une piste de ski pèse ${fr(u1)} tonnes. Chaque jour, ${fr(pct)} % de la neige fond, puis les canons à neige en ajoutent ${fr(b)} tonnes durant la nuit.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 5,
    bMax: 30,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "chateauEau",
    regime: "convergent",
    variableGrandeur: "V",
    label: "Volume d'un château d'eau",
    phrase: (u1, pct, b) =>
      `Un château d'eau contient ${fr(u1)} m³. Chaque jour, ${fr(pct)} % du volume est consommé par le réseau, puis une source naturelle le remplit de ${fr(b)} m³.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 10,
    bMax: 50,
    u1Min: 100,
    u1Max: 500,
  },
  {
    id: "pretImmobilier",
    regime: "convergent",
    variableGrandeur: "D",
    label: "Capital restant dû d'un prêt",
    phrase: (u1, pct, b) =>
      `Un prêt a un capital restant dû de ${fr(u1)} €. Chaque mois, ${fr(pct)} % du capital est remboursé, puis des intérêts et frais ajoutent ${fr(b)} € à la dette.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 20,
    bMax: 150,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "poussiereFiltre",
    regime: "convergent",
    variableGrandeur: "M",
    label: "Poussière accumulée dans un filtre",
    phrase: (u1, pct, b) =>
      `Un filtre à air retient de la poussière, avec une masse accumulée de ${fr(u1)} g. Chaque semaine, ${fr(pct)} % de la poussière est évacuée par nettoyage automatique, puis ${fr(b)} g s'accumulent à nouveau avant le nettoyage suivant.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 2,
    bMax: 15,
    u1Min: 10,
    u1Max: 50,
  },
  {
    id: "batterieVoitureElectrique",
    regime: "convergent",
    variableGrandeur: "E",
    label: "Énergie d'une batterie de voiture électrique",
    phrase: (u1, pct, b) =>
      `Une batterie de voiture électrique contient ${fr(u1)} kWh. Chaque trajet, ${fr(pct)} % de l'énergie est consommée, puis une recharge partielle ajoute ${fr(b)} kWh.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 2,
    bMax: 15,
    u1Min: 20,
    u1Max: 80,
  },
  {
    id: "signalFibreOptique",
    regime: "convergent",
    variableGrandeur: "S",
    label: "Intensité d'un signal de fibre optique",
    phrase: (u1, pct, b) =>
      `Un signal de fibre optique a une intensité de ${fr(u1)} unités. Chaque kilomètre parcouru, ${fr(pct)} % de l'intensité est perdue (atténuation), puis un répéteur amplifie le signal de ${fr(b)} unités.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 2,
    bMax: 15,
    u1Min: 20,
    u1Max: 80,
  },
  {
    id: "etangPiscicole",
    regime: "convergent",
    variableGrandeur: "P",
    label: "Poissons d'un étang piscicole",
    phrase: (u1, pct, b) =>
      `Un étang piscicole contient ${fr(u1)} poissons. Chaque mois, ${fr(pct)} % de la population est pêchée, puis ${fr(b)} alevins sont réintroduits.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 5,
    bMax: 30,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "bibliothequeOuvrages",
    regime: "convergent",
    variableGrandeur: "O",
    label: "Ouvrages d'une bibliothèque",
    phrase: (u1, pct, b) =>
      `Une bibliothèque possède ${fr(u1)} ouvrages en libre-accès. Chaque mois, ${fr(pct)} % des ouvrages sont retirés (usure, pertes), puis ${fr(b)} nouveaux ouvrages sont achetés.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 10,
    bMax: 50,
    u1Min: 100,
    u1Max: 500,
  },
  {
    id: "newsletterAbonnes",
    regime: "convergent",
    variableGrandeur: "R",
    label: "Abonnés d'une newsletter",
    phrase: (u1, pct, b) =>
      `Une newsletter compte ${fr(u1)} abonnés. Chaque mois, ${fr(pct)} % des abonnés se désinscrivent, puis ${fr(b)} nouveaux abonnés s'inscrivent.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 10,
    bMax: 50,
    u1Min: 100,
    u1Max: 500,
  },
  {
    id: "cafeineOrganisme",
    regime: "convergent",
    variableGrandeur: "C",
    label: "Caféine dans l'organisme",
    phrase: (u1, pct, b) =>
      `Un organisme contient ${fr(u1)} mg de caféine après un café. Chaque heure, ${fr(pct)} % de la caféine est éliminée par le métabolisme, puis ${fr(b)} mg supplémentaires sont absorbés (nouvelle tasse).`,
    pctMin: 10,
    pctMax: 40,
    bMin: 2,
    bMax: 15,
    u1Min: 20,
    u1Max: 80,
  },
  {
    id: "siloFarine",
    regime: "convergent",
    variableGrandeur: "M",
    label: "Farine dans un silo",
    phrase: (u1, pct, b) =>
      `Un silo à farine contient ${fr(u1)} kg. Chaque jour, ${fr(pct)} % de la farine est utilisée par la boulangerie, puis un camion livre ${fr(b)} kg supplémentaires.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 10,
    bMax: 50,
    u1Min: 100,
    u1Max: 500,
  },
  {
    id: "citernePropane",
    regime: "convergent",
    variableGrandeur: "Q",
    label: "Gaz dans une citerne de propane",
    phrase: (u1, pct, b) =>
      `Une citerne de propane contient ${fr(u1)} L. Chaque mois, ${fr(pct)} % du gaz est consommé pour le chauffage, puis la citerne est réapprovisionnée de ${fr(b)} L.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 10,
    bMax: 50,
    u1Min: 100,
    u1Max: 500,
  },
  {
    id: "carburantAvion",
    regime: "convergent",
    variableGrandeur: "Q",
    label: "Réserve tampon de carburant d'avion",
    phrase: (u1, pct, b) =>
      `Un avion dispose d'une réserve tampon de ${fr(u1)} kg de carburant. Chaque vol, ${fr(pct)} % de cette réserve est utilisé, puis ${fr(b)} kg sont rajoutés au ravitaillement suivant.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 10,
    bMax: 50,
    u1Min: 100,
    u1Max: 500,
  },
  {
    id: "sableChantier",
    regime: "convergent",
    variableGrandeur: "M",
    label: "Sable stocké sur un chantier",
    phrase: (u1, pct, b) =>
      `Un chantier stocke ${fr(u1)} tonnes de sable. Chaque semaine, ${fr(pct)} % du sable est utilisé pour le béton, puis un camion en livre ${fr(b)} tonnes.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 5,
    bMax: 30,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "compostJardin",
    regime: "convergent",
    variableGrandeur: "M",
    label: "Compost d'un jardin partagé",
    phrase: (u1, pct, b) =>
      `Un bac à compost contient ${fr(u1)} kg de matière. Chaque mois, ${fr(pct)} % du compost est prélevé pour le jardin, puis ${fr(b)} kg de déchets verts sont ajoutés.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 2,
    bMax: 15,
    u1Min: 10,
    u1Max: 50,
  },
  {
    id: "stockPeinture",
    regime: "convergent",
    variableGrandeur: "V",
    label: "Stock de peinture d'un atelier",
    phrase: (u1, pct, b) =>
      `Un atelier possède un stock de ${fr(u1)} L de peinture. Chaque semaine, ${fr(pct)} % du stock est utilisé sur les chantiers, puis ${fr(b)} L sont livrés par le fournisseur.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 5,
    bMax: 30,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "batterieSolaireDomestique",
    regime: "convergent",
    variableGrandeur: "E",
    label: "Batterie solaire domestique",
    phrase: (u1, pct, b) =>
      `Une batterie solaire domestique stocke ${fr(u1)} kWh. Chaque nuit, ${fr(pct)} % de l'énergie stockée est consommée, puis les panneaux solaires en rechargent ${fr(b)} kWh le lendemain.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 1,
    bMax: 10,
    u1Min: 10,
    u1Max: 50,
  },
  {
    id: "siloCereales",
    regime: "convergent",
    variableGrandeur: "M",
    label: "Céréales dans un silo agricole",
    phrase: (u1, pct, b) =>
      `Un silo agricole contient ${fr(u1)} tonnes de céréales. Chaque semaine, ${fr(pct)} % du grain est vendu, puis une nouvelle récolte en ajoute ${fr(b)} tonnes.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 5,
    bMax: 30,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "reservoirGasoil",
    regime: "convergent",
    variableGrandeur: "Q",
    label: "Réservoir de gasoil (groupe électrogène)",
    phrase: (u1, pct, b) =>
      `Un réservoir de gasoil pour groupe électrogène contient ${fr(u1)} L. Chaque semaine de fonctionnement, ${fr(pct)} % du carburant est consommé, puis il est réapprovisionné de ${fr(b)} L.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 10,
    bMax: 50,
    u1Min: 100,
    u1Max: 500,
  },
  {
    id: "reserveOxygeneHopital",
    regime: "convergent",
    variableGrandeur: "O",
    label: "Réserve d'oxygène médical d'un hôpital",
    phrase: (u1, pct, b) =>
      `Un hôpital dispose d'une réserve d'oxygène médical de ${fr(u1)} L. Chaque jour, ${fr(pct)} % de la réserve est consommée par les patients, puis un livreur en ajoute ${fr(b)} L.`,
    pctMin: 10,
    pctMax: 40,
    bMin: 10,
    bMax: 50,
    u1Min: 100,
    u1Max: 500,
  },
];

// ============================================================================
// Branche spéciale (divergent, |a|≥1) — 30 contextes, TOUS distincts des 30 ci-dessus. `b` négatif
// (retrait/perte constant), voir l'en-tête du fichier pour la garantie de croissance sans passage en
// négatif (contrainte u1 ≥ 1,2·L* imposée au tirage, `index.ts`).
// ============================================================================

export const CONTEXTES_DIVERGENT: ContexteSuiteRecurrenteAffine[] = [
  {
    id: "bacteriesBoitePetri",
    regime: "divergent",
    variableGrandeur: "K",
    label: "Culture de bactéries (prélèvements)",
    phrase: (u1, pct, b) =>
      `Une culture de bactéries compte ${fr(u1)} individus dans une boîte de Petri. Chaque heure, la population croît de ${fr(pct)} %, mais ${-b} bactéries sont prélevées pour analyse à chaque mesure.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "villeFrontaliereEmigration",
    regime: "divergent",
    variableGrandeur: "P",
    label: "Population d'une ville frontalière",
    phrase: (u1, pct, b) =>
      `Une ville frontalière compte ${fr(u1)} habitants. Sa population croît de ${fr(pct)} % chaque année (forte natalité), mais ${-b} habitants émigrent chaque année vers l'étranger.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "fondsHautRisque",
    regime: "divergent",
    variableGrandeur: "V",
    label: "Fonds d'investissement à haut risque",
    phrase: (u1, pct, b) =>
      `Un capital de ${fr(u1)} € est investi dans un fonds à haut risque. Il croît de ${fr(pct)} % chaque mois, mais un gestionnaire prélève ${-b} € de frais fixes chaque mois.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "dettePubliqueEtat",
    regime: "divergent",
    variableGrandeur: "D",
    label: "Dette publique d'un État",
    phrase: (u1, pct, b) =>
      `La dette d'un État s'élève à ${fr(u1)} millions d'€. Elle augmente de ${fr(pct)} % chaque année sous l'effet des intérêts, malgré un remboursement fixe de ${-b} millions d'€ chaque année.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "videoViraleVues",
    regime: "divergent",
    variableGrandeur: "V",
    label: "Vues d'une vidéo virale",
    phrase: (u1, pct, b) =>
      `Une vidéo virale totalise ${fr(u1)} vues. Ce nombre croît de ${fr(pct)} % chaque jour, mais ${-b} vues sont retirées du compteur chaque jour (comptes suspects filtrés).`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "moisissureSurface",
    regime: "divergent",
    variableGrandeur: "M",
    label: "Moisissure sur une surface",
    phrase: (u1, pct, b) =>
      `Une moisissure colonise une surface de ${fr(u1)} cm², croissant de ${fr(pct)} % chaque jour, malgré un nettoyage qui en retire ${-b} cm² chaque jour.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "dechetsPlastiqueOcean",
    regime: "divergent",
    variableGrandeur: "M",
    label: "Déchets plastiques en mer",
    phrase: (u1, pct, b) =>
      `Une zone océanique contient ${fr(u1)} kg de déchets plastiques. Cette masse croît de ${fr(pct)} % chaque mois, malgré une collecte qui en retire ${-b} kg chaque mois.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "algueLac",
    regime: "divergent",
    variableGrandeur: "M",
    label: "Prolifération d'algues dans un lac",
    phrase: (u1, pct, b) =>
      `Une prolifération d'algues couvre ${fr(u1)} m² d'un lac, croissant de ${fr(pct)} % chaque semaine (eutrophisation), malgré un dispositif qui en retire ${-b} m² chaque semaine.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "rouilleCoqueBateau",
    regime: "divergent",
    variableGrandeur: "M",
    label: "Rouille sur une coque de bateau",
    phrase: (u1, pct, b) =>
      `La rouille sur une coque de bateau couvre ${fr(u1)} cm², se propageant de ${fr(pct)} % chaque mois, malgré un traitement anticorrosion qui en traite ${-b} cm² chaque mois.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "pretsEtudiantsBanque",
    regime: "divergent",
    variableGrandeur: "D",
    label: "Prêts étudiants d'une banque",
    phrase: (u1, pct, b) =>
      `Le montant total des prêts étudiants d'une banque s'élève à ${fr(u1)} milliers d'€. Il croît de ${fr(pct)} % chaque année (intérêts), malgré des remboursements fixes de ${-b} milliers d'€ chaque année.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "traficDonneesServeur",
    regime: "divergent",
    variableGrandeur: "Q",
    label: "Trafic de données d'un serveur",
    phrase: (u1, pct, b) =>
      `Un serveur stocke ${fr(u1)} Go de trafic de données. Ce volume croît de ${fr(pct)} % chaque mois, malgré une compression automatique qui réduit le stockage de ${-b} Go chaque mois.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "inflationPanierConsommation",
    regime: "divergent",
    variableGrandeur: "P",
    label: "Prix d'un panier de consommation",
    phrase: (u1, pct, b) =>
      `Un panier de consommation courante coûte ${fr(u1)} €. Son prix croît de ${fr(pct)} % chaque année (inflation), malgré une subvention fixe de ${-b} € qui réduit la facture chaque année.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "essaimAbeilles",
    regime: "divergent",
    variableGrandeur: "K",
    label: "Essaim d'abeilles",
    phrase: (u1, pct, b) =>
      `Un essaim d'abeilles compte ${fr(u1)} individus, croissant de ${fr(pct)} % chaque semaine, malgré un apiculteur qui en prélève ${-b} pour créer de nouvelles ruches chaque semaine.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "mousseAquarium",
    regime: "divergent",
    variableGrandeur: "M",
    label: "Mousse aquatique dans un aquarium",
    phrase: (u1, pct, b) =>
      `Une mousse aquatique envahit un aquarium sur ${fr(u1)} cm², croissant de ${fr(pct)} % chaque semaine, malgré un nettoyage qui en retire ${-b} cm² chaque semaine.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -15,
    bMax: -2,
    u1Min: 10,
    u1Max: 50,
  },
  {
    id: "soldeCarteCredit",
    regime: "divergent",
    variableGrandeur: "D",
    label: "Solde impayé d'une carte de crédit",
    phrase: (u1, pct, b) =>
      `Le solde impayé d'une carte de crédit s'élève à ${fr(u1)} €. Il croît de ${fr(pct)} % chaque mois (intérêts élevés), malgré un remboursement minimum fixe de ${-b} € chaque mois.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "insectesNuisiblesChamp",
    regime: "divergent",
    variableGrandeur: "K",
    label: "Insectes nuisibles dans un champ",
    phrase: (u1, pct, b) =>
      `Une population d'insectes nuisibles dans un champ compte ${fr(u1)} individus. Elle croît de ${fr(pct)} % chaque semaine, malgré un traitement qui en élimine ${-b} chaque semaine.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "portefeuilleCrypto",
    regime: "divergent",
    variableGrandeur: "V",
    label: "Portefeuille de cryptomonnaies volatile",
    phrase: (u1, pct, b) =>
      `Un portefeuille de cryptomonnaies très volatile vaut ${fr(u1)} €. Sa valeur croît de ${fr(pct)} % chaque semaine, malgré des retraits fixes de ${-b} € chaque semaine pour sécuriser des gains.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "traficAutorouteVehicules",
    regime: "divergent",
    variableGrandeur: "Q",
    label: "Véhicules sur une autoroute",
    phrase: (u1, pct, b) =>
      `Une autoroute est empruntée par ${fr(u1)} véhicules par jour. Ce nombre croît de ${fr(pct)} % chaque année, malgré un péage dissuasif qui détourne ${-b} véhicules chaque année vers d'autres routes.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "abonnesStreamingPromo",
    regime: "divergent",
    variableGrandeur: "R",
    label: "Abonnés d'une plateforme de streaming",
    phrase: (u1, pct, b) =>
      `Une plateforme de streaming compte ${fr(u1)} abonnés. Ce nombre croît de ${fr(pct)} % chaque mois grâce au bouche-à-oreille, malgré ${-b} résiliations fixes chaque mois.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "passifEntrepriseDifficulte",
    regime: "divergent",
    variableGrandeur: "D",
    label: "Passif financier d'une entreprise",
    phrase: (u1, pct, b) =>
      `Le passif financier d'une entreprise en difficulté s'élève à ${fr(u1)} milliers d'€. Il croît de ${fr(pct)} % chaque trimestre (intérêts d'emprunt), malgré un plan de remboursement fixe de ${-b} milliers d'€ chaque trimestre.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "rumeurLycee",
    regime: "divergent",
    variableGrandeur: "Q",
    label: "Propagation d'une rumeur",
    phrase: (u1, pct, b) =>
      `Une rumeur se propage dans un lycée, touchant déjà ${fr(u1)} élèves, avec ${fr(pct)} % de nouveaux élèves informés chaque jour par le bouche-à-oreille, malgré ${-b} élèves qui oublient ou ignorent la rumeur chaque jour.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "microplastiquesRiviere",
    regime: "divergent",
    variableGrandeur: "M",
    label: "Microplastiques dans une rivière",
    phrase: (u1, pct, b) =>
      `Une rivière contient ${fr(u1)} kg de microplastiques détectés. Cette quantité croît de ${fr(pct)} % chaque mois (pollution amont), malgré un système de filtration qui en retire ${-b} kg chaque mois.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "coraiBlanchi",
    regime: "divergent",
    variableGrandeur: "M",
    label: "Zone de corail blanchi",
    phrase: (u1, pct, b) =>
      `Une zone de corail blanchi dans un récif couvre ${fr(u1)} m². Elle s'étend de ${fr(pct)} % chaque mois, malgré des opérations de restauration corallienne qui traitent ${-b} m² chaque mois.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "wifiPublicAppareils",
    regime: "divergent",
    variableGrandeur: "R",
    label: "Appareils connectés à un wifi public",
    phrase: (u1, pct, b) =>
      `Un wifi public compte ${fr(u1)} appareils connectés. Ce nombre croît de ${fr(pct)} % chaque heure lors d'un grand événement, malgré une limite technique qui déconnecte ${-b} appareils inactifs chaque heure.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "sedimentBarrage",
    regime: "divergent",
    variableGrandeur: "M",
    label: "Sédiments en amont d'un barrage",
    phrase: (u1, pct, b) =>
      `Les sédiments accumulés en amont d'un barrage pèsent ${fr(u1)} tonnes. Cette masse croît de ${fr(pct)} % chaque année, malgré des opérations de dragage qui en retirent ${-b} tonnes chaque année.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "colonieFourmis",
    regime: "divergent",
    variableGrandeur: "K",
    label: "Colonie de fourmis",
    phrase: (u1, pct, b) =>
      `Une colonie de fourmis compte ${fr(u1)} individus, croissant de ${fr(pct)} % chaque mois, malgré des prédateurs qui en éliminent ${-b} chaque mois.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -150,
    bMax: -20,
    u1Min: 500,
    u1Max: 3000,
  },
  {
    id: "joueursServeurJeuVideo",
    regime: "divergent",
    variableGrandeur: "Q",
    label: "Joueurs connectés à un serveur de jeu",
    phrase: (u1, pct, b) =>
      `Un serveur de jeu vidéo compte ${fr(u1)} joueurs connectés simultanément. Ce nombre croît de ${fr(pct)} % chaque semaine après une mise à jour, malgré des bannissements qui retirent ${-b} comptes chaque semaine.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "dechetsIndustrielsUsine",
    regime: "divergent",
    variableGrandeur: "M",
    label: "Déchets industriels d'une usine",
    phrase: (u1, pct, b) =>
      `Une usine produit ${fr(u1)} tonnes de déchets industriels. Cette quantité croît de ${fr(pct)} % chaque mois (hausse de production), malgré un programme de recyclage qui en retire ${-b} tonnes chaque mois.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "ilotChaleurUrbain",
    regime: "divergent",
    variableGrandeur: "T",
    label: "Écart de température d'un îlot de chaleur urbain",
    phrase: (u1, pct, b) =>
      `Un îlot de chaleur urbain présente un écart de température de ${fr(u1)} centièmes de °C par rapport à la campagne alentour, cet écart croissant de ${fr(pct)} % chaque décennie sous l'effet de l'urbanisation, malgré des aménagements verts qui le réduisent de ${-b} centièmes de °C chaque décennie.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
  {
    id: "planteInvasiveParc",
    regime: "divergent",
    variableGrandeur: "V",
    label: "Plante invasive dans un parc public",
    phrase: (u1, pct, b) =>
      `Une plante invasive envahit un parc public sur ${fr(u1)} m². Cette surface croît de ${fr(pct)} % chaque mois, malgré une équipe d'entretien qui en arrache ${-b} m² chaque mois.`,
    pctMin: 5,
    pctMax: 20,
    bMin: -30,
    bMax: -5,
    u1Min: 50,
    u1Max: 300,
  },
];

export const CONTEXTES_SUITE_RECURRENTE_AFFINE: ContexteSuiteRecurrenteAffine[] = [...CONTEXTES_CONVERGENT, ...CONTEXTES_DIVERGENT];

/** Catalogue pour le sélecteur dev — forcer un contexte précis (implique sa branche, chaque
 * contexte étant réservé à SON régime). */
export const CATALOGUE_CONTEXTES_SUITE_RECURRENTE_AFFINE: { id: string; label: string }[] = CONTEXTES_SUITE_RECURRENTE_AFFINE.map((c) => ({
  id: c.id,
  label: `[${c.regime === "convergent" ? "Convergent" : "Divergent"}] ${c.label} (${c.variableGrandeur})`,
}));
