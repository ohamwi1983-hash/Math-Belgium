import type { ExerciceSynthese } from "../../core/exerciceSynthese.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, EnoncePapier, ErreurFrequente, EtapeCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgPolygoneEffectifs } from "../mediane/polygoneEffectifsSvg";
import { construireSvgBoiteMoustaches } from "../boiteMoustaches/exportEvaluation";
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
  const classesTxt = exercice.classes.map((_, i) => `\\text{${formatClasseTexte(mappe, i)}}`).join(" & ");
  const ns = exercice.classes.map((c) => c.effectif).join(" & ");
  return `\\begin{array}{c|${cols}} \\text{Classe} & ${classesTxt} \\\\ \\hline n_i & ${ns} \\end{array}`;
}

function enteteExerciceSynthese(exercice: ExerciceSynthese): FragmentConsigne[] {
  return [texte(formatEnonceTexte(exercice)), latex(tableauDonneesLatex(exercice))];
}

// ============================================================================
// Question a) — moyenne pondérée (gen32) : centres (classes uniquement) + sommes + quotient.
// ============================================================================

function consigneMoyenne(exercice: ExerciceSynthese): FragmentConsigne[] {
  const unite = exercice.contexte.unite;
  if (exercice.variante === "classes") {
    return [texte(`Calcule le centre de chaque classe, les sommes intermédiaires `), latex("\\Sigma(x_i \\cdot n_i)"), texte(" et "), latex("\\Sigma n_i"), texte(`, puis la moyenne `), latex("\\bar{x}"), texte(` de cette série (en ${unite}).`)];
  }
  return [texte(`Calcule les sommes intermédiaires `), latex("\\Sigma(x_i \\cdot n_i)"), texte(" et "), latex("\\Sigma n_i"), texte(`, puis la moyenne `), latex("\\bar{x}"), texte(` de cette série (en ${unite}).`)];
}

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

function consignePositionDiscrete(exercice: ExerciceSynthese): FragmentConsigne[] {
  const unite = exercice.contexte.unite;
  return [
    texte(
      `Détermine la médiane, le premier quartile Q1 et le troisième quartile Q3 de cette série (en ${unite} — seuils n/4, n/2, 3n/4, règle stricte : première valeur dont l'effectif cumulé dépasse le seuil), ainsi que son minimum, son maximum et son (ses) mode(s).`,
    ),
  ];
}

function correctionPositionDiscrete(exercice: ExerciceSynthese, lettre: string): BlocCorrection[] {
  if (exercice.variante !== "discrete") throw new Error("correctionPositionDiscrete : réservé à la variante 'discrete'");
  const mappe = versMedianeDiscrete(exercice);
  return [
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettre}) Médiane : ${formatMedianeAttendueTexte(mappe)}. `),
        texte(`Q1 : ${formatQ1AttendueTexte(mappe)}. `),
        texte(`Q3 : ${formatQ3AttendueTexte(mappe)}. `),
        texte(formatMinMaxModeAttendueTexte(mappe) + "."),
      ],
    },
  ];
}

function consignePolygone(): FragmentConsigne[] {
  return [texte("Construis le polygone des effectifs cumulés de cette série (un point fixe à l'origine, puis un point par classe en (borne supérieure ; effectif cumulé), reliés par des segments).")];
}

function correctionPolygone(exercice: ExerciceSynthese, lettre: string): BlocCorrection[] {
  if (exercice.variante !== "classes") throw new Error("correctionPolygone : réservé à la variante 'classes'");
  const mappe = versMedianeClasses(exercice);
  return [{ type: "paragraphe", fragments: [texte(`${lettre}) Sommets du polygone : ${formatPolygoneAttenduTexte(mappe)}.`)] }];
}

function consigneSyntheseClasses(exercice: ExerciceSynthese): FragmentConsigne[] {
  const unite = exercice.contexte.unite;
  return [
    texte(
      `À l'aide de ce polygone (ou par le calcul), détermine l'étendue, le premier quartile Q1, la médiane, le troisième quartile Q3 (en ${unite}), ainsi que la classe modale et le mode de cette série.`,
    ),
  ];
}

function correctionSyntheseClasses(exercice: ExerciceSynthese, lettre: string): BlocCorrection[] {
  if (exercice.variante !== "classes") throw new Error("correctionSyntheseClasses : réservé à la variante 'classes'");
  const mappe = versMedianeClasses(exercice);
  return [
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettre}) Seuil Q1 = n/4 = ${formatNombreTexte(exercice.seuilQ1)} → ${formatLectureAttendueTexte(mappe, "q1")}. `),
        texte(`Seuil médiane = n/2 = ${formatNombreTexte(exercice.seuil)} → ${formatLectureAttendueTexte(mappe, "mediane")}. `),
        texte(`Seuil Q3 = 3n/4 = ${formatNombreTexte(exercice.seuilQ3)} → ${formatLectureAttendueTexte(mappe, "q3")}. `),
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

function consigneDispersion(exercice: ExerciceSynthese): FragmentConsigne[] {
  return [
    texte("Complète le tableau des écarts quadratiques pondérés à la moyenne "),
    latex("(x_i-\\bar{x})^2 \\cdot n_i"),
    texte(", puis calcule la variance "),
    latex("V"),
    texte(" et l'écart-type "),
    latex("\\sigma = \\sqrt{V}"),
    texte(` de cette série (arrondis à 2 décimales, en ${exercice.contexte.unite}² pour la variance, en ${exercice.contexte.unite} pour l'écart-type).`),
  ];
}

function correctionDispersion(exercice: ExerciceSynthese, lettre: string): BlocCorrection[] {
  const mappe = versDispersion(exercice);
  const libellesLignes = ["x_i (ou centre)", "n_i", "(x_i-x̄)² · n_i"];
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

function construireEnonceExerciceSynthese(exercice: ExerciceSynthese): SectionExercice {
  const questions =
    exercice.variante === "discrete"
      ? [
          { consigne: consigneMoyenne(exercice) },
          { consigne: consignePositionDiscrete(exercice) },
          { consigne: consigneBoxplot(exercice) },
          { consigne: consigneDispersion(exercice) },
          { consigne: consigneBienaymeTchebychev(exercice) },
        ]
      : [
          { consigne: consigneMoyenne(exercice) },
          { consigne: consignePolygone() },
          { consigne: consigneSyntheseClasses(exercice) },
          { consigne: consigneDispersion(exercice) },
          { consigne: consigneBoxplot(exercice) },
          { consigne: consigneBienaymeTchebychev(exercice) },
        ];

  return { enteteFragments: enteteExerciceSynthese(exercice), questions };
}

const LETTRES = "abcdefgh";

function construireCorrectionExerciceSynthese(exercice: ExerciceSynthese): BlocCorrection[] {
  const etapes: ((ex: ExerciceSynthese, lettre: string) => BlocCorrection[])[] =
    exercice.variante === "discrete"
      ? [correctionMoyenne, correctionPositionDiscrete, correctionBoxplot, correctionDispersion, correctionBienaymeTchebychev]
      : [correctionMoyenne, correctionPolygone, correctionSyntheseClasses, correctionDispersion, correctionBoxplot, correctionBienaymeTchebychev];

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
    : ["moyenne", "polygone", "syntheseClasses", "dispersion", "boxplot", "bienaymeTchebychev"];
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
    etapesParQuestion: questions.map((_, i) => [LETTRES[i]]),
  };
}

const CORRECTION_QUESTION: Record<QuestionSynthese, (ex: ExerciceSynthese, lettre: string) => BlocCorrection[]> = {
  moyenne: correctionMoyenne,
  positionDiscrete: correctionPositionDiscrete,
  polygone: correctionPolygone,
  syntheseClasses: correctionSyntheseClasses,
  boxplot: correctionBoxplot,
  dispersion: correctionDispersion,
  bienaymeTchebychev: correctionBienaymeTchebychev,
};

function methodeQuestion(exercice: ExerciceSynthese, question: QuestionSynthese): FragmentConsigne[] {
  switch (question) {
    case "moyenne":
      return [
        texte(exercice.variante === "classes" ? "Moyenne pondérée, avec le centre de chaque classe : " : "Moyenne pondérée : "),
        latex("\\bar{x} = \\dfrac{\\Sigma(x_i \\cdot n_i)}{\\Sigma n_i}"),
      ];
    case "positionDiscrete":
      return [texte("Effectifs cumulés, puis seuils n/4, n/2 et 3n/4 : chaque quartile est la première valeur dont l'effectif cumulé dépasse strictement son seuil.")];
    case "polygone":
      return [texte("Un point de départ à la borne inférieure de la première classe (effectif cumulé 0), puis un point (borne supérieure ; effectif cumulé) par classe, reliés par des segments.")];
    case "syntheseClasses":
      return [texte("Sur le polygone, Q1, la médiane et Q3 sont les abscisses des points d'ordonnée n/4, n/2 et 3n/4 (lecture ou interpolation linéaire dans la classe).")];
    case "boxplot":
      return [texte("La boîte va de Q1 à Q3, un trait marque la médiane, les moustaches vont jusqu'au minimum et au maximum.")];
    case "dispersion":
      return [texte("Écarts à la moyenne au carré, pondérés par les effectifs : "), latex("V = \\dfrac{\\Sigma (x_i-\\bar{x})^2 \\cdot n_i}{\\Sigma n_i}"), texte(" et "), latex("\\sigma = \\sqrt{V}")];
    case "bienaymeTchebychev":
      return [texte("Au moins "), latex("1-\\dfrac{1}{k^2}"), texte(" de l'effectif se trouve dans "), latex("[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]"), texte(", bornes arrondies vers l'extérieur.")];
  }
}

const PIEGE_QUESTION: Partial<Record<QuestionSynthese, string>> = {
  moyenne: "On divise par l'effectif total Σnᵢ, pas par le nombre de valeurs (ou de classes) distinctes.",
  dispersion: "Chaque écart au carré est multiplié par son effectif avant la somme ; σ est la racine de V.",
};

/** Libellés du tableau des écarts (`correctionDispersion`), en LaTeX. */
const LIBELLE_LATEX_TABLEAU: Record<string, string> = {
  "x_i (ou centre)": "x_i",
  n_i: "n_i",
  "(x_i-x̄)² · n_i": "(x_i-\\bar{x})^2 \\cdot n_i",
};

/** Bloc du corrigé historique → lignes du corrigé détaillé (préfixe « a) » retiré, tableau des écarts
 * en LaTeX). */
function blocsVersLignes(blocs: BlocCorrection[], sousQuestion: string): EtapeCorrection[] {
  return blocs.flatMap((bloc, i): EtapeCorrection[] => {
    const label = i === blocs.length - 1 ? "Conclusion" : "Calcul";
    if (bloc.type === "paragraphe") {
      const [premier, ...suite] = bloc.fragments;
      const fragments = premier && premier.type === "texte" ? [{ ...premier, valeur: premier.valeur.replace(/^[a-h]?\) /, "") }, ...suite] : bloc.fragments;
      return fragments.some((f) => f.valeur.trim() !== "") ? [{ label, sousQuestion, fragments }] : [];
    }
    if (bloc.type === "tableau") {
      // Tableau VERTICAL (une ligne par valeur, 3 colonnes) : l'horizontal déborde du corrigé dès 6 valeurs.
      const entetes = bloc.libellesLignes.map((libelle) => LIBELLE_LATEX_TABLEAU[libelle] ?? `\\text{${libelle}}`).join(" & ");
      const lignes = (bloc.valeursParLigne[0] ?? []).map((_, k) => bloc.valeursParLigne.map((ligne) => ligne[k]).join(" & ")).join(" \\\\ ");
      const colonnes = bloc.libellesLignes.map(() => "c").join("|");
      return [{ label, sousQuestion, fragments: [latex(virgulesLatex(`\\begin{array}{${colonnes}} ${entetes} \\\\ \\hline ${lignes} \\end{array}`))] }];
    }
    return [];
  });
}

function correctionDetailleeExerciceSynthese(exercice: ExerciceSynthese): EtapeCorrection[] {
  return questionsSynthese(exercice).flatMap((question, i) => {
    const lettre = LETTRES[i];
    const lignes: EtapeCorrection[] = [{ label: "Méthode", sousQuestion: lettre, fragments: methodeQuestion(exercice, question) }];
    lignes.push(...blocsVersLignes(CORRECTION_QUESTION[question](exercice, ""), lettre));
    if (question === "boxplot") {
      const boite = versBoiteMoustaches(exercice);
      lignes.push({
        label: "Graphique",
        sousQuestion: lettre,
        fragments: [texte("Boîte à moustaches attendue :")],
        figureHtml: construireSvgBoiteMoustaches(boite.bornePlage, [{ valeurs: boite.valeurs }], true),
      });
    }
    if (question === "polygone" && exercice.variante === "classes") {
      lignes.push({
        label: "Graphique",
        sousQuestion: lettre,
        fragments: [texte("Polygone des effectifs cumulés, avec la lecture de Q₁, Q₂ et Q₃ utilisée à la question suivante :")],
        figureHtml: construireSvgPolygoneEffectifs(versMedianeClasses(exercice)),
      });
    }
    const piege = PIEGE_QUESTION[question];
    if (piege) lignes.push({ label: "Piège", sousQuestion: lettre, fragments: [texte(piege)] });
    return lignes.map((l) => ({ ...l, fragments: enVirgules(l.fragments) }));
  });
}

function reponseQuestion(exercice: ExerciceSynthese, question: QuestionSynthese): FragmentConsigne[] {
  switch (question) {
    case "moyenne":
      return [latex(virgulesLatex(`\\bar{x} = ${exercice.xBar}\\text{ ${exercice.contexte.unite}}`))];
    case "positionDiscrete": {
      if (exercice.variante !== "discrete") return [];
      const mappe = versMedianeDiscrete(exercice);
      // Réponse brève : les valeurs seules (les seuils n/4, n/2, 3n/4 restent dans le corrigé).
      const sansSeuil = (t: string) => t.replace(/seuil = [^,]+, /, "");
      return [texte(`${sansSeuil(formatQ1AttendueTexte(mappe))} ; ${sansSeuil(formatMedianeAttendueTexte(mappe))} ; ${sansSeuil(formatQ3AttendueTexte(mappe))} ; ${formatMinMaxModeAttendueTexte(mappe)}`)];
    }
    case "polygone":
      if (exercice.variante !== "classes") return [];
      return [texte(`sommets ${formatPolygoneAttenduTexte(versMedianeClasses(exercice))}`)];
    case "syntheseClasses": {
      if (exercice.variante !== "classes") return [];
      const mappe = versMedianeClasses(exercice);
      return [texte(`${formatLectureAttendueTexte(mappe, "q1")} ; ${formatLectureAttendueTexte(mappe, "mediane")} ; ${formatLectureAttendueTexte(mappe, "q3")} ; ${formatSyntheseAttendueTexte(mappe)}`)];
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
  bienaymeTchebychev: "Intervalle garanti et pourcentage minimal 1 − 1/k²",
};

function baremeExerciceSynthese(exercice: ExerciceSynthese): BaremeExercice {
  const questions = questionsSynthese(exercice);
  const lettreDe = (q: QuestionSynthese) => LETTRES[questions.indexOf(q)];
  const criteres: CritereBareme[] = questions.map((question, i) => ({
    sousQuestion: LETTRES[i],
    critere: enVirgules([texte(`${CRITERE_QUESTION[question]} : `), ...reponseQuestion(exercice, question)]),
    points: exercice.variante === "classes" && question === "dispersion" ? 0.5 : POIDS_QUESTION[question],
  }));
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Division par le nombre de valeurs distinctes au lieu de l'effectif total")], cout: `0 pt sur ${lettreDe("moyenne")})` },
    { description: [texte("Écarts au carré non pondérés par les effectifs, ou σ confondu avec V")], cout: `0 pt sur ${lettreDe("dispersion")})` },
    { description: [texte("1 − 1/k au lieu de 1 − 1/k², ou bornes arrondies vers l'intérieur")], cout: `−0,5 sur ${lettreDe("bienaymeTchebychev")})` },
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

const adaptateurEvaluationExerciceSyntheseBrut: AdaptateurFeuilleExercices<ExerciceSynthese> = {
  titreDocument: "Exercice de synthèse — Statistique descriptive — Évaluation",
  nomFichierBase: "exercice-synthese-statistique-descriptive",
  genererInstance: genererExerciceSynthese,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceExerciceSynthese,
  construireCorrection: construireCorrectionExerciceSynthese,
  difficulte: (exercice) => (exercice.variante === "classes" ? 3 : 2),
  reponseBreve: reponseBreveExerciceSynthese,
  correctionDetaillee: correctionDetailleeExerciceSynthese,
  bareme: baremeExerciceSynthese,
  enoncePapier: enoncePapierExerciceSynthese,
  dureeMinutes: 15,
};

/** Notation décimale belge (virgule) dans tout l'énoncé et la correction (audit chapitre 4). */
export const adaptateurEvaluationExerciceSynthese: AdaptateurFeuilleExercices<ExerciceSynthese> = avecVirgulesBelges(adaptateurEvaluationExerciceSyntheseBrut);
