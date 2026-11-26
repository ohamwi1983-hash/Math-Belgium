import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import { tableauHtml } from "../../../5e-4h/ui5e/definitionRelevesSinusoide";
import { repartir } from "../finance/commun";
import type { ExerciceCredit, PhaseCredit } from "./index";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCredit, phasesCredit } from "./index";
import { consigne, libelle, question, reponse, situation, tableau } from "./format";
import { correctionDetailleeCredit } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen28` « Crédit et tableau d'amortissement ». Énoncé = situation (+ extrait du
 * tableau d'amortissement pour la variante « tableau ») + question globale ; l'amortissement constant pose
 * de VRAIES questions (amortissement et premier intérêt ; nature de la suite ; mensualité du mois k ;
 * total des intérêts). `calcul: 'calculatrice'`, aucun menu financier supposé.
 */

type E = ExerciceCredit;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  const tab = tableau(e);
  return { enteteFragments: fr(situation(e)), ...(tab ? { enteteHtml: tableauHtml(tab) } : {}), questions: phasesCredit(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.variante) {
    case "mensualite":
      return [t("Taux mensuel : "), ...fr(reponse(e, "tauxMensuel")), t(" ; mensualité : "), ...fr(reponse(e, "mensualite")), t(" ; coût : "), ...fr(reponse(e, "cout")), t(".")];
    case "montantEmprunte":
      return [t("Montant empruntable : "), ...fr(reponse(e, "capital")), t(" ; coût : "), ...fr(reponse(e, "cout")), t(".")];
    case "tableau":
      return [t(`Ligne ${e.k} : `), ...fr(reponse(e, "ligne1")), t(` ; ligne ${e.k + 1} : `), ...fr(reponse(e, "ligne2")), t(".")];
    case "amortissementConstant":
      return [t("a) "), ...fr(reponse(e, "amortissement")), t(", "), ...fr(reponse(e, "interet1")), t(" ; b) suite arithmétique ; c) "), ...fr(reponse(e, "mensualiteK")), t(" ; d) "), ...fr(reponse(e, "totalInterets")), t(".")];
  }
}

function enoncePapier(e: E): EnoncePapier {
  const lettres = phasesCredit(e).map((_, k) => lettreEtape(k));
  const tab = tableau(e);
  if (e.variante === "amortissementConstant")
    return {
      section: {
        enteteFragments: fr(situation(e)),
        questions: [
          { consigne: [t("Calcule l'amortissement mensuel et l'intérêt payé le premier mois.")] },
          { consigne: [t("Montre que les intérêts mensuels forment une suite arithmétique et donne sa raison.")] },
          { consigne: [t(`Calcule la mensualité du mois ${e.rang}.`)] },
          { consigne: [t(`Calcule le total des intérêts payés sur les ${e.n} mois.`)] },
        ],
      },
      etapesParQuestion: [["a", "b"], ["c"], ["d"], ["e"]],
      reponseBreve: reponseBreve(e),
    };
  return { section: { enteteFragments: fr(situation(e)), ...(tab ? { enteteHtml: tableauHtml(tab) } : {}), questions: [{ consigne: fr(question(e)) }] }, etapesParQuestion: [lettres], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeCredit(e), []), methode: 1, piege: 0, nombres: 1 };
}

const POIDS: Record<PhaseCredit, number> = { tauxMensuel: 1, mensualite: 2, capital: 2, cout: 1, ligne1: 1.5, ligne2: 1.5, amortissement: 0.5, interet1: 0.5, nature: 1, mensualiteK: 1, totalInterets: 1 };

function bareme(e: E): BaremeExercice {
  const ph = phasesCredit(e);
  const pts = repartir(ph.map((p) => POIDS[p]));
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, k) => ({ sousQuestion: lettreEtape(k), critere: [t(`${libelle(e, p)} : `), ...fr(reponse(e, p))], points: pts[k]! })),
    erreursFrequentes: [
      ...(e.variante === "amortissementConstant"
        ? [{ description: [t("Intérêt calculé sur l'amortissement au lieu du capital restant dû")], cout: "0 pt sur l'intérêt" }, { description: [t("Total des intérêts = n fois l'intérêt du premier mois")], cout: "0 pt sur le total" }]
        : [{ description: [t("Taux mensuel pris égal au TAEG divisé par 12")], cout: "−0,5 pt" }, { description: [t("Intérêts d'un mois calculés avec le TAEG")], cout: "0 pt sur l'étape" }]),
      ...(e.variante === "mensualite" || e.variante === "montantEmprunte" ? [{ description: [t("Total payé donné comme coût du crédit")], cout: "0 pt sur le coût" }] : []),
    ],
    reponsesAcceptees: [[t("Montants à un centime près ; calcul avec le taux mensuel en mémoire ou arrondi au millième de % ; coût avec la mensualité arrondie ou exacte")]],
  };
}

export function profilCredit(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: e.variante };
}

export const adaptateurEvaluationCredit56: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Crédit et tableau d'amortissement — Évaluation",
  nomFichierBase: "credit-amortissement",
  genererInstance: genererExerciceCredit,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeCredit,
  bareme,
  enoncePapier,
  profilInstance: profilCredit,
  calculatriceIndispensable: true,
};
