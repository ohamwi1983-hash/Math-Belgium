import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceLireDomaine } from "../../core5e/lireDomaineImage";
import { consigne, consigneGenerale, PHASES, phraseGraphique, reponse } from "../../ui5e/formatLireDomaine";
import { figureLireDomaine } from "../../ui5e/figureLireDomaine";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLireDomaine } from "./index";
import { correctionDetailleeLireDomaine } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen59` « Lire domaine et image sur un graphique ». Énoncé papier = le
 * graphique (quadrillage d'une unité, aucun point annoté) + trois VRAIES questions distinctes :
 * a) dom f, b) Im f, c) f(a) existe-t-il ? (une étape d'écran chacune). Le corrigé montre les deux
 * projections sur une figure. Trois lectures : niveau et durée constants (le verdict de c ne change
 * rien).
 */

type E = ExerciceLireDomaine;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
/** Figure de l'énoncé papier : 7,5 cm au plus. */
const figurePapier = (svg: string) => `<div style="max-width:7.5cm;margin:6px auto">${svg.replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1width="100%" style="height:auto;display:block"')}</div>`;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), enteteHtml: figurePapier(figureLireDomaine(e)), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("a) "), ...fr(reponse(e, "domaine")), t(" ; b) "), ...fr(reponse(e, "image")), t(" ; c) "), ...fr(reponse(e, "existence"))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: [t("Voici le graphique d'une fonction f, sur un quadrillage d'une unité. "), ...fr(phraseGraphique(e))],
      enteteHtml: figurePapier(figureLireDomaine(e)),
      questions: [
        { consigne: [t("Détermine le domaine de définition de f.")] },
        { consigne: [t("Détermine l'image de f.")] },
        { consigne: [t("Le nombre "), f(`f(${e.a})`), t(" existe-t-il ? Justifie.")] },
      ],
    },
    etapesParQuestion: [["a"], ["b"], ["c"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Trois écrans de pure lecture ; méthode imposée ; piège dans les données (extrémités creuses,
 * trou, flèche, écart : présent dans toutes les variantes, constant) ; nombres entiers. */
function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 0, etapesLecture: 3, methode: 0, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Domaine, bornes et crochets justes : "), ...fr(reponse(e, "domaine"))], points: 1.5 },
      { sousQuestion: "b", critere: [t("Image, bornes et crochets justes : "), ...fr(reponse(e, "image"))], points: 1.5 },
      { sousQuestion: "c", critere: [t("Existence justifiée par le graphique : "), ...fr(reponse(e, "existence"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Domaine et image échangés (lecture sur le mauvais axe)")], cout: "0 pt sur l'ensemble concerné" },
      { description: [t("Crochet faux (point creux compris, point plein exclu, crochet fermé du côté de "), f("\\infty"), t(")")], cout: "−0,5 par crochet" },
      { description: [t("Image limitée aux ordonnées des extrémités")], cout: "moitié des points de l'image" },
      { description: [t("Réponse sans justification à la dernière question")], cout: "moitié des points" },
    ],
    reponsesAcceptees: [[t("Toute écriture juste de l'ensemble : réunion dans n'importe quel ordre, "), f("\\mathbb{R}\\setminus\\{a\\}"), t(" pour "), f("\\mathopen{]}-\\infty\\,;\\,a\\mathclose{[}\\cup\\mathopen{]}a\\,;\\,+\\infty\\mathclose{[}"), t(", intervalle écrit avec ses deux bornes")]],
  };
}

/** `forme` = variante (même allure de graphique d'une série à l'autre) ; « f(a) existe » est le
 * verdict tiré dans chaque série ; aucun cas particulier ; tout est exact. */
export function profilLireDomaine(e: E): ProfilInstance {
  // Pas de `calcul` (revue des profils, 24/11/2026) : la calculatrice ne donne pas la réponse, tiré
  // que la calculatrice soit interdite ou autorisée.
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationLireDomaine: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Lire domaine et image sur un graphique — Évaluation",
  nomFichierBase: "domaine-image-graphique",
  genererInstance: genererExerciceLireDomaine,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLireDomaine,
  bareme,
  enoncePapier,
  profilInstance: profilLireDomaine,
};
