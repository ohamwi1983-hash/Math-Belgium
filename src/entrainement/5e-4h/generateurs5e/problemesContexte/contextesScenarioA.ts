/**
 * Couche A (5e) — bassins de contextes narratifs du scénario A (5gen5), 5 combos. Un bassin de 10
 * entrées PAR COMBO (jamais partagé entre combos, même principe que `contextesScenarioB.ts`).
 * `nomObjetIndefini`/`nomObjetDefini` (combo 1) et `intro`/`labelF`/`labelG` (combos 2-5) sont des
 * groupes nominaux/phrases COMPLETS pré-écrits — jamais d'accord grammatical recalculé au runtime
 * (convention transversale, voir CLAUDE.md).
 */
import type { ContexteConteneurA, ContexteReduitA } from "../../core5e/problemesContexte.types";

// ============================================================================
// Combo 1 (kInverseXAxCarre) — objets cylindriques (V=πr²h), f=aire latérale, g=aire des bases.
// ============================================================================

export const CONTEXTES_CONTENEUR: ContexteConteneurA[] = [
  { id: "boiteConserve", nomObjetIndefini: "une boîte de conserve", nomObjetDefini: "la boîte de conserve" },
  { id: "reservoirIndustriel", nomObjetIndefini: "un réservoir de stockage industriel", nomObjetDefini: "le réservoir de stockage industriel" },
  { id: "siloGrains", nomObjetIndefini: "un silo à grains", nomObjetDefini: "le silo à grains" },
  { id: "bouteilleEau", nomObjetIndefini: "une bouteille d'eau", nomObjetDefini: "la bouteille d'eau" },
  { id: "tuyauIsole", nomObjetIndefini: "un tuyau isolé", nomObjetDefini: "le tuyau isolé" },
  { id: "potPeinture", nomObjetIndefini: "un pot de peinture", nomObjetDefini: "le pot de peinture" },
  { id: "citernePropane", nomObjetIndefini: "une citerne de propane", nomObjetDefini: "la citerne de propane" },
  { id: "futMetallique", nomObjetIndefini: "un fût métallique", nomObjetDefini: "le fût métallique" },
  { id: "cylindreGaz", nomObjetIndefini: "un cylindre de gaz comprimé", nomObjetDefini: "le cylindre de gaz comprimé" },
  { id: "cuveBrassage", nomObjetIndefini: "une cuve de brassage artisanale", nomObjetDefini: "la cuve de brassage artisanale" },
];

// ============================================================================
// Combo 2 (stockCommande) — f(x)=ax+b (coût de stockage, croissant), g(x)=k/x (coût de commande,
// décroissant), x = taille du lot commandé. Modèle classique de quantité économique de commande.
// ============================================================================

export const CONTEXTES_STOCK_COMMANDE: ContexteReduitA[] = [
  {
    id: "pharmacie",
    intro:
      "Une pharmacie commande des boîtes de médicaments par lots de x unités. Le coût annuel de stockage, f(x), augmente avec la taille du lot (plus de place et de surveillance nécessaires). Le coût annuel de passation des commandes, g(x), diminue quand le lot est plus grand (moins de commandes à passer dans l'année).",
    labelF: "coût annuel de stockage",
    labelG: "coût annuel de commande",
    unite: "boîtes par lot",
  },
  {
    id: "ecole",
    intro:
      "Une école commande des fournitures scolaires par lots de x unités. Le coût annuel de stockage, f(x), augmente avec la taille du lot. Le coût annuel de passation des commandes, g(x), diminue quand le lot est plus grand.",
    labelF: "coût annuel de stockage",
    labelG: "coût annuel de commande",
    unite: "unités par lot",
  },
  {
    id: "atelierAuto",
    intro:
      "Un atelier automobile commande des pièces détachées par lots de x unités. Le coût annuel de stockage, f(x), augmente avec la taille du lot. Le coût annuel de passation des commandes, g(x), diminue quand le lot est plus grand.",
    labelF: "coût annuel de stockage",
    labelG: "coût annuel de commande",
    unite: "pièces par lot",
  },
  {
    id: "boulangerieIndustrielle",
    intro:
      "Une boulangerie industrielle commande de la farine par lots de x sacs. Le coût annuel de stockage, f(x), augmente avec la taille du lot. Le coût annuel de passation des commandes, g(x), diminue quand le lot est plus grand.",
    labelF: "coût annuel de stockage",
    labelG: "coût annuel de commande",
    unite: "sacs par lot",
  },
  {
    id: "usineAssemblage",
    intro:
      "Une usine d'assemblage commande des composants électroniques par lots de x unités. Le coût annuel de stockage, f(x), augmente avec la taille du lot. Le coût annuel de passation des commandes, g(x), diminue quand le lot est plus grand.",
    labelF: "coût annuel de stockage",
    labelG: "coût annuel de commande",
    unite: "composants par lot",
  },
  {
    id: "librairie",
    intro:
      "Une librairie commande des exemplaires d'un même titre par lots de x unités. Le coût annuel de stockage, f(x), augmente avec la taille du lot. Le coût annuel de passation des commandes, g(x), diminue quand le lot est plus grand.",
    labelF: "coût annuel de stockage",
    labelG: "coût annuel de commande",
    unite: "exemplaires par lot",
  },
  {
    id: "usineTextile",
    intro:
      "Une usine textile commande des rouleaux de tissu par lots de x unités. Le coût annuel de stockage, f(x), augmente avec la taille du lot. Le coût annuel de passation des commandes, g(x), diminue quand le lot est plus grand.",
    labelF: "coût annuel de stockage",
    labelG: "coût annuel de commande",
    unite: "rouleaux par lot",
  },
  {
    id: "fournituresBureau",
    intro:
      "Une entreprise commande des ramettes de papier par lots de x unités. Le coût annuel de stockage, f(x), augmente avec la taille du lot. Le coût annuel de passation des commandes, g(x), diminue quand le lot est plus grand.",
    labelF: "coût annuel de stockage",
    labelG: "coût annuel de commande",
    unite: "ramettes par lot",
  },
  {
    id: "supermarche",
    intro:
      "Un supermarché commande des packs de bouteilles d'eau par lots de x unités. Le coût annuel de stockage, f(x), augmente avec la taille du lot. Le coût annuel de passation des commandes, g(x), diminue quand le lot est plus grand.",
    labelF: "coût annuel de stockage",
    labelG: "coût annuel de commande",
    unite: "packs par lot",
  },
  {
    id: "fabricantMeubles",
    intro:
      "Un fabricant de meubles commande des panneaux de bois par lots de x unités. Le coût annuel de stockage, f(x), augmente avec la taille du lot. Le coût annuel de passation des commandes, g(x), diminue quand le lot est plus grand.",
    labelF: "coût annuel de stockage",
    labelG: "coût annuel de commande",
    unite: "panneaux par lot",
  },
];

// ============================================================================
// Combo 3 (racineAffine) — f(x)=k√x (quantité qui s'accumule, croissante et ralentissant),
// g(x)=b-ax (quantité qui diminue à débit constant), x = temps écoulé. Adaptation du prompt
// d'origine (paires d'unités hétérogènes, ex. bactéries/nutriments) en 10 paires de MÊME UNITÉ
// (litres/kg), seule façon de rendre (f+g) — la quantité TOTALE disponible — interprétable
// physiquement ; combo signalé fragile par le prompt d'origine, voir le rapport de vérification.
// ============================================================================

export const CONTEXTES_RACINE_AFFINE: ContexteReduitA[] = [
  {
    id: "piscineCiterne",
    intro:
      "Une piscine municipale se remplit par une buse : le volume ajouté, f(x) (en litres), augmente avec le temps x (en minutes) mais de plus en plus lentement. Au même moment, un camion-citerne garé à proximité alimente un chantier voisin : son volume restant, g(x) (en litres), diminue à débit constant. On étudie le volume total disponible sur le site, (f+g)(x).",
    labelF: "volume ajouté à la piscine",
    labelG: "volume restant dans le camion-citerne",
    unite: "minutes",
  },
  {
    id: "barrageIrrigation",
    intro:
      "Un barrage reçoit l'appoint d'un affluent saisonnier : le volume apporté, f(x) (en m³), augmente avec le temps x (en heures) mais de plus en plus lentement. Une réserve voisine alimente en parallèle les terres agricoles en aval : son volume restant, g(x) (en m³), diminue à débit constant. On étudie le volume total stocké dans le système, (f+g)(x).",
    labelF: "volume apporté par l'affluent",
    labelG: "volume restant dans la réserve",
    unite: "heures",
  },
  {
    id: "siloMoissonneuse",
    intro:
      "Un silo à grains se remplit par une trémie : la masse livrée, f(x) (en kg), augmente avec le temps x (en minutes) mais de plus en plus lentement à mesure que le tas s'élève. Une moissonneuse-batteuse voisine charge en parallèle des camions : sa masse restante, g(x) (en kg), diminue à débit constant. On étudie la masse totale de grain disponible sur le site, (f+g)(x).",
    labelF: "masse livrée au silo",
    labelG: "masse restante dans la moissonneuse",
    unite: "minutes",
  },
  {
    id: "citerneFioulChaudiere",
    intro:
      "Une citerne de fioul domestique se remplit lors d'une livraison : le volume livré, f(x) (en litres), augmente avec le temps x (en minutes) mais de plus en plus lentement en fin de remplissage. Une chaudière collective consomme en parallèle une réserve voisine : son volume restant, g(x) (en litres), diminue à débit constant. On étudie le volume total de fioul disponible sur le site, (f+g)(x).",
    labelF: "volume livré à la citerne",
    labelG: "volume restant pour la chaudière",
    unite: "minutes",
  },
  {
    id: "compostJardin",
    intro:
      "Un bac de compost reçoit un apport de déchets verts : la masse ajoutée, f(x) (en kg), augmente avec le temps x (en jours) mais de plus en plus lentement. Un jardin partagé voisin prélève en parallèle du compost déjà mûr pour l'épandage : sa masse restante, g(x) (en kg), diminue à débit constant. On étudie la masse totale de compost disponible sur le site, (f+g)(x).",
    labelF: "masse ajoutée au bac",
    labelG: "masse restante pour l'épandage",
    unite: "jours",
  },
  {
    id: "chateauEauReseau",
    intro:
      "Un château d'eau se remplit par pompage depuis une nappe : le volume pompé, f(x) (en m³), augmente avec le temps x (en heures) mais de plus en plus lentement à mesure que la profondeur de pompage augmente. Un réservoir voisin alimente en parallèle le réseau de distribution d'un quartier : son volume restant, g(x) (en m³), diminue à débit constant. On étudie le volume total d'eau disponible sur le site, (f+g)(x).",
    labelF: "volume pompé vers le château d'eau",
    labelG: "volume restant pour le réseau",
    unite: "heures",
  },
  {
    id: "cuveBrassageEmbouteillage",
    intro:
      "Une cuve de brassage se remplit depuis le circuit de brasserie : le volume transféré, f(x) (en litres), augmente avec le temps x (en minutes) mais de plus en plus lentement. Une cuve tampon voisine alimente en parallèle une chaîne d'embouteillage : son volume restant, g(x) (en litres), diminue à débit constant. On étudie le volume total disponible sur le site, (f+g)(x).",
    labelF: "volume transféré dans la cuve de brassage",
    labelG: "volume restant dans la cuve tampon",
    unite: "minutes",
  },
  {
    id: "siloSelEpandeuses",
    intro:
      "Un silo à sel de déneigement reçoit une livraison hivernale : la masse livrée, f(x) (en kg), augmente avec le temps x (en minutes) mais de plus en plus lentement. Une épandeuse municipale voisine charge en parallèle son propre réservoir : sa masse restante, g(x) (en kg), diminue à débit constant. On étudie la masse totale de sel disponible sur le site, (f+g)(x).",
    labelF: "masse livrée au silo",
    labelG: "masse restante dans l'épandeuse",
    unite: "minutes",
  },
  {
    id: "reservoirHopitalGroupe",
    intro:
      "Un réservoir de secours d'un hôpital se remplit lors d'une livraison de carburant : le volume livré, f(x) (en litres), augmente avec le temps x (en minutes) mais de plus en plus lentement. Un groupe électrogène voisin, déjà en fonctionnement, consomme en parallèle sa propre réserve : son volume restant, g(x) (en litres), diminue à débit constant. On étudie le volume total de carburant disponible sur le site, (f+g)(x).",
    labelF: "volume livré au réservoir de secours",
    labelG: "volume restant dans le groupe électrogène",
    unite: "minutes",
  },
  {
    id: "siloSableToupies",
    intro:
      "Un silo à sable d'une centrale à béton se remplit par convoyeur : la masse livrée, f(x) (en kg), augmente avec le temps x (en minutes) mais de plus en plus lentement. Une toupie de livraison voisine charge en parallèle son tambour : sa masse restante, g(x) (en kg), diminue à débit constant. On étudie la masse totale de sable disponible sur le site, (f+g)(x).",
    labelF: "masse livrée au silo",
    labelG: "masse restante dans la toupie",
    unite: "minutes",
  },
];

// ============================================================================
// Combo 4 (intensiteCable) — f(x)=k/x² (intensité perçue, décroissante), g(x)=ax (coût
// d'installation du câble, croissant), x = distance.
// ============================================================================

export const CONTEXTES_INTENSITE_CABLE: ContexteReduitA[] = [
  {
    id: "antenneRelais",
    intro:
      "Une antenne relais émet un signal dont l'intensité perçue, f(x) (en unités de puissance), diminue avec la distance x (en mètres) au pied de l'antenne. Le coût d'installation du câble d'alimentation jusqu'à un boîtier situé à distance x, g(x) (en euros), augmente proportionnellement à x.",
    labelF: "intensité du signal perçue",
    labelG: "coût du câble d'alimentation",
    unite: "mètres",
  },
  {
    id: "lampadaire",
    intro:
      "Un lampadaire éclaire une rue : l'intensité lumineuse perçue au sol, f(x) (en lux), diminue avec la distance x (en mètres) au pied du lampadaire. Le coût d'installation du câble électrique jusqu'à un point situé à distance x, g(x) (en euros), augmente proportionnellement à x.",
    labelF: "intensité lumineuse perçue",
    labelG: "coût du câble électrique",
    unite: "mètres",
  },
  {
    id: "radiateur",
    intro:
      "Un radiateur électrique chauffe une pièce : la chaleur perçue, f(x) (en unités de puissance thermique), diminue avec la distance x (en mètres) au radiateur. Le coût d'installation du câble d'alimentation jusqu'à une prise située à distance x, g(x) (en euros), augmente proportionnellement à x.",
    labelF: "chaleur perçue",
    labelG: "coût du câble d'alimentation",
    unite: "mètres",
  },
  {
    id: "wifi",
    intro:
      "Une borne wifi diffuse un signal : l'intensité du signal perçue, f(x) (en unités de puissance), diminue avec la distance x (en mètres) à la borne. Le coût d'installation du câble réseau jusqu'à un point d'accès situé à distance x, g(x) (en euros), augmente proportionnellement à x.",
    labelF: "intensité du signal wifi perçue",
    labelG: "coût du câble réseau",
    unite: "mètres",
  },
  {
    id: "panneauSolaire",
    intro:
      "Un panneau solaire capte le rayonnement : l'intensité captée, f(x) (en unités de puissance), diminue avec la distance x (en mètres) au panneau (perte le long du câblage). Le coût d'installation du câble électrique jusqu'à un onduleur situé à distance x, g(x) (en euros), augmente proportionnellement à x.",
    labelF: "intensité captée",
    labelG: "coût du câble électrique",
    unite: "mètres",
  },
  {
    id: "hautParleur",
    intro:
      "Un haut-parleur diffuse du son : l'intensité sonore perçue, f(x) (en unités de puissance acoustique), diminue avec la distance x (en mètres) au haut-parleur. Le coût d'installation du câble audio jusqu'à un point d'écoute situé à distance x, g(x) (en euros), augmente proportionnellement à x.",
    labelF: "intensité sonore perçue",
    labelG: "coût du câble audio",
    unite: "mètres",
  },
  {
    id: "aimantCapteur",
    intro:
      "Un aimant industriel génère un champ : l'intensité du champ magnétique perçue, f(x) (en unités de champ), diminue avec la distance x (en mètres) à l'aimant. Le coût d'installation du câble de mesure jusqu'à un capteur situé à distance x, g(x) (en euros), augmente proportionnellement à x.",
    labelF: "intensité du champ magnétique perçue",
    labelG: "coût du câble de mesure",
    unite: "mètres",
  },
  {
    id: "antenneSatellite",
    intro:
      "Une antenne satellite reçoit un signal : l'intensité du signal perçue, f(x) (en unités de puissance), diminue avec la distance x (en mètres) au foyer de l'antenne. Le coût d'installation du câble coaxial jusqu'à un récepteur situé à distance x, g(x) (en euros), augmente proportionnellement à x.",
    labelF: "intensité du signal reçue",
    labelG: "coût du câble coaxial",
    unite: "mètres",
  },
  {
    id: "sourceRadioactive",
    intro:
      "Une source radioactive de contrôle industriel émet un rayonnement : l'intensité perçue, f(x) (en unités de rayonnement), diminue avec la distance x (en mètres) à la source. Le coût d'installation du câble de mesure jusqu'à un détecteur situé à distance x, g(x) (en euros), augmente proportionnellement à x.",
    labelF: "intensité de rayonnement perçue",
    labelG: "coût du câble de mesure",
    unite: "mètres",
  },
  {
    id: "boueeSignalisation",
    intro:
      "Une bouée de signalisation émet un signal lumineux : l'intensité perçue, f(x) (en unités de puissance), diminue avec la distance x (en mètres) à la bouée. Le coût d'installation du câble d'alimentation jusqu'à un poste de contrôle situé à distance x, g(x) (en euros), augmente proportionnellement à x.",
    labelF: "intensité lumineuse perçue",
    labelG: "coût du câble d'alimentation",
    unite: "mètres",
  },
];

// ============================================================================
// Combo 5 (deuxParaboles) — f(x)=a1x²+b1x+c1, g(x)=a2x²+b2x+c2, x = un réglage/paramètre du
// procédé. Combo signalé fragile par le prompt d'origine (2 grandeurs modélisées par une même
// famille de fonctions, sans lien physique fort entre elles) — voir le rapport de vérification.
// ============================================================================

export const CONTEXTES_DEUX_PARABOLES: ContexteReduitA[] = [
  {
    id: "cuissonIndustrielle",
    intro:
      "Dans un four de cuisson industrielle, le temps de cuisson réglé, x (en minutes), influence 2 indicateurs modélisés chacun par une parabole : le taux de perte d'humidité du produit, f(x), et le coût énergétique du four, g(x).",
    labelF: "taux de perte d'humidité",
    labelG: "coût énergétique du four",
    unite: "minutes",
  },
  {
    id: "reglagesMachineOutil",
    intro:
      "Sur une machine-outil, la vitesse de coupe réglée, x (en mètres par minute), influence 2 indicateurs modélisés chacun par une parabole : l'usure de l'outil, f(x), et le temps de production, g(x).",
    labelF: "usure de l'outil",
    labelG: "temps de production",
    unite: "mètres par minute",
  },
  {
    id: "culturesEngrais",
    intro:
      "Dans un champ agricole, la dose d'engrais épandue, x (en kg par hectare), influence 2 indicateurs modélisés chacun par une parabole : le rendement de la culture, f(x), et le coût de traitement de l'eau de ruissellement, g(x).",
    labelF: "rendement de la culture",
    labelG: "coût de traitement de l'eau",
    unite: "kg par hectare",
  },
  {
    id: "irrigation",
    intro:
      "Sur une parcelle irriguée, le volume d'eau apporté, x (en m³ par hectare), influence 2 indicateurs modélisés chacun par une parabole : le rendement de la culture, f(x), et le coût de pompage, g(x).",
    labelF: "rendement de la culture",
    labelG: "coût de pompage",
    unite: "m³ par hectare",
  },
  {
    id: "moteurs",
    intro:
      "Sur un banc d'essai moteur, le régime moteur réglé, x (en centaines de tours par minute), influence 2 indicateurs modélisés chacun par une parabole : la consommation de carburant, f(x), et l'usure mécanique, g(x).",
    labelF: "consommation de carburant",
    labelG: "usure mécanique",
    unite: "centaines de tours/min",
  },
  {
    id: "fermentation",
    intro:
      "Dans une cuve de fermentation, la température réglée, x (en °C), influence 2 indicateurs modélisés chacun par une parabole : le rendement en alcool, f(x), et le risque de contamination, g(x).",
    labelF: "rendement en alcool",
    labelG: "risque de contamination",
    unite: "°C",
  },
  {
    id: "pecheProfondeur",
    intro:
      "Pour un chalutier, la profondeur de pêche réglée, x (en mètres), influence 2 indicateurs modélisés chacun par une parabole : la quantité de poisson capturée, f(x), et la consommation de carburant du treuil, g(x).",
    labelF: "quantité de poisson capturée",
    labelG: "consommation de carburant du treuil",
    unite: "mètres",
  },
  {
    id: "elevageDensite",
    intro:
      "Dans un élevage, la densité d'animaux par enclos, x (en têtes par 100 m²), influence 2 indicateurs modélisés chacun par une parabole : le taux de croissance moyen, f(x), et le coût vétérinaire, g(x).",
    labelF: "taux de croissance moyen",
    labelG: "coût vétérinaire",
    unite: "têtes par 100 m²",
  },
  {
    id: "formulationsEngrais",
    intro:
      "Dans une formulation d'engrais, la proportion d'azote, x (en % de la masse totale), influence 2 indicateurs modélisés chacun par une parabole : l'efficacité sur le rendement, f(x), et le coût de production de l'engrais, g(x).",
    labelF: "efficacité sur le rendement",
    labelG: "coût de production",
    unite: "% d'azote",
  },
  {
    id: "profilsAerodynamiques",
    intro:
      "Pour un profil aérodynamique testé en soufflerie, l'angle d'incidence réglé, x (en degrés), influence 2 indicateurs modélisés chacun par une parabole : la portance générée, f(x), et la traînée générée, g(x).",
    labelF: "portance générée",
    labelG: "traînée générée",
    unite: "degrés",
  },
];
