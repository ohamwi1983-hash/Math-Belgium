/**
 * Couche B — vérification pour "Colinéarité et alignement de points" (chapitre "Calcul
 * vectoriel"), réécriture complète (`promptcreationgenerateur24colinearitealignement.md`), puis
 * corrections (`promptcorrectionsgenerateur24complet.md`).
 *
 * 6 "types" d'écran réutilisés selon la variante — voir `typesColinearite.ts`/`sessionColinearite.ts`
 * pour le dispatch complet :
 * - "test" (V1 seul écran, V3 second écran) : critère numérique + conclusion(s) catégorielle(s) —
 *   une seule pour "vecteurs" (colinéaires/non), deux pour "points" (colinéaires ET alignés, même
 *   fait mathématique sous deux vocabulaires — correction, point 15).
 * - "constructionVecteurs" (V3 premier écran) : 4 champs numériques (composantes de AB/AC).
 * - "constructionAvecX" (V4 premier écran) : 4 champs de saisie LIBRE (une expression algébrique de
 *   x ou un nombre pur par composante), vérification symbolique — correction, point 1.
 * - "reduction"/"reductionAvecX" (V2 "parametre" ET V4 "pointsParametre", phases SÉPARÉES — jamais
 *   partagées, voir `typesColinearite.ts` — mais PARTAGEANT désormais les mêmes fonctions de
 *   vérification, `diagnostiquerReductionAvecX`/`verifierReductionAvecX`) : un champ de saisie libre
 *   pour l'équation réduite complète (`αx+β=0`, vérification symbolique via
 *   `diagnostiquerFormeCanonique`, réutilisée telle quelle).
 * - "resolution"/"resolutionAvecX" (même principe, `promptcorrectionsgenerateur24lot3.md`, point 2 —
 *   V2 alignée sur V4) : un simple champ numérique `x=`, via `diagnostiquerResolutionAvecX`/
 *   `verifierResolutionAvecX` — les deux variantes garantissent désormais TOUJOURS exactement une
 *   solution (voir `generateurs/colinearite/index.ts`), plus aucun cas dégénéré à gérer ici.
 *
 * Le champ catégoriel ("Colinéaires"/"Non colinéaires", "Alignés"/"Non alignés") a sa PROPRE
 * logique de vérification booléenne, jamais le statut à 3 valeurs (aucune saisie libre pour lui,
 * jamais de risque de `parse_error`) — voir `verifierConclusion` ci-dessous.
 */
import type { ExerciceColinearParametre, ExerciceColinearPoints, ExerciceColinearPointsParametre, ExerciceColinearVecteurs, LinExpr } from "../core/colinearite.types";
import { diagnostiquerFormeCanonique, evaluerExpression } from "./expressionAlgebrique";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 0.01;

/** Union structurelle des deux variantes "avec x" (`v2` "parametre" ET V4 "pointsParametre") —
 * partagent le même contrat `{coefX,coefConst,solutionX}` pour l'équation réduite, donc les mêmes
 * fonctions de vérification (`diagnostiquerReductionAvecX`/`diagnostiquerResolutionAvecX`) — même
 * union locale que `ui/formatColinearite.ts::ExerciceAvecX`, dupliquée ici (contrats indépendants
 * entre Couche B et présentation). */
type ExerciceAvecX = ExerciceColinearParametre | ExerciceColinearPointsParametre;

function statutNumerique(valeur: number, cible: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

/** Points d'échantillonnage non entiers (jamais une valeur "ronde" qui masquerait un mauvais
 * coefficient) — même principe que le reste du projet (ex. `verifierIsolementGenerique`,
 * "Inéquations rationnelles"). Sert à vérifier qu'une expression LIBRE (pas nécessairement "=0",
 * une simple composante de vecteur) coïncide avec la cible linéaire à TOUS les points, pas
 * seulement à un — accepte n'importe quelle formulation algébriquement équivalente. */
const POINTS_ECHANTILLON = [0.37, 1.53, -0.82, 2.19, -1.41];

/**
 * Vérifie qu'une expression saisie librement (une composante de vecteur — jamais une équation,
 * jamais de "=0" attendu) coïncide EXACTEMENT avec la cible `coefX·x+constante` en tout point —
 * `promptcorrectionsgenerateur24complet.md`, point 1. Réutilise `evaluerExpression`
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
// Écran "test" — V1 (variante "vecteurs") et V3-écran2 (variante "points")
// ============================================================================

type ExerciceTest = ExerciceColinearVecteurs | ExerciceColinearPoints;

export function critereReel(exercice: ExerciceTest): number {
  return exercice.critere;
}

export function conclusionAttendue(exercice: ExerciceTest): boolean {
  return exercice.variante === "vecteurs" ? exercice.colineaires : exercice.alignes;
}

/**
 * `conclusionAlignement` — UNIQUEMENT requis/vérifié pour la variante "points" (correction, point
 * 15 : un second champ catégoriel "colinéaires ?" s'ajoute à "alignés ?" déjà existant, pour lier
 * explicitement les deux vocabulaires) ; toujours `null` et jamais examiné pour "vecteurs", qui n'a
 * aucune notion d'alignement de points.
 */
export interface ReponseTest {
  critere: number;
  conclusionColinearite: boolean;
  conclusionAlignement: boolean | null;
}

export function diagnostiquerCritereTest(exercice: ExerciceTest, valeur: number): StatutVerification {
  return statutNumerique(valeur, critereReel(exercice));
}

export function verifierConclusion(exercice: ExerciceTest, reponse: boolean): boolean {
  return reponse === conclusionAttendue(exercice);
}

export function evaluerTest(exercice: ExerciceTest, reponse: ReponseTest): { critere: StatutVerification; conclusionColinearite: boolean; conclusionAlignement: boolean } {
  return {
    critere: diagnostiquerCritereTest(exercice, reponse.critere),
    conclusionColinearite: verifierConclusion(exercice, reponse.conclusionColinearite),
    conclusionAlignement: exercice.variante !== "points" || reponse.conclusionAlignement === conclusionAttendue(exercice),
  };
}

export function verifierTest(exercice: ExerciceTest, reponse: ReponseTest): boolean {
  const { critere, conclusionColinearite, conclusionAlignement } = evaluerTest(exercice, reponse);
  return critere === "correct" && conclusionColinearite && conclusionAlignement;
}

// ============================================================================
// Écran "constructionVecteurs" — V3-écran1 (variante "points")
// ============================================================================

export interface ReponseConstructionVecteurs {
  abX: number;
  abY: number;
  acX: number;
  acY: number;
}

export function evaluerConstructionVecteurs(
  exercice: ExerciceColinearPoints,
  reponse: ReponseConstructionVecteurs,
): { abX: StatutVerification; abY: StatutVerification; acX: StatutVerification; acY: StatutVerification } {
  return {
    abX: statutNumerique(reponse.abX, exercice.vecteurAB.x),
    abY: statutNumerique(reponse.abY, exercice.vecteurAB.y),
    acX: statutNumerique(reponse.acX, exercice.vecteurAC.x),
    acY: statutNumerique(reponse.acY, exercice.vecteurAC.y),
  };
}

export function verifierConstructionVecteurs(exercice: ExerciceColinearPoints, reponse: ReponseConstructionVecteurs): boolean {
  const e = evaluerConstructionVecteurs(exercice, reponse);
  return e.abX === "correct" && e.abY === "correct" && e.acX === "correct" && e.acY === "correct";
}

// ============================================================================
// Écran "constructionAvecX" — V4-écran1 (variante "pointsParametre")
// ============================================================================

/** 4 champs de saisie LIBRE (texte), un par composante — `promptcorrectionsgenerateur24complet.md`,
 * point 1 : remplace les 2 champs séparés (coefficient/constante) par une seule expression
 * algébrique acceptée telle quelle (`"2x-1"` comme `"3"`), vérifiée par `diagnostiquerComposanteLineaire`. */
export interface ReponseConstructionAvecX {
  abX: string;
  abY: string;
  acX: string;
  acY: string;
}

export function evaluerConstructionAvecX(
  exercice: ExerciceColinearPointsParametre,
  reponse: ReponseConstructionAvecX,
): { abX: StatutVerification; abY: StatutVerification; acX: StatutVerification; acY: StatutVerification } {
  return {
    abX: diagnostiquerComposanteLineaire(reponse.abX, exercice.vecteurAB.x),
    abY: diagnostiquerComposanteLineaire(reponse.abY, exercice.vecteurAB.y),
    acX: diagnostiquerComposanteLineaire(reponse.acX, exercice.vecteurAC.x),
    acY: diagnostiquerComposanteLineaire(reponse.acY, exercice.vecteurAC.y),
  };
}

export function verifierConstructionAvecX(exercice: ExerciceColinearPointsParametre, reponse: ReponseConstructionAvecX): boolean {
  const e = evaluerConstructionAvecX(exercice, reponse);
  return e.abX === "correct" && e.abY === "correct" && e.acX === "correct" && e.acY === "correct";
}

// ============================================================================
// Écrans "reduction"/"reductionAvecX" et "resolution"/"resolutionAvecX" — V2 "parametre" ET V4
// "pointsParametre" (phases séparées, voir `typesColinearite.ts`, mais mêmes fonctions de
// vérification depuis `promptcorrectionsgenerateur24lot3.md`, point 2 : les deux variantes
// garantissent désormais TOUJOURS exactement une solution).
// ============================================================================

/**
 * Équation réduite complète, saisie librement (`"2x-3=0"`, ou toute forme équivalente) —
 * `promptcorrectionsgenerateur24complet.md`, point 7. Réutilise DIRECTEMENT `diagnostiquerFormeCanonique`
 * (`expressionAlgebrique.ts`, exercice 1 — import moteur→moteur) en mappant `{coefX,coefConst}` sur
 * `Enonce{a:0,b:coefX,c:coefConst}` (degré 1, `a` toujours nul) : cette fonction accepte déjà
 * n'importe quel multiple non nul de l'équation de référence, exactement le comportement "toute
 * forme équivalente" demandé. `coefX` est toujours non nul ici (les deux variantes garantissent
 * `typeSolution === "unique"`, voir `generateurs/colinearite/index.ts`), donc la branche
 * `enonce.a===0` de `coefficientsProportionnels` retombe toujours sur une comparaison de rapport
 * bien définie.
 */
export function diagnostiquerReductionAvecX(exercice: ExerciceAvecX, texte: string): StatutVerification {
  return diagnostiquerFormeCanonique(texte, { a: 0, b: exercice.coefX, c: exercice.coefConst });
}

export function verifierReductionAvecX(exercice: ExerciceAvecX, texte: string): boolean {
  return diagnostiquerReductionAvecX(exercice, texte) === "correct";
}

/** Simple champ numérique `x=` — les deux variantes n'ont jamais de cas dégénéré (identité/
 * contradiction), jamais besoin du champ catégoriel à 3 états. */
export function diagnostiquerResolutionAvecX(exercice: ExerciceAvecX, valeur: number): StatutVerification {
  return statutNumerique(valeur, exercice.solutionX as number);
}

export function verifierResolutionAvecX(exercice: ExerciceAvecX, valeur: number): boolean {
  return diagnostiquerResolutionAvecX(exercice, valeur) === "correct";
}
