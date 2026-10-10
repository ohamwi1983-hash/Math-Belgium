/**
 * Présentation — "Colinéarité et alignement de points" (chapitre "Calcul vectoriel"), réécriture
 * complète (`promptcreationgenerateur24colinearitealignement.md`). **Ne jamais utiliser le terme
 * "déterminant"** dans un texte visible à l'élève — les matrices ne sont pas au programme de 4e.
 *
 * `formatLinExpr`/`formuleSubstitueeLatex` sont volontairement génériques sur `ComposantesLin`
 * (`coefX=0` représentant une composante purement numérique) — les variantes "vecteurs"/"points"
 * (jamais de `x`) réutilisent donc les MÊMES fonctions que "parametre"/"pointsParametre" via
 * `versLin`, jamais une paire de fonctions dupliquées.
 */
import type {
  ComposantesLin,
  ExerciceColinearParametre,
  ExerciceColinearPoints,
  ExerciceColinearPointsParametre,
  ExerciceColinearVecteurs,
  ExerciceColinearite,
  LinExpr,
  VarianteColinearite,
} from "../core/colinearite.types";
import type { Composantes } from "../core/vecteur.types";

type ExerciceTest = ExerciceColinearVecteurs | ExerciceColinearPoints;
type ExerciceAvecX = ExerciceColinearParametre | ExerciceColinearPointsParametre;

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

export function versLin(v: Composantes): ComposantesLin {
  return { x: { coefX: 0, constante: v.x }, y: { coefX: 0, constante: v.y } };
}

/** `coefX·x + constante` — coefficient 1/-1 jamais explicite, terme constant omis s'il est nul,
 * `coefX=0` retombe sur un simple nombre (comportement partagé par les variantes sans `x`). */
export function formatLinExpr(expr: LinExpr): string {
  const { coefX, constante } = expr;
  if (coefX === 0) return formatNombre(constante);
  const coefTexte = coefX === 1 ? "" : coefX === -1 ? "-" : formatNombre(coefX);
  const terme = `${coefTexte}x`;
  if (constante === 0) return terme;
  const signe = constante > 0 ? "+" : "-";
  return `${terme}${signe}${formatNombre(Math.abs(constante))}`;
}

/** Parenthèse un facteur composé (dépend de `x`) ou négatif — jamais une simple constante
 * positive, pour ne parenthéser que quand c'est structurellement nécessaire à la lecture. */
function formatFacteurLatex(expr: LinExpr): string {
  const rendu = formatLinExpr(expr);
  return expr.coefX !== 0 || expr.constante < 0 ? `(${rendu})` : rendu;
}

export function formatComposantesLinLatex(v: ComposantesLin): string {
  return `(${formatLinExpr(v.x)} ; ${formatLinExpr(v.y)})`;
}

export function formatComposantesLatex(v: Composantes): string {
  return `(${formatNombre(v.x)} ; ${formatNombre(v.y)})`;
}

/** `promptgen24modificationscompletes.md` — "bloc fitter" (un fragment KaTeX par point, jamais un
 * unique `\quad`-joined qui ne retourne jamais à la ligne sur mobile étroit — même principe que
 * `formatTermesEnonceTriangleLatex`/`formatTermesEnonceTriangleParametreLatex` du générateur 25,
 * structure miroir) pour le bloc de données A/B/C des variantes "points"/"pointsParametre". */
export function formatTermesEnoncePointsLatex(exercice: ExerciceColinearPoints): string[] {
  return [
    `${exercice.labelA}${formatComposantesLatex(exercice.pointA)}`,
    `${exercice.labelB}${formatComposantesLatex(exercice.pointB)}`,
    `${exercice.labelC}${formatComposantesLatex(exercice.pointC)}`,
  ];
}

export function formatTermesEnoncePointsParametreLatex(exercice: ExerciceColinearPointsParametre): string[] {
  return [
    `${exercice.labelA}${formatComposantesLatex(exercice.pointA)}`,
    `${exercice.labelB}${formatComposantesLinLatex(exercice.pointB)}`,
    `${exercice.labelC}${formatComposantesLinLatex(exercice.pointC)}`,
  ];
}

/** Rappel des vecteurs/points connus (bloc énoncé), dispatché par variante — un vecteur (v1/v2)
 * est TOUJOURS en notation matricielle colonne (`formatComposantesMatriceLatex`/
 * `formatComposantesLinMatriceLatex`), jamais la même notation en ligne qu'un point (correction
 * transversale — ces deux fonctions colonne étaient jusqu'ici réservées aux vecteurs AB/AC
 * construits, jamais utilisées ici pour les vecteurs v1/v2 donnés directement). */
export function formatEnonceLatex(exercice: ExerciceColinearite): string {
  if (exercice.variante === "vecteurs") {
    return `\\vec{${exercice.v1Nom}}${formatComposantesMatriceLatex(exercice.v1)} \\quad \\vec{${exercice.v2Nom}}${formatComposantesMatriceLatex(exercice.v2)}`;
  }
  if (exercice.variante === "parametre") {
    return `\\vec{${exercice.v1Nom}}${formatComposantesLinMatriceLatex(exercice.v1)} \\quad \\vec{${exercice.v2Nom}}${formatComposantesLinMatriceLatex(exercice.v2)}`;
  }
  if (exercice.variante === "points") {
    return `${exercice.labelA}${formatComposantesLatex(exercice.pointA)} \\quad ${exercice.labelB}${formatComposantesLatex(exercice.pointB)} \\quad ${exercice.labelC}${formatComposantesLatex(exercice.pointC)}`;
  }
  return `${exercice.labelA}${formatComposantesLatex(exercice.pointA)} \\quad ${exercice.labelB}${formatComposantesLinLatex(exercice.pointB)} \\quad ${exercice.labelC}${formatComposantesLinLatex(exercice.pointC)}`;
}

/** Formule substituée, valeurs réelles de l'exercice mais JAMAIS développée/calculée — aide 2 des
 * écrans "test"/"réduction". Générique sur `ComposantesLin` (voir en-tête de fichier). */
export function formuleSubstitueeLatex(v1: ComposantesLin, v2: ComposantesLin): string {
  return `${formatFacteurLatex(v1.x)}\\cdot ${formatFacteurLatex(v2.y)} - ${formatFacteurLatex(v1.y)}\\cdot ${formatFacteurLatex(v2.x)}`;
}

export function formuleSubstitueeTestLatex(exercice: ExerciceTest): string {
  if (exercice.variante === "vecteurs") return formuleSubstitueeLatex(versLin(exercice.v1), versLin(exercice.v2));
  return formuleSubstitueeLatex(versLin(exercice.vecteurAB), versLin(exercice.vecteurAC));
}

export function formuleSubstitueeReductionLatex(exercice: ExerciceAvecX): string {
  if (exercice.variante === "parametre") return formuleSubstitueeLatex(exercice.v1, exercice.v2);
  return formuleSubstitueeLatex(exercice.vecteurAB, exercice.vecteurAC);
}

const LIBELLES_VARIANTE: Record<VarianteColinearite, string> = {
  vecteurs: "Colinéarité de deux vecteurs",
  parametre: "Déterminer x pour la colinéarité",
  points: "Alignement de trois points",
  pointsParametre: "Alignement avec x",
};

export function libelleVarianteColinearite(variante: VarianteColinearite): string {
  return LIBELLES_VARIANTE[variante];
}

/** `promptcorrectionsgenerateur24lot4.md` — toutes les conclusions binaires (oui/non) de ce
 * générateur partagent désormais les mêmes libellés de bouton, quelle que soit la question posée
 * (jamais "Colinéaires"/"Alignés" distincts par variante — la question elle-même nomme déjà
 * explicitement les objets concernés, les boutons n'ont plus besoin de le répéter). */
export const LIBELLES_OUI_NON = { positif: "Oui", negatif: "Non" };

/** Question de colinéarité de deux vecteurs, composée en 3 fragments (prose + Katex courts) —
 * jamais un unique bloc de texte embarquant du LaTeX littéral. Réutilisée à l'identique pour la
 * variante "vecteurs" (ses propres vecteurs u/v) ET pour le SECOND champ catégoriel de la variante
 * "points" (les vecteurs AB/AC testés, toujours désignés génériquement "u"/"v" ici — même
 * convention que le reste de l'aide de cet écran, jamais liée aux vrais noms AB/AC). */
export const QUESTION_COLINEARITE_VECTEURS_AVANT = "Les vecteurs";
export const QUESTION_COLINEARITE_VECTEURS_ENTRE = "et";
export const QUESTION_COLINEARITE_VECTEURS_APRES = "sont-ils colinéaires ?";

/** Question d'alignement des 3 points — variante "points" uniquement, remplace l'ancienne
 * question générique "Que peux-tu conclure ?". */
export const QUESTION_ALIGNEMENT_POINTS = "Les points A, B et C sont-ils alignés ?";

/** Équation réduite `αx + β = 0` déjà confirmée à l'écran "réduction" — rappel persistant sur
 * l'écran "résolution" qui suit (jamais recalculée différemment, toujours dérivée des mêmes
 * `coefX`/`coefConst` que la vérification). */
export function formatEquationReduiteLatex(exercice: ExerciceAvecX): string {
  return `${formatLinExpr({ coefX: exercice.coefX, constante: exercice.coefConst })} = 0`;
}

// ============================================================================
// `promptcorrectionsgenerateur24complet.md` — consigne globale (V3 "points"/V4 "pointsParametre"
// uniquement, jamais V1/V2), persistante sur tous les écrans de l'exercice.
// ============================================================================

/** "vecteurs" (V1) a rejoint "points"/"pointsParametre" — `promptcorrectionsgenerateur24lot2.md`,
 * point 6 : la consigne globale manquait sur l'écran "test" de la variante 1. "parametre" (V2) a de
 * même rejoint les 3 autres — `promptcorrectionsgenerateur24lot3.md`, point 2 : cette variante
 * n'avait encore reçu aucune des corrections déjà appliquées à "pointsParametre" (V4). */
export function consigneGlobaleColinearite(exercice: ExerciceColinearite): string | null {
  if (exercice.variante === "vecteurs") return "Vérifie si ces deux vecteurs sont colinéaires.";
  if (exercice.variante === "points") return "Vérifie si les points A, B et C sont alignés.";
  if (exercice.variante === "parametre") return "Que doit valoir x pour que ces 2 vecteurs soient colinéaires ?";
  return "Quelle valeur doit avoir x pour que les points A, B et C soient alignés ?";
}

// ============================================================================
// Notation matricielle (2×1) — "État actuel", même convention que le générateur 21
// (`formatCombinaisonVecteurs.ts::formatVecteurColonneLatex`), dupliquée ici (contrats indépendants
// entre générateurs du chapitre).
// ============================================================================

export function formatComposantesMatriceLatex(v: Composantes): string {
  return `\\begin{pmatrix} ${formatNombre(v.x)} \\\\ ${formatNombre(v.y)} \\end{pmatrix}`;
}

export function formatComposantesLinMatriceLatex(v: ComposantesLin): string {
  return `\\begin{pmatrix} ${formatLinExpr(v.x)} \\\\ ${formatLinExpr(v.y)} \\end{pmatrix}`;
}

/** Bloc "État actuel" de l'écran "test" (V3 "points" uniquement, point 14) — AB/AC déjà confirmés à
 * l'écran "constructionVecteurs" précédent, en notation matricielle. `promptgen24modificationscompletes.md` :
 * empilés verticalement via `\begin{gathered}`, jamais `\qquad` (côte à côte), qui débordait sur
 * mobile étroit dès que les composantes sont larges — même correctif "bloc fitter" que le générateur
 * 25, structure miroir (`etatActuelTestSommet`). */
export function etatActuelTestPoints(exercice: ExerciceColinearPoints): string {
  const nom1 = `\\vec{${exercice.labelA}${exercice.labelB}}`;
  const nom2 = `\\vec{${exercice.labelA}${exercice.labelC}}`;
  return `\\begin{gathered} ${nom1} = ${formatComposantesMatriceLatex(exercice.vecteurAB)} \\\\ ${nom2} = ${formatComposantesMatriceLatex(exercice.vecteurAC)} \\end{gathered}`;
}

/** Bloc "État actuel" de l'écran "reductionAvecX" (V4 "pointsParametre" uniquement, point 5) — AB/AC
 * déjà confirmés à l'écran "constructionAvecX" précédent (peuvent encore dépendre de x), en notation
 * matricielle. `promptgen24modificationscompletes.md` : même correctif "bloc fitter" (`\begin{gathered}`,
 * jamais `\qquad`) que `etatActuelTestPoints` ci-dessus — structure miroir du générateur 25
 * (`etatActuelReductionSommet`). */
export function etatActuelReductionAvecX(exercice: ExerciceColinearPointsParametre): string {
  const nom1 = `\\vec{${exercice.labelA}${exercice.labelB}}`;
  const nom2 = `\\vec{${exercice.labelA}${exercice.labelC}}`;
  return `\\begin{gathered} ${nom1} = ${formatComposantesLinMatriceLatex(exercice.vecteurAB)} \\\\ ${nom2} = ${formatComposantesLinMatriceLatex(exercice.vecteurAC)} \\end{gathered}`;
}

// ============================================================================
// Textes d'aide — jamais "déterminant", toujours "critère de colinéarité"
// ============================================================================

/** `promptcorrectionsgenerateur24complet.md`, points 2 et 13 — aide simplifiée (formule seule,
 * sans texte explicatif) des écrans "construction" (V3 ET V4) : formule de différence de
 * coordonnées, jamais le prose historique (`TEXTE_AIDE_CONSTRUCTION_POINTS`/`_AVEC_X`, retirées).
 *
 * `promptcorrectionsgenerateur24lot2.md`, point 2 — **limitée au seul $\vec{AB}$** : montrer aussi
 * la formule de $\vec{AC}$ (ou d'un éventuel 3e vecteur pour une autre variante) laissait l'élève
 * la recopier sans avoir à en déduire seul la même logique. La formule de $\vec{AB}$ suffit à
 * illustrer la méthode (différence de coordonnées), jamais développée différemment que la
 * composante dépende de x ou non. */
export function formatFormuleComposantesLatex(labelOrigine: string, labelB: string): string {
  return `x_{${labelOrigine}${labelB}}=x_{${labelB}}-x_{${labelOrigine}}, \\quad y_{${labelOrigine}${labelB}}=y_{${labelB}}-y_{${labelOrigine}}`;
}

/** `promptcorrectionsgenerateur24complet.md`, points 6 et 7 — nouvelle consigne + rappel
 * VECTORIEL générique (V4 "reductionAvecX") — remplace la version en composantes "(a;b) et (c;d)"
 * par une version en vecteurs u/v nommés génériquement, JAMAIS liée aux vrais noms de l'exercice.
 * `promptcorrectionsgenerateur24lot2.md`, point 7 — cette même version vectorielle générique
 * remplace désormais AUSSI l'ancienne aide générique de l'écran "test" pour la variante 1
 * "vecteurs" : les deux formulations coexistaient à tort (prose générique (a;b)/(c;d) suivie d'une
 * formule substituée aux vrais noms), ne garder que la version u/v, identique à celle déjà
 * utilisée pour la variante 3 "points" sur ce même écran. `promptcorrectionsgenerateur24lot3.md`,
 * point 2 — cette même version rejoint enfin l'écran "reduction" de la variante 2 "parametre",
 * dernier écran à conserver l'ancienne aide générique (`TEXTE_AIDE_FORMULE_GENERALE`/
 * `formuleGeneraleReductionLatex`, toutes deux retirées comme code mort, plus aucun consommateur).
 * Composée en 3 fragments courts (prose HTML + Katex courts), jamais un bloc `\text{...}`
 * monolithique qui déborderait sur mobile — même précaution que le reste du projet. */
export const CONSIGNE_REDUCTION_AVEC_X = "Donne la relation de colinéarité entre ces vecteurs.";
export const RAPPEL_VECTORIEL_COLINEARITE_AVANT = "Rappel : deux vecteurs";
export const RAPPEL_VECTORIEL_COLINEARITE_ENTRE = "et";
export const RAPPEL_VECTORIEL_COLINEARITE_APRES = "sont colinéaires si, et seulement si,";
export const LATEX_VEC_U = "\\vec{u}";
export const LATEX_VEC_V = "\\vec{v}";
/** `promptcorrectionsgenerateur24lot3.md`, point 1 — soustraction égale zéro (jamais une égalité
 * entre membre gauche et membre droit séparés) : rendue en 2 fragments distincts, la formule elle-
 * même puis le texte "vaut 0." séparé (jamais concaténé dans la chaîne LaTeX, qui resterait alors
 * une égalité) — chaque composant consommateur affiche les deux à la suite. */
export const LATEX_FORMULE_COLINEARITE_VECTORIELLE = "x_{\\vec u}\\cdot y_{\\vec v} - y_{\\vec u}\\cdot x_{\\vec v}";
export const RAPPEL_VECTORIEL_COLINEARITE_FIN = "vaut 0.";

// ============================================================================
// Placeholders — jamais un exemple qui révèle la réponse
// ============================================================================

export const PLACEHOLDER_CRITERE = "ex : 5";
export const PLACEHOLDER_COMPOSANTE = "ex : 4";
export const PLACEHOLDER_COMPOSANTE_SYMBOLIQUE = "ex : 2x-1 ou 5";
export const PLACEHOLDER_EQUATION_REDUITE = "ex : 2x-3=0";
export const PLACEHOLDER_SOLUTION_X = "ex : -1";

/** Libellé du bouton Aide progressive — même petite fonction pure dupliquée qu'ailleurs dans le
 * projet (ex. `formatCombinaisonVecteurs.ts`), jamais un couplage entre générateurs pour un si
 * petit utilitaire. */