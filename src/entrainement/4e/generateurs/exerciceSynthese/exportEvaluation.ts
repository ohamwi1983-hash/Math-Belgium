import type { ExerciceSynthese } from "../../core/exerciceSynthese.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
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
    latex(`\\bar{x} = \\dfrac{${exercice.sommeXN}}{${exercice.n}} = ${formatNombreTexte(exercice.xBar)}\\text{ ${exercice.contexte.unite}}`),
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

export const adaptateurEvaluationExerciceSynthese: AdaptateurFeuilleExercices<ExerciceSynthese> = {
  titreDocument: "Exercice de synthèse — Statistique descriptive — Évaluation",
  nomFichierBase: "exercice-synthese-statistique-descriptive",
  genererInstance: genererExerciceSynthese,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceExerciceSynthese,
  construireCorrection: construireCorrectionExerciceSynthese,
};
