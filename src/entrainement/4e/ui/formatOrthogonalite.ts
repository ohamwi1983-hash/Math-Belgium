/**
 * Présentation — "Orthogonalité et théorème de Pythagore généralisé" (chapitre "Calcul
 * vectoriel"), réécriture complète (`promptcreationgenerateur25orthogonalitepythagore.md`).
 * **Ne jamais utiliser le terme "produit scalaire"** — toujours "critère d'orthogonalité
 * (a·c+b·d)". **Piège transversal** : les aides de rappel de formule présentent UNIQUEMENT le
 * critère d'orthogonalité, sans jamais mentionner ni comparer au critère de colinéarité
 * (générateur 24) — le nommer risquerait de renforcer la confusion plutôt que de la prévenir.
 */
import type {
  ComposantesLin,
  ExerciceOrthogonalite,
  ExerciceOrthogonaliteParametre,
  ExerciceOrthogonaliteTest,
  ExerciceOrthogonaliteTriangle,
  ExerciceOrthogonaliteTriangleParametre,
  LinExpr,
  Reduction,
  Sommet,
  VarianteOrthogonalite,
} from "../core/orthogonalite.types";
import type { Composantes } from "../core/vecteur.types";

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

export function formatComposantesLatex(v: Composantes): string {
  return `(${formatNombre(v.x)} ; ${formatNombre(v.y)})`;
}

/** `coefX·x + constante` — coefficient 1/-1 jamais explicite, terme constant omis s'il est nul,
 * `coefX=0` retombe sur un simple nombre (même principe que `colinearite/formatColinearite.ts`,
 * dupliqué ici — contrats indépendants entre générateurs du chapitre). */
export function formatLinExpr(expr: LinExpr): string {
  const { coefX, constante } = expr;
  if (coefX === 0) return formatNombre(constante);
  const coefTexte = coefX === 1 ? "" : coefX === -1 ? "-" : formatNombre(coefX);
  const terme = `${coefTexte}x`;
  if (constante === 0) return terme;
  const signe = constante > 0 ? "+" : "-";
  return `${terme}${signe}${formatNombre(Math.abs(constante))}`;
}

export function formatComposantesLinLatex(v: ComposantesLin): string {
  return `(${formatLinExpr(v.x)} ; ${formatLinExpr(v.y)})`;
}

/** Parenthèse un facteur composé (dépend de `x`) ou négatif — jamais une simple constante
 * positive. */
function formatFacteurLin(expr: LinExpr): string {
  const rendu = formatLinExpr(expr);
  return expr.coefX !== 0 || expr.constante < 0 ? `(${rendu})` : rendu;
}

function formatFacteurNum(valeur: number): string {
  return valeur < 0 ? `(${formatNombre(valeur)})` : formatNombre(valeur);
}

// ============================================================================
// Énoncé — dispatch par variante
// ============================================================================

/** Un vecteur (v1/v2) est TOUJOURS en notation matricielle colonne (`formatComposantesMatriceLatex`),
 * jamais la même notation en ligne qu'un point (correction transversale — cette fonction colonne
 * était jusqu'ici réservée aux vecteurs AB/AC/BC construits, jamais utilisée ici pour les vecteurs
 * v1/v2 donnés directement). */
export function formatEnonceLatex(exercice: ExerciceOrthogonalite): string {
  if (exercice.variante === "test") {
    return `\\vec{${exercice.v1Nom}}${formatComposantesMatriceLatex(exercice.v1)} \\quad \\vec{${exercice.v2Nom}}${formatComposantesMatriceLatex(exercice.v2)}`;
  }
  if (exercice.variante === "parametre") {
    return `\\vec{${exercice.v1Nom}}${formatComposantesMatriceLatex(exercice.v1)} \\quad \\vec{${exercice.v2Nom}}\\begin{pmatrix} x \\\\ ${formatNombre(exercice.v2Connu)} \\end{pmatrix}`;
  }
  if (exercice.variante === "triangle") {
    return `${exercice.labelA}${formatComposantesLatex(exercice.pointA)} \\quad ${exercice.labelB}${formatComposantesLatex(exercice.pointB)} \\quad ${exercice.labelC}${formatComposantesLatex(exercice.pointC)}`;
  }
  return `${exercice.labelA}${formatComposantesLinLatex(exercice.pointA)} \\quad ${exercice.labelB}${formatComposantesLinLatex(exercice.pointB)} \\quad ${exercice.labelC}${formatComposantesLinLatex(exercice.pointC)}`;
}

/**
 * "Bloc fitter" (`promptgen25modificationscompletes.md`) — bloc de données redondant des variantes
 * "triangle"/"triangleParametre" (A/B/C, jusqu'à 5 écrans chacune) rendu comme un TABLEAU d'un
 * fragment KaTeX par point plutôt qu'une unique chaîne jointe par `\quad` — même correctif que
 * l'expression télescopique du générateur 27/le bloc de données du générateur 26
 * (`.equation-box-termes`, flex-wrap) : un point complet ne se coupe jamais en 2 lignes, seul le
 * retour à la ligne ENTRE points est autorisé. `formatEnonceLatex` reste inchangée (toujours
 * consommée telle quelle par la variante "test"/"parametre", jamais concernées par ce correctif —
 * seulement 2 vecteurs, pas de débordement observé).
 */
export function formatTermesEnonceTriangleLatex(exercice: ExerciceOrthogonaliteTriangle): string[] {
  return [
    `${exercice.labelA}${formatComposantesLatex(exercice.pointA)}`,
    `${exercice.labelB}${formatComposantesLatex(exercice.pointB)}`,
    `${exercice.labelC}${formatComposantesLatex(exercice.pointC)}`,
  ];
}

export function formatTermesEnonceTriangleParametreLatex(exercice: ExerciceOrthogonaliteTriangleParametre): string[] {
  return [
    `${exercice.labelA}${formatComposantesLinLatex(exercice.pointA)}`,
    `${exercice.labelB}${formatComposantesLinLatex(exercice.pointB)}`,
    `${exercice.labelC}${formatComposantesLinLatex(exercice.pointC)}`,
  ];
}

// ============================================================================
// Formule générale du critère d'orthogonalité — jamais "produit scalaire"
// ============================================================================

/** Quelle paire de vecteurs (et quel signe sur chacun) le test du sommet donné compare —
 * `AB⃗,AC⃗` pour A (aucun signe), `-AB⃗,BC⃗` pour B, `-AC⃗,-BC⃗` pour C — réutilisé à la fois pour la
 * formule générale en lettres et pour la formule substituée. */
const PAIRE_SOMMET: Record<Sommet, { label1: "AB" | "AC"; neg1: boolean; label2: "AC" | "BC"; neg2: boolean }> = {
  A: { label1: "AB", neg1: false, label2: "AC", neg2: false },
  B: { label1: "AB", neg1: true, label2: "BC", neg2: false },
  C: { label1: "AC", neg1: true, label2: "BC", neg2: true },
};

export function formuleSubstitueeLatex(v1: Composantes, v2: Composantes): string {
  return `${formatFacteurNum(v1.x)}\\cdot ${formatFacteurNum(v2.x)} + ${formatFacteurNum(v1.y)}\\cdot ${formatFacteurNum(v2.y)}`;
}

export function formuleSubstitueeTestLatex(exercice: ExerciceOrthogonaliteTest): string {
  return formuleSubstitueeLatex(exercice.v1, exercice.v2);
}

export function formuleSubstitueeParametreLatex(exercice: ExerciceOrthogonaliteParametre): string {
  return `${formatFacteurNum(exercice.v1.x)}\\cdot x + ${formatFacteurNum(exercice.v1.y)}\\cdot ${formatFacteurNum(exercice.v2Connu)}`;
}

function vecteurNumSommet(exercice: ExerciceOrthogonaliteTriangle, cote: "AB" | "AC" | "BC"): Composantes {
  return cote === "AB" ? exercice.vecteurAB : cote === "AC" ? exercice.vecteurAC : exercice.vecteurBC;
}

/** Formule substituée avec les valeurs numériques réelles du triangle, JAMAIS calculée — signe
 * appliqué directement sur les composantes (jamais un facteur `-1` littéral). */
export function formuleSubstitueeSommetTriangleLatex(exercice: ExerciceOrthogonaliteTriangle, sommet: Sommet): string {
  const p = PAIRE_SOMMET[sommet];
  const v1 = vecteurNumSommet(exercice, p.label1);
  const v2 = vecteurNumSommet(exercice, p.label2);
  const s1 = p.neg1 ? { x: -v1.x, y: -v1.y } : v1;
  const s2 = p.neg2 ? { x: -v2.x, y: -v2.y } : v2;
  return formuleSubstitueeLatex(s1, s2);
}

function vecteurLinSommet(exercice: ExerciceOrthogonaliteTriangleParametre, cote: "AB" | "AC" | "BC"): ComposantesLin {
  return cote === "AB" ? exercice.vecteurAB : cote === "AC" ? exercice.vecteurAC : exercice.vecteurBC;
}

function negLinExpr(e: LinExpr): LinExpr {
  return { coefX: -e.coefX, constante: -e.constante };
}

/** Même principe que `formuleSubstitueeSommetTriangleLatex`, pour les composantes symboliques
 * (`ComposantesLin`) de la variante 4 — toujours non développée. */
export function formuleSubstitueeSommetTriangleParametreLatex(exercice: ExerciceOrthogonaliteTriangleParametre, sommet: Sommet): string {
  const p = PAIRE_SOMMET[sommet];
  const v1 = vecteurLinSommet(exercice, p.label1);
  const v2 = vecteurLinSommet(exercice, p.label2);
  const s1 = p.neg1 ? { x: negLinExpr(v1.x), y: negLinExpr(v1.y) } : v1;
  const s2 = p.neg2 ? { x: negLinExpr(v2.x), y: negLinExpr(v2.y) } : v2;
  return `${formatFacteurLin(s1.x)}\\cdot ${formatFacteurLin(s2.x)} + ${formatFacteurLin(s1.y)}\\cdot ${formatFacteurLin(s2.y)}`;
}

// ============================================================================
// Réduction (variante "parametre" et écrans 2-4 de "triangleParametre")
// ============================================================================

/** Équation réduite `αx + β = 0` — rappel persistant, écran "résolution" de la variante 2. */
export function formatEquationReduiteParametreLatex(exercice: ExerciceOrthogonaliteParametre): string {
  return `${formatLinExpr({ coefX: exercice.coefX, constante: exercice.coefConst })} = 0`;
}

/** Rend une `Reduction` (linéaire OU quadratique) sous forme `... = 0` — jamais développée
 * différemment, réutilisée pour la révélation et le récapitulatif de l'écran "identification et
 * résolution" (variante 4). */
export function formatReductionLatex(reduction: Reduction): string {
  if (reduction.degre === 1) {
    return `${formatLinExpr({ coefX: reduction.coefX, constante: reduction.coefConst })} = 0`;
  }
  const coefX2 = reduction.coefX2 === 1 ? "x^2" : reduction.coefX2 === -1 ? "-x^2" : `${formatNombre(reduction.coefX2)}x^2`;
  const partieX = reduction.coefX === 0 ? "" : `${reduction.coefX > 0 ? "+" : "-"}${reduction.coefX === 1 || reduction.coefX === -1 ? "" : formatNombre(Math.abs(reduction.coefX))}x`;
  const partieConst = reduction.coefConst === 0 ? "" : `${reduction.coefConst > 0 ? "+" : "-"}${formatNombre(Math.abs(reduction.coefConst))}`;
  return `${coefX2}${partieX}${partieConst} = 0`;
}

// ============================================================================
// Libellés catégoriels
// ============================================================================

/** `promptcorrectionsgenerateur25lot4.md`, section 1 — toutes les conclusions binaires (oui/non)
 * de ce générateur partagent désormais les mêmes libellés de bouton, quelle que soit la question
 * posée (jamais "Orthogonaux"/"Non orthogonaux" distincts — la question elle-même nomme déjà
 * explicitement les objets concernés). Même convention que `colinearite/formatColinearite.ts::LIBELLES_OUI_NON`. */
export const LIBELLES_OUI_NON = { positif: "Oui", negatif: "Non" };

/** Question d'orthogonalité de deux vecteurs (variante "test"), composée en 3 fragments (prose +
 * Katex courts) — jamais un unique bloc de texte embarquant du LaTeX littéral. Remplace l'ancienne
 * question générique "Que peux-tu conclure ?". */
export const QUESTION_ORTHOGONALITE_VECTEURS_AVANT = "Les vecteurs";
export const QUESTION_ORTHOGONALITE_VECTEURS_ENTRE = "et";
export const QUESTION_ORTHOGONALITE_VECTEURS_APRES = "sont-ils orthogonaux ?";

/** Question 1 de la conclusion en 2 questions liées (variantes "triangle"/"triangleParametre",
 * section 2). */
export const QUESTION_TRIANGLE_RECTANGLE = "Ce triangle est-il rectangle ?";
/** Question 2, affichée uniquement si la question 1 répond "Oui". */
export const QUESTION_SOMMET_RECTANGLE = "Il est rectangle en :";

export function libelleRectangleEn(sommet: Sommet, exercice: { labelA: string; labelB: string; labelC: string }): string {
  const label = sommet === "A" ? exercice.labelA : sommet === "B" ? exercice.labelB : exercice.labelC;
  return `Rectangle en ${label}`;
}

// ============================================================================
// `promptcorrectionsgenerateur25complet.md` — consigne globale (V3 "triangle"/V4
// "triangleParametre" uniquement, jamais V1/V2), persistante sur tous les écrans de l'exercice.
// ============================================================================

/** "test" (V1) a rejoint "triangle"/"triangleParametre" — `promptcorrectionsgenerateur25lot2.md`,
 * point 6 : la consigne globale manquait sur l'écran "test" de la variante 1, même bug que le
 * générateur 24. "parametre" (V2) a de même rejoint les 3 autres —
 * `promptcorrectionsgenerateur25lot3.md`, point 1 : cette variante n'avait encore reçu aucune des
 * corrections déjà appliquées à "triangleParametre" (V4). */
export function consigneGlobaleOrthogonalite(exercice: ExerciceOrthogonalite): string | null {
  if (exercice.variante === "test") return "Vérifie si ces deux vecteurs sont orthogonaux.";
  if (exercice.variante === "parametre") return "Que doit valoir x pour que ces 2 vecteurs soient orthogonaux ?";
  if (exercice.variante === "triangle") return "Vérifie si le triangle ABC est rectangle.";
  return "Le triangle ABC est-il rectangle ? Si oui, en quel sommet ?";
}

// ============================================================================
// Notation matricielle (2×1) — "État actuel", même convention que le générateur 21
// (`formatCombinaisonVecteurs.ts::formatVecteurColonneLatex`) — dupliquée ici (module frère de
// `colinearite/formatColinearite.ts`, contrats indépendants entre générateurs du chapitre).
// ============================================================================

export function formatComposantesMatriceLatex(v: Composantes): string {
  return `\\begin{pmatrix} ${formatNombre(v.x)} \\\\ ${formatNombre(v.y)} \\end{pmatrix}`;
}

export function formatComposantesLinMatriceLatex(v: ComposantesLin): string {
  return `\\begin{pmatrix} ${formatLinExpr(v.x)} \\\\ ${formatLinExpr(v.y)} \\end{pmatrix}`;
}

/** Bloc "État actuel" de l'écran "test du sommet [X]" (V3 "triangle" uniquement, point 13) — les
 * vecteurs concernés par CE test précis (avec le bon signe selon le sommet), en notation
 * matricielle — même paire/signe que `formuleSubstitueeSommetTriangleLatex`, jamais recalculée
 * différemment. "Bloc fitter" (`promptgen25modificationscompletes.md`) : les 2 vecteurs sont
 * empilés verticalement via `\begin{gathered}`, jamais `\qquad` (côte à côte), qui débordait sur
 * mobile dès qu'un vecteur avait une composante à 2 chiffres — même principe que le bloc "état
 * actuel" à plusieurs lignes du générateur 26. */
export function etatActuelTestSommet(exercice: ExerciceOrthogonaliteTriangle, sommet: Sommet): string {
  const p = PAIRE_SOMMET[sommet];
  const v1 = vecteurNumSommet(exercice, p.label1);
  const v2 = vecteurNumSommet(exercice, p.label2);
  const s1 = p.neg1 ? { x: -v1.x, y: -v1.y } : v1;
  const s2 = p.neg2 ? { x: -v2.x, y: -v2.y } : v2;
  const nom1 = p.neg1 ? `-\\vec{${p.label1}}` : `\\vec{${p.label1}}`;
  const nom2 = p.neg2 ? `-\\vec{${p.label2}}` : `\\vec{${p.label2}}`;
  return `\\begin{gathered} ${nom1} = ${formatComposantesMatriceLatex(s1)} \\\\ ${nom2} = ${formatComposantesMatriceLatex(s2)} \\end{gathered}`;
}

/** Bloc "État actuel" de l'écran "réduction du sommet [X]" (V4 "triangleParametre" uniquement,
 * point 5) — même principe que `etatActuelTestSommet`, pour des composantes potentiellement en x,
 * même correctif "bloc fitter" (`\begin{gathered}`, jamais `\qquad`) — le cas le plus à risque de
 * débordement du générateur (composantes symboliques du type "(3x-15;x-6)"). */
export function etatActuelReductionSommet(exercice: ExerciceOrthogonaliteTriangleParametre, sommet: Sommet): string {
  const p = PAIRE_SOMMET[sommet];
  const v1 = vecteurLinSommet(exercice, p.label1);
  const v2 = vecteurLinSommet(exercice, p.label2);
  const s1 = p.neg1 ? { x: negLinExpr(v1.x), y: negLinExpr(v1.y) } : v1;
  const s2 = p.neg2 ? { x: negLinExpr(v2.x), y: negLinExpr(v2.y) } : v2;
  const nom1 = p.neg1 ? `-\\vec{${p.label1}}` : `\\vec{${p.label1}}`;
  const nom2 = p.neg2 ? `-\\vec{${p.label2}}` : `\\vec{${p.label2}}`;
  return `\\begin{gathered} ${nom1} = ${formatComposantesLinMatriceLatex(s1)} \\\\ ${nom2} = ${formatComposantesLinMatriceLatex(s2)} \\end{gathered}`;
}

/** Bloc "État actuel" NOUVEAU de l'écran "conclusion" (V3 "triangle" uniquement,
 * `promptgen25modificationscompletes.md`) — les 3 critères d'orthogonalité déjà validés aux écrans
 * "test du sommet A/B/C" précédents (`exercice.critereA/B/C`, jamais recalculés depuis une saisie
 * brute — même principe que le reste du projet), un par ligne (`\begin{gathered}`, "bloc fitter").
 * Le bloc violet déjà présent sur cet écran (`formatEnonceLatex`) reste le bloc de DONNÉES (les
 * coordonnées A/B/C) — ce nouveau bloc est bien distinct, jamais une seconde apparition du même
 * contenu. */
export function etatActuelConclusionTriangle(exercice: ExerciceOrthogonaliteTriangle): string {
  const lignes: [string, number][] = [
    [exercice.labelA, exercice.critereA],
    [exercice.labelB, exercice.critereB],
    [exercice.labelC, exercice.critereC],
  ];
  return `\\begin{gathered} ${lignes.map(([label, valeur]) => `\\text{Critère en ${label}} = ${formatNombre(valeur)}`).join(" \\\\ ")} \\end{gathered}`;
}

/** `promptcorrectionsgenerateur25complet.md`, points 2/12 — aide simplifiée (formule seule, sans
 * texte explicatif) des écrans "construction" (V3 ET V4) : formule de différence de coordonnées,
 * jamais le prose historique (`TEXTE_AIDE_CONSTRUCTION_POINTS`/`_AVEC_X`, retirées) — même principe
 * que `colinearite/formatColinearite.ts::formatFormuleComposantesLatex`.
 *
 * `promptcorrectionsgenerateur25lot2.md`, point 2 — **limitée au seul $\vec{AB}$**, comme le
 * générateur 24 : montrer aussi les formules de $\vec{AC}$/$\vec{BC}$ laissait l'élève les recopier
 * sans avoir à en déduire seul la même logique. */
export function formatFormuleComposantesLatex(labelA: string, labelB: string): string {
  return `x_{${labelA}${labelB}}=x_{${labelB}}-x_{${labelA}}, \\quad y_{${labelA}${labelB}}=y_{${labelB}}-y_{${labelA}}`;
}

/** `promptcorrectionsgenerateur25complet.md`, points 7/14 — rappel VECTORIEL générique (V3
 * "testSommetA/B/C" ET V4 "reductionSommetA/B/C") — remplace la version en composantes "(a;b) et
 * (c;d)" par une version en vecteurs u/v nommés génériquement, JAMAIS liée aux vrais noms AB/AC/BC
 * de l'exercice. Depuis `promptcorrectionsgenerateur25lot3.md`, ce même rappel générique u/v (et
 * son fragment "vaut 0." séparé, `RAPPEL_VECTORIEL_ORTHOGONALITE_FIN`) est désormais réutilisé sans
 * exception par les 4 variantes — `test` (V1) et `parametre` (V2) l'ont rejoint, plus aucune formule
 * en composantes "(a;b)/(c;d)" nulle part dans ce générateur. Composé en 3 fragments courts (prose
 * HTML + Katex courts), jamais un bloc `\text{...}` monolithique — même précaution que
 * `colinearite/formatColinearite.ts`. */
export const RAPPEL_VECTORIEL_ORTHOGONALITE_AVANT = "Rappel : deux vecteurs";
export const RAPPEL_VECTORIEL_ORTHOGONALITE_ENTRE = "et";
export const RAPPEL_VECTORIEL_ORTHOGONALITE_APRES = "sont orthogonaux si, et seulement si,";
export const LATEX_VEC_U = "\\vec{u}";
export const LATEX_VEC_V = "\\vec{v}";
/** `promptcorrectionsgenerateur25lot3.md`, point 1 (transposition du lot3 du générateur 24) —
 * jamais une égalité entre membre gauche et membre droit séparés : la formule elle-même ne contient
 * plus le "= 0" (retiré), rendue en 2 fragments distincts — la formule puis le texte "vaut 0."
 * séparé — chaque composant consommateur affiche les deux à la suite. */
export const LATEX_FORMULE_ORTHOGONALITE_VECTORIELLE = "x_{\\vec u}\\cdot x_{\\vec v} + y_{\\vec u}\\cdot y_{\\vec v}";
export const RAPPEL_VECTORIEL_ORTHOGONALITE_FIN = "vaut 0.";

/** Consigne de l'écran "réduction" de la variante 2 — même principe que
 * `colinearite/formatColinearite.ts::CONSIGNE_REDUCTION_AVEC_X` (`promptcorrectionsgenerateur25lot3.md`,
 * point 1). */
export const CONSIGNE_REDUCTION_PARAMETRE_ORTHOGONALITE = "Donne la relation d'orthogonalité entre ces vecteurs.";

const LIBELLES_VARIANTE: Record<VarianteOrthogonalite, string> = {
  test: "Tester l'orthogonalité de deux vecteurs",
  parametre: "Déterminer x pour l'orthogonalité",
  triangle: "Triangle rectangle via ses vecteurs",
  triangleParametre: "Triangle rectangle avec x",
};

export function libelleVarianteOrthogonalite(variante: VarianteOrthogonalite): string {
  return LIBELLES_VARIANTE[variante];
}

// ============================================================================
// Textes d'aide — jamais "produit scalaire", jamais de comparaison au critère de colinéarité
// ============================================================================

/**
 * Piège transversal (générateur 24 réactivé délibérément) — rappel EXPLICITE que `BA⃗=-AB⃗`, sans
 * jamais évoquer le critère de colinéarité par ailleurs.
 *
 * `promptcorrectionsgenerateur25lot3.md`, point 2 — **bug de rendu corrigé** : ces deux phrases
 * embarquaient auparavant des commandes LaTeX (`\vec{BA}=-\vec{AB}`) directement dans une chaîne de
 * texte brut, affichée telle quelle via `<p>{piege}</p>` (`EtapeTestSommetOrthogonalite.tsx`/
 * `EtapeReductionSommetOrthogonalite.tsx`) — les commandes s'affichaient donc littéralement, jamais
 * rendues. Chaque phrase est désormais découpée en fragments (prose HTML + Katex courts), même
 * mécanisme que `RAPPEL_VECTORIEL_ORTHOGONALITE_AVANT/ENTRE/APRES` ci-dessus — composée en JSX par
 * les composants consommateurs, jamais un unique bloc `\text{...}` monolithique.
 */
export const TEXTE_AIDE_PIEGE_B_AVANT = "Attention : le vecteur qui part de B vers A est";
export const LATEX_PIEGE_B_EQUATION = "\\vec{BA}=-\\vec{AB}";
export const TEXTE_AIDE_PIEGE_B_ENTRE = ", pas";
export const LATEX_PIEGE_B_SEUL = "\\vec{AB}";
export const TEXTE_AIDE_PIEGE_B_APRES = "lui-même.";

export const TEXTE_AIDE_PIEGE_C_AVANT = "Attention : les deux vecteurs qui partent de C sont";
export const LATEX_PIEGE_C_EQUATION_1 = "\\vec{CA}=-\\vec{AC}";
export const TEXTE_AIDE_PIEGE_C_ENTRE = "et";
export const LATEX_PIEGE_C_EQUATION_2 = "\\vec{CB}=-\\vec{BC}";
export const TEXTE_AIDE_PIEGE_C_APRES = "— les deux doivent être inversés.";

export const TEXTE_AIDE_CONCLUSION_TRIANGLE =
  "Pour un triangle non dégénéré, un seul des 3 tests peut donner un critère nul. Si tu en trouves plusieurs à 0, revérifie tes calculs.";

// ============================================================================
// Placeholders — bloqués numériquement, jamais un exemple qui révèle la réponse
// ============================================================================

export const PLACEHOLDER_CRITERE = "ex : 5";
export const PLACEHOLDER_COMPOSANTE = "ex : 4";
export const PLACEHOLDER_COMPOSANTE_SYMBOLIQUE = "ex : 2x-1 ou 5";
export const PLACEHOLDER_EQUATION_REDUITE = "ex : 2x-3=0";
export const PLACEHOLDER_SOLUTION_X = "ex : -1";

/** Libellé du bouton Aide progressive — même petite fonction pure dupliquée qu'ailleurs dans le
 * projet (ex. `colinearite/formatColinearite.ts`), jamais un couplage entre générateurs pour un si
 * petit utilitaire. */