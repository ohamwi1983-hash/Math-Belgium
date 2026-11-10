import type { ExercicePointVectoriel } from "../../core/pointVectoriel.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { LIBELLE_CAS_ORIGINE, profilPointVectoriel } from "../profilsEvaluation4eCh6";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consignePointVectoriel,
  formatCoefficientLatex,
  formatDonneesConnuesLatex,
  formatFacteurLatex,
  formatNombreLatex,
  formatTermeLatex,
} from "../../ui/formatPointVectoriel";
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

/** Nombres à la virgule, valeurs exactes (audit chapitre 6, points 2 et 14 : l'ancien corrigé
 * écrivait « + -0.33 × 9 », un calcul faux et mal parenthésé). */
const formatNombre = formatNombreLatex;

function formatPointLatex(label: string, point: { x: number; y: number }): string {
  return `${label}(${formatNombre(point.x)} \\text{ ; } ${formatNombre(point.y)})`;
}

/** « a + b » avec b négatif entre parenthèses : « 3 + (−2) ». */
function somme(...termes: number[]): string {
  return termes.map((t, i) => (i === 0 ? formatNombre(t) : formatTermeLatex(t))).join(" + ");
}

function construireEnoncePointVectoriel(instance: ExercicePointVectoriel): SectionExercice {
  const consigne = consignePointVectoriel(instance);
  const fragmentsConsigne = [texte(consigne.avant), ...(consigne.latex ? [latex(consigne.latex)] : []), texte(consigne.apres)];

  return {
    enteteFragments: [texte("Données : "), latex(formatDonneesConnuesLatex(instance))],
    questions: [{ consigne: fragmentsConsigne }],
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
          `${pointCherche}(${somme(point.x, translation.x)} \\text{ ; } ${somme(point.y, translation.y)}) = ${formatPointLatex(pointCherche, reponse)}`,
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
            `\\left( \\dfrac{${somme(pointA.x, pointB.x)}}{2} \\text{ ; } \\dfrac{${somme(pointA.y, pointB.y)}}{2} \\right) = ${formatPointLatex(pointCherche, reponse)}`,
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
  const kRelation = formatCoefficientLatex(Math.abs(coefficient));
  const kFacteur = formatFacteurLatex(coefficient);
  return [
    {
      type: "paragraphe",
      fragments: [
        latex(`\\vec{${labelOrigine}${labelConnu}} = \\begin{pmatrix} ${formatNombre(dx)} \\\\ ${formatNombre(dy)} \\end{pmatrix}`),
        texte(", donc "),
        latex(
          `${pointCherche} = ${labelOrigine} ${coefficient < 0 ? "-" : "+"} ${kRelation}\\vec{${labelOrigine}${labelConnu}} = (${formatNombre(pointOrigine.x)} + ${kFacteur} \\times ${formatTermeLatex(dx)} \\text{ ; } ${formatNombre(pointOrigine.y)} + ${kFacteur} \\times ${formatTermeLatex(dy)}) = ${formatPointLatex(pointCherche, reponse)}`,
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
  const c1 = formatFacteurLatex(coefU);
  const c2 = formatFacteurLatex(coefV);
  const signeV = coefV < 0 ? "-" : "+";
  return [
    {
      type: "paragraphe",
      fragments: [
        latex(
          `${pointCherche} = ${labelDepart} ${coefU < 0 ? "-" : "+"} ${formatCoefficientLatex(Math.abs(coefU))}\\vec{${labelU}} ${signeV} ${formatCoefficientLatex(Math.abs(coefV))}\\vec{${labelV}} = ` +
            `(${formatNombre(pointDepart.x)} + ${c1} \\times ${formatTermeLatex(vecteurU.x)} + ${c2} \\times ${formatTermeLatex(vecteurV.x)} \\text{ ; } ` +
            `${formatNombre(pointDepart.y)} + ${c1} \\times ${formatTermeLatex(vecteurU.y)} + ${c2} \\times ${formatTermeLatex(vecteurV.y)}) = ${formatPointLatex(pointCherche, reponse)}`,
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

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Un seul écran : l'énoncé papier est celui de l'écran (données + consigne), sans place de réponse.
// Le corrigé détaille la relation utilisée, le calcul (les fonctions de correction ci-dessus) et
// la conclusion ; toutes les valeurs viennent de l'instance (`reponse`, calculée à la génération).

function enoncePapier(instance: ExercicePointVectoriel): EnoncePapier {
  const consigne = consignePointVectoriel(instance);
  return {
    section: {
      enteteFragments: [
        texte("On donne "),
        latex(formatDonneesConnuesLatex(instance)),
        texte(`. ${consigne.avant}`),
        ...(consigne.latex ? [latex(consigne.latex)] : []),
        texte(consigne.apres),
      ],
      questions: [],
    },
  };
}

function methode(instance: ExercicePointVectoriel): FragmentConsigne[] {
  if (instance.variante === "translation") {
    return [texte("L'image d'un point par une translation s'obtient en ajoutant les composantes du vecteur de translation aux coordonnées du point.")];
  }
  if (instance.variante === "milieu") {
    return [texte("Les coordonnées du milieu sont les moyennes des coordonnées des extrémités.")];
  }
  if (instance.forme === "pointAPoint") {
    return [
      texte("On calcule d'abord les composantes de "),
      latex(`\\vec{${instance.labelOrigine}${instance.labelConnu}}`),
      texte(", puis on part de "),
      latex(instance.labelOrigine),
      texte(" et on ajoute le vecteur "),
      latex(`${formatCoefficientLatex(instance.coefficient)}\\vec{${instance.labelOrigine}${instance.labelConnu}}`),
      texte("."),
    ];
  }
  return [
    texte("On part de "),
    latex(instance.labelDepart),
    texte(" et on ajoute, composante par composante, la combinaison des vecteurs "),
    latex(`\\vec{${instance.labelU}}`),
    texte(" et "),
    latex(`\\vec{${instance.labelV}}`),
    texte("."),
  ];
}

function piege(instance: ExercicePointVectoriel): FragmentConsigne[] {
  if (instance.variante === "translation") return [texte("On AJOUTE les composantes du vecteur aux coordonnées du point de départ ; une composante négative s'écrit entre parenthèses pour ne pas se tromper de signe.")];
  if (instance.variante === "milieu") return [texte("On divise la SOMME des coordonnées par 2, pas leur différence : la différence donnerait les composantes du vecteur, pas le milieu.")];
  if (instance.forme === "pointAPoint") {
    return [
      texte("Le vecteur multiplié part de "),
      latex(instance.labelOrigine),
      texte(" : il faut ajouter le résultat aux coordonnées de "),
      latex(instance.labelOrigine),
      texte(", pas à celles de "),
      latex(instance.labelConnu),
      texte("."),
    ];
  }
  return [texte("Chaque coefficient multiplie les DEUX composantes de son vecteur ; un coefficient négatif change le signe de chaque composante.")];
}

function reponseBreve(instance: ExercicePointVectoriel): FragmentConsigne[] {
  return [latex(formatPointLatex(instance.pointCherche, instance.reponse))];
}

function correctionDetaillee(instance: ExercicePointVectoriel): EtapeCorrection[] {
  const calcul = construireCorrectionPointVectoriel(instance).flatMap((b) => (b.type === "paragraphe" ? b.fragments : []));
  return [
    { label: "Méthode", sousQuestion: "a", fragments: methode(instance) },
    { label: "Calcul", sousQuestion: "a", fragments: calcul },
    { label: "Conclusion", sousQuestion: "a", fragments: reponseBreve(instance) },
    { label: "Piège", sousQuestion: "a", fragments: piege(instance) },
  ];
}

function bareme(instance: ExercicePointVectoriel): BaremeExercice {
  const libelleMethode: Record<string, string> = {
    translation: "Relation point de départ + vecteur de translation",
    milieu: "Formule du milieu (moyenne des coordonnées)",
    pointAPoint: "Composantes du vecteur connu, puis relation point de départ + multiple du vecteur",
    combinaisonVecteurs: "Relation point de départ + combinaison des vecteurs, composante par composante",
  };
  const cle = instance.variante === "relationGenerale" ? instance.forme : instance.variante;
  return {
    reponseFinale: reponseBreve(instance),
    criteres: [
      { sousQuestion: "a", critere: [texte(libelleMethode[cle])], points: 1 },
      { sousQuestion: "a", critere: [texte("Abscisse : "), latex(`x_{${instance.pointCherche}} = ${formatNombre(instance.reponse.x)}`)], points: 1.5 },
      { sousQuestion: "a", critere: [texte("Ordonnée : "), latex(`y_{${instance.pointCherche}} = ${formatNombre(instance.reponse.y)}`)], points: 1.5 },
    ],
    erreursFrequentes: [
      instance.variante === "milieu"
        ? { description: [texte("Différence des coordonnées au lieu de leur somme")], cout: "0 pt aux coordonnées" }
        : { description: [texte("Erreur de signe sur une composante négative (parenthèses oubliées)")], cout: "−1,5" },
      { description: [texte("Coordonnées inversées (abscisse et ordonnée échangées)")], cout: "−1" },
    ],
    reponsesAcceptees: [[texte("Coordonnées écrites en colonne ou sous la forme d'un couple")]],
  };
}

/** ★ translation ou milieu ; ★★ relation générale (coefficient, combinaison de deux vecteurs). */
function difficulte(instance: ExercicePointVectoriel): 1 | 2 | 3 {
  return instance.variante === "relationGenerale" ? 2 : 1;
}

export const adaptateurEvaluationPointVectoriel: AdaptateurFeuilleExercices<ExercicePointVectoriel> = {
  titreDocument: "Point à partir d'une relation vectorielle — Évaluation",
  nomFichierBase: "point-vectoriel",
  genererInstance: genererExercicePointVectoriel,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnoncePointVectoriel,
  construireCorrection: construireCorrectionPointVectoriel,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 3,
  profilInstance: profilPointVectoriel,
  libelleCasParticulier: LIBELLE_CAS_ORIGINE,
  // Consigne toujours dépendante de l'instance (label du point cherché, vecteur/coefficient tiré
  // interpolé dans la phrase elle-même) — jamais générique : voir le commentaire de tête.
};
