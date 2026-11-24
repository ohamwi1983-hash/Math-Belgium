import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDetectiveDerivees } from "../../core5e/detectiveDerivees.types";
import { VARIANTES_SIGNE, VARIANTES_TANGENTE } from "../../core5e/detectiveDerivees.types";
import { copie, descriptionFragments } from "../../moteur5e/modeleDetectiveDerivees";
import { CONSIGNE_GLOBALE, consigne, consigneGenerale, numeroLigneFausse, PHASES, reponse } from "../../ui5e/formatDetectiveDerivees";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveDerivees } from "./index";
import { correctionDetailleeDetectiveDerivees } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen72` « Détective d'erreurs : dérivées ». Énoncé papier = l'exercice que
 * l'élève devait faire, la copie numérotée (marge rouge, mise en page de 5gen67 / 5gen58) et la
 * consigne globale ; les trois écrans (ligne, erreur, correction) deviennent les étapes a, b, c du
 * corrigé. Le type d'erreur (= variante) est la réponse de l'écran 2 : groupes à verdict
 * `groupe_erreur_tangente` (5 variantes) et `groupe_erreur_signe` (3 variantes), niveau et durée
 * CONSTANTS (trois étapes, méthode 1, piège 0 : le type d'erreur est la réponse ; nombres 0). La
 * position de la ligne fausse (0 à 3 lignes justes avant) est un verdict tiré dans chaque série,
 * jamais dans `forme`. Aucun cas particulier. Regroupement a), b), c) écarté (copie d'élève propre
 * à l'instance, comme 5gen67).
 */

type E = ExerciceDetectiveDerivees;
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
  const tangente = copie(e).valeur.genre === "droite";
  const erreurs: ErreurFrequente[] = [
    { description: [t("Ligne signalée = une conséquence de l'erreur au lieu de la ligne qui la cause")], cout: "0 pt sur la ligne" },
    { description: [t("Erreur seulement constatée (« c'est faux ») sans nommer la règle du cours")], cout: "moitié des points de l'explication" },
    { description: [t("Ligne fausse corrigée sans reprendre la suite de la résolution")], cout: "moitié des points de la correction" },
  ];
  if (tangente) erreurs.push({ description: [t("Tangente écrite avec f′(x) au lieu de f′(a), ou sans « − a »")], cout: "−1" });
  else erreurs.push({ description: [t("Nature de l'extremum non justifiée par le changement de signe de f′")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Ligne fausse identifiée et justifiée : "), ...fr(reponse(e, "ligne"))], points: 1 },
      { sousQuestion: "b", critere: [t("Erreur nommée, règle juste du cours")], points: 1 },
      { sousQuestion: "c", critere: [t("Résolution reprise : "), ...fr(reponse(e, "correction"))], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t(tangente ? "Toute équation équivalente de la tangente (forme y = f(a) + f′(a)(x − a) non développée comprise)" : "Abscisses et natures justifiées par un tableau de signes de f′ ; toute méthode juste pour reprendre la résolution")]],
  };
}

/** `forme` = type d'erreur seul (jamais la ligne fausse : c'est un verdict tiré dans chaque série). */
export function profilDetectiveDerivees(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "exacte", forme: e.variante };
}

export const adaptateurEvaluationDetectiveDerivees: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Détective d'erreurs : dérivées — Évaluation",
  nomFichierBase: "detective-erreurs-derivees",
  genererInstance: genererExerciceDetectiveDerivees,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDetectiveDerivees,
  bareme,
  enoncePapier,
  profilInstance: profilDetectiveDerivees,
  groupesVerdict: [
    { id: "groupe_erreur_tangente", label: "Copie : tangente (type d'erreur tiré au hasard)", variantes: [...VARIANTES_TANGENTE] },
    { id: "groupe_erreur_signe", label: "Copie : extremums (type d'erreur tiré au hasard)", variantes: [...VARIANTES_SIGNE] },
  ],
};
