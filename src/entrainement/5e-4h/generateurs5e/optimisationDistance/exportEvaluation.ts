import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceOptimisationDistance } from "../../core5e/optimisationDistance";
import { modele } from "../../core5e/optimisationDistance";
import { consigne, consigneGenerale, consignePapier, figureEnonce, PHASES, reponse } from "../../ui5e/formatOptimisationDistance";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceOptimisationDistance } from "./index";
import { correctionDetailleeOptimisationDistance } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen71` « Optimisation : distance et temps minimaux ». Énoncé papier = la
 * situation, sa figure (courbe et point, plage et mer, rivière : aucune position optimale marquée)
 * et la consigne globale (point / position, valeur minimale, justification par la dérivée sur le
 * domaine) ; les cinq écrans sont les étapes a–e du corrigé. Le verdict « optimum à la borne »
 * (pointRacine, sauveteur, ≈ 25 %) est tiré dans chaque série, jamais dans `forme` ; niveau et
 * durée CONSTANTS dans chaque variante (cinq étapes `sansCharge`, méthode 2 : l'élève construit la
 * fonction ; piège dans les données : domaine qui peut exclure x₀ (pointRacine, sauveteur) ou
 * solution négative à rejeter (pointHyperbole) ; nombres : calculatrice pour le sauveteur).
 * Regroupement a), b), c) écarté (problème en contexte propre à l'instance, comme 5gen32).
 */

type E = ExerciceOptimisationDistance;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const figureHtml = (e: E) => `<div style="max-width:8.5cm;margin:6px auto">${figureEnonce(e).replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1width="100%" style="height:auto;display:block"')}</div>`;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), enteteHtml: figureHtml(e), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return fr(reponse(e, "optimum"));
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: [...fr(consigneGenerale(e)), t(` ${consignePapier(e)}`)], enteteHtml: figureHtml(e), questions: [] },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { etapesTransformation: 5, etapesLecture: 0, methode: 2, piege: e.variante === "cable" ? 0 : 1, nombres: e.variante === "sauveteur" ? 1 : 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const m = modele(e);
  const erreurs: ErreurFrequente[] = [
    { description: [t("Dérivée fausse (facteur de la règle de la chaîne oublié)")], cout: "0 pt sur la dérivée, suite notée sans double pénalité" },
    { description: [t("Minimum affirmé sans étude du signe de la dérivée sur le domaine")], cout: "0 pt sur le signe" },
  ];
  if (e.variante === "pointRacine" || e.variante === "pointHyperbole") erreurs.push({ description: [t("Carré de la distance donné pour la distance")], cout: "−0,5" });
  if (e.variante === "sauveteur") erreurs.push({ description: [t("Durée calculée en multipliant par la vitesse")], cout: "0 pt sur le modèle" });
  if (e.variante === "pointHyperbole") erreurs.push({ description: [t("Solution négative "), f("-x_0"), t(" gardée")], cout: "−0,5" });
  if (e.variante === "pointRacine" || e.variante === "sauveteur") erreurs.push({ description: [t("Zéro de la dérivée pris pour l'optimum sans vérifier qu'il est dans le domaine")], cout: "0 pt sur l'optimum" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Fonction à minimiser : "), ...fr(reponse(e, "modele"))], points: 1 },
      { sousQuestion: "b", critere: [t("Dérivée : "), ...fr(reponse(e, "derivee"))], points: 1 },
      { sousQuestion: "c", critere: [t("Zéro de la dérivée : "), ...fr(reponse(e, "critique"))], points: 0.5 },
      { sousQuestion: "d", critere: [t("Signe de la dérivée sur le domaine, conclusion sur le minimum")], points: 0.5 },
      { sousQuestion: "e", critere: [t("Optimum et valeur minimale : "), ...fr(reponse(e, "optimum"))], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t(m.valExacte ? "Toute écriture exacte équivalente ; minimum justifié par un tableau de signes ou par la comparaison aux bornes" : "Temps à 0,1 s près ; minimum justifié par un tableau de signes ou par la comparaison aux bornes")]],
  };
}

/** `forme` = variante (même situation d'une série à l'autre) ; le verdict « optimum à la borne » est
 * tiré dans chaque série. Sauveteur : calculatrice ; autres : exact. Aucun cas particulier. */
export function profilOptimisationDistance(e: E): ProfilInstance {
  return { casParticulier: null, calcul: e.variante === "sauveteur" ? "calculatrice" : "exacte", forme: e.variante };
}

export const adaptateurEvaluationOptimisationDistance: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Optimisation : distance et temps minimaux — Évaluation",
  nomFichierBase: "optimisation-distance-temps",
  genererInstance: genererExerciceOptimisationDistance,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeOptimisationDistance,
  bareme,
  enoncePapier,
  profilInstance: profilOptimisationDistance,
  calculatriceIndispensable: ["sauveteur"],
};
