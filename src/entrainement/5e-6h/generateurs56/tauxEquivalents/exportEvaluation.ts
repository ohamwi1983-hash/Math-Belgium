import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import { repartir } from "../finance/commun";
import type { ExerciceTauxEquivalents, PhaseTauxEquivalents } from "./index";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTauxEquivalents, phasesTauxEquivalents } from "./index";
import { consigne, libelle, question, reponse, situation } from "./format";
import { correctionDetailleeTauxEquivalents } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen26` « Taux équivalents et taux réel ». Énoncé = situation + question
 * globale ; la dépréciation pose deux VRAIES questions (taux annuel, valeur au bout de m mois). Verdict
 * de « comparer » (offre gagnante) tiré dans chaque série, jamais dans la `forme` (= variante, + contexte
 * placement / emprunt pour « comparer », visible dans l'énoncé). `calcul: 'calculatrice'` (puissances,
 * racines).
 */

type E = ExerciceTauxEquivalents;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), questions: phasesTauxEquivalents(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.variante) {
    case "versAnnuel":
    case "depuisAnnuel":
    case "longuePeriode":
      return [t(`${libelle(e, "taux")} : `), ...fr(reponse(e, "taux")), t(".")];
    case "comparer":
      return [t("A : "), ...fr(reponse(e, "tauxA")), t(" ; B : "), ...fr(reponse(e, "tauxB")), t(` ; l'offre ${e.gagnante} est la plus avantageuse.`)];
    case "precompte":
      return [t("Intérêt net : "), ...fr(reponse(e, "net")), t(" ; taux net : "), ...fr(reponse(e, "tauxNet")), t(".")];
    case "depreciation":
      return [t("a) "), ...fr(reponse(e, "taux")), t(" par an ; b) "), ...fr(reponse(e, "valeur")), t(".")];
  }
}

function enoncePapier(e: E): EnoncePapier {
  const lettres = phasesTauxEquivalents(e).map((_, k) => lettreEtape(k));
  if (e.variante === "depreciation")
    return {
      section: { enteteFragments: fr(situation(e)), questions: [{ consigne: [t("Quel est le taux annuel de dépréciation (en %, au centième) ?")] }, { consigne: [t(`Quelle sera la valeur de la voiture au bout de ${e.duree} mois ?`)] }] },
      etapesParQuestion: [["a", "b"], ["c"]],
      reponseBreve: reponseBreve(e),
    };
  return { section: { enteteFragments: fr(situation(e)), questions: [{ consigne: fr(question(e)) }] }, etapesParQuestion: [lettres], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Choisir la relation des taux équivalents parmi celles du cours : méthode 1 ; le verdict de « comparer »
  // ne change ni le nombre d'étapes ni le niveau (`sansCharge`).
  return { ...etapesDuCorrige(correctionDetailleeTauxEquivalents(e), []), methode: e.variante === "precompte" ? 0 : 1, piege: 0, nombres: 1, sansCharge: true };
}

const POIDS: Record<PhaseTauxEquivalents, number> = { relation: 1.5, taux: 2.5, tauxA: 1.5, tauxB: 1.5, choix: 1, brut: 1, net: 1.5, tauxNet: 1.5, valeur: 1 };

function bareme(e: E): BaremeExercice {
  const ph = phasesTauxEquivalents(e);
  const pts = repartir(ph.map((p) => POIDS[p]));
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, k) => ({ sousQuestion: lettreEtape(k), critere: [t(`${libelle(e, p)} : `), ...fr(reponse(e, p))], points: pts[k]! })),
    erreursFrequentes: [
      { description: [t("Taux multiplié ou divisé par le nombre de périodes au lieu d'une puissance ou d'une racine")], cout: "0 pt sur le taux" },
      ...(e.variante === "comparer" ? [{ description: [t("Taux donnés comparés directement (périodes différentes)")], cout: "0 pt sur la conclusion" }] : []),
      ...(e.variante === "precompte" ? [{ description: [t("Précompte retiré en points du taux brut")], cout: "0 pt sur le taux net" }] : []),
      ...(e.variante === "depreciation" ? [{ description: [t("Baisses mensuelles additionnées (12 fois le taux mensuel)")], cout: "0 pt sur le taux annuel" }] : []),
    ],
    reponsesAcceptees: [[t("Taux en % ou en écriture décimale, à 0,01 point près (0,001 point pour un taux périodique) ; montants à un centime près")]],
  };
}

export function profilTauxEquivalents(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: e.variante === "comparer" ? `comparer-${e.emprunt ? "emprunt" : "placement"}` : e.variante };
}

export const adaptateurEvaluationTauxEquivalents56: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Taux équivalents et taux réel — Évaluation",
  nomFichierBase: "taux-equivalents",
  genererInstance: genererExerciceTauxEquivalents,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTauxEquivalents,
  bareme,
  enoncePapier,
  profilInstance: profilTauxEquivalents,
  calculatriceIndispensable: true,
};
