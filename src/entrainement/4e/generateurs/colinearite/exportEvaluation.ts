import type {
  ExerciceColinearParametre,
  ExerciceColinearPoints,
  ExerciceColinearPointsParametre,
  ExerciceColinearVecteurs,
  ExerciceColinearite,
} from "../../core/colinearite.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { nombreFrLatex } from "../../ui/nombreFr";
import { profilColinearite } from "../profilsEvaluation4eCh6";
import { latex, texte } from "../../../export/fragmentsDocx";
import { conclusionAttendue, critereReel } from "../../moteur/verificationColinearite";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  CONSIGNE_REDUCTION_AVEC_X,
  formatComposantesLatex,
  formatComposantesLinLatex,
  formatComposantesLinMatriceLatex,
  formatComposantesMatriceLatex,
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
      },
      {
        consigne: [
          texte("Calcule le critère de colinéarité, puis conclus : les points "),
          texte(`${labelA}, ${labelB} et ${labelC}`),
          texte(" sont-ils alignés ?"),
        ],
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
      { consigne: [texte(CONSIGNE_REDUCTION_AVEC_X)] },
      { consigne: [texte("Résous cette équation.")] },
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
      },
      { consigne: [texte(CONSIGNE_REDUCTION_AVEC_X)] },
      { consigne: [texte("Résous cette équation.")] },
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

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les écrans (composantes, relation, résolution, test) sont des étapes d'APPRENTISSAGE : l'énoncé
// papier garde les données et la question globale (« sont-ils colinéaires ? », « sont-ils
// alignés ? », « pour quelle valeur de x… ? ») ; les écrans deviennent les étapes du corrigé.
// Colinéaires ou non / alignés ou non est un VERDICT : jamais un cas particulier du tirage.

function nomsVecteurs(e: { v1Nom: string; v2Nom: string }): FragmentConsigne[] {
  return [latex(`\\vec{${e.v1Nom}}`), texte(" et "), latex(`\\vec{${e.v2Nom}}`)];
}

function enoncePapier(instance: ExerciceColinearite): EnoncePapier {
  const donnees = latex(formatEnonceLatex(instance));
  if (instance.variante === "vecteurs") {
    return { section: { enteteFragments: [texte("On donne les vecteurs "), donnees, texte(". Les vecteurs "), ...nomsVecteurs(instance), texte(" sont-ils colinéaires ? Justifie par un calcul.")], questions: [] } };
  }
  if (instance.variante === "parametre") {
    return { section: { enteteFragments: [texte("On donne les vecteurs "), donnees, texte(". Détermine la valeur du réel "), latex("x"), texte(" pour laquelle "), ...nomsVecteurs(instance), texte(" sont colinéaires.")], questions: [] } };
  }
  const { labelA, labelB, labelC } = instance;
  if (instance.variante === "points") {
    return { section: { enteteFragments: [texte("On donne les points "), donnees, texte(`. Les points ${labelA}, ${labelB} et ${labelC} sont-ils alignés ? Justifie par un calcul.`)], questions: [] } };
  }
  return { section: { enteteFragments: [texte("On donne les points "), donnees, texte(". Détermine la valeur du réel "), latex("x"), texte(` pour laquelle les points ${labelA}, ${labelB} et ${labelC} sont alignés.`)], questions: [] } };
}

function verdict(instance: ExerciceColinearVecteurs | ExerciceColinearPoints): string {
  const oui = conclusionAttendue(instance);
  if (instance.variante === "vecteurs") return oui ? `Les vecteurs ${instance.v1Nom} et ${instance.v2Nom} sont colinéaires.` : `Les vecteurs ${instance.v1Nom} et ${instance.v2Nom} ne sont pas colinéaires.`;
  return oui ? `Les points ${instance.labelA}, ${instance.labelB} et ${instance.labelC} sont alignés.` : `Les points ${instance.labelA}, ${instance.labelB} et ${instance.labelC} ne sont pas alignés.`;
}

function reponseBreve(instance: ExerciceColinearite): FragmentConsigne[] {
  if (instance.variante === "vecteurs" || instance.variante === "points") {
    return [texte("Critère : "), latex(nombreFrLatex(critereReel(instance))), texte(` ; ${verdict(instance)}`)];
  }
  return [latex(`x = ${nombreFrLatex(instance.solutionX as number)}`)];
}

const METHODE_CRITERE: FragmentConsigne[] = [
  texte("Deux vecteurs sont colinéaires si et seulement si "),
  latex("x_{\\vec u}\\cdot y_{\\vec v} - y_{\\vec u}\\cdot x_{\\vec v} = 0"),
  texte("."),
];

function correctionDetaillee(instance: ExerciceColinearite): EtapeCorrection[] {
  if (instance.variante === "vecteurs") {
    const c = critereReel(instance);
    return [
      { label: "Méthode", sousQuestion: "a", fragments: METHODE_CRITERE },
      { label: "Calcul", sousQuestion: "a", fragments: [latex(`${formuleSubstitueeTestLatex(instance)} = ${nombreFrLatex(c)}`)] },
      { label: "Conclusion", sousQuestion: "a", fragments: [texte(`Le critère ${c === 0 ? "est nul" : "n'est pas nul"} : ${verdict(instance)}`)] },
      { label: "Piège", sousQuestion: "a", fragments: [texte("Respecter l'ordre des produits en croix et mettre chaque composante négative entre parenthèses : une seule erreur de signe change le verdict.")] },
    ];
  }
  if (instance.variante === "points") {
    const { labelA, labelB, labelC, vecteurAB, vecteurAC } = instance;
    const c = critereReel(instance);
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte(`${labelA}, ${labelB} et ${labelC} sont alignés si et seulement si les vecteurs `), latex(`\\vec{${labelA}${labelB}}`), texte(" et "), latex(`\\vec{${labelA}${labelC}}`), texte(", de même origine, sont colinéaires.")] },
      { label: "Calcul", sousQuestion: "a", fragments: [latex(`\\vec{${labelA}${labelB}} = ${formatComposantesMatriceLatex(vecteurAB)}`), texte(" et "), latex(`\\vec{${labelA}${labelC}} = ${formatComposantesMatriceLatex(vecteurAC)}`)] },
      { label: "Calcul", sousQuestion: "b", fragments: [latex(`${formuleSubstitueeTestLatex(instance)} = ${nombreFrLatex(c)}`)] },
      { label: "Conclusion", sousQuestion: "b", fragments: [texte(`Le critère ${c === 0 ? "est nul : les vecteurs sont colinéaires" : "n'est pas nul : les vecteurs ne sont pas colinéaires"}. ${verdict(instance)}`)] },
      { label: "Piège", sousQuestion: "a", fragments: [texte("Les deux vecteurs doivent avoir la même origine : la colinéarité de deux vecteurs sans point commun ne prouve pas l'alignement (droites parallèles).")] },
    ];
  }
  if (instance.variante === "parametre") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: METHODE_CRITERE },
      { label: "Relation", sousQuestion: "a", fragments: [latex(`${formuleSubstitueeReductionLatex(instance)} = 0`)] },
      { label: "Réduction", sousQuestion: "a", fragments: [latex(formatEquationReduiteLatex(instance))] },
      { label: "Résolution", sousQuestion: "b", fragments: [latex(`x = ${nombreFrLatex(instance.solutionX as number)}`)] },
      { label: "Piège", sousQuestion: "a", fragments: [texte("Développer chaque produit avant de réduire, et distribuer le signe « − » sur tout le second produit.")] },
    ];
  }
  const { labelA, labelB, labelC, vecteurAB, vecteurAC } = instance;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte(`${labelA}, ${labelB} et ${labelC} sont alignés si et seulement si `), latex(`\\vec{${labelA}${labelB}}`), texte(" et "), latex(`\\vec{${labelA}${labelC}}`), texte(" sont colinéaires.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`\\vec{${labelA}${labelB}} = ${formatComposantesLinMatriceLatex(vecteurAB)}`), texte(" et "), latex(`\\vec{${labelA}${labelC}} = ${formatComposantesLinMatriceLatex(vecteurAC)}`)] },
    { label: "Relation", sousQuestion: "b", fragments: [latex(`${formuleSubstitueeReductionLatex(instance)} = 0`)] },
    { label: "Réduction", sousQuestion: "b", fragments: [latex(formatEquationReduiteLatex(instance))] },
    { label: "Résolution", sousQuestion: "c", fragments: [latex(`x = ${nombreFrLatex(instance.solutionX as number)}`)] },
    { label: "Piège", sousQuestion: "a", fragments: [texte("Une composante qui contient x se calcule comme les autres (extrémité moins origine) : garder x dans l'expression, sans le remplacer par une valeur.")] },
  ];
}

function bareme(instance: ExerciceColinearite): BaremeExercice {
  const erreurSigne = { description: [texte("Erreur de signe dans les produits en croix")], cout: "−1" };
  if (instance.variante === "vecteurs") {
    return {
      reponseFinale: reponseBreve(instance),
      criteres: [
        { sousQuestion: "a", critere: [texte("Critère substitué : "), latex(formuleSubstitueeTestLatex(instance))], points: 1.5 },
        { sousQuestion: "a", critere: [texte("Valeur du critère : "), latex(nombreFrLatex(critereReel(instance)))], points: 1 },
        { sousQuestion: "a", critere: [texte("Conclusion justifiée par le critère")], points: 1.5 },
      ],
      erreursFrequentes: [erreurSigne, { description: [texte("Conclusion sans calcul")], cout: "0 pt" }],
      reponsesAcceptees: [[texte("Justification par un coefficient k tel que l'un des vecteurs est k fois l'autre (ou l'absence d'un tel k)")]],
    };
  }
  if (instance.variante === "points") {
    return {
      reponseFinale: reponseBreve(instance),
      criteres: [
        { sousQuestion: "a", critere: [texte("Composantes de deux vecteurs de même origine")], points: 1.5 },
        { sousQuestion: "b", critere: [texte("Valeur du critère : "), latex(nombreFrLatex(critereReel(instance)))], points: 1.5 },
        { sousQuestion: "b", critere: [texte("Conclusion sur l'alignement, justifiée")], points: 1 },
      ],
      erreursFrequentes: [erreurSigne, { description: [texte("Vecteurs sans origine commune (par exemple AB et CA mal orienté, ou AB et CD)")], cout: "−1,5" }],
      reponsesAcceptees: [[texte("Tout couple de vecteurs de même origine parmi les trois points (BA et BC, CA et CB…)")]],
    };
  }
  if (instance.variante === "parametre") {
    return {
      reponseFinale: reponseBreve(instance),
      criteres: [
        { sousQuestion: "a", critere: [texte("Relation de colinéarité écrite avec x")], points: 1.5 },
        { sousQuestion: "a", critere: [texte("Équation réduite : "), latex(formatEquationReduiteLatex(instance))], points: 1 },
        { sousQuestion: "b", critere: [texte("Solution : "), latex(`x = ${nombreFrLatex(instance.solutionX as number)}`)], points: 1.5 },
      ],
      erreursFrequentes: [erreurSigne, { description: [texte("Signe « − » non distribué sur le second produit")], cout: "−1" }],
      reponsesAcceptees: [[texte("Vérification de la valeur trouvée par le critère (facultative)")]],
    };
  }
  return {
    reponseFinale: reponseBreve(instance),
    criteres: [
      { sousQuestion: "a", critere: [texte("Composantes des deux vecteurs (en fonction de x)")], points: 1 },
      { sousQuestion: "b", critere: [texte("Relation de colinéarité écrite avec x")], points: 1 },
      { sousQuestion: "b", critere: [texte("Équation réduite : "), latex(formatEquationReduiteLatex(instance))], points: 1 },
      { sousQuestion: "c", critere: [texte("Solution : "), latex(`x = ${nombreFrLatex(instance.solutionX as number)}`)], points: 1 },
    ],
    erreursFrequentes: [erreurSigne, { description: [texte("Composante en x calculée « origine moins extrémité »")], cout: "−1" }],
    reponsesAcceptees: [[texte("Tout couple de vecteurs de même origine parmi les trois points")]],
  };
}

/** ★ deux vecteurs ; ★★ trois points ou paramètre ; ★★★ trois points avec paramètre. */
function difficulte(instance: ExerciceColinearite): 1 | 2 | 3 {
  if (instance.variante === "vecteurs") return 1;
  return instance.variante === "pointsParametre" ? 3 : 2;
}

export const adaptateurEvaluationColinearite: AdaptateurFeuilleExercices<ExerciceColinearite> = {
  titreDocument: "Colinéarité et alignement de points — Évaluation",
  nomFichierBase: "colinearite-alignement-points",
  genererInstance: genererExerciceColinearite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceColinearite,
  construireCorrection: construireCorrectionColinearite,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 4,
  profilInstance: profilColinearite,
};
