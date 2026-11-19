import type { ExerciceSynthese } from "../../core/exerciceSynthese.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, ErreurFrequente, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeExerciceSynthese } from "./corrigeDetaille";
import { SEQUENCES, type PhaseExerciceSynthese } from "../../moteur/typesExerciceSynthese";
import { precisionLecture } from "../../moteur/verificationMediane";
import { CONSIGNE_SOMMES, consigneCentres, consigneQuotient } from "../../ui/formatMoyennePonderee";
import { CONSIGNE_POLYGONE, consigneMedianeDiscrete, consigneMinMaxMode, consigneQ1, consigneQ3, libellePrecisionLecture } from "../../ui/formatMediane";
import { consigneEcartType, consigneVariance } from "../../ui/formatDispersion";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  versBoiteMoustaches,
  versDispersion,
  versMedianeClasses,
  versMedianeDiscrete,
  versMoyennePonderee,
  versMoyennePondereeClasses,
} from "../../moteur/verificationExerciceSynthese";
import {
  consigneBtIntervalle,
  consigneBtPourcent,
  formatBtIntervalleAttenduTexte,
  formatBtPourcentAttenduTexte,
  formatEnonceTexte,
  formatEtatActuelXBarSigmaLatex,
} from "../../ui/formatExerciceSynthese";
import { formatCentresAttendusTexte, formatSommesAttenduesTexte } from "../../ui/formatMoyennePonderee";
import {
  formatClasseTexte,
  formatLectureAttendueTexte,
  formatMedianeAttendueTexte,
  formatMinMaxModeAttendueTexte,
  formatPolygoneAttenduTexte,
  formatQ1AttendueTexte,
  formatQ3AttendueTexte,
  formatSyntheseAttendueTexte,
} from "../../ui/formatMediane";
import { formatEcartTypeAttendueTexte, formatTableauAttenduTexte, formatVarianceAttendueTexte } from "../../ui/formatDispersion";
import type { SegmentTexte } from "../../ui/formatDispersion";
import { formatCinqNombresLatex, LABEL_Q1, LABEL_Q2, LABEL_Q3, LABEL_X_MAX, LABEL_X_MIN } from "../../ui/formatBoiteMoustaches";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSynthese } from "./index";
import { avecVirgulesBelges, segmentEnVirgules, virgulesLatex } from "../../ui/nombreFr";
import { profilExerciceSynthese, LIBELLE_CAS_MEDIANE } from "../profilsEvaluationStatistique";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSynthese>` pour gen35 ("Exercice de synthèse",
 * chapitre 5, `generateurs/exerciceSynthese/index.ts`) — voir `generateurs/analyseFonction/exportWord.ts`
 * pour le mécanisme générique de référence, et `generateurs/simplification/exportEvaluation.ts` pour
 * la méthodologie de consolidation écrans→questions appliquée ci-dessous.
 *
 * **Un seul jeu de données, un seul contexte, pour TOUTE la feuille** — comme à l'écran
 * (`AppExerciceSynthese.tsx`) : `construireEnonce` affiche la phrase de contexte + le tableau
 * complet (x_i/n_i, ou classes/effectifs) UNE SEULE FOIS en tête de l'exercice (`enteteFragments`),
 * jamais répété question par question.
 *
 * **Consolidation des 11 (variante "discrete") ou 13 (variante "classes") écrans on-screen
 * (`moteur/typesExerciceSynthese.ts::SEQUENCES`) en questions papier lettrées — jamais une question
 * par micro-écran :**
 *
 * Variante `"discrete"` (11 écrans → 5 questions a-e) :
 * - a) `sommes` + `quotient` (2 écrans) → « Calcule les sommes intermédiaires puis la moyenne x̄. »
 * - b) `mediane` + `q1` + `q3` + `minMaxMode` (4 écrans) → « Détermine médiane, Q1, Q3, min, max,
 *   mode(s). » (reprend "Paramètres de position" variante discrète, seuils n/4·n/2·3n/4, règle
 *   stricte `>`, calculs indépendants les uns des autres — jamais une cascade depuis la médiane,
 *   contrairement à l'ancien "Étendue et écart interquartile" que gen35 a remplacé).
 * - c) `boxplot` (1 écran) → « Représente cette série sous forme de boîte à moustaches. »
 * - d) `tableau` + `varianceEcartType` (2 écrans) → « Calcule la variance et l'écart-type. »
 * - e) `btIntervalle` + `btPourcent` (2 écrans) → « Intervalle + pourcentage minimal garantis par
 *   Bienaymé-Tchebychev (k=2). »
 *
 * Variante `"classes"` (13 écrans → 6 questions a-f) :
 * - a) `centres` + `sommes` + `quotient` (3 écrans) → « Calcule le centre de chaque classe, les
 *   sommes intermédiaires, puis la moyenne x̄. »
 * - b) `polygone` (1 écran) → « Construis le polygone des effectifs cumulés. »
 * - c) `lectureMediane` + `lectureQ1` + `lectureQ3` + `synthese` (4 écrans) → « À l'aide du polygone
 *   (ou par le calcul), détermine étendue, Q1, médiane, Q3, classe modale et mode. » (les 3 écrans
 *   de lecture graphique ET l'écran "Synthèse" portent tous sur le MÊME polygone déjà construit en
 *   b — jamais 4 tâches indépendantes sur papier).
 * - d) `tableau` + `varianceEcartType` (2 écrans) → identique à la variante "discrete".
 * - e) `boxplot` (1 écran) → identique.
 * - f) `btIntervalle` + `btPourcent` (2 écrans) → identique.
 *
 * **PAS `regroupable`** (voir la doc de `AdaptateurFeuilleExercices.regroupable`,
 * `export/genererFeuilleExercices.ts`) : cet adaptateur produit plusieurs questions par instance (5
 * ou 6 selon la variante), à consigne dépendante de la variante — aucun des 2 cas ne satisfait le
 * mécanisme (réservé à UNE question générique, identique quelle que soit l'instance).
 *
 * **Aucune zone de réponse** (`reponse` omis sur toutes les questions) — feuille de synthèse dense
 * à 5-6 questions substantielles par instance (tableau à compléter, polygone à construire, boîte à
 * moustaches à tracer...) : l'élève travaille sur feuille/copie séparée plutôt que dans un espace
 * dédié par question, même choix que `tableauFrequences/exportEvaluation.ts`.
 *
 * **Corrections RESYNTHÉTISÉES depuis les valeurs déjà connues de l'instance, jamais recalculées
 * indépendamment** — chaque bloc de correction ci-dessous réutilise DIRECTEMENT les formateurs de
 * révélation déjà écrits et éprouvés pour les 5 générateurs sources (`ui/formatMoyennePonderee.ts`,
 * `ui/formatMediane.ts`, `ui/formatDispersion.ts`, `ui/formatBoiteMoustaches.ts`,
 * `ui/formatExerciceSynthese.ts` pour les 2 écrans "gen37 adaptée"), appliqués aux objets MAPPÉS de
 * `moteur/verificationExerciceSynthese.ts` (`versMoyennePonderee`/`versMedianeDiscrete`/
 * `versMedianeClasses`/`versDispersion`/`versBoiteMoustaches`) — jamais une seconde implémentation
 * de ces calculs/formatages. Pour la variante "discrete", médiane/Q1/Q3 réutilisent
 * `formatMedianeAttendueTexte`/`formatQ1AttendueTexte`/`formatQ3AttendueTexte` (signe "=", valeurs
 * toujours exactes par construction) ; pour la variante "classes", `formatLectureAttendueTexte`
 * (signe "≈", valeurs interpolées puis arrondies au palier de précision applicable).
 */

function formatNombreTexte(valeur: number): string {
  return String(valeur).replace(".", ",");
}

function segmentsVersFragments(segments: SegmentTexte[]): FragmentConsigne[] {
  return segments.map((s) => (s.type === "katex" ? latex(s.valeur) : texte(s.valeur)));
}

// ============================================================================
// Tableau brut partagé (x_i/n_i, ou classes/effectifs) — affiché UNE SEULE FOIS en tête de
// l'exercice (`enteteFragments`), jamais répété question par question.
// ============================================================================

function tableauDonneesLatex(exercice: ExerciceSynthese): string {
  if (exercice.variante === "discrete") {
    const cols = exercice.lignes.map(() => "c").join("");
    const xs = exercice.lignes.map((l) => l.valeur).join(" & ");
    const ns = exercice.lignes.map((l) => l.effectif).join(" & ");
    return `\\begin{array}{c|${cols}} x_i & ${xs} \\\\ \\hline n_i & ${ns} \\end{array}`;
  }
  const mappe = versMedianeClasses(exercice);
  const cols = exercice.classes.map(() => "c").join("");
  const classesTxt = exercice.classes.map((_, i) => `\\text{${formatClasseTexte(mappe, i).split("−").join("}{-}\\text{")}}`).join(" & ");
  const ns = exercice.classes.map((c) => c.effectif).join(" & ");
  return `\\begin{array}{c|${cols}} \\text{Classe} & ${classesTxt} \\\\ \\hline n_i & ${ns} \\end{array}`;
}

function enteteExerciceSynthese(exercice: ExerciceSynthese): FragmentConsigne[] {
  return [texte(formatEnonceTexte(exercice)), latex(tableauDonneesLatex(exercice))];
}

// ============================================================================
// Question a) — moyenne pondérée (gen32) : centres (classes uniquement) + sommes + quotient.
// ============================================================================

function correctionMoyenne(exercice: ExerciceSynthese, lettre: string): BlocCorrection[] {
  const blocs: BlocCorrection[] = [];
  const fragmentsCentres: FragmentConsigne[] = [];

  if (exercice.variante === "classes") {
    const mappe = versMoyennePondereeClasses(exercice);
    fragmentsCentres.push(texte(`${lettre}) Centres de classe : ${formatCentresAttendusTexte(mappe)}.`));
    blocs.push({ type: "paragraphe", fragments: fragmentsCentres });
  }

  const mappeMoyenne = versMoyennePonderee(exercice);
  const fragmentsSommes: FragmentConsigne[] = exercice.variante === "classes" ? [] : [texte(`${lettre}) `)];
  fragmentsSommes.push(...segmentsVersFragments(formatSommesAttenduesTexte(mappeMoyenne)));
  fragmentsSommes.push(
    texte(` — moyenne : `),
    latex(virgulesLatex(`\\bar{x} = \\dfrac{${exercice.sommeXN}}{${exercice.n}} = ${exercice.xBar}\\text{ ${exercice.contexte.unite}}`)),
    texte("."),
  );
  blocs.push({ type: "paragraphe", fragments: fragmentsSommes });

  return blocs;
}

// ============================================================================
// Question — médiane/quartiles/min/max/mode (variante "discrete", reprend "Paramètres de position"
// variante discrète) OU polygone + lecture graphique + synthèse (variante "classes").
// ============================================================================

/** Segments de l'écran (texte + KaTeX) → fragments du papier : même source, mêmes notations. */
function fragmentsDeSegments(segments: { type: "texte" | "katex"; valeur: string }[]): FragmentConsigne[] {
  return segments.map((seg) => (seg.type === "katex" ? latex(seg.valeur) : texte(seg.valeur)));
}

function consignePositionDiscrete(exercice: ExerciceSynthese): FragmentConsigne[] {
  const unite = exercice.contexte.unite;
  return [
    texte("Détermine la médiane, le premier quartile "),
    latex(LABEL_Q1),
    texte(" et le troisième quartile "),
    latex(LABEL_Q3),
    texte(` de cette série (en ${unite} — seuils `),
    latex("\\dfrac{n}{4}"),
    texte(", "),
    latex("\\dfrac{n}{2}"),
    texte(", "),
    latex("\\dfrac{3n}{4}"),
    texte(", règle stricte : première valeur dont l'effectif cumulé dépasse le seuil), ainsi que son minimum, son maximum et son (ses) mode(s)."),
  ];
}

function correctionPositionDiscrete(exercice: ExerciceSynthese, lettre: string): BlocCorrection[] {
  if (exercice.variante !== "discrete") throw new Error("correctionPositionDiscrete : réservé à la variante 'discrete'");
  const mappe = versMedianeDiscrete(exercice);
  return [
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettre}) Médiane : `),
        ...fragmentsDeSegments(formatMedianeAttendueTexte(mappe)),
        texte(". Premier quartile : "),
        ...fragmentsDeSegments(formatQ1AttendueTexte(mappe)),
        texte(". Troisième quartile : "),
        ...fragmentsDeSegments(formatQ3AttendueTexte(mappe)),
        texte(". "),
        texte(formatMinMaxModeAttendueTexte(mappe) + "."),
      ],
    },
  ];
}

function correctionPolygone(exercice: ExerciceSynthese, lettre: string): BlocCorrection[] {
  if (exercice.variante !== "classes") throw new Error("correctionPolygone : réservé à la variante 'classes'");
  const mappe = versMedianeClasses(exercice);
  return [{ type: "paragraphe", fragments: [texte(`${lettre}) Sommets du polygone : ${formatPolygoneAttenduTexte(mappe)}.`)] }];
}

function consigneSyntheseClasses(exercice: ExerciceSynthese): FragmentConsigne[] {
  const unite = exercice.contexte.unite;
  return [
    texte("À l'aide de ce polygone (ou par le calcul), détermine l'étendue, le premier quartile "),
    latex(LABEL_Q1),
    texte(", la médiane, le troisième quartile "),
    latex(LABEL_Q3),
    texte(` (en ${unite}), ainsi que la classe modale et le mode de cette série.`),
  ];
}

function correctionSyntheseClasses(exercice: ExerciceSynthese, lettre: string): BlocCorrection[] {
  if (exercice.variante !== "classes") throw new Error("correctionSyntheseClasses : réservé à la variante 'classes'");
  const mappe = versMedianeClasses(exercice);
  return [
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettre}) Seuil de `),
        latex(LABEL_Q1),
        texte(" : "),
        latex(`\\dfrac{n}{4}=${virgulesLatex(String(exercice.seuilQ1))}`),
        texte(" → "),
        ...fragmentsDeSegments(formatLectureAttendueTexte(mappe, "q1")),
        texte(". Seuil de la médiane : "),
        latex(`\\dfrac{n}{2}=${virgulesLatex(String(exercice.seuil))}`),
        texte(" → "),
        ...fragmentsDeSegments(formatLectureAttendueTexte(mappe, "mediane")),
        texte(". Seuil de "),
        latex(LABEL_Q3),
        texte(" : "),
        latex(`\\dfrac{3n}{4}=${virgulesLatex(String(exercice.seuilQ3))}`),
        texte(" → "),
        ...fragmentsDeSegments(formatLectureAttendueTexte(mappe, "q3")),
        texte(". "),
        texte(formatSyntheseAttendueTexte(mappe) + "."),
      ],
    },
  ];
}

// ============================================================================
// Question — boîte à moustaches (gen36, variante "construction" : les 5 valeurs sont déjà connues,
// reprises des questions précédentes — l'élève les place/trace, ne les recalcule pas).
// ============================================================================

function consigneBoxplot(exercice: ExerciceSynthese): FragmentConsigne[] {
  return [
    texte("Représente cette série sous la forme d'une boîte à moustaches (diagramme en boîte), en plaçant "),
    latex(LABEL_X_MIN),
    texte(", "),
    latex(LABEL_Q1),
    texte(", la médiane ("),
    latex(LABEL_Q2),
    texte("), "),
    latex(LABEL_Q3),
    texte(" et "),
    latex(LABEL_X_MAX),
    texte(` sur un axe gradué adapté (en ${exercice.contexte.unite}).`),
  ];
}

function correctionBoxplot(exercice: ExerciceSynthese, lettre: string): BlocCorrection[] {
  const mappe = versBoiteMoustaches(exercice);
  return [
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettre}) `),
        latex(formatCinqNombresLatex(mappe.valeurs)),
        texte(` — axe suggéré : de ${formatNombreTexte(mappe.bornePlage.min)} à ${formatNombreTexte(mappe.bornePlage.max)} ${exercice.contexte.unite}. La boîte va de `),
        latex(LABEL_Q1),
        texte(" à "),
        latex(LABEL_Q3),
        texte(", avec un trait à l'intérieur pour la médiane ("),
        latex(LABEL_Q2),
        texte("), et les moustaches jusqu'à "),
        latex(LABEL_X_MIN),
        texte(" et "),
        latex(LABEL_X_MAX),
        texte("."),
      ],
    },
  ];
}

// ============================================================================
// Question — variance/écart-type (gen34, reprend "Paramètres de dispersion" tel quel).
// ============================================================================

function correctionDispersion(exercice: ExerciceSynthese, lettre: string): BlocCorrection[] {
  const mappe = versDispersion(exercice);
  const libellesLignes = ["xᵢ (ou centre)", "nᵢ", "(xᵢ − x̄)² · nᵢ"];
  const valeursParLigne = [mappe.lignes.map((l) => String(l.valeur)), mappe.lignes.map((l) => String(l.effectif)), mappe.lignes.map((l) => String(l.produitAttendu))];

  return [
    { type: "paragraphe", fragments: [texte(`${lettre}) Tableau des écarts quadratiques pondérés :`)] },
    { type: "tableau", libellesLignes, valeursParLigne },
    {
      type: "paragraphe",
      fragments: [
        ...segmentsVersFragments(formatTableauAttenduTexte(mappe)),
        texte(`. Variance : ${formatVarianceAttendueTexte(mappe)}. Écart-type : ${formatEcartTypeAttendueTexte(mappe)}.`),
      ],
    },
  ];
}

// ============================================================================
// Question — Bienaymé-Tchebychev (gen37 adaptée, k=2) : intervalle + pourcentage minimal.
// ============================================================================

function consigneBienaymeTchebychev(exercice: ExerciceSynthese): FragmentConsigne[] {
  return [texte(`${consigneBtIntervalle(exercice)} ${consigneBtPourcent()}`)];
}

function correctionBienaymeTchebychev(exercice: ExerciceSynthese, lettre: string): BlocCorrection[] {
  return [
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettre}) `),
        latex(formatEtatActuelXBarSigmaLatex(exercice)),
        texte(` — intervalle : `),
        latex(`[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]`),
        texte(` avec k = ${exercice.kBT} `),
        texte(formatBtIntervalleAttenduTexte(exercice)),
        texte(`. Pourcentage minimal garanti : `),
        latex(`1-\\dfrac{1}{k^2}`),
        texte(` ${formatBtPourcentAttenduTexte(exercice)}.`),
      ],
    },
  ];
}

// ============================================================================
// Assemblage — branche par variante (5 questions "discrete", 6 questions "classes").
// ============================================================================

/** Consigne de chaque écran de l'appli, sans les tournures d'écran (« ci-dessous », « positionne la
 * barre ») — titres « Étape n — … » du corrigé. */
function consigneEcran(exercice: ExerciceSynthese, phase: PhaseExerciceSynthese): FragmentConsigne[] {
  const u = exercice.contexte.unite;
  const lecture = (seuil: string, nom: string, symbole: string) => {
    const precision = exercice.variante === "classes" ? libellePrecisionLecture(precisionLecture(exercice.etendue)) : "";
    return [texte("Calcule le seuil "), latex(seuil), texte(`, puis détermine par interpolation linéaire sur le polygone ${nom} `), latex(symbole), texte(` (en ${u}, ${precision}).`)];
  };
  switch (phase) {
    case "centres":
      return exercice.variante === "classes" ? [texte(consigneCentres(versMoyennePondereeClasses(exercice)))] : [];
    case "sommes":
      return [texte(CONSIGNE_SOMMES)];
    case "quotient": {
      const c = consigneQuotient(versMoyennePonderee(exercice));
      return [texte(c.avant), latex(c.latex), texte(c.apres)];
    }
    case "mediane":
      return exercice.variante === "discrete" ? fragmentsDeSegments(consigneMedianeDiscrete(versMedianeDiscrete(exercice))) : [];
    case "q1":
      return exercice.variante === "discrete" ? fragmentsDeSegments(consigneQ1(versMedianeDiscrete(exercice))) : [];
    case "q3":
      return exercice.variante === "discrete" ? fragmentsDeSegments(consigneQ3(versMedianeDiscrete(exercice))) : [];
    case "minMaxMode":
      return exercice.variante === "discrete" ? [texte(consigneMinMaxMode(versMedianeDiscrete(exercice)))] : [];
    case "polygone":
      return [texte(CONSIGNE_POLYGONE)];
    case "lectureMediane":
      return lecture("\\dfrac{n}{2}", "la médiane", "Q_2");
    case "lectureQ1":
      return lecture("\\dfrac{n}{4}", "le premier quartile", "Q_1");
    case "lectureQ3":
      return lecture("\\dfrac{3n}{4}", "le troisième quartile", "Q_3");
    case "synthese":
      return [texte("Détermine "), latex(LABEL_X_MIN), texte(", "), latex(LABEL_X_MAX), texte(", l'étendue, la classe modale et le mode de cette série.")];
    case "boxplot":
      return consigneBoxplot(exercice);
    case "tableau":
      return [texte("Calcule, pour chaque valeur, "), latex("(x_i-\\bar{x})^2 \\cdot n_i"), texte(", puis les sommes "), latex("\\Sigma n_i"), texte(" et "), latex("\\Sigma(x_i-\\bar{x})^2 \\cdot n_i"), texte(".")];
    case "varianceEcartType": {
      const v = consigneVariance(exercice.contexte);
      const sg = consigneEcartType(exercice.contexte);
      return [texte(v.avant), latex(v.latex), texte(`${v.apres.replace(" à partir des deux sommes ci-dessus", " à partir des deux sommes de l'étape précédente")} `), texte(sg.avant), latex(sg.latex), texte(sg.apres)];
    }
    case "btIntervalle":
      return [texte(consigneBtIntervalle(exercice))];
    case "btPourcent":
      return [texte(consigneBtPourcent())];
  }
}

function construireEnonceExerciceSynthese(exercice: ExerciceSynthese): SectionExercice {
  return { enteteFragments: enteteExerciceSynthese(exercice), questions: SEQUENCES[exercice.variante].map((phase) => ({ consigne: consigneEcran(exercice, phase) })) };
}

/** Écrans (phases de `SEQUENCES`) couverts par chaque question papier. */
const PHASES_QUESTION: Record<QuestionSynthese, PhaseExerciceSynthese[]> = {
  moyenne: ["centres", "sommes", "quotient"],
  positionDiscrete: ["mediane", "q1", "q3", "minMaxMode"],
  polygone: ["polygone"],
  syntheseClasses: ["lectureMediane", "lectureQ1", "lectureQ3", "synthese"],
  boxplot: ["boxplot"],
  dispersion: ["tableau", "varianceEcartType"],
  bienaymeTchebychev: ["btIntervalle", "btPourcent"],
};

/** Lettres d'étapes (une par écran) couvertes par une question papier. */
function lettresQuestion(exercice: ExerciceSynthese, question: QuestionSynthese): string[] {
  const sequence = SEQUENCES[exercice.variante];
  return PHASES_QUESTION[question].map((ph) => sequence.indexOf(ph)).filter((i) => i >= 0).map((i) => LETTRES_ETAPES[i]);
}

const LETTRES_ETAPES = "abcdefghijklmnopqrstuvwxyz";

const LETTRES = "abcdefgh";

function construireCorrectionExerciceSynthese(exercice: ExerciceSynthese): BlocCorrection[] {
  const etapes: ((ex: ExerciceSynthese, lettre: string) => BlocCorrection[])[] =
    exercice.variante === "discrete"
      ? [correctionMoyenne, correctionPositionDiscrete, correctionBoxplot, correctionDispersion, correctionBienaymeTchebychev]
      : [correctionMoyenne, correctionPolygone, correctionSyntheseClasses, correctionBoxplot, correctionDispersion, correctionBienaymeTchebychev];

  return etapes.flatMap((construire, i) => construire(exercice, LETTRES[i] ?? String(i + 1)));
}

// ============================================================================
// Feuilles enrichies (énoncé papier, réponse brève, corrigé détaillé, barème) — voir
// `.claude/rules/feuilles-evaluations.md`. L'exercice de synthèse est un PROBLÈME : ses questions
// a) b) c)… sont de vraies questions distinctes (moyenne, position, boîte à moustaches, dispersion,
// Bienaymé-Tchebychev), gardées sur papier — seule leur formulation « pas à pas » (centres, sommes
// intermédiaires, tableau à compléter) est retirée de l'énoncé et passe dans le corrigé.
// Les champs enrichis ne passent pas par `avecVirgulesBelges` : `enVirgules` les convertit ici.
// ============================================================================

type QuestionSynthese = "moyenne" | "positionDiscrete" | "polygone" | "syntheseClasses" | "boxplot" | "dispersion" | "bienaymeTchebychev";

function questionsSynthese(exercice: ExerciceSynthese): QuestionSynthese[] {
  return exercice.variante === "discrete"
    ? ["moyenne", "positionDiscrete", "boxplot", "dispersion", "bienaymeTchebychev"]
    : ["moyenne", "polygone", "syntheseClasses", "boxplot", "dispersion", "bienaymeTchebychev"];
}

function enVirgules(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.map(segmentEnVirgules);
}

/** Consigne papier de chaque question : le résultat demandé, sans la démarche pas à pas. */
function consignePapier(exercice: ExerciceSynthese, question: QuestionSynthese): FragmentConsigne[] {
  const unite = exercice.contexte.unite;
  switch (question) {
    case "moyenne":
      return [texte("Calcule la moyenne "), latex("\\bar{x}"), texte(` de cette série (en ${unite}).`)];
    case "dispersion":
      return [texte("Calcule la variance "), latex("V"), texte(" et l'écart-type "), latex("\\sigma"), texte(` de cette série (arrondis au centième ; V en ${unite}², σ en ${unite}).`)];
    case "positionDiscrete":
      return consignePositionDiscrete(exercice);
    case "polygone":
      return [texte("Construis le polygone des effectifs cumulés de cette série.")];
    case "syntheseClasses":
      return consigneSyntheseClasses(exercice);
    case "boxplot":
      return consigneBoxplot(exercice);
    case "bienaymeTchebychev":
      return consigneBienaymeTchebychev(exercice);
  }
}

function enoncePapierExerciceSynthese(exercice: ExerciceSynthese): EnoncePapier {
  const questions = questionsSynthese(exercice);
  return {
    section: { enteteFragments: enVirgules(enteteExerciceSynthese(exercice)), questions: questions.map((q) => ({ consigne: enVirgules(consignePapier(exercice, q)) })) },
    etapesParQuestion: questions.map((q) => lettresQuestion(exercice, q)),
  };
}

function reponseQuestion(exercice: ExerciceSynthese, question: QuestionSynthese): FragmentConsigne[] {
  switch (question) {
    case "moyenne":
      return [latex(virgulesLatex(`\\bar{x} = ${exercice.xBar}\\text{ ${exercice.contexte.unite}}`))];
    case "positionDiscrete": {
      if (exercice.variante !== "discrete") return [];
      const mappe = versMedianeDiscrete(exercice);
      // Réponse brève : les valeurs seules (les seuils restent dans le corrigé).
      return [
        latex(virgulesLatex(`${LABEL_Q1}=${mappe.q1}`)),
        texte(" ; "),
        latex(virgulesLatex(`${LABEL_Q2}=${mappe.mediane}`)),
        texte(" ; "),
        latex(virgulesLatex(`${LABEL_Q3}=${mappe.q3}`)),
        texte(` ; ${formatMinMaxModeAttendueTexte(mappe)}`),
      ];
    }
    case "polygone":
      if (exercice.variante !== "classes") return [];
      return [texte(`sommets ${formatPolygoneAttenduTexte(versMedianeClasses(exercice))}`)];
    case "syntheseClasses": {
      if (exercice.variante !== "classes") return [];
      const mappe = versMedianeClasses(exercice);
      return [
        ...fragmentsDeSegments(formatLectureAttendueTexte(mappe, "q1")),
        texte(" ; "),
        ...fragmentsDeSegments(formatLectureAttendueTexte(mappe, "mediane")),
        texte(" ; "),
        ...fragmentsDeSegments(formatLectureAttendueTexte(mappe, "q3")),
        texte(` ; ${formatSyntheseAttendueTexte(mappe)}`),
      ];
    }
    case "boxplot":
      return [latex(formatCinqNombresLatex(versBoiteMoustaches(exercice).valeurs))];
    case "dispersion": {
      const mappe = versDispersion(exercice);
      return [texte(`${formatVarianceAttendueTexte(mappe)} ; ${formatEcartTypeAttendueTexte(mappe)}`)];
    }
    case "bienaymeTchebychev":
      return [texte(`intervalle ${formatBtIntervalleAttenduTexte(exercice).replace(/^[=≈] /, "")} ; au moins ${formatNombreTexte(exercice.pourcentAttenduBT)} %`)];
  }
}

function reponseBreveExerciceSynthese(exercice: ExerciceSynthese): FragmentConsigne[] {
  return enVirgules(questionsSynthese(exercice).flatMap((question, i) => [texte(`${i === 0 ? "" : " · "}${LETTRES[i]}) `), ...reponseQuestion(exercice, question)]));
}

/** Poids des questions (somme 4, aucun critère sous 0,5 avec le total par défaut). */
const POIDS_QUESTION: Record<QuestionSynthese, number> = {
  moyenne: 1,
  positionDiscrete: 1,
  polygone: 0.5,
  syntheseClasses: 1,
  boxplot: 0.5,
  dispersion: 1,
  bienaymeTchebychev: 0.5,
};

const CRITERE_QUESTION: Record<QuestionSynthese, string> = {
  moyenne: "Moyenne pondérée (Σxᵢnᵢ / Σnᵢ)",
  positionDiscrete: "Quartiles, médiane, minimum, maximum et mode(s)",
  polygone: "Polygone des effectifs cumulés : points (borne supérieure ; effectif cumulé)",
  syntheseClasses: "Quartiles et médiane lus sur le polygone, étendue, classe modale et mode",
  boxplot: "Boîte à moustaches : cinq valeurs placées sur un axe gradué",
  dispersion: "Variance et écart-type (écarts pondérés)",
  bienaymeTchebychev: "Intervalle garanti et pourcentage minimal",
};

function baremeExerciceSynthese(exercice: ExerciceSynthese): BaremeExercice {
  const questions = questionsSynthese(exercice);
  const lettreDe = (q: QuestionSynthese) => lettresQuestion(exercice, q)[0];
  const criteres: CritereBareme[] = questions.map((question) => ({
    sousQuestion: lettreDe(question),
    critere: enVirgules([texte(`${CRITERE_QUESTION[question]} : `), ...reponseQuestion(exercice, question)]),
    points: exercice.variante === "classes" && question === "dispersion" ? 0.5 : POIDS_QUESTION[question],
  }));
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Division par le nombre de valeurs distinctes au lieu de l'effectif total")], cout: `0 pt sur ${lettreDe("moyenne")})` },
    { description: [texte("Écarts au carré non pondérés par les effectifs, ou σ confondu avec V")], cout: `0 pt sur ${lettreDe("dispersion")})` },
    { description: [latex("1-\\dfrac{1}{k}"), texte(" au lieu de "), latex("1-\\dfrac{1}{k^2}"), texte(", ou bornes arrondies vers l'intérieur")], cout: `−0,5 sur ${lettreDe("bienaymeTchebychev")})` },
  ];
  if (exercice.variante === "classes") erreurs.splice(1, 0, { description: [texte("Bornes de classe utilisées au lieu des centres")], cout: `−0,5 sur ${lettreDe("moyenne")})` });
  else erreurs.splice(1, 0, { description: [texte("Quartile pris à la valeur dont l'effectif cumulé ÉGALE le seuil (règle stricte non respectée)")], cout: `−0,5 sur ${lettreDe("positionDiscrete")})` });
  return {
    reponseFinale: reponseBreveExerciceSynthese(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Erreur reportée : une valeur fausse réutilisée correctement dans les questions suivantes")],
      [texte("σ calculé à partir de V non arrondie (écart d'un centième avec la racine de V arrondie)")],
      ...(exercice.variante === "classes" ? [[texte("Quartiles lus graphiquement à une demi-graduation près")]] : []),
    ],
  };
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : une étape par
 * écran (11 en discrète, 13 en classes). Écrans de pure lecture : min, max, mode(s) lus sur le
 * tableau, sommets du polygone placés, boîte à moustaches tracée avec des valeurs déjà trouvées.
 * Méthode imposée question par question ; piège dans les données quand un effectif cumulé vaut
 * EXACTEMENT un seuil en discrète (règle « dépasse strictement »). */
function criteresDifficulte(exercice: ExerciceSynthese): CriteresDifficulte {
  const sequence = SEQUENCES[exercice.variante];
  const lecture = (["minMaxMode", "polygone", "boxplot"] as PhaseExerciceSynthese[]).map((ph) => sequence.indexOf(ph)).filter((i) => i >= 0).map((i) => LETTRES_ETAPES[i]);
  const piege = exercice.variante === "discrete" && (profilExerciceSynthese(exercice).casParticulier ?? "").includes("seuil-atteint") ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeExerciceSynthese(exercice), lecture), methode: 0, piege };
}

const adaptateurEvaluationExerciceSyntheseBrut: AdaptateurFeuilleExercices<ExerciceSynthese> = {
  profilInstance: profilExerciceSynthese,
  libelleCasParticulier: LIBELLE_CAS_MEDIANE,
  titreDocument: "Exercice de synthèse — Statistique descriptive — Évaluation",
  nomFichierBase: "exercice-synthese-statistique-descriptive",
  genererInstance: genererExerciceSynthese,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceExerciceSynthese,
  construireCorrection: construireCorrectionExerciceSynthese,
  criteresDifficulte,
  reponseBreve: reponseBreveExerciceSynthese,
  correctionDetaillee: correctionDetailleeExerciceSynthese,
  bareme: baremeExerciceSynthese,
  enoncePapier: enoncePapierExerciceSynthese,
};

/** Notation décimale belge (virgule) dans tout l'énoncé et la correction (audit chapitre 4). */
export const adaptateurEvaluationExerciceSynthese: AdaptateurFeuilleExercices<ExerciceSynthese> = avecVirgulesBelges(adaptateurEvaluationExerciceSyntheseBrut);
