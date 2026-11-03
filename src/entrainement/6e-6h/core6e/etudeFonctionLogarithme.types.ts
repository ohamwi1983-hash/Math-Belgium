import type { EnsembleReelGuide } from "./ensembleReel.types";
import type { CibleLimite } from "./limitesExponentielles.types";
import type { CibleAsymptote, CibleCroissance } from "./etudeFonctionExponentielle.types";

export type { CibleAsymptote, CibleCroissance } from "./etudeFonctionExponentielle.types";

/**
 * Couche core (6e) — contrat pour `6gen21` ("Étudier une fonction — synthèse, logarithmes",
 * chapitre 3, dernier générateur de ce chapitre). 5 familles logarithmiques STRUCTURELLEMENT
 * DISJOINTES (union discriminée par `famille`), toutes étudiées par les 6 MÊMES écrans que `6gen11`
 * (domaine → limites → asymptotes → croissance → concavité → graphique QCM).
 *
 * **Refonte (audit chapitre 3 de 6e, K8)** : chaque paramètre tiré change réellement au moins une
 * réponse (limites, position/nature de l'extremum, asymptotes, concavité) — l'ancienne version
 * n'avait qu'1 à 6 jeux de réponses distincts par famille. Toutes les positions demandées ont une
 * forme EXACTE (`e^{…}`, `1/(be)`, entier…), jamais un balayage numérique à la calculatrice ; la
 * forme exacte est stockée à côté de la valeur numérique (`…Latex`), pour l'affichage.
 *
 * - A — `f(x) = k(ln(x)+c)/x` (généralise l'exemple ln(x)/x du cours) : asymptotes x=0 et y=0,
 *   extremum en `e^{1-c}`, inflexion en `e^{3/2-c}`.
 * - B — `f(x) = (bx)^{ax} + c` (dérivation logarithmique) : limite finie `1+c` en 0⁺ (piège :
 *   borne finie du domaine, pas une asymptote), minimum en `1/(be)`, convexe.
 * - C — `f(x) = m·ln|x²+βx+γ|` (racines entières p±q) : domaine élargi par |·|, 2 asymptotes
 *   verticales, extremum en p, concave (m>0) ou convexe (m<0).
 * - D — `f(x) = m·ln(x²+βx+γ)` (trinôme toujours positif, (x−p)²+a²) : domaine ℝ, aucune
 *   asymptote malgré des limites infinies, extremum en p, inflexions en p±a.
 * - E — `f(x) = m(ln(x) + c/x)` : asymptote verticale x=0 seulement, extremum en c, inflexion en 2c.
 *
 * **`limites`/`asymptotes` — tableaux** dans l'ORDRE de `ui6e/formatEtudeFonctionLogarithme.ts::
 * directionLabelsLimites`/`directionLabelsAsymptotes` (2 directions, 6 pour la famille C).
 */

export type FamilleEtudeFonctionLogarithme = "A" | "B" | "C" | "D" | "E";

// ============================================================================
// Concavité généralisée (0, 1 ou 2 points d'inflexion).
// ============================================================================

export type TypeConcaviteLog = "convexe_partout" | "concave_partout" | "inflexions";

export interface CibleConcaviteLog {
  type: TypeConcaviteLog;
  /** TOUJOURS triées croissant — vide sauf si `type==="inflexions"`. */
  positions: number[];
  /** Forme exacte de chaque position, même ordre que `positions`. */
  positionsLatex: string[];
}

// ============================================================================
// Croissance famille C — tableau de signe à 4 cases fixes (domaine à 3 branches + extremum).
// ============================================================================

export type SigneCroissance = "croissante" | "decroissante";

export interface CibleCroissanceGrilleC {
  /** [(-∞,r₁), (r₁,p), (p,r₂), (r₂,+∞)] — [décr, cr, décr, cr] si m>0 (maximum local en p),
   * [cr, décr, cr, décr] si m<0 (minimum local en p). */
  signes: [SigneCroissance, SigneCroissance, SigneCroissance, SigneCroissance];
  extremum: "maximum" | "minimum";
  /** Abscisse de l'extremum (bornes des intervalles affichées à l'écran : r₁, p, r₂) — c'est donc
   * la VALEUR de l'extremum qui est demandée, pas sa position. */
  positionExtremum: number;
  valeurExtremum: number;
  valeurExtremumLatex: string;
}

// ============================================================================
// Candidats du QCM graphique — même formule que la famille, paramètres modifiés (jamais une courbe
// inventée). `reflet` : symétrique par rapport à y = `axeReflet` ; `decalageX` : f(x−decalageX)…
// voir `generateurs6e/etudeFonctionLogarithme/graphe.ts::evaluerCandidat`.
// ============================================================================

export interface CandidatEtudeLog {
  /** "reel" pour la vraie fonction ; sinon le trait distinctif du distracteur (documentation). */
  type: string;
  params: Record<string, number>;
  domaineRestreint: boolean;
  decalageX: number;
  decalageY: number;
}

interface BaseExerciceEtudeLog {
  domaine: EnsembleReelGuide;
  limites: CibleLimite[];
  asymptotes: CibleAsymptote[];
  candidats: CandidatEtudeLog[];
  indexCorrect: number;
  /** Valeurs Y à toujours garder dans le cadre du QCM (asymptote horizontale, limite finie,
   * extremum) — voir `graphe.ts::calculerViewBoxCandidats`. */
  valeursRemarquables: number[];
  concavite: CibleConcaviteLog;
}

export interface ExerciceEtudeLogA extends BaseExerciceEtudeLog {
  famille: "A";
  k: number;
  c: number;
  croissance: CibleCroissance;
  croissanceLatex: string;
}

export interface ExerciceEtudeLogB extends BaseExerciceEtudeLog {
  famille: "B";
  a: number;
  /** Coefficient de x dans la base, stocké en fraction num/den (1/2, 1, 2, 3). */
  bNum: number;
  bDen: number;
  c: number;
  croissance: CibleCroissance;
  croissanceLatex: string;
}

export interface ExerciceEtudeLogC extends BaseExerciceEtudeLog {
  famille: "C";
  m: number;
  p: number;
  q: number;
  croissance: CibleCroissanceGrilleC;
}

export interface ExerciceEtudeLogD extends BaseExerciceEtudeLog {
  famille: "D";
  m: number;
  p: number;
  a: number;
  croissance: CibleCroissance;
  croissanceLatex: string;
}

export interface ExerciceEtudeLogE extends BaseExerciceEtudeLog {
  famille: "E";
  m: number;
  c: number;
  croissance: CibleCroissance;
  croissanceLatex: string;
}

export type ExerciceEtudeLogStandard = ExerciceEtudeLogA | ExerciceEtudeLogB | ExerciceEtudeLogD | ExerciceEtudeLogE;

export type ExerciceEtudeFonctionLogarithme = ExerciceEtudeLogStandard | ExerciceEtudeLogC;

export type GenerateurExerciceEtudeFonctionLogarithme = () => ExerciceEtudeFonctionLogarithme;
