import type { ExercicePointVectoriel, VariantePointVectoriel } from "../core/pointVectoriel.types";
import type { PointAffiche, VecteurAffiche } from "./vecteurGraph";
import { calculerViewBoxVecteurs, positionEtiquettePoint } from "./vecteurGraph";

const LIBELLES_VARIANTE: Record<VariantePointVectoriel, string> = {
  translation: "Image par une translation",
  milieu: "Milieu d'un segment",
  relationGenerale: "Relation vectorielle générale",
};

export function libelleVariantePointVectoriel(variante: VariantePointVectoriel): string {
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
 * Consigne composée en 3 morceaux — texte brut avant / fragment LaTeX pur (jamais de `$...$`
 * littéral, KaTeX ne les interprète pas) / texte brut après — pour être assemblée directement en
 * JSX (`{avant}<Katex expression={latex}/>{apres}`), jamais passée entière à KaTeX : piège déjà
 * rencontré et corrigé ailleurs dans le projet (prose + fragment mathématique court, voir
 * `EtapeValidationSolution.tsx`/"Caractéristiques algébriques", CLAUDE.md) — un bloc KaTeX est une
 * unité insécable qui déborderait sur mobile si toute la phrase y était enrobée, et `$` n'a de
 * toute façon aucun sens pour KaTeX (pas un délimiteur qu'il interprète). `latex` est `null` pour
 * les variantes qui n'ont aucune relation vectorielle à afficher (translation/milieu).
 */
export interface ConsignePointVectoriel {
  avant: string;
  latex: string | null;
  apres: string;
}

export function consignePointVectoriel(exercice: ExercicePointVectoriel): ConsignePointVectoriel {
  if (exercice.variante === "translation") {
    return {
      avant: `${exercice.labelPoint} a pour image ${exercice.pointCherche} par la translation de vecteur `,
      latex: formatVecteurColonneLatex(exercice.translation),
      apres: `. Détermine les coordonnées de ${exercice.pointCherche}.`,
    };
  }
  if (exercice.variante === "milieu") {
    return {
      avant: `${exercice.pointCherche} est le milieu du segment [${exercice.labelA}${exercice.labelB}]. Détermine les coordonnées de ${exercice.pointCherche}.`,
      latex: null,
      apres: "",
    };
  }
  if (exercice.forme === "pointAPoint") {
    const coef = exercice.coefficient;
    const coefTexte = coef === 1 ? "" : coef === -1 ? "-" : formatNombre(coef);
    return {
      avant: "Sachant que ",
      latex: `\\vec{${exercice.labelOrigine}${exercice.pointCherche}} = ${coefTexte}\\vec{${exercice.labelOrigine}${exercice.labelConnu}}`,
      apres: `, détermine les coordonnées de ${exercice.pointCherche}.`,
    };
  }
  const coefUTexte = exercice.coefU === 1 ? "" : exercice.coefU === -1 ? "-" : formatNombre(exercice.coefU);
  const signeV = exercice.coefV >= 0 ? "+" : "-";
  const coefVAbs = Math.abs(exercice.coefV);
  const coefVTexte = coefVAbs === 1 ? "" : formatNombre(coefVAbs);
  return {
    avant: "Sachant que ",
    latex: `\\vec{${exercice.labelDepart}${exercice.pointCherche}} = ${coefUTexte}\\vec{${exercice.labelU}} ${signeV} ${coefVTexte}\\vec{${exercice.labelV}}`,
    apres: `, détermine les coordonnées de ${exercice.pointCherche}.`,
  };
}

/** Rappel textuel des coordonnées déjà connues (points/vecteurs), affiché dans le bloc énoncé —
 * fragment purement symbolique (lettres/nombres/parenthèses), jamais de prose : rendu KaTeX direct
 * sans risque de débordement, contrairement à `consignePointVectoriel`. Conservée telle quelle pour
 * les consommateurs qui ont besoin d'une seule chaîne — `formatTermesDonneesConnuesLatex` ci-dessous
 * en est la version "bloc fitter", un fragment par élément, pour l'affichage écran. */
export function formatDonneesConnuesLatex(exercice: ExercicePointVectoriel): string {
  return formatTermesDonneesConnuesLatex(exercice).join(" \\quad ");
}

/** Version "bloc fitter" de `formatDonneesConnuesLatex` (`.equation-box-termes`, un fragment KaTeX
 * par élément connu — jamais un unique `\quad`-joined qui ne retourne jamais à la ligne sur mobile
 * étroit, KaTeX rendant en `white-space: nowrap` en interne, `promptmodificationsgenerateurs20et21.md`
 * B.3). Un seul élément pour `translation`, 2 pour `milieu`/`pointAPoint`, 3 pour
 * `combinaisonVecteurs` (le point de départ, puis chacun des 2 vecteurs u/v). */
export function formatTermesDonneesConnuesLatex(exercice: ExercicePointVectoriel): string[] {
  if (exercice.variante === "translation") {
    return [`${exercice.labelPoint}(${formatNombre(exercice.point.x)} ; ${formatNombre(exercice.point.y)})`];
  }
  if (exercice.variante === "milieu") {
    return [
      `${exercice.labelA}(${formatNombre(exercice.pointA.x)} ; ${formatNombre(exercice.pointA.y)})`,
      `${exercice.labelB}(${formatNombre(exercice.pointB.x)} ; ${formatNombre(exercice.pointB.y)})`,
    ];
  }
  if (exercice.forme === "pointAPoint") {
    return [
      `${exercice.labelOrigine}(${formatNombre(exercice.pointOrigine.x)} ; ${formatNombre(exercice.pointOrigine.y)})`,
      `${exercice.labelConnu}(${formatNombre(exercice.pointConnu.x)} ; ${formatNombre(exercice.pointConnu.y)})`,
    ];
  }
  return [
    `${exercice.labelDepart}(${formatNombre(exercice.pointDepart.x)} ; ${formatNombre(exercice.pointDepart.y)})`,
    `\\vec{${exercice.labelU}}${formatVecteurColonneLatex(exercice.vecteurU)}`,
    `\\vec{${exercice.labelV}}${formatVecteurColonneLatex(exercice.vecteurV)}`,
  ];
}

/** Labels des champs de coordonnées (`promptmodificationsgenerateurs20et21.md` B.2) — `x_{...} =`/
 * `y_{...} =`, un seul fragment LaTeX chacun, consommé sur la MÊME ligne que son champ
 * (`field-inline`) — même convention que `formatRelationVectorielle.ts::formatLabelXLatex/YLatex`
 * (générateur 20, homonyme), remplace le texte brut historique "x(F) ="/"y(F) =" qui n'était pas un
 * vrai indice LaTeX. Valable pour les 4 sous-formes du générateur, `exercice.pointCherche` couvrant
 * toutes ("A'"/"O'", "M", "F", "E"). */
export function formatLabelXLatex(exercice: ExercicePointVectoriel): string {
  return `x_{${exercice.pointCherche}} =`;
}

export function formatLabelYLatex(exercice: ExercicePointVectoriel): string {
  return `y_{${exercice.pointCherche}} =`;
}

/**
 * Contenu du graphe affiché sur l'écran — jamais le point cherché lui-même (révélerait la
 * réponse par simple lecture graphique) :
 * - "translation" : le point connu, PLUS le vecteur de translation lui-même (`promptcorrectionsgen17gen12gen21.md`,
 *   point 6) — flèche seule, SANS label (la consigne l'affiche déjà en KaTeX), origine FIXÉE en
 *   (0;0) et extrémité en (dx;dy) (les composantes de la translation), JAMAIS ancré au point connu
 *   — un vecteur ancré là révélerait visuellement l'extrémité comme le point cherché sur un graphe
 *   à l'échelle réelle, exactement ce que l'ancien commentaire de cette fonction mettait en garde.
 * - "milieu" : les deux points A/B, PLUS le segment [AB] tracé entre eux (point 5) — un simple
 *   segment (`sansFleche: true`, jamais une flèche : ce n'est pas un vecteur), sans label (les 2
 *   points portent déjà leur propre lettre).
 * - "pointAPoint" : le vecteur B→E réellement tracé (B et E sont tous deux DÉJÀ connus, aucune
 *   fuite de F) — hors du périmètre de ce correctif (non mentionné par le prompt), inchangé.
 * - "combinaisonVecteurs" : le point A, plus u/v tracés comme vecteurs libres à l'origine — jamais
 *   ancrés en A, ce qui révélerait visuellement E comme leur somme — labellisés en notation
 *   vectorielle réelle (`labelFleche`, point 7) plutôt qu'en texte brut ("u"/"v"), cohérent avec la
 *   consigne qui les affiche déjà en KaTeX ($\vec u$/$\vec v$).
 *
 * Chaque point reçoit un `labelPosition` calculé via `positionEtiquettePoint`
 * (`promptmodificationsgenerateurs20et21.md` B.1) — la position par défaut de Mafs (`attach="s"`)
 * chevauche directement le point (lettre superposée) dès que rien ne vient décaler l'étiquette.
 * Direction choisie selon la géométrie réelle de chaque sous-forme : à l'opposé du point voisin
 * pour "milieu" (le segment [AB] n'a pas de label propre à éviter), à l'opposé/dans le sens du
 * vecteur B→E pour "pointAPoint" (même principe que le générateur 20 homonyme) ; pour "translation"
 * et "combinaisonVecteurs", le point affiché n'a aucun vecteur ANCRÉ SUR LUI sur ce graphe (le
 * vecteur de translation est ancré à l'origine, jamais sur le point connu ; les vecteurs u/v de
 * combinaisonVecteurs sont ancrés à l'origine, jamais en A) — direction nulle,
 * `positionEtiquettePoint` retombe alors sur son décalage diagonal fixe.
 */
export function valeursGraphePointVectoriel(exercice: ExercicePointVectoriel): { points: PointAffiche[]; vecteurs: VecteurAffiche[] } {
  if (exercice.variante === "translation") {
    const points: PointAffiche[] = [{ point: exercice.point, label: exercice.labelPoint }];
    const vecteurs: VecteurAffiche[] = [{ origine: { x: 0, y: 0 }, vecteur: exercice.translation }];
    const viewBox = calculerViewBoxVecteurs(points, vecteurs);
    points[0] = { ...points[0], labelPosition: positionEtiquettePoint(exercice.point, { x: 0, y: 0 }, viewBox) };
    return { points, vecteurs };
  }
  if (exercice.variante === "milieu") {
    const points: PointAffiche[] = [
      { point: exercice.pointA, label: exercice.labelA },
      { point: exercice.pointB, label: exercice.labelB },
    ];
    const versB = { x: exercice.pointB.x - exercice.pointA.x, y: exercice.pointB.y - exercice.pointA.y };
    const vecteurs: VecteurAffiche[] = [{ origine: exercice.pointA, vecteur: versB, sansFleche: true }];
    const viewBox = calculerViewBoxVecteurs(points, vecteurs);
    points[0] = { ...points[0], labelPosition: positionEtiquettePoint(exercice.pointA, { x: -versB.x, y: -versB.y }, viewBox) };
    points[1] = { ...points[1], labelPosition: positionEtiquettePoint(exercice.pointB, versB, viewBox) };
    return { points, vecteurs };
  }
  if (exercice.forme === "pointAPoint") {
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
  const points: PointAffiche[] = [{ point: exercice.pointDepart, label: exercice.labelDepart }];
  const vecteurs: VecteurAffiche[] = [
    { origine: { x: 0, y: 0 }, vecteur: exercice.vecteurU, labelFleche: { base: exercice.labelU } },
    { origine: { x: 0, y: 0 }, vecteur: exercice.vecteurV, labelFleche: { base: exercice.labelV } },
  ];
  const viewBox = calculerViewBoxVecteurs(points, vecteurs);
  points[0] = { ...points[0], labelPosition: positionEtiquettePoint(exercice.pointDepart, { x: 0, y: 0 }, viewBox) };
  return { points, vecteurs };
}
