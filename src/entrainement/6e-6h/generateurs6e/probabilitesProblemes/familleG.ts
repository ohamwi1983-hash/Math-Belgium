import type { CategorieFinanciere, ExerciceFamilleGDerangements, ExerciceFamilleGFinancier, ExerciceFamilleGMelange } from "../../core6e/probabilitesProblemes.types";
import type { DemandeEcran1FamilleB } from "../../core6e/tiragesArbres.types";
import { construireFamilleCSpecial } from "../tiragesArbres/familleC";
import { construireFamilleB as construireDerangements } from "../tiragesArbres/familleB";

/**
 * Couche A (6e) — génération famille G ("Réutilisations étendues") pour `6gen33`, 3 sous-types
 * (spec).
 *
 * **Sous-type "derangements"** — réutilise INTÉGRALEMENT `construireFamilleB` de
 * `generateurs6e/tiragesArbres/familleB.ts` (6gen31, Couche A ↔ Couche A libre — CLAUDE.md), n=4
 * fixé (spec : "aucune adaptation nécessaire, juste une instance de plus"). Les 4 écrans de 6gen31
 * famille B sont repris TELS QUELS côté `moteur6e/verificationProbabilitesProblemes.ts` (import direct
 * de `diagnostiquerBEcran1`/`2`/`3`/`4` depuis `moteur6e/verificationTiragesArbres.ts` — Couche B ↔
 * Couche B libre, CLAUDE.md).
 *
 * **Sous-type "melangeObjets"** — réutilise `construireFamilleCSpecial` de
 * `generateurs6e/tiragesArbres/familleC.ts` (dé truqué "special") comme `base`, ajoute une couche de
 * probabilités totales (objet choisi au hasard parmi 2, chacun sa propre distribution).
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}
function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// Sous-type "derangements".
// ============================================================================

export function construireFamilleGDerangements(demandeEcran1: DemandeEcran1FamilleB): ExerciceFamilleGDerangements {
  return { famille: "G", sousType: "derangements", base: construireDerangements(4, demandeEcran1) };
}

export function genererFamilleGDerangements(): ExerciceFamilleGDerangements {
  return construireFamilleGDerangements(tirerParmi(["une", "deux"] as const));
}

// ============================================================================
// Sous-type "melangeObjets".
// ============================================================================

const M_SPECIAL: readonly number[] = [4, 5, 6, 7, 8];
const K_SPECIAL: readonly number[] = [1, 2, 3];
const CANDIDATS_POIDS: readonly number[] = [0.3, 0.4, 0.5, 0.6, 0.7];
const CANDIDATS_PROBA_AUTRE: readonly number[] = [0.1, 0.15, 0.2, 0.25, 0.3];

const CONTEXTES_MELANGE: readonly { texte: string; labelObjet1: string; labelObjet2: string; labelEvenement: string }[] = [
  { texte: "Une urne parmi deux est choisie au hasard, puis on y lance un dé truqué qui s'y trouve. L'urne 1 contient le dé truqué décrit ci-dessus ; l'urne 2 contient un autre dé, de composition différente.", labelObjet1: "Urne 1 (dé truqué)", labelObjet2: "Urne 2 (autre dé)", labelEvenement: "l'événement composé" },
];

/** Construction déterministe (`m`/`k` fixés pour `base`) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. */
export function construireFamilleGMelange(m: number, k: number): ExerciceFamilleGMelange {
  const base = construireFamilleCSpecial(m, k);
  return {
    famille: "G",
    sousType: "melangeObjets",
    base,
    contexteMelange: tirerParmi(CONTEXTES_MELANGE),
    poidsObjet1: tirerParmi(CANDIDATS_POIDS),
    probabiliteAutreObjet: tirerParmi(CANDIDATS_PROBA_AUTRE),
  };
}

export function genererFamilleGMelange(): ExerciceFamilleGMelange {
  return construireFamilleGMelange(tirerParmi(M_SPECIAL), tirerParmi(K_SPECIAL));
}

/** Valeur CORRECTE de l'écran 3 de `base` (P(faceSpeciale ∪ autreFace) = p0+p) — recalculée
 * localement depuis les champs déjà connus de `base` (jamais stockée figée, même discipline que le
 * reste de la plateforme). Utilisée par l'écran 4 (probabilités totales). */
export function probabiliteObjet1(exercice: ExerciceFamilleGMelange): number {
  const { p0, p } = exercice.base;
  return p0.num / p0.den + p.num / p.den;
}

/** Écran 4 — probabilité totale = poids₁·P(objet1) + (1−poids₁)·P(objet2), P(objet2) DONNÉE. */
export function probabiliteTotaleMelange(exercice: ExerciceFamilleGMelange): number {
  return exercice.poidsObjet1 * probabiliteObjet1(exercice) + (1 - exercice.poidsObjet1) * exercice.probabiliteAutreObjet;
}

// ============================================================================
// Sous-type "financier".
// ============================================================================

const CONTEXTE_FINANCIER = { texte: "Un vendeur de matériel électronique propose systématiquement une extension de garantie à chaque client. Les clients se répartissent en catégories, chacune avec sa propre probabilité d'acheter l'extension.", libelleValeur: "commission par extension vendue" };

const LIBELLES_CATEGORIES: readonly string[] = ["Catégorie A", "Catégorie B", "Catégorie C"];

/** Construction déterministe (`nombreCategories` fixé, 2 ou 3) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. Proportions ENTIÈRES en dixièmes, sommant exactement à 1 (garanti par
 * construction : la dernière catégorie reçoit le complément). */
export function construireFamilleGFinancier(nombreCategories: 2 | 3): ExerciceFamilleGFinancier {
  const proportionsBrutes: number[] = [];
  let reste = 10;
  for (let i = 0; i < nombreCategories - 1; i++) {
    const part = tirerEntier(2, reste - 2 * (nombreCategories - 1 - i));
    proportionsBrutes.push(part);
    reste -= part;
  }
  proportionsBrutes.push(reste);

  const categories: CategorieFinanciere[] = proportionsBrutes.map((dixiemes, i) => ({
    id: `cat${i}`,
    label: LIBELLES_CATEGORIES[i],
    proportion: dixiemes / 10,
    taux: tirerParmi([0.1, 0.2, 0.3, 0.4, 0.5]),
  }));

  return {
    famille: "G",
    sousType: "financier",
    contexte: CONTEXTE_FINANCIER,
    categories,
    valeurUnitaire: tirerParmi([50, 80, 100, 120]),
    nombreTotalIndividus: tirerParmi([200, 500, 1000]),
  };
}

export function genererFamilleGFinancier(): ExerciceFamilleGFinancier {
  return construireFamilleGFinancier(tirerParmi([2, 3] as const));
}

// ============================================================================
// Calculs purs (sous-type financier) — réutilisés par les TESTS et par `moteur6e/
// verificationProbabilitesProblemes.ts`.
// ============================================================================

/** Écran 1 — produit (proportion×taux) pour chaque catégorie, dans l'ordre de `categories`. */
export function produitsCategories(exercice: ExerciceFamilleGFinancier): number[] {
  return exercice.categories.map((c) => c.proportion * c.taux);
}

/** Écran 2 — probabilité globale = somme des produits CORRECTS de l'écran 1. */
export function probabiliteGlobaleFinancier(exercice: ExerciceFamilleGFinancier): number {
  return produitsCategories(exercice).reduce((a, b) => a + b, 0);
}

/** Écran 3 — résultat financier = probabilité globale CORRECTE × valeur unitaire × population totale. */
export function resultatFinancier(exercice: ExerciceFamilleGFinancier): number {
  return probabiliteGlobaleFinancier(exercice) * exercice.valeurUnitaire * exercice.nombreTotalIndividus;
}
