/**
 * Couche B — vérification partagée par les 4 générateurs sur les droites, module FRÈRE (même
 * principe que `moteur/verificationTriangle.ts` pour le chapitre 3) : primitives de comparaison
 * réutilisées telles quelles par "Équation d'une droite", "Lecture graphique — équation d'une
 * droite", "Construction graphique — tracer une droite" et "Relations entre droites".
 *
 * **N'importe jamais `src/generateurs/`** (règle d'architecture non négociable, voir CLAUDE.md) —
 * `determinant2`/`produitScalaire2` ci-dessous DUPLIQUENT volontairement les formules déjà
 * construites dans `generateurs/vecteur/arithmetique.ts` (`determinant`/`produitPourOrthogonalite`)
 * plutôt que de les importer, même principe que `moteur/geometrieEspace.ts` dupliquant
 * `generateurs/solide3D/geometrieEspace.ts` (chapitre 6).
 *
 * ## Extension du statut à 3 valeurs — proportionnalité/colinéarité
 *
 * `StatutVerification` (`correct`/`not_equivalent`/`parse_error`) reste EXACTEMENT le même type,
 * jamais une 4e valeur ni un système parallèle. Cette extension ajoute simplement de NOUVELLES
 * fonctions `statutXxx`, au même niveau que `statutNumerique` (comparaison par égalité à
 * tolérance) déjà utilisée dans tout le projet — `statutVecteurColineaire`/`statutVecteurOrthogonal`/
 * `statutTripletProportionnel` comparent par PROPORTIONNALITÉ (tout multiple non nul accepté)
 * plutôt que par égalité exacte, réutilisant le critère de colinéarité `a·d-b·c=0` déjà construit
 * pour "Colinéarité et alignement de points" et le critère d'orthogonalité `a·c+b·d=0` déjà
 * construit pour "Orthogonalité et théorème de Pythagore généralisé" — jamais "déterminant" ni
 * "produit scalaire" dans un texte affiché à l'élève, mêmes bans que ces deux générateurs.
 */
import type { Composantes, Point } from "../core/vecteur.types";
import type { DroiteExpliciteX, DroiteExpliciteY, DroiteImplicite, DroiteParametrique } from "../core/droite.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import type { StatutVerification } from "./statutVerification";

/** Tolérance pour la comparaison directe valeur-à-valeur d'un champ numérique — même valeur que le
 * reste du projet (`verificationColinearite.ts`/`verificationOrthogonalite.ts`). */
export const TOLERANCE = 0.01;

/** Tolérance pour un critère structurel qui doit valoir EXACTEMENT 0 (déterminant, produit
 * scalaire, substitution dans une équation) — les coefficients de ce groupe de générateurs sont
 * toujours de petits entiers/rationnels par construction, un critère correct y est donc soit
 * exactement 0, soit clairement non nul ; resserré par rapport à `TOLERANCE` pour ne jamais
 * accepter à tort une réponse non colinéaire dont le déterminant serait "petit mais non nul".
 * Même valeur que `diagnostiquerFormeCanonique` (`expressionAlgebrique.ts`, tolérance par défaut). */
export const EPSILON_STRUCTURE = 1e-6;

export function statutNumerique(valeur: number, cible: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

/**
 * Combine plusieurs statuts en un seul, pour une note qui porte sur plusieurs champs à la fois
 * (ex. `m` ET `p` pour une forme explicite `y=mx+p`) — `parse_error` est prioritaire (si un seul
 * champ n'a pas pu être interprété, la note entière est `parse_error`, jamais un `not_equivalent`
 * qui masquerait cette information à l'élève) ; sinon `correct` seulement si tous les champs le
 * sont, `not_equivalent` sinon. Réutilisée par les 4 générateurs sur les droites pour toute note à
 * plusieurs champs (jamais un court-circuit `&&` qui empêcherait de distinguer `parse_error` d'un
 * simple `not_equivalent`).
 */
export function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

/** Duplication volontaire de `determinant`/`produitPourOrthogonalite` (`generateurs/vecteur/arithmetique.ts`)
 * — voir l'en-tête de fichier. */
function determinant2(a: Composantes, b: Composantes): number {
  return a.x * b.y - a.y * b.x;
}

function produitScalaire2(a: Composantes, b: Composantes): number {
  return a.x * b.x + a.y * b.y;
}

/** Un vecteur directeur n'est jamais nul — condition nécessaire avant tout test de
 * colinéarité/orthogonalité (un vecteur nul serait "colinéaire"/"orthogonal" à tout, une réponse
 * dégénérée jamais valide géométriquement). */
export function estVecteurNonNul(v: Composantes): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && (Math.abs(v.x) > EPSILON_STRUCTURE || Math.abs(v.y) > EPSILON_STRUCTURE);
}

/**
 * Statut de colinéarité entre un vecteur SOUMIS et un vecteur de RÉFÉRENCE — extension du statut à
 * 3 valeurs pour une comparaison par PROPORTIONNALITÉ (tout multiple non nul du vecteur de
 * référence est "correct") plutôt qu'une égalité exacte. `parse_error` si le vecteur soumis n'est
 * pas fini ou est lui-même nul (jamais un vecteur directeur valide).
 */
export function statutVecteurColineaire(vecteurSoumis: Composantes, vecteurReference: Composantes): StatutVerification {
  if (!estVecteurNonNul(vecteurSoumis)) return "parse_error";
  return Math.abs(determinant2(vecteurSoumis, vecteurReference)) <= EPSILON_STRUCTURE ? "correct" : "not_equivalent";
}

/**
 * Symétrique pour l'orthogonalité — réutilise le critère `a·c+b·d=0` (jamais "produit scalaire"
 * dans un texte affiché à l'élève). Scale-invariant par construction : n'importe quel multiple non
 * nul d'un vecteur orthogonal valide reste orthogonal, jamais une égalité exacte à un vecteur
 * canonique unique (qui rejetterait à tort une réponse correcte mais mise à l'échelle).
 */
export function statutVecteurOrthogonal(vecteurSoumis: Composantes, vecteurReference: Composantes): StatutVerification {
  if (!estVecteurNonNul(vecteurSoumis)) return "parse_error";
  return Math.abs(produitScalaire2(vecteurSoumis, vecteurReference)) <= EPSILON_STRUCTURE ? "correct" : "not_equivalent";
}

export interface Triplet {
  a: number;
  b: number;
  c: number;
}

/**
 * Statut de proportionnalité entre deux triplets (a,b,c) — pour la forme implicite `ax+by+c=0`,
 * tout multiple non nul du triplet de référence est valide. Généralise `statutVecteurColineaire` à
 * 3 composantes : deux triplets sont proportionnels ssi les 3 "mineurs" 2×2 (a1b2-a2b1,
 * a1c2-a2c1, b1c2-b2c1) sont tous nuls — jamais besoin de choisir arbitrairement une composante de
 * référence non nulle pour calculer un rapport `k`.
 */
export function statutTripletProportionnel(t: Triplet, ref: Triplet): StatutVerification {
  if (!Number.isFinite(t.a) || !Number.isFinite(t.b) || !Number.isFinite(t.c)) return "parse_error";
  if (Math.abs(t.a) <= EPSILON_STRUCTURE && Math.abs(t.b) <= EPSILON_STRUCTURE && Math.abs(t.c) <= EPSILON_STRUCTURE) return "parse_error";
  const m1 = t.a * ref.b - ref.a * t.b;
  const m2 = t.a * ref.c - ref.a * t.c;
  const m3 = t.b * ref.c - ref.b * t.c;
  const proportionnel = Math.abs(m1) <= EPSILON_STRUCTURE && Math.abs(m2) <= EPSILON_STRUCTURE && Math.abs(m3) <= EPSILON_STRUCTURE;
  return proportionnel ? "correct" : "not_equivalent";
}

// ============================================================================
// Appartenance d'un point à une droite — chacune des 4 formes ("Construction graphique — tracer
// une droite" écran 1, "Lecture graphique — équation d'une droite" variante B).
// ============================================================================

export function pointAppartientImplicite(point: Point, d: DroiteImplicite): boolean {
  return Math.abs(d.a * point.x + d.b * point.y + d.c) <= EPSILON_STRUCTURE;
}

export function pointAppartientExpliciteY(point: Point, d: DroiteExpliciteY): boolean {
  return Math.abs(point.y - (d.m * point.x + d.p)) <= EPSILON_STRUCTURE;
}

export function pointAppartientExpliciteX(point: Point, d: DroiteExpliciteX): boolean {
  return Math.abs(point.x - (d.n * point.y + d.q)) <= EPSILON_STRUCTURE;
}

/** Un point appartient à la droite paramétrique ssi (point-origine) est colinéaire au vecteur
 * directeur — équivalent à "il existe t tel que...", jamais besoin de résoudre t explicitement
 * (une division par une composante potentiellement nulle du vecteur directeur). */
export function pointAppartientParametrique(point: Point, d: DroiteParametrique): boolean {
  const ecart: Composantes = { x: point.x - d.x0, y: point.y - d.y0 };
  return Math.abs(determinant2(ecart, { x: d.a, y: d.b })) <= EPSILON_STRUCTURE;
}

/**
 * Diagnostic COMBINÉ "point + vecteur directeur" — le motif central de ce groupe de générateurs
 * (écran d'extraction de "Équation d'une droite", forme de sortie paramétrique, variante B de
 * "Lecture graphique") : le point soumis doit appartenir à la droite de référence (fournie en
 * forme implicite, toujours calculable quel que soit le vecteur) ET le vecteur soumis doit être
 * colinéaire au vecteur directeur de référence — jamais une égalité exacte à UN couple
 * (point,vecteur) canonique, qui rejetterait à tort une combinaison géométriquement tout aussi
 * valide (un autre point de la même droite, ou le vecteur opposé/mis à l'échelle).
 */
export function diagnostiquerPointVecteurParametrique(
  pointSoumis: Point,
  vecteurSoumis: Composantes,
  referenceImplicite: DroiteImplicite,
  vecteurReference: Composantes,
): StatutVerification {
  if (!Number.isFinite(pointSoumis.x) || !Number.isFinite(pointSoumis.y)) return "parse_error";
  const statutVecteur = statutVecteurColineaire(vecteurSoumis, vecteurReference);
  if (statutVecteur === "parse_error") return "parse_error";
  const pointOk = pointAppartientImplicite(pointSoumis, referenceImplicite);
  return statutVecteur === "correct" && pointOk ? "correct" : "not_equivalent";
}

// ============================================================================
// Parseur d'expression affine en t — représentation paramétrique en texte libre ("x = x0 + t*a"),
// écran "coefficients" (forme paramétrique) de "Équation d'une droite"
// (`promptgen42modifications.md`, point 2). Vérification faite AVANT toute implémentation qu'aucun
// mécanisme d'extraction de ce type n'existe déjà : `expressionAlgebrique.ts` et
// `expressionGenerale.ts` sont tous deux mono-variable, exclusivement "x" (jamais "t") ;
// `parserExpressionLineaireXY` ci-dessous parse une équation linéaire à 2 variables (x,y) — un
// besoin structurellement différent (une seule variable ici, un membre de droite d'égalité
// "x=..."/"y=...", jamais une équation implicite à null). Aucun des trois n'est réutilisable tel
// quel.
//
// Approche retenue : réutiliser `evaluerExpressionGenerale` (mono-variable "x") par SUBSTITUTION
// TEXTUELLE "t" → "x" avant évaluation — même principe déjà en place ailleurs sur la plateforme
// pour ce même type de contrainte (`core/orthogonalite.types.ts::ExerciceOrthogonaliteParametre`,
// dont le champ du critère développé est nommé littéralement "x" pour cette raison), plutôt qu'un
// tokenizer dédié à une nouvelle variable. Le contrat garantit une expression TOUJOURS affine en t
// (jamais autre chose) : 2 points d'échantillonnage (t=0 donne le terme constant, t=1 donne
// constante+coefficient) suffisent donc à extraire les deux valeurs — jamais une comparaison
// symbolique de coefficients développés (hors de portée pour une simple expression affine à une
// variable, contrairement à `expressionAlgebrique.ts`).
// ============================================================================

export interface CoefficientsAffineT {
  constante: number;
  coefficient: number;
}

/** Extrait le terme constant et le coefficient de `t` d'une expression affine soumise en texte
 * libre (ex. "x=2+t*3" → `{constante:2, coefficient:3}`) — `null` si l'expression n'a pas pu être
 * interprétée du tout (`parse_error` côté appelant, jamais confondu avec un rejet structurel). Un
 * éventuel préfixe "x=" / "y=" / "<lettre>=" est retiré (espaces tolérés) ; en son absence,
 * l'expression entière est prise comme membre de droite. */
export function parserExpressionAffineT(expressionSaisie: string): CoefficientsAffineT | null {
  const membreDroite = expressionSaisie.replace(/^\s*[a-zA-Z]\s*=\s*/, "");
  const expressionSubstituee = membreDroite.replace(/t/gi, "x");
  try {
    const constante = evaluerExpressionGenerale(expressionSubstituee, 0);
    const valeurEnUn = evaluerExpressionGenerale(expressionSubstituee, 1);
    if (!Number.isFinite(constante) || !Number.isFinite(valeurEnUn)) return null;
    return { constante, coefficient: valeurEnUn - constante };
  } catch {
    return null;
  }
}

/** Diagnostic complet d'une représentation paramétrique saisie en 2 champs de texte libre —
 * extrait `(x0,y0)`/`(a,b)` de chaque expression (`parserExpressionAffineT`) puis délègue au même
 * critère de proportionnalité que la saisie numérique (`diagnostiquerPointVecteurParametrique`,
 * point 2 du prompt) : jamais une logique de comparaison dupliquée. */
export function diagnostiquerRepresentationParametriqueTexte(
  texteX: string,
  texteY: string,
  referenceImplicite: DroiteImplicite,
  vecteurReference: Composantes,
): StatutVerification {
  const extraitX = parserExpressionAffineT(texteX);
  const extraitY = parserExpressionAffineT(texteY);
  if (extraitX === null || extraitY === null) return "parse_error";
  const point: Point = { x: extraitX.constante, y: extraitY.constante };
  const vecteur: Composantes = { x: extraitX.coefficient, y: extraitY.coefficient };
  return diagnostiquerPointVecteurParametrique(point, vecteur, referenceImplicite, vecteurReference);
}

// ============================================================================
// Parseur d'expression linéaire à 2 variables (x, y) — module dédié, jamais une extension du
// tokenizer d'`expressionAlgebrique.ts` (celui-ci reconnaît exclusivement "x" comme variable,
// confirmé par lecture directe avant toute implémentation, méthode "verify before fixing" — ni
// `expressionGenerale.ts`, lui aussi mono-variable). Le domaine d'une équation de droite est
// TOUJOURS strictement linéaire en x et y (jamais de fonctions, de puissances, de parenthèses
// imbriquées) — un parseur bien plus simple qu'un évaluateur général suffit, volontairement
// restreint : coefficient (entier/décimal virgule-ou-point, éventuellement une fraction simple
// "p/q") suivi optionnellement de "x" ou "y" (case indifférente), sommés terme à terme.
// ============================================================================

export interface ExpressionLineaireXY {
  coefX: number;
  coefY: number;
  constante: number;
}

/** 2 formes alternatives par terme (audit champs à expressions littérales, 4e — même correctif que
 * `expressionVectorielle.ts`) :
 * - `[xXyY][*×]coefficient` (groupes 2-3) — ordre inversé, séparateur `*`/`×` OBLIGATOIRE (un terme
 *   `x3` resterait ambigu, jamais accepté implicitement).
 * - `[coefficient][*×]?[xXyY]?` (groupes 4-5) — forme historique, coefficient d'abord (ou terme
 *   constant sans variable), séparateur optionnel, `×` accepté en plus de `*`. */
const TERME_XY = /^([+-]?)(?:([xXyY])[*×](\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)|(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)?[*×]?([xXyY])?)$/;

function analyserCoefficient(texte: string): number {
  if (texte === "") return 1;
  if (texte.includes("/")) {
    const [num, den] = texte.split("/");
    return Number(num.replace(",", ".")) / Number(den.replace(",", "."));
  }
  return Number(texte.replace(",", "."));
}

/** Découpe une expression en termes signés (`"2x-3y+1"` → `["+2x","-3y","+1"]`), robuste à un
 * signe initial absent. */
function decouperTermes(texte: string): string[] {
  const normalise = texte.trim().replace(/\s+/g, "");
  if (normalise === "") return [];
  const avecSigne = /^[+-]/.test(normalise) ? normalise : `+${normalise}`;
  return avecSigne.split(/(?=[+-])/);
}

/** `null` si l'expression contient un terme non reconnu (syntaxe invalide, fonction, parenthèse...). */
export function parserExpressionLineaireXY(texte: string): ExpressionLineaireXY | null {
  const termes = decouperTermes(texte);
  if (termes.length === 0) return null;

  let coefX = 0;
  let coefY = 0;
  let constante = 0;

  for (const terme of termes) {
    const correspondance = TERME_XY.exec(terme);
    if (!correspondance) return null;
    const [, signeTexte, variableAvantCoef, coefApresVariable, coefAvantVariable, variableApresCoefOuSeule] = correspondance;
    const variable = variableAvantCoef ?? variableApresCoefOuSeule;
    const coefTexte = variableAvantCoef ? coefApresVariable : coefAvantVariable;
    const signe = signeTexte === "-" ? -1 : 1;
    const magnitude = signe * analyserCoefficient(coefTexte ?? "");
    if (variable === undefined) constante += magnitude;
    else if (variable.toLowerCase() === "x") coefX += magnitude;
    else coefY += magnitude;
  }

  return { coefX, coefY, constante };
}

/** Parse une équation complète "gauche = droite" en un triplet implicite `(a,b,c)` tel que
 * `gauche-droite = 0` s'écrive `a·x+b·y+c=0` — `null` si la syntaxe est invalide, si l'équation ne
 * contient pas exactement un `=`, ou si le résultat ne dépend d'aucune des deux variables (pas une
 * droite). */
export function parserEquationDroiteXY(texte: string): DroiteImplicite | null {
  const cotes = texte.split("=");
  if (cotes.length !== 2) return null;

  const gauche = parserExpressionLineaireXY(cotes[0]);
  const droite = parserExpressionLineaireXY(cotes[1]);
  if (gauche === null || droite === null) return null;

  const a = gauche.coefX - droite.coefX;
  const b = gauche.coefY - droite.coefY;
  const c = gauche.constante - droite.constante;
  if (Math.abs(a) <= EPSILON_STRUCTURE && Math.abs(b) <= EPSILON_STRUCTURE) return null;

  return { a, b, c };
}

/**
 * Vérification d'une équation de droite en texte libre, sous N'IMPORTE QUELLE forme valide
 * (explicite dans un sens ou l'autre, ou implicite) — normalise vers la forme implicite puis
 * compare par PROPORTIONNALITÉ à la droite de référence, jamais une comparaison de chaînes ni une
 * forme imposée. Reconnaît nativement les deux cas particuliers (verticale/horizontale) sans
 * branchement spécial : une droite verticale de référence a `b=0`, donc seule une saisie de la
 * forme `x=...` (qui produit elle aussi `b=0`) peut lui être proportionnelle — une saisie `y=...`
 * produit toujours `b≠0` (sauf triplet nul, déjà rejeté), jamais accidentellement proportionnelle.
 */
export function diagnostiquerEquationDroiteLibre(texte: string, reference: DroiteImplicite): StatutVerification {
  const triplet = parserEquationDroiteXY(texte);
  if (triplet === null) return "parse_error";
  return statutTripletProportionnel(triplet, reference);
}

// ============================================================================
// Constructions géométriques supplémentaires — perpendiculaire, intersection de deux droites.
// DUPLIQUÉES depuis `generateurs/droite/geometrieDroite.ts` (Couche A) et
// `generateurs/relationsDroites/index.ts::perpendiculaire` (Couche A, générateur→générateur) plutôt
// qu'importées — règle Couche A↔B non négociable, voir l'en-tête de fichier. Introduites pour
// "Distance point-droite et droite-droite (méthode de synthèse)", qui doit recalculer LA MÊME
// géométrie côté Couche B — jamais au moment de la génération pour sa variante B (le point de départ
// y est choisi par l'élève lui-même à l'écran 0, donc la droite perpendiculaire et le point
// d'intersection ne peuvent être connus qu'une fois cette réponse soumise, jamais figés à l'avance).
// ============================================================================

/** Vecteur perpendiculaire à `v` — rotation de 90°. Même formule que `perpendiculaire`
 * (`generateurs/relationsDroites/index.ts`), dupliquée ici côté Couche B. */
export function perpendiculaireDroite(v: Composantes): Composantes {
  return { x: -v.y, y: v.x };
}

/** Même formule que `implicteDepuisPointVecteur` (`generateurs/droite/geometrieDroite.ts`),
 * dupliquée ici côté Couche B — construit l'équation implicite de la droite passant par `point`,
 * de vecteur directeur `v`. Toujours possible, quel que soit le vecteur. */
export function impliciteDepuisPointVecteurDroite(point: Point, v: Composantes): DroiteImplicite {
  const a = v.y;
  const b = -v.x;
  return { a, b, c: -(a * point.x + b * point.y) };
}

/**
 * Intersection de deux droites implicites — même formule (Cramer) que `intersectionDeuxDroites`
 * (`generateurs/droite/geometrieDroite.ts`), dupliquée ici côté Couche B. `null` si les deux
 * droites sont parallèles/confondues (déterminant en-dessous d'`EPSILON_STRUCTURE`) — cas qui ne se
 * présente structurellement jamais pour les deux seuls appelants de cette fonction dans le projet
 * (deux droites perpendiculaires, ou une perpendiculaire et l'une des deux parallèles de "Distance
 * point-droite et droite-droite", jamais parallèles entre elles par construction).
 */
export function intersectionDeuxDroitesImplicites(d1: DroiteImplicite, d2: DroiteImplicite): Point | null {
  const det = d1.a * d2.b - d2.a * d1.b;
  if (Math.abs(det) < EPSILON_STRUCTURE) return null;
  return {
    x: (d1.b * d2.c - d2.b * d1.c) / det,
    y: (d2.a * d1.c - d1.a * d2.c) / det,
  };
}

/** Réponse en 2 champs séparés x/y — diagnostic indépendant par champ, combiné via `combinerStatuts`
 * (même principe que le reste du projet — isole une erreur de signe sur une seule coordonnée). */
export interface ReponseIntersection {
  x: number;
  y: number;
}

export function diagnostiquerIntersection(reponse: ReponseIntersection, cible: Point): StatutVerification {
  return combinerStatuts(statutNumerique(reponse.x, cible.x), statutNumerique(reponse.y, cible.y));
}

export function verifierIntersection(reponse: ReponseIntersection, cible: Point): boolean {
  return diagnostiquerIntersection(reponse, cible) === "correct";
}

/** Même formule que `pointDepuisImplicite` (`generateurs/droite/geometrieDroite.ts`), dupliquée ici
 * côté Couche B — un point QUELCONQUE de la droite `d` (jamais LE point que l'élève doit trouver,
 * simplement un repli déterministe). Sert de valeur canonique de révélation à l'écran "choisir un
 * point" de "Distance point-droite et droite-droite" (variante paralleles) quand les tentatives sont
 * épuisées sans qu'aucune réponse valide de l'élève n'ait pu être reportée aux écrans suivants —
 * même principe que `pointCanoniqueSecond` (`sessionConstructionDroite.ts`). */
export function pointDepuisImpliciteDroite(d: DroiteImplicite): Point {
  if (d.b !== 0) return { x: 0, y: -d.c / d.b };
  return { x: -d.c / d.a, y: 0 };
}

/** Solution particulière de `a·x+b·y=g` (`g=pgcd(a,b)`) par l'algorithme d'Euclide étendu —
 * itératif (jamais récursif, pour rester robuste aux signes) ; `g` toujours ramené positif. */
function pgcdEtendu(a: number, b: number): { g: number; x: number; y: number } {
  let [oldR, r] = [a, b];
  let [oldS, s] = [1, 0];
  let [oldT, t] = [0, 1];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
  }
  return oldR < 0 ? { g: -oldR, x: -oldS, y: -oldT } : { g: oldR, x: oldS, y: oldT };
}

/**
 * Un point ENTIER ALÉATOIRE de la droite `ax+by+c=0` (a,b,c entiers) — jamais le même repli d'un
 * appel à l'autre, contrairement à `pointDepuisImpliciteDroite` (toujours LE MÊME point canonique).
 * Sert de repli de révélation pour "Distance point-droite et droite-droite" (écran "choisir un
 * point", variante paralleles) quand les tentatives sont épuisées sans qu'aucune réponse valide de
 * l'élève n'ait pu être reportée aux écrans suivants — spec (`promptgen47modifications.md`, point
 * 5) : "tirer un nouveau point valide aléatoirement" plutôt que réutiliser un repli fixe.
 *
 * Droite horizontale/verticale (`a=0`/`b=0`) : l'autre coordonnée est libre, un tirage direct
 * suffit. Cas général : une solution particulière par Euclide étendu (`a·x0+b·y0=g`, `g=pgcd(a,b)`,
 * garanti diviser `c` — la droite a toujours été construite depuis un point entier + un vecteur
 * directeur entier) PEUT être arbitrairement loin de l'origine (le coefficient `k=-c/g` n'a aucune
 * raison d'être petit) — recentrée d'abord au plus près de l'origine (projection sur le vecteur
 * directeur entier `(-b/g ; a/g)`, arrondie à l'entier le plus proche), puis déplacement par un
 * PETIT multiple entier ALÉATOIRE de ce même vecteur directeur — reste sur la droite ET à
 * coordonnées entières pour tout multiple entier, tout en restant un point "raisonnable" (jamais à
 * des milliers d'unités de l'origine), pour que le graphe Mafs illustratif de révélation reste
 * lisible.
 */
export function pointEntierAleatoireImpliciteDroite(d: DroiteImplicite): Point {
  const { a, b, c } = d;
  const decalage = Math.floor(Math.random() * 11) - 5; // entier aléatoire dans [-5, 5]
  if (a === 0) return { x: decalage, y: -c / b };
  if (b === 0) return { x: -c / a, y: decalage };
  const { g, x: x0, y: y0 } = pgcdEtendu(a, b);
  const k = -c / g;
  const baseX = x0 * k;
  const baseY = y0 * k;
  const dirX = -b / g;
  const dirY = a / g;
  const tProcheOrigine = Math.round(-(baseX * dirX + baseY * dirY) / (dirX * dirX + dirY * dirY));
  const t = tProcheOrigine + decalage;
  return { x: baseX + t * dirX, y: baseY + t * dirY };
}
