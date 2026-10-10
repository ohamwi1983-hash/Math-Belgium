/**
 * Présentation — "Norme d'un vecteur et distance entre 2 points" (chapitre "Calcul vectoriel"),
 * nouveau générateur (`promptcreationgenerateur26normedistance.md`), refondu par
 * `promptgen26refontecomplete.md` (variante `comparaison` supprimée ; consigne générale + bloc de
 * données redondants + bloc "état actuel" sur les 5 variantes restantes ; formats de réponse
 * élargis à la fraction/l'irrationnel irréductible sur plusieurs écrans). Formule commune :
 * `‖(a;b)‖=√(a²+b²)`, `AB=‖AB⃗‖=√((xB-xA)²+(yB-yA)²)` — construite en passant d'abord par `AB⃗`
 * (chevauchement volontaire avec le générateur 20, comme "Colinéarité"/"Orthogonalité").
 */
import type { ExerciceDistance, ExerciceIsocele, ExerciceNormeVecteur, ExerciceParametreNorme, ExercicePythagore, VarianteNormeDistance } from "../core/normeDistance.types";
import type { Composantes, Point } from "../core/vecteur.types";
import type { ReponseClassificationIsocele } from "../moteur/verificationNormeDistance";

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** Réservée aux POINTS — notation en ligne `(x ; y)`. Ne jamais l'utiliser pour un vecteur (voir
 * `formatComposantesColonneLatex` ci-dessous) : ce générateur porte précisément sur la distinction
 * norme de vecteur / distance entre points, les deux notations doivent donc rester visuellement
 * distinctes partout où elles apparaissent (correction transversale). */
export function formatComposantesLatex(v: Composantes): string {
  return `(${formatNombre(v.x)} ; ${formatNombre(v.y)})`;
}

/** Réservée aux VECTEURS — notation matricielle colonne (2×1), jamais la même notation en ligne
 * qu'un point (correction transversale). */
export function formatComposantesColonneLatex(v: Composantes): string {
  return `\\begin{pmatrix} ${formatNombre(v.x)} \\\\ ${formatNombre(v.y)} \\end{pmatrix}`;
}

export function formatPointLatex(label: string, p: Point): string {
  return `${label}${formatComposantesLatex(p)}`;
}

export function formatVecteurLatex(nom: string, v: Composantes): string {
  return `\\vec{${nom}}${formatComposantesColonneLatex(v)}`;
}

/** Parenthèse une valeur négative avant de l'élever au carré (`(-3)^2`, jamais `-3^2` qui se lirait
 * `-(3^2)`) — jamais nécessaire pour une valeur positive. */
function formatFacteurCarre(valeur: number): string {
  return valeur < 0 ? `(${formatNombre(valeur)})` : formatNombre(valeur);
}

/** `x-p` avec signe adapté — jamais `x-(-3)`, toujours `x+3`. */
function formatBinome(p: number): string {
  if (p === 0) return "x";
  return p > 0 ? `x-${formatNombre(p)}` : `x+${formatNombre(Math.abs(p))}`;
}

/**
 * Décompose `√carre` en `m√k` irréductible (`k` sans facteur carré), jamais une valeur décimale
 * approchée — pour une longueur potentiellement irrationnelle (variante "pythagore", méthode
 * alternative qui ne garantit pas des côtés entiers, contrairement à "isocèle"). Entier nu si
 * `carre` est un carré parfait, cohérent avec la convention "fraction irréductible" déjà en place
 * ailleurs sur la plateforme (`ui/formatFraction.ts`) mais étendue ici au cas irrationnel.
 */
export function formatLongueurIrreductibleLatex(carre: number): string {
  let m = 1;
  let k = carre;
  for (let d = 2; d * d <= k; d++) {
    while (k % (d * d) === 0) {
      k /= d * d;
      m *= d;
    }
  }
  if (k === 1) return String(m);
  return m === 1 ? `\\sqrt{${k}}` : `${m}\\sqrt{${k}}`;
}

// ============================================================================
// Formules générales — abstraites, jamais substituées (aide de niveau 1)
// ============================================================================

export const FORMULE_GENERALE_NORME_LATEX = "\\|\\vec{v}\\| = \\sqrt{x_{\\vec{v}}^2+y_{\\vec{v}}^2}";
export const FORMULE_GENERALE_DISTANCE_LATEX = "\\|\\vec{AB}\\| = \\sqrt{(x_B-x_A)^2+(y_B-y_A)^2}";

// ============================================================================
// Aide partagée "vecteur AB, à partir de 2 points" — isocèle/pythagore (écran 1) et distance
// (écran 1), même formule générale/substituée pour les 3 variantes (`promptgen26refontecomplete.md`,
// Parties D/E/F : "identique à l'écran 1 de isocèle").
// ============================================================================

export function formatAideVecteurABNiveau1Latex(labelA: string, labelB: string): string {
  const nom = `${labelA}${labelB}`;
  return `x_{\\vec{${nom}}}=x_${labelB}-x_${labelA} \\quad y_{\\vec{${nom}}}=y_${labelB}-y_${labelA}`;
}

export function formatAideVecteurABNiveau2Latex(labelA: string, pointA: Point, labelB: string, pointB: Point): string {
  const nom = `${labelA}${labelB}`;
  return `x_{\\vec{${nom}}}=${formatFacteurCarre(pointB.x)}-${formatFacteurCarre(pointA.x)} \\quad y_{\\vec{${nom}}}=${formatFacteurCarre(pointB.y)}-${formatFacteurCarre(pointA.y)}`;
}

/** Rappel de la formule de la norme adaptée au nom du vecteur `AB` (jamais la formule générique
 * $\vec v$), non substituée — Parties D/E, écran 2 ("aides limitées à $\vec{AB}$"). */
export function formatAideNormeABNiveau1Latex(labelA: string, labelB: string): string {
  const nom = `${labelA}${labelB}`;
  return `\\|\\vec{${nom}}\\| = \\sqrt{x_{\\vec{${nom}}}^2+y_{\\vec{${nom}}}^2}`;
}

export function formatAideNormeABNiveau2Latex(labelA: string, labelB: string, vecteurAB: Composantes): string {
  const nom = `${labelA}${labelB}`;
  return `\\|\\vec{${nom}}\\| = \\sqrt{${formatFacteurCarre(vecteurAB.x)}^2+${formatFacteurCarre(vecteurAB.y)}^2}`;
}

/** Label de champ en notation norme ($\|\vec{AB}\|=$), remplace l'ancien "AB=" — Parties D/E,
 * écran 2. */
export function formatLabelNormeLatex(labelA: string, labelB: string): string {
  return `\\|\\vec{${labelA}${labelB}}\\| =`;
}

// ============================================================================
// Bloc de données redondant — points affichés SANS débordement mobile (`.equation-box-termes`,
// un fragment KaTeX par point plutôt qu'une chaîne unique jointe par `\quad`, même correctif que
// l'expression télescopique de "Réduction d'une somme de vecteurs", générateur 27).
// ============================================================================

export function formatTermesPointsLatex(points: { label: string; point: Point }[]): string[] {
  return points.map(({ label, point }) => formatPointLatex(label, point));
}

export function formatTermesDeuxPointsLatex(labelA: string, pointA: Point, labelB: string, pointB: Point): string[] {
  return formatTermesPointsLatex([
    { label: labelA, point: pointA },
    { label: labelB, point: pointB },
  ]);
}

export function formatTermesTroisPointsLatex(labelA: string, pointA: Point, labelB: string, pointB: Point, labelC: string, pointC: Point): string[] {
  return formatTermesPointsLatex([
    { label: labelA, point: pointA },
    { label: labelB, point: pointB },
    { label: labelC, point: pointC },
  ]);
}

// ============================================================================
// Variante 1 — norme d'un vecteur donné
// ============================================================================

export function formatEnonceVecteurLatex(exercice: ExerciceNormeVecteur): string {
  return formatVecteurLatex(exercice.vNom, exercice.v);
}

/** Consigne générale redondante (`promptgen26refontecomplete.md`, Partie G) — nom du vecteur
 * toujours dérivé de l'instance (`exercice.vNom`, toujours "u" par construction mais jamais
 * supposé en dur). */
export function segmentsConsigneVecteur(exercice: ExerciceNormeVecteur): FragmentConsigne[] {
  return [texte("Calcule la norme du vecteur "), latex(`\\vec{${exercice.vNom}}`)];
}

export function formatLabelNormeVecteurLatex(exercice: ExerciceNormeVecteur): string {
  return `\\|\\vec{${exercice.vNom}}\\| =`;
}

export function formuleSubstitueeNormeLatex(v: Composantes): string {
  return `\\sqrt{${formatFacteurCarre(v.x)}^2+${formatFacteurCarre(v.y)}^2}`;
}

// ============================================================================
// Variante 2 — distance entre 2 points
// ============================================================================

export const CONSIGNE_GENERALE_DISTANCE = "Calcule la distance entre les points A et B.";

export function formatEnonceDistanceLatex(exercice: ExerciceDistance): string {
  return `${formatPointLatex(exercice.labelA, exercice.pointA)} \\quad ${formatPointLatex(exercice.labelB, exercice.pointB)}`;
}

export function formatTermesDonneesDistanceLatex(exercice: ExerciceDistance): string[] {
  return formatTermesDeuxPointsLatex(exercice.labelA, exercice.pointA, exercice.labelB, exercice.pointB);
}

// ============================================================================
// Variante 4 — triangle isocèle/scalène
// ============================================================================

export const CONSIGNE_GENERALE_ISOCELE = "Quelle est la nature du triangle ABC ?";

export function formatEnonceTroisPointsLatex(labelA: string, pointA: Point, labelB: string, pointB: Point, labelC: string, pointC: Point): string {
  return `${formatPointLatex(labelA, pointA)} \\quad ${formatPointLatex(labelB, pointB)} \\quad ${formatPointLatex(labelC, pointC)}`;
}

export function formatEnonceIsoceleLatex(exercice: ExerciceIsocele): string {
  return formatEnonceTroisPointsLatex(exercice.labelA, exercice.pointA, exercice.labelB, exercice.pointB, exercice.labelC, exercice.pointC);
}

export function formatTermesDonneesIsoceleLatex(exercice: ExerciceIsocele): string[] {
  return formatTermesTroisPointsLatex(exercice.labelA, exercice.pointA, exercice.labelB, exercice.pointB, exercice.labelC, exercice.pointC);
}

/** Bloc "état actuel" de l'écran 2 (`calculIsocele`) — les 3 vecteurs confirmés à l'écran 1, un par
 * ligne (`\begin{gathered}`, jamais `\quad` — débordement mobile garanti pour 3 vecteurs en
 * colonne, même convention que "Distance point-droite et droite-droite"). */
export function formatEtatActuelVecteursTriangleLatex(labelA: string, labelB: string, labelC: string, vecteurAB: Composantes, vecteurAC: Composantes, vecteurBC: Composantes): string {
  return `\\begin{gathered} ${formatVecteurLatex(`${labelA}${labelB}`, vecteurAB)} \\\\ ${formatVecteurLatex(`${labelA}${labelC}`, vecteurAC)} \\\\ ${formatVecteurLatex(`${labelB}${labelC}`, vecteurBC)} \\end{gathered}`;
}

/** Bloc "état actuel" de l'écran 3 (`conclusionIsocele`) — les 3 normes confirmées à l'écran 2, en
 * fraction irréductible (toujours entières pour cette variante, voir `core/normeDistance.types.ts`,
 * mais réutilise `formatFractionIrreductible`-like : `formatNombre` suffit, jamais de décimal). */
export function formatEtatActuelLongueursIsoceleLatex(exercice: ExerciceIsocele): string {
  return `\\begin{gathered} \\|\\vec{${exercice.labelA}${exercice.labelB}}\\| = ${formatNombre(exercice.longueurAB)} \\\\ \\|\\vec{${exercice.labelA}${exercice.labelC}}\\| = ${formatNombre(exercice.longueurAC)} \\\\ \\|\\vec{${exercice.labelB}${exercice.labelC}}\\| = ${formatNombre(exercice.longueurBC)} \\end{gathered}`;
}

/** Choix de nature (écran 3) — remplace l'ancien choix à 5 valeurs (dont "Équilatéral", piège
 * volontairement abandonné, `promptgen26refontecomplete.md` Partie D). Une fois "Isocèle" choisi,
 * un second choix (sommet A/B/C) précise la classification finale. */
export type NatureTriangle = "isocele" | "scalene";

export const OPTIONS_NATURE_TRIANGLE: { valeur: NatureTriangle; libelle: string }[] = [
  { valeur: "isocele", libelle: "Isocèle" },
  { valeur: "scalene", libelle: "Scalène" },
];

export const SOMMETS_ISOCELE: ("A" | "B" | "C")[] = ["A", "B", "C"];

/** Compose (nature, sommet) → la classification finale attendue par `verifierConclusionIsocele` —
 * `sommet` est ignoré (peut être `null`) pour la nature "scalene". */
export function composerClassificationIsocele(nature: NatureTriangle, sommet: "A" | "B" | "C" | null): ReponseClassificationIsocele | null {
  if (nature === "scalene") return "scalene";
  if (sommet === null) return null;
  return sommet === "A" ? "isoceleA" : sommet === "B" ? "isoceleB" : "isoceleC";
}

export const TEXTE_AIDE_ISOCELE_SCALENE =
  "Un triangle isocèle a (au moins) 2 côtés de même longueur. Un triangle scalène a ses 3 côtés de longueurs deux à deux différentes.";

// ============================================================================
// Variante 5 — déterminer x pour une norme cible
// ============================================================================

/** Consigne générale redondante (Partie C, écrans 1 ET 2) — dynamique, dépend de la cible réelle
 * de l'instance. */
export function segmentsConsigneParametre(exercice: ExerciceParametreNorme): FragmentConsigne[] {
  return [
    texte("Quelle valeur doit avoir x pour que le vecteur "),
    latex("\\vec{v}"),
    texte(` soit de longueur ${formatNombre(exercice.cible)} ?`),
  ];
}

export function formatEnonceParametreLatex(exercice: ExerciceParametreNorme): string {
  return formatTermesEnonceParametreLatex(exercice).join(" \\quad ");
}

/** Version "bloc fitter" de `formatEnonceParametreLatex` (`promptblocfittertousgenerateurs.md`) —
 * le vecteur (pmatrix) et la norme cible en 2 fragments distincts, plutôt qu'une seule chaîne
 * `\quad`-jointe. */
export function formatTermesEnonceParametreLatex(exercice: ExerciceParametreNorme): string[] {
  return [
    `\\vec{v}\\begin{pmatrix} ${formatBinome(exercice.p)} \\\\ ${formatNombre(exercice.q)} \\end{pmatrix}`,
    `\\|\\vec{v}\\| = ${formatNombre(exercice.cible)}`,
  ];
}

/** Aide 1 de l'écran "réduction" — formule de la norme non substituée, notation $x_{\vec v}$/
 * $y_{\vec v}$ (Partie C, remplace l'ancienne formule `(x-p)^2+q^2=cible^2`). */
export const FORMULE_GENERALE_NORME_PARAMETRE_LATEX = "\\|\\vec{v}\\| = \\sqrt{x_{\\vec{v}}^2+y_{\\vec{v}}^2}";

/** Aide 2 — substituée avec les valeurs réelles de l'instance, non résolue. */
export function formatAideNormeSubstitueeParametreLatex(exercice: ExerciceParametreNorme): string {
  // Parenthèses autour du binôme UNIQUEMENT quand p≠0 (expression composée "x-p"/"x+p") — jamais
  // autour d'un "x" seul, qui donnerait "(x)²" superflu (audit transversal,
  // `promptauditparenthesessuperflues.md`).
  const binome = formatBinome(exercice.p);
  const binomeCarre = exercice.p === 0 ? `${binome}^2` : `(${binome})^2`;
  return `\\|\\vec{v}\\| = \\sqrt{${binomeCarre}+(${formatNombre(exercice.q)})^2} = ${formatNombre(exercice.cible)}`;
}

export function formatEquationReduiteParametreNormeLatex(exercice: ExerciceParametreNorme): string {
  const { a, b, c } = exercice;
  const partieX2 = a === 1 ? "x^2" : a === -1 ? "-x^2" : `${formatNombre(a)}x^2`;
  const partieX = b === 0 ? "" : `${b > 0 ? "+" : "-"}${Math.abs(b) === 1 ? "" : formatNombre(Math.abs(b))}x`;
  const partieConst = c === 0 ? "" : `${c > 0 ? "+" : "-"}${formatNombre(Math.abs(c))}`;
  return `${partieX2}${partieX}${partieConst} = 0`;
}

export function formatDiscriminantLatex(exercice: ExerciceParametreNorme): string {
  return `\\Delta = ${formatNombre(exercice.discriminant)}`;
}

export function formatSolutionsAttenduesTexte(exercice: ExerciceParametreNorme): string {
  if (exercice.solutions.length === 0) return "aucune solution réelle";
  return exercice.solutions.map((x) => `x = ${formatNombre(x)}`).join(" ou ");
}

export const PLACEHOLDER_EQUATION_PARAMETRE = "ex : x^2-4x-12=0";

// ============================================================================
// Variante 6 — Pythagore, méthode alternative
// ============================================================================

export const CONSIGNE_GENERALE_PYTHAGORE = "Le triangle ABC est-il rectangle ?";

export function libelleRectangleEn(sommet: "A" | "B" | "C", exercice: { labelA: string; labelB: string; labelC: string }): string {
  const label = sommet === "A" ? exercice.labelA : sommet === "B" ? exercice.labelB : exercice.labelC;
  return `Rectangle en ${label}`;
}

export function formatEnoncePythagoreLatex(exercice: ExercicePythagore): string {
  return formatEnonceTroisPointsLatex(exercice.labelA, exercice.pointA, exercice.labelB, exercice.pointB, exercice.labelC, exercice.pointC);
}

export function formatTermesDonneesPythagoreLatex(exercice: ExercicePythagore): string[] {
  return formatTermesTroisPointsLatex(exercice.labelA, exercice.pointA, exercice.labelB, exercice.pointB, exercice.labelC, exercice.pointC);
}

/** État actuel de l'écran "calcul" — mêmes 3 vecteurs, même présentation qu'isocèle. */
export function formatEtatActuelVecteursPythagoreLatex(exercice: ExercicePythagore): string {
  return formatEtatActuelVecteursTriangleLatex(exercice.labelA, exercice.labelB, exercice.labelC, exercice.vecteurAB, exercice.vecteurAC, exercice.vecteurBC);
}

/** État actuel de l'écran "test" — les 3 normes confirmées à l'écran "calcul", en irrationnel
 * irréductible (contrairement à isocèle, jamais garanties entières ici). */
export function formatEtatActuelLongueursPythagoreLatex(exercice: ExercicePythagore): string {
  const nom = (a: string, b: string) => `${a}${b}`;
  return `\\begin{gathered} \\|\\vec{${nom(exercice.labelA, exercice.labelB)}}\\| = ${formatLongueurIrreductibleLatex(exercice.carreAB)} \\\\ \\|\\vec{${nom(exercice.labelA, exercice.labelC)}}\\| = ${formatLongueurIrreductibleLatex(exercice.carreAC)} \\\\ \\|\\vec{${nom(exercice.labelB, exercice.labelC)}}\\| = ${formatLongueurIrreductibleLatex(exercice.carreBC)} \\end{gathered}`;
}

export const TEXTE_AIDE_TEST_PYTHAGORE_NIVEAU1 =
  "Dans un triangle rectangle, le carré du côté opposé à l'angle droit (l'hypoténuse) est égal à la somme des carrés des deux autres côtés.";

/** Les 3 relations possibles (une par sommet testé), non substituées — aide niveau 1. */
export function formatRelationsPythagoreNiveau1Latex(exercice: ExercicePythagore): string {
  const { labelA: a, labelB: b, labelC: c } = exercice;
  return `\\begin{gathered} \\text{Rectangle en ${a}} \\iff \\|\\vec{${b}${c}}\\|^2=\\|\\vec{${a}${b}}\\|^2+\\|\\vec{${a}${c}}\\|^2 \\\\ \\text{Rectangle en ${b}} \\iff \\|\\vec{${a}${c}}\\|^2=\\|\\vec{${a}${b}}\\|^2+\\|\\vec{${b}${c}}\\|^2 \\\\ \\text{Rectangle en ${c}} \\iff \\|\\vec{${a}${b}}\\|^2=\\|\\vec{${a}${c}}\\|^2+\\|\\vec{${b}${c}}\\|^2 \\end{gathered}`;
}

/** Mêmes 3 relations, substituées avec les longueurs AU CARRÉ (toujours entières, jamais besoin
 * d'irrationnel ici) — signe "=" remplacé par "?" : l'élève doit lui-même vérifier laquelle tient. */
export function formatRelationsPythagoreNiveau2Latex(exercice: ExercicePythagore): string {
  const { labelA: a, labelB: b, labelC: c, carreAB, carreAC, carreBC } = exercice;
  return `\\begin{gathered} \\text{Rectangle en ${a}} : ${carreBC} \\ ? \\ ${carreAB}+${carreAC} \\\\ \\text{Rectangle en ${b}} : ${carreAC} \\ ? \\ ${carreAB}+${carreBC} \\\\ \\text{Rectangle en ${c}} : ${carreAB} \\ ? \\ ${carreAC}+${carreBC} \\end{gathered}`;
}

// ============================================================================
// Libellés — variante, aide progressive
// ============================================================================

const LIBELLES_VARIANTE: Record<VarianteNormeDistance, string> = {
  vecteur: "Norme d'un vecteur donné",
  distance: "Distance entre deux points",
  isocele: "Triangle isocèle/scalène",
  parametre: "Déterminer x pour une norme cible",
  pythagore: "Pythagore, méthode alternative",
};

export function libelleVarianteNormeDistance(variante: VarianteNormeDistance): string {
  return LIBELLES_VARIANTE[variante];
}

export const TEXTE_AIDE_METHODE_RESOLUTION_QUADRATIQUE =
  "Calcule le discriminant Δ = b²-4ac. Si Δ>0, deux solutions x=(-b±√Δ)/(2a). Si Δ=0, une solution x=-b/(2a). Si Δ<0, aucune solution réelle.";

export const PLACEHOLDER_NORME = "ex : 5";
export const PLACEHOLDER_COMPOSANTE = "ex : 3";
export const PLACEHOLDER_LONGUEUR = "ex : 13";
export const PLACEHOLDER_SOLUTION_X = "ex : -1";

/** Libellé du bouton Aide progressive — même petite fonction pure dupliquée qu'ailleurs dans le
 * projet (ex. `colinearite/formatColinearite.ts`, `orthogonalite/formatOrthogonalite.ts`), jamais
 * un couplage entre générateurs pour un si petit utilitaire. */