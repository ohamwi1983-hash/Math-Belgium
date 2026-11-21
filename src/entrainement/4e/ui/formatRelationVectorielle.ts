/**
 * Présentation — "Point à partir d'une relation vectorielle" (version guidée, position 20).
 * Réutilise le patron déjà établi par `formatPointVectoriel.ts` (générateur homonyme, position 21)
 * pour la consigne en 3 morceaux et le rendu des points connus — module entièrement indépendant
 * sinon (aucun import croisé entre les deux, voir `core/relationVectorielle.types.ts`).
 *
 * **Le graphe est ici gagné par l'aide, jamais affiché par défaut** — contrairement au générateur
 * en position 21, qui affiche son graphe en permanence sur son unique écran. Cette
 * version guidée cache le graphe derrière un bouton "Aide" (une seule aide par
 * exercice — voir `sessionRelationVectorielle.ts`) : `valeursGrapheAide` retourne le contenu à
 * afficher UNE FOIS l'aide activée, jamais avant.
 */
import type {
  ExerciceRelationGeneraleRV,
  ExerciceRelationVectorielle,
  VarianteRelationVectorielle,
} from "../core/relationVectorielle.types";
import type { PointAffiche, VecteurAffiche } from "./vecteurGraph";
import { calculerViewBoxVecteurs, positionEtiquettePoint } from "./vecteurGraph";
import { formatFractionIrreductible } from "./formatFraction";
import { nombreFrLatex } from "./nombreFr";

const LIBELLES_VARIANTE: Record<VarianteRelationVectorielle, string> = {
  translation: "Translation par un vecteur",
  relationGenerale: "Relation vectorielle générale",
};

export function libelleVarianteRelationVectorielle(variante: VarianteRelationVectorielle): string {
  return LIBELLES_VARIANTE[variante];
}

/** Coordonnées et composantes en LaTeX, virgule décimale (audit chapitre 6, point 14). */
function formatNombre(valeur: number): string {
  return nombreFrLatex(valeur);
}

/** Notation matricielle colonne (2×1) — jamais la notation en ligne d'un point (correction
 * transversale : un vecteur ne doit jamais être visuellement indiscernable d'un point). */
function formatVecteurColonneLatex(v: { x: number; y: number }): string {
  return `\\begin{pmatrix} ${formatNombre(v.x)} \\\\ ${formatNombre(v.y)} \\end{pmatrix}`;
}

/** Coefficient de l'énoncé en LaTeX, fraction exacte en `\\tfrac` (`-\\tfrac{1}{3}`), jamais la
 * barre en ligne « -1/3 » (audit chapitre 6) ; implicite pour ±1 — aussi pour la traduction révélée
 * (`formatTraductionAttendueLatex`) ; l’élève, lui, peut taper « 1/3 ». */
function formatCoefficientConsigneLatex(coef: number): string {
  if (coef === 1) return "";
  if (coef === -1) return "-";
  if (Number.isInteger(coef)) return String(coef);
  const [num, den] = formatFractionIrreductible(Math.abs(coef)).split("/");
  return `${coef < 0 ? "-" : ""}\\tfrac{${num}}{${den}}`;
}

/** Voir `formatPointVectoriel.ts::ConsignePointVectoriel` — même patron exact (prose + court
 * fragment KaTeX inline, jamais la phrase entière passée à KaTeX). */
export interface ConsigneRelationVectorielle {
  avant: string;
  latex: string | null;
  apres: string;
}

export function consigneRelationVectorielle(exercice: ExerciceRelationVectorielle): ConsigneRelationVectorielle {
  if (exercice.variante === "translation") {
    return {
      avant: `${exercice.labelPoint} a pour image ${exercice.pointCherche} par la translation de vecteur `,
      latex: formatVecteurColonneLatex(exercice.translation),
      apres: `. Détermine les coordonnées de ${exercice.pointCherche}.`,
    };
  }
  const coefTexte = formatCoefficientConsigneLatex(exercice.coefficient);
  if (exercice.forme === "milieu") {
    // Le mot « milieu » est dit (audit chapitre 6, point 20), puis la relation qui le traduit.
    return {
      avant: `${exercice.pointCherche} est le milieu du segment [${exercice.labelOrigine}${exercice.labelConnu}], c'est-à-dire `,
      latex: `\\vec{${exercice.labelOrigine}${exercice.pointCherche}} = ${coefTexte}\\vec{${exercice.labelOrigine}${exercice.labelConnu}}`,
      apres: `. Détermine les coordonnées de ${exercice.pointCherche}.`,
    };
  }
  return {
    avant: "Sachant que ",
    latex: `\\vec{${exercice.labelOrigine}${exercice.pointCherche}} = ${coefTexte}\\vec{${exercice.labelOrigine}${exercice.labelConnu}}`,
    apres: `, détermine les coordonnées de ${exercice.pointCherche}.`,
  };
}

/** Rappel textuel des coordonnées déjà connues — fragment purement symbolique, rendu KaTeX direct.
 * Conservée telle quelle pour les consommateurs qui ont besoin d'une seule chaîne (récapitulatif) —
 * `formatTermesDonneesConnuesLatex` ci-dessous en est la version "bloc fitter", un fragment par
 * point, pour l'affichage écran (jamais de débordement mobile). */
export function formatDonneesConnuesLatex(exercice: ExerciceRelationVectorielle): string {
  return formatTermesDonneesConnuesLatex(exercice).join(" \\quad ");
}

/** Version "bloc fitter" de `formatDonneesConnuesLatex` (`.equation-box-termes`, un fragment KaTeX
 * par point connu — jamais un unique `\quad`-joined qui ne retourne jamais à la ligne sur mobile
 * étroit, KaTeX rendant en `white-space: nowrap` en interne, `promptmodificationsgenerateurs20et21.md`
 * A.4). Un seul élément pour `translation` (rien à séparer), 2 pour `relationGenerale`. */
export function formatTermesDonneesConnuesLatex(exercice: ExerciceRelationVectorielle): string[] {
  const pt = (l: string, p: { x: number; y: number }) => `${l}(${formatNombre(p.x)}\\,;\\,${formatNombre(p.y)})`;
  if (exercice.variante === "translation") {
    return [pt(exercice.labelPoint, exercice.point)];
  }
  return [pt(exercice.labelOrigine, exercice.pointOrigine), pt(exercice.labelConnu, exercice.pointConnu)];
}

/**
 * Contenu du graphe d'aide — jamais le point cherché lui-même :
 * - `translation` : le point A (ou O) placé, PLUS le vecteur de translation tracé depuis ce point
 *   (son extrémité coïncide géométriquement avec l'image, mais n'est ni marquée ni étiquetée —
 *   lecture des composantes sur la grille, exactement l'objectif pédagogique de cette aide, spec
 *   section "Écran 1"). Le vecteur n'a plus de `label` de composantes (`promptmodificationsgenerateurs20et21.md`
 *   A.2) — cette information est déjà dans le bloc de données au-dessus, un second affichage sur le
 *   graphe lui-même n'était que redondance/encombrement.
 * - `relationGenerale` (`pointAPoint`/`milieu`, même traitement) : les points B, E placés, PLUS le
 *   vecteur B→E tracé avec son sens — jamais un vecteur vers le point cherché (F/M), qui n'est ni
 *   connu ni marqué ici.
 *
 * Chaque point reçoit désormais un `labelPosition` calculé via `positionEtiquettePoint`
 * (`promptmodificationsgenerateurs20et21.md` A.1) — la position par défaut de Mafs (`attach="s"`,
 * un petit décalage fixe en pixels) chevauche la flèche/le point lui-même dès que le point est
 * proche de l'origine (cas fréquent ici, l'un des deux points d'entrée étant souvent O). Direction
 * choisie à l'opposé du vecteur pour un point-origine (le vecteur "part" de ce point, l'étiquette
 * doit reculer), dans le sens du vecteur pour un point-extrémité (l'étiquette prolonge le tracé).
 */
export function valeursGrapheAide(exercice: ExerciceRelationVectorielle): { points: PointAffiche[]; vecteurs: VecteurAffiche[] } {
  if (exercice.variante === "translation") {
    const points: PointAffiche[] = [{ point: exercice.point, label: exercice.labelPoint }];
    const vecteurs: VecteurAffiche[] = [{ origine: exercice.point, vecteur: exercice.translation }];
    const viewBox = calculerViewBoxVecteurs(points, vecteurs);
    const direction = { x: -exercice.translation.x, y: -exercice.translation.y };
    points[0] = { ...points[0], labelPosition: positionEtiquettePoint(exercice.point, direction, viewBox) };
    return { points, vecteurs };
  }
  const vecteurBE = { x: exercice.pointConnu.x - exercice.pointOrigine.x, y: exercice.pointConnu.y - exercice.pointOrigine.y };
  const points: PointAffiche[] = [
    { point: exercice.pointOrigine, label: exercice.labelOrigine },
    { point: exercice.pointConnu, label: exercice.labelConnu },
  ];
  const vecteurs: VecteurAffiche[] = [{ origine: exercice.pointOrigine, vecteur: vecteurBE }];
  const viewBox = calculerViewBoxVecteurs(points, vecteurs);
  points[0] = { ...points[0], labelPosition: positionEtiquettePoint(exercice.pointOrigine, { x: -vecteurBE.x, y: -vecteurBE.y }, viewBox) };
  points[1] = { ...points[1], labelPosition: positionEtiquettePoint(exercice.pointConnu, vecteurBE, viewBox) };
  return { points, vecteurs };
}

/** Placeholder du champ "traduction" — un exemple NEUTRE, avec d'autres lettres et un autre
 * coefficient que ceux de l'exercice (audit chapitre 6, point 20 : l'ancien exemple reprenait les
 * vraies lettres, donc la forme attendue presque complète). Montre seulement la syntaxe. */
export function placeholderTraduction(): string {
  return "ex : Q-P=2(R-P)";
}

/** Forme générale attendue, en LaTeX, pour la consigne imprimée (export) : vraies lettres,
 * coefficient générique k — sur papier, la question doit dire quelle égalité écrire. */
export function formeTraductionLatex(exercice: ExerciceRelationGeneraleRV): string {
  return `${exercice.pointCherche} - ${exercice.labelOrigine} = k\\,(${exercice.labelConnu} - ${exercice.labelOrigine})`;
}

/** La vraie relation traduite en coordonnées, en LaTeX — source unique consommée à la fois par le
 * récapitulatif (`recapitulatifRelationVectorielle.ts`) et par la révélation du panneau de résultat
 * après échec (`ResultatPanelRelationVectorielle.tsx`), jamais recalculée indépendamment deux fois. */
export function formatTraductionAttendueLatex(exercice: ExerciceRelationGeneraleRV): string {
  // Fraction en KaTeX (`\tfrac{1}{2}`), jamais « 1/2 » écrit au clavier (point ouvert du corrigé,
  // décisions 4e ch. 6) : la réponse révélée et le récapitulatif s'affichent, ils ne se recopient pas.
  const coefTexte = formatCoefficientConsigneLatex(exercice.coefficient);
  return `${exercice.pointCherche}-${exercice.labelOrigine}=${coefTexte}(${exercice.labelConnu}-${exercice.labelOrigine})`;
}

/** Labels des écrans à coordonnées (`promptcorrectionsgenerateur20verificationlabels.md`, correction
 * 2) — `x_{A'} =`/`y_{A'} =`, un seul fragment LaTeX chacun, consommé sur la MÊME ligne que son
 * champ (`field-inline`, voir les composants) — même convention que `x_{\vec t}`/`y_{\vec t}` déjà
 * appliquée au générateur 21 (`ui/formatCombinaisonVecteurs.ts::formatLabelXLatex/formatLabelYLatex`).
 * Valable pour les DEUX écrans à coordonnées du générateur (translation ET relationGenerale,
 * `exercice.pointCherche` couvrant les deux : `"A'"`/`"O'"` ou `"F"`/`"M"`), jamais un seul. */
export function formatLabelXLatex(exercice: ExerciceRelationVectorielle): string {
  return `x_{${exercice.pointCherche}} =`;
}

export function formatLabelYLatex(exercice: ExerciceRelationVectorielle): string {
  return `y_{${exercice.pointCherche}} =`;
}
