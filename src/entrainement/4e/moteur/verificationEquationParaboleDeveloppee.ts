/**
 * Couche B — vérification pour "Sommet, foyer, p et directrice d'une parabole depuis l'équation
 * développée".
 *
 * Écrans 1 (regroupement/factorisation) et 2 (complétion du carré) sont tous deux des
 * reformulations ALGÉBRIQUEMENT IDENTIQUES à l'équation développée de l'exercice — mêmes principes
 * que "Centre et rayon d'un cercle depuis l'équation développée" : `a(x²+(bCarre/a)x)=-bAutre·y+c`
 * et `(x-x_S)²=2p(y-y_S)` (ou l'équivalent horizontal) s'expandent tous deux exactement en
 * `a·x²+bCarre·x+bAutre·y=c`. Les deux écrans réutilisent donc la MÊME cible de comparaison, via
 * `diagnostiquerEquivalenceQuadratiqueXY` (`verificationEquationCercle.ts`, moteur→moteur, déjà
 * validé pour les générateurs "cercle" ET "parabole depuis un graphe", jamais redéveloppé).
 *
 * ## Garde structurelle (écrans 1 et 2) — `promptcorrectiongen50gen52verificationstructurelle.md`
 *
 * L'équivalence algébrique seule ne suffit PAS à distinguer une réponse authentiquement regroupée/
 * complétée d'une recopie (même reformulée/réordonnée/mise à l'échelle) de l'équation de départ —
 * les deux sont algébriquement identiques par construction (voir ci-dessus). Une garde structurelle
 * est donc appliquée EN PLUS de `diagnostiquerEquivalenceQuadratiqueXY`, jamais à sa place, même
 * principe que "Centre et rayon d'un cercle depuis l'équation développée" (`verificationEquationCercleDeveloppee.ts`)
 * — mais avec une composition ASYMÉTRIQUE plutôt que symétrique : l'équation attendue ici n'a QU'UN
 * seul groupe structuré (celui de la variable au carré), l'autre membre restant un développé linéaire
 * simple dans l'autre variable (voir `formatRegroupementLatex`/`formatCompletionLatex`,
 * `ui/formatEquationParaboleDeveloppee.ts`) — jamais 2 groupes symétriques comme pour le cercle.
 * `estStructureRegroupementValide`/`estStructureCompletionValide` (ci-dessous) exigent donc qu'AU
 * MOINS UN des deux membres de l'équation soit un terme UNIQUE (`flattenAdditif(...).length === 1`)
 * qui se classe comme le groupe/carré parfait de la variable au carré de l'exercice (`x` si
 * `variante==="vertical"`, `y` sinon) — l'autre membre n'est volontairement soumis à AUCUNE
 * contrainte structurelle (il peut être développé, réordonné, etc. sans que cela ne fasse échouer la
 * garde, cohérent avec la consigne de leniency du prompt correctif). Primitives d'analyse d'arbre
 * (`flattenAdditif`, `classifierGroupeRegroupementXY`, `classifierCarreParfaitXY`...) exportées par
 * `verificationEquationCercle.ts` (moteur→moteur, partagées à l'identique par
 * `verificationEquationCercleDeveloppee.ts`) — voir son en-tête pour la justification complète.
 *
 * Écran 3 : S/F (statut à 3 valeurs classique, 2 champs numériques chacun), p (1 champ numérique
 * signé), directrice (texte libre — droite horizontale `y=...` ou verticale `x=...` selon
 * l'orientation, gérées UNIFORMÉMENT via la même `diagnostiquerEquivalenceQuadratiqueXY`, cible
 * simplement linéaire plutôt que quadratique — la fonction ne fait aucune hypothèse sur le degré
 * de la cible). Cet écran n'a AUCUNE forme intermédiaire à recopier (valeurs numériques finales),
 * donc pas concerné par la garde structurelle.
 */
import type { ExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import type { Point } from "../core/vecteur.types";
import type { StatutVerification } from "./statutVerification";
import type { NoeudXY } from "./verificationEquationCercle";
import {
  classifierCarreParfaitXY,
  classifierGroupeRegroupementXY,
  diagnostiquerEquivalenceQuadratiqueXY,
  flattenAdditif,
  parserEquationXY,
} from "./verificationEquationCercle";

/** `a·[carré]²+bCarre·[même var]+bAutre·[autre var]-c` — la référence de vérité PARTAGÉE par les
 * écrans 1 ET 2 (voir l'en-tête de fichier). */
function cibleDeveloppee(x: number, y: number, exercice: ExerciceEquationParaboleDeveloppee): number {
  const { a, bCarre, bAutre, c } = exercice;
  const carre = exercice.variante === "vertical" ? x : y;
  const autre = exercice.variante === "vertical" ? y : x;
  return a * carre * carre + bCarre * carre + bAutre * autre - c;
}

function variableCarree(exercice: ExerciceEquationParaboleDeveloppee): "x" | "y" {
  return exercice.variante === "vertical" ? "x" : "y";
}

/** Vrai si `cote` (un des deux membres de l'équation) est un terme UNIQUE `coefficient·(...)`
 * couvrant la variable au carré de l'exercice, avec son carré explicitement présent (pas encore
 * complété) — l'autre membre n'est jamais inspecté ici (composition asymétrique, voir en-tête). */
function estStructureRegroupementValide(cote: NoeudXY, variable: "x" | "y"): boolean {
  const termes = flattenAdditif(cote);
  if (termes.length !== 1) return false;
  return classifierGroupeRegroupementXY(termes[0]!.terme) === variable;
}

/** Même principe que `estStructureRegroupementValide`, mais exige un carré parfait explicite
 * `coefficient·(variable±p)²` plutôt qu'un groupe non encore complété. */
function estStructureCompletionValide(cote: NoeudXY, variable: "x" | "y"): boolean {
  const termes = flattenAdditif(cote);
  if (termes.length !== 1) return false;
  return classifierCarreParfaitXY(termes[0]!.terme) === variable;
}

/** Applique `verifieStructure` à n'importe lequel des 2 membres de `texte` — `false` si le texte
 * n'est même pas parseable comme équation à 2 variables (ne devrait jamais arriver ici : appelé
 * uniquement après que `diagnostiquerEquivalenceQuadratiqueXY` a déjà confirmé "correct", qui
 * implique un parsing réussi — défense en profondeur, jamais atteint en usage normal). */
function uneStructureValide(texte: string, variable: "x" | "y", verifieStructure: (cote: NoeudXY, v: "x" | "y") => boolean): boolean {
  const equation = parserEquationXY(texte);
  if (!equation) return false;
  return verifieStructure(equation.gauche, variable) || verifieStructure(equation.droite, variable);
}

export function diagnostiquerRegroupement(exercice: ExerciceEquationParaboleDeveloppee, texte: string): StatutVerification {
  const { x: x0, y: y0 } = exercice.sommet;
  const equivalence = diagnostiquerEquivalenceQuadratiqueXY(texte, x0, y0, (x, y) => cibleDeveloppee(x, y, exercice));
  if (equivalence !== "correct") return equivalence;
  return uneStructureValide(texte, variableCarree(exercice), estStructureRegroupementValide) ? "correct" : "not_equivalent";
}

export function verifierRegroupement(exercice: ExerciceEquationParaboleDeveloppee, texte: string): boolean {
  return diagnostiquerRegroupement(exercice, texte) === "correct";
}

export function diagnostiquerCompletionCarre(exercice: ExerciceEquationParaboleDeveloppee, texte: string): StatutVerification {
  const { x: x0, y: y0 } = exercice.sommet;
  const equivalence = diagnostiquerEquivalenceQuadratiqueXY(texte, x0, y0, (x, y) => cibleDeveloppee(x, y, exercice));
  if (equivalence !== "correct") return equivalence;
  return uneStructureValide(texte, variableCarree(exercice), estStructureCompletionValide) ? "correct" : "not_equivalent";
}

export function verifierCompletionCarre(exercice: ExerciceEquationParaboleDeveloppee, texte: string): boolean {
  return diagnostiquerCompletionCarre(exercice, texte) === "correct";
}

// ============================================================================
// Écran 3 — S/F/p (numériques) + directrice (texte libre).
// `TOLERANCE`/`statutNumeriqueSimple`/`combinerStatutsSimple` DUPLIQUÉS depuis
// `verificationEquationCercleDeveloppee.ts` plutôt qu'importés — ce module reste volontairement
// autonome, même principe qu'ailleurs dans le projet.
// ============================================================================

const TOLERANCE = 0.01;

function statutNumeriqueSimple(valeur: number, cible: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

function combinerStatutsSimple(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function diagnostiquerSommet(exercice: ExerciceEquationParaboleDeveloppee, reponse: Point): StatutVerification {
  return combinerStatutsSimple(statutNumeriqueSimple(reponse.x, exercice.sommet.x), statutNumeriqueSimple(reponse.y, exercice.sommet.y));
}

export function verifierSommet(exercice: ExerciceEquationParaboleDeveloppee, reponse: Point): boolean {
  return diagnostiquerSommet(exercice, reponse) === "correct";
}

export function diagnostiquerFoyer(exercice: ExerciceEquationParaboleDeveloppee, reponse: Point): StatutVerification {
  return combinerStatutsSimple(statutNumeriqueSimple(reponse.x, exercice.foyer.x), statutNumeriqueSimple(reponse.y, exercice.foyer.y));
}

export function verifierFoyer(exercice: ExerciceEquationParaboleDeveloppee, reponse: Point): boolean {
  return diagnostiquerFoyer(exercice, reponse) === "correct";
}

/** Composante SIGNÉE — jamais `|SF|` (le piège central de l'exercice, F et directrice échangés en
 * cas d'erreur de signe sur p). */
export function diagnostiquerP(exercice: ExerciceEquationParaboleDeveloppee, valeur: number): StatutVerification {
  return statutNumeriqueSimple(valeur, exercice.p);
}

export function verifierP(exercice: ExerciceEquationParaboleDeveloppee, valeur: number): boolean {
  return diagnostiquerP(exercice, valeur) === "correct";
}

/** `y-directrice` (axe vertical, droite horizontale) ou `x-directrice` (axe horizontal, droite
 * verticale) — gère les 2 orientations UNIFORMÉMENT via la même primitive d'équivalence à 2
 * variables que les écrans 1-2 (aucune hypothèse de degré, valable pour une cible linéaire).
 * Sondage centré sur le sommet — arbitraire mais toujours valide pour une droite (jamais de
 * dégénérescence, contrairement à une cible qui dépendrait d'un point particulier). */
export function diagnostiquerDirectrice(exercice: ExerciceEquationParaboleDeveloppee, texte: string): StatutVerification {
  const { x: x0, y: y0 } = exercice.sommet;
  const cible = exercice.variante === "vertical" ? (_x: number, y: number) => y - exercice.directrice : (x: number, _y: number) => x - exercice.directrice;
  return diagnostiquerEquivalenceQuadratiqueXY(texte, x0, y0, cible);
}

export function verifierDirectrice(exercice: ExerciceEquationParaboleDeveloppee, texte: string): boolean {
  return diagnostiquerDirectrice(exercice, texte) === "correct";
}

export interface ReponseCaracteristiques {
  sx: number;
  sy: number;
  fx: number;
  fy: number;
  p: number;
  directrice: string;
}

/** Regroupe S, F, p et directrice pour l'écran 3, qui combine les quatre dans une seule note
 * (même principe que "Centre et rayon d'un cercle depuis l'équation développée" : statut textuel
 * prioritaire en cas de `parse_error`, jamais un simple `&&` booléen). */
export function diagnostiquerCaracteristiques(exercice: ExerciceEquationParaboleDeveloppee, reponse: ReponseCaracteristiques): StatutVerification {
  return combinerStatutsSimple(
    diagnostiquerSommet(exercice, { x: reponse.sx, y: reponse.sy }),
    diagnostiquerFoyer(exercice, { x: reponse.fx, y: reponse.fy }),
    diagnostiquerP(exercice, reponse.p),
    diagnostiquerDirectrice(exercice, reponse.directrice),
  );
}

export function verifierCaracteristiques(exercice: ExerciceEquationParaboleDeveloppee, reponse: ReponseCaracteristiques): boolean {
  return diagnostiquerCaracteristiques(exercice, reponse) === "correct";
}
