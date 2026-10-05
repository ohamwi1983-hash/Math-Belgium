/**
 * Couche B — vérification pour "Orthogonalité et théorème de Pythagore généralisé" (chapitre
 * "Calcul vectoriel"), réécriture complète (`promptcreationgenerateur25orthogonalitepythagore.md`),
 * puis corrections (`promptcorrectionsgenerateur25complet.md`).
 *
 * Statut à 3 valeurs (`StatutVerification`) sur tous les champs numériques/symboliques libres. Les
 * champs CATÉGORIELS ("orthogonaux/non orthogonaux", "rectangle en A/B/C/pas rectangle", sommet
 * résoluble) ont leur PROPRE logique booléenne, jamais le statut à 3 valeurs (aucune saisie
 * libre pour eux, donc aucun risque de `parse_error`) — même principe que "Colinéarité et
 * alignement de points" (générateur 24).
 */
import type {
  ExerciceOrthogonaliteParametre,
  ExerciceOrthogonaliteTest,
  ExerciceOrthogonaliteTriangle,
  ExerciceOrthogonaliteTriangleParametre,
  LinExpr,
  Reduction,
  Sommet,
} from "../core/orthogonalite.types";
import { diagnostiquerFormeCanonique, evaluerExpression } from "./expressionAlgebrique";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 0.01;

function statutNumerique(valeur: number, cible: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

/** Points d'échantillonnage non entiers, même principe que `colinearite/verificationColinearite.ts`
 * — module FRÈRE, dupliqué ici (contrats indépendants entre générateurs du chapitre). */
const POINTS_ECHANTILLON = [0.37, 1.53, -0.82, 2.19, -1.41];

/**
 * Vérifie qu'une expression saisie librement (une composante de vecteur — jamais une équation,
 * jamais de "=0" attendu) coïncide EXACTEMENT avec la cible `coefX·x+constante` en tout point —
 * `promptcorrectionsgenerateur25complet.md`, point 1. Réutilise `evaluerExpression`
 * (`expressionAlgebrique.ts`, exercice 1) plutôt qu'un parseur dédié.
 */
export function diagnostiquerComposanteLineaire(texte: string, cible: LinExpr): StatutVerification {
  let valeurs: number[];
  try {
    valeurs = POINTS_ECHANTILLON.map((x) => evaluerExpression(texte, x));
  } catch {
    return "parse_error";
  }
  if (valeurs.some((v) => !Number.isFinite(v))) return "parse_error";
  const correspond = POINTS_ECHANTILLON.every((x, i) => Math.abs(valeurs[i] - (cible.coefX * x + cible.constante)) <= TOLERANCE);
  return correspond ? "correct" : "not_equivalent";
}

// ============================================================================
// Écran "test" — variante 1 : critère numérique + conclusion catégorielle
// ============================================================================

export interface ReponseTest {
  critere: number;
  conclusion: boolean;
}

export function critereReelTest(exercice: ExerciceOrthogonaliteTest): number {
  return exercice.critere;
}

export function conclusionAttendueTest(exercice: ExerciceOrthogonaliteTest): boolean {
  return exercice.orthogonaux;
}

export function diagnostiquerCritereTest(exercice: ExerciceOrthogonaliteTest, valeur: number): StatutVerification {
  return statutNumerique(valeur, critereReelTest(exercice));
}

export function verifierConclusionTest(exercice: ExerciceOrthogonaliteTest, reponse: boolean): boolean {
  return reponse === conclusionAttendueTest(exercice);
}

export function evaluerTest(exercice: ExerciceOrthogonaliteTest, reponse: ReponseTest): { critere: StatutVerification; conclusion: boolean } {
  return { critere: diagnostiquerCritereTest(exercice, reponse.critere), conclusion: verifierConclusionTest(exercice, reponse.conclusion) };
}

export function verifierTest(exercice: ExerciceOrthogonaliteTest, reponse: ReponseTest): boolean {
  const e = evaluerTest(exercice, reponse);
  return e.critere === "correct" && e.conclusion;
}

// ============================================================================
// Écrans "reduction"/"resolution" — variante 2. Depuis
// `promptcorrectionsgenerateur25lot3.md`, point 1 (transposition du lot3 du générateur 24) :
// l'écran "réduction" attend désormais un seul champ de saisie libre pour l'équation réduite
// complète, exactement le même principe que `diagnostiquerReductionSommet` ci-dessous (variante 4)
// — cette variante garantit toujours exactement une solution (`solutionX` jamais `null`, voir
// `core/orthogonalite.types.ts`), donc `a=0` (degré 1) systématiquement.
// ============================================================================

export function diagnostiquerReductionParametre(exercice: ExerciceOrthogonaliteParametre, texte: string): StatutVerification {
  return diagnostiquerFormeCanonique(texte, { a: 0, b: exercice.coefX, c: exercice.coefConst });
}

export function verifierReductionParametre(exercice: ExerciceOrthogonaliteParametre, texte: string): boolean {
  return diagnostiquerReductionParametre(exercice, texte) === "correct";
}

export function diagnostiquerResolutionParametre(exercice: ExerciceOrthogonaliteParametre, valeur: number): StatutVerification {
  return statutNumerique(valeur, exercice.solutionX);
}

export function verifierResolutionParametre(exercice: ExerciceOrthogonaliteParametre, valeur: number): boolean {
  return diagnostiquerResolutionParametre(exercice, valeur) === "correct";
}

// ============================================================================
// Écrans variante 3 — triangle (coordonnées numériques)
// ============================================================================

export interface ReponseConstructionTriangle {
  abX: number;
  abY: number;
  acX: number;
  acY: number;
  bcX: number;
  bcY: number;
}

export function evaluerConstructionTriangle(
  exercice: ExerciceOrthogonaliteTriangle,
  reponse: ReponseConstructionTriangle,
): Record<keyof ReponseConstructionTriangle, StatutVerification> {
  return {
    abX: statutNumerique(reponse.abX, exercice.vecteurAB.x),
    abY: statutNumerique(reponse.abY, exercice.vecteurAB.y),
    acX: statutNumerique(reponse.acX, exercice.vecteurAC.x),
    acY: statutNumerique(reponse.acY, exercice.vecteurAC.y),
    bcX: statutNumerique(reponse.bcX, exercice.vecteurBC.x),
    bcY: statutNumerique(reponse.bcY, exercice.vecteurBC.y),
  };
}

export function verifierConstructionTriangle(exercice: ExerciceOrthogonaliteTriangle, reponse: ReponseConstructionTriangle): boolean {
  const e = evaluerConstructionTriangle(exercice, reponse);
  return Object.values(e).every((s) => s === "correct");
}

function critereSommetTriangle(exercice: ExerciceOrthogonaliteTriangle, sommet: Sommet): number {
  return sommet === "A" ? exercice.critereA : sommet === "B" ? exercice.critereB : exercice.critereC;
}

export function diagnostiquerTestSommetTriangle(exercice: ExerciceOrthogonaliteTriangle, sommet: Sommet, valeur: number): StatutVerification {
  return statutNumerique(valeur, critereSommetTriangle(exercice, sommet));
}

export function verifierTestSommetTriangle(exercice: ExerciceOrthogonaliteTriangle, sommet: Sommet, valeur: number): boolean {
  return diagnostiquerTestSommetTriangle(exercice, sommet, valeur) === "correct";
}

/** Écran "conclusion" — `promptcorrectionsgenerateur25lot4.md`, section 2 : remplace le choix
 * unique à 4 options par 2 questions liées ("Ce triangle est-il rectangle ?" → Oui/Non, puis, si
 * "Oui", "Il est rectangle en :" → A/B/C). Une réponse n'est correcte que si le premier champ
 * (`estRectangle`) est correct ET — uniquement si "Oui" — que le second (`sommet`) l'est aussi ;
 * si l'attendu est "Non" (`sommetRectangle===null`), le second champ n'est jamais examiné (pas de
 * question 2 affichée dans ce cas). Sa propre logique booléenne (jamais le statut à 3 valeurs,
 * aucune saisie libre). */
export interface ReponseConclusionTriangle {
  estRectangle: boolean;
  sommet: Sommet | null;
}

export function conclusionAttendueTriangle(exercice: ExerciceOrthogonaliteTriangle): Sommet | null {
  return exercice.sommetRectangle;
}

export function verifierConclusionTriangle(exercice: ExerciceOrthogonaliteTriangle, reponse: ReponseConclusionTriangle): boolean {
  const attendu = conclusionAttendueTriangle(exercice);
  const estRectangleAttendu = attendu !== null;
  if (reponse.estRectangle !== estRectangleAttendu) return false;
  if (!estRectangleAttendu) return true;
  return reponse.sommet === attendu;
}

// ============================================================================
// Écrans variante 4 — triangle avec x
// ============================================================================

/** Un seul champ de saisie LIBRE par composante — accepte une expression algébrique de x ou un
 * nombre pur, vérifiée symboliquement (`diagnostiquerComposanteLineaire`) —
 * `promptcorrectionsgenerateur25complet.md`, point 1 : remplace les 2 champs séparés
 * (coefficient/constante) par une seule expression. */
export interface ReponseConstructionAvecXTriangle {
  abX: string;
  abY: string;
  acX: string;
  acY: string;
  bcX: string;
  bcY: string;
}

export function evaluerConstructionAvecXTriangle(
  exercice: ExerciceOrthogonaliteTriangleParametre,
  reponse: ReponseConstructionAvecXTriangle,
): { abX: StatutVerification; abY: StatutVerification; acX: StatutVerification; acY: StatutVerification; bcX: StatutVerification; bcY: StatutVerification } {
  return {
    abX: diagnostiquerComposanteLineaire(reponse.abX, exercice.vecteurAB.x),
    abY: diagnostiquerComposanteLineaire(reponse.abY, exercice.vecteurAB.y),
    acX: diagnostiquerComposanteLineaire(reponse.acX, exercice.vecteurAC.x),
    acY: diagnostiquerComposanteLineaire(reponse.acY, exercice.vecteurAC.y),
    bcX: diagnostiquerComposanteLineaire(reponse.bcX, exercice.vecteurBC.x),
    bcY: diagnostiquerComposanteLineaire(reponse.bcY, exercice.vecteurBC.y),
  };
}

export function verifierConstructionAvecXTriangle(exercice: ExerciceOrthogonaliteTriangleParametre, reponse: ReponseConstructionAvecXTriangle): boolean {
  const e = evaluerConstructionAvecXTriangle(exercice, reponse);
  return Object.values(e).every((s) => s === "correct");
}

export function reductionSommet(exercice: ExerciceOrthogonaliteTriangleParametre, sommet: Sommet): Reduction {
  return sommet === "A" ? exercice.reductionA : sommet === "B" ? exercice.reductionB : exercice.reductionC;
}

/** `Reduction` (linéaire OU quadratique, selon le sommet — voir `reductionSommet`) vers `Enonce`,
 * pour réutiliser `diagnostiquerFormeCanonique` (`expressionAlgebrique.ts`, exercice 1) sur les
 * deux cas UNIFORMÉMENT : `a=0` pour une réduction linéaire (`αx+β=0`, jamais résoluble sauf le
 * sommet fixe), `a=coefX2` pour une réduction quadratique. */
function reductionVersEnonce(r: Reduction): { a: number; b: number; c: number } {
  return r.degre === 2 ? { a: r.coefX2, b: r.coefX, c: r.coefConst } : { a: 0, b: r.coefX, c: r.coefConst };
}

/**
 * Écran "réduction" d'un sommet de la variante 4 — UN SEUL champ de saisie libre attendant
 * l'équation réduite complète (`... = 0`), quel que soit son degré réel (le composant ne demande
 * jamais à l'élève de "choisir" le degré) — `promptcorrectionsgenerateur25complet.md`, points 5-6.
 * Vérification symbolique, réutilise `diagnostiquerFormeCanonique` (déjà tolérante à tout multiple
 * non nul de l'équation de référence).
 */
export function diagnostiquerReductionSommet(exercice: ExerciceOrthogonaliteTriangleParametre, sommet: Sommet, texte: string): StatutVerification {
  return diagnostiquerFormeCanonique(texte, reductionVersEnonce(reductionSommet(exercice, sommet)));
}

export function verifierReductionSommet(exercice: ExerciceOrthogonaliteTriangleParametre, sommet: Sommet, texte: string): boolean {
  return diagnostiquerReductionSommet(exercice, sommet, texte) === "correct";
}

/** Écran "identification et résolution" (dernière phase, variante 4) — champ catégoriel (sommet
 * concerné, sa propre logique booléenne) ET champ numérique (valeur de x, statut à 3 valeurs). */
export function conclusionAttendueTriangleParametre(exercice: ExerciceOrthogonaliteTriangleParametre): Sommet {
  return exercice.sommetResoluble;
}

export function verifierSommetTriangleParametre(exercice: ExerciceOrthogonaliteTriangleParametre, reponse: Sommet): boolean {
  return reponse === conclusionAttendueTriangleParametre(exercice);
}

export function diagnostiquerResolutionTriangleParametre(exercice: ExerciceOrthogonaliteTriangleParametre, valeur: number): StatutVerification {
  return statutNumerique(valeur, exercice.solutionX);
}

/**
 * `promptcorrectionsgenerateur25lot4.md`, section 2 — même restructuration que
 * `ReponseConclusionTriangle` (V3), avec un champ numérique `x` en plus : la question 1
 * (`estRectangle`) est posée normalement même si la réponse attendue est ici TOUJOURS "Oui" (cette
 * variante garantit toujours exactement un sommet résoluble, voir `core/orthogonalite.types.ts`)
 * — jamais pré-remplie ni masquée, pour ne donner aucun indice supplémentaire à l'élève.
 */
export interface ReponseIdentificationResolution {
  estRectangle: boolean;
  sommet: Sommet | null;
  x: number;
}

export function verifierIdentificationResolution(exercice: ExerciceOrthogonaliteTriangleParametre, reponse: ReponseIdentificationResolution): boolean {
  if (!reponse.estRectangle || reponse.sommet === null) return false;
  return verifierSommetTriangleParametre(exercice, reponse.sommet) && diagnostiquerResolutionTriangleParametre(exercice, reponse.x) === "correct";
}
