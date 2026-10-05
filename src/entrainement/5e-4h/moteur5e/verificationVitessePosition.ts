/**
 * Couche B (5e) — vérification pour 5gen35 ("Vitesse et position"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Réplique localement (jamais importée) `valeurPosition`/`valeurVitesseExacte`
 * (`generateurs5e/vitessePosition/index.ts`) — même patron que `verificationTangentes.ts`/
 * `verificationDefinitionDerivee.ts` répliquant les évaluateurs numériques purs de leur générateur
 * respectif.
 *
 * Écran "derivee" (v(t)=e'(t)) : vérifiée par DIFFÉRENCE FINIE CENTRÉE de `valeurPosition`, MÊME
 * TECHNIQUE que `diagnostiquerCalculerDerivee` (`verificationFonctionDerivee.ts`, 5gen27) — jamais
 * une 2e formule symbolique côté moteur, évite de dupliquer la logique de dérivation une 2e fois.
 * e(t) étant un simple polynôme quadratique (contrairement à 5gen27), pas besoin de l'évaluateur
 * RADIANS/sin/cos de ce fichier — uniquement la technique de différence finie, adaptée ici.
 */
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";

// ============================================================================
// Réplique locale de la Couche A — jamais importée.
// ============================================================================

export function valeurPosition(exercice: ExerciceVitessePosition, t: number): number {
  return (exercice.a / 2) * t * t + exercice.b * t;
}

export function valeurVitesseExacte(exercice: ExerciceVitessePosition, t: number): number {
  return exercice.a * t + exercice.b;
}

// ============================================================================
// Champ symbolique en "t" — l'évaluateur générique de la plateforme ne connaît que "x"
// (`moteur/expressionGenerale.ts`) : substitution littérale "t"→"x" AVANT délégation, frontière
// sur les LETTRES seulement (jamais les chiffres — même technique que `diagnostiquerConstructionC`,
// `verificationLimitesContexte.ts`, pour ne jamais casser un coefficient collé comme "3t").
// ============================================================================

const SUBSTITUTION_T = /(?<![a-zA-Z])t(?![a-zA-Z])/g;

function evaluerEnT(texte: string, tValeur: number): number {
  const substitue = texte.replace(SUBSTITUTION_T, `(${tValeur})`);
  return evaluerExpressionGenerale(substitue, 0);
}

// ============================================================================
// Écran "derivee" — différence finie centrée de `valeurPosition`, échantillonnée sur plusieurs t,
// tous strictement positifs (e(t) n'a de sens physique que pour t≥0 — rester sur ce domaine évite
// tout point d'échantillonnage hors du champ d'interprétation du contexte narratif).
// ============================================================================
const CANDIDATS_T = [0.6, 1.4, 2.3, 3.7, 0.9, 5.1, 2.85, 4.35];
const EPS_DIFFERENCE_FINIE = 1e-4;
const TOLERANCE = 1e-2;
const MIN_POINTS_VALIDES = 3;

function deriveeParDifferenceFinie(exercice: ExerciceVitessePosition, t: number): number {
  const gauche = valeurPosition(exercice, t - EPS_DIFFERENCE_FINIE);
  const droite = valeurPosition(exercice, t + EPS_DIFFERENCE_FINIE);
  return (droite - gauche) / (2 * EPS_DIFFERENCE_FINIE);
}

export function diagnostiquerDeriveeVitesse(texte: string, exercice: ExerciceVitessePosition): StatutVerification {
  try {
    let nbValides = 0;
    for (const t of CANDIDATS_T) {
      const cible = deriveeParDifferenceFinie(exercice, t);
      const valeurEntree = evaluerEnT(texte, t);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      nbValides++;
      if (Math.abs(valeurEntree - cible) > TOLERANCE) return "not_equivalent";
    }
    return nbValides >= MIN_POINTS_VALIDES ? "correct" : "parse_error";
  } catch {
    return "parse_error";
  }
}

// ============================================================================
// Champs numériques — 3 niveaux de tolérance, chacun correspondant à une annonce de précision
// RÉELLEMENT tenue côté consigne (`ui5e/formatVitessePosition.ts`) — convention CLAUDE.md,
// "Annonce de précision = tolérance réellement vérifiée".
// ============================================================================

function diagnostiquerValeur(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

/** Valeur EXACTE attendue (v(t0), v(tCible), les 2 racines de l'équation) — tolérance flottante
 * minimale, jamais annoncée comme "arrondie" dans la consigne (résultat exact par construction). */
export function diagnostiquerNombreExact(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeur(texte, cible, 0.01);
}

/** Valeur généralement NON exacte (conversion m/s→km/h, division D2/v(tCible), somme t1+t2) —
 * tolérance RELATIVE `max(0.05, |cible|·0.01)`, même convention que `formatTriangleQuelconque.ts`/
 * `verificationTriangleLies.ts` ("une valeur approchée est acceptée, à environ 1 % près"). */
export function diagnostiquerNombreApprox(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeur(texte, cible, Math.max(0.05, Math.abs(cible) * 0.01));
}

// ============================================================================
// Écran "resoudre" — 2 champs numériques (les 2 racines de e(t)=distanceCible, ENSEMBLE, ordre
// indifférent — même patron que `verifierRacinesHorizontale`, `verificationTangentes.ts`) + 1 QCM
// "pourquoi rejeter la racine négative" (index dans `exercice.optionsRejetRacine`).
// ============================================================================

/** Diagnostic PAR CHAMP (surlignage rouge individuel) — correct si la valeur saisie correspond à
 * L'UNE des 2 racines attendues, peu importe la position du champ. */
export function diagnostiquerRacineChamp(texte: string, exercice: ExerciceVitessePosition): StatutVerification {
  const base = diagnostiquerNombreExact(texte, exercice.tCible);
  if (base === "correct") return "correct";
  const alt = diagnostiquerNombreExact(texte, exercice.racineRejetee);
  if (alt === "correct") return "correct";
  return base === "parse_error" ? "parse_error" : alt;
}

/** Vérification COMBINÉE des 2 racines — ENSEMBLE exact, ordre indifférent. */
export function verifierRacinesEquation(reponses: [string, string], exercice: ExerciceVitessePosition): boolean {
  const direct =
    diagnostiquerNombreExact(reponses[0], exercice.tCible) === "correct" && diagnostiquerNombreExact(reponses[1], exercice.racineRejetee) === "correct";
  if (direct) return true;
  return diagnostiquerNombreExact(reponses[0], exercice.racineRejetee) === "correct" && diagnostiquerNombreExact(reponses[1], exercice.tCible) === "correct";
}

/** QCM justification — correct ssi l'option choisie (par index dans `exercice.optionsRejetRacine`,
 * ordre déjà mélangé et fixé à la construction) est celle marquée `correcte:true`. */
export function verifierJustificationRejet(indexChoisi: number | null, exercice: ExerciceVitessePosition): boolean {
  if (indexChoisi === null) return false;
  return exercice.optionsRejetRacine[indexChoisi]?.correcte === true;
}

/** Réponse combinée de l'écran "resoudre" — 2 champs numériques (les 2 racines, ordre
 * indifférent) + 1 choix QCM (index dans `exercice.optionsRejetRacine`, `null` tant qu'aucune
 * option n'est sélectionnée). */
export interface ReponseResoudre {
  racines: [string, string];
  justificationIndex: number | null;
}

/** Vérification combinée de l'écran "resoudre" entier — les 2 racines ET la justification. */
export function verifierEcranResoudre(reponses: ReponseResoudre, exercice: ExerciceVitessePosition): boolean {
  return verifierRacinesEquation(reponses.racines, exercice) && verifierJustificationRejet(reponses.justificationIndex, exercice);
}

// ============================================================================
// Écrans numériques simples (evaluerV0, vitessePointe, conversion, segmentConstant, tempsTotal).
// ============================================================================

export function diagnostiquerEvaluerV0(texte: string, exercice: ExerciceVitessePosition): StatutVerification {
  return diagnostiquerNombreExact(texte, valeurVitesseExacte(exercice, exercice.t0));
}

export function diagnostiquerVitessePointe(texte: string, exercice: ExerciceVitessePosition): StatutVerification {
  return diagnostiquerNombreExact(texte, valeurVitesseExacte(exercice, exercice.tCible));
}

const FACTEUR_MS_VERS_KMH = 3.6;

/** Écran "conversion" (variante A uniquement) — v(tCible) en m/s converti en km/h. */
export function diagnostiquerConversionKmh(texte: string, exercice: ExerciceVitessePosition): StatutVerification {
  const vMs = valeurVitesseExacte(exercice, exercice.tCible);
  return diagnostiquerNombreApprox(texte, vMs * FACTEUR_MS_VERS_KMH);
}

/** Écran "segmentConstant" (variante B uniquement) — t2 = D2 / v(tCible), vitesse CONSTANTE sur le
 * segment restant (changement de modèle, e(t) abandonnée). */
export function diagnostiquerSegmentConstant(texte: string, exercice: ExerciceVitessePosition): StatutVerification {
  if (exercice.variante !== "B") throw new Error('diagnostiquerSegmentConstant : exercice hors variante "B"');
  const vPointe = valeurVitesseExacte(exercice, exercice.tCible);
  return diagnostiquerNombreApprox(texte, exercice.D2 / vPointe);
}

/** Écran "tempsTotal" (variante B uniquement) — tCible + t2 (t2 recalculé exactement, jamais
 * réutilisé depuis la saisie élève de l'écran précédent). */
export function diagnostiquerTempsTotal(texte: string, exercice: ExerciceVitessePosition): StatutVerification {
  if (exercice.variante !== "B") throw new Error('diagnostiquerTempsTotal : exercice hors variante "B"');
  const vPointe = valeurVitesseExacte(exercice, exercice.tCible);
  const t2 = exercice.D2 / vPointe;
  return diagnostiquerNombreApprox(texte, exercice.tCible + t2);
}
