import type {
  CibleAsymptote,
  CibleConcavite,
  CibleCroissance,
  ExerciceEtudeFonctionExponentielle,
  TypeConcavite,
  TypeCroissance,
} from "../core6e/etudeFonctionExponentielle.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";
import { diagnostiquerEquivalenceFonction, diagnostiquerValeur, evaluerExpressionExponentielle } from "./equivalenceExponentielle";
import { verifierReponseLimite } from "./verificationLimitesExponentielles";
import type { ReponseLimite } from "./verificationLimitesExponentielles";

/**
 * Couche B (6e) — vérification pour `6gen11`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationEtudeFonctionExponentielle.test.ts` pour la preuve avec des exercices factices
 * définis localement.
 *
 * **Réutilisation directe (moteur→moteur, même chantier)** — `verifierReponseLimite`/`ReponseLimite`
 * (`./verificationLimitesExponentielles`, `6gen6`) pour les écrans "limites" (statuts +∞/−∞/0/
 * valeur, déjà tout ce dont ce générateur a besoin) et `verifierEnsembleReelGuide`
 * (`./verificationEnsembleReel`, partagé par `6gen1`/`6gen3`/`6gen7`) pour l'écran "domaine" —
 * jamais réimplémentés.
 *
 * **Écran "asymptotes" — équation TEXTE LIBRE, jamais les mécanismes ∅/ℝ/intervalle** (décision de
 * conception explicite, voir `core6e/etudeFonctionExponentielle.types.ts`) : `verifierEquationAsymptote`
 * exige que le texte soumis commence par `y=`/`x=` selon le type d'asymptote (horizontale/oblique
 * → `y=...` ; verticale → `x=...`), puis compare le second membre à la cible par équivalence
 * NUMÉRIQUE (`diagnostiquerValeur` pour une constante, `diagnostiquerEquivalenceFonction` pour une
 * droite oblique) — réutilise `separerEquationTexte`-like logique via un split sur `=` local (le
 * séparateur `separerEquationTexte` de `equivalenceExponentielle.ts` gère `<`/`>`/`≤`/`≥` en plus,
 * inutiles ici — un simple split sur le PREMIER `=` suffit et reste plus direct).
 */

const TOLERANCE = 0.01;
const POINTS_OBLIQUE = [-3.3, -1.7, 1.1, 2.9];

// ============================================================================
// Écran "domaine" — délégation directe à `verifierEnsembleReelGuide`.
// ============================================================================

export function verifierEcranDomaine(exercice: ExerciceEtudeFonctionExponentielle, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.domaine);
}

// ============================================================================
// Écran "limites" — 2 champs (A/C/D) ou 4 champs (B, le plus dense — voir décision de conception
// explicite, CLAUDE.md).
// ============================================================================

export type ReponseLimites =
  | { type: "deux"; plusInfini: ReponseLimite; moinsInfini: ReponseLimite }
  | { type: "quatre"; pointPlus: ReponseLimite; pointMoins: ReponseLimite; plusInfini: ReponseLimite; moinsInfini: ReponseLimite };

export function verifierEcranLimites(exercice: ExerciceEtudeFonctionExponentielle, reponse: ReponseLimites): boolean {
  if (exercice.famille === "B") {
    if (reponse.type !== "quatre") return false;
    return (
      verifierReponseLimite(exercice.limitePointPlus, reponse.pointPlus) &&
      verifierReponseLimite(exercice.limitePointMoins, reponse.pointMoins) &&
      verifierReponseLimite(exercice.limitePlusInfini, reponse.plusInfini) &&
      verifierReponseLimite(exercice.limiteMoinsInfini, reponse.moinsInfini)
    );
  }
  if (reponse.type !== "deux") return false;
  return verifierReponseLimite(exercice.limitePlusInfini, reponse.plusInfini) && verifierReponseLimite(exercice.limiteMoinsInfini, reponse.moinsInfini);
}

// ============================================================================
// Écran "asymptotes" — équation texte libre par direction (A/C/D) ou côté+équation (B).
// ============================================================================

export interface ReponseAsymptoteDirection {
  existe: boolean;
  /** ignoré si `existe===false`. */
  texte: string;
}

export type ReponseAsymptotes =
  | { type: "deux"; plusInfini: ReponseAsymptoteDirection; moinsInfini: ReponseAsymptoteDirection }
  | { type: "b"; cote: "plus" | "moins"; texteHorizontale: string };

function verifierEquationAsymptote(texte: string, cible: CibleAsymptote): boolean {
  const i = texte.indexOf("=");
  if (i === -1) return false;
  const gauche = texte.slice(0, i).trim().toLowerCase();
  const droite = texte.slice(i + 1);
  if (cible.type === "horizontale") {
    return gauche === "y" && diagnostiquerValeur(droite, cible.valeur, TOLERANCE) === "correct";
  }
  if (cible.type === "verticale") {
    return gauche === "x" && diagnostiquerValeur(droite, cible.p, TOLERANCE) === "correct";
  }
  if (cible.type === "oblique") {
    if (gauche !== "y") return false;
    return diagnostiquerEquivalenceFonction(droite, (x) => cible.a * x + cible.b, POINTS_OBLIQUE, TOLERANCE) === "correct";
  }
  return false; // cible.type === "aucune" — jamais atteint (traité par verifierAsymptoteDirection avant d'appeler ceci).
}

function verifierAsymptoteDirection(cible: CibleAsymptote, reponse: ReponseAsymptoteDirection): boolean {
  if (cible.type === "aucune") return reponse.existe === false;
  if (!reponse.existe) return false;
  return verifierEquationAsymptote(reponse.texte, cible);
}

export function verifierEcranAsymptotes(exercice: ExerciceEtudeFonctionExponentielle, reponse: ReponseAsymptotes): boolean {
  if (exercice.famille === "B") {
    if (reponse.type !== "b") return false;
    return reponse.cote === exercice.coteAsymptoteVerticale && verifierEquationAsymptote(reponse.texteHorizontale, exercice.asymptoteHorizontale);
  }
  if (reponse.type !== "deux") return false;
  return verifierAsymptoteDirection(exercice.asymptotePlusInfini, reponse.plusInfini) && verifierAsymptoteDirection(exercice.asymptoteMoinsInfini, reponse.moinsInfini);
}

// ============================================================================
// Écran "croissance" — commun aux 4 familles (même champ `exercice.croissance` sur l'union).
// ============================================================================

export interface ReponseCroissance {
  type: TypeCroissance;
  /** texte libre, ignoré si `cible.position===null`. */
  position: string;
}

export function verifierEcranCroissance(exercice: ExerciceEtudeFonctionExponentielle, reponse: ReponseCroissance): boolean {
  return verifierCible(exercice.croissance, reponse.type, reponse.position);
}

function verifierCible(cible: CibleCroissance | CibleConcavite, type: string, position: string): boolean {
  if (type !== cible.type) return false;
  if (cible.position === null) return true;
  return diagnostiquerValeur(position, cible.position, TOLERANCE) === "correct";
}

// ============================================================================
// Écran "concavité" — commun aux 4 familles (même champ `exercice.concavite`). Toute vérification
// de cet écran est ACCOMPAGNÉE, côté présentation, d'une aide niveau 1 rappelant EXPLICITEMENT la
// méthode (signe de f'' : positif ⟹ convexe, négatif ⟹ concave, changement de signe ⟹ inflexion)
// — décision de conception explicite (première apparition de la concavité sur la plateforme), voir
// `ui6e/formatEtudeFonctionExponentielle.ts`.
// ============================================================================

export interface ReponseConcavite {
  type: TypeConcavite;
  /** texte libre, ignoré si `cible.position===null`. */
  position: string;
}

export function verifierEcranConcavite(exercice: ExerciceEtudeFonctionExponentielle, reponse: ReponseConcavite): boolean {
  return verifierCible(exercice.concavite, reponse.type, reponse.position);
}

// ============================================================================
// Écran "graphique" — QCM, même principe que 6gen5/6gen8 : comparaison directe de l'index choisi à
// `indexCorrect`, déterminé à la génération avant randomisation.
// ============================================================================

export function verifierEcranGraphique(exercice: ExerciceEtudeFonctionExponentielle, indexChoisi: number): boolean {
  return indexChoisi === exercice.indexCorrect;
}

export { evaluerExpressionExponentielle };
