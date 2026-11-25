import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDetectiveCombi } from "../../core6e/detectiveCombinatoire";
import { VARIANTES_DETECTIVE_COMBI } from "../../core6e/detectiveCombinatoire";
import { copie, descriptionFragments } from "../../moteur6e/modeleDetectiveCombinatoire";
import { CONSIGNE_GLOBALE, consigne, consigneGenerale, numeroLigneFausse, PHASES, reponse } from "../../ui6e/formatDetectiveCombinatoire";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveCombi } from "./index";
import { correctionDetailleeDetectiveCombi } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen109` « Détective d'erreurs : analyse combinatoire ». Énoncé papier =
 * l'exercice que l'élève devait faire, la copie numérotée (marge rouge, mise en page de 6gen163) et la
 * consigne globale ; les trois écrans (ligne, erreur, correction) deviennent les étapes a, b, c du
 * corrigé. Le type d'erreur (= variante) est la réponse de l'écran 2 : groupe à verdict `groupe_erreur`
 * (6 variantes), niveau et durée CONSTANTS (trois étapes `sansCharge`, méthode 1, piège 0, nombres 0 :
 * valeurs exactes). La position de la ligne fausse (0 à 3 lignes justes avant) est un verdict tiré dans
 * chaque série, jamais dans `forme`. Aucun cas particulier, aucun `calcul` (détective : la démarche est
 * évaluée, décision du 24/11). Regroupement a), b), c) écarté (copie d'élève propre à l'instance).
 */

type E = ExerciceDetectiveCombi;
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
      ...(copie(e).probabilite ? [{ description: [t("Valeur approchée au lieu de la valeur exacte")], cout: "−0,5" }] : []),
    ],
    reponsesAcceptees: [[t("Toute écriture exacte équivalente (fraction non réduite, calcul avec Cₙᵏ ou des factorielles posé et effectué) ; toute méthode juste pour reprendre la résolution")]],
  };
}

/** `forme` = type d'erreur seul (jamais la ligne fausse : c'est un verdict tiré dans chaque série). */
export function profilDetectiveCombi(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationDetectiveCombi: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Détective d'erreurs : analyse combinatoire — Évaluation",
  nomFichierBase: "detective-erreurs-combinatoire",
  genererInstance: genererExerciceDetectiveCombi,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDetectiveCombi,
  bareme,
  enoncePapier,
  profilInstance: profilDetectiveCombi,
  groupesVerdict: [{ id: "groupe_erreur", label: "Copie d'élève (type d'erreur tiré au hasard)", variantes: [...VARIANTES_DETECTIVE_COMBI] }],
};
