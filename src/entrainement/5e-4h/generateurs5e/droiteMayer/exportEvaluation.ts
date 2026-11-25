import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceDroiteMayer } from "../../core5e/droiteMayer";
import { avantTableau, nT } from "../../ui5e/ecrituresStat2vLotH1";
import { consigne, consigneGenerale, contexte, nomPrecision, PHASES, reponse, tableauPapier } from "../../ui5e/formatDroiteMayer";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDroiteMayer } from "./index";
import { correctionDetailleeDroiteMayer } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen36` « Droite de Mayer ». Énoncé papier : contexte + tableau (KaTeX affiché, aussi
 * dans la copie Word), puis deux VRAIES questions : a) l'équation de la droite de Mayer (précisions
 * d'arrondi dites) et la vérification par G [étapes a à e] ; b) la prévision [f]. Le tri, le partage, G₁ et
 * G₂ sont des étapes du corrigé. Pas de regroupement (série propre à chaque instance).
 */

type E = ExerciceDroiteMayer;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("a) "), ...fr(reponse(e, "equation")), t(" (passe par "), ...fr(reponse(e, "g")), t(") ; b) "), ...fr(reponse(e, "prevision"))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: [...avantTableau([t(contexte(e).phrase)]), f(tableauPapier(e))],
      questions: [
        { consigne: [t(`Détermine une équation de la droite de Mayer de cette série (pente arrondie ${nomPrecision(e.da)}, ordonnée à l'origine ${nomPrecision(e.db)}), puis vérifie qu'elle passe par le point moyen G du nuage.`)] },
        { consigne: [t(`${contexte(e).questionY(nT(e.x0, e.dx))} Arrondis ${nomPrecision(e.dp)}.`)] },
      ],
    },
    etapesParQuestion: [["a", "b", "c", "d", "e"], ["f"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Six étapes (tri, moyennes, pente, b, G, prévision) ; méthode imposée (0) ; piège 1 si les données sont
 * dans le désordre (dans les DONNÉES) ; nombres arrondis détectés sur le corrigé. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDroiteMayer(e)), methode: 0, piege: e.variante === "desordre" ? 1 : 0 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Données rangées et partagées : "), ...fr(reponse(e, "partage"))], points: 0.5 },
      { sousQuestion: "b", critere: [t("Points moyens : "), ...fr(reponse(e, "groupes"))], points: 1 },
      { sousQuestion: "c", critere: [t("Pente : "), ...fr(reponse(e, "pente"))], points: 0.5 },
      { sousQuestion: "d", critere: [t("b (pente non arrondie) et équation : "), ...fr(reponse(e, "equation"))], points: 1 },
      { sousQuestion: "e", critere: [t("Point moyen G et vérification : "), ...fr(reponse(e, "g"))], points: 0.5 },
      { sousQuestion: "f", critere: [t("Prévision : "), ...fr(reponse(e, "prevision"))], points: 0.5 },
    ],
    erreursFrequentes: [
      ...(e.variante === "desordre" ? [{ description: [t("Groupes formés sans ranger les abscisses")], cout: "0 pt sur les étapes 1 et 2, suite notée sans double pénalité" }] : []),
      { description: [t("Premier et dernier points au lieu des points moyens")], cout: "0 pt sur les étapes 2 et 3" },
      { description: [t("b calculé avec la pente arrondie (écart sur b)")], cout: "−0,25" },
    ],
    reponsesAcceptees: [[t("Écart d'une unité sur la dernière décimale de b ou de la prévision dû aux arrondis ; vérification par G faite avec l'équation arrondie (égalité approchée)")]],
  };
}

/** Mayer : la TI-30XB ne trace pas la droite de Mayer → aucun `calcul` (tirée dans les deux modes) ; aucun
 * cas particulier ; `forme` sans objet. */
export function profilDroiteMayer(_e: E): ProfilInstance {
  return { casParticulier: null };
}

export const adaptateurEvaluationDroiteMayer: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Droite de Mayer — Évaluation",
  nomFichierBase: "droite-mayer",
  genererInstance: genererExerciceDroiteMayer,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDroiteMayer,
  bareme,
  enoncePapier,
  profilInstance: profilDroiteMayer,
};
