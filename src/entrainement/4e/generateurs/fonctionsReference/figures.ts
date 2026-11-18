import type { ExerciceFonctionReference, FamilleReference } from "../../core/fonctionsReference.types";
import { construireSvgFonction, type PointMarqueSvg } from "../../../export/svgGraph";
import { cadrageLisible } from "../../../export/cadrageLisible";
import { calculerViewBoxFonctionReference, RATIO_GRAPHE } from "../../ui/mafsFonctionsReference";
import { evaluerFonctionReference, pointUnitaire } from "../../moteur/verificationFonctionsReference";
import { formatFractionIrreductible } from "../../ui/formatFraction";

/**
 * Graphiques papier de gen10 (énoncé : la courbe seule ; corrigé : point caractéristique et point
 * croix étiquetés, fonction de référence en pointillés) — sans dépendance à `docx`, pour être
 * importés par le corrigé détaillé partagé avec l'appli (`corrigeDetaille.ts`) et par gen11.
 */

/** Exporté pour gen11 (forme canonique) : même courbe f, mêmes deux points, même fonction de
 * référence en pointillés dans son corrigé détaillé. */
/** Familles dont la courbe se prolonge des deux côtés du point caractéristique (horizontalement),
 * et celles à symétrie centrale (aussi verticalement) — cadrage de l'énoncé papier. */
const SYMETRIE_X: FamilleReference[] = ["carre", "valeur_absolue", "cube", "racine_cubique", "inverse"];
const SYMETRIE_Y: FamilleReference[] = ["cube", "racine_cubique", "inverse"];

/** Asymptotes de 1/x (centre au point caractéristique), en pointillés : partie de la courbe, comme
 * à l'écran (`Line.PointAngle`). */
function asymptotes(exercice: ExerciceFonctionReference) {
  return exercice.famille === "inverse"
    ? { verticales: [{ x: exercice.th }], courbesSecondaires: [{ evaluer: () => exercice.tv, pointilles: true }] }
    : { verticales: undefined, courbesSecondaires: undefined };
}

/** Graphique de l'ÉNONCÉ papier (décision de l'utilisateur) : la courbe seule, sans point marqué ni
 * coordonnée ; quadrillage et zoom choisis pour que le point caractéristique ET le point où
 * l'argument vaut 1 tombent sur des intersections (`cadrageLisible`). */
function grapheEnonceFonctionReference(exercice: ExerciceFonctionReference): string {
  const cadrage = cadrageLisible({ x: exercice.th, y: exercice.tv }, pointUnitaire(exercice), {
    symetrieX: SYMETRIE_X.includes(exercice.famille),
    symetrieY: SYMETRIE_Y.includes(exercice.famille),
  });
  return construireSvgFonction((x) => evaluerFonctionReference(exercice, x), cadrage.viewBox, {
    largeur: cadrage.largeur,
    hauteur: cadrage.hauteur,
    classe: "graphe-fonction-reference",
    grille: cadrage.grille,
    ...asymptotes(exercice),
  });
}

export function construireGrapheFonctionReference(exercice: ExerciceFonctionReference, estCorrige: boolean, libelleCourbe = "f (courbe donnée)"): string {
  if (!estCorrige) return grapheEnonceFonctionReference(exercice);
  // Corrigé : la fonction de référence g (paramètres neutres) en pointillés gris sous la courbe de
  // f, pour voir les transformations appliquées au point (0 ; 0) et au point (1 ; 1). La fenêtre
  // englobe alors les deux courbes (même calcul que l'écran, qui l'étend à la courbe « live »).
  const reference: ExerciceFonctionReference = { famille: exercice.famille, th: 0, tv: 0, ch: 1, eh: 1, ev: 1, cv: 1, sox: false, soy: false };
  const viewBox = estCorrige ? calculerViewBoxFonctionReference(exercice, reference) : calculerViewBoxFonctionReference(exercice);
  const croix = pointUnitaire(exercice);
  const largeur = 320;
  const points: PointMarqueSvg[] = [
    {
      x: exercice.th,
      y: exercice.tv,
      forme: "point",
      label: estCorrige ? `(${exercice.th} ; ${exercice.tv})` : undefined,
      // Étiquettes de part et d'autre des deux points (sinon elles se chevauchent quand le point
      // croix est sous le point caractéristique).
      labelPosition: croix.y >= exercice.tv ? "dessous" : "dessus",
    },
    {
      x: croix.x,
      y: croix.y,
      forme: "croix",
      label: estCorrige ? `(${formatFractionIrreductible(croix.x)} ; ${formatFractionIrreductible(croix.y)})` : undefined,
      labelPosition: croix.y >= exercice.tv ? "dessus" : "dessous",
    },
  ];
  return construireSvgFonction((x) => evaluerFonctionReference(exercice, x), { xMin: viewBox.x[0], xMax: viewBox.x[1], yMin: viewBox.y[0], yMax: viewBox.y[1] }, {
    largeur: estCorrige ? 420 : largeur,
    hauteur: (estCorrige ? 420 : largeur) / RATIO_GRAPHE,
    classe: estCorrige ? "figure-corrige" : "graphe-fonction-reference",
    points,
    courbesSecondaires: [
      ...(estCorrige ? [{ evaluer: (x: number) => evaluerFonctionReference(reference, x) }] : []),
      ...(asymptotes(exercice).courbesSecondaires ?? []),
    ],
    verticales: asymptotes(exercice).verticales,
    legende: estCorrige
      ? [
          { texte: libelleCourbe, couleur: "#1971c2" },
          { texte: `référence ${BASE_TEXTE[exercice.famille]}`, couleur: "#8a8f98", pointilles: true },
        ]
      : undefined,
  });
}

/** Nom court de la fonction de référence, pour la légende du graphique du corrigé (texte SVG). */
const BASE_TEXTE: Record<FamilleReference, string> = {
  carre: "y = x²",
  cube: "y = x³",
  racine_carree: "y = √x",
  racine_cubique: "y = ∛x",
  inverse: "y = 1/x",
  valeur_absolue: "y = |x|",
};

