import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/fragmentsDocx";
import { fenetre, type ExerciceAssocierCourbes } from "../../moteur5e/modeleAssocierCourbes";
import { CONSIGNE_GENERALE, consignePapier, consignesEcrans, enonceExercice, listeExpressions, reponseBreveFragments, souderPonctuation } from "../../ui5e/formatAssocierCourbes";
import { figureCourbe } from "../../ui5e/figureAssocierCourbes";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAssocierCourbes } from "./index";
import { profilAssocierCourbes } from "./profil";
import { correctionDetailleeAssocierCourbes } from "./corrigeDetaille";

/**
 * Adaptateur feuilles / évaluations de 5gen53 « Associer formules et courbes ». Énoncé papier = les
 * quatre expressions, les quatre courbes (même quadrillage, chaque colonne étiquetée en multiple de π)
 * et une consigne globale ; les quatre écrans deviennent les étapes a–d du corrigé (une par courbe).
 */

function courbesHtml(e: ExerciceAssocierCourbes): string {
  const fen = fenetre(e);
  const figs = e.ordre.map((i, k) => `<div style="flex:1 1 7.5cm;max-width:8.5cm;min-width:0">${figureCourbe(e.expressions[i]!, fen, `Courbe ${k + 1}`).replace(/width="\d+" height="\d+"/, 'style="width:100%;height:auto;display:block"')}</div>`);
  return `<div style="display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center">${figs.join("")}</div>`;
}

function construireEnonce(e: ExerciceAssocierCourbes): SectionExercice {
  return { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), ...enonceExercice(), texte(" "), ...listeExpressions(e)], enteteHtml: courbesHtml(e), questions: consignesEcrans().map((consigne) => ({ consigne })) };
}

function enoncePapier(e: ExerciceAssocierCourbes): EnoncePapier {
  return { section: { enteteFragments: souderPonctuation([...enonceExercice(), texte(" "), ...listeExpressions(e), texte(".")]), enteteHtml: courbesHtml(e), questions: [{ consigne: consignePapier() }] }, etapesParQuestion: [["a", "b", "c", "d"]] };
}

function reponseBreve(e: ExerciceAssocierCourbes): FragmentConsigne[] {
  return reponseBreveFragments(e);
}

function construireCorrection(e: ExerciceAssocierCourbes): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceAssocierCourbes): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: ["a", "b", "c", "d"].map((sq, k) => ({ sousQuestion: sq, critere: [texte(`Courbe ${k + 1} associée, avec une lecture qui le justifie`)], points: 1 })),
    erreursFrequentes: [
      { description: [texte("Décalage lu comme φ au lieu de Φ = −φ/ω")], cout: "0 pt sur la courbe concernée" },
      { description: [texte("Signe de A ignoré (courbe retournée)")], cout: "0 pt sur la courbe concernée" },
      { description: [texte("Association juste sans justification")], cout: "moitié des points de la courbe" },
    ],
    reponsesAcceptees: [[texte("Toute justification correcte par lecture (ligne moyenne, amplitude, période, décalage, sens)")]],
  };
}

/** Niveau (Connaître) : quatre écrans de LECTURE (associer : comme 6gen85 a–b) ; méthode 0 ; piège =
 * le paramètre piège de la variante (φ/Φ, A < 0, ω/T), toujours présent. */
function criteresDifficulte(e: ExerciceAssocierCourbes): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeAssocierCourbes(e), ["a", "b", "c", "d"]), methode: 0, piege: 1, nombres: 0 };
}

export const adaptateurEvaluationAssocierCourbes: AdaptateurFeuilleExercices<ExerciceAssocierCourbes> = {
  profilInstance: profilAssocierCourbes,
  titreDocument: "Associer formules et courbes — Évaluation",
  nomFichierBase: "associer-formules-courbes",
  genererInstance: genererExerciceAssocierCourbes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeAssocierCourbes,
  bareme,
  enoncePapier,
};
