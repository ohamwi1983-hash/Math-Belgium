import type { Droite, ExercicePDRT_A, ExercicePDRT_B, ExercicePDRT_C, ExercicePDRT_D, ExercicePDRT_E, ExercicePDRT_F, ExercicePDRT_G, ExercicePDRT_H, ExercicePointsDroitesRemarquablesTriangle, Fraction, Point } from "../core6e/pointsDroitesRemarquablesTriangle.types";
import { formatFractionLatex } from "../generateurs6e/pointsDroitesRemarquablesTriangle/fraction";
import type { PhasePointsDroitesRemarquablesTriangle, ResultatExercicePointsDroitesRemarquablesTriangle } from "../moteur6e/typesPointsDroitesRemarquablesTriangle";
import { phasesPourExercice } from "../moteur6e/typesPointsDroitesRemarquablesTriangle";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen54`. Dispatch sur
 * `exercice.famille` PUIS `phase` (et `sousType` pour la famille G), mirroir
 * `formatDenombrementFondamental.ts` (6gen43), jamais importé par un autre générateur.
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths ;
 * couverture de régression : `formatPointsDroitesRemarquablesTriangle.test.ts`.
 *
 * **`DefinitionEcran`** — extension du patron `ChampDef[]` de `6gen43` avec 2 besoins propres à ce
 * générateur : un champ `"choixMultiple"` (famille E, écran 1 — plusieurs boutons `.btn.toggle-
 * active` activables simultanément, valeur = liste d'ids triée séparée par des virgules) et un mode
 * `"liste"` dédié (famille C, écrans 2-3 — nombre de lignes VARIABLE, add-as-needed, jamais un
 * `ChampDef[]` à cardinalité fixe) — un écran est SOIT un jeu de champs fixes, SOIT une liste,
 * jamais les deux mélangés dans ce générateur.
 */

export type TypeChamp = "texte" | "choix" | "choixMultiple";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export type DefinitionEcran = { kind: "champs"; champs: ChampDef[] } | { kind: "liste"; forme: "valeur" | "point"; label: string };

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

function champTexte(label: string, placeholder: string): ChampDef {
  return { type: "texte", label, placeholder };
}

// ============================================================================
// Formatage géométrique partagé.
// ============================================================================

/** Nettoie un résidu de virgule flottante négligeable (ex. `6.000000000000001`) — toutes les
 * valeurs générées par ce générateur sont mathématiquement entières ou des fractions exactes
 * connues, jamais approchées ; ce nettoyage protège uniquement l'AFFICHAGE d'un résidu binaire. */
function net(x: number): number {
  return Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x) : x;
}

export function fmtPoint(P: Point): string {
  return `(${net(P.x)};${net(P.y)})`;
}

export function fmtPointFrac(x: Fraction, y: Fraction): string {
  return `(${formatFractionLatex(x)};${formatFractionLatex(y)})`;
}

function fmtTerme(coef: number, variable: string, premier: boolean): string {
  const c = net(coef);
  if (c === 0) return "";
  const abs = Math.abs(c);
  const signe = c < 0 ? "-" : premier ? "" : "+";
  const valeur = abs === 1 ? "" : `${abs}`;
  return `${signe}${valeur}${variable}`;
}

/** `ax+by+c=0`, coefficients nettoyés, jamais de terme nul affiché superflu. */
export function fmtEquationDroite(d: Droite): string {
  const termes: string[] = [];
  let premier = true;
  const ta = fmtTerme(d.a, "x", premier);
  if (ta !== "") {
    termes.push(ta);
    premier = false;
  }
  const tb = fmtTerme(d.b, "y", premier);
  if (tb !== "") {
    termes.push(tb);
    premier = false;
  }
  const c = net(d.c);
  if (c !== 0 || termes.length === 0) {
    const signe = c < 0 ? "-" : premier ? "" : "+";
    termes.push(`${signe}${Math.abs(c)}`);
  }
  return `${termes.join("")}=0`;
}

/** `K+M·t` (à l'intérieur de la valeur absolue, famille C) — même logique de signe que
 * `fmtEquationDroite`, sans le `=0` final. */
function fmtExpressionAffine(K: number, M: number): string {
  const termes: string[] = [];
  const tk = net(K) !== 0 ? `${net(K) < 0 ? "-" : ""}${Math.abs(net(K))}` : "";
  if (tk !== "") termes.push(tk);
  const tm = fmtTerme(M, "t", termes.length === 0);
  if (tm !== "") termes.push(tm);
  if (termes.length === 0) return "0";
  return termes.join("");
}

// ============================================================================
// Famille A — Sommets depuis les milieux des côtés.
// ============================================================================

const OPTIONS_RELATION_A: OptionChoix[] = [
  { valeur: "subA", label: "B'+C'−A'" },
  { valeur: "subB", label: "A'+C'−B'" },
  { valeur: "subC", label: "A'+B'−C'" },
];

function consigneGeneraleA(): string {
  return "A', B' et C' sont respectivement les milieux de [BC], [CA] et [AB]. Retrouve les sommets A, B et C du triangle.";
}
function blocDonneesA(e: ExercicePDRT_A): string[] {
  return [`A'=${fmtPoint(e.Ap)}`, `B'=${fmtPoint(e.Bp)}`, `C'=${fmtPoint(e.Cp)}`];
}
function consigneEcranA(phase: PhasePointsDroitesRemarquablesTriangle): string {
  if (phase === "aEcran1") return "Pour chacun des sommets A, B et C, identifie la relation vectorielle qui permet de le retrouver à partir des 3 milieux.";
  return "Calcule les coordonnées de A, B et C à partir des 3 relations CONFIRMÉES.";
}
function etatActuelA(phase: PhasePointsDroitesRemarquablesTriangle): string[] | null {
  if (phase === "aEcran2") return ["\\text{Relations confirmées : }A=B'+C'-A'\\text{, }B=A'+C'-B'\\text{, }C=A'+B'-C'"];
  return null;
}
function definitionEcranA(phase: PhasePointsDroitesRemarquablesTriangle): DefinitionEcran {
  if (phase === "aEcran1") {
    return {
      kind: "champs",
      champs: [
        { type: "choix", label: "Relation pour A", options: OPTIONS_RELATION_A },
        { type: "choix", label: "Relation pour B", options: OPTIONS_RELATION_A },
        { type: "choix", label: "Relation pour C", options: OPTIONS_RELATION_A },
      ],
    };
  }
  return { kind: "champs", champs: [champTexte("x_A =", "ex : 1"), champTexte("y_A =", "ex : 2"), champTexte("x_B =", "ex : 3"), champTexte("y_B =", "ex : 4"), champTexte("x_C =", "ex : -1"), champTexte("y_C =", "ex : 0")] };
}
function niveauAideMaxA(phase: PhasePointsDroitesRemarquablesTriangle): number {
  return phase === "aEcran1" ? 2 : 0;
}
function aideNiveau1A(): AideAvecLatex {
  return { texte: "Dans le parallélogramme formé par les 3 milieux, chaque sommet du triangle s'obtient en additionnant les 2 milieux ADJACENTS à ce sommet, puis en soustrayant le milieu OPPOSÉ.", latex: null };
}
function aideNiveau2A(): AideAvecLatex {
  return { texte: "Une des 3 relations, à titre d'exemple :", latex: "A=B'+C'-A'" };
}

// ============================================================================
// Famille B — Point d'une bissectrice sur le côté opposé.
// ============================================================================

function consigneGeneraleB(): string {
  return "Le triangle ABC est donné. La bissectrice issue de B coupe [AC] en un point I. Retrouve les coordonnées de I.";
}
function blocDonneesB(e: ExercicePDRT_B): string[] {
  return [`A=${fmtPoint(e.A)}`, `B=${fmtPoint(e.B)}`, `C=${fmtPoint(e.C)}`];
}
function consigneEcranB(phase: PhasePointsDroitesRemarquablesTriangle): string {
  if (phase === "bEcran1") return "Calcule les longueurs AB et BC.";
  if (phase === "bEcran2") return "D'après le théorème de la bissectrice, quel est le rapport AI:IC, à partir des longueurs CONFIRMÉES ?";
  return "Calcule les coordonnées de I via I=(BC·A+AB·C)/(AB+BC), à partir du rapport CONFIRMÉ.";
}
// Accumulation (correctif transversal — le bloc "état actuel" doit lister TOUTES les réponses
// validées des écrans précédents, du plus ancien au plus récent, jamais seulement celle de l'écran
// immédiatement précédent) : `bEcran3` ne montrait auparavant QUE le rapport confirmé à `bEcran2`,
// sans les longueurs confirmées à `bEcran1`.
function etatActuelB(e: ExercicePDRT_B, phase: PhasePointsDroitesRemarquablesTriangle): string[] | null {
  const longueurs = `\\text{Longueurs confirmées : }AB=${e.AB}\\text{, }BC=${e.BC}`;
  if (phase === "bEcran2") return [longueurs];
  if (phase === "bEcran3") return [longueurs, `\\text{Rapport confirmé : }AI:IC=${e.AB}:${e.BC}`];
  return null;
}
function definitionEcranB(phase: PhasePointsDroitesRemarquablesTriangle): DefinitionEcran {
  if (phase === "bEcran1") return { kind: "champs", champs: [champTexte("AB =", "ex : 5"), champTexte("BC =", "ex : 12")] };
  if (phase === "bEcran2") return { kind: "champs", champs: [champTexte("AI (1ᵉʳ terme du rapport) =", "ex : 5"), champTexte("IC (2ᵉ terme du rapport) =", "ex : 12")] };
  return { kind: "champs", champs: [champTexte("x_I =", "ex : 1"), champTexte("y_I =", "ex : 2")] };
}
function niveauAideMaxB(phase: PhasePointsDroitesRemarquablesTriangle): number {
  return phase === "bEcran2" ? 2 : 0;
}
function aideNiveau1B(): AideAvecLatex {
  return { texte: "Théorème de la bissectrice : le rapport de partage sur le côté opposé égale le rapport des 2 côtés adjacents au sommet d'où part la bissectrice.", latex: null };
}
function aideNiveau2B(e: ExercicePDRT_B): AideAvecLatex {
  return { texte: "Rapport (non simplifié) :", latex: `${e.AB}:${e.BC}` };
}

// ============================================================================
// Famille C — Point à aire imposée sur une droite.
// ============================================================================

function consigneGeneraleC(): string {
  return "A, B et une droite d sont donnés, ainsi qu'une aire cible k. Trouve le(s) point(s) C sur d tel(s) que l'aire du triangle ABC vaille k.";
}
function blocDonneesC(e: ExercicePDRT_C): string[] {
  return [`A=${fmtPoint(e.A)}`, `B=${fmtPoint(e.B)}`, `(d):${fmtEquationDroite(e.d)}`, `k=${e.k}`];
}
function consigneEcranC(phase: PhasePointsDroitesRemarquablesTriangle): string {
  if (phase === "cEcran1") return "Un point C(t) parcourt d. Exprime l'aire du triangle ABC en fonction du paramètre t, sous la forme Aire(t)=½|K+M·t| : donne K et M.";
  if (phase === "cEcran2") return "Résous |K+M·t|=2k pour le paramètre t, à partir de K et M CONFIRMÉS — attention, cette équation admet en général 2 solutions.";
  return "Donne les coordonnées de C pour CHAQUE solution CONFIRMÉE de l'étape précédente.";
}
// Accumulation (correctif transversal, voir `etatActuelB` ci-dessus) : `cEcran3` ne montrait
// auparavant QUE les solutions confirmées à `cEcran2`, sans l'expression Aire(t) confirmée à
// `cEcran1`.
function etatActuelC(e: ExercicePDRT_C, phase: PhasePointsDroitesRemarquablesTriangle): string[] | null {
  const aire = `\\text{Confirmé : Aire}(t)=\\tfrac12\\left\\vert ${fmtExpressionAffine(e.K, e.M)}\\right\\vert`;
  if (phase === "cEcran2") return [aire];
  if (phase === "cEcran3") return [aire, `\\text{Solutions confirmées : }t\\in\\{${e.solutionsTFrac.map(formatFractionLatex).join(",\\,")}\\}`];
  return null;
}
function definitionEcranC(phase: PhasePointsDroitesRemarquablesTriangle): DefinitionEcran {
  if (phase === "cEcran1") return { kind: "champs", champs: [champTexte("K =", "ex : 3"), champTexte("M =", "ex : 2")] };
  if (phase === "cEcran2") return { kind: "liste", forme: "valeur", label: "Valeur(s) du paramètre t" };
  return { kind: "liste", forme: "point", label: "Coordonnées de C" };
}
function niveauAideMaxC(phase: PhasePointsDroitesRemarquablesTriangle): number {
  return phase === "cEcran2" ? 2 : 0;
}
function aideNiveau1C(): AideAvecLatex {
  return { texte: "Une équation de la forme |expression|=k (k>0) a 2 solutions : expression=k OU expression=−k.", latex: null };
}
function aideNiveau2C(e: ExercicePDRT_C): AideAvecLatex {
  return { texte: "Une des 2 équations, l'autre reste à poser :", latex: `${fmtExpressionAffine(e.K, e.M)}=${2 * e.k}` };
}

// ============================================================================
// Famille D — Côtés depuis un sommet et 2 médianes.
// ============================================================================

function consigneGeneraleD(): string {
  return "A est donné, ainsi que les 2 droites (BB') et (CC'), médianes issues respectivement de B et de C. Retrouve les équations des 3 côtés du triangle.";
}
function blocDonneesD(e: ExercicePDRT_D): string[] {
  return [`A=${fmtPoint(e.A)}`, `(BB'):${fmtEquationDroite(e.droiteBBp)}`, `(CC'):${fmtEquationDroite(e.droiteCCp)}`];
}
function consigneEcranD(phase: PhasePointsDroitesRemarquablesTriangle): string {
  if (phase === "dEcran1") return "Pose les 2 équations qui déterminent B : B appartient à sa propre médiane (BB') ; le milieu de [A,B] appartient à (CC').";
  if (phase === "dEcran2") return "Résous le système CONFIRMÉ pour trouver les coordonnées de B.";
  if (phase === "dEcran3") return "De façon analogue (C appartient à (CC') ; le milieu de [A,C] appartient à (BB')), donne directement les coordonnées de C.";
  return "Donne les équations des 3 côtés (AB), (AC) et (BC), à partir de A (donné), B et C CONFIRMÉS.";
}
// Accumulation (correctif transversal, voir `etatActuelB` ci-dessus) : `dEcran3` et `dEcran4` ne
// montraient auparavant QUE la (les) coordonnée(s) confirmée(s) à l'écran immédiatement précédent,
// sans le système confirmé à `dEcran1`.
function etatActuelD(e: ExercicePDRT_D, phase: PhasePointsDroitesRemarquablesTriangle): string[] | null {
  const systeme = `\\text{Système confirmé : }${fmtEquationDroite(e.eqPourB_1)}\\text{ et }${fmtEquationDroite(e.eqPourB_2)}`;
  if (phase === "dEcran2") return [systeme];
  if (phase === "dEcran3") return [systeme, `\\text{B confirmé : }B=${fmtPoint(e.B)}`];
  if (phase === "dEcran4") return [systeme, `\\text{B confirmé : }B=${fmtPoint(e.B)}\\text{, C confirmé : }C=${fmtPoint(e.C)}`];
  return null;
}
function definitionEcranD(phase: PhasePointsDroitesRemarquablesTriangle): DefinitionEcran {
  if (phase === "dEcran1") {
    return { kind: "champs", champs: [champTexte("a (éq.1, B∈(BB')) =", "ex : 1"), champTexte("b (éq.1) =", "ex : 2"), champTexte("c (éq.1) =", "ex : -3"), champTexte("a (éq.2, mil.[A,B]∈(CC')) =", "ex : 1"), champTexte("b (éq.2) =", "ex : 0"), champTexte("c (éq.2) =", "ex : -4")] };
  }
  if (phase === "dEcran2") return { kind: "champs", champs: [champTexte("x_B =", "ex : 4"), champTexte("y_B =", "ex : 0")] };
  if (phase === "dEcran3") return { kind: "champs", champs: [champTexte("x_C =", "ex : 0"), champTexte("y_C =", "ex : 6")] };
  return {
    kind: "champs",
    champs: [
      champTexte("a (AB) =", "ex : 0"),
      champTexte("b (AB) =", "ex : 1"),
      champTexte("c (AB) =", "ex : 0"),
      champTexte("a (AC) =", "ex : 1"),
      champTexte("b (AC) =", "ex : 0"),
      champTexte("c (AC) =", "ex : 0"),
      champTexte("a (BC) =", "ex : 3"),
      champTexte("b (BC) =", "ex : 2"),
      champTexte("c (BC) =", "ex : -12"),
    ],
  };
}
function niveauAideMaxD(phase: PhasePointsDroitesRemarquablesTriangle): number {
  return phase === "dEcran1" ? 2 : 0;
}
function aideNiveau1D(): AideAvecLatex {
  return { texte: "B appartient à sa propre médiane (BB'). Le milieu de [A,B] est le point B' de la médiane issue de C : il appartient donc à (CC').", latex: null };
}
function aideNiveau2D(e: ExercicePDRT_D): AideAvecLatex {
  return { texte: "1ʳᵉ équation déjà posée (B∈(BB')) — la seconde reste à trouver :", latex: fmtEquationDroite(e.eqPourB_1) };
}

// ============================================================================
// Famille E — Droite équidistante de deux points.
// ============================================================================

const OPTIONS_CONSTRUCTION_E: OptionChoix[] = [
  { valeur: "parallele", label: "Parallèle à (AB), passant par P" },
  { valeur: "perpendiculaire", label: "Perpendiculaire à (AB), passant par P" },
  { valeur: "milieu", label: "Passant par P et le milieu de [A,B]" },
  { valeur: "passeParAB", label: "La droite (AB) elle-même" },
];

function consigneGeneraleE(): string {
  return "P, A et B sont donnés. Trouve la ou les droite(s) passant par P et équidistantes de A et de B.";
}
function blocDonneesE(e: ExercicePDRT_E): string[] {
  return [`P=${fmtPoint(e.P)}`, `A=${fmtPoint(e.A)}`, `B=${fmtPoint(e.B)}`];
}
function consigneEcranE(phase: PhasePointsDroitesRemarquablesTriangle): string {
  if (phase === "eEcran1") return "Identifie LA (ou LES) construction(s) possible(s) parmi les propositions suivantes — il peut y en avoir plusieurs.";
  return "Calcule les équations des droites correspondant aux constructions CONFIRMÉES.";
}
function etatActuelE(phase: PhasePointsDroitesRemarquablesTriangle): string[] | null {
  if (phase === "eEcran2") return ["\\text{Constructions confirmées : parallèle à (AB) ; passant par le milieu de [A,B]}"];
  return null;
}
function definitionEcranE(phase: PhasePointsDroitesRemarquablesTriangle): DefinitionEcran {
  if (phase === "eEcran1") return { kind: "champs", champs: [{ type: "choixMultiple", label: "Construction(s) possible(s)", options: OPTIONS_CONSTRUCTION_E }] };
  return { kind: "champs", champs: [champTexte("a (parallèle) =", "ex : 1"), champTexte("b (parallèle) =", "ex: -1"), champTexte("c (parallèle) =", "ex : 0"), champTexte("a (milieu) =", "ex : 1"), champTexte("b (milieu) =", "ex : 1"), champTexte("c (milieu) =", "ex : 0")] };
}
function niveauAideMaxE(phase: PhasePointsDroitesRemarquablesTriangle): number {
  return phase === "eEcran1" ? 2 : 0;
}
function aideNiveau1E(): AideAvecLatex {
  return { texte: "Une droite équidistante de 2 points est soit parallèle à la droite qui les joint, soit passe par leur milieu.", latex: null };
}
function aideNiveau2E(): AideAvecLatex {
  return { texte: "Une des 2 constructions correctes, à titre d'exemple :", latex: "\\text{parallèle à (AB) passant par P}" };
}

// ============================================================================
// Famille F — Symétrique d'un point par rapport à une droite.
// ============================================================================

function consigneGeneraleF(): string {
  return "P est donné, ainsi qu'une droite définie par 2 points A et B. Trouve Q, symétrique de P par rapport à (AB).";
}
function blocDonneesF(e: ExercicePDRT_F): string[] {
  return [`P=${fmtPoint(e.P)}`, `A=${fmtPoint(e.A)}`, `B=${fmtPoint(e.B)}`];
}
function consigneEcranF(phase: PhasePointsDroitesRemarquablesTriangle): string {
  if (phase === "fEcran1") return "Trouve l'équation de (AB), puis l'équation de la perpendiculaire à (AB) passant par P.";
  if (phase === "fEcran2") return "Trouve le pied de la perpendiculaire H, intersection des 2 droites CONFIRMÉES.";
  return "Calcule Q, symétrique de P par rapport à H, à partir de H CONFIRMÉ.";
}
// Accumulation (correctif transversal, voir `etatActuelB` ci-dessus) : `fEcran3` ne montrait
// auparavant QUE H confirmé à `fEcran2`, sans (AB) et la perpendiculaire confirmées à `fEcran1`.
function etatActuelF(e: ExercicePDRT_F, phase: PhasePointsDroitesRemarquablesTriangle): string[] | null {
  const equations = `\\text{Confirmé : }(AB):${fmtEquationDroite(e.droiteAB)}\\text{, perpendiculaire : }${fmtEquationDroite(e.perpendiculaire)}`;
  if (phase === "fEcran2") return [equations];
  if (phase === "fEcran3") return [equations, `\\text{H confirmé : }H=${fmtPointFrac(e.HFrac.x, e.HFrac.y)}`];
  return null;
}
function definitionEcranF(phase: PhasePointsDroitesRemarquablesTriangle): DefinitionEcran {
  if (phase === "fEcran1") return { kind: "champs", champs: [champTexte("a (AB) =", "ex : 0"), champTexte("b (AB) =", "ex : 1"), champTexte("c (AB) =", "ex : 0"), champTexte("a (perp.) =", "ex : 1"), champTexte("b (perp.) =", "ex : 0"), champTexte("c (perp.) =", "ex : -5")] };
  if (phase === "fEcran2") return { kind: "champs", champs: [champTexte("x_H =", "ex : 5"), champTexte("y_H =", "ex : 0")] };
  return { kind: "champs", champs: [champTexte("x_Q =", "ex : 5"), champTexte("y_Q =", "ex : -5")] };
}
function niveauAideMaxF(phase: PhasePointsDroitesRemarquablesTriangle): number {
  return phase === "fEcran3" ? 2 : 0;
}
function aideNiveau1F(): AideAvecLatex {
  return { texte: "H est le milieu de [P,Q], donc Q=2H−P.", latex: null };
}
function aideNiveau2F(e: ExercicePDRT_F): AideAvecLatex {
  return { texte: "Relation posée (calcul non fait) :", latex: `Q=2\\times ${fmtPointFrac(e.HFrac.x, e.HFrac.y)}-${fmtPoint(e.P)}` };
}

// ============================================================================
// Famille G — Sommets d'un carré (2 sous-types).
// ============================================================================

function pointIntermediaireG(e: ExercicePDRT_G): Point {
  return e.sousType === "sommetDiagonale" ? e.O : e.M;
}
function secondSommetG(e: ExercicePDRT_G): Point {
  return e.sousType === "sommetDiagonale" ? e.C : e.A;
}
function labelPointIntermediaireG(e: ExercicePDRT_G): string {
  return e.sousType === "sommetDiagonale" ? "O" : "M";
}
function labelSecondSommetG(e: ExercicePDRT_G): string {
  return e.sousType === "sommetDiagonale" ? "C" : "A";
}

function consigneGeneraleG(e: ExercicePDRT_G): string {
  if (e.sousType === "sommetDiagonale") return "ABCD est un carré. Le sommet A et la droite (BD) [l'autre diagonale] sont donnés. Retrouve B, C et D.";
  return "ABCD est un carré de centre P. Le centre P et la droite (AB) [un côté] sont donnés. Retrouve les 4 sommets.";
}
function blocDonneesG(e: ExercicePDRT_G): string[] {
  if (e.sousType === "sommetDiagonale") return [`A=${fmtPoint(e.A)}`, `(BD):${fmtEquationDroite(e.droiteBD)}`];
  return [`P=${fmtPoint(e.P)}`, `(AB):${fmtEquationDroite(e.droiteAB)}`];
}
function consigneEcranG(e: ExercicePDRT_G, phase: PhasePointsDroitesRemarquablesTriangle): string {
  if (phase === "gEcran1") {
    if (e.sousType === "sommetDiagonale") return "Trouve l'équation de la perpendiculaire à (BD) passant par A, puis le pied de cette perpendiculaire — c'est le centre O du carré.";
    return "Trouve l'équation de la perpendiculaire à (AB) passant par P, puis le pied de cette perpendiculaire — c'est le milieu M du côté [A,B].";
  }
  if (phase === "gEcran2") {
    if (e.sousType === "sommetDiagonale") return "En utilisant les propriétés du carré (diagonales de même longueur, se coupant en leur milieu), trouve les coordonnées de C, sommet opposé à A.";
    return "En utilisant les propriétés du carré (côtés opposés parallèles et équidistants du centre), trouve les coordonnées de A, l'un des 2 sommets du côté donné.";
  }
  if (e.sousType === "sommetDiagonale") return "Assemble les coordonnées complètes de B, C et D.";
  return "Assemble les coordonnées complètes de A, B, C et D.";
}
// Accumulation (correctif transversal, voir `etatActuelB` ci-dessus) : `gEcran3` ne montrait
// auparavant QUE le second sommet confirmé à `gEcran2`, sans le point intermédiaire (O ou M)
// confirmé à `gEcran1` — la perpendiculaire, également confirmée à `gEcran1`, est reprise aussi
// (même bundle complet d'écran que la famille F, `etatActuelF` ci-dessus).
function etatActuelG(e: ExercicePDRT_G, phase: PhasePointsDroitesRemarquablesTriangle): string[] | null {
  const perpEtPoint = `\\text{Confirmé : perpendiculaire }${fmtEquationDroite(e.perpendiculaire)}\\text{, }${labelPointIntermediaireG(e)}=${fmtPoint(pointIntermediaireG(e))}`;
  if (phase === "gEcran2") return [perpEtPoint];
  if (phase === "gEcran3") return [perpEtPoint, `\\text{${labelSecondSommetG(e)} confirmé : }${labelSecondSommetG(e)}=${fmtPoint(secondSommetG(e))}`];
  return null;
}
function definitionEcranG(e: ExercicePDRT_G, phase: PhasePointsDroitesRemarquablesTriangle): DefinitionEcran {
  if (phase === "gEcran1") {
    const label = labelPointIntermediaireG(e);
    return { kind: "champs", champs: [champTexte("a (perp.) =", "ex : 1"), champTexte("b (perp.) =", "ex : -1"), champTexte("c (perp.) =", "ex : 0"), champTexte(`x_${label} =`, "ex : 0"), champTexte(`y_${label} =`, "ex : 0")] };
  }
  if (phase === "gEcran2") {
    const label = labelSecondSommetG(e);
    return { kind: "champs", champs: [champTexte(`x_${label} =`, "ex : 0"), champTexte(`y_${label} =`, "ex : 0")] };
  }
  if (e.sousType === "sommetDiagonale") {
    return { kind: "champs", champs: [champTexte("x_B =", "ex : 3"), champTexte("y_B =", "ex : 0"), champTexte("x_C =", "ex : 0"), champTexte("y_C =", "ex : -3"), champTexte("x_D =", "ex : -3"), champTexte("y_D =", "ex : 0")] };
  }
  return { kind: "champs", champs: [champTexte("x_A =", "ex : -1"), champTexte("y_A =", "ex : 1"), champTexte("x_B =", "ex : 1"), champTexte("y_B =", "ex : 1"), champTexte("x_C =", "ex : 1"), champTexte("y_C =", "ex : -1"), champTexte("x_D =", "ex : -1"), champTexte("y_D =", "ex : -1")] };
}
function niveauAideMaxG(phase: PhasePointsDroitesRemarquablesTriangle): number {
  return phase === "gEcran1" ? 2 : 0;
}
function aideNiveau1G(): AideAvecLatex {
  return { texte: "Dans un carré, les diagonales sont perpendiculaires, de même longueur, et se coupent en leur milieu (le centre).", latex: null };
}
function aideNiveau2G(e: ExercicePDRT_G): AideAvecLatex {
  return { texte: "Perpendiculaire déjà posée — le point d'intersection reste à calculer :", latex: fmtEquationDroite(e.perpendiculaire) };
}

// ============================================================================
// Famille H — Rayon réfléchi (réutilise F).
// ============================================================================

function consigneGeneraleH(): string {
  return "Un miroir d (défini par 2 points Ad et Bd), une source P et un point d'incidence M (sur d) sont donnés. Trouve l'équation du rayon réfléchi.";
}
function blocDonneesH(e: ExercicePDRT_H): string[] {
  return [`(d):${fmtEquationDroite(e.droiteD)}`, `P=${fmtPoint(e.P)}`, `M=${fmtPoint(e.M)}`];
}
function consigneEcranH(phase: PhasePointsDroitesRemarquablesTriangle): string {
  if (phase === "hEcran1") return "Trouve le symétrique P' de la source P par rapport au miroir d.";
  return "Le rayon réfléchi passe par P' et par M. Calcule son équation à partir de P' CONFIRMÉ.";
}
function etatActuelH(e: ExercicePDRT_H, phase: PhasePointsDroitesRemarquablesTriangle): string[] | null {
  if (phase === "hEcran2") return [`\\text{P' confirmé : }P'=${fmtPointFrac(e.PpFrac.x, e.PpFrac.y)}`];
  return null;
}
function definitionEcranH(phase: PhasePointsDroitesRemarquablesTriangle): DefinitionEcran {
  // Labels PLAIN TEXT (jamais rendus en KaTeX, comme tout `ChampDef.label`) : "x_P' =" plutôt que
  // "x_{P'} =" — la syntaxe LaTeX à accolades affichée telle quelle ressemblerait à une erreur de
  // frappe pour l'élève (piège trouvé par vérification Playwright manuelle sur le build de
  // production).
  if (phase === "hEcran1") return { kind: "champs", champs: [champTexte("x_P' =", "ex : 2"), champTexte("y_P' =", "ex : -3")] };
  return { kind: "champs", champs: [champTexte("a =", "ex : 1"), champTexte("b =", "ex : 1"), champTexte("c =", "ex : -5")] };
}
function niveauAideMaxH(phase: PhasePointsDroitesRemarquablesTriangle): number {
  return phase === "hEcran2" ? 2 : 0;
}
function aideNiveau1H(): AideAvecLatex {
  return { texte: "Le rayon réfléchi semble provenir du symétrique de la source par rapport au miroir.", latex: null };
}
function aideNiveau2H(e: ExercicePDRT_H): AideAvecLatex {
  return { texte: "Les 2 points par lesquels passe le rayon réfléchi sont rappelés (équation non calculée) :", latex: `P'=${fmtPointFrac(e.PpFrac.x, e.PpFrac.y)}\\text{, }M=${fmtPoint(e.M)}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExercicePointsDroitesRemarquablesTriangle): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
    case "E":
      return consigneGeneraleE();
    case "F":
      return consigneGeneraleF();
    case "G":
      return consigneGeneraleG(exercice);
    case "H":
      return consigneGeneraleH();
  }
}

export function blocDonnees(exercice: ExercicePointsDroitesRemarquablesTriangle): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesE(exercice);
    case "F":
      return blocDonneesF(exercice);
    case "G":
      return blocDonneesG(exercice);
    case "H":
      return blocDonneesH(exercice);
  }
}

export function consigneEcran(exercice: ExercicePointsDroitesRemarquablesTriangle, phase: PhasePointsDroitesRemarquablesTriangle): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
    case "E":
      return consigneEcranE(phase);
    case "F":
      return consigneEcranF(phase);
    case "G":
      return consigneEcranG(exercice, phase);
    case "H":
      return consigneEcranH(phase);
  }
}

export function etatActuel(exercice: ExercicePointsDroitesRemarquablesTriangle, phase: PhasePointsDroitesRemarquablesTriangle): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(phase);
    case "F":
      return etatActuelF(exercice, phase);
    case "G":
      return etatActuelG(exercice, phase);
    case "H":
      return etatActuelH(exercice, phase);
  }
}

export function definitionEcran(exercice: ExercicePointsDroitesRemarquablesTriangle, phase: PhasePointsDroitesRemarquablesTriangle): DefinitionEcran {
  switch (exercice.famille) {
    case "A":
      return definitionEcranA(phase);
    case "B":
      return definitionEcranB(phase);
    case "C":
      return definitionEcranC(phase);
    case "D":
      return definitionEcranD(phase);
    case "E":
      return definitionEcranE(phase);
    case "F":
      return definitionEcranF(phase);
    case "G":
      return definitionEcranG(exercice, phase);
    case "H":
      return definitionEcranH(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExercicePointsDroitesRemarquablesTriangle, phase: PhasePointsDroitesRemarquablesTriangle): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
    case "E":
      return niveauAideMaxE(phase);
    case "F":
      return niveauAideMaxF(phase);
    case "G":
      return niveauAideMaxG(phase);
    case "H":
      return niveauAideMaxH(phase);
  }
}

export function aideNiveau1(exercice: ExercicePointsDroitesRemarquablesTriangle, phase: PhasePointsDroitesRemarquablesTriangle): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A();
    case "B":
      return aideNiveau1B();
    case "C":
      return aideNiveau1C();
    case "D":
      return aideNiveau1D();
    case "E":
      return aideNiveau1E();
    case "F":
      return aideNiveau1F();
    case "G":
      return aideNiveau1G();
    case "H":
      return aideNiveau1H();
  }
}

export function aideNiveau2(exercice: ExercicePointsDroitesRemarquablesTriangle, phase: PhasePointsDroitesRemarquablesTriangle): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A();
    case "B":
      return aideNiveau2B(exercice);
    case "C":
      return aideNiveau2C(exercice);
    case "D":
      return aideNiveau2D(exercice);
    case "E":
      return aideNiveau2E();
    case "F":
      return aideNiveau2F(exercice);
    case "G":
      return aideNiveau2G(exercice);
    case "H":
      return aideNiveau2H(exercice);
  }
}

export const LIBELLE_PHASE: Record<PhasePointsDroitesRemarquablesTriangle, string> = {
  aEcran1: "Étape 1 (relations vectorielles)",
  aEcran2: "Étape 2 (coordonnées des sommets)",
  bEcran1: "Étape 1 (longueurs AB, BC)",
  bEcran2: "Étape 2 (rapport de la bissectrice)",
  bEcran3: "Étape 3 (coordonnées de I)",
  cEcran1: "Étape 1 (aire en fonction du paramètre)",
  cEcran2: "Étape 2 (résolution en t)",
  cEcran3: "Étape 3 (coordonnées de C)",
  dEcran1: "Étape 1 (système déterminant B)",
  dEcran2: "Étape 2 (coordonnées de B)",
  dEcran3: "Étape 3 (coordonnées de C)",
  dEcran4: "Étape 4 (équations des 3 côtés)",
  eEcran1: "Étape 1 (constructions identifiées)",
  eEcran2: "Étape 2 (équations des droites)",
  fEcran1: "Étape 1 ((AB) et perpendiculaire)",
  fEcran2: "Étape 2 (pied H)",
  fEcran3: "Étape 3 (symétrique Q)",
  gEcran1: "Étape 1 (perpendiculaire + point intermédiaire)",
  gEcran2: "Étape 2 (second sommet)",
  gEcran3: "Étape 3 (sommets restants)",
  hEcran1: "Étape 1 (symétrique P')",
  hEcran2: "Étape 2 (rayon réfléchi)",
};

export const LIBELLE_FAMILLE: Record<ExercicePointsDroitesRemarquablesTriangle["famille"], string> = {
  A: "A — Sommets depuis les milieux des côtés",
  B: "B — Point d'une bissectrice sur le côté opposé",
  C: "C — Point à aire imposée sur une droite",
  D: "D — Côtés depuis un sommet et 2 médianes",
  E: "E — Droite équidistante de deux points",
  F: "F — Symétrique d'un point par rapport à une droite",
  G: "G — Sommets d'un carré",
  H: "H — Rayon réfléchi",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExercicePointsDroitesRemarquablesTriangle, phase: PhasePointsDroitesRemarquablesTriangle): string[] {
  switch (exercice.famille) {
    case "A":
      if (phase === "aEcran1") return ["A=B'+C'-A'", "B=A'+C'-B'", "C=A'+B'-C'"];
      return [`A=${fmtPoint(exercice.A)}`, `B=${fmtPoint(exercice.B)}`, `C=${fmtPoint(exercice.C)}`];
    case "B":
      if (phase === "bEcran1") return [`AB=${exercice.AB}`, `BC=${exercice.BC}`];
      if (phase === "bEcran2") return [`AI:IC=${exercice.AB}:${exercice.BC}`];
      return [`I=${fmtPointFrac(exercice.IFrac.x, exercice.IFrac.y)}`];
    case "C":
      if (phase === "cEcran1") return [`K=${exercice.K}`, `M=${exercice.M}`];
      if (phase === "cEcran2") return [`t\\in\\{${exercice.solutionsTFrac.map(formatFractionLatex).join(",\\,")}\\}`];
      return exercice.solutionsCFrac.map((p) => `C=${fmtPointFrac(p.x, p.y)}`);
    case "D":
      if (phase === "dEcran1") return [fmtEquationDroite(exercice.eqPourB_1), fmtEquationDroite(exercice.eqPourB_2)];
      if (phase === "dEcran2") return [`B=${fmtPoint(exercice.B)}`];
      if (phase === "dEcran3") return [`C=${fmtPoint(exercice.C)}`];
      return [fmtEquationDroite(exercice.droiteAB), fmtEquationDroite(exercice.droiteAC), fmtEquationDroite(exercice.droiteBC)];
    case "E":
      if (phase === "eEcran1") return ["\\text{parallèle à (AB), passant par P}", "\\text{passant par P et le milieu de [A,B]}"];
      return [fmtEquationDroite(exercice.droiteParallele), fmtEquationDroite(exercice.droiteMilieu)];
    case "F":
      if (phase === "fEcran1") return [fmtEquationDroite(exercice.droiteAB), fmtEquationDroite(exercice.perpendiculaire)];
      if (phase === "fEcran2") return [`H=${fmtPointFrac(exercice.HFrac.x, exercice.HFrac.y)}`];
      return [`Q=${fmtPointFrac(exercice.QFrac.x, exercice.QFrac.y)}`];
    case "G": {
      if (phase === "gEcran1") return [fmtEquationDroite(exercice.perpendiculaire), `${labelPointIntermediaireG(exercice)}=${fmtPoint(pointIntermediaireG(exercice))}`];
      if (phase === "gEcran2") return [`${labelSecondSommetG(exercice)}=${fmtPoint(secondSommetG(exercice))}`];
      if (exercice.sousType === "sommetDiagonale") return [`B=${fmtPoint(exercice.B)}`, `C=${fmtPoint(exercice.C)}`, `D=${fmtPoint(exercice.D)}`];
      return [`A=${fmtPoint(exercice.A)}`, `B=${fmtPoint(exercice.B)}`, `C=${fmtPoint(exercice.C)}`, `D=${fmtPoint(exercice.D)}`];
    }
    case "H":
      if (phase === "hEcran1") return [`P'=${fmtPointFrac(exercice.PpFrac.x, exercice.PpFrac.y)}`];
      return [fmtEquationDroite(exercice.rayonReflechi)];
  }
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice), mirroir `calculerTotalPointsDenombrementFondamental`. */
export function calculerTotalPointsPointsDroitesRemarquablesTriangle(resultat: ResultatExercicePointsDroitesRemarquablesTriangle): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
