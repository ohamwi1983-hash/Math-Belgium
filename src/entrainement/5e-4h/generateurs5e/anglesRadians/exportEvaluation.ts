import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/fragmentsDocx";
import { quadrant, tangente, type ExerciceAnglesRadians } from "../../moteur5e/modeleAnglesRadians";
import { CONSIGNE_GENERALE, consignePapier, consignesEcrans, enonceExercice, reponsesEcrans, souderPonctuation } from "../../ui5e/formatAnglesRadians";
import { figureCercleRadians } from "../../ui5e/figureCercleRadians";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAnglesRadians } from "./index";
import { LIBELLE_CAS_ANGLES_RADIANS, profilAnglesRadians } from "./profil";
import { correctionDetailleeAnglesRadians } from "./corrigeDetaille";

/**
 * Adaptateur feuilles / évaluations de 5gen51 « Angles en radians sur le cercle ». Énoncé papier =
 * l'angle, le cercle quadrillé aux valeurs remarquables (SANS le point M) et une consigne globale ;
 * les quatre écrans deviennent les étapes a–d du corrigé (`corrigeDetaille.ts`, partagé avec
 * l'appli), dont la figure avec M placé.
 */

function figureHtml(e: ExerciceAnglesRadians | null): string {
  return `<div style="max-width:7.5cm;margin:6px auto">${figureCercleRadians({ reduit: e ? e.reduit : null })}</div>`;
}

function construireEnonce(e: ExerciceAnglesRadians): SectionExercice {
  return { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), ...enonceExercice(e)], enteteHtml: figureHtml(null), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: ExerciceAnglesRadians): EnoncePapier {
  return {
    section: { enteteFragments: enonceExercice(e), enteteHtml: figureHtml(null), questions: [{ consigne: consignePapier(e) }] },
    etapesParQuestion: [["a", "b", "c", "d"]],
  };
}

function reponseBreve(e: ExerciceAnglesRadians): FragmentConsigne[] {
  return souderPonctuation(reponsesEcrans(e).flatMap((r, i) => (i === 0 ? r : [texte(" ; "), ...r])));
}

function construireCorrection(e: ExerciceAnglesRadians): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function correctionDetaillee(e: ExerciceAnglesRadians) {
  return correctionDetailleeAnglesRadians(e).map((l) => (l.sousQuestion === "b" && l.type === "resultat" ? { ...l, figureHtml: figureHtml(e) } : l));
}

function bareme(e: ExerciceAnglesRadians): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Angle ramené dans [0 ; 2π[")], points: 1 },
      { sousQuestion: "b", critere: [texte("Quadrant (ou axe) du point image")], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Valeurs exactes de cos θ et sin θ, avec leurs signes")], points: 1.5 },
      { sousQuestion: "d", critere: [texte(tangente(e) ? "Valeur exacte de tan θ" : "tan θ n'existe pas, avec la raison (cos θ = 0)")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Demi-tour π retiré au lieu d'un tour 2π")], cout: "0 pt sur a)" },
      { description: [texte("Cosinus et sinus échangés")], cout: "moitié des points de c)" },
      { description: [texte("Signe oublié ou faux selon le quadrant")], cout: "moitié des points de c)" },
      { description: [texte("Valeur approchée au lieu de la valeur exacte")], cout: "moitié des points de l'étape" },
    ],
    reponsesAcceptees: [[texte("Toute écriture exacte équivalente (par exemple √3/3 ou 1/√3)")]],
  };
}

/** Niveau (Connaître) : lectures b (quadrant) et c (valeurs lues sur la figure) ; méthode 0 ; piège
 * dans les données = M hors du premier quadrant ou tangente qui n'existe pas (comme gen122). */
function criteresDifficulte(e: ExerciceAnglesRadians): CriteresDifficulte {
  const piege = quadrant(e) !== "I" || tangente(e) === null ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeAnglesRadians(e), ["b", "c"]), methode: 0, piege, nombres: 0 };
}

export const adaptateurEvaluationAnglesRadians: AdaptateurFeuilleExercices<ExerciceAnglesRadians> = {
  profilInstance: profilAnglesRadians,
  libelleCasParticulier: LIBELLE_CAS_ANGLES_RADIANS,
  titreDocument: "Angles en radians sur le cercle — Évaluation",
  nomFichierBase: "angles-radians-cercle",
  genererInstance: genererExerciceAnglesRadians,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
