import type { ContextePannes, ContexteUnion, DemandeEcran2Pannes, ExerciceFamilleA, ExerciceFamilleAPannes, ExerciceFamilleAUnion } from "../../core6e/independanceBayes.types";

/**
 * Couche A (6e) — génération famille A ("Indépendance : produit, complément, comparaison") pour
 * `6gen32`. Probabilités stockées comme `number` DIRECTEMENT (jamais un couple entier/dénominateur)
 * — voir en-tête de `core6e/independanceBayes.types.ts` pour la justification complète.
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

// ============================================================================
// Sous-type 1 — "pannes" (deux éléments indépendants, probabilité de panne donnée).
// ============================================================================

const CONTEXTES_PANNES: readonly ContextePannes[] = [
  { id: "machines", texte: "Une usine utilise deux machines A1 et A2, indépendantes l'une de l'autre.", labelElement1: "la machine A1", labelElement2: "la machine A2", labelPanne: "tombe en panne", labelPanneNegatif: "ne tombe pas en panne" },
  { id: "ampoules", texte: "Un lampadaire est équipé de deux ampoules L1 et L2, indépendantes l'une de l'autre.", labelElement1: "l'ampoule L1", labelElement2: "l'ampoule L2", labelPanne: "grille", labelPanneNegatif: "ne grille pas" },
  { id: "capteurs", texte: "Un système d'alarme est équipé de deux capteurs C1 et C2, indépendants l'un de l'autre.", labelElement1: "le capteur C1", labelElement2: "le capteur C2", labelPanne: "tombe en panne", labelPanneNegatif: "ne tombe pas en panne" },
  { id: "serveurs", texte: "Un site web repose sur deux serveurs S1 et S2, indépendants l'un de l'autre.", labelElement1: "le serveur S1", labelElement2: "le serveur S2", labelPanne: "tombe en panne", labelPanneNegatif: "ne tombe pas en panne" },
];

/** p1/p2 — un ensemble de probabilités "réalistes" pour un taux de panne/défaut (spec : deux
 * probabilités simples données). Toujours des décimales à 2 chiffres au plus (cohérent avec la
 * tolérance 0,01 de vérification, `moteur6e/verificationProbabilites.ts`). */
const CANDIDATS_P_PANNES: readonly number[] = [0.1, 0.15, 0.2, 0.25, 0.3];

const DEMANDES_ECRAN2_PANNES: readonly DemandeEcran2Pannes[] = ["lesDeux", "aucun", "auMoinsUn", "exactementUn"];

/** Construction déterministe (demandeEcran2 fixée) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. p1 ≠ p2 toujours (retirage borné) — deux probabilités identiques
 * rendraient le sous-type "exactementUn" (double application, spec) moins instructif à distinguer
 * visuellement des deux facteurs symétriques. */
export function construireFamilleAPannes(demandeEcran2: DemandeEcran2Pannes): ExerciceFamilleAPannes {
  const contexte = tirerParmi(CONTEXTES_PANNES);
  const p1 = tirerParmi(CANDIDATS_P_PANNES);
  let p2 = tirerParmi(CANDIDATS_P_PANNES);
  for (let tentative = 0; tentative < 20 && p2 === p1; tentative++) p2 = tirerParmi(CANDIDATS_P_PANNES);
  return { famille: "A", sousType: "pannes", contexte, p1, p2, demandeEcran2 };
}

export function genererFamilleAPannes(): ExerciceFamilleAPannes {
  return construireFamilleAPannes(tirerParmi(DEMANDES_ECRAN2_PANNES));
}

// ============================================================================
// Sous-type 2 — "unionIndependance" (P(A), P(A∪B) donnés, A/B indépendants).
// ============================================================================

const CONTEXTES_UNION: readonly ContexteUnion[] = [
  { id: "promotions", texte: "Dans un magasin, on interroge un client au hasard parmi la clientèle d'une semaine. A : le client profite d'une promotion sur les vêtements. B : le client profite d'une promotion sur les chaussures. On admet que A et B sont indépendants." },
  { id: "capteursMeteo", texte: "Une station météo dispose de deux capteurs indépendants. A : le capteur de température déclenche une alerte. B : au moins un capteur de la station déclenche une alerte. On admet que A et B sont indépendants." },
  { id: "loterie", texte: "Un joueur participe à deux jeux de hasard indépendants organisés le même jour. A : il gagne au premier jeu. B : il gagne au moins un des deux jeux. On admet que A et B sont indépendants." },
];

const CANDIDATS_P_UNION: readonly number[] = [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];

/** Tire pA et pB (tous deux dans `CANDIDATS_P_UNION`), calcule pAetB=pA·pB puis pAouB=pA+pB-pAetB
 * par inclusion-exclusion — pB N'EST JAMAIS STOCKÉ dans l'exercice (c'est la valeur à retrouver à
 * l'écran 2), seuls pA et pAouB (les 2 données de l'énoncé, spec) le sont. */
export function construireFamilleAUnion(): ExerciceFamilleAUnion {
  const contexte = tirerParmi(CONTEXTES_UNION);
  const pA = tirerParmi(CANDIDATS_P_UNION);
  const pB = tirerParmi(CANDIDATS_P_UNION);
  const pAetB = pA * pB;
  const pAouB = pA + pB - pAetB;
  return { famille: "A", sousType: "unionIndependance", contexte, pA, pAouB };
}

// ============================================================================
// Point d'entrée famille A.
// ============================================================================

/** Tirage ÉQUIPROBABLE du sous-type (pannes / unionIndependance) — chacun tire ensuite son propre
 * contexte/paramètres en interne. */
export function genererFamilleA(): ExerciceFamilleA {
  return tirerParmi(["pannes", "unionIndependance"] as const) === "pannes" ? genererFamilleAPannes() : construireFamilleAUnion();
}
