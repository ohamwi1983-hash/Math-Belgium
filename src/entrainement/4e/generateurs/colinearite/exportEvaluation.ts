import type {
  ExerciceColinearParametre,
  ExerciceColinearPoints,
  ExerciceColinearPointsParametre,
  ExerciceColinearVecteurs,
  ExerciceColinearite,
} from "../../core/colinearite.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { conclusionAttendue, critereReel } from "../../moteur/verificationColinearite";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  CONSIGNE_REDUCTION_AVEC_X,
  formatComposantesLatex,
  formatComposantesLinLatex,
  formatEnonceLatex,
  formatEquationReduiteLatex,
  formuleSubstitueeReductionLatex,
  formuleSubstitueeTestLatex,
} from "../../ui/formatColinearite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceColinearite } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceColinearite>` pour gen24 (Colinéarité et
 * alignement de points, chapitre "Calcul vectoriel", `AppColinearite.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Écran → question, par variante (`AppColinearite.tsx` dispatche sur `PhaseColinearite`, voir
 * `moteur/typesColinearite.ts` — chaque variante n'utilise QUE le sous-ensemble d'écrans listé ici) :
 * - "vecteurs" (V1, `ExerciceColinearVecteurs`) : UN seul écran "test"
 *   (`EtapeTestColinearite.tsx`) → UNE question papier : "Calcule le critère de colinéarité, puis
 *   conclus [...]" — le champ numérique (le critère `a·d-b·c`, jamais nommé "déterminant" à
 *   l'élève, voir `ui/formatColinearite.ts`) et la conclusion catégorielle (colinéaires/non)
 *   fusionnés en une seule consigne papier, la distinction champ numérique/bouton Oui-Non n'ayant
 *   pas d'équivalent papier séparé (même décision que `quelAngle/exportEvaluation.ts`, "Pas de
 *   solution" vs "Au moins une solution").
 * - "points" (V3, `ExerciceColinearPoints`) : DEUX écrans, "constructionVecteurs"
 *   (`EtapeConstructionVecteursColinearite.tsx`, composantes de AB/AC) puis "test"
 *   (`EtapeTestColinearite.tsx`, critère + DEUX conclusions catégorielles "colinéaires ?"/
 *   "alignés ?", même fait mathématique sous deux vocabulaires — `verificationColinearite.ts`,
 *   commentaire de tête) → DEUX questions papier a)/b), la seconde fusionnant les deux conclusions
 *   catégorielles en une seule question d'alignement (la question papier b) demande explicitement
 *   si A, B, C sont alignés ; le champ intermédiaire "colinéaires ?" de l'écran interactif n'ajoute
 *   rien de plus sur une feuille imprimée, où l'élève rédige déjà son raisonnement librement).
 * - "parametre" (V2, `ExerciceColinearParametre`) : DEUX écrans, "reduction"
 *   (`EtapeReductionColinearite.tsx`, équation réduite `αx+β=0`) puis "resolution"
 *   (`EtapeResolutionColinearite.tsx`, `x=`) → DEUX questions papier a)/b), consignes reprises mot
 *   pour mot de l'écran (`CONSIGNE_REDUCTION_AVEC_X`, "Résous cette équation.").
 * - "pointsParametre" (V4, `ExerciceColinearPointsParametre`) : TROIS écrans, "constructionAvecX"
 *   (`EtapeConstructionAvecXColinearite.tsx`, composantes de AB/AC — éventuellement en `x`),
 *   "reductionAvecX" (`EtapeReductionAvecXColinearite.tsx`) puis "resolutionAvecX"
 *   (`EtapeResolutionAvecXColinearite.tsx`) → TROIS questions papier a)/b)/c), même principe que
 *   "parametre" avec l'étape de construction en plus (miroir de "points" avec un paramètre `x`).
 *
 * PAS `regroupable` : les 4 variantes de ce générateur ont un nombre de questions STRUCTURELLEMENT
 * différent par instance (1 pour "vecteurs", 2 pour "points"/"parametre", 3 pour
 * "pointsParametre" — voir ci-dessus), alors que `AdaptateurFeuilleExercices.regroupable` exige
 * que l'adaptateur produise TOUJOURS UNE SEULE question par instance, quelle que soit la variante
 * tirée (voir `export/genererFeuilleExercices.ts`, condition 1). Même si la variante "vecteurs"
 * seule, seule à tenir sur une question à consigne générique (indépendante des valeurs tirées :
 * seuls les noms de vecteurs u/v et les données numériques varient dans `enteteFragments`, jamais
 * dans la consigne), rien ne permettrait à `/admin` de Math-Belgium de savoir laquelle des 4
 * variantes il regroupe avant de générer — le mécanisme est nécessairement tout-ou-rien pour un
 * adaptateur donné. Même décision, pour la même raison (variantes à nombre de questions
 * hétérogène), que `simplification/exportEvaluation.ts`.
 *
 * Aucune zone de réponse vierge multi-lignes n'est nécessaire au-delà de 2 lignes par question :
 * chaque question reste un calcul court (un critère numérique, une équation réduite, une valeur de
 * x, des composantes de vecteur) — jamais un développement long comme `analyseFonction`
 * (factorisation + tableau de signe) ou `simplification` (jusqu'à 9 écrans internes condensés en 3
 * questions).
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`exercice.critere`/`colineaires`/`alignes` pour "vecteurs"/"points", `coefX`/`coefConst`/
 * `solutionX` pour "parametre"/"pointsParametre"), jamais recalculée indépendamment — réutilise
 * directement les fonctions déjà utilisées côté écran interactif : `critereReel`/
 * `conclusionAttendue` (`moteur/verificationColinearite.ts`, déjà la lecture canonique du critère
 * et de la conclusion attendue) et `formuleSubstitueeTestLatex`/`formuleSubstitueeReductionLatex`/
 * `formatEquationReduiteLatex`/`formatEnonceLatex`/`formatComposantesLatex`/
 * `formatComposantesLinLatex` (`ui/formatColinearite.ts`, déjà les fonctions de présentation de
 * l'écran, génériques sur `ComposantesLin` — `coefX=0` pour les variantes sans x — donc partagées
 * sans duplication entre les 4 variantes). Jamais le mot "déterminant" dans un texte visible à
 * l'élève (hors programme de 4e, voir l'en-tête de `ui/formatColinearite.ts`), toujours "critère de
 * colinéarité".
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

// ============================================================================
// Variante "vecteurs" (V1) — 1 question.
// ============================================================================

function construireEnonceVecteurs(exercice: ExerciceColinearVecteurs): SectionExercice {
  return {
    enteteFragments: [texte("On donne les vecteurs :"), latex(formatEnonceLatex(exercice))],
    questions: [
      {
        consigne: [
          texte("Calcule le critère de colinéarité, puis conclus : les vecteurs "),
          latex(`\\vec{${exercice.v1Nom}}`),
          texte(" et "),
          latex(`\\vec{${exercice.v2Nom}}`),
          texte(" sont-ils colinéaires ?"),
        ],
        reponse: { type: "lignes", nombre: 2 },
      },
    ],
  };
}

function construireCorrectionVecteurs(exercice: ExerciceColinearVecteurs): BlocCorrection[] {
  const critere = critereReel(exercice);
  const colineaires = conclusionAttendue(exercice);

  const fragments: FragmentConsigne[] = [
    texte("Critère de colinéarité : "),
    latex(`${formuleSubstitueeTestLatex(exercice)} = ${formatNombre(critere)}`),
    texte(
      colineaires
        ? `. Le critère est nul, donc les vecteurs ${exercice.v1Nom} et ${exercice.v2Nom} sont colinéaires.`
        : `. Le critère est non nul, donc les vecteurs ${exercice.v1Nom} et ${exercice.v2Nom} ne sont pas colinéaires.`,
    ),
  ];

  return [{ type: "paragraphe", fragments }];
}

// ============================================================================
// Variante "points" (V3) — 2 questions.
// ============================================================================

function construireEnoncePoints(exercice: ExerciceColinearPoints): SectionExercice {
  const { labelA, labelB, labelC } = exercice;
  return {
    enteteFragments: [texte("On donne les points :"), latex(formatEnonceLatex(exercice))],
    questions: [
      {
        consigne: [
          texte("Calcule les composantes de "),
          latex(`\\vec{${labelA}${labelB}}`),
          texte(" et de "),
          latex(`\\vec{${labelA}${labelC}}`),
          texte("."),
        ],
        reponse: { type: "lignes", nombre: 2 },
      },
      {
        consigne: [
          texte("Calcule le critère de colinéarité, puis conclus : les points "),
          texte(`${labelA}, ${labelB} et ${labelC}`),
          texte(" sont-ils alignés ?"),
        ],
        reponse: { type: "lignes", nombre: 2 },
      },
    ],
  };
}

function construireCorrectionPoints(exercice: ExerciceColinearPoints): BlocCorrection[] {
  const { vecteurAB, vecteurAC, labelA, labelB, labelC } = exercice;
  const critere = critereReel(exercice);
  const alignes = conclusionAttendue(exercice);

  const fragmentsConstruction: FragmentConsigne[] = [
    texte("a) "),
    latex(`\\vec{${labelA}${labelB}} = ${formatComposantesLatex(vecteurAB)}`),
    texte(", "),
    latex(`\\vec{${labelA}${labelC}} = ${formatComposantesLatex(vecteurAC)}`),
    texte("."),
  ];

  const fragmentsTest: FragmentConsigne[] = [
    texte("b) Critère de colinéarité : "),
    latex(`${formuleSubstitueeTestLatex(exercice)} = ${formatNombre(critere)}`),
    texte(
      alignes
        ? `. Le critère est nul, donc les vecteurs ${labelA}${labelB} et ${labelA}${labelC} sont colinéaires : les points ${labelA}, ${labelB} et ${labelC} sont alignés.`
        : `. Le critère est non nul, donc les vecteurs ${labelA}${labelB} et ${labelA}${labelC} ne sont pas colinéaires : les points ${labelA}, ${labelB} et ${labelC} ne sont pas alignés.`,
    ),
  ];

  return [
    { type: "paragraphe", fragments: fragmentsConstruction },
    { type: "paragraphe", fragments: fragmentsTest },
  ];
}

// ============================================================================
// Variante "parametre" (V2) — 2 questions.
// ============================================================================

function construireEnonceParametre(exercice: ExerciceColinearParametre): SectionExercice {
  return {
    enteteFragments: [texte("On donne les vecteurs :"), latex(formatEnonceLatex(exercice))],
    questions: [
      { consigne: [texte(CONSIGNE_REDUCTION_AVEC_X)], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Résous cette équation.")], reponse: { type: "lignes", nombre: 2 } },
    ],
  };
}

function construireCorrectionParametre(exercice: ExerciceColinearParametre): BlocCorrection[] {
  const fragmentsReduction: FragmentConsigne[] = [
    texte("a) Relation de colinéarité : "),
    latex(`${formuleSubstitueeReductionLatex(exercice)} = 0`),
    texte(" soit "),
    latex(formatEquationReduiteLatex(exercice)),
    texte("."),
  ];

  const fragmentsResolution: FragmentConsigne[] = [texte("b) "), latex(`x = ${formatNombre(exercice.solutionX as number)}`), texte(".")];

  return [
    { type: "paragraphe", fragments: fragmentsReduction },
    { type: "paragraphe", fragments: fragmentsResolution },
  ];
}

// ============================================================================
// Variante "pointsParametre" (V4) — 3 questions.
// ============================================================================

function construireEnoncePointsParametre(exercice: ExerciceColinearPointsParametre): SectionExercice {
  const { labelA, labelB, labelC } = exercice;
  return {
    enteteFragments: [texte("On donne les points :"), latex(formatEnonceLatex(exercice))],
    questions: [
      {
        consigne: [
          texte("Calcule les composantes de "),
          latex(`\\vec{${labelA}${labelB}}`),
          texte(" et de "),
          latex(`\\vec{${labelA}${labelC}}`),
          texte(" (elles peuvent dépendre de "),
          latex("x"),
          texte(")."),
        ],
        reponse: { type: "lignes", nombre: 2 },
      },
      { consigne: [texte(CONSIGNE_REDUCTION_AVEC_X)], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Résous cette équation.")], reponse: { type: "lignes", nombre: 2 } },
    ],
  };
}

function construireCorrectionPointsParametre(exercice: ExerciceColinearPointsParametre): BlocCorrection[] {
  const { vecteurAB, vecteurAC, labelA, labelB, labelC } = exercice;

  const fragmentsConstruction: FragmentConsigne[] = [
    texte("a) "),
    latex(`\\vec{${labelA}${labelB}} = ${formatComposantesLinLatex(vecteurAB)}`),
    texte(", "),
    latex(`\\vec{${labelA}${labelC}} = ${formatComposantesLinLatex(vecteurAC)}`),
    texte("."),
  ];

  const fragmentsReduction: FragmentConsigne[] = [
    texte("b) Relation de colinéarité : "),
    latex(`${formuleSubstitueeReductionLatex(exercice)} = 0`),
    texte(" soit "),
    latex(formatEquationReduiteLatex(exercice)),
    texte("."),
  ];

  const fragmentsResolution: FragmentConsigne[] = [texte("c) "), latex(`x = ${formatNombre(exercice.solutionX as number)}`), texte(".")];

  return [
    { type: "paragraphe", fragments: fragmentsConstruction },
    { type: "paragraphe", fragments: fragmentsReduction },
    { type: "paragraphe", fragments: fragmentsResolution },
  ];
}

// ============================================================================
// Dispatch — un seul point d'entrée par le contrat `AdaptateurFeuilleExercices`.
// ============================================================================

function construireEnonceColinearite(instance: ExerciceColinearite): SectionExercice {
  if (instance.variante === "vecteurs") return construireEnonceVecteurs(instance);
  if (instance.variante === "points") return construireEnoncePoints(instance);
  if (instance.variante === "parametre") return construireEnonceParametre(instance);
  return construireEnoncePointsParametre(instance);
}

function construireCorrectionColinearite(instance: ExerciceColinearite): BlocCorrection[] {
  if (instance.variante === "vecteurs") return construireCorrectionVecteurs(instance);
  if (instance.variante === "points") return construireCorrectionPoints(instance);
  if (instance.variante === "parametre") return construireCorrectionParametre(instance);
  return construireCorrectionPointsParametre(instance);
}

export const adaptateurEvaluationColinearite: AdaptateurFeuilleExercices<ExerciceColinearite> = {
  titreDocument: "Colinéarité et alignement de points — Évaluation",
  nomFichierBase: "colinearite-alignement-points",
  genererInstance: genererExerciceColinearite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceColinearite,
  construireCorrection: construireCorrectionColinearite,
};
