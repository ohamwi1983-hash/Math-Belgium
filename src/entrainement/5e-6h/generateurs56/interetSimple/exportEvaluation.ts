import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { ExerciceInteretSimple } from "./index";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInteretSimple, phasesInteretSimple } from "./index";
import { consigne, question, reponse, situation } from "./format";
import { correctionDetailleeInteretSimple } from "./corrigeDetaille";
import { repartir } from "../finance/commun";

/**
 * Adaptateur papier de `56gen24` « Intérêt simple ». Énoncé = situation + la question globale (plus
 * la convention de durée quand elle sert) ; les écrans (jours, durée en années, formule transformée…)
 * sont les étapes du corrigé. Calculatrice : `calculatrice` pour toutes les instances (produits et
 * quotients décimaux), jamais `exacte` (la calculatrice ne donne pas la réponse : il faut poser le
 * modèle). `forme` = variante (+ donnée de « capital »).
 */

type E = ExerciceInteretSimple;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function enonceComplet(e: E): FragmentConsigne[] {
  const conv = e.unite === "jours" ? " On compte les jours exacts (année de 365 jours)." : e.unite === "quinzaines" ? " Une année compte 24 quinzaines." : "";
  return [...fr(situation(e)), t(conv)];
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceComplet(e), questions: phasesInteretSimple(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.variante) {
    case "jours":
    case "mois":
    case "quinzaines":
      return [t("Intérêt : "), ...fr(reponse(e, "interet")), t(" ; valeur acquise : "), ...fr(reponse(e, "valeur")), t(".")];
    case "capital":
      return [t("Capital placé : "), ...fr(reponse(e, "capital")), t(".")];
    case "taux":
      return [t("Taux annuel : "), ...fr(reponse(e, "taux")), t(".")];
    case "duree":
      return [t("Durée du placement : "), ...fr(reponse(e, "dureeMois")), t(".")];
  }
}

function enoncePapier(e: E): EnoncePapier {
  const lettres = phasesInteretSimple(e).map((_, k) => lettreEtape(k));
  return { section: { enteteFragments: enonceComplet(e), questions: [{ consigne: fr(question(e)) }] }, etapesParQuestion: [lettres], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Valeur acquise : formule imposée par la question (méthode 0) ; retrouver : formule à transformer (1).
  const retrouver = e.variante === "capital" || e.variante === "taux" || e.variante === "duree";
  return { ...etapesDuCorrige(correctionDetailleeInteretSimple(e), []), methode: retrouver ? 1 : 0, piege: 0, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  const ph = phasesInteretSimple(e);
  const poids: Record<string, number> = { jours: 1, duree: 0.5, interet: 1.5, valeur: 1, formule: 1.5, capital: 1.5, taux: 1, dureeMois: 1.5 };
  const pts = repartir(ph.map((p) => poids[p]!));
  const libelles: Record<string, string> = {
    jours: "Nombre de jours exact",
    duree: "Durée en années",
    interet: "Intérêt",
    valeur: "Valeur acquise",
    formule: "Formule transformée",
    capital: "Capital placé",
    taux: "Taux annuel",
    dureeMois: "Durée en mois",
  };
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, k) => ({ sousQuestion: lettreEtape(k), critere: [t(`${libelles[p]} : `), ...fr(reponse(e, p))], points: pts[k]! })),
    erreursFrequentes: [
      { description: [t("Taux laissé en % (3,5 au lieu de 0,035)")], cout: "−1 pt" },
      { description: [t("Durée non exprimée en années (jours, mois ou quinzaines)")], cout: "−1 pt" },
      ...(e.unite === "jours" ? [{ description: [t("Jour du dépôt compté, ou mois de 30 jours")], cout: "−0,5 pt" }] : []),
      ...(e.variante === "capital" && e.donnee === "valeur" ? [{ description: [t("C₀ calculé comme Cₜ(1 − i·t)")], cout: "0 pt sur le capital" }] : []),
    ],
    reponsesAcceptees: [[t("Montants à un centime près ; durée en fraction ou en décimal ; taux en % ou en écriture décimale")]],
  };
}

export function profilInteretSimple(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: e.variante === "capital" ? `capital-${e.donnee}` : e.variante };
}

export const adaptateurEvaluationInteretSimple56: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Intérêt simple — Évaluation",
  nomFichierBase: "interet-simple",
  genererInstance: genererExerciceInteretSimple,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeInteretSimple,
  bareme,
  enoncePapier,
  profilInstance: profilInteretSimple,
  calculatriceIndispensable: true,
};
