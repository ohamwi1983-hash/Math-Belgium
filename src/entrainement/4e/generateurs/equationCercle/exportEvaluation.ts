import type { ExerciceEquationCercle } from "../../core/equationCercle.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { construireSvgEquationCercle } from "./figure";
import { correctionDetailleeEquationCercle } from "./corrigeDetaille";
import {
  CONSIGNE_CENTRE,
  CONSIGNE_EQUATION,
  CONSIGNE_GENERALE_EQUATION_CERCLE,
  consigneRayon,
  formatEquationAttendueLatex,
  formatEtatActuelCentreLatex,
  formatRayonLatex,
  LATEX_GABARIT_EQUATION,
} from "../../ui/formatEquationCercle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationCercle } from "./index";
import { PARAMETRES_CENTRE_CERCLE, profilEquationCercle } from "../profilsEvaluation4eCh7Coniques";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationCercle>` pour gen49 (Équation d'un cercle
 * (non développée) à partir d'un graphe, `AppEquationCercle.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/boiteMoustaches/exportEvaluation.ts` pour le précédent le plus proche d'un adaptateur
 * pilotant un graphique statique SVG écrit à la main (`enteteHtml`/bloc `"html"`).
 *
 * Chapitre Math-Belgium "Géométrie analytique plane" (4e), section "Équation du cercle (forme
 * graphique)" (`cercle`) : cette section est servie par DEUX générateurs, gen49 (ce fichier) ET
 * gen50 (`equationCercleDeveloppee`, adaptateur distinct porté séparément) — ce fichier ne couvre
 * que gen49.
 *
 * Écran → question : `sessionEquationCercle.ts` enchaîne 3 phases FIXES, toujours dans le même
 * ordre — `centre → rayon → equation` (jamais de saut conditionnel, les 2 variantes traversant
 * exactement la même séquence, voir son commentaire de tête) — ceci devient ici 3 questions a/b/c,
 * dans le même ordre, jamais recombinées : (a) coordonnées du centre (écran "centre", 2 champs x/y
 * soumis ensemble) ; (b) rayon (écran "rayon", 1 champ numérique) ; (c) équation cartésienne NON
 * développée (écran "equation", 1 champ texte). Les 2 variantes de `CATALOGUE_VARIANTES`
 * (`rayon_direct`/`rayon_indirect`) ne changent PAS le nombre/l'ordre des questions — seule la
 * justification du rayon en correction (b) diffère (compter les cases vs. Pythagore), exactement
 * comme à l'écran (`texteAideRayonNiveau1`/`texteAideRayonNiveau2`, `ui/formatEquationCercle.ts`).
 *
 * **Graphique** (`construireSvgEquationCercle`) : gen49 est "graphe-first" — `ui/formatEquationCercle.ts`
 * documente explicitement qu'aucun bloc texte ne révèle jamais le centre/rayon en dehors du graphe
 * (c'est justement ce que l'élève doit déterminer). Le papier reproduit donc fidèlement le graphe
 * Mafs de l'écran (`components/EquationCercleGraph.tsx` — cercle tracé, point marqué, AUCUNE
 * annotation) dans l'énoncé, et le RÉIMPRIME dans la correction (même principe que
 * `boiteMoustaches/exportEvaluation.ts` variante `lecture`) avec en plus le centre marqué (croix
 * verte) et le segment centre↔point marqué (pointillé orange) — le même habillage que l'aide de
 * niveau 2 des écrans "centre"/"rayon" à l'écran (`afficherCentre`/`afficherRayon`,
 * `EquationCercleGraph.tsx`), jamais un nouveau code couleur inventé ici. Aucun générateur existant
 * ne trace de CERCLE en SVG statique (`export/svgGraph.ts::construireSvgFonction` est un moteur de
 * tracé de COURBE `y=f(x)`, structurellement inapplicable à un cercle — multivalué en y) : ce
 * fichier écrit donc son propre petit moteur de tracé (même principe assumé que
 * `boiteMoustaches/exportEvaluation.ts`), mais réutilise autant que possible la géométrie déjà pure
 * et testée du reste du projet plutôt que d'en reconstruire une nouvelle — `viewBoxEquationCercle`
 * (`ui/equationCercleGraph.ts`, cadrage dérivé des 4 points cardinaux du cercle + le point marqué,
 * déjà utilisé côté écran, avec le même rapport `RATIO_GRAPHE_CERCLE`). Seul le rendu `<svg>`
 * lui-même (grille de pas 1, axes, cercle, point, croix du centre, segment du rayon) est propre à ce fichier, aucun équivalent
 * générique n'existant à réutiliser.
 *
 * **PAS `regroupable`** : `AdaptateurFeuilleExercices.regroupable` exige à la fois une seule
 * question par instance, une consigne GÉNÉRIQUE, ET l'absence d'`enteteHtml` (voir sa doc,
 * `export/genererFeuilleExercices.ts`) — gen49 ne remplit AUCUNE des 3 conditions : 3 questions par
 * instance (a/b/c ci-dessus, jamais 1 seule) ET un `enteteHtml` (le graphique du cercle) sur
 * chaque instance.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`exercice.centre`/`.rayon`/`.pointMarque`, tous déjà fixés à la génération — voir
 * `generateurs/equationCercle/index.ts`), jamais recalculée indépendamment. Réutilise directement
 * `ui/formatEquationCercle.ts` (`formatEtatActuelCentreLatex` pour le centre confirmé,
 * `formatAideRayonNiveau2Latex` pour la formule de Pythagore substituée de la variante
 * `rayon_indirect` — déjà la même formule affichée côté écran à l'aide de niveau 2, seul le résultat
 * numérique final est ajouté ici — et `formatEquationAttendueLatex` pour l'équation attendue),
 * plutôt que d'en resynthétiser de nouvelles. Le texte de justification (pourquoi le centre est ce
 * point, pourquoi compter les cases suffit pour `rayon_direct`) est en revanche un texte de
 * résolution nouveau, aucune des aides existantes n'exposant de texte à concaténer pour ce cas
 * précis (mêmes principe et raison que `analyseFonction/exportWord.ts`/`cercleTrigonometrique/exportEvaluation.ts`).
 *
 * **Feuille d'exercices / évaluation (refonte papier)** : l'énoncé papier (`enoncePapier`) est le
 * graphique et la consigne globale « détermine l'équation » ; les 3 écrans (centre, rayon, équation)
 * deviennent les étapes 1 à 3 du corrigé détaillé, jamais des sous-questions imprimées. Aucune place
 * de réponse. Tirage équilibré : `profilsEvaluation4eCh7Coniques.ts` (centre sur un axe au choix).
 */

// ============================================================================
// Adaptateur.
// ============================================================================

function construireEnonceEquationCercle(exercice: ExerciceEquationCercle): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE_EQUATION_CERCLE)],
    enteteHtml: construireSvgEquationCercle(exercice),
    questions: [{ consigne: [texte(CONSIGNE_CENTRE)] }, { consigne: [texte(consigneRayon(exercice))] }, { consigne: [texte(CONSIGNE_EQUATION)] }],
  };
}

/** Énoncé papier : le graphique et la consigne globale — les 3 écrans deviennent les étapes du
 * corrigé. Le point marqué est nommé P pour que le corrigé puisse s'y référer. */
function enoncePapierEquationCercle(exercice: ExerciceEquationCercle): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("Le graphique ci-dessous représente un cercle ; le point marqué P appartient à ce cercle. Détermine l'équation cartésienne de ce cercle, sous la forme non développée "),
        latex(LATEX_GABARIT_EQUATION),
        texte("."),
      ],
      enteteHtml: construireSvgEquationCercle(exercice),
      questions: [],
    },
  };
}

function construireCorrectionEquationCercle(exercice: ExerciceEquationCercle): BlocCorrection[] {
  return [
    { type: "html", html: construireSvgEquationCercle(exercice, { avecCentre: true, avecRayon: true }) },
    { type: "paragraphe", fragments: [texte("Centre "), latex(`C${formatEtatActuelCentreLatex(exercice)}`), texte(", rayon "), latex(`R = ${formatRayonLatex(exercice)}`), texte(".")] },
    { type: "paragraphe", fragments: [texte("Équation : "), latex(formatEquationAttendueLatex(exercice)), texte(".")] },
  ];
}

function reponseBreveEquationCercle(exercice: ExerciceEquationCercle): FragmentConsigne[] {
  return [latex(formatEquationAttendueLatex(exercice))];
}

/** Niveau (règle « Noter un nouveau chapitre ») : l'écran du centre est une lecture ; le rayon
 * aussi quand P est aligné avec C (carreaux comptés), sinon il se calcule (Pythagore). Méthode
 * imposée par l'énoncé (forme non développée), aucun piège dans les données. */
function criteresDifficulte(exercice: ExerciceEquationCercle): CriteresDifficulte {
  const lecture = exercice.variante === "rayon_direct" ? ["a", "b"] : ["a"];
  return { ...etapesDuCorrige(correctionDetailleeEquationCercle(exercice), lecture), methode: 0, piege: 0, nombres: 0 };
}

function baremeEquationCercle(exercice: ExerciceEquationCercle): BaremeExercice {
  const { centre } = exercice;
  const erreurs: ErreurFrequente[] = [{ description: [texte("Rayon R écrit au second membre au lieu de "), latex("R^2")], cout: "−1" }];
  if (centre.x !== 0 || centre.y !== 0) erreurs.push({ description: [texte("Signe d'une coordonnée du centre inversé dans la parenthèse")], cout: "−1" });
  if (exercice.variante === "rayon_indirect") erreurs.push({ description: [texte("Rayon lu « à vue » sur la grille au lieu du théorème de Pythagore")], cout: "−1" });
  return {
    reponseFinale: [latex(formatEquationAttendueLatex(exercice))],
    criteres: [
      { sousQuestion: "a", critere: [texte("Centre "), latex(formatEtatActuelCentreLatex(exercice))], points: 1 },
      { sousQuestion: "b", critere: exercice.variante === "rayon_direct" ? [texte("Rayon lu sur la grille : "), latex(`R = ${formatRayonLatex(exercice)}`)] : [texte("Rayon calculé par Pythagore : "), latex(`R^2 = ${exercice.rayonCarre}`)], points: 1 },
      { sousQuestion: "c", critere: [texte("Équation correcte sous la forme non développée (signes et "), latex("R^2"), texte(")")], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Le rayon peut rester sous forme de racine : seul "), latex(`R^2 = ${exercice.rayonCarre}`), texte(" apparaît dans l'équation")]],
  };
}

export const adaptateurEvaluationEquationCercle: AdaptateurFeuilleExercices<ExerciceEquationCercle> = {
  titreDocument: "Équation d'un cercle (non développée) à partir d'un graphe — Évaluation",
  nomFichierBase: "equation-cercle",
  genererInstance: genererExerciceEquationCercle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationCercle,
  construireCorrection: construireCorrectionEquationCercle,
  reponseBreve: reponseBreveEquationCercle,
  correctionDetaillee: correctionDetailleeEquationCercle,
  criteresDifficulte,
  bareme: baremeEquationCercle,
  enoncePapier: enoncePapierEquationCercle,
  profilInstance: profilEquationCercle,
  parametresAuChoix: PARAMETRES_CENTRE_CERCLE,
  // PAS regroupable : 3 étapes par instance ET un enteteHtml (le graphique du cercle).
};
