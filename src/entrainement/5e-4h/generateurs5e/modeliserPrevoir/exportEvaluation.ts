import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceModeliserPrevoir } from "../../core5e/modeliserPrevoir";
import { consigne, PHASES_MODELISER, questionPrevision, questionSeuil, reponse, situation, tableau } from "../../ui5e/formatModeliserPrevoir";
import { tableauHtml } from "../../ui5e/definitionRelevesSinusoide";
import { precisionTexte } from "../../ui5e/nombresStatLotH2";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceModeliserPrevoir } from "./index";
import { correctionDetailleeModeliserPrevoir } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen78` « Modéliser et prévoir en contexte ». Énoncé = situation + tableau des
 * relevés + trois VRAIES questions : a) droite des moindres carrés, r et fiabilité (étapes a, b, c) ;
 * b) prévision et sa nature (étapes d, e) ; c) seuil (étape f). Nuage et droite dans le corrigé
 * (`figureHtml`), jamais dans l'énoncé. Calculatrice indispensable (séries réelles) : `calcul:
 * 'calculatrice'`. Les verdicts (fiable, interpolation) sont tirés dans chaque série, jamais dans la
 * `forme` (= le contexte). Regroupement écarté (contexte et tableau propres à l'instance).
 */

type E = ExerciceModeliserPrevoir;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), enteteHtml: tableauHtml(tableau(e)), questions: PHASES_MODELISER.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [
    t("a) "), ...fr(reponse(e, "equation")), t(" ; "), ...fr(reponse(e, "correlation")), t(e.fiable ? " : modèle fiable" : " : modèle peu fiable"),
    t(" ; b) "), ...fr(reponse(e, "prevision")), t(e.interpolation ? " (interpolation)" : " (extrapolation, prudence)"),
    t(" ; c) "), ...fr(reponse(e, "seuil")), t("."),
  ];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: [...fr(situation(e)), t(" Utilise ta calculatrice.")],
      enteteHtml: tableauHtml(tableau(e)),
      questions: [
        { consigne: [t("Détermine l'équation de la droite des moindres carrés "), f("y=ax+b"), t(` (a ${precisionTexte(e.da)}, b ${precisionTexte(e.db)}) et le coefficient de corrélation `), f("r"), t(" (au millième). Le modèle affine est-il fiable ? Justifie.")] },
        { consigne: [...fr(questionPrevision(e)), t(" S'agit-il d'une interpolation ou d'une extrapolation ? Que penses-tu de cette prévision ?")] },
        { consigne: fr(questionSeuil(e)) },
      ],
    },
    etapesParQuestion: [["a", "b", "c"], ["d", "e"], ["f"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Écran b (r affiché par la calculatrice avec a et b) = lecture ; méthode imposée (droite des
  // moindres carrés), choisie parmi celles du cours pour le seuil et la nature : 1 ; calculatrice.
  return { ...etapesDuCorrige(correctionDetailleeModeliserPrevoir(e), ["b"]), methode: 1, piege: 0, nombres: 1, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Droite des moindres carrés : "), ...fr(reponse(e, "equation"))], points: 0.75 },
      { sousQuestion: "b", critere: [t("Coefficient de corrélation : "), ...fr(reponse(e, "correlation"))], points: 0.25 },
      { sousQuestion: "c", critere: [t(e.fiable ? "Modèle fiable : |r| ≥ 0,80 (corrélation forte), justifié par le tableau" : "Modèle peu fiable : |r| < 0,80, justifié par le tableau")], points: 0.5 },
      { sousQuestion: "d", critere: [t("Prévision : "), ...fr(reponse(e, "prevision"))], points: 0.75 },
      { sousQuestion: "e", critere: [t(e.interpolation ? "Interpolation (dans l'intervalle des données) : prévision raisonnable si le modèle est fiable" : "Extrapolation (hors de l'intervalle des données) : prudence")], points: 0.5 },
      { sousQuestion: "f", critere: [t("Équation ax + b = seuil résolue : "), ...fr(reponse(e, "seuil"))], points: 1.25 },
    ],
    erreursFrequentes: [
      { description: [t("Listes échangées (droite de régression de x en y)")], cout: "−0,5, suite notée sans double pénalité" },
      { description: [t("Fiabilité jugée sur le signe de r")], cout: "0 pt sur la fiabilité" },
      { description: [t("« Valeur absente du tableau, donc extrapolation »")], cout: "0 pt sur la nature" },
      { description: [t("Seuil : x remplacé par le seuil au lieu de résoudre ax + b = seuil")], cout: "0 pt sur le seuil" },
    ],
    reponsesAcceptees: [[t("Prévision et seuil calculés avec a et b arrondis ou non arrondis ; écart d'une unité sur le dernier chiffre dû aux arrondis")]],
  };
}

export function profilModeliserPrevoir(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: e.variante };
}

export const adaptateurEvaluationModeliserPrevoir: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Modéliser et prévoir en contexte — Évaluation",
  nomFichierBase: "modeliser-prevoir-deux-variables",
  genererInstance: genererExerciceModeliserPrevoir,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeModeliserPrevoir,
  bareme,
  enoncePapier,
  profilInstance: profilModeliserPrevoir,
  calculatriceIndispensable: true,
};
