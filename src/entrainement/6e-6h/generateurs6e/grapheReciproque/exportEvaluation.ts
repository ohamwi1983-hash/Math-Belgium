import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceGrapheReciproque } from "../../core6e/grapheReciproque.types";
import { consigne, consigneGenerale, PHASES_GRAPHE, questionsPapier, reponse } from "../../ui6e/formatGrapheReciproque";
import { figureCandidats, figurePrincipale } from "../../ui6e/figureGrapheReciproque";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceGrapheReciproque } from "./index";
import { correctionDetailleeGrapheReciproque } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de `6gen154` « Graphe de la réciproque ». Énoncé
 * papier = la figure (f, A, tangente en A, quadrillage d'une unité, même échelle) + les quatre
 * graphes candidats + quatre VRAIES questions (point A′, domaine et image, graphe, pentes), une par
 * écran. Lectures : a, b, c ; d est une étape (inverse de la pente). Piège : extrémité exclue ou f
 * décroissante (bornes de l'image à remettre dans l'ordre).
 */

type E = ExerciceGrapheReciproque;
const t = texte;
const f = latex;
const fr = (x: unknown): FragmentConsigne[] => x as FragmentConsigne[];
const LETTRES = "abcd";

function enteteHtml(e: E): string {
  const style = 'style="display:block;margin:6px auto;max-width:100%;height:auto"';
  return [figurePrincipale(e, { tangente: true, largeur: 300 }), figureCandidats(e)].map((s) => s.replace("<svg ", `<svg ${style} `)).join("");
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), enteteHtml: enteteHtml(e), questions: PHASES_GRAPHE.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return PHASES_GRAPHE.flatMap((p, i) => [t(`${i > 0 ? " ; " : ""}${LETTRES[i]}) `), ...fr(reponse(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(consigneGenerale(e)), enteteHtml: enteteHtml(e), questions: questionsPapier().map((q) => ({ consigne: fr(q) })) },
    etapesParQuestion: [["a"], ["b"], ["c"], ["d"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  const piege = e.variante === "decroissante" || e.ouvert[0] || e.ouvert[1] ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeGrapheReciproque(e), ["a", "b", "c"]), methode: 0, piege, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Coordonnées échangées : "), ...fr(reponse(e, "point"))], points: 0.5 },
      { sousQuestion: "b", critere: [t("Domaine et image échangés, crochets justes : "), ...fr(reponse(e, "ensembles"))], points: 1.5 },
      { sousQuestion: "c", critere: [t("Graphe symétrique par rapport à "), f("y=x"), t(" : "), ...fr(reponse(e, "graphe"))], points: 0.5 },
      { sousQuestion: "d", critere: [t("Pente lue "), f("\\dfrac{\\Delta y}{\\Delta x}"), t(" puis inversée : "), ...fr(reponse(e, "pente"))], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [t("Domaine et image de "), f("f"), t(" recopiés sans les échanger")], cout: "0 pt sur le domaine et l'image" },
      { description: [t("Rond vide oublié (borne exclue devenue comprise)")], cout: "−0,5" },
      { description: [t("Pente de "), f("f^{-1}"), t(" égale à "), f("m_f"), t(" ou à "), f("-\\dfrac{1}{m_f}")], cout: "moitié des points de la pente" },
    ],
    reponsesAcceptees: [[t("Pentes sous toute forme exacte ("), f("\\dfrac{3}{2}=1{,}5"), t(")")]],
  };
}

export function profilGrapheReciproque(e: E): ProfilInstance {
  // Pas de `calcul` (revue des profils, 24/11/2026) : la calculatrice ne donne pas la réponse, tiré
  // que la calculatrice soit interdite ou autorisée.
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationGrapheReciproque: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Graphe de la réciproque — Évaluation",
  nomFichierBase: "graphe-reciproque",
  genererInstance: genererExerciceGrapheReciproque,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeGrapheReciproque,
  bareme,
  enoncePapier,
  profilInstance: profilGrapheReciproque,
};
