import type { ExerciceFonctionReference, FamilleReference } from "../../core/fonctionsReference.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction, type PointMarqueSvg } from "../../../export/svgGraph";
import { calculerViewBoxFonctionReference, RATIO_GRAPHE } from "../../ui/mafsFonctionsReference";
import { evaluerFonctionReference, pointUnitaire } from "../../moteur/verificationFonctionsReference";
import { formatEquationFonctionReferenceLatex } from "../../ui/formatFonctionsReference";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { CATALOGUE_VARIANTES, construireAvecFamille, genererExerciceFonctionReference } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFonctionReference>` pour gen10 (Transformer une
 * fonction de référence — chapitre 2, `AppFonctionsReference.tsx`) — feuille d'évaluation.
 *
 * Analogue direct de gen8 (`generateurs/transformationsGraphiques/exportEvaluation.ts`), généralisé
 * aux 6 familles de référence (`FAMILLES`) : l'écran interactif fait lire TH/TV/CH/EH/EV/CV/SOX/SOY
 * séparément via 6 curseurs + 2 toggles (`EtapeFonctionsReferenceExercice.tsx`), chacun vérifié
 * indépendamment, PUIS une étape "reconnaissance" distincte (retrouver la famille parmi 6, avant
 * même d'afficher les curseurs). Un exercice papier ne peut reproduire ni l'une ni l'autre de ces
 * granularités : condensé en UNE question "lis l'équation sur le graphique" — la famille est
 * donnée implicitement par la forme de la courbe tracée (comme sur l'écran, une fois la famille
 * reconnue), exactement comme gen8 condense p/q/EV/CV/SOX en une lecture d'équation unique.
 *
 * Points marqués — mêmes deux points que `MafsGraphFonctionsReference.tsx` (légende "Point
 * caractéristique" / "Point croix") :
 * - le point caractéristique, à `x=TH` (`pivotX`, indépendant de CH/EH/SOY, voir
 *   `verificationFonctionsReference.ts`) : pour les 5 familles où `g(0)=0` (carré/cube/racine
 *   carrée/racine cubique/valeur absolue), `f(TH) = TV` exactement — et pour "inverse", où ce point
 *   n'est pas défini (pôle), l'écran affiche déjà `(TH ; TV)` comme simple repère (intersection des
 *   deux asymptotes, cercle évidé) ; les deux cas convergent donc vers le MÊME couple `(TH ; TV)`,
 *   sans branche spéciale nécessaire ici ;
 * - le second point ("point croix"), où l'argument de la fonction de base vaut exactement 1
 *   (`pointUnitaire`, calculable exactement pour les 6 familles puisque g(1)=1 pour toutes).
 *
 * Pas de tracé des asymptotes de "inverse" ici (`Line.PointAngle` côté Mafs) : `construireSvgFonction`
 * (export/svgGraph.ts) ne sait tracer qu'une courbe échantillonnée + des points, jamais une droite
 * infinie séparée — hors périmètre de ce fichier (qui ne doit toucher aucun autre fichier). La
 * coupure au pôle reste néanmoins correctement rendue (`evaluerFonctionReference` renvoie NaN au
 * pôle, `construireSvgFonction` coupe le tracé exactement comme Mafs le fait pour `Plot.OfX`).
 */

function construireGrapheFonctionReference(exercice: ExerciceFonctionReference, estCorrige: boolean): string {
  const viewBox = calculerViewBoxFonctionReference(exercice);
  const croix = pointUnitaire(exercice);
  const largeur = 320;
  const points: PointMarqueSvg[] = [
    {
      x: exercice.th,
      y: exercice.tv,
      forme: "point",
      label: estCorrige ? `(${exercice.th} ; ${exercice.tv})` : undefined,
      labelPosition: "dessous",
    },
    {
      x: croix.x,
      y: croix.y,
      forme: "croix",
      label: estCorrige ? `(${formatFractionIrreductible(croix.x)} ; ${formatFractionIrreductible(croix.y)})` : undefined,
      labelPosition: "dessus",
    },
  ];
  return construireSvgFonction((x) => evaluerFonctionReference(exercice, x), { xMin: viewBox.x[0], xMax: viewBox.x[1], yMin: viewBox.y[0], yMax: viewBox.y[1] }, {
    largeur,
    hauteur: largeur / RATIO_GRAPHE,
    classe: "graphe-fonction-reference",
    points,
  });
}

function construireEnonceFonctionsReference(exercice: ExerciceFonctionReference): SectionExercice {
  return {
    enteteFragments: [
      texte("Le graphique ci-dessous représente une fonction de référence transformée — son point caractéristique et un second point sont marqués."),
    ],
    enteteHtml: construireGrapheFonctionReference(exercice, false),
    questions: [
      { consigne: [texte("Détermine l'équation de cette fonction, sous sa forme la plus simple.")], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireCorrectionFonctionsReference(exercice: ExerciceFonctionReference): BlocCorrection[] {
  const croix = pointUnitaire(exercice);
  return [
    {
      type: "paragraphe",
      fragments: [
        texte("Point caractéristique lu directement sur le graphique : "),
        latex(`(${exercice.th} ; ${exercice.tv})`),
        texte(", donc TH et TV sont connus."),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("Second point marqué (là où l'argument de la fonction vaut exactement 1) : "),
        latex(`(${formatFractionIrreductible(croix.x)} ; ${formatFractionIrreductible(croix.y)})`),
        texte(" — il permet de retrouver le rapport d'échelle et l'orientation de la courbe."),
      ],
    },
    { type: "html", html: construireGrapheFonctionReference(exercice, true) },
    { type: "paragraphe", fragments: [texte("Équation : "), latex(formatEquationFonctionReferenceLatex(exercice)), texte(".")] },
  ];
}

export const adaptateurEvaluationFonctionsReference: AdaptateurFeuilleExercices<ExerciceFonctionReference> = {
  titreDocument: "Transformer une fonction de référence — Évaluation",
  nomFichierBase: "fonctions-reference",
  genererInstance: genererExerciceFonctionReference,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecFamille(id as FamilleReference),
  construireEnonce: construireEnonceFonctionsReference,
  construireCorrection: construireCorrectionFonctionsReference,
};
