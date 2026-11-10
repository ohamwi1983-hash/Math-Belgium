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
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { nombreFrLatex } from "../../ui/nombreFr";
import { LIBELLE_CAS_NORME_ENTIERE, profilNormeDistance } from "../profilsEvaluation4eCh6";
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
  formatLongueurIrreductibleLatex,
  formatSolutionsAttenduesTexte,
  formatTermesEnonceParametreLatex,
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

// ============================================================================
// Variante 1 — norme d'un vecteur donné
// ============================================================================

function construireEnonceVecteur(exercice: ExerciceNormeVecteur): SectionExercice {
  return {
    enteteFragments: [latex(formatEnonceVecteurLatex(exercice))],
    questions: [{ consigne: segmentsConsigneVecteur(exercice) }],
  };
}

function construireCorrectionVecteur(exercice: ExerciceNormeVecteur): BlocCorrection[] {
  return [
    {
      type: "paragraphe",
      fragments: [latex(`${formatLabelNormeVecteurLatex(exercice)} ${formuleSubstitueeNormeLatex(exercice.v)} = ${formatLongueurIrreductibleLatex(exercice.normeCarree)}`)],
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
      },
      { consigne: [texte(CONSIGNE_GENERALE_DISTANCE)] },
    ],
  };
}

function construireCorrectionDistance(exercice: ExerciceDistance): BlocCorrection[] {
  const { labelA, pointA, labelB, pointB, vecteurAB, distanceCarree } = exercice;
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
      fragments: [texte("b) "), latex(`${formatAideNormeABNiveau2Latex(labelA, labelB, vecteurAB)} = ${formatLongueurIrreductibleLatex(distanceCarree)}`)],
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
  carreAB: number,
  carreAC: number,
  carreBC: number,
): FragmentConsigne[] {
  const [ab, ac, bc] = [carreAB, carreAC, carreBC].map(formatLongueurIrreductibleLatex);
  if (classification === "isoceleA") {
    return [texte(`Le triangle est isocèle en ${labelA} : `), latex(`${labelA}${labelB} = ${labelA}${labelC} = ${ab}`), texte(".")];
  }
  if (classification === "isoceleB") {
    return [texte(`Le triangle est isocèle en ${labelB} : `), latex(`${labelA}${labelB} = ${labelB}${labelC} = ${ab}`), texte(".")];
  }
  if (classification === "isoceleC") {
    return [texte(`Le triangle est isocèle en ${labelC} : `), latex(`${labelA}${labelC} = ${labelB}${labelC} = ${ac}`), texte(".")];
  }
  return [texte("Le triangle est scalène : ses 3 côtés ("), latex(`${ab}`), texte(", "), latex(`${ac}`), texte(", "), latex(`${bc}`), texte(") sont de longueurs deux à deux différentes.")];
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
      },
      { consigne: [texte(CONSIGNE_GENERALE_ISOCELE)] },
    ],
  };
}

function construireCorrectionIsocele(exercice: ExerciceIsocele): BlocCorrection[] {
  const { labelA, pointA, labelB, pointB, labelC, pointC, vecteurAB, vecteurAC, vecteurBC, carreAB, carreAC, carreBC, classification } = exercice;

  const vecteursSubstitues = `\\begin{gathered} ${formatAideVecteurABNiveau2Latex(labelA, pointA, labelB, pointB)} \\\\ ${formatAideVecteurABNiveau2Latex(
    labelA,
    pointA,
    labelC,
    pointC,
  )} \\\\ ${formatAideVecteurABNiveau2Latex(labelB, pointB, labelC, pointC)} \\end{gathered}`;

  const longueursSubstituees = `\\begin{gathered} \\|\\vec{${labelA}${labelB}}\\| = ${formuleSubstitueeNormeLatex(vecteurAB)} = ${formatLongueurIrreductibleLatex(
    carreAB,
  )} \\\\ \\|\\vec{${labelA}${labelC}}\\| = ${formuleSubstitueeNormeLatex(vecteurAC)} = ${formatLongueurIrreductibleLatex(
    carreAC,
  )} \\\\ \\|\\vec{${labelB}${labelC}}\\| = ${formuleSubstitueeNormeLatex(vecteurBC)} = ${formatLongueurIrreductibleLatex(carreBC)} \\end{gathered}`;

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
      fragments: [texte("c) "), ...libelleClassificationIsocele(classification, labelA, labelB, labelC, carreAB, carreAC, carreBC)],
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
      },
      { consigne: segmentsConsigneParametre(exercice) },
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
      },
      {
        consigne: [texte("Calcule la longueur des 3 côtés du triangle (forme exacte ou décimale arrondie au centième).")],
      },
      { consigne: [texte(CONSIGNE_GENERALE_PYTHAGORE)] },
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

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les écrans (composantes, longueurs, nature, développement, résolution) sont des étapes
// d'APPRENTISSAGE : l'énoncé papier garde les données et la question globale ; les écrans deviennent
// les étapes du corrigé. Isocèle ou scalène, rectangle ou non, nombre de solutions : des VERDICTS,
// jamais des cas particuliers du tirage. Valeurs exactes (aucune calculatrice) : toutes les
// longueurs viennent de `formatLongueurIrreductibleLatex` (la même fonction que l'écran).

function nomSommet(e: { labelA: string; labelB: string; labelC: string }, s: "A" | "B" | "C"): string {
  return s === "A" ? e.labelA : s === "B" ? e.labelB : e.labelC;
}

function enoncePapier(instance: ExerciceNormeDistance): EnoncePapier {
  if (instance.variante === "vecteur") {
    return { section: { enteteFragments: [texte("On donne le vecteur "), latex(formatEnonceVecteurLatex(instance)), texte(". Calcule la norme du vecteur "), latex(`\\vec{${instance.vNom}}`), texte(" (valeur exacte, simplifiée).")], questions: [] } };
  }
  if (instance.variante === "distance") {
    return { section: { enteteFragments: [texte("On donne les points "), latex(formatEnonceDistanceLatex(instance)), texte(`. Calcule la distance entre les points ${instance.labelA} et ${instance.labelB} (valeur exacte, simplifiée).`)], questions: [] } };
  }
  if (instance.variante === "isocele") {
    return { section: { enteteFragments: [texte("On donne les points "), latex(formatEnonceIsoceleLatex(instance)), texte(`. Le triangle ${instance.labelA}${instance.labelB}${instance.labelC} est-il isocèle (et en quel sommet) ou scalène ? Justifie par des calculs de longueurs.`)], questions: [] } };
  }
  if (instance.variante === "parametre") {
    return {
      section: {
        enteteFragments: [
          texte("On donne le vecteur "),
          latex(formatTermesEnonceParametreLatex(instance)[0]),
          texte(", où "),
          latex("x"),
          texte(" est un réel. Détermine la ou les valeurs de "),
          latex("x"),
          texte(" pour lesquelles "),
          latex(formatTermesEnonceParametreLatex(instance)[1]),
          texte(", s'il en existe."),
        ],
        questions: [],
      },
    };
  }
  return { section: { enteteFragments: [texte("On donne les points "), latex(formatEnoncePythagoreLatex(instance)), texte(`. Le triangle ${instance.labelA}${instance.labelB}${instance.labelC} est-il rectangle ? Justifie à l'aide des longueurs de ses côtés.`)], questions: [] } };
}

function conclusionPythagore(e: ExercicePythagore): string {
  return e.sommetRectangle === null ? "Le triangle n'est pas rectangle." : `Le triangle est rectangle en ${nomSommet(e, e.sommetRectangle)}.`;
}

function reponseBreve(instance: ExerciceNormeDistance): FragmentConsigne[] {
  if (instance.variante === "vecteur") return [latex(`\\|\\vec{${instance.vNom}}\\| = ${formatLongueurIrreductibleLatex(instance.normeCarree)}`)];
  if (instance.variante === "distance") return [latex(`${instance.labelA}${instance.labelB} = ${formatLongueurIrreductibleLatex(instance.distanceCarree)}`)];
  if (instance.variante === "isocele") return libelleClassificationIsocele(instance.classification, instance.labelA, instance.labelB, instance.labelC, instance.carreAB, instance.carreAC, instance.carreBC);
  if (instance.variante === "parametre") return instance.solutions.length === 0 ? [texte("Aucune valeur de x ne convient.")] : [latex(formatSolutionsAttenduesTexte(instance).replace(" ou ", " \\text{ ou } "))];
  return [texte(conclusionPythagore(instance))];
}

const METHODE_NORME: FragmentConsigne[] = [texte("La norme d'un vecteur est la racine carrée de la somme des carrés de ses composantes : "), latex("\\|\\vec{v}\\| = \\sqrt{x^2+y^2}"), texte(".")];
const PIEGE_CARRE: FragmentConsigne[] = [texte("Le carré d'une composante négative est positif : on écrit "), latex("(-3)^2 = 9"), texte(", jamais "), latex("-3^2"), texte(".")];

function vecteursTriangle(e: ExerciceIsocele | ExercicePythagore): EtapeCorrection {
  return {
    label: "Calcul",
    sousQuestion: "a",
    fragments: [latex(formatEtatActuelVecteursTriangleLatex(e.labelA, e.labelB, e.labelC, e.vecteurAB, e.vecteurAC, e.vecteurBC))],
  };
}

function longueursTriangle(e: ExerciceIsocele | ExercicePythagore): EtapeCorrection {
  const { labelA: a, labelB: b, labelC: c } = e;
  return {
    label: "Calcul",
    sousQuestion: "b",
    fragments: [
      latex(
        `\\begin{gathered} \\|\\vec{${a}${b}}\\| = ${formuleSubstitueeNormeLatex(e.vecteurAB)} = ${formatLongueurIrreductibleLatex(e.carreAB)} \\\\ \\|\\vec{${a}${c}}\\| = ${formuleSubstitueeNormeLatex(e.vecteurAC)} = ${formatLongueurIrreductibleLatex(e.carreAC)} \\\\ \\|\\vec{${b}${c}}\\| = ${formuleSubstitueeNormeLatex(e.vecteurBC)} = ${formatLongueurIrreductibleLatex(e.carreBC)} \\end{gathered}`,
      ),
    ],
  };
}

function correctionDetaillee(instance: ExerciceNormeDistance): EtapeCorrection[] {
  if (instance.variante === "vecteur") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: METHODE_NORME },
      { label: "Calcul", sousQuestion: "a", fragments: [latex(`\\|\\vec{${instance.vNom}}\\| = ${formuleSubstitueeNormeLatex(instance.v)} = \\sqrt{${instance.normeCarree}}`)] },
      { label: "Conclusion", sousQuestion: "a", fragments: reponseBreve(instance) },
      { label: "Piège", sousQuestion: "a", fragments: PIEGE_CARRE },
    ];
  }
  if (instance.variante === "distance") {
    const { labelA, pointA, labelB, pointB, vecteurAB, distanceCarree } = instance;
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte(`La distance ${labelA}${labelB} est la norme du vecteur `), latex(`\\vec{${labelA}${labelB}}`), texte(", dont les composantes sont « extrémité moins origine ».")] },
      { label: "Calcul", sousQuestion: "a", fragments: [latex(formatAideVecteurABNiveau2Latex(labelA, pointA, labelB, pointB)), texte(", donc "), latex(formatVecteurLatex(`${labelA}${labelB}`, vecteurAB))] },
      { label: "Calcul", sousQuestion: "b", fragments: [latex(`${formatAideNormeABNiveau2Latex(labelA, labelB, vecteurAB)} = \\sqrt{${distanceCarree}}`)] },
      { label: "Conclusion", sousQuestion: "b", fragments: reponseBreve(instance) },
      { label: "Piège", sousQuestion: "a", fragments: [texte("Soustraire une coordonnée négative revient à ajouter sa valeur absolue : "), latex("2-(-3) = 5"), texte(".")] },
    ];
  }
  if (instance.variante === "isocele") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte("On calcule les longueurs des trois côtés (normes des vecteurs côtés) et on les compare : deux côtés égaux donnent un triangle isocèle.")] },
      vecteursTriangle(instance),
      longueursTriangle(instance),
      { label: "Conclusion", sousQuestion: "c", fragments: reponseBreve(instance) },
      { label: "Piège", sousQuestion: "c", fragments: [texte("Le sommet principal d'un triangle isocèle est le sommet COMMUN aux deux côtés égaux, pas le troisième sommet.")] },
    ];
  }
  if (instance.variante === "parametre") {
    const { p, r, cibleCarree, a, b, c, discriminant, solutions } = instance;
    const resolution: FragmentConsigne[] =
      solutions.length === 0
        ? [texte("Le discriminant est négatif : l'équation n'a aucune solution réelle.")]
        : solutions.length === 1
          ? [texte("Le discriminant est nul : une seule solution, "), latex(`x = \\dfrac{${-b}}{${2 * a}} = ${nombreFrLatex(solutions[0])}`), texte(".")]
          : [texte("Le discriminant est positif : deux solutions, "), latex(`x = \\dfrac{${-b} \\pm \\sqrt{${discriminant}}}{${2 * a}}`), texte(", soit "), latex(formatSolutionsAttenduesTexte(instance).replace(" ou ", " \\text{ ou } ")), texte(".")];
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte("On élève les deux membres au carré (une norme est positive), on développe, puis on résout l'équation du second degré obtenue.")] },
      { label: "Relation", sousQuestion: "a", fragments: [latex(formatAideNormeSubstitueeParametreLatex(instance)), texte(", donc "), latex(`${p === 0 ? "x^2" : `(${formatBinomeX(p)})^2`}+${r === 0 ? "x^2" : `(${formatBinomeX(r)})^2`} = ${cibleCarree}`)] },
      { label: "Réduction", sousQuestion: "a", fragments: [latex(formatEquationReduiteParametreNormeLatex(instance))] },
      { label: "Calcul", sousQuestion: "b", fragments: [latex(`\\Delta = ${formatTermeCarre(b)}^2-4\\cdot ${a}\\cdot ${formatTermeCarre(c)} = ${nombreFrLatex(discriminant)}`)] },
      { label: "Conclusion", sousQuestion: "b", fragments: resolution },
      { label: "Piège", sousQuestion: "a", fragments: [texte("Le carré d'un binôme a trois termes : "), latex("(x-p)^2 = x^2-2px+p^2"), texte(" ; oublier le double produit fausse toute la suite.")] },
    ];
  }
  const { labelA: A, labelB: B, labelC: C, carreAB, carreAC, carreBC, sommetRectangle } = instance;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On calcule les longueurs des côtés, puis on teste la réciproque du théorème de Pythagore : le carré du plus grand côté est-il la somme des carrés des deux autres ?")] },
    vecteursTriangle(instance),
    longueursTriangle(instance),
    {
      label: "Test",
      sousQuestion: "c",
      fragments: [
        latex(`${A}${B}^2 = ${carreAB}`),
        texte(", "),
        latex(`${A}${C}^2 = ${carreAC}`),
        texte(", "),
        latex(`${B}${C}^2 = ${carreBC}`),
        texte(" : "),
        latex(
          sommetRectangle === "A"
            ? `${carreBC} = ${carreAB}+${carreAC}`
            : sommetRectangle === "B"
              ? `${carreAC} = ${carreAB}+${carreBC}`
              : sommetRectangle === "C"
                ? `${carreAB} = ${carreAC}+${carreBC}`
                : `\\text{aucun carré n'est la somme des deux autres}`,
        ),
      ],
    },
    { label: "Conclusion", sousQuestion: "c", fragments: [texte(conclusionPythagore(instance))] },
    { label: "Piège", sousQuestion: "c", fragments: [texte("On compare les CARRÉS des longueurs (entiers), pas les longueurs elles-mêmes ; et on teste le plus grand côté comme hypoténuse.")] },
  ];
}

/** « x−3 », « x+2 » (binôme du vecteur à paramètre, même écriture que l'énoncé). */
function formatBinomeX(valeur: number): string {
  return valeur > 0 ? `x-${valeur}` : `x+${-valeur}`;
}

function formatTermeCarre(valeur: number): string {
  return valeur < 0 ? `(${nombreFrLatex(valeur)})` : nombreFrLatex(valeur);
}

function bareme(instance: ExerciceNormeDistance): BaremeExercice {
  const carre = { description: [texte("Carré d'une composante négative compté négatif")], cout: "−1" };
  if (instance.variante === "vecteur") {
    return {
      reponseFinale: reponseBreve(instance),
      criteres: [
        { sousQuestion: "a", critere: [texte("Formule substituée : "), latex(formuleSubstitueeNormeLatex(instance.v))], points: 1.5 },
        { sousQuestion: "a", critere: [texte("Somme des carrés : "), latex(String(instance.normeCarree))], points: 1 },
        { sousQuestion: "a", critere: [texte("Résultat exact simplifié : "), latex(formatLongueurIrreductibleLatex(instance.normeCarree))], points: 1.5 },
      ],
      erreursFrequentes: [carre, { description: [texte("Racine non simplifiée")], cout: "−0,5" }],
    };
  }
  if (instance.variante === "distance") {
    return {
      reponseFinale: reponseBreve(instance),
      criteres: [
        { sousQuestion: "a", critere: [texte("Composantes de "), latex(`\\vec{${instance.labelA}${instance.labelB}}`)], points: 1 },
        { sousQuestion: "b", critere: [texte("Formule de la norme substituée")], points: 1 },
        { sousQuestion: "b", critere: [texte("Distance exacte simplifiée : "), latex(formatLongueurIrreductibleLatex(instance.distanceCarree))], points: 2 },
      ],
      erreursFrequentes: [carre, { description: [texte("Racine non simplifiée")], cout: "−0,5" }],
    };
  }
  if (instance.variante === "isocele") {
    return {
      reponseFinale: reponseBreve(instance),
      criteres: [
        { sousQuestion: "a", critere: [texte("Composantes des trois vecteurs côtés")], points: 1 },
        { sousQuestion: "b", critere: [texte("Les trois longueurs exactes")], points: 1.5 },
        { sousQuestion: "c", critere: [texte("Nature justifiée (et sommet principal s'il est isocèle)")], points: 1.5 },
      ],
      erreursFrequentes: [carre, { description: [texte("Sommet principal mal identifié")], cout: "−0,5" }],
      reponsesAcceptees: [[texte("Comparaison des carrés des longueurs, sans racine")]],
    };
  }
  if (instance.variante === "parametre") {
    return {
      reponseFinale: reponseBreve(instance),
      criteres: [
        { sousQuestion: "a", critere: [texte("Égalité élevée au carré, binômes développés")], points: 1 },
        { sousQuestion: "a", critere: [texte("Équation réduite : "), latex(formatEquationReduiteParametreNormeLatex(instance))], points: 1 },
        { sousQuestion: "b", critere: [texte("Discriminant : "), latex(formatDiscriminantLatex(instance))], points: 1 },
        { sousQuestion: "b", critere: [texte("Conclusion : "), ...reponseBreve(instance)], points: 1 },
      ],
      erreursFrequentes: [{ description: [texte("Double produit oublié en développant un carré")], cout: "−1,5" }, { description: [texte("Norme cible non élevée au carré")], cout: "−1" }],
    };
  }
  return {
    reponseFinale: reponseBreve(instance),
    criteres: [
      { sousQuestion: "a", critere: [texte("Composantes des trois vecteurs côtés")], points: 1 },
      { sousQuestion: "b", critere: [texte("Les trois longueurs (ou leurs carrés)")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Test de Pythagore sur le plus grand côté et conclusion")], points: 1.5 },
    ],
    erreursFrequentes: [carre, { description: [texte("Pythagore testé avec un côté qui n'est pas le plus grand comme hypoténuse")], cout: "−1" }],
    reponsesAcceptees: [[texte("Critère d'orthogonalité des vecteurs côtés en chaque sommet, s'il est correctement mené")]],
  };
}

/** ★ norme d'un vecteur ; ★★ distance, nature, Pythagore ; ★★★ paramètre (équation du second degré). */
function difficulte(instance: ExerciceNormeDistance): 1 | 2 | 3 {
  if (instance.variante === "vecteur") return 1;
  return instance.variante === "parametre" ? 3 : 2;
}

export const adaptateurEvaluationNormeDistance: AdaptateurFeuilleExercices<ExerciceNormeDistance> = {
  titreDocument: "Norme d'un vecteur et distance entre 2 points — Évaluation",
  nomFichierBase: "norme-vecteur-distance",
  genererInstance: genererExerciceNormeDistance,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteNormeDistance),
  construireEnonce: construireEnonceNormeDistance,
  construireCorrection: construireCorrectionNormeDistance,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 5,
  profilInstance: profilNormeDistance,
  libelleCasParticulier: LIBELLE_CAS_NORME_ENTIERE,
};
