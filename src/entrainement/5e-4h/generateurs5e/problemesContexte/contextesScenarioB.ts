import type { ContexteScenarioB } from "../../core5e/problemesContexte.types";

/**
 * Contextes narratifs du scénario B — UN bassin de 10 entrées PAR MODÈLE (B1-B5), jamais un bassin
 * partagé entre modèles (contrairement à 5gen18) : chaque modèle a sa propre forme de cu(x)/F(x), et
 * ses contextes sont choisis pour rester cohérents avec cette forme précise (ex. B2 = "coût qui
 * augmente avec la quantité" — heures sup, ressource qui se raréfie ; B5 = "pénalité croissante +
 * coût fixe amorti" — fatigue/usure croissante).
 *
 * B4 — écart documenté : la liste de contextes fournie décrivait des phénomènes physiques de
 * dilution/atténuation (concentration d'un polluant, intensité d'un signal...), sans lien avec un
 * "coût de production" — incompatible avec la structure d'écrans uniforme du scénario B (qui parle
 * explicitement de "coût unitaire"/"coût total"). Recasées en coûts de production authentiques
 * portant "2 effets d'échelle combinés qui s'atténuent à des vitesses différentes" (même forme
 * mathématique que voulu, cu(x)=a/x+b/x²), en conservant le vocabulaire d'origine (dilution, réseau,
 * atténuation...) comme habillage plutôt que comme mécanisme.
 */

export const CONTEXTES_B1: ContexteScenarioB[] = [
  { id: "widgets", sujet: "la fabrication de widgets", unite: "widgets" },
  { id: "impressionTextile", sujet: "l'impression de textiles", unite: "mètres de tissu" },
  { id: "assemblageMeubles", sujet: "l'assemblage de meubles", unite: "meubles" },
  { id: "imprimerieLivres", sujet: "l'impression de livres", unite: "livres" },
  { id: "boulangerieIndustrielle", sujet: "la production de pains", unite: "pains" },
  { id: "coquesTelephone", sujet: "la fabrication de coques de téléphone", unite: "coques" },
  { id: "impression3D", sujet: "l'impression 3D d'objets", unite: "objets" },
  { id: "savonsArtisanaux", sujet: "la fabrication de savons artisanaux", unite: "savons" },
  { id: "stylosPromo", sujet: "la fabrication de stylos promotionnels", unite: "stylos" },
  { id: "carrelageCeramique", sujet: "la fabrication de carreaux céramiques", unite: "carreaux" },
];

export const CONTEXTES_B2: ContexteScenarioB[] = [
  { id: "agricoleHeuresSup", sujet: "la récolte agricole réalisée en heures supplémentaires", unite: "tonnes" },
  { id: "extractionMiniere", sujet: "le minerai extrait d'un gisement qui s'épuise", unite: "tonnes" },
  { id: "pecheIndustrielle", sujet: "le poisson pêché d'un stock qui se raréfie", unite: "tonnes" },
  { id: "constructionMainOeuvre", sujet: "la construction réalisée avec de la main-d'œuvre supplémentaire", unite: "m²" },
  { id: "impression3DUrgence", sujet: "l'impression 3D réalisée en urgence", unite: "pièces" },
  { id: "coutureUrgente", sujet: "la couture réalisée sur commande urgente", unite: "vêtements" },
  { id: "reparationAuto", sujet: "la réparation automobile réalisée en horaires étendus", unite: "véhicules" },
  { id: "livraisonExpress", sujet: "la livraison express de colis", unite: "colis" },
  { id: "vaccinsUrgence", sujet: "la production de vaccins en urgence", unite: "doses" },
  { id: "extractionPetroliere", sujet: "le pétrole extrait d'un puits vieillissant", unite: "barils" },
];

export const CONTEXTES_B3: ContexteScenarioB[] = [
  { id: "pucesElectroniques", sujet: "la fabrication de puces électroniques", unite: "puces" },
  { id: "productionPharma", sujet: "la production de médicaments", unite: "boîtes" },
  { id: "editionLogiciels", sujet: "l'édition de logiciels", unite: "licences" },
  { id: "productionSerie", sujet: "la production d'épisodes de série (tournage amorti)", unite: "épisodes" },
  { id: "moulesIndustriels", sujet: "la fabrication de moules industriels", unite: "moules" },
  { id: "circuitsImprimes", sujet: "la conception de circuits imprimés", unite: "circuits" },
  { id: "jeuxVideo", sujet: "le développement de jeux vidéo", unite: "copies" },
  { id: "patronsMode", sujet: "la création de patrons de mode", unite: "patrons" },
  { id: "rechercheAppliquee", sujet: "la recherche scientifique appliquée", unite: "projets" },
  { id: "certifAeronautique", sujet: "la certification de pièces aéronautiques", unite: "pièces" },
];

export const CONTEXTES_B4: ContexteScenarioB[] = [
  { id: "controleMedicament", sujet: "le contrôle qualité par dose d'un médicament dilué en production", unite: "doses" },
  { id: "traitementEauPolluee", sujet: "le traitement par litre d'eau polluée en aval de l'usine", unite: "litres" },
  { id: "installationReseauRadio", sujet: "l'installation par antenne d'un réseau radio", unite: "antennes" },
  { id: "isolationPhonique", sujet: "l'isolation phonique par mètre carré traité", unite: "m²" },
  { id: "controleColorant", sujet: "le contrôle qualité par lot d'un colorant alimentaire", unite: "lots" },
  { id: "epandageEngrais", sujet: "l'épandage par hectare d'engrais", unite: "hectares" },
  { id: "productionParfum", sujet: "la production par flacon de parfum", unite: "flacons" },
  { id: "productionDesinfectant", sujet: "la production par litre de désinfectant", unite: "litres" },
  { id: "reseauSousMarin", sujet: "l'installation par capteur d'un réseau sous-marin", unite: "capteurs" },
  { id: "selEvaporation", sujet: "la production par tonne de sel obtenu par évaporation", unite: "tonnes" },
];

export const CONTEXTES_B5: ContexteScenarioB[] = [
  { id: "artisanFatigue", sujet: "la production artisanale d'un artisan qui se fatigue au fil de la journée", unite: "pièces" },
  { id: "coutureUsureMachines", sujet: "la couture réalisée par des machines qui s'usent", unite: "vêtements" },
  { id: "fermeRendementDecroissant", sujet: "la récolte d'une ferme au rendement décroissant du sol", unite: "tonnes" },
  { id: "mineProfondeur", sujet: "l'extraction minière à profondeur croissante", unite: "tonnes" },
  { id: "usineMaintenance", sujet: "la production d'une usine à maintenance croissante", unite: "pièces" },
  { id: "boulangerieFour", sujet: "la production d'une boulangerie au four vieillissant", unite: "pains" },
  { id: "imprimerieRouleaux", sujet: "l'impression d'une imprimerie aux rouleaux qui s'usent", unite: "pages" },
  { id: "verrerieFour", sujet: "la production d'une verrerie au four instable", unite: "pièces" },
  { id: "brasserieCuve", sujet: "la production d'une brasserie à la cuve vieillissante", unite: "litres" },
  { id: "fromagerieAffinage", sujet: "la production d'une fromagerie à l'affinage prolongé", unite: "fromages" },
];
