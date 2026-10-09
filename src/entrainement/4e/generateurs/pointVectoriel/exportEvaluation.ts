import type { ExercicePointVectoriel } from "../../core/pointVectoriel.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consignePointVectoriel, formatDonneesConnuesLatex } from "../../ui/formatPointVectoriel";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointVectoriel } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExercicePointVectoriel>` pour gen20 (Point/coordonnée à
 * partir d'une relation vectorielle — `AppPointVectoriel.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Chapitre Math-Belgium "Calcul vectoriel" (4e), section "Vecteurs, translation et milieu"
 * (`relation`) : cette section est servie par DEUX générateurs, gen20 (ce fichier) ET gen21
 * (`relationVectorielle`, adaptateur distinct porté séparément) — ce fichier ne couvre que gen20.
 *
 * Écran → question : `AppPointVectoriel.tsx`/`EtapePointVectoriel.tsx` n'a qu'UN seul écran (pas de
 * `Phase`, un seul essai avec 2 champs x/y soumis ensemble, `moteur/sessionPointVectoriel.ts`) —
 * ceci devient ici UNE seule question par instance. Sur cet écran, le bloc `.equation-box-termes`
 * (`formatTermesDonneesConnuesLatex`) ET un graphe (`VecteurGraph`) affichent tous deux les données
 * connues avant la consigne texte (`consignePointVectoriel`) ; sur la feuille imprimée, le graphe
 * n'est PAS reproduit (aucun `enteteHtml` — contrairement à `svgGraphCyclo.ts`/`svgGraph.ts`,
 * réservés au tracé d'une COURBE de fonction, il n'existe aucun moteur générique de tracé de
 * points/vecteurs dans `export/`, et en construire un est hors du périmètre de ce portage) : les
 * données connues restent intégralement lisibles en texte/LaTeX via `enteteFragments`
 * (`formatDonneesConnuesLatex`, la même fonction qui alimente `.equation-box-termes` à l'écran),
 * donc aucune information n'est perdue — seule la représentation graphique (redondante avec le
 * texte pour ce générateur, jamais la seule source de données) ne l'est pas.
 *
 * PAS `regroupable` : la consigne (`consignePointVectoriel`) mentionne TOUJOURS des valeurs tirées
 * de l'instance en son sein même (pas seulement dans `enteteFragments`) — le label du point cherché
 * (`A'`/`M`/`F`/`E`), les labels des points/vecteurs connus, et pour "translation"/"relationGenerale"
 * un fragment LaTeX tiré (le vecteur de translation en colonne, ou le coefficient/la combinaison de
 * `\vec u`/`\vec v`) directement interpolé dans la phrase. Aucune des 3 variantes n'a de consigne
 * GÉNÉRIQUE indépendante de l'instance (condition (2) de `AdaptateurFeuilleExercices.regroupable`,
 * voir `export/genererFeuilleExercices.ts`) : `/admin` de Math-Belgium ne peut donc PAS regrouper
 * plusieurs instances de ce générateur sous une consigne imprimée unique, contrairement à
 * `quelAngle/exportEvaluation.ts` (consigne constante, l'équation variable restant dans
 * `enteteFragments`).
 *
 * Aucune zone de réponse vierge (`reponse: { type: "lignes", nombre: 0 }`, même décision documentée
 * que `quelAngle/exportEvaluation.ts`/`comparaisonSeries/exportEvaluation.ts`) : la réponse attendue
 * est une simple paire de coordonnées, jamais un calcul à dérouler sur plusieurs lignes.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`instance.reponse`, déjà calculée à la génération — voir `generateurs/pointVectoriel/index.ts`),
 * jamais recalculée indépendamment ici. Réutilise directement `ui/formatPointVectoriel.ts`
 * (`consignePointVectoriel`/`formatDonneesConnuesLatex`, déjà les fonctions utilisées côté écran
 * interactif) pour l'énoncé ; la correction ci-dessous compose un unique paragraphe qui rappelle la
 * relation utilisée puis le calcul menant aux coordonnées de `pointCherche`, une formule dédiée par
 * variante (aucune fonction de formatage existante ne produit déjà ce texte de résolution, les 4
 * sous-formes ayant chacune une arithmétique propre).
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

function formatPointLatex(label: string, point: { x: number; y: number }): string {
  return `${label}(${formatNombre(point.x)} \\text{ ; } ${formatNombre(point.y)})`;
}

function construireEnoncePointVectoriel(instance: ExercicePointVectoriel): SectionExercice {
  const consigne = consignePointVectoriel(instance);
  const fragmentsConsigne = [texte(consigne.avant), ...(consigne.latex ? [latex(consigne.latex)] : []), texte(consigne.apres)];

  return {
    enteteFragments: [texte("Données : "), latex(formatDonneesConnuesLatex(instance))],
    questions: [{ consigne: fragmentsConsigne, reponse: { type: "lignes", nombre: 0 } }],
  };
}

/** Correction de la variante "translation" : point cherché = point connu + vecteur de translation. */
function correctionTranslation(instance: Extract<ExercicePointVectoriel, { variante: "translation" }>): BlocCorrection[] {
  const { point, labelPoint, translation, pointCherche, reponse } = instance;
  return [
    {
      type: "paragraphe",
      fragments: [
        latex(`\\vec{${labelPoint}${pointCherche}} = \\begin{pmatrix} ${formatNombre(translation.x)} \\\\ ${formatNombre(translation.y)} \\end{pmatrix}`),
        texte(" donc "),
        latex(
          `${pointCherche}(${formatNombre(point.x)} + ${formatNombre(translation.x)} \\text{ ; } ${formatNombre(point.y)} + ${formatNombre(translation.y)}) = ${formatPointLatex(pointCherche, reponse)}`,
        ),
        texte("."),
      ],
    },
  ];
}

/** Correction de la variante "milieu" : moyenne des coordonnées de A et B. */
function correctionMilieu(instance: Extract<ExercicePointVectoriel, { variante: "milieu" }>): BlocCorrection[] {
  const { pointA, labelA, pointB, labelB, pointCherche, reponse } = instance;
  return [
    {
      type: "paragraphe",
      fragments: [
        latex(
          `${pointCherche} = \\left( \\dfrac{x_{${labelA}} + x_{${labelB}}}{2} \\text{ ; } \\dfrac{y_{${labelA}} + y_{${labelB}}}{2} \\right) = ` +
            `\\left( \\dfrac{${formatNombre(pointA.x)} + ${formatNombre(pointB.x)}}{2} \\text{ ; } \\dfrac{${formatNombre(pointA.y)} + ${formatNombre(pointB.y)}}{2} \\right) = ${formatPointLatex(pointCherche, reponse)}`,
        ),
        texte("."),
      ],
    },
  ];
}

/** Correction de la sous-forme "pointAPoint" : F = B + k·(E − B). */
function correctionRelationPointAPoint(instance: Extract<ExercicePointVectoriel, { variante: "relationGenerale"; forme: "pointAPoint" }>): BlocCorrection[] {
  const { pointOrigine, labelOrigine, pointConnu, labelConnu, coefficient, pointCherche, reponse } = instance;
  const dx = pointConnu.x - pointOrigine.x;
  const dy = pointConnu.y - pointOrigine.y;
  const k = formatNombre(coefficient);
  return [
    {
      type: "paragraphe",
      fragments: [
        latex(`\\vec{${labelOrigine}${labelConnu}} = \\begin{pmatrix} ${formatNombre(dx)} \\\\ ${formatNombre(dy)} \\end{pmatrix}`),
        texte(", donc "),
        latex(
          `${pointCherche} = ${labelOrigine} + ${k}\\vec{${labelOrigine}${labelConnu}} = (${formatNombre(pointOrigine.x)} + ${k} \\times ${formatNombre(dx)} \\text{ ; } ${formatNombre(pointOrigine.y)} + ${k} \\times ${formatNombre(dy)}) = ${formatPointLatex(pointCherche, reponse)}`,
        ),
        texte("."),
      ],
    },
  ];
}

/** Correction de la sous-forme "combinaisonVecteurs" : E = A + c1·u + c2·v. */
function correctionRelationCombinaison(
  instance: Extract<ExercicePointVectoriel, { variante: "relationGenerale"; forme: "combinaisonVecteurs" }>,
): BlocCorrection[] {
  const { pointDepart, labelDepart, vecteurU, labelU, vecteurV, labelV, coefU, coefV, pointCherche, reponse } = instance;
  const c1 = formatNombre(coefU);
  const c2 = formatNombre(coefV);
  return [
    {
      type: "paragraphe",
      fragments: [
        latex(
          `${pointCherche} = ${labelDepart} + ${c1}\\vec{${labelU}} + ${c2}\\vec{${labelV}} = ` +
            `(${formatNombre(pointDepart.x)} + ${c1} \\times ${formatNombre(vecteurU.x)} + ${c2} \\times ${formatNombre(vecteurV.x)} \\text{ ; } ` +
            `${formatNombre(pointDepart.y)} + ${c1} \\times ${formatNombre(vecteurU.y)} + ${c2} \\times ${formatNombre(vecteurV.y)}) = ${formatPointLatex(pointCherche, reponse)}`,
        ),
        texte("."),
      ],
    },
  ];
}

function construireCorrectionPointVectoriel(instance: ExercicePointVectoriel): BlocCorrection[] {
  if (instance.variante === "translation") return correctionTranslation(instance);
  if (instance.variante === "milieu") return correctionMilieu(instance);
  if (instance.forme === "pointAPoint") return correctionRelationPointAPoint(instance);
  return correctionRelationCombinaison(instance);
}

export const adaptateurEvaluationPointVectoriel: AdaptateurFeuilleExercices<ExercicePointVectoriel> = {
  titreDocument: "Point à partir d'une relation vectorielle — Évaluation",
  nomFichierBase: "point-vectoriel",
  genererInstance: genererExercicePointVectoriel,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnoncePointVectoriel,
  construireCorrection: construireCorrectionPointVectoriel,
  // Consigne toujours dépendante de l'instance (label du point cherché, vecteur/coefficient tiré
  // interpolé dans la phrase elle-même) — jamais générique : voir le commentaire de tête.
};
