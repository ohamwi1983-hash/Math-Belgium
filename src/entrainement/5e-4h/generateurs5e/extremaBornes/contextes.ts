/**
 * Couche A (5e) — banque de contextes narratifs temporels bornés pour 5gen34 ("Extrema en
 * contexte borné"). Patron "banque de contextes narratifs" déjà établi sur la plateforme (voir
 * `generateurs/bienaymeTchebychev/contextes.ts`, 4e — 30+ entrées), taille réduite ici (10
 * entrées, suffisante pour la variété attendue d'un seul générateur plutôt qu'un chapitre entier).
 * Chaque `grandeur` reste un sujet grammatical SINGULIER (jamais pluriel) pour que les phrases
 * d'énoncé écrites une seule fois (`ui5e/formatExtremaBornes.ts`) n'aient jamais à gérer une
 * conjugaison "sont" à la place de "est".
 */
import type { ContexteExtremaBornes } from "../../core5e/extremaBornes.types";

export const CONTEXTES_EXTREMA_BORNES: ContexteExtremaBornes[] = [
  { id: "conso-electrique", grandeur: "la consommation électrique du site", unite: "kWh", variableDef: "le nombre d'heures écoulées depuis minuit", uniteTemps: "heures" },
  { id: "temperature-serre", grandeur: "la température à l'intérieur de la serre", unite: "°C", variableDef: "le nombre d'heures écoulées depuis l'aube", uniteTemps: "heures" },
  { id: "ventes-soldes", grandeur: "le nombre d'articles vendus par la boutique", unite: "articles", variableDef: "le nombre de jours écoulés depuis le début des soldes", uniteTemps: "jours" },
  { id: "frequentation-piscine", grandeur: "la fréquentation du bassin", unite: "baigneurs", variableDef: "le nombre d'heures écoulées depuis l'ouverture", uniteTemps: "heures" },
  { id: "altitude-drone", grandeur: "l'altitude du drone", unite: "m", variableDef: "le nombre de secondes écoulées depuis le décollage", uniteTemps: "secondes" },
  { id: "stock-entrepot", grandeur: "le niveau de stock de l'entrepôt", unite: "palettes", variableDef: "le nombre de jours écoulés depuis le début du mois", uniteTemps: "jours" },
  { id: "vitesse-manege", grandeur: "la vitesse du manège", unite: "km/h", variableDef: "le nombre de secondes écoulées depuis le démarrage", uniteTemps: "secondes" },
  { id: "audience-streaming", grandeur: "le nombre de spectateurs connectés au direct", unite: "spectateurs", variableDef: "le nombre de minutes écoulées depuis le début du direct", uniteTemps: "minutes" },
  { id: "niveau-barrage", grandeur: "le niveau d'eau du barrage", unite: "m", variableDef: "le nombre de jours écoulés depuis le début de la saison des pluies", uniteTemps: "jours" },
  { id: "pollution-air", grandeur: "l'indice de pollution de l'air", unite: "µg/m³", variableDef: "le nombre d'heures écoulées depuis minuit", uniteTemps: "heures" },
];

export function tirerContexte(): ContexteExtremaBornes {
  return CONTEXTES_EXTREMA_BORNES[Math.floor(Math.random() * CONTEXTES_EXTREMA_BORNES.length)];
}
