import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import { eurT, repartir } from "../finance/commun";
import type { ExerciceInteretsComposes, PhaseInteretsComposes } from "./index";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInteretsComposes, phasesInteretsComposes } from "./index";
import { consigne, libelle, question, reponse, situation } from "./format";
import { correctionDetailleeInteretsComposes } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen25` « Intérêts composés ». Énoncé = situation + question globale ; la
 * variante « duree » pose deux VRAIES questions (le nombre d'années, puis le capital atteint). Les
 * écrans de choix (suite, formule, inéquation) sont des étapes du corrigé. `calcul: 'calculatrice'`
 * (puissances, racines n-ièmes, table) ; aucun menu financier supposé.
 */

type E = ExerciceInteretsComposes;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), questions: phasesInteretsComposes(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.variante) {
    case "valeurAcquise":
      return [t("Valeur acquise : "), ...fr(reponse(e, "valeur")), t(" ; intérêts : "), ...fr(reponse(e, "interets")), t(".")];
    case "valeurActuelle":
      return [t("Montant à placer : "), ...fr(reponse(e, "capital")), t(".")];
    case "taux":
      return [t("Taux annuel : "), ...fr(reponse(e, "taux")), t(".")];
    case "duree":
      return [t("a) "), ...fr(reponse(e, "annees")), t(" ; b) "), ...fr(reponse(e, "montant")), t(".")];
    case "doublement":
      return [t("Au bout de "), ...fr(reponse(e, "annees")), t(".")];
    case "dureeMixte":
      return [t("Valeur acquise : "), ...fr(reponse(e, "total")), t(".")];
  }
}

function enoncePapier(e: E): EnoncePapier {
  const lettres = phasesInteretsComposes(e).map((_, k) => lettreEtape(k));
  if (e.variante === "duree")
    return {
      section: {
        enteteFragments: fr(situation(e)),
        questions: [
          { consigne: [t(`Au bout de combien d'années entières le capital atteindra-t-il au moins ${eurT(e.cible)} ?`)] },
          { consigne: [t("Quel sera alors le capital ?")] },
        ],
      },
      etapesParQuestion: [["a", "b"], ["c"]],
      reponseBreve: reponseBreve(e),
    };
  return { section: { enteteFragments: fr(situation(e)), questions: [{ consigne: fr(question(e)) }] }, etapesParQuestion: [lettres], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Écrans de choix (méthode reconnue) et lectures : le « montant » est lu dans la table déjà dressée. */
function criteresDifficulte(e: E): CriteresDifficulte {
  const lecture = e.variante === "duree" ? ["c"] : [];
  const methode = e.variante === "valeurAcquise" || e.variante === "dureeMixte" ? 0 : 1;
  return { ...etapesDuCorrige(correctionDetailleeInteretsComposes(e), lecture), methode, piege: 0, nombres: 1 };
}

const POIDS: Record<PhaseInteretsComposes, number> = { suite: 1, valeur: 2, interets: 1, formule: 1.5, capital: 2.5, taux: 2.5, inequation: 1.5, annees: 2, montant: 0.5, composes: 1.5, simple: 1.5, total: 1 };

function bareme(e: E): BaremeExercice {
  const ph = phasesInteretsComposes(e);
  const pts = repartir(ph.map((p) => POIDS[p]));
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, k) => ({ sousQuestion: lettreEtape(k), critere: [t(`${libelle(e, p)} : `), ...fr(reponse(e, p))], points: pts[k]! })),
    erreursFrequentes: [
      { description: [t("Formule de l'intérêt simple au lieu des intérêts composés")], cout: "0 pt sur l'étape" },
      { description: [t("Taux laissé en % dans le facteur (1 + 3,5 au lieu de 1,035)")], cout: "−1 pt" },
      ...(e.variante === "duree" || e.variante === "doublement" ? [{ description: [t("Dernière année où le montant n'est pas atteint (une année trop tôt)")], cout: "−1 pt" }] : []),
      ...(e.variante === "taux" ? [{ description: [t("Racine n-ième sans retirer 1")], cout: "−1 pt" }] : []),
    ],
    reponsesAcceptees: [[t("Montants à un centime près ; taux en % ou en écriture décimale ; table ou essais successifs pour la durée")]],
  };
}

export function profilInteretsComposes(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: e.variante };
}

export const adaptateurEvaluationInteretsComposes56: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Intérêts composés — Évaluation",
  nomFichierBase: "interets-composes",
  genererInstance: genererExerciceInteretsComposes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeInteretsComposes,
  bareme,
  enoncePapier,
  profilInstance: profilInteretsComposes,
  calculatriceIndispensable: true,
};
