import type { ExerciceQuelAngle, FonctionTrig } from "../../core/quelAngle.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { DOMAINE_LATEX, formatEnonceLatex, formatTermesSolutionsLatex, texteAideQuadrants } from "../../ui/formatQuelAngle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceQuelAngle } from "./index";
import { LATEX_COS, LATEX_SIN, LATEX_TAN } from "../valeursRemarquables/tables";
import { LIBELLE_CAS_QUEL_ANGLE, profilQuelAngle } from "../profilsEvaluation4eCh5";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceQuelAngle>` pour gen18 (Trouver l'angle connaissant
 * sin, cos ou tan — chapitre 3, `AppQuelAngle.tsx`) — voir `generateurs/analyseFonction/exportWord.ts`
 * pour le mécanisme générique de référence.
 *
 * Écran → question : `AppQuelAngle.tsx`/`EtapeQuelAngle.tsx` n'a qu'UN seul écran (pas de `Phase`,
 * voir le commentaire de tête d'`AppQuelAngle.tsx`) — l'énoncé fixe (`sin α = k`/`cos α = k`/
 * `tan α = k`, `α ∈ [0°,360°[`, `formatEnonceLatex`/`DOMAINE_LATEX` de `ui/formatQuelAngle.ts`,
 * déjà les fonctions utilisées côté écran) suivi d'une interface "add-as-needed" où l'élève choisit
 * "Pas de solution"/"Au moins une solution" puis saisit chaque valeur. Ceci devient ici UNE seule
 * question par instance, à consigne GÉNÉRIQUE — reprise mot pour mot du texte affiché à l'écran
 * (`EtapeQuelAngle.tsx`, `<p className="prompt-text">`) : "Trouve toutes les valeurs de α
 * satisfaisant cette équation, dans l'intervalle indiqué." — cette phrase ne varie JAMAIS avec la
 * variante (sin/cos/tan) ni avec les valeurs tirées (`angleReference`/`signeK`/`solutions`), qui
 * n'apparaissent que dans `enteteFragments` (l'équation elle-même). Le choix "Pas de solution" vs
 * "Au moins une solution" de l'écran interactif n'a pas d'équivalent papier distinct : sur une
 * feuille imprimée, l'élève écrit directement les valeurs trouvées (ou "aucune solution" s'il croit
 * qu'il n'y en a pas) en réponse à la même consigne, jamais un choix structurel séparé à reproduire.
 *
 * `regroupable: true` — remplit exactement les 3 conditions de `AdaptateurFeuilleExercices.regroupable`
 * (voir `export/genererFeuilleExercices.ts`) : (1) toujours UNE seule question par instance ; (2) une
 * consigne GÉNÉRIQUE, constante quelle que soit la variante ou les valeurs tirées (`CONSIGNE_GENERALE`
 * ci-dessous, jamais interpolée) — l'équation à résoudre, elle-même dépendante de l'instance, reste
 * dans `enteteFragments`, jamais dans la consigne ; (3) aucun `enteteHtml` (l'équation est un simple
 * fragment LaTeX inline, aucun graphique/croquis requis pour l'énoncé papier — l'aide géométrique au
 * cercle trigonométrique, `AideQuelAngle.tsx`, n'est qu'un outil d'aide à l'écran, jamais reproduite
 * dans l'énoncé imprimé). `/admin` de Math-Belgium peut donc regrouper plusieurs équations demandées
 * (éventuellement de variantes différentes, sin/cos/tan) sous UNE seule consigne imprimée, chaque
 * équation devenant une ligne a)/b)/c)…
 *
 * Aucune zone de réponse vierge (`reponse: { type: "lignes", nombre: 0 }`, même décision documentée
 * que `comparaisonSeries/exportEvaluation.ts`) : la réponse attendue est une courte liste de valeurs
 * d'angle (1 ou 2 nombres), jamais un calcul à dérouler sur plusieurs lignes — contrairement à
 * `analyseFonction`/`simplification`, qui réservent explicitement de la place à un calcul écrit.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`exercice.solutions`, déjà dédupliquée et triée croissant à la génération — voir
 * `core/quelAngle.types.ts`), jamais recalculée indépendamment ici, et réutilise directement les
 * fonctions de formatage déjà utilisées côté écran interactif (`ui/formatQuelAngle.ts`) plutôt que
 * d'en resynthétiser de nouvelles : `texteAideQuadrants` (déjà le texte de l'aide UNIQUE de l'écran,
 * révèle le(s) quadrant(s) concerné(s) — pour `tan`, mentionne aussi la période de 180°, seule
 * variante où deux quadrants "opposés" donnent chacun exactement une solution) comme amorce de
 * raisonnement, puis `formatTermesSolutionsLatex` (version "un fragment KaTeX par solution", déjà
 * utilisée pour le rendu final "bloc fitter" à l'écran, `ResultatPanelQuelAngle.tsx`) pour lister
 * TOUTES les solutions correctes, jamais une seule.
 */

const CONSIGNE_GENERALE = "Trouve toutes les valeurs de α satisfaisant cette équation, dans l'intervalle indiqué.";

function construireEnonceQuelAngle(exercice: ExerciceQuelAngle): SectionExercice {
  return {
    enteteFragments: [latex(formatEnonceLatex(exercice)), texte(", avec "), latex(`\\alpha \\in ${DOMAINE_LATEX}`), texte(".")],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }],
  };
}

function construireCorrectionQuelAngle(exercice: ExerciceQuelAngle): BlocCorrection[] {
  const termesSolutions = formatTermesSolutionsLatex(exercice);

  return [
    { type: "paragraphe", fragments: [texte(texteAideQuadrants(exercice))] },
    {
      type: "paragraphe",
      fragments:
        exercice.solutions.length === 0
          ? [texte(`Pas de solution : ${exercice.fonction} α est toujours compris entre −1 et 1, et ici |k| > 1.`)]
          : [texte(termesSolutions.length > 1 ? "Solutions : " : "Solution : "), ...termesSolutions.map((terme) => latex(terme))],
      bloc: true,
    },
  ];
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Un seul écran : l'énoncé imprimé est l'équation suivie de la consigne de l'écran (le choix « pas de
// solution / au moins une solution » de l'écran n'a pas d'équivalent papier : l'élève écrit les
// solutions, ou qu'il n'y en a pas). `regroupable` reste vrai : l'énoncé papier est identique à la
// consigne d'écran, le regroupement de plusieurs équations sous une consigne ne perd donc rien.

function enoncePapier(exercice: ExerciceQuelAngle): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("On considère l'équation "), latex(formatEnonceLatex(exercice)), texte(", avec "), latex(`\\alpha \\in ${DOMAINE_LATEX}`), texte(". Trouve toutes les valeurs de α satisfaisant cette équation dans cet intervalle.")],
      questions: [],
    },
  };
}

const TABLES: Record<FonctionTrig, Record<number, string>> = { sin: LATEX_SIN, cos: LATEX_COS, tan: LATEX_TAN };
const NOM: Record<FonctionTrig, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };

function correctionDetaillee(exercice: ExerciceQuelAngle): EtapeCorrection[] {
  const solutions: FragmentConsigne[] = formatTermesSolutionsLatex(exercice).map((t) => latex(t));
  if (exercice.angleReference === null) {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte(texteAideQuadrants(exercice))] },
      { label: "Conclusion", sousQuestion: "a", fragments: [texte("Ici "), latex(`|k| = ${exercice.magnitudeHorsDomaineLatex} > 1`), texte(" : l'équation n'a pas de solution.")] },
      { label: "Piège", sousQuestion: "a", fragments: [texte("Ne pas chercher d'angle : aucun point du cercle n'a une coordonnée plus grande que 1 en valeur absolue.")] },
    ];
  }
  const ref = exercice.angleReference;
  const lignes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "a", fragments: [texte(`Angle du premier quadrant dont la valeur est |k| : `), latex(`${NOM[exercice.fonction]}\\,${ref}^\\circ = ${TABLES[exercice.fonction][ref]}`)] },
    { label: "Calcul", sousQuestion: "a", fragments: [texte(texteAideQuadrants(exercice))] },
    { label: "Conclusion", sousQuestion: "a", fragments: solutions },
    {
      label: "Piège",
      sousQuestion: "a",
      fragments: [
        exercice.solutions.length === 1
          ? texte("Une seule solution dans [0° ; 360°[ : la valeur est atteinte en un seul point du cercle (sur un axe).")
          : exercice.fonction === "tan"
            ? texte("La tangente se répète tous les 180° : la deuxième solution est la première + 180°, pas 180° − la première.")
            : texte("Deux solutions dans [0° ; 360°[ : ne pas oublier l'angle symétrique."),
      ],
    },
  ];
  return lignes;
}

function reponseBreve(exercice: ExerciceQuelAngle): FragmentConsigne[] {
  return formatTermesSolutionsLatex(exercice).map((t) => latex(t));
}

function bareme(exercice: ExerciceQuelAngle): BaremeExercice {
  if (exercice.solutions.length === 0) {
    return {
      reponseFinale: reponseBreve(exercice),
      criteres: [
        { sousQuestion: "a", critere: [texte(`Rappel : ${exercice.fonction} α est compris entre −1 et 1`)], points: 2 },
        { sousQuestion: "a", critere: [texte("Conclusion : pas de solution")], points: 2 },
      ],
      erreursFrequentes: [{ description: [texte("Un angle proposé malgré |k| > 1")], cout: "0 pt" }],
    };
  }
  const deux = exercice.solutions.length === 2;
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: deux
      ? [
          { sousQuestion: "a", critere: [texte(`Angle de référence ${exercice.angleReference}° (valeur remarquable)`)], points: 1 },
          { sousQuestion: "a", critere: [texte(`Première solution : ${exercice.solutions[0]}°`)], points: 1.5 },
          { sousQuestion: "a", critere: [texte(`Deuxième solution : ${exercice.solutions[1]}°`)], points: 1.5 },
        ]
      : [
          { sousQuestion: "a", critere: [texte("Valeur reconnue sur un axe du cercle")], points: 2 },
          { sousQuestion: "a", critere: [texte(`Solution unique : ${exercice.solutions[0]}°`)], points: 2 },
        ],
    erreursFrequentes: [
      deux
        ? { description: [texte("Une seule solution donnée alors qu'il y en a deux")], cout: "−1,5" }
        : { description: [texte("Une deuxième solution ajoutée à tort (symétrique pris sur l'axe)")], cout: "−1" },
      { description: [texte("Solution hors de [0° ; 360°[ (angle négatif non ramené)")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Solutions justifiées par un cercle trigonométrique dessiné")]],
  };
}

/** ★ pas de solution ou valeur sur un axe ; ★★ deux solutions. */
function difficulte(exercice: ExerciceQuelAngle): 1 | 2 | 3 {
  return exercice.solutions.length === 2 ? 2 : 1;
}

export const adaptateurEvaluationQuelAngle: AdaptateurFeuilleExercices<ExerciceQuelAngle> = {
  titreDocument: "Trouver l'angle connaissant sin, cos ou tan — Évaluation",
  nomFichierBase: "quel-angle",
  genererInstance: genererExerciceQuelAngle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as FonctionTrig),
  construireEnonce: construireEnonceQuelAngle,
  construireCorrection: construireCorrectionQuelAngle,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 2,
  profilInstance: profilQuelAngle,
  libelleCasParticulier: LIBELLE_CAS_QUEL_ANGLE,
  regroupable: true,
};
