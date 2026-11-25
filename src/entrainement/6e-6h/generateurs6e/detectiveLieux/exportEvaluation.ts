import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDL } from "../../core6e/detectiveLieux";
import { VARIANTES_DL } from "../../core6e/detectiveLieux";
import { copie, descriptionFragments } from "../../moteur6e/modeleDetectiveLieux";
import { CONSIGNE_GLOBALE, consigne, consigneGenerale, numeroLigneFausse, PHASES, reponse } from "../../ui6e/formatDetectiveLieux";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDL } from "./index";
import { correctionDetailleeDL } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen131` « Détective d'erreurs : lieux, droites et cercles ». Énoncé papier =
 * l'exercice que l'élève devait faire, la copie numérotée (marge rouge, mise en page de 6gen122) et la
 * consigne globale ; les trois écrans (ligne, erreur, correction) deviennent les étapes a, b, c du
 * corrigé. Le type d'erreur (= variante) est la réponse de l'écran 2 : groupe à verdict `groupe_erreur`
 * (8 variantes), niveau et durée CONSTANTS (trois étapes `sansCharge`, méthode 1, piège 0, nombres 0).
 * La position de la ligne fausse est un verdict tiré dans chaque série, jamais dans `forme`. Aucun cas
 * particulier, aucun `calcul` (détective : la démarche est évaluée). Regroupement écarté (copie propre à
 * l'instance).
 */

type E = ExerciceDL;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function copieHtml(e: E): string {
  const items = copie(e)
    .lignes.map(
      (frs, i) =>
        `<div style="display:flex;align-items:baseline;margin:3px 0">` +
        `<span style="flex:0 0 2em;text-align:right;padding-right:0.6em;border-right:2px solid #c0392b;color:#555">${i + 1}</span>` +
        `<span style="flex:1 1 auto;min-width:0;padding-left:0.7em;overflow-x:auto;overflow-y:hidden">${fragmentsVersHtml(fr(frs))}</span></div>`,
    )
    .join("");
  return `<p class="paragraphe">Copie de l'élève :</p><div class="paragraphe copie-eleve">${items}</div>`;
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), enteteHtml: copieHtml(e), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t(`Ligne ${numeroLigneFausse(e)} fausse. `), ...fr(descriptionFragments(e.variante, e)), t(" Correction : "), ...fr(reponse(e, "correction"))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: [t("Voici la résolution d'un exercice rédigée par un élève. Exercice : "), ...fr(copie(e).enonce)], enteteHtml: copieHtml(e), questions: [{ consigne: [t(CONSIGNE_GLOBALE)] }] },
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
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Ligne fausse identifiée et justifiée : "), ...fr(reponse(e, "ligne"))], points: 1 },
      { sousQuestion: "b", critere: [t("Erreur nommée, règle juste du cours")], points: 1 },
      { sousQuestion: "c", critere: [t("Résolution reprise : "), ...fr(reponse(e, "correction"))], points: 2 },
    ],
    erreursFrequentes: [
      { description: [t("Ligne signalée = une conséquence de l'erreur au lieu de la ligne qui la cause")], cout: "0 pt sur la ligne" },
      { description: [t("Erreur seulement constatée (« c'est faux ») sans nommer la règle du cours")], cout: "moitié des points de l'explication" },
      { description: [t("Ligne fausse corrigée sans reprendre la suite de la résolution")], cout: "moitié des points de la correction" },
    ],
    reponsesAcceptees: [[t("Toute écriture équivalente (équation multipliée par un nombre non nul, fraction non réduite, points dans un autre ordre) ; toute méthode juste pour reprendre la résolution")]],
  };
}

/** `forme` = type d'erreur seul (jamais la ligne fausse). */
export function profilDL(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationDL: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Détective d'erreurs : lieux, droites et cercles — Évaluation",
  nomFichierBase: "detective-erreurs-lieux-droites-cercles",
  genererInstance: genererExerciceDL,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDL,
  bareme,
  enoncePapier,
  profilInstance: profilDL,
  groupesVerdict: [{ id: "groupe_erreur", label: "Copie d'élève (type d'erreur tiré au hasard)", variantes: [...VARIANTES_DL] }],
};
