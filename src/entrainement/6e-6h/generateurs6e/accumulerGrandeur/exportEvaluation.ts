import type { ExerciceAccumulerGrandeur } from "../../core6e/accumulerGrandeur.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { PHASES_ACCUMULER_GRANDEUR } from "../../moteur6e/typesAccumulerGrandeur";
import type { PhaseAccumulerGrandeur } from "../../moteur6e/typesAccumulerGrandeur";
import { fiche, formatReponseAttenduePhaseLatex } from "../../ui6e/formatAccumulerGrandeur";
import { figureEnonceAccumulerGrandeur } from "../../ui6e/figureAccumulerGrandeur";
import { VARIANTES_CALCULATRICE_ACCUMULER, profilAccumulerGrandeur } from "./profilEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAccumulerGrandeur } from "./index";
import type { IdVarianteAccumulerGrandeur } from "./index";
import { correctionDetailleeAccumulerGrandeur } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAccumulerGrandeur>` de `6gen80` « Accumuler une
 * grandeur » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (étapes a à e), titres « Étape n — … » du corrigé.
 * - `enoncePapier` : la situation, ses données et le graphique du taux (sans hachure), puis les TROIS
 *   vraies questions du problème : a) la quantité accumulée (étapes a, b, c : choisir l'intégrale,
 *   primitiver, calculer — le guidage passe au corrigé), b) la question de transfert (étape d),
 *   c) la réponse dans l'unité demandée (étape e).
 * - Corrigé : par étape, Méthode (aide de l'écran), Calcul, Piège ciblé, Conclusion (réponse de
 *   l'écran, `formatReponseAttenduePhaseLatex`) ; l'aire hachurée (quantité accumulée) en
 *   `figureHtml` sous l'étape c.
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const LETTRES: Record<PhaseAccumulerGrandeur, string> = { modele: "a", primitive: "b", quantite: "c", transfert: "d", unite: "e" };

const t = (v: string): FragmentConsigne => texte(v);
const f = (v: string): FragmentConsigne => latex(v);

function reponse(e: ExerciceAccumulerGrandeur, phase: PhaseAccumulerGrandeur): FragmentConsigne[] {
  return formatReponseAttenduePhaseLatex(e, phase).map(f);
}

function donnees(e: ExerciceAccumulerGrandeur): FragmentConsigne[] {
  return fiche(e).blocDonnees.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function construireEnonce(e: ExerciceAccumulerGrandeur): SectionExercice {
  return {
    enteteFragments: [...fiche(e).consigneGenerale, t(" Données : "), ...donnees(e), t(".")],
    ...(figureEnonceAccumulerGrandeur(e) ? { enteteHtml: figureEnonceAccumulerGrandeur(e)! } : {}),
    questions: PHASES_ACCUMULER_GRANDEUR.map((phase) => ({ consigne: fiche(e).consignes[phase] })),
  };
}

function construireCorrection(e: ExerciceAccumulerGrandeur): BlocCorrection[] {
  return PHASES_ACCUMULER_GRANDEUR.map((phase) => ({ type: "paragraphe", fragments: [t(`${LETTRES[phase]}) `), ...reponse(e, phase)] }));
}

function enoncePapier(e: ExerciceAccumulerGrandeur): EnoncePapier {
  const fi = fiche(e);
  return {
    section: {
      enteteFragments: [...fi.consigneGenerale, t(" Données : "), ...donnees(e), t(". Justifie chaque réponse par un calcul.")],
      ...(figureEnonceAccumulerGrandeur(e) ? { enteteHtml: figureEnonceAccumulerGrandeur(e)! } : {}),
      questions: fi.questionsPapier.map((consigne) => ({ consigne })),
    },
    etapesParQuestion: [["a", "b", "c"], ["d"], ["e"]],
    reponseBreve: [t("a) "), ...reponse(e, "quantite"), t(" ; b) "), ...reponse(e, "transfert"), t(" ; c) "), ...reponse(e, "unite")],
  };
}

const correctionDetaillee = correctionDetailleeAccumulerGrandeur;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceAccumulerGrandeur): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 1, piege: 1 };
}

function reponseBreve(e: ExerciceAccumulerGrandeur): FragmentConsigne[] {
  return enoncePapier(e).reponseBreve ?? [];
}

const POIDS: Record<PhaseAccumulerGrandeur, number> = { modele: 0.5, primitive: 1, quantite: 1, transfert: 1, unite: 0.5 };

function bareme(e: ExerciceAccumulerGrandeur): BaremeExercice {
  const fi = fiche(e);
  const erreurs = PHASES_ACCUMULER_GRANDEUR.flatMap((phase) => {
    const piege = fi.pieges[phase];
    return piege ? [{ description: [t(piege)], cout: phase === "unite" ? "−0,5" : "−1" }] : [];
  });
  erreurs.push({ description: [t("Réponse sans unité, ou dans une autre unité que celle demandée")], cout: "−0,5" });
  const calculatrice = VARIANTES_CALCULATRICE_ACCUMULER.includes(e.variante);
  return {
    reponseFinale: [...reponse(e, "transfert"), t(" ; "), ...reponse(e, "unite")],
    criteres: PHASES_ACCUMULER_GRANDEUR.map((phase) => ({
      sousQuestion: LETTRES[phase],
      critere: phase === "modele" ? [t("Intégrale correcte (taux net, bornes, quantité initiale) : "), ...reponse(e, phase)] : reponse(e, phase),
      points: POIDS[phase],
    })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [t(calculatrice ? "Valeur exacte (avec e, ln, π, cos…) ou arrondie à la précision demandée ; un écart dû à un arrondi intermédiaire est toléré" : "Valeur exacte, sous forme de fraction ou de décimal")],
      [t("Toute primitive correcte (à une constante près)")],
    ],
  };
}

export const adaptateurEvaluationAccumulerGrandeur: AdaptateurFeuilleExercices<ExerciceAccumulerGrandeur> = {
  titreDocument: "Accumuler une grandeur : débits, puissances, consommations — Évaluation",
  nomFichierBase: "accumuler-grandeur",
  genererInstance: genererExerciceAccumulerGrandeur,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteAccumulerGrandeur),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilAccumulerGrandeur,
  calculatriceIndispensable: VARIANTES_CALCULATRICE_ACCUMULER,
};
