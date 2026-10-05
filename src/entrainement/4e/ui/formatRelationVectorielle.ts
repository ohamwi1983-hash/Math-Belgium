/**
 * Présentation — "Point à partir d'une relation vectorielle" (version guidée, position 20).
 * Réutilise le patron déjà établi par `formatPointVectoriel.ts` (générateur homonyme, position 21)
 * pour la consigne en 3 morceaux et le rendu des points connus — module entièrement indépendant
 * sinon (aucun import croisé entre les deux, voir `core/relationVectorielle.types.ts`).
 *
 * **Le graphe est ici gagné par l'aide, jamais affiché par défaut** — contrairement au générateur
 * en position 21, qui affiche son graphe en permanence sur son unique écran, sans pénalité. Cette
 * version guidée cache le graphe derrière un bouton "Aide" pénalisant (×0,5, une seule aide par
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

const LIBELLES_VARIANTE: Record<VarianteRelationVectorielle, string> = {
  translation: "Translation par un vecteur",
  relationGenerale: "Relation vectorielle générale",
};

export function libelleVarianteRelationVectorielle(variante: VarianteRelationVectorielle): string {
  return LIBELLES_VARIANTE[variante];
}

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** Notation matricielle colonne (2×1) — jamais la notation en ligne d'un point (correction
 * transversale : un vecteur ne doit jamais être visuellement indiscernable d'un point). */
function formatVecteurColonneLatex(v: { x: number; y: number }): string {
  return `\\begin{pmatrix} ${formatNombre(v.x)} \\\\ ${formatNombre(v.y)} \\end{pmatrix}`;
}

/**
 * Coefficient d'une relation générale (`\pm3, \pm2, \pm1, \pm1/2, \pm1/3`, ou `0.5` pour "milieu"),
 * jamais explicite s'il vaut `1`/`-1` (convention déjà en place côté `formatPointVectoriel.ts`).
 * **Piège rencontré et corrigé** : un premier essai réutilisait `formatNombre` (arrondi à 2
 * décimales) — `1/3` s'y affichait `"0.33"`, une valeur ARRONDIE, pas la valeur exacte `1/3` (le
 * test d'intégration, en reconstruisant une réponse "correcte" à partir de ce texte, révélait la
 * régression : `diagnostiquerTraduction`, comparé à l'exacte fraction `1/3` avec une tolérance de
 * `1e-9`, rejetait `"0.33"`). Corrigé en réutilisant `formatFractionIrreductible`
 * (`ui/formatFraction.ts`, déjà utilisée ailleurs dans le projet pour la même raison) — jamais un
 * décimal bruité, notation identique à celle attendue dans le champ de saisie ("1/3", pas
 * `\frac{1}{3}`), pour que la valeur révélée reste directement comparable à ce que l'élève a tapé.
 */
function formatCoefficientTraduction(coef: number): string {
  if (coef === 1) return "";
  if (coef === -1) return "-";
  return formatFractionIrreductible(coef);
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
  const coefTexte = formatCoefficientTraduction(exercice.coefficient);
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
  if (exercice.variante === "translation") {
    return [`${exercice.labelPoint}(${formatNombre(exercice.point.x)} ; ${formatNombre(exercice.point.y)})`];
  }
  return [
    `${exercice.labelOrigine}(${formatNombre(exercice.pointOrigine.x)} ; ${formatNombre(exercice.pointOrigine.y)})`,
    `${exercice.labelConnu}(${formatNombre(exercice.pointConnu.x)} ; ${formatNombre(exercice.pointConnu.y)})`,
  ];
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

/** Placeholder du champ "traduction" — la STRUCTURE attendue avec les vraies lettres de l'exercice
 * (fixes par construction : F/M, B, E), mais un coefficient toujours générique `"k"`, jamais la
 * vraie valeur numérique — ne révèle donc jamais la réponse, seulement la syntaxe attendue. */
export function placeholderTraduction(exercice: ExerciceRelationGeneraleRV): string {
  return `ex : ${exercice.pointCherche}-${exercice.labelOrigine}=k(${exercice.labelConnu}-${exercice.labelOrigine})`;
}

/** La vraie relation traduite en coordonnées, en LaTeX — source unique consommée à la fois par le
 * récapitulatif (`recapitulatifRelationVectorielle.ts`) et par la révélation du panneau de résultat
 * après échec (`ResultatPanelRelationVectorielle.tsx`), jamais recalculée indépendamment deux fois. */
export function formatTraductionAttendueLatex(exercice: ExerciceRelationGeneraleRV): string {
  const coefTexte = formatCoefficientTraduction(exercice.coefficient);
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
