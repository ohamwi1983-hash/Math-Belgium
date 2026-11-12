import type { ExerciceTrianglesA, ExerciceTrianglesB, ExerciceTrianglesC, ExerciceTrianglesD, ExerciceTrianglesE, ExerciceTrianglesComplexes, OrdresChoix, PositionE, SommetOAB, StatutSommet } from "../core6e/trianglesComplexes.types";
import type { PhaseTrianglesComplexes } from "../moteur6e/typesTrianglesComplexes";
import { pointEntierLatex } from "../generateurs6e/trianglesComplexes/construction";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen41`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatFormeTrigonometrique.ts` (6gen37), jamais importé
 * par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode math** (bugs déjà
 * rencontrés et corrigés ailleurs, documentés CLAUDE.md) — ce générateur affiche beaucoup de
 * conclusions en PROSE ("isocèle en B", "pas rectangle") : ces libellés restent TOUJOURS du texte
 * HTML brut hors KaTeX (label de bouton, `etat-actuel-box` texte) ou `\text{...}`-wrappés à
 * l'intérieur d'un fragment KaTeX — jamais du français injecté nu dans une expression `Katex`.
 * Couverture de régression : `formatTrianglesComplexes.test.ts`.
 */

export type TypeChamp = "texte";

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
}

export interface ChoixDef {
  id: string;
  label: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`,
 * rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latexFrag(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

// ============================================================================
// Libellés et options de choix — ordre d'affichage tiré par exercice (`ordres`, audit 6e ch. 5,
// point 6 : options mélangées, une seule tentative — voir `tentativesMaxPhase`).
// ============================================================================

export const LIBELLE_ISOCELE_ABC: Record<StatutSommet, string> = { A: "Isocèle en A", B: "Isocèle en B", C: "Isocèle en C", aucun: "Pas isocèle" };
export const LIBELLE_RECTANGLE_ABC: Record<StatutSommet, string> = { A: "Rectangle en A", B: "Rectangle en B", C: "Rectangle en C", aucun: "Pas rectangle" };
export const LIBELLE_ISOCELE_OAB: Record<SommetOAB | "aucun", string> = { O: "Isocèle en O", A: "Isocèle en A", B: "Isocèle en B", aucun: "Pas isocèle" };
export const LIBELLE_RECTANGLE_OAB: Record<SommetOAB | "aucun", string> = { O: "Rectangle en O", A: "Rectangle en A", B: "Rectangle en B", aucun: "Pas rectangle" };

const OPTIONS_ISOCELE_ABC: ChoixDef[] = (["A", "B", "C", "aucun"] as const).map((id) => ({ id, label: LIBELLE_ISOCELE_ABC[id] }));
const OPTIONS_RECTANGLE_ABC: ChoixDef[] = (["A", "B", "C", "aucun"] as const).map((id) => ({ id, label: LIBELLE_RECTANGLE_ABC[id] }));
const OPTIONS_ISOCELE_OAB: ChoixDef[] = (["O", "A", "B", "aucun"] as const).map((id) => ({ id, label: LIBELLE_ISOCELE_OAB[id] }));
const OPTIONS_RECTANGLE_OAB: ChoixDef[] = (["O", "A", "B", "aucun"] as const).map((id) => ({ id, label: LIBELLE_RECTANGLE_OAB[id] }));
const OPTIONS_EQUIDISTANCE: ChoixDef[] = [
  { id: "equidistant", label: "A est équidistant des 3 sommets : c'est le centre du triangle" },
  { id: "non", label: "A n'est pas équidistant des 3 sommets" },
];
const OPTIONS_COHERENCE: ChoixDef[] = [
  { id: "coherent", label: "Cohérent : B et D donnent le même rapport et le même angle" },
  { id: "incoherent", label: "Incohérent : B et D donnent un autre rapport ou un autre angle" },
];
export const LIBELLE_POSITION_E: Record<PositionE, string> = {
  alignes: "A, B et C sont alignés",
  perpendiculaires: "Les droites (AB) et (AC) sont perpendiculaires",
  aucun: "Ni alignés, ni perpendiculaires",
};
const OPTIONS_POSITION_E: ChoixDef[] = (["alignes", "perpendiculaires", "aucun"] as const).map((id) => ({ id, label: LIBELLE_POSITION_E[id] }));

/** Applique la permutation `ordre` (de 0..3) à une liste de m ≤ 4 options : les indices ≥ m sont
 * ignorés, l'ordre relatif des autres reste uniforme. */
function ordonner(options: ChoixDef[], ordre: number[] | undefined): ChoixDef[] {
  if (!ordre) return options;
  return ordre.filter((i) => i < options.length).map((i) => options[i]);
}
function ordreEcran(ordres: OrdresChoix | undefined, rang: 0 | 1): number[] | undefined {
  return ordres?.[rang];
}

/** Placeholders HORS de l'espace des tirages, virgule décimale (audit 6e ch. 5) : une longueur vaut
 * √n (n entier) — jamais 2,5 ; les distances de la famille C sont rationnelles ou multiples de √3 —
 * jamais √5 ; rapports 2 à 4 — jamais 5 ; angles multiples de π/2 — jamais 2π/5 ; multiplicateur et
 * quotient entiers de Gauss — jamais 0,5+1,5i. Angles en degrés : voir `PLACEHOLDER_DEGRES`. */
const PLACEHOLDER_LONGUEUR = "ex : 2,5";
const PLACEHOLDER_DISTANCE_C = "ex : sqrt(5)";
const PLACEHOLDER_RAPPORT = "ex : 5";
const PLACEHOLDER_ANGLE = "ex : 2pi/5";
const PLACEHOLDER_AFFIXE = "ex : 0,5+1,5i";
/** Aucun angle de la famille B ne tombe à moins de 0,5° de 15,5 (vérifié sur 10 000 tirages). */
const PLACEHOLDER_DEGRES = "ex : 15,5";

// ============================================================================
// Famille A — Isocèle, rectangle, les deux ou aucun.
// ============================================================================

export function consigneGeneraleA(): FragmentConsigne[] {
  return [texte("Étudie le triangle ABC défini par les affixes de ses sommets : calcule ses côtés, puis détermine s'il est isocèle et s'il est rectangle.")];
}
export function blocDonneesA(e: ExerciceTrianglesA): string[] {
  return [`z_A=${e.A.latex}`, `z_B=${e.B.latex}`, `z_C=${e.C.latex}`];
}
export function consigneEcranA(phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  if (phase === "aEcran1") return [texte("Calcule les 3 longueurs des côtés, par le module d'une différence d'affixes (par exemple "), latexFrag("AB=|z_B-z_A|"), texte("). Une valeur exacte comme "), latexFrag("\\sqrt{10}"), texte(" s'écrit sqrt(10).")];
  if (phase === "aEcran2") return [texte("À partir des longueurs confirmées, indique si le triangle est isocèle, et en quel sommet (une seule tentative).")];
  return [texte("Teste la relation de Pythagore sur les longueurs confirmées : le triangle est-il rectangle, et en quel sommet ? (une seule tentative)")];
}
export function etatActuelA(e: ExerciceTrianglesA, phase: PhaseTrianglesComplexes): string[] | null {
  const longueurs = [`AB=${e.AB.latex}`, `AC=${e.AC.latex}`, `BC=${e.BC.latex}`];
  if (phase === "aEcran2") return longueurs;
  if (phase === "aEcran3") return [...longueurs, `\\text{${LIBELLE_ISOCELE_ABC[e.sommetIsocele]} (confirmé)}`];
  return null;
}
export function champsA(phase: PhaseTrianglesComplexes): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "AB =", placeholder: PLACEHOLDER_LONGUEUR }, { type: "texte", label: "AC =", placeholder: PLACEHOLDER_LONGUEUR }, { type: "texte", label: "BC =", placeholder: PLACEHOLDER_LONGUEUR }];
  return [];
}
export function choixA(e: ExerciceTrianglesA, phase: PhaseTrianglesComplexes): ChoixDef[] {
  if (phase === "aEcran2") return ordonner(OPTIONS_ISOCELE_ABC, ordreEcran(e.ordres, 0));
  if (phase === "aEcran3") return ordonner(OPTIONS_RECTANGLE_ABC, ordreEcran(e.ordres, 1));
  return [];
}
export function niveauAideMaxA(phase: PhaseTrianglesComplexes): number {
  return phase === "aEcran3" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "aEcran3") return AUCUNE_AIDE;
  return { texte: "Un triangle est rectangle si le carré du plus grand côté est égal à la somme des carrés des deux autres ; l'angle droit est alors opposé à ce plus grand côté.", latex: null };
}
export function aideNiveau2A(e: ExerciceTrianglesA, phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "aEcran3") return AUCUNE_AIDE;
  const c2 = (l: { numerique: number }) => Math.round(l.numerique * l.numerique);
  return { texte: "Les carrés des 3 longueurs (comparaison non faite) :", latex: `AB^2=${c2(e.AB)}\\qquad AC^2=${c2(e.AC)}\\qquad BC^2=${c2(e.BC)}` };
}

// ============================================================================
// Famille B — Triangle isocèle OAB, loi des cosinus.
// ============================================================================

/** Consigne NEUTRE (audit 6e ch. 5, point 6 : elle annonçait « triangle isocèle… démontre qu'il
 * n'est pas rectangle », c'est-à-dire les verdicts des écrans 2 et 3). */
export function consigneGeneraleB(): FragmentConsigne[] {
  return [texte("Étudie le triangle OAB : calcule ses côtés, détermine s'il est isocèle et s'il est rectangle, puis calcule ses 3 angles grâce à la loi des cosinus.")];
}
export function blocDonneesB(e: ExerciceTrianglesB): string[] {
  return [`z_O=${e.O.latex}`, `z_A=${e.A.latex}`, `z_B=${e.B.latex}`];
}
export function consigneEcranB(phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  if (phase === "bEcran1") return [texte("Calcule les 3 longueurs OA, OB et AB (valeurs exactes : sqrt(n) est accepté).")];
  if (phase === "bEcran2") return [texte("À partir des longueurs confirmées, indique si le triangle est isocèle, et en quel sommet (une seule tentative).")];
  if (phase === "bEcran3") return [texte("Teste la relation de Pythagore sur les longueurs confirmées : le triangle est-il rectangle, et en quel sommet ? (une seule tentative)")];
  return [texte("Applique la loi des cosinus pour trouver l'angle au sommet principal, puis déduis les 2 autres (égaux, somme des angles 180°). Réponses en degrés, arrondies au dixième.")];
}
export function etatActuelB(e: ExerciceTrianglesB, phase: PhaseTrianglesComplexes): string[] | null {
  const longueurs = [`OA=${e.OA.latex}`, `OB=${e.OB.latex}`, `AB=${e.AB.latex}`];
  const isocele = `\\text{${LIBELLE_ISOCELE_OAB[e.sommetIsocele]} (confirmé)}`;
  const rectangle = `\\text{${LIBELLE_RECTANGLE_OAB[e.sommetRectangle]} (confirmé)}`;
  if (phase === "bEcran2") return longueurs;
  if (phase === "bEcran3") return [...longueurs, isocele];
  if (phase === "bEcran4") return [...longueurs, isocele, rectangle];
  return null;
}
export function champsB(phase: PhaseTrianglesComplexes): ChampDef[] {
  if (phase === "bEcran1") return [{ type: "texte", label: "OA =", placeholder: PLACEHOLDER_LONGUEUR }, { type: "texte", label: "OB =", placeholder: PLACEHOLDER_LONGUEUR }, { type: "texte", label: "AB =", placeholder: PLACEHOLDER_LONGUEUR }];
  if (phase === "bEcran4") return [{ type: "texte", label: "Angle en O (°) =", placeholder: PLACEHOLDER_DEGRES }, { type: "texte", label: "Angle en A (°) =", placeholder: PLACEHOLDER_DEGRES }, { type: "texte", label: "Angle en B (°) =", placeholder: PLACEHOLDER_DEGRES }];
  return [];
}
export function choixB(e: ExerciceTrianglesB, phase: PhaseTrianglesComplexes): ChoixDef[] {
  if (phase === "bEcran2") return ordonner(OPTIONS_ISOCELE_OAB, ordreEcran(e.ordres, 0));
  if (phase === "bEcran3") return ordonner(OPTIONS_RECTANGLE_OAB, ordreEcran(e.ordres, 1));
  return [];
}
export function niveauAideMaxB(phase: PhaseTrianglesComplexes): number {
  return phase === "bEcran4" ? 2 : 0;
}
/** Côtés adjacents / opposé au sommet principal S (noms, carrés entiers, formes exactes). */
function cotesAutour(e: ExerciceTrianglesB): { s: SommetOAB; adj1: string; adj2: string; opp: string; l1: number; l2: number; lo: number; x1: string; x2: string } {
  const s = e.sommetIsocele;
  const carre = (l: { numerique: number }) => Math.round(l.numerique * l.numerique);
  if (s === "O") return { s, adj1: "OA", adj2: "OB", opp: "AB", l1: carre(e.OA), l2: carre(e.OB), lo: carre(e.AB), x1: e.OA.latex, x2: e.OB.latex };
  if (s === "A") return { s, adj1: "AO", adj2: "AB", opp: "OB", l1: carre(e.OA), l2: carre(e.AB), lo: carre(e.OB), x1: e.OA.latex, x2: e.AB.latex };
  return { s, adj1: "BO", adj2: "BA", opp: "OA", l1: carre(e.OB), l2: carre(e.AB), lo: carre(e.OA), x1: e.OB.latex, x2: e.AB.latex };
}
export function aideNiveau1B(e: ExerciceTrianglesB, phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "bEcran4") return AUCUNE_AIDE;
  const c = cotesAutour(e);
  return { texte: `Loi des cosinus, appliquée à l'angle au sommet principal ${c.s} :`, latex: `${c.opp}^2=${c.adj1}^2+${c.adj2}^2-2\\cdot ${c.adj1}\\cdot ${c.adj2}\\cdot\\cos\\widehat{${c.s}}` };
}
export function aideNiveau2B(e: ExerciceTrianglesB, phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "bEcran4") return AUCUNE_AIDE;
  const c = cotesAutour(e);
  return { texte: "Valeurs des carrés des côtés substituées (résolution non faite) :", latex: `${c.lo}=${c.l1}+${c.l2}-2\\cdot ${c.x1}\\cdot ${c.x2}\\cdot\\cos\\widehat{${c.s}}` };
}

// ============================================================================
// Famille C — Triangle équilatéral OBF : A est-il le centre ?
// ============================================================================

/** Consigne NEUTRE (audit 6e ch. 5, point 6 : elle annonçait « démontre que A est équidistant »). */
export function consigneGeneraleC(): FragmentConsigne[] {
  return [texte("Vérifie que le triangle OBF est équilatéral, puis détermine si le point A est équidistant des 3 sommets, c'est-à-dire s'il est le centre du triangle.")];
}
export function blocDonneesC(e: ExerciceTrianglesC): string[] {
  return [`z_O=${e.O.latex}`, `z_B=${e.B.latex}`, `z_F=${e.F.latex}`, `z_A=${e.A.latex}`];
}
export function consigneEcranC(phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  if (phase === "cEcran1") return [texte("Calcule les 3 longueurs OB, BF et OF.")];
  if (phase === "cEcran2") return [texte("Calcule les 3 distances AO, AB et AF (valeurs exactes : sqrt(3)/3 est accepté).")];
  return [texte("À partir des distances confirmées, conclus (une seule tentative).")];
}
export function etatActuelC(e: ExerciceTrianglesC, phase: PhaseTrianglesComplexes): string[] | null {
  const cotes = `OB=BF=OF=${e.cote}\\text{ (confirmé)}`;
  if (phase === "cEcran2") return [cotes];
  if (phase === "cEcran3") return [cotes, `AO=${e.AO.latex}`, `AB=${e.AB.latex}`, `AF=${e.AF.latex}`];
  return null;
}
export function champsC(phase: PhaseTrianglesComplexes): ChampDef[] {
  if (phase === "cEcran1") return [{ type: "texte", label: "OB =", placeholder: PLACEHOLDER_LONGUEUR }, { type: "texte", label: "BF =", placeholder: PLACEHOLDER_LONGUEUR }, { type: "texte", label: "OF =", placeholder: PLACEHOLDER_LONGUEUR }];
  if (phase === "cEcran2") return [{ type: "texte", label: "AO =", placeholder: PLACEHOLDER_DISTANCE_C }, { type: "texte", label: "AB =", placeholder: PLACEHOLDER_DISTANCE_C }, { type: "texte", label: "AF =", placeholder: PLACEHOLDER_DISTANCE_C }];
  return [];
}
export function choixC(e: ExerciceTrianglesC, phase: PhaseTrianglesComplexes): ChoixDef[] {
  return phase === "cEcran3" ? ordonner(OPTIONS_EQUIDISTANCE, ordreEcran(e.ordres, 0)) : [];
}
export function niveauAideMaxC(phase: PhaseTrianglesComplexes): number {
  return phase === "cEcran2" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "cEcran2") return AUCUNE_AIDE;
  return { texte: "Chaque distance est le module d'une différence d'affixes ; par exemple :", latex: "AB=|z_B-z_A|" };
}
export function aideNiveau2C(e: ExerciceTrianglesC, phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "cEcran2") return AUCUNE_AIDE;
  return { texte: "La première distance (les 2 autres non calculées) :", latex: `AO=|z_A|=${e.AO.latex}` };
}

// ============================================================================
// Famille D — Similitude entre deux triangles.
// ============================================================================

/** Consigne NEUTRE : le triangle OCD n'est plus présenté comme l'image certaine de OAB (≈ 1 fois
 * sur 3, D n'est pas l'image de B par la même similitude — audit 6e ch. 5, point 6). */
export function consigneGeneraleD(): FragmentConsigne[] {
  return [texte("La similitude de centre O qui envoie A sur C envoie-t-elle aussi B sur D ? Autrement dit, le triangle OCD est-il l'image du triangle OAB par une similitude de centre O ?")];
}
/** Une affixe par ligne (aucun `\quad` collé — audit 6e ch. 5, point commun 13). */
export function blocDonneesD(e: ExerciceTrianglesD): string[] {
  return [`z_O=0`, `z_A=${e.A.latex}`, `z_B=${e.B.latex}`, `z_C=${e.C.latex}`, `z_D=${e.D.latex}`];
}
export function consigneEcranD(phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  if (phase === "dEcran1") return [texte("Calcule le rapport "), latexFrag("\\dfrac{|z_C|}{|z_A|}"), texte(" et l'angle "), latexFrag("\\arg z_C-\\arg z_A"), texte(" de la similitude de centre O qui envoie A sur C.")];
  if (phase === "dEcran2") return [texte("Calcule de même "), latexFrag("\\dfrac{|z_D|}{|z_B|}"), texte(" et "), latexFrag("\\arg z_D-\\arg z_B"), texte(", puis conclus (une seule tentative).")];
  return [texte("Écris sous la forme a+bi le nombre complexe "), latexFrag("k\\cdot\\, e^{i\\theta}"), texte(" qui caractérise la similitude de centre O envoyant A sur C, à partir du rapport et de l'angle confirmés.")];
}
export function etatActuelD(e: ExerciceTrianglesD, phase: PhaseTrianglesComplexes): string[] | null {
  const rapportAngle = [`k=${e.rapport}`, `\\theta=${e.angleLatex}`];
  if (phase === "dEcran2") return rapportAngle;
  if (phase === "dEcran3") return [...rapportAngle, `\\text{${e.coherent ? "Cohérent" : "Incohérent"} (confirmé)}`];
  return null;
}
export function champsD(phase: PhaseTrianglesComplexes): ChampDef[] {
  if (phase === "dEcran1") return [{ type: "texte", label: "Rapport k =", placeholder: PLACEHOLDER_RAPPORT }, { type: "texte", label: "Angle θ =", placeholder: PLACEHOLDER_ANGLE }];
  if (phase === "dEcran3") return [{ type: "texte", label: "Multiplicateur =", placeholder: PLACEHOLDER_AFFIXE }];
  return [];
}
export function choixD(e: ExerciceTrianglesD, phase: PhaseTrianglesComplexes): ChoixDef[] {
  return phase === "dEcran2" ? ordonner(OPTIONS_COHERENCE, ordreEcran(e.ordres, 0)) : [];
}
export function niveauAideMaxD(phase: PhaseTrianglesComplexes): number {
  return phase === "dEcran1" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "dEcran1") return AUCUNE_AIDE;
  return { texte: "Une similitude de centre O multiplie toutes les affixes par un même nombre complexe, de module égal au rapport et d'argument égal à l'angle.", latex: "z_C=k\\cdot\\, e^{i\\theta}\\cdot\\, z_A" };
}
export function aideNiveau2D(e: ExerciceTrianglesD, phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "dEcran1") return AUCUNE_AIDE;
  return { texte: "Le rapport, calculé avec A et C (angle non calculé) :", latex: `k=${e.rapport}` };
}

// ============================================================================
// Famille E — Alignés, perpendiculaires ou ni l'un ni l'autre (audit 6e ch. 5, point 44).
// ============================================================================

export function consigneGeneraleE(): FragmentConsigne[] {
  return [texte("Les points A, B et C sont-ils alignés ? Les droites (AB) et (AC) sont-elles perpendiculaires ? Réponds à l'aide du quotient "), latexFrag("\\dfrac{z_C-z_A}{z_B-z_A}"), texte(".")];
}
export function blocDonneesE(e: ExerciceTrianglesE): string[] {
  return [`z_A=${e.A.latex}`, `z_B=${e.B.latex}`, `z_C=${e.C.latex}`];
}
export function consigneEcranE(phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  if (phase === "eEcran1") return [texte("Calcule le quotient "), latexFrag("q=\\dfrac{z_C-z_A}{z_B-z_A}"), texte(" sous la forme a+bi.")];
  return [texte("À partir du quotient confirmé, conclus (une seule tentative).")];
}
export function etatActuelE(e: ExerciceTrianglesE, phase: PhaseTrianglesComplexes): string[] | null {
  if (phase !== "eEcran2") return null;
  return [`q=${pointEntierLatex(e.quotientRe, e.quotientIm)}\\text{ (confirmé)}`];
}
export function champsE(phase: PhaseTrianglesComplexes): ChampDef[] {
  return phase === "eEcran1" ? [{ type: "texte", label: "q =", placeholder: PLACEHOLDER_AFFIXE }] : [];
}
export function choixE(e: ExerciceTrianglesE, phase: PhaseTrianglesComplexes): ChoixDef[] {
  return phase === "eEcran2" ? ordonner(OPTIONS_POSITION_E, ordreEcran(e.ordres, 0)) : [];
}
export function niveauAideMaxE(phase: PhaseTrianglesComplexes): number {
  return phase === "eEcran1" ? 2 : phase === "eEcran2" ? 1 : 0;
}
export function aideNiveau1E(phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Calcule les 2 différences, puis divise en multipliant le numérateur et le dénominateur par le conjugué du dénominateur :", latex: "\\dfrac{u}{v}=\\dfrac{u\\cdot\\overline{v}}{|v|^2}" };
  if (phase === "eEcran2") return { texte: "Si le quotient est réel, les vecteurs AB et AC sont colinéaires ; s'il est imaginaire pur, ils sont orthogonaux :", latex: "q\\in\\mathbb{R}\\qquad q\\in i\\mathbb{R}" };
  return AUCUNE_AIDE;
}
export function aideNiveau2E(e: ExerciceTrianglesE, phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "eEcran1") return AUCUNE_AIDE;
  const num = pointEntierLatex(e.C.re - e.A.re, e.C.im - e.A.im);
  const den = pointEntierLatex(e.B.re - e.A.re, e.B.im - e.A.im);
  return { texte: "Les 2 différences (division non faite) :", latex: `q=\\dfrac{${num}}{${den}}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceTrianglesComplexes): FragmentConsigne[] {
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
  }
}

export function blocDonnees(exercice: ExerciceTrianglesComplexes): string[] {
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
  }
}

export function consigneEcran(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): FragmentConsigne[] {
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
  }
}

export function etatActuel(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(phase);
    case "D":
      return champsD(phase);
    case "E":
      return champsE(phase);
  }
}

export function choixEcran(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): ChoixDef[] {
  switch (exercice.famille) {
    case "A":
      return choixA(exercice, phase);
    case "B":
      return choixB(exercice, phase);
    case "C":
      return choixC(exercice, phase);
    case "D":
      return choixD(exercice, phase);
    case "E":
      return choixE(exercice, phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): number {
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
  }
}

export function aideNiveau1(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(exercice, phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(phase);
    case "E":
      return aideNiveau1E(phase);
  }
}

export function aideNiveau2(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
    case "E":
      return aideNiveau2E(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseTrianglesComplexes, string> = {
  aEcran1: "Étape 1 (longueurs)",
  aEcran2: "Étape 2 (isocèle ?)",
  aEcran3: "Étape 3 (rectangle ?)",
  bEcran1: "Étape 1 (longueurs)",
  bEcran2: "Étape 2 (isocèle ?)",
  bEcran3: "Étape 3 (rectangle ?)",
  bEcran4: "Étape 4 (loi des cosinus)",
  cEcran1: "Étape 1 (OBF équilatéral)",
  cEcran2: "Étape 2 (distances AO, AB, AF)",
  cEcran3: "Étape 3 (conclusion)",
  dEcran1: "Étape 1 (rapport, angle)",
  dEcran2: "Étape 2 (cohérence)",
  dEcran3: "Étape 3 (multiplicateur)",
  eEcran1: "Étape 1 (quotient)",
  eEcran2: "Étape 2 (conclusion)",
};

export const LIBELLE_FAMILLE: Record<ExerciceTrianglesComplexes["famille"], string> = {
  A: "A — Isocèle, rectangle, les deux ou aucun",
  B: "B — Triangle isocèle, loi des cosinus",
  C: "C — Triangle équilatéral : A est-il le centre ?",
  D: "D — Similitude entre deux triangles",
  E: "E — Alignés, perpendiculaires ou ni l'un ni l'autre",
};

/** Arrondi au dixième, virgule décimale. */
function degres(v: number): string {
  return `${(Math.round(v * 10) / 10).toString().replace(".", "{,}")}^{\\circ}`;
}

/** Récapitulatif / fiche : réponse CORRECTE connue de l'exercice, un fragment par donnée. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): string[] {
  switch (exercice.famille) {
    case "A":
      if (phase === "aEcran1") return [`AB=${exercice.AB.latex}`, `AC=${exercice.AC.latex}`, `BC=${exercice.BC.latex}`];
      if (phase === "aEcran2") return [`\\text{${LIBELLE_ISOCELE_ABC[exercice.sommetIsocele]}}`];
      return [`\\text{${LIBELLE_RECTANGLE_ABC[exercice.sommetRectangle]}}`];
    case "B":
      if (phase === "bEcran1") return [`OA=${exercice.OA.latex}`, `OB=${exercice.OB.latex}`, `AB=${exercice.AB.latex}`];
      if (phase === "bEcran2") return [`\\text{${LIBELLE_ISOCELE_OAB[exercice.sommetIsocele]}}`];
      if (phase === "bEcran3") return [`\\text{${LIBELLE_RECTANGLE_OAB[exercice.sommetRectangle]}}`];
      return [`\\widehat{O}\\approx ${degres(exercice.anglesDeg.O)}`, `\\widehat{A}\\approx ${degres(exercice.anglesDeg.A)}`, `\\widehat{B}\\approx ${degres(exercice.anglesDeg.B)}`];
    case "C":
      if (phase === "cEcran1") return [`OB=BF=OF=${exercice.cote}`];
      if (phase === "cEcran2") return [`AO=${exercice.AO.latex}`, `AB=${exercice.AB.latex}`, `AF=${exercice.AF.latex}`];
      return [`\\text{${exercice.equidistant ? "A est équidistant des 3 sommets (centre)" : "A n'est pas équidistant des 3 sommets"}}`];
    case "D":
      if (phase === "dEcran1") return [`k=${exercice.rapport}`, `\\theta=${exercice.angleLatex}`];
      if (phase === "dEcran2") return [`\\text{${exercice.coherent ? "Cohérent" : "Incohérent"}}`];
      return [pointEntierLatex(exercice.multiplicateurRe, exercice.multiplicateurIm)];
    case "E":
      if (phase === "eEcran1") return [`q=${pointEntierLatex(exercice.quotientRe, exercice.quotientIm)}`];
      return [`\\text{${LIBELLE_POSITION_E[exercice.position]}}`];
  }
}
