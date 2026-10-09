import type {
  ClassificationTriangleIsocele,
  ExerciceDistance,
  ExerciceIsocele,
  ExerciceNormeDistance,
  ExerciceNormeVecteur,
  ExerciceParametreNorme,
  ExercicePythagore,
  VarianteNormeDistance,
} from "../../core/normeDistance.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  CONSIGNE_GENERALE_DISTANCE,
  CONSIGNE_GENERALE_ISOCELE,
  CONSIGNE_GENERALE_PYTHAGORE,
  formatAideNormeABNiveau2Latex,
  formatAideNormeSubstitueeParametreLatex,
  formatAideVecteurABNiveau2Latex,
  formatDiscriminantLatex,
  formatEnonceDistanceLatex,
  formatEnonceIsoceleLatex,
  formatEnonceParametreLatex,
  formatEnoncePythagoreLatex,
  formatEnonceVecteurLatex,
  formatEquationReduiteParametreNormeLatex,
  formatEtatActuelLongueursPythagoreLatex,
  formatEtatActuelVecteursPythagoreLatex,
  formatEtatActuelVecteursTriangleLatex,
  formatLabelNormeVecteurLatex,
  formatSolutionsAttenduesTexte,
  formatVecteurLatex,
  formuleSubstitueeNormeLatex,
  segmentsConsigneParametre,
  segmentsConsigneVecteur,
} from "../../ui/formatNormeDistance";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceNormeDistance } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceNormeDistance>` pour gen26 (Norme d'un vecteur et
 * distance entre 2 points, chapitre "Calcul vectoriel", `AppNormeDistance.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Écran → question, VARIANTE PAR VARIANTE (voir `moteur/typesNormeDistance.ts::SEQUENCES` pour la
 * séquence d'écrans exacte de chaque variante — reproduite ici 1 question papier par écran, jamais
 * un collapse en une seule question globale, contrairement à `quelAngle`/`gen18`) :
 * - `vecteur` (1 écran `normeVecteur`) → 1 question : "Calcule la norme du vecteur u⃗" (consigne
 *   reprise de `segmentsConsigneVecteur`, mot pour mot celle de l'écran).
 * - `distance` (2 écrans `constructionDistance`→`calculDistance`) → 2 questions : a) construire
 *   AB⃗ à partir de A et B, b) calculer la distance AB (`CONSIGNE_GENERALE_DISTANCE`, reprise mot
 *   pour mot de l'écran 2).
 * - `isocele` (3 écrans `constructionIsocele`→`calculIsocele`→`conclusionIsocele`) → 3 questions :
 *   a) construire AB⃗/AC⃗/BC⃗, b) calculer les 3 longueurs, c) conclure sur la nature du triangle
 *   (`CONSIGNE_GENERALE_ISOCELE`).
 * - `parametre` (2 écrans `reductionParametreNorme`→`resolutionParametreNorme`) → 2 questions :
 *   a) développer/réduire l'équation à la forme ax²+bx+c=0 (texte repris mot pour mot de
 *   `EtapeReductionParametreNorme.tsx`), b) résoudre pour x (`segmentsConsigneParametre`, la
 *   consigne "réelle" de la variante, dynamique — dépend de `exercice.cible`).
 * - `pythagore` (3 écrans `constructionPythagore`→`calculPythagore`→`testPythagore`) → 3 questions :
 *   a) construire les 3 vecteurs, b) calculer les 3 longueurs (racine possiblement irrationnelle,
 *   contrairement à `isocele`), c) déterminer si/où le triangle est rectangle
 *   (`CONSIGNE_GENERALE_PYTHAGORE`).
 *
 * **Décision `regroupable` : `false` (absent), et ce pour DEUX raisons indépendantes, chacune
 * suffisante à elle seule** (voir `export/genererFeuilleExercices.ts` pour les 3 conditions
 * exactes du contrat) :
 * 1. La variante `parametre` n'a PAS de consigne générique : `segmentsConsigneParametre` (la
 *    consigne de sa question b, la question "réelle" de cette variante) interpole
 *    `exercice.cible` ("... soit de longueur {cible} ?") — elle varie donc avec les valeurs
 *    tirées, condition (2) de `regroupable` violée pour cette seule variante, ce qui suffit à
 *    disqualifier tout l'adaptateur (`regroupable` est une propriété de l'ADAPTATEUR entier, pas
 *    sélective par variante — `/admin` de Math-Belgium n'a aucun moyen de le brancher au cas par
 *    cas).
 * 2. Même en ignorant `parametre` : les 4 autres variantes ont chacune une consigne générique
 *    (`segmentsConsigneVecteur`/`CONSIGNE_GENERALE_DISTANCE`/`CONSIGNE_GENERALE_ISOCELE`/
 *    `CONSIGNE_GENERALE_PYTHAGORE`), mais QUATRE consignes DIFFÉRENTES selon la variante — le
 *    mécanisme `regroupable` affiche la consigne UNE SEULE FOIS pour tout le lot regroupé
 *    (`AppEvaluation6e.tsx::construireItemsExercice`), ce qui suppose UNE consigne commune à
 *    TOUTES les instances regroupées, y compris entre variantes différentes. Un admin demandant
 *    « 2 exercices `vecteur` + 2 `isocele` » verrait donc les 4 instances imprimées sous une seule
 *    consigne fausse pour au moins 2 d'entre elles — inacceptable.
 * 3. La condition (1) de `regroupable` (« toujours UNE seule question par instance ») est de toute façon
 *    déjà violée par construction ci-dessus : `distance`/`parametre` ont 2 questions, `isocele`/
 *    `pythagore` en ont 3 — seule `vecteur` en a 1. Choisir de tout collapser en 1 question par
 *    variante (comme `quelAngle`) aurait pu lever CE point précis, mais pas les points 1 et 2
 *    ci-dessus, qui restent rédhibitoires indépendamment — la décision de conserver le détail
 *    écran-par-écran (plutôt qu'un collapse façon `quelAngle`) est donc prise ici SANS coût
 *    supplémentaire en `regroupable`, et préserve la progressivité pédagogique (voir
 *    `simplification/exportEvaluation.ts`, même choix de consolidation multi-écrans en questions
 *    papier distinctes plutôt qu'un unique champ final, pour une raison analogue : consigne NON
 *    générique sur au moins une de ses variantes).
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur TOUTES les
 * questions, même décision documentée que `quelAngle/exportEvaluation.ts` et
 * `comparaisonSeries/exportEvaluation.ts`) : les réponses attendues (composantes de vecteur,
 * longueurs, nature d'un triangle, valeurs de x) sont de courts calculs/valeurs, jamais un
 * développement long à dérouler sur une page — l'élève travaille sur une feuille à part.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de chaque instance tirée,
 * jamais recalculée indépendamment ici, et réutilise systématiquement les fonctions de formatage
 * déjà utilisées côté écran interactif (`ui/formatNormeDistance.ts`) : `formatAideVecteurABNiveau2Latex`/
 * `formatAideNormeABNiveau2Latex`/`formatAideNormeSubstitueeParametreLatex` sont déjà les formules
 * "substituées, non résolues" affichées comme aide de niveau 2 à l'écran — reprises ici comme
 * amorce de calcul avant de donner le résultat ; `formatEtatActuelVecteursTriangleLatex`/
 * `formatEtatActuelVecteursPythagoreLatex`/`formatEtatActuelLongueursPythagoreLatex` sont déjà les
 * blocs "état actuel" (valeurs confirmées de l'écran précédent) réutilisés tels quels comme résultat
 * final. Seules deux petites fonctions locales sont écrites de zéro ci-dessous, faute d'équivalent
 * exporté par `ui/formatNormeDistance.ts` :
 * - `libelleClassificationIsocele` : `ui/formatNormeDistance.ts` n'expose que la mécanique de
 *   sélection (nature+sommet → classification, `composerClassificationIsocele`), jamais la phrase
 *   française inverse (classification → texte de conclusion), qui n'existe nulle part côté écran
 *   (l'écran affiche juste un badge ✓/✗ sur le bouton choisi, aucune phrase à récupérer).
 * - `formatRelationsPythagoreResolueLatex` : variante RÉSOLUE de `formatRelationsPythagoreNiveau2Latex`
 *   (déjà exportée, mais volontairement laissée avec des "?" non résolus — c'est une aide où
 *   l'élève doit lui-même trancher). Ici, à l'inverse, il faut la version tranchée avec "="/"≠" et
 *   la conclusion, incluant le cas `sommetRectangle === null` (~50 % des tirages `pythagore`,
 *   triangle non rectangle) : la correction papier énonce alors explicitement "PAS rectangle" — un
 *   cas mathématiquement valide, contrairement à l'écran interactif (`core/normeDistance.types.ts`,
 *   doc de tête d'`ExercicePythagore` : gap connu et assumé, l'écran ne propose que 3 boutons A/B/C
 *   sans option "pas rectangle").
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

// ============================================================================
// Variante 1 — norme d'un vecteur donné
// ============================================================================

function construireEnonceVecteur(exercice: ExerciceNormeVecteur): SectionExercice {
  return {
    enteteFragments: [latex(formatEnonceVecteurLatex(exercice))],
    questions: [{ consigne: segmentsConsigneVecteur(exercice), reponse: { type: "lignes", nombre: 0 } }],
  };
}

function construireCorrectionVecteur(exercice: ExerciceNormeVecteur): BlocCorrection[] {
  return [
    {
      type: "paragraphe",
      fragments: [latex(`${formatLabelNormeVecteurLatex(exercice)} ${formuleSubstitueeNormeLatex(exercice.v)} = ${formatNombre(exercice.norme)}`)],
      bloc: true,
    },
  ];
}

// ============================================================================
// Variante 2 — distance entre 2 points
// ============================================================================

function construireEnonceDistance(exercice: ExerciceDistance): SectionExercice {
  const { labelA, labelB } = exercice;
  return {
    enteteFragments: [latex(formatEnonceDistanceLatex(exercice))],
    questions: [
      {
        consigne: [texte("Détermine les composantes du vecteur "), latex(`\\vec{${labelA}${labelB}}`), texte(".")],
        reponse: { type: "lignes", nombre: 0 },
      },
      { consigne: [texte(CONSIGNE_GENERALE_DISTANCE)], reponse: { type: "lignes", nombre: 0 } },
    ],
  };
}

function construireCorrectionDistance(exercice: ExerciceDistance): BlocCorrection[] {
  const { labelA, pointA, labelB, pointB, vecteurAB, distance } = exercice;
  return [
    {
      type: "paragraphe",
      fragments: [
        texte("a) "),
        latex(formatAideVecteurABNiveau2Latex(labelA, pointA, labelB, pointB)),
        texte(" — donc "),
        latex(formatVecteurLatex(`${labelA}${labelB}`, vecteurAB)),
        texte("."),
      ],
    },
    {
      type: "paragraphe",
      fragments: [texte("b) "), latex(`${formatAideNormeABNiveau2Latex(labelA, labelB, vecteurAB)} = ${formatNombre(distance)}`)],
    },
  ];
}

// ============================================================================
// Variante 4 — triangle isocèle/scalène
// ============================================================================

/**
 * Phrase de conclusion française — aucun équivalent côté écran (`EtapeConclusionIsocele.tsx`
 * n'affiche qu'un badge ✓/✗ sur le bouton choisi, jamais de phrase récapitulative). `isoceleA` :
 * les 2 côtés qui se rejoignent en A (AB et AC) sont égaux ; `isoceleB` : AB et BC ; `isoceleC` :
 * AC et BC — même correspondance que `classifierTriangleIsocele` (`generateurs/normeDistance/index.ts`).
 */
function libelleClassificationIsocele(
  classification: ClassificationTriangleIsocele,
  labelA: string,
  labelB: string,
  labelC: string,
  longueurAB: number,
  longueurAC: number,
  longueurBC: number,
): string {
  if (classification === "isoceleA") {
    return `Le triangle est isocèle en ${labelA} : ${labelA}${labelB} = ${labelA}${labelC} = ${formatNombre(longueurAB)}.`;
  }
  if (classification === "isoceleB") {
    return `Le triangle est isocèle en ${labelB} : ${labelA}${labelB} = ${labelB}${labelC} = ${formatNombre(longueurAB)}.`;
  }
  if (classification === "isoceleC") {
    return `Le triangle est isocèle en ${labelC} : ${labelA}${labelC} = ${labelB}${labelC} = ${formatNombre(longueurAC)}.`;
  }
  return `Le triangle est scalène : ses 3 côtés (${formatNombre(longueurAB)}, ${formatNombre(longueurAC)}, ${formatNombre(longueurBC)}) sont de longueurs deux à deux différentes.`;
}

function construireEnonceIsocele(exercice: ExerciceIsocele): SectionExercice {
  const { labelA, labelB, labelC } = exercice;
  return {
    enteteFragments: [latex(formatEnonceIsoceleLatex(exercice))],
    questions: [
      {
        consigne: [
          texte("Détermine les composantes des vecteurs "),
          latex(`\\vec{${labelA}${labelB}}`),
          texte(", "),
          latex(`\\vec{${labelA}${labelC}}`),
          texte(" et "),
          latex(`\\vec{${labelB}${labelC}}`),
          texte("."),
        ],
        reponse: { type: "lignes", nombre: 0 },
      },
      {
        consigne: [
          texte("Calcule les longueurs "),
          latex(`\\|\\vec{${labelA}${labelB}}\\|`),
          texte(", "),
          latex(`\\|\\vec{${labelA}${labelC}}\\|`),
          texte(" et "),
          latex(`\\|\\vec{${labelB}${labelC}}\\|`),
          texte("."),
        ],
        reponse: { type: "lignes", nombre: 0 },
      },
      { consigne: [texte(CONSIGNE_GENERALE_ISOCELE)], reponse: { type: "lignes", nombre: 0 } },
    ],
  };
}

function construireCorrectionIsocele(exercice: ExerciceIsocele): BlocCorrection[] {
  const { labelA, pointA, labelB, pointB, labelC, pointC, vecteurAB, vecteurAC, vecteurBC, longueurAB, longueurAC, longueurBC, classification } = exercice;

  const vecteursSubstitues = `\\begin{gathered} ${formatAideVecteurABNiveau2Latex(labelA, pointA, labelB, pointB)} \\\\ ${formatAideVecteurABNiveau2Latex(
    labelA,
    pointA,
    labelC,
    pointC,
  )} \\\\ ${formatAideVecteurABNiveau2Latex(labelB, pointB, labelC, pointC)} \\end{gathered}`;

  const longueursSubstituees = `\\begin{gathered} \\|\\vec{${labelA}${labelB}}\\| = ${formuleSubstitueeNormeLatex(vecteurAB)} = ${formatNombre(
    longueurAB,
  )} \\\\ \\|\\vec{${labelA}${labelC}}\\| = ${formuleSubstitueeNormeLatex(vecteurAC)} = ${formatNombre(
    longueurAC,
  )} \\\\ \\|\\vec{${labelB}${labelC}}\\| = ${formuleSubstitueeNormeLatex(vecteurBC)} = ${formatNombre(longueurBC)} \\end{gathered}`;

  return [
    {
      type: "paragraphe",
      fragments: [
        texte("a) "),
        latex(vecteursSubstitues),
        texte(" — donc "),
        latex(formatEtatActuelVecteursTriangleLatex(labelA, labelB, labelC, vecteurAB, vecteurAC, vecteurBC)),
      ],
      bloc: true,
    },
    { type: "paragraphe", fragments: [texte("b) "), latex(longueursSubstituees)], bloc: true },
    {
      type: "paragraphe",
      fragments: [texte("c) "), texte(libelleClassificationIsocele(classification, labelA, labelB, labelC, longueurAB, longueurAC, longueurBC))],
    },
  ];
}

// ============================================================================
// Variante 5 — déterminer x pour une norme cible
// ============================================================================

function construireEnonceParametre(exercice: ExerciceParametreNorme): SectionExercice {
  return {
    enteteFragments: [latex(formatEnonceParametreLatex(exercice))],
    questions: [
      {
        consigne: [texte("Développe et réduis cette équation sous la forme "), latex("ax^2+bx+c=0"), texte(".")],
        reponse: { type: "lignes", nombre: 0 },
      },
      { consigne: segmentsConsigneParametre(exercice), reponse: { type: "lignes", nombre: 0 } },
    ],
  };
}

function construireCorrectionParametre(exercice: ExerciceParametreNorme): BlocCorrection[] {
  return [
    {
      type: "paragraphe",
      fragments: [
        texte("a) "),
        latex(formatAideNormeSubstitueeParametreLatex(exercice)),
        texte(" — après développement et réduction : "),
        latex(formatEquationReduiteParametreNormeLatex(exercice)),
      ],
    },
    {
      type: "paragraphe",
      fragments: [texte("b) "), latex(formatDiscriminantLatex(exercice)), texte(` — ${formatSolutionsAttenduesTexte(exercice)}.`)],
    },
  ];
}

// ============================================================================
// Variante 6 — Pythagore, méthode alternative
// ============================================================================

/**
 * Version RÉSOLUE (="/"≠", jamais "?") de `formatRelationsPythagoreNiveau2Latex` (`ui/formatNormeDistance.ts`,
 * laissée volontairement non résolue côté écran) — nécessaire ici, une correction papier devant
 * trancher explicitement chaque relation plutôt que laisser l'élève le faire.
 */
function formatRelationsPythagoreResolueLatex(exercice: ExercicePythagore): string {
  const { labelA: a, labelB: b, labelC: c, carreAB, carreAC, carreBC } = exercice;
  const relation = (gauche: number, droite: number) => (gauche === droite ? "=" : "\\neq");
  return `\\begin{gathered} \\text{Rectangle en ${a}} : ${carreBC} ${relation(carreBC, carreAB + carreAC)} ${carreAB}+${carreAC} \\\\ \\text{Rectangle en ${b}} : ${carreAC} ${relation(
    carreAC,
    carreAB + carreBC,
  )} ${carreAB}+${carreBC} \\\\ \\text{Rectangle en ${c}} : ${carreAB} ${relation(carreAB, carreAC + carreBC)} ${carreAC}+${carreBC} \\end{gathered}`;
}

function construireEnoncePythagore(exercice: ExercicePythagore): SectionExercice {
  const { labelA, labelB, labelC } = exercice;
  return {
    enteteFragments: [latex(formatEnoncePythagoreLatex(exercice))],
    questions: [
      {
        consigne: [
          texte("Détermine les composantes des vecteurs "),
          latex(`\\vec{${labelA}${labelB}}`),
          texte(", "),
          latex(`\\vec{${labelA}${labelC}}`),
          texte(" et "),
          latex(`\\vec{${labelB}${labelC}}`),
          texte("."),
        ],
        reponse: { type: "lignes", nombre: 0 },
      },
      {
        consigne: [texte("Calcule la longueur des 3 côtés du triangle (forme exacte ou décimale arrondie au centième).")],
        reponse: { type: "lignes", nombre: 0 },
      },
      { consigne: [texte(CONSIGNE_GENERALE_PYTHAGORE)], reponse: { type: "lignes", nombre: 0 } },
    ],
  };
}

function construireCorrectionPythagore(exercice: ExercicePythagore): BlocCorrection[] {
  const { labelA, pointA, labelB, pointB, labelC, pointC, sommetRectangle } = exercice;

  const vecteursSubstitues = `\\begin{gathered} ${formatAideVecteurABNiveau2Latex(labelA, pointA, labelB, pointB)} \\\\ ${formatAideVecteurABNiveau2Latex(
    labelA,
    pointA,
    labelC,
    pointC,
  )} \\\\ ${formatAideVecteurABNiveau2Latex(labelB, pointB, labelC, pointC)} \\end{gathered}`;

  // `sommetRectangle === null` : ~50 % des tirages (`construirePythagore`, `doitEtreRectangle`
  // tiré à pile ou face) — cas mathématiquement valide, énoncé explicitement ici (contrairement à
  // l'écran interactif, limité à 3 boutons A/B/C, voir doc de tête du fichier).
  const conclusionTexte =
    sommetRectangle !== null
      ? ` — le triangle est rectangle en ${sommetRectangle === "A" ? labelA : sommetRectangle === "B" ? labelB : labelC}.`
      : " — aucune des 3 égalités n'est vérifiée : ce triangle n'est PAS rectangle.";

  return [
    {
      type: "paragraphe",
      fragments: [texte("a) "), latex(vecteursSubstitues), texte(" — donc "), latex(formatEtatActuelVecteursPythagoreLatex(exercice))],
      bloc: true,
    },
    { type: "paragraphe", fragments: [texte("b) "), latex(formatEtatActuelLongueursPythagoreLatex(exercice))], bloc: true },
    {
      type: "paragraphe",
      fragments: [texte("c) "), latex(formatRelationsPythagoreResolueLatex(exercice)), texte(conclusionTexte)],
      bloc: true,
    },
  ];
}

// ============================================================================
// Dispatch et adaptateur
// ============================================================================

function construireEnonceNormeDistance(instance: ExerciceNormeDistance): SectionExercice {
  if (instance.variante === "vecteur") return construireEnonceVecteur(instance);
  if (instance.variante === "distance") return construireEnonceDistance(instance);
  if (instance.variante === "isocele") return construireEnonceIsocele(instance);
  if (instance.variante === "parametre") return construireEnonceParametre(instance);
  return construireEnoncePythagore(instance);
}

function construireCorrectionNormeDistance(instance: ExerciceNormeDistance): BlocCorrection[] {
  if (instance.variante === "vecteur") return construireCorrectionVecteur(instance);
  if (instance.variante === "distance") return construireCorrectionDistance(instance);
  if (instance.variante === "isocele") return construireCorrectionIsocele(instance);
  if (instance.variante === "parametre") return construireCorrectionParametre(instance);
  return construireCorrectionPythagore(instance);
}

export const adaptateurEvaluationNormeDistance: AdaptateurFeuilleExercices<ExerciceNormeDistance> = {
  titreDocument: "Norme d'un vecteur et distance entre 2 points — Évaluation",
  nomFichierBase: "norme-vecteur-distance",
  genererInstance: genererExerciceNormeDistance,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteNormeDistance),
  construireEnonce: construireEnonceNormeDistance,
  construireCorrection: construireCorrectionNormeDistance,
};
