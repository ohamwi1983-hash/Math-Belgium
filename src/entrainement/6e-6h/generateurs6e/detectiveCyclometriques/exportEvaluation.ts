import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDetectiveCyclo } from "../../core6e/detectiveCyclometriques.types";
import { copie, descriptionFragments } from "../../moteur6e/modeleDetectiveCyclometriques";
import { CONSIGNE_GLOBALE, consigne, consigneGenerale, numeroLigneFausse, PHASES, reponse } from "../../ui6e/formatDetectiveCyclometriques";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveCyclo } from "./index";
import { correctionDetailleeDetectiveCyclo } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de `6gen152` « Le détective d'erreurs : réciproques et
 * arcfonctions ». Énoncé papier = ce que l'élève devait faire, la copie numérotée (marge rouge, même
 * mise en page que 6gen88 / 6gen144) et la consigne globale ; les trois écrans (ligne, erreur,
 * correction) deviennent les étapes a, b, c du corrigé. Le type d'erreur (= variante) est la réponse
 * de l'écran 2 : groupe à verdict en évaluation, niveau et durée constants dans le groupe (méthode 1,
 * piège 0, nombres 0, `sansCharge`).
 */

type E = ExerciceDetectiveCyclo;
const t = texte;
const f = latex;

function copieHtml(e: E): string {
  const items = copie(e)
    .lignes.map(
      (fr, i) =>
        `<div style="display:flex;align-items:baseline;margin:3px 0">` +
        `<span style="flex:0 0 2em;text-align:right;padding-right:0.6em;border-right:2px solid #c0392b;color:#555">${i + 1}</span>` +
        `<span style="flex:1 1 auto;min-width:0;padding-left:0.7em;overflow-x:auto;overflow-y:hidden">${fragmentsVersHtml(fr as FragmentConsigne[])}</span></div>`,
    )
    .join("");
  return [`<p class="paragraphe">Copie de l'élève :</p>`, `<div class="paragraphe copie-eleve">${items}</div>`].join("");
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e) as FragmentConsigne[], enteteHtml: copieHtml(e), questions: PHASES.map((p) => ({ consigne: consigne(e, p) as FragmentConsigne[] })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t(`Ligne ${numeroLigneFausse(e)} fausse. `), ...(descriptionFragments(e.variante, e) as FragmentConsigne[]), t(" Correction : "), ...(reponse(e, "correction") as FragmentConsigne[])];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: [t("Voici la résolution d'un exercice rédigée par un élève. Exercice : "), ...(copie(e).enonce as FragmentConsigne[])],
      enteteHtml: copieHtml(e),
      questions: [{ consigne: [t(CONSIGNE_GLOBALE)] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDetectiveCyclo(e)), methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const deux = copie(e).valeurs.length === 2;
  const erreurs: ErreurFrequente[] = [
    { description: [t("Ligne signalée = une conséquence de l'erreur (valeur étrange) au lieu de la ligne qui la cause")], cout: "0 pt sur la ligne" },
    { description: [t("Erreur seulement constatée (« le calcul est faux ») sans nommer la règle")], cout: "moitié des points de l'explication" },
    { description: [t("Valeur approchée au lieu de la valeur exacte")], cout: "moitié des points de la correction" },
  ];
  if (deux) erreurs.push({ description: [t("Ligne fausse corrigée sans reprendre la suite de la résolution")], cout: "0 pt sur le résultat final" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Ligne fausse identifiée et justifiée : "), ...(reponse(e, "ligne") as FragmentConsigne[])], points: 1 },
      { sousQuestion: "b", critere: [t("Erreur nommée, règle juste du cours")], points: 1 },
      { sousQuestion: "c", critere: [t("Résolution reprise : "), ...(reponse(e, "correction") as FragmentConsigne[])], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Toute écriture exacte équivalente ("), f("\\dfrac{2}{\\sqrt{3}}=\\dfrac{2\\sqrt{3}}{3}"), t(", "), f("\\dfrac{x-3}{2}=\\dfrac{1}{2}x-\\dfrac{3}{2}"), t(") ; un ensemble-solution dans n'importe quel ordre")]],
  };
}

/** Même type d'erreur et même ligne dans toutes les séries d'une même variante ; aucun cas
 * particulier ; tout est exact. */
export function profilDetectiveCyclo(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "exacte", forme: `${e.variante}|L${numeroLigneFausse(e)}` };
}

export const adaptateurEvaluationDetectiveCyclo: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Le détective d'erreurs : réciproques et arcfonctions — Évaluation",
  nomFichierBase: "detective-erreurs-cyclometriques",
  genererInstance: genererExerciceDetectiveCyclo,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDetectiveCyclo,
  bareme,
  enoncePapier,
  profilInstance: profilDetectiveCyclo,
  groupesVerdict: [{ id: "groupe_erreur", label: "Copie d'élève (type d'erreur tiré au hasard)", variantes: CATALOGUE_VARIANTES.map((v) => v.id) }],
};
