import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import type { ExerciceValeurAberrante } from "../../core/valeurAberrante.types";
import { indicateursComplets, indicateursSansExtreme, valeurRetiree } from "../../moteur/modeleValeurAberrante";
import {
  LIBELLES_INDICATEURS,
  consigneGenerale,
  ecrans,
  explicationVerdict,
  laValeurRetiree,
  listeTexte,
  questionVerdict,
  recit,
  titreListe,
  valeurTexte,
} from "../../ui/formatValeurAberrante";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceValeurAberrante } from "./index";
import { profilValeurAberrante } from "./profil";
import { correctionDetailleeValeurAberrante } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen110 (« Moyenne ou médiane ? La valeur
 * aberrante »).
 *
 * Énoncé papier = le récit, la liste des valeurs (non rangée) et deux VRAIES questions :
 * a) moyenne et médiane, puis à nouveau sans la plus grande (ou la plus petite) valeur — étapes a et
 * b de l'écran ; b) l'indicateur le plus représentatif, justifié — étape c (les trois choix sont
 * cités dans la question, la justification est libre). Le nuage de points (moyenne et médiane
 * repérées) n'apparaît que dans le corrigé : dans l'énoncé, il trahirait le verdict.
 *
 * Toutes les valeurs viennent des mêmes fonctions que l'écran (`ui/formatValeurAberrante.ts`).
 * Séries équilibrées : `profil.ts` (forme = contexte ; le verdict reste tiré au hasard).
 */

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function enteteHtml(e: ExerciceValeurAberrante): string {
  return `<p class="paragraphe">${echapper(recit(e))}</p><p class="paragraphe"><strong>${echapper(titreListe(e))} :</strong> ${echapper(listeTexte(e.valeurs))}</p>`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceValeurAberrante): SectionExercice {
  return {
    enteteFragments: [texte(consigneGenerale(e))],
    enteteHtml: enteteHtml(e),
    questions: ecrans(e).map((ec) => ({ consigne: ec.type === "verdict" ? [texte(`${questionVerdict(e)} Justifie ton choix.`)] : ec.consigne })),
  };
}

function enoncePapier(e: ExerciceValeurAberrante): EnoncePapier {
  return {
    section: {
      enteteFragments: [],
      enteteHtml: enteteHtml(e),
      questions: [
        { consigne: [texte(`Calcule la moyenne et la médiane de cette série, puis recalcule-les sans ${laValeurRetiree(e)} (${valeurTexte(e, valeurRetiree(e))}). Donne des valeurs exactes.`)] },
        { consigne: [texte(`${questionVerdict(e).replace(/ \?$/, "")} : la moyenne ou la médiane ? Ou les deux se valent-ils ? Justifie à l'aide de tes calculs.`)] },
      ],
    },
    etapesParQuestion: [["a", "b"], ["c"]],
    reponseBreve: [texte(`a) ${resultatsTexte(e)}. b) ${LIBELLES_INDICATEURS[e.verdict === "mediane" ? "mediane" : "les-deux"]}.`)],
  };
}

/** « x̄ = 3 731,25 €, médiane = 2 650 € ; sans 12 000 € : x̄ = 2 550 €, médiane = 2 650 € ». */
function resultatsTexte(e: ExerciceValeurAberrante): string {
  const a = indicateursComplets(e);
  const b = indicateursSansExtreme(e);
  return `x̄ = ${valeurTexte(e, a.moyenne)}, médiane = ${valeurTexte(e, a.mediane)} ; sans ${valeurTexte(e, valeurRetiree(e))} : x̄ = ${valeurTexte(e, b.moyenne)}, médiane = ${valeurTexte(e, b.mediane)}`;
}

function reponseBreve(e: ExerciceValeurAberrante): FragmentConsigne[] {
  return [texte(`${resultatsTexte(e)}. ${LIBELLES_INDICATEURS[e.verdict === "mediane" ? "mediane" : "les-deux"]}.`)];
}

/** Niveau (grille commune) : trois écrans qui transforment (le verdict s'appuie sur des écarts
 * calculés) ; méthode : choisir l'indicateur représentatif (1) ; aucun piège dans les données (le
 * verdict est la question, jamais un cas particulier). */
function criteresDifficulte(e: ExerciceValeurAberrante): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeValeurAberrante(e)), methode: 1, piege: 0 };
}

function construireCorrection(e: ExerciceValeurAberrante): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: reponseBreve(e) },
    { type: "paragraphe", fragments: explicationVerdict(e) },
  ];
}

function bareme(e: ExerciceValeurAberrante): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Moyenne et médiane de la série complète (liste rangée pour la médiane)")], points: 1.5 },
      { sousQuestion: "b", critere: [texte(`Moyenne et médiane sans ${laValeurRetiree(e)} (effectif diminué de 1)`)], points: 1 },
      { sousQuestion: "c", critere: [texte("Indicateur le plus représentatif correctement choisi")], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Justification : effet d'une valeur isolée (ou de son absence) sur la moyenne et sur la médiane, appuyée sur les calculs")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Médiane lue au milieu de la liste NON rangée")], cout: "0 pt sur la médiane" },
      { description: [texte("Nouvelle moyenne divisée par l'ancien effectif")], cout: "−0,5" },
      { description: [texte("« La moyenne » choisie parce qu'elle « utilise toutes les valeurs »")], cout: "0 pt sur c)" },
      { description: [texte("Choix sans justification, ou justification générale (« la médiane est toujours meilleure »)")], cout: "moitié des points de c)" },
    ],
    reponsesAcceptees: [
      [texte("Valeurs exactes, avec ou sans l'unité ; médiane par la règle du seuil ou par la moyenne des deux valeurs centrales (ici, elles donnent la même valeur).")],
      [texte("Toute justification équivalente qui compare l'effet du retrait sur la moyenne et sur la médiane.")],
    ],
  };
}

export const adaptateurEvaluationValeurAberrante: AdaptateurFeuilleExercices<ExerciceValeurAberrante> = {
  profilInstance: profilValeurAberrante,
  titreDocument: "Moyenne ou médiane ? La valeur aberrante — Évaluation",
  nomFichierBase: "moyenne-ou-mediane-valeur-aberrante",
  genererInstance: genererExerciceValeurAberrante,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeValeurAberrante,
  bareme,
  enoncePapier,
};
