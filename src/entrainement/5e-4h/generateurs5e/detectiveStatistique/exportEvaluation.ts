import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDetectiveStat } from "../../core5e/detectiveStatistique";
import { copie, descriptionFragments } from "../../moteur5e/modeleDetectiveStatistique";
import { tableauHtml } from "../../ui5e/definitionRelevesSinusoide";
import { CONSIGNE_GLOBALE, consigne, numeroLigneFausse, PHASES, reponse } from "../../ui5e/formatDetectiveStatistique";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveStat } from "./index";
import { correctionDetailleeDetectiveStatistique } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen81` « Détective d'erreurs : statistique à deux variables ». Énoncé papier
 * = l'exercice que l'élève devait faire (avec son tableau de données), la copie numérotée (marge
 * rouge, mise en page de 5gen72) et la consigne globale ; les trois écrans (ligne, erreur, correction)
 * deviennent les étapes a, b, c du corrigé. Le type d'erreur (= variante) est la réponse de l'écran 2 :
 * groupe à verdict `groupe_erreur` (les huit). Niveau et durée CONSTANTS (trois étapes, méthode 1,
 * piège 0 : le type d'erreur est la réponse ; nombres 0). La position de la ligne fausse est un
 * verdict tiré dans chaque série, jamais dans `forme`. Aucun cas particulier, aucun `calcul` (règle du
 * 24/11 : détective d'erreurs). Regroupement écarté (copie d'élève propre à l'instance).
 */

type E = ExerciceDetectiveStat;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function copieHtml(e: E): string {
  const c = copie(e);
  const items = c.lignes
    .map(
      (frs, i) =>
        `<div style="display:flex;align-items:baseline;margin:3px 0">` +
        `<span style="flex:0 0 2em;text-align:right;padding-right:0.6em;border-right:2px solid #c0392b;color:#555">${i + 1}</span>` +
        `<span style="flex:1 1 auto;min-width:0;padding-left:0.7em;overflow-x:auto;overflow-y:hidden">${fragmentsVersHtml(fr(frs))}</span></div>`,
    )
    .join("");
  return `${c.tableau ? tableauHtml(c.tableau) : ""}<p class="paragraphe">Copie de l'élève :</p><div class="paragraphe copie-eleve">${items}</div>`;
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr([t("Un élève a résolu l'exercice suivant. "), ...fr(copie(e).enonce)]), enteteHtml: copieHtml(e), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t(`Ligne ${numeroLigneFausse(e)} fausse. `), ...fr(descriptionFragments(e.variante)), t(" Correction : "), ...fr(reponse(e, "correction"))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: [t("Voici la résolution d'un exercice rédigée par un élève. "), ...fr(copie(e).enonce)], enteteHtml: copieHtml(e), questions: [{ consigne: [t(CONSIGNE_GLOBALE)] }] },
    etapesParQuestion: [["a", "b", "c"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 0, methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [t("Ligne signalée = une conséquence de l'erreur au lieu de la ligne qui la cause")], cout: "0 pt sur la ligne" },
    { description: [t("Erreur seulement constatée (« c'est faux ») sans nommer la règle du cours")], cout: "moitié des points de l'explication" },
    { description: [t("Ligne fausse corrigée sans reprendre la suite de la résolution")], cout: "moitié des points de la correction" },
  ];
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Ligne fausse identifiée et justifiée : "), ...fr(reponse(e, "ligne"))], points: 1 },
      { sousQuestion: "b", critere: [t("Erreur nommée, règle juste du cours")], points: 1 },
      { sousQuestion: "c", critere: [t("Résolution reprise : "), ...fr(reponse(e, "correction"))], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Toute formulation équivalente de la règle ; coefficients exacts ou arrondis au centième")]],
  };
}

/** `forme` = type d'erreur seul (jamais la ligne fausse : c'est un verdict tiré dans chaque série). */
export function profilDetectiveStatistique(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationDetectiveStatDeuxVariables: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Détective d'erreurs : statistique à deux variables — Évaluation",
  nomFichierBase: "detective-erreurs-statistique-deux-variables",
  genererInstance: genererExerciceDetectiveStat,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDetectiveStatistique,
  bareme,
  enoncePapier,
  profilInstance: profilDetectiveStatistique,
  groupesVerdict: [{ id: "groupe_erreur", label: "Copie d'élève (type d'erreur tiré au hasard)", variantes: CATALOGUE_VARIANTES.map((c) => c.id) }],
};
