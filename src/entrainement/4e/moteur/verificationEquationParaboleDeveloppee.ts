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
 * `estStructureCompletionValide` (ci-dessous) exige donc qu'AU MOINS UN des deux membres de
 * l'équation soit un terme UNIQUE (`flattenAdditif(...).length === 1`) qui se classe comme le carré
 * parfait de la variable au carré de l'exercice (`x` si `variante==="vertical"`, `y` sinon) —
 * l'autre membre n'est volontairement soumis à AUCUNE contrainte structurelle.
 * `estStructureRegroupementValide` (écran 1, audit chapitre 7) est plus souple : un membre composé
 * UNIQUEMENT des termes de la variable au carré (son carré présent, avec ou sans mise en évidence du
 * coefficient — `y²-6y = 4x-5`, l'étape même du cours, autant que `2(x²-2x) = 32y+62`), l'autre
 * membre ne contenant plus cette variable. Primitives d'analyse d'arbre
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

/** Vrai si `variable` apparaît N'IMPORTE OÙ dans `noeud` — dupliqué (jamais importé) depuis
 * `verificationEquationCercle.ts`, qui ne l'exporte pas : ce module reste autonome. */
function contientVariable(noeud: NoeudXY, variable: "x" | "y"): boolean {
  switch (noeud.type) {
    case "x":
    case "y":
      return noeud.type === variable;
    case "nombre":
      return false;
    case "negation":
      return contientVariable(noeud.operande, variable);
    case "groupe":
      return contientVariable(noeud.interieur, variable);
    case "puissance":
      return contientVariable(noeud.base, variable) || contientVariable(noeud.exposant, variable);
    case "somme":
    case "produit":
      return contientVariable(noeud.gauche, variable) || contientVariable(noeud.droite, variable);
  }
}

function estConstante(noeud: NoeudXY): boolean {
  return !contientVariable(noeud, "x") && !contientVariable(noeud, "y");
}

function sansGroupes(noeud: NoeudXY): NoeudXY {
  return noeud.type === "groupe" ? sansGroupes(noeud.interieur) : noeud;
}

/** `variable` nue ou `variable²` (exposant littéral 2) — jamais un binôme au carré `(x-1)²`, qui
 * appartient déjà à l'écran suivant (complétion). */
function estPuissanceVariable(noeud: NoeudXY, variable: "x" | "y"): "carre" | "lineaire" | null {
  const n = sansGroupes(noeud);
  if (n.type === variable) return "lineaire";
  if (n.type === "puissance" && n.exposant.type === "nombre" && n.exposant.valeur === 2 && sansGroupes(n.base).type === variable) return "carre";
  return null;
}

/** Monôme `k·variable²`, `k·variable`, `variable²·k`, `variable²/k`… (k constant, éventuellement
 * omis) — renvoie son degré, `null` si ce n'est pas un monôme de cette seule variable. */
function degreMonome(terme: NoeudXY, variable: "x" | "y"): "carre" | "lineaire" | null {
  const n = sansGroupes(terme);
  const direct = estPuissanceVariable(n, variable);
  if (direct) return direct;
  if (n.type === "negation") return degreMonome(n.operande, variable);
  if (n.type === "produit") {
    if (estConstante(n.gauche)) return n.operateur === "*" ? degreMonome(n.droite, variable) : null;
    if (estConstante(n.droite)) return degreMonome(n.gauche, variable);
  }
  return null;
}

/**
 * Écran 1 — vrai si `cote` contient UNIQUEMENT des termes de la variable au carré, avec son carré
 * explicitement présent (pas encore complété), et si `autreCote` ne contient PLUS cette variable :
 * c'est l'étape « isoler le carré » du cours (`y²-6y = 4x-5`), avec ou sans mise en évidence du
 * coefficient de la variable au carré (`2(x²-2x) = …`, `2x²-4x = …`, `x²-2x = …` après division —
 * l'équivalence à un facteur près est déjà garantie par `diagnostiquerEquivalenceQuadratiqueXY`).
 * Chaque terme de haut niveau de `cote` est soit un monôme de la variable (`degreMonome`), soit un
 * groupe `coefficient·(…)` de cette seule variable contenant son carré (`classifierGroupeRegroupementXY`).
 * Jamais de constante dans `cote` : « 4x-5 » doit être passé de l'autre côté.
 */
function estStructureRegroupementValide(cote: NoeudXY, autreCote: NoeudXY, variable: "x" | "y"): boolean {
  const autre = variable === "x" ? "y" : "x";
  if (contientVariable(autreCote, variable) || contientVariable(cote, autre)) return false;
  let carrePresent = false;
  for (const { terme } of flattenAdditif(cote)) {
    if (classifierGroupeRegroupementXY(terme) === variable) {
      carrePresent = true;
      continue;
    }
    const degre = degreMonome(terme, variable);
    if (degre === null) return false;
    if (degre === "carre") carrePresent = true;
  }
  return carrePresent;
}

/** Même principe que `estStructureRegroupementValide`, mais exige un carré parfait explicite
 * `coefficient·(variable±p)²` plutôt qu'un groupe non encore complété. */
function estStructureCompletionValide(cote: NoeudXY, _autreCote: NoeudXY, variable: "x" | "y"): boolean {
  const termes = flattenAdditif(cote);
  if (termes.length !== 1) return false;
  return classifierCarreParfaitXY(termes[0]!.terme) === variable;
}

/** Applique `verifieStructure` à n'importe lequel des 2 membres de `texte` — `false` si le texte
 * n'est même pas parseable comme équation à 2 variables (ne devrait jamais arriver ici : appelé
 * uniquement après que `diagnostiquerEquivalenceQuadratiqueXY` a déjà confirmé "correct", qui
 * implique un parsing réussi — défense en profondeur, jamais atteint en usage normal). */
function uneStructureValide(
  texte: string,
  variable: "x" | "y",
  verifieStructure: (cote: NoeudXY, autreCote: NoeudXY, v: "x" | "y") => boolean,
): boolean {
  const equation = parserEquationXY(texte);
  if (!equation) return false;
  return verifieStructure(equation.gauche, equation.droite, variable) || verifieStructure(equation.droite, equation.gauche, variable);
}

/** Vrai si `texte` est algébriquement équivalent à l'équation de départ, quelle que soit sa forme —
 * permet aux écrans 1-2 de distinguer « juste mais forme demandée pas encore atteinte » (ex. l'étape
 * intermédiaire du cours `(y-3)²-9 = 4x-5`) d'une équation fausse, sans changer le statut à 3
 * valeurs (`not_equivalent` dans les deux cas, même score). */
export function estEquivalenteEquationDepart(exercice: ExerciceEquationParaboleDeveloppee, texte: string): boolean {
  const { x: x0, y: y0 } = exercice.sommet;
  return diagnostiquerEquivalenceQuadratiqueXY(texte, x0, y0, (x, y) => cibleDeveloppee(x, y, exercice)) === "correct";
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
  return diagnostiquerEquivalenceQuadratiqueXY(retirerNomDroite(texte), x0, y0, cible);
}

/** Retire un nom de droite en tête (« d : », « d ≡ », « d: ») — la notation même de l'aide 2
 * (`d \equiv y=y_S-p/2`), jamais une erreur de syntaxe pour l'élève qui la recopie. */
function retirerNomDroite(texte: string): string {
  return texte.replace(/^\s*d\s*(?::|≡)\s*/, "");
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
