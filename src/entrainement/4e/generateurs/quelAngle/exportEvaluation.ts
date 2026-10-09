import type { ExerciceQuelAngle, FonctionTrig } from "../../core/quelAngle.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { DOMAINE_LATEX, formatEnonceLatex, formatTermesSolutionsLatex, texteAideQuadrants } from "../../ui/formatQuelAngle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceQuelAngle } from "./index";

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
    questions: [{ consigne: [texte(CONSIGNE_GENERALE)], reponse: { type: "lignes", nombre: 0 } }],
  };
}

function construireCorrectionQuelAngle(exercice: ExerciceQuelAngle): BlocCorrection[] {
  const termesSolutions = formatTermesSolutionsLatex(exercice);

  return [
    { type: "paragraphe", fragments: [texte(texteAideQuadrants(exercice))] },
    {
      type: "paragraphe",
      fragments: [texte(termesSolutions.length > 1 ? "Solutions : " : "Solution : "), ...termesSolutions.map((terme) => latex(terme))],
      bloc: true,
    },
  ];
}

export const adaptateurEvaluationQuelAngle: AdaptateurFeuilleExercices<ExerciceQuelAngle> = {
  titreDocument: "Trouver l'angle connaissant sin, cos ou tan — Évaluation",
  nomFichierBase: "quel-angle",
  genererInstance: genererExerciceQuelAngle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as FonctionTrig),
  construireEnonce: construireEnonceQuelAngle,
  construireCorrection: construireCorrectionQuelAngle,
  regroupable: true,
};
