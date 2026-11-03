import type { CibleAsymptote, CibleConcaviteLog, CibleCroissanceGrilleC, ExerciceEtudeFonctionLogarithme, SigneCroissance, TypeConcaviteLog } from "../core6e/etudeFonctionLogarithme.types";
import type { CibleCroissance, TypeCroissance } from "../core6e/etudeFonctionExponentielle.types";
import type { CibleLimite } from "../core6e/limitesExponentielles.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquivalenceFonction, diagnostiquerValeur, evaluerExpressionExponentielle } from "./equivalenceExponentielle";
import type { ReponseLimite } from "./verificationLimitesExponentielles";

/**
 * Couche B (6e) — vérification pour `6gen21`. N'importe jamais rien de `src/generateurs6e/`.
 *
 * Réutilise `verifierEnsembleReelGuide` (domaine) et les comparaisons numériques partagées de
 * `equivalenceExponentielle.ts`. Les positions (extremum, inflexions) s'acceptent en forme exacte
 * (`1/e`, `e^(3/2)`, `sqrt(e)`, `1/(2e)`…) ou arrondies au centième (tolérance 0,01).
 */

const TOLERANCE = 0.01;
const POINTS_OBLIQUE = [-3.3, -1.7, 1.1, 2.9];

// ============================================================================
// Écran "domaine".
// ============================================================================

export function verifierEcranDomaine(exercice: ExerciceEtudeFonctionLogarithme, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.domaine);
}

// ============================================================================
// Écran "limites" — 2 directions (6 pour la famille C). Une limite nulle s'accepte aussi bien par
// le bouton « 0 » que par « Valeur finie » + 0.
// ============================================================================

export function verifierLimite(cible: CibleLimite, reponse: ReponseLimite): boolean {
  if (cible.type === "valeur") return reponse.type === "valeur" && diagnostiquerValeur(reponse.texte, cible.valeur, TOLERANCE) === "correct";
  if (cible.type === "zero") return reponse.type === "zero" || (reponse.type === "valeur" && diagnostiquerValeur(reponse.texte, 0, TOLERANCE) === "correct");
  return reponse.type === cible.type;
}

export function verifierEcranLimites(exercice: ExerciceEtudeFonctionLogarithme, reponse: ReponseLimite[]): boolean {
  const cibles = exercice.limites;
  if (reponse.length !== cibles.length) return false;
  return cibles.every((c, i) => verifierLimite(c, reponse[i]));
}

// ============================================================================
// Écran "asymptotes" — "existe/n'existe pas" + équation texte libre. Famille C : les 2 asymptotes
// verticales s'acceptent dans n'importe quel ordre (étiquettes neutres côté écran).
// ============================================================================

export interface ReponseAsymptoteDirection {
  existe: boolean;
  /** ignoré si `existe===false`. */
  texte: string;
}

/** Retire les espaces et un éventuel préfixe « AV : », « AH : »… avant l'équation. */
function nettoyerEquation(texte: string): string {
  return texte.replace(/^\s*a[vho]\s*[:≡]\s*/i, "").trim();
}

export function verifierEquationAsymptote(texte: string, cible: CibleAsymptote): boolean {
  const propre = nettoyerEquation(texte);
  const i = propre.indexOf("=");
  if (i === -1) return false;
  const gauche = propre.slice(0, i).trim().toLowerCase();
  const droite = propre.slice(i + 1);
  if (cible.type === "horizontale") return gauche === "y" && diagnostiquerValeur(droite, cible.valeur, TOLERANCE) === "correct";
  if (cible.type === "verticale") return gauche === "x" && diagnostiquerValeur(droite, cible.p, TOLERANCE) === "correct";
  if (cible.type === "oblique") return gauche === "y" && diagnostiquerEquivalenceFonction(droite, (x) => cible.a * x + cible.b, POINTS_OBLIQUE, TOLERANCE) === "correct";
  return false;
}

function verifierDirection(cible: CibleAsymptote, reponse: ReponseAsymptoteDirection): boolean {
  if (cible.type === "aucune") return reponse.existe === false;
  return reponse.existe && verifierEquationAsymptote(reponse.texte, cible);
}

export function verifierEcranAsymptotes(exercice: ExerciceEtudeFonctionLogarithme, reponse: ReponseAsymptoteDirection[]): boolean {
  const cibles = exercice.asymptotes;
  if (reponse.length !== cibles.length) return false;
  if (exercice.famille === "C") {
    const [a, b] = cibles;
    return (verifierDirection(a, reponse[0]) && verifierDirection(b, reponse[1])) || (verifierDirection(b, reponse[0]) && verifierDirection(a, reponse[1]));
  }
  return cibles.every((c, i) => verifierDirection(c, reponse[i]));
}

// ============================================================================
// Écran "croissance" — "standard" (catégorie + position) pour A/B/D/E, "grilleC" (tableau de signe
// à 4 cases + VALEUR de l'extremum local — sa position est une borne affichée) pour C.
// ============================================================================

export interface ReponseCroissanceStandard {
  type: TypeCroissance;
  /** texte libre, ignoré si `cible.position===null`. */
  position: string;
}

export function verifierEcranCroissanceStandard(cible: CibleCroissance, reponse: ReponseCroissanceStandard): boolean {
  if (reponse.type !== cible.type) return false;
  if (cible.position === null) return true;
  return diagnostiquerValeur(reponse.position, cible.position, TOLERANCE) === "correct";
}

export interface ReponseCroissanceGrilleC {
  signes: SigneCroissance[];
  /** Valeur de l'extremum local, f(p). */
  valeurExtremum: string;
}

export function verifierEcranCroissanceGrilleC(cible: CibleCroissanceGrilleC, reponse: ReponseCroissanceGrilleC): boolean {
  if (reponse.signes.length !== cible.signes.length) return false;
  if (!cible.signes.every((s, i) => s === reponse.signes[i])) return false;
  return diagnostiquerValeur(reponse.valeurExtremum, cible.valeurExtremum, TOLERANCE) === "correct";
}

// ============================================================================
// Écran "concavité" — 0, 1 ou 2 points d'inflexion (liste ordre-indifférente).
// ============================================================================

export interface ReponseConcaviteLog {
  type: TypeConcaviteLog;
  /** texte libre par position, ignoré si `cible.type !== "inflexions"`. */
  positionsTexte: string[];
}

export function verifierEcranConcavite(cible: CibleConcaviteLog, reponse: ReponseConcaviteLog): boolean {
  if (reponse.type !== cible.type) return false;
  if (cible.type !== "inflexions") return true;
  return diagnostiquerEnsembleValeurs(reponse.positionsTexte, cible.positions, TOLERANCE) === "correct";
}

// ============================================================================
// Écran "graphique" — QCM à 4 courbes.
// ============================================================================

export function verifierEcranGraphique(exercice: ExerciceEtudeFonctionLogarithme, indexChoisi: number): boolean {
  return indexChoisi === exercice.indexCorrect;
}

export { evaluerExpressionExponentielle };
