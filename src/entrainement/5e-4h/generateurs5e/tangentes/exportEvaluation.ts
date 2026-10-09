import type {
  ExerciceTangente,
  ExerciceTangenteDoubleTangence,
  ExerciceTangenteHorizontale,
  ExerciceTangentePointDonne,
} from "../../core5e/tangentes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { consigneGenerale, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex } from "../../ui5e/formatTangentes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangente } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTangente>` pour 5gen28 ("Tangentes") — feuille
 * d'évaluation. AUCUN graphique : les 3 variantes (`core5e/tangentes.types.ts`) sont purement
 * algébriques côté écran (`App5gen28.tsx` — `EtapeSubstituerTangente`/`EtapeChampUniqueTangente`/
 * `EtapeRacinesTangente`/`EtapeCoordonneesTangente`/`EtapeTangenteEnP`, aucun composant Mafs/SVG),
 * donc `enteteFragments` uniquement (jamais `enteteHtml`), contrairement à
 * `lectureGraphiqueLimites`/`exportEvaluation.ts`.
 *
 * ⚠️ Piège `enteteFragments` (toujours rendu en mode KaTeX `displayMode:true` par
 * `assemblerEvaluationHtml.ts`) : `f(x)` ET (sauf variante C) `f'(x)` sont TOUJOURS regroupés dans
 * un SEUL fragment `latex()` via `formatTermesDonneesLatex(exercice).join(" \\quad ")` — jamais
 * deux fragments `latex()` distincts entrelacés de texte, qui se rendraient chacun comme un bloc
 * disjoint (voir `suitesArithmetiques`/`suitesGeometriques`/`geometrieCercle` pour le même motif
 * `.join(" \\quad ")` déjà établi dans ce chantier 5e). `question.consigne`/`BlocCorrection.paragraphe`
 * n'ont pas cette contrainte (jamais `displayMode:true`), mais on n'y a pas eu besoin de mélanger
 * plusieurs fragments LaTeX courts ici — un texte pur suffit, les valeurs numériques (a, p, q déjà
 * connues) étant simplement interpolées en texte brut, exactement comme `consigneGenerale()`
 * (`ui5e/formatTangentes.ts`) le fait déjà pour "x=a"/"x=p".
 *
 * **Condensation écrans→questions papier** (jamais une question par micro-écran,
 * `moteur5e/typesTangentes.ts::ordreEcransTangente`, JAMAIS importé ici — voir plus bas) :
 * - **A "pointDonne"** (écrans `substituer`+`tangente`) → 1 question : `consigneGenerale()` déjà
 *   utilisée à l'écran (contient x=a) + "en détaillant le calcul de f(a) et f'(a)".
 * - **B "horizontale"** (écrans `resoudre`+`coordonnees`) → 1 question : `consigneGenerale()` déjà
 *   formulée en 2 temps ("le(s) point(s)... HORIZONTALE, puis donne les coordonnées...") + demande
 *   de justification.
 * - **C "doubleTangence"** (écrans `tangenteEnP`+`trouverQ`+`verifierPente`, 3 écrans) → 2 questions
 *   (jamais 3, jamais 1 seule vu la charge : dériver f'(x), tangente en p, PUIS trouver q et
 *   vérifier la pente) : a) dérivée + tangente en p, b) second point q + vérification de la pente.
 *
 * `construireCorrection` RESYNTHÉTISÉE exclusivement via `formatReponseAttenduePhaseLatex`
 * (`ui5e/formatTangentes.ts`, déjà la source de vérité du récapitulatif final côté écran) — jamais
 * une valeur recalculée indépendamment ici. Les noms d'écran ("substituer", "tangente", "resoudre",
 * "coordonnees", "tangenteEnP", "trouverQ", "verifierPente") sont passés en LITTÉRAUX DE CHAÎNE :
 * TypeScript les vérifie structurellement contre le type `EcranTangente` que la fonction attend
 * sans qu'on ait besoin d'IMPORTER ce type (ni aucun autre symbole) depuis `moteur5e/` — même
 * patron que `generateurs5e/asymptoteOblique/exportEvaluation.ts` (voir son commentaire de tête).
 * AUCUN import de `moteur5e/` dans ce fichier.
 *
 * `regroupable` : FAUX — explicitement exclu par sa propre doc (`export/genererFeuilleExercices.ts`) :
 * la consigne n'est générique pour AUCUNE des 3 variantes (variante A interpole "x=a", variante C
 * interpole "x=p", variante B a une consigne fixe mais différente des deux autres — donc jamais UNE
 * consigne CONSTANTE commune à toutes les instances tirées) ET la variante C a systématiquement 2
 * questions par instance, jamais 1 seule — 2 des 3 conditions d'exclusion sont réunies, `regroupable`
 * reste donc `false` (valeur par défaut, laissée explicite ici pour documenter la décision).
 */

function construireEnteteTangente(exercice: ExerciceTangente): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(formatTermesDonneesLatex(exercice).join(" \\quad "))];
}

function construireQuestionsPointDonne(exercice: ExerciceTangentePointDonne): QuestionExercice[] {
  return [
    {
      consigne: [texte(`${consigneGenerale(exercice)}, en détaillant le calcul de f(a) et f'(a) avant d'écrire l'équation.`)],
      reponse: { type: "lignes", nombre: 4 },
    },
  ];
}

function construireQuestionsHorizontale(exercice: ExerciceTangenteHorizontale): QuestionExercice[] {
  return [
    {
      consigne: [texte(`${consigneGenerale(exercice)} Détaille ta démarche : résous d'abord f'(x)=0, puis calcule l'ordonnée de chaque point trouvé.`)],
      reponse: { type: "lignes", nombre: 5 },
    },
  ];
}

function construireQuestionsDoubleTangence(exercice: ExerciceTangenteDoubleTangence): QuestionExercice[] {
  return [
    {
      consigne: [
        texte(
          `${consigneGenerale(exercice)} Dérive d'abord f(x) pour obtenir f'(x), puis détermine l'équation de la tangente t au point d'abscisse x=${exercice.p}.`,
        ),
      ],
      reponse: { type: "lignes", nombre: 4 },
    },
    {
      consigne: [
        texte(
          `Détermine le second point de tangence, d'abscisse q, en résolvant f(x)=t(x) (une racine double en x=${exercice.p} est déjà connue). Calcule ensuite f'(q) pour vérifier qu'il s'agit bien d'une tangence, et pas d'une simple intersection.`,
        ),
      ],
      reponse: { type: "lignes", nombre: 4 },
    },
  ];
}

function construireEnonceTangente(exercice: ExerciceTangente): SectionExercice {
  const questions =
    exercice.variante === "pointDonne"
      ? construireQuestionsPointDonne(exercice)
      : exercice.variante === "horizontale"
        ? construireQuestionsHorizontale(exercice)
        : construireQuestionsDoubleTangence(exercice);
  return { enteteFragments: construireEnteteTangente(exercice), questions };
}

function construireCorrectionPointDonne(exercice: ExerciceTangentePointDonne): BlocCorrection[] {
  const [fA, fPrimeA] = formatReponseAttenduePhaseLatex(exercice, "substituer");
  const [tangente] = formatReponseAttenduePhaseLatex(exercice, "tangente");
  return [
    { type: "paragraphe", fragments: [latex(`${fA} \\quad ${fPrimeA}`)] },
    { type: "paragraphe", fragments: [texte("Équation de la tangente : "), latex(tangente), texte(".")] },
  ];
}

function construireCorrectionHorizontale(exercice: ExerciceTangenteHorizontale): BlocCorrection[] {
  const [racines] = formatReponseAttenduePhaseLatex(exercice, "resoudre");
  const coordonnees = formatReponseAttenduePhaseLatex(exercice, "coordonnees");
  return [
    { type: "paragraphe", fragments: [texte("Solution(s) de f'(x)=0 : "), latex(racines), texte(".")] },
    { type: "paragraphe", fragments: [texte("Point(s) de tangence : "), latex(coordonnees.join(" \\quad ")), texte(".")] },
  ];
}

function construireCorrectionDoubleTangence(exercice: ExerciceTangenteDoubleTangence): BlocCorrection[] {
  const [fPrimeP, tangenteP] = formatReponseAttenduePhaseLatex(exercice, "tangenteEnP");
  const [qConfirme] = formatReponseAttenduePhaseLatex(exercice, "trouverQ");
  const [fPrimeQ] = formatReponseAttenduePhaseLatex(exercice, "verifierPente");
  return [
    { type: "paragraphe", fragments: [latex(fPrimeP)] },
    { type: "paragraphe", fragments: [texte("Équation de la tangente t : "), latex(tangenteP), texte(".")] },
    { type: "paragraphe", fragments: [texte("Second point de tangence : "), latex(qConfirme), texte(".")] },
    {
      type: "paragraphe",
      fragments: [
        texte("Vérification de la pente : "),
        latex(fPrimeQ),
        texte(" — égale à "),
        latex(fPrimeP),
        texte(", double tangence confirmée."),
      ],
    },
  ];
}

function construireCorrectionTangente(exercice: ExerciceTangente): BlocCorrection[] {
  switch (exercice.variante) {
    case "pointDonne":
      return construireCorrectionPointDonne(exercice);
    case "horizontale":
      return construireCorrectionHorizontale(exercice);
    case "doubleTangence":
      return construireCorrectionDoubleTangence(exercice);
  }
}

export const adaptateurEvaluationTangentes: AdaptateurFeuilleExercices<ExerciceTangente> = {
  titreDocument: "Tangentes — Évaluation",
  nomFichierBase: "tangentes",
  genererInstance: genererExerciceTangente,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceTangente,
  construireCorrection: construireCorrectionTangente,
  regroupable: false,
};
