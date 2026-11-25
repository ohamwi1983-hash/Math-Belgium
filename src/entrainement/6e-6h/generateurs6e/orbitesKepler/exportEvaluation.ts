import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceKE } from "../../core6e/orbitesKepler";
import { excentricite, PHASES_KE, unite } from "../../core6e/orbitesKepler";
import { milliersL, nL } from "../../ui6e/outilsConiquesLotH2";
import { consigne, coordCentralL, mots, situation } from "../../ui6e/formatOrbitesKepler";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceKE } from "./index";
import { correctionDetailleeKE } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen141` « Orbites et ellipses : Kepler ». Énoncé papier = la situation
 * (périhélie et aphélie, ou altitudes et rayon terrestre ; jamais la position du corps central) +
 * consigne globale ; les quatre écrans deviennent les étapes a–d du corrigé (schéma de l'orbite). Niveau et
 * durée constants : trois étapes qui transforment + une lecture (le corps central au foyer), méthode 1,
 * piège 1 (corps central au centre ; altitudes). `forme` = variante ; aucun cas particulier ; aucun
 * `calcul` (modéliser l'orbite : règle du 24/11). Regroupement écarté : situation propre à l'instance.
 */

type E = ExerciceKE;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), questions: PHASES_KE.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [L(`a=${milliersL(e.a)}`), t(` ${unite(e)}`), t(", "), L(`c=${milliersL(e.c)}`), t(` ${unite(e)}`), t(" ; "), L(coordCentralL(e)), t(" (un foyer) ; "), L(`e=${nL(excentricite(e))}`), t(" ; "), L(`b=${milliersL(e.b)}`), t(` ${unite(e)}`)];
}

function enoncePapier(e: E): EnoncePapier {
  const m = mots(e);
  return {
    section: { enteteFragments: fr(situation(e)), questions: [{ consigne: [t("Détermine le demi-grand axe "), L("a"), t(" et la demi-distance focale "), L("c"), t(` de l'orbite, les coordonnées du centre ${m.centralDe} dans le repère donné, l'excentricité de l'orbite et son demi-petit axe `), L("b"), t(". Justifie.")] }] },
    etapesParQuestion: [["a", "b", "c", "d"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 1, methode: 1, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const m = mots(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [L(`a=${milliersL(e.a)}`), t(` ${unite(e)}`), t(" et "), L(`c=${milliersL(e.c)}`), t(` ${unite(e)}`)], points: 1.5 },
      { sousQuestion: "b", critere: [t(`Centre ${m.centralDe} à un foyer, justifié par la première loi de Kepler : `), L(coordCentralL(e))], points: 1 },
      { sousQuestion: "c", critere: [L(`e=${nL(excentricite(e))}`)], points: 0.5 },
      { sousQuestion: "d", critere: [L(`b=${milliersL(e.b)}`), t(` ${unite(e)}`)], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t(`${m.central === "la Terre" ? "Terre" : "Soleil"} placé au centre de l'orbite`)], cout: "0 pt sur la position du corps central" },
      ...(e.R > 0 ? [{ description: [t("Altitudes prises pour les distances au centre de la Terre")], cout: "0 pt sur a et c, la suite est jugée sur sa cohérence" }] : []),
      { description: [t("Excentricité calculée par "), L("\\dfrac{b}{a}"), t(", ou "), L("b^2=a^2+c^2")], cout: "0 pt sur l'étape concernée" },
    ],
    reponsesAcceptees: [[t("Valeurs exactes avec ou sans unité ; excentricité sous forme de fraction (non simplifiée acceptée)")]],
  };
}

export function profilKE(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationKE: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Orbites et ellipses : Kepler — Évaluation",
  nomFichierBase: "orbites-ellipses-kepler",
  genererInstance: genererExerciceKE,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeKE,
  bareme,
  enoncePapier,
  profilInstance: profilKE,
};
