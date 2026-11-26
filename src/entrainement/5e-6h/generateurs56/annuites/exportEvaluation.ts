import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import { repartir } from "../finance/commun";
import type { ExerciceAnnuites, PhaseAnnuites } from "./index";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAnnuites, phasesAnnuites } from "./index";
import { consigne, libelle, question, reponse, situation } from "./format";
import { correctionDetailleeAnnuites } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen27` « Annuités : placement et remboursement ». Énoncé = situation +
 * question globale ; ligne du temps dans le corrigé (jamais dans l'énoncé). `calcul: 'calculatrice'`,
 * aucun menu financier supposé (formules du cours).
 */

type E = ExerciceAnnuites;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), questions: phasesAnnuites(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.variante) {
    case "placementDernier":
    case "mensuel":
      return [t("Capital : "), ...fr(reponse(e, "valeur")), t(" ; intérêts : "), ...fr(reponse(e, "interets")), t(".")];
    case "placementApres":
      return [t("Capital au 31 décembre : "), ...fr(reponse(e, "cherchee")), t(".")];
    case "valeurActuelle":
      return [t("Montant empruntable : "), ...fr(reponse(e, "capital")), t(" ; intérêts : "), ...fr(reponse(e, "interets")), t(".")];
    case "versement":
      return [t("Versement annuel : "), ...fr(reponse(e, "versement")), t(".")];
  }
}

function enoncePapier(e: E): EnoncePapier {
  const lettres = phasesAnnuites(e).map((_, k) => lettreEtape(k));
  return { section: { enteteFragments: fr(situation(e)), questions: [{ consigne: fr(question(e)) }] }, etapesParQuestion: [lettres], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Formule à choisir parmi celles du cours (valeur acquise / actuelle, moment) : méthode 1.
  return { ...etapesDuCorrige(correctionDetailleeAnnuites(e), []), methode: 1, piege: 0, nombres: 1 };
}

const POIDS: Record<PhaseAnnuites, number> = { formule: 1.5, moment: 1, valeur: 2, cherchee: 1, interets: 0.75, capital: 2, versement: 2, tauxMensuel: 1 };

function bareme(e: E): BaremeExercice {
  const ph = phasesAnnuites(e);
  const pts = repartir(ph.map((p) => POIDS[p]));
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, k) => ({ sousQuestion: lettreEtape(k), critere: [t(`${libelle(e, p)} : `), ...fr(reponse(e, p))], points: pts[k]! })),
    erreursFrequentes: [
      { description: [t("Valeur acquise et valeur actuelle confondues")], cout: "0 pt sur l'étape" },
      { description: [t("Somme des versements donnée sans intérêts")], cout: "0 pt sur l'étape" },
      ...(e.variante === "placementApres" || e.variante === "versement" ? [{ description: [t("Facteur 1 + i oublié (ou en trop) pour la période après le dernier versement")], cout: "−1 pt" }] : []),
      ...(e.variante === "mensuel" ? [{ description: [t("Taux mensuel pris égal au taux annuel divisé par 12")], cout: "−1 pt" }] : []),
    ],
    reponsesAcceptees: [[t("Montants à un centime près (taux mensuel en mémoire ou arrondi au millième de %)")]],
  };
}

export function profilAnnuites(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: e.variante === "versement" ? `versement-${e.apres ? "apres" : "dernier"}` : e.variante };
}

export const adaptateurEvaluationAnnuites56: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Annuités : placement et remboursement — Évaluation",
  nomFichierBase: "annuites",
  genererInstance: genererExerciceAnnuites,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeAnnuites,
  bareme,
  enoncePapier,
  profilInstance: profilAnnuites,
  calculatriceIndispensable: true,
};
