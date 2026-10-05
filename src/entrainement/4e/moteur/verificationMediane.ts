/**
 * Couche B — vérification pour "Paramètres de position" (chapitre 5, quatrième générateur,
 * renommé depuis "Médiane" — voir `core/mediane.types.ts`) — `promptgen33creation.md`, puis
 * `promptgen33modifications.md` (Q1/Q3/min/max/mode(s) pour la variante "discrete", écran
 * "Polygone" remplaçant "Identifie la classe médiane" pour la variante "classes"), puis
 * `promptgen33modifications2.md` (3 écrans de lecture graphique Q1/médiane/Q3 remplaçant
 * "composantsFormule"/"calculFinal", puis un écran "Synthèse").
 *
 * Statut à 3 valeurs (`StatutVerification`) sur tous les champs numériques libres — même primitive
 * `parserNombreOuFraction` (`verificationAnalyseFonction.ts`, import moteur→moteur). Deux tolérances
 * distinctes cohabitent dans ce module (jamais confondues) : `TOLERANCE` (1e-9, bruit de virgule
 * flottante résiduel) pour toutes les valeurs EXACTES par construction (écrans "mediane"/"q1"/"q3"/
 * "minMaxMode" de la variante "discrete", écran "Synthèse" de la variante "classes") ;
 * `precisionLecture(amplitude)` (`promptgen33gen35precisionlecture.md`, VOLONTAIRE et scopée aux 3
 * SEULS écrans de lecture graphique de la variante "classes" — jamais étendue ailleurs) — une
 * tolérance PAR PALIER D'AMPLITUDE du caractère (0,1/1/5/20 selon $x_{max}-x_{min}$), plus jamais un
 * ±0,1 fixe quelle que soit l'échelle physique réelle des données : une lecture graphique par
 * interpolation continue n'a de toute façon pas la précision d'un calcul exact, et encore moins à
 * l'échelle d'un kilométrage ou d'un salaire qu'à celle d'une heure de sommeil.
 *
 * Écran "Polygone" (variante `"classes"` uniquement) : aucune saisie libre (les points sont
 * déplacés par glissement cranté sur un graphe Mafs) — `evaluerPolygone` compare directement les
 * coordonnées ENTIÈRES par égalité stricte, même principe que l'écran "trace" de "Regroupement en
 * classes et histogramme"/"construction" de "Boîte à moustaches".
 */
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import type { StatutVerification } from "./statutVerification";
import type { ExerciceMediane, ExerciceMedianeClasses, ExerciceMedianeDiscrete } from "../core/mediane.types";

const TOLERANCE = 1e-9;

function statutValeurExacte(texte: string, cible: number): StatutVerification {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

interface StatutSeuilValeur {
  seuil: StatutVerification;
  valeur: StatutVerification;
}

/** Cœur partagé des écrans "mediane"/"q1"/"q3" — même forme exacte (seuil + valeur), seul le nom
 * de champ diffère d'un écran à l'autre côté contrat de réponse. */
function diagnostiquerSeuilValeur(seuilTexte: string, seuilCible: number, valeurTexte: string, valeurCible: number): StatutSeuilValeur {
  return {
    seuil: statutValeurExacte(seuilTexte, seuilCible),
    valeur: statutValeurExacte(valeurTexte, valeurCible),
  };
}

function memeMultiensembleExact(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const bRestant = [...b];
  for (const valeur of a) {
    const index = bRestant.indexOf(valeur);
    if (index === -1) return false;
    bRestant.splice(index, 1);
  }
  return true;
}

// ============================================================================
// Écran "mediane" (les 2 variantes atteignent cet écran — "discrete" au premier écran de sa
// séquence, "classes" via le calcul final inchangé de `calculFinal` réutilisant `ExerciceMediane`
// générique) — 2 champs séparés : seuil n/2 et médiane Q2.
// ============================================================================

export interface ReponseMediane {
  seuil: string;
  mediane: string;
}

export interface StatutMediane {
  seuil: StatutVerification;
  mediane: StatutVerification;
}

export function diagnostiquerMediane(exercice: ExerciceMediane, reponse: ReponseMediane): StatutMediane {
  const s = diagnostiquerSeuilValeur(reponse.seuil, exercice.seuil, reponse.mediane, exercice.mediane);
  return { seuil: s.seuil, mediane: s.valeur };
}

export function verifierMediane(exercice: ExerciceMediane, reponse: ReponseMediane): boolean {
  const statut = diagnostiquerMediane(exercice, reponse);
  return statut.seuil === "correct" && statut.mediane === "correct";
}

// ============================================================================
// Écran "q1" (variante "discrete" uniquement, `promptgen33modifications.md`) — même structure que
// "mediane" (seuil n/4, valeur Q1), calculée DIRECTEMENT sur le tableau complet, indépendamment de
// la position de la médiane (pas de règle en cascade — divergence assumée avec gen35).
// ============================================================================

export interface ReponseQ1 {
  seuil: string;
  q1: string;
}

export interface StatutQ1 {
  seuil: StatutVerification;
  q1: StatutVerification;
}

export function diagnostiquerQ1(exercice: ExerciceMedianeDiscrete, reponse: ReponseQ1): StatutQ1 {
  const s = diagnostiquerSeuilValeur(reponse.seuil, exercice.seuilQ1, reponse.q1, exercice.q1);
  return { seuil: s.seuil, q1: s.valeur };
}

export function verifierQ1(exercice: ExerciceMedianeDiscrete, reponse: ReponseQ1): boolean {
  const statut = diagnostiquerQ1(exercice, reponse);
  return statut.seuil === "correct" && statut.q1 === "correct";
}

// ============================================================================
// Écran "q3" (variante "discrete" uniquement) — même structure, seuil 3n/4.
// ============================================================================

export interface ReponseQ3 {
  seuil: string;
  q3: string;
}

export interface StatutQ3 {
  seuil: StatutVerification;
  q3: StatutVerification;
}

export function diagnostiquerQ3(exercice: ExerciceMedianeDiscrete, reponse: ReponseQ3): StatutQ3 {
  const s = diagnostiquerSeuilValeur(reponse.seuil, exercice.seuilQ3, reponse.q3, exercice.q3);
  return { seuil: s.seuil, q3: s.valeur };
}

export function verifierQ3(exercice: ExerciceMedianeDiscrete, reponse: ReponseQ3): boolean {
  const statut = diagnostiquerQ3(exercice, reponse);
  return statut.seuil === "correct" && statut.q3 === "correct";
}

// ============================================================================
// Écran "minMaxMode" (variante "discrete" uniquement, dernière étape) — min/max en lecture directe
// (chacun son propre statut), mode(s) en interface "add-as-needed" comparée en MULTI-ENSEMBLE
// EXACT (ordre indifférent, même principe que `diagnostiquerModeMultiple`, "Mode et classe
// modale" — dupliqué, pas importé, contrats indépendants entre générateurs du chapitre).
// ============================================================================

export interface ReponseMinMaxMode {
  min: string;
  max: string;
  modes: string[];
}

export interface StatutMinMaxMode {
  min: StatutVerification;
  max: StatutVerification;
  modes: StatutVerification;
}

function statutModes(texteModes: string[], cible: number[]): StatutVerification {
  const valeurs = texteModes.map((t) => parserNombreOuFraction(t));
  if (valeurs.some((v) => v === null)) return "parse_error";
  return memeMultiensembleExact(valeurs as number[], cible) ? "correct" : "not_equivalent";
}

export function diagnostiquerMinMaxMode(exercice: ExerciceMedianeDiscrete, reponse: ReponseMinMaxMode): StatutMinMaxMode {
  return {
    min: statutValeurExacte(reponse.min, exercice.min),
    max: statutValeurExacte(reponse.max, exercice.max),
    modes: statutModes(reponse.modes, exercice.modes),
  };
}

export function verifierMinMaxMode(exercice: ExerciceMedianeDiscrete, reponse: ReponseMinMaxMode): boolean {
  const statut = diagnostiquerMinMaxMode(exercice, reponse);
  return statut.min === "correct" && statut.max === "correct" && statut.modes === "correct";
}

// ============================================================================
// Écran "polygone" (variante "classes" uniquement, remplace "identificationClasse") — aucune
// saisie libre : un point par classe, déplacé par glissement cranté sur un graphe Mafs, comparé
// par ÉGALITÉ STRICTE (coordonnées toujours entières par construction — bornes/effectifs cumulés).
// ============================================================================

export interface PointPolygone {
  x: number;
  y: number;
}

/** Un booléen par classe — `points[i]` correct ssi il coïncide EXACTEMENT avec
 * `(classes[i].borneSup, classes[i].effectifCumule)`. Exposée séparément de `verifierPolygone`
 * pour le marquage rouge en direct, point par point (même principe que `evaluerConstruction`,
 * "Boîte à moustaches"). */
export function evaluerPolygone(exercice: ExerciceMedianeClasses, points: PointPolygone[]): boolean[] {
  return exercice.classes.map((classe, i) => {
    const point = points[i];
    return point !== undefined && point.x === classe.borneSup && point.y === classe.effectifCumule;
  });
}

export function verifierPolygone(exercice: ExerciceMedianeClasses, points: PointPolygone[]): boolean {
  return evaluerPolygone(exercice, points).every(Boolean);
}

// ============================================================================
// Écrans "lectureQ1"/"lectureMediane"/"lectureQ3" (variante "classes" uniquement,
// `promptgen33modifications2.md`, remplacent "composantsFormule"/"calculFinal") — lecture GRAPHIQUE
// de la valeur du paramètre sur le polygone des effectifs cumulés déjà construit, un seul champ par
// écran (pas de champ "seuil" séparé, contrairement aux écrans "mediane"/"q1"/"q3" de la variante
// "discrete" — la démarche de calcul du seuil est ici guidée par l'aide, jamais un second champ
// noté). Tolérance PAR PALIER D'AMPLITUDE (`promptgen33gen35precisionlecture.md`), jamais l'égalité
// exacte du reste du chapitre (lecture graphique par interpolation continue).
// ============================================================================

export type ParametreLecture = "q1" | "mediane" | "q3";

/**
 * Palier de précision de lecture selon l'amplitude du caractère ($x_{max}-x_{min}$,
 * `exercice.etendue`) — `promptgen33gen35precisionlecture.md`, table de paliers (≤20→0,1 ;
 * 20–100→1 ; 100–1000→5 ; >1000→20). Gouverne à la fois l'arrondi de la cible mediane/q1/q3 en
 * Couche A (`generateurs/mediane/index.ts`/`generateurs/exerciceSynthese/index.ts`, dupliquée là,
 * pas importée — règle Couche A↔B), la tolérance de vérification ci-dessous, et le libellé de
 * consigne (`ui/formatMediane.ts::libellePrecisionLecture`).
 *
 * **Ne gouverne jamais le pas de snap Y (compte) de la barre de seuil déplaçable**
 * (`PAS_SNAP_BARRE`, `LectureQuartileGraph.tsx`, reste fixé à 0,1) — les deux axes du graphe sont
 * réellement indépendants : Y (l'effectif cumulé, un compte) est positionné à un seuil `n/2`/`n/4`/
 * `3n/4` toujours multiple de 0,5 dès que `n` est pair (garanti par construction en Couche A,
 * Correction 1), donc toujours exactement positionnable au pas 0,1 quel que soit le palier
 * d'amplitude physique ; X (la valeur du caractère, lue par interpolation continue à l'intersection
 * avec la courbe, jamais elle-même snappée) est ce que ce palier gouverne. Un pas de snap Y devenu
 * plus grossier pour un palier élevé casserait au contraire le positionnement exact du seuil que la
 * Correction 1 vient de garantir — les deux corrections restent donc cumulatives sans jamais se
 * contredire, exactement la distinction "axe vertical / axe horizontal" de la spec elle-même.
 */
export function precisionLecture(amplitude: number): number {
  if (amplitude <= 20) return 0.1;
  if (amplitude <= 100) return 1;
  if (amplitude <= 1000) return 5;
  return 20;
}

/** Tolérance de vérification — choisie ÉGALE au pas de précision du palier lui-même (jamais sa
 * moitié, l'une des règles explicitement laissées libres par la spec, "à documenter") : préserve
 * EXACTEMENT le comportement historique ±0,1 pour le palier ≤20 (le plus fréquent sous la
 * génération actuelle des classes, dont l'étendue reste bornée à [8,25] — voir la note d'en-tête de
 * `generateurs/mediane/index.ts` ; le palier "1" (20–100) y est lui aussi réellement atteint, ~6%
 * des tirages, vérifié empiriquement, jamais un cas purement théorique), et reste proportionnée aux
 * paliers supérieurs sans jamais devenir plus stricte qu'avant pour aucun exercice existant. */
export function toleranceLecture(exercice: ExerciceMedianeClasses): number {
  return precisionLecture(exercice.etendue);
}

function statutValeurTolerance(texte: string, cible: number, tolerance: number): StatutVerification {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return "parse_error";
  return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
}

/** Seuil correspondant au paramètre — utilisé côté présentation (aide) pour rappeler le calcul
 * attendu, jamais soumis par l'élève (un seul champ par écran, voir en-tête de section). */
export function seuilLecture(exercice: ExerciceMedianeClasses, parametre: ParametreLecture): number {
  if (parametre === "q1") return exercice.seuilQ1;
  if (parametre === "q3") return exercice.seuilQ3;
  return exercice.seuil;
}

export function valeurCibleLecture(exercice: ExerciceMedianeClasses, parametre: ParametreLecture): number {
  if (parametre === "q1") return exercice.q1;
  if (parametre === "q3") return exercice.q3;
  return exercice.mediane;
}

export function diagnostiquerLecture(exercice: ExerciceMedianeClasses, parametre: ParametreLecture, texte: string): StatutVerification {
  return statutValeurTolerance(texte, valeurCibleLecture(exercice, parametre), toleranceLecture(exercice));
}

export function verifierLecture(exercice: ExerciceMedianeClasses, parametre: ParametreLecture, texte: string): boolean {
  return diagnostiquerLecture(exercice, parametre, texte) === "correct";
}

// ============================================================================
// Écran "synthese" (variante "classes" uniquement, dernière étape, `promptgen33modifications2.md`)
// — xMin/xMax/étendue en lecture directe (tolérance exacte, comme le reste du chapitre — jamais la
// tolérance de lecture graphique ci-dessus, hors de portée de ce seul écran), classe modale
// CATÉGORIELLE, mode = centre de la classe modale VÉRIFIÉ INDÉPENDAMMENT (jamais dérivé de la
// réponse donnée au champ "Classe modale" — pas de chaînage entre les deux champs).
// ============================================================================

export interface ReponseSynthese {
  xMin: string;
  xMax: string;
  etendue: string;
  /** `null` tant qu'aucune classe n'a encore été choisie. */
  classeModale: number | null;
  mode: string;
}

export interface StatutSynthese {
  xMin: StatutVerification;
  xMax: StatutVerification;
  etendue: StatutVerification;
  classeModale: boolean;
  mode: StatutVerification;
}

export function diagnostiquerSynthese(exercice: ExerciceMedianeClasses, reponse: ReponseSynthese): StatutSynthese {
  return {
    xMin: statutValeurExacte(reponse.xMin, exercice.xMin),
    xMax: statutValeurExacte(reponse.xMax, exercice.xMax),
    etendue: statutValeurExacte(reponse.etendue, exercice.etendue),
    classeModale: reponse.classeModale === exercice.indexClasseModale,
    mode: statutValeurExacte(reponse.mode, exercice.modeCentreClasseModale),
  };
}

export function verifierSynthese(exercice: ExerciceMedianeClasses, reponse: ReponseSynthese): boolean {
  const statut = diagnostiquerSynthese(exercice, reponse);
  return statut.xMin === "correct" && statut.xMax === "correct" && statut.etendue === "correct" && statut.classeModale && statut.mode === "correct";
}
