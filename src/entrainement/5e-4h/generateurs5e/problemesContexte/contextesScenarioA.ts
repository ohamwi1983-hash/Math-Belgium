/**
 * Couche A (5e) — bassins de contextes narratifs du scénario A (5gen5), 2 combos (audit 5e ch. 1 :
 * les 3 autres, aux contextes physiquement absurdes, ont été retirés). Un bassin de 10 entrées PAR
 * COMBO. `nomObjetIndefini`/`nomObjetDefini` (combo 1) et `intro`/`labelF`/`labelG` (combo 2) sont des
 * groupes nominaux/phrases COMPLETS pré-écrits — jamais d'accord grammatical recalculé au runtime
 * (convention transversale, voir CLAUDE.md).
 */
import type { ContexteConteneurA, ContexteReduitA } from "../../core5e/problemesContexte.types";

// ============================================================================
// Combo 1 (kInverseXAxCarre) — objets cylindriques (V=πr²h), f=aire latérale, g=aire des bases.
// ============================================================================

/** Audit 5e ch. 1 (décision 6, G1) : liste RÉDUITE d'objets réalistes pour une contenance de 1 à
 * 3 L (V = 2πn³ : n = 6 → 432π ≈ 1 357 cm³, n = 7 → 686π ≈ 2 155 cm³) — plus de silo, citerne ou
 * réservoir industriel de 2 litres. Au rayon optimal, diamètre = hauteur = 12 ou 14 cm. */
export const CONTEXTES_CONTENEUR: ContexteConteneurA[] = [
  { id: "boiteConserve", nomObjetIndefini: "une grande boîte de conserve", nomObjetDefini: "la boîte de conserve", rayons: [6, 7] },
  { id: "bouteille", nomObjetIndefini: "une bouteille de jus", nomObjetDefini: "la bouteille", rayons: [6, 7] },
  { id: "potPeinture", nomObjetIndefini: "un pot de peinture", nomObjetDefini: "le pot de peinture", rayons: [6, 7] },
  { id: "cartoucheGaz", nomObjetIndefini: "une cartouche de gaz de camping", nomObjetDefini: "la cartouche de gaz", rayons: [6] },
  { id: "canette", nomObjetIndefini: "une grande canette (format familial)", nomObjetDefini: "la canette", rayons: [6] },
  { id: "bidon", nomObjetIndefini: "un bidon d'huile", nomObjetDefini: "le bidon", rayons: [6, 7] },
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
