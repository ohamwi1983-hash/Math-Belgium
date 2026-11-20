import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/fragmentsDocx";
import type { ExerciceAssocierParaboles } from "../../core/associerParaboles.types";
import { CONSIGNE_GENERALE, consigneEcran, consignePapier, enonceFragments, figureCourbe, listeEquations, reponseBreveFragments, souderPonctuation } from "../../ui/formatAssocierParaboles";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAssocierParaboles } from "./index";
import { profilAssocierParaboles } from "./profil";
import { correctionDetailleeAssocierParaboles } from "./corrigeDetaille";

/**
 * Adaptateur feuilles / évaluations de gen128 « Associer paraboles et équations ». Énoncé papier = les
 * quatre équations, les quatre courbes (même quadrillage, même échelle en x et en y, aucun point
 * marqué) et une consigne globale ; les quatre écrans deviennent les étapes a–d du corrigé.
 */

type E = ExerciceAssocierParaboles;

function courbesHtml(e: E): string {
  const figs = [0, 1, 2, 3].map((n) => `<div style="flex:1 1 7cm;max-width:8cm;min-width:0">${figureCourbe(e, n).replace(/width="(\d+)" height="(\d+)"/, 'style="width:100%;max-width:$1px;height:auto;display:block;margin:0 auto"')}</div>`);
  return `<div style="display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center">${figs.join("")}</div>`;
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), ...enonceFragments(), texte(" "), ...listeEquations(e)], enteteHtml: courbesHtml(e), questions: [0, 1, 2, 3].map((n) => ({ consigne: consigneEcran(n) })) };
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: souderPonctuation([...enonceFragments(), texte(" "), ...listeEquations(e), texte(".")]), enteteHtml: courbesHtml(e), questions: [{ consigne: consignePapier() }] }, etapesParQuestion: [["a", "b", "c", "d"]] };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseBreveFragments(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const piege: Record<E["variante"], string> = {
    signesSommet: "Signe de l'abscisse du sommet lu tel quel dans la parenthèse",
    coefficientA: "a confondu avec son inverse (parabole resserrée / ouverte) ou avec son opposé",
    factorisee: "Zéros lus avec le mauvais signe dans les facteurs",
    troisEcritures: "Ordonnée à l'origine ou sens ignorés pour la forme développée",
  };
  return {
    reponseFinale: reponseBreve(e),
    criteres: ["a", "b", "c", "d"].map((sq, n) => ({ sousQuestion: sq, critere: [texte(`Courbe ${n + 1} associée, avec une lecture qui le justifie`)], points: 1 })),
    erreursFrequentes: [
      { description: [texte(piege[e.variante])], cout: "0 pt sur la courbe concernée" },
      { description: [texte("Association juste sans justification")], cout: "moitié des points de la courbe" },
    ],
    reponsesAcceptees: [[texte("Toute justification correcte par lecture (sommet, sens, écart vertical à un carreau du sommet, zéros, ordonnée à l'origine)")]],
  };
}

/** Niveau : quatre écrans de LECTURE (associer, comme 5gen53 et 6gen85) ; méthode 0 ; piège = le
 * paramètre piège de la variante, toujours présent. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeAssocierParaboles(e), ["a", "b", "c", "d"]), methode: 0, piege: 1, nombres: 0 };
}

export const adaptateurEvaluationAssocierParaboles: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilAssocierParaboles,
  titreDocument: "Associer paraboles et équations — Évaluation",
  nomFichierBase: "associer-paraboles-equations",
  genererInstance: genererExerciceAssocierParaboles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeAssocierParaboles,
  bareme,
  enoncePapier,
};
