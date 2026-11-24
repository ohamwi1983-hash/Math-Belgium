import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDetectiveFonctions } from "../../core5e/detectiveFonctions.types";
import { copie, descriptionFragments, DESCRIPTION_CORRECTE } from "../../moteur5e/modeleDetectiveFonctions";
import { CONSIGNE_GLOBALE, consigne, consigneGenerale, numeroLigneFausse, PHASES, reponse } from "../../ui5e/formatDetectiveFonctions";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveFonctions } from "./index";
import { correctionDetailleeDetectiveFonctions } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen58` « Détective d'erreurs : fonctions et composées ». Énoncé papier =
 * l'exercice que l'élève devait faire, la copie numérotée (marge rouge, mise en page de 6gen144) et
 * la consigne globale ; les trois écrans (ligne, erreur, correction) deviennent les étapes a, b, c
 * du corrigé. Le type d'erreur (= variante) est la réponse de l'écran 2 : groupe à verdict
 * `groupe_erreur`, niveau et durée CONSTANTS dans le groupe (trois étapes, méthode 1, piège 0 :
 * le type d'erreur est la réponse, nombres 0). Cas particulier : le domaine vide de « union ».
 */

type E = ExerciceDetectiveFonctions;
const t = texte;
const f = latex;
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
  return [t(`Ligne ${numeroLigneFausse(e)} fausse. `), ...fr(descriptionFragments(DESCRIPTION_CORRECTE[e.variante], e)), t(" Correction : "), ...fr(reponse(e, "correction"))];
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
  const erreurs: ErreurFrequente[] = [
    { description: [t("Ligne signalée = une conséquence de l'erreur au lieu de la ligne qui la cause")], cout: "0 pt sur la ligne" },
    { description: [t("Erreur seulement constatée (« c'est faux ») sans nommer la règle du cours")], cout: "moitié des points de l'explication" },
    { description: [t("Ligne fausse corrigée sans reprendre la suite de la résolution")], cout: "moitié des points de la correction" },
  ];
  if (copie(e).valeur.genre === "ensemble") erreurs.push({ description: [t("Crochet faux dans le domaine corrigé (borne exclue ou incluse à tort, crochet fermé du côté de "), f("\\infty"), t(")")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Ligne fausse identifiée et justifiée : "), ...fr(reponse(e, "ligne"))], points: 1 },
      { sousQuestion: "b", critere: [t("Erreur nommée, règle juste du cours")], points: 1 },
      { sousQuestion: "c", critere: [t("Résolution reprise : "), ...fr(reponse(e, "correction"))], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Toute écriture juste : ensemble écrit autrement ("), f("\\mathbb{R}\\setminus\\{a\\}"), t(", réunion dans le désordre), expression non développée mais égale, valeur exacte")]],
  };
}

/** `forme` = scénario | ligne fausse (même copie d'une série à l'autre pour une même variante) ;
 * cas particulier : le domaine vide (« union », b < a), décision de l'utilisateur. */
export function profilDetectiveFonctions(e: E): ProfilInstance {
  // Pas de `calcul` (revue des profils, 24/11/2026) : la calculatrice ne donne pas la réponse, tiré
  // que la calculatrice soit interdite ou autorisée.
  return { casParticulier: e.scenario === "U" && e.d.a > e.d.b ? "domaine-vide" : null, forme: `${e.scenario}|L${numeroLigneFausse(e)}` };
}

export const adaptateurEvaluationDetectiveFonctions: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Détective d'erreurs : fonctions et composées — Évaluation",
  nomFichierBase: "detective-erreurs-fonctions",
  genererInstance: genererExerciceDetectiveFonctions,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDetectiveFonctions,
  bareme,
  enoncePapier,
  profilInstance: profilDetectiveFonctions,
  libelleCasParticulier: "Inclure un cas particulier (domaine vide)",
  groupesVerdict: [{ id: "groupe_erreur", label: "Copie d'élève (type d'erreur tiré au hasard)", variantes: CATALOGUE_VARIANTES.map((v) => v.id) }],
};
