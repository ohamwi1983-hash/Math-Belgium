import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { lettreEtape, latex, texte } from "../../../export/corrigeTableau";
import type { Exercice114, Nature114 } from "../../core6e/discreteOuContinue";
import { PHASES_114, situation114 } from "../../core6e/discreteOuContinue";
import { consigne114, consigneGlobale114, nomNature, situationTexte114 } from "../../ui6e/formatDiscreteOuContinue";
import { fr } from "../../ui6e/outilsVariablesAleatoiresLotH1";
import { CATALOGUE_114, construireAvecVariante114, genererExercice114 } from "./index";
import { correctionDetaillee114 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen114` « Discrète ou continue ? » (Connaître). Énoncé papier = situation +
 * consigne globale (nature, valeurs, outil, P(X = c), justifier) ; les écrans deviennent les étapes du
 * corrigé. La NATURE est le verdict : jamais dans `forme`, jamais cas particulier ; les variantes
 * portent son nom → `groupe_nature` (groupe à verdict). Critères FIXES (trois décisions, méthode 0,
 * piège 0, `sansCharge`) : même niveau et même durée pour les deux natures. Aucun `calcul`.
 * Regroupement a), b), c) : entrée `6gen114` de `REGROUPEMENTS` (consigne commune, ligne = la situation).
 */

type E = Exercice114;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situationTexte114(e)), questions: PHASES_114.map((p) => ({ consigne: fr(consigne114(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const s = situation114(e);
  return [t(`${nomNature(e.nature)} ; valeurs `), latex(s.valeurs[0]), t(e.nature === "discrete" ? " ; somme des " : " ; intégrale de la densité, "), ...(e.nature === "discrete" ? [latex("P(X=k)"), t(", "), latex("P(X=c)"), t(" peut être non nulle")] : [latex("P(X=c)=0")])];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situationTexte114(e)), questions: [{ consigne: fr(consigneGlobale114()) }] },
    etapesParQuestion: [PHASES_114.map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(): CriteresDifficulte {
  // Trois décisions directes du cours (méthode 0), aucun piège compté (les situations-pièges existent
  // dans les deux natures : critères fixes pour ne pas trahir le verdict).
  return { etapesTransformation: 3, etapesLecture: 0, methode: 0, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const s = situation114(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: lettreEtape(0), critere: [t(`Nature (${nomNature(e.nature)}), justifiée`)], points: 1.5 },
      { sousQuestion: lettreEtape(1), critere: [t("Ensemble des valeurs : "), latex(s.valeurs[0])], points: 1 },
      { sousQuestion: lettreEtape(2), critere: e.nature === "discrete" ? [t("Somme des "), latex("P(X=k)"), t(", "), latex("P(X=c)"), t(" non nulle en général")] : [t("Intégrale de la densité, "), latex("P(X=c)=0")], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [t("Mesure arrondie prise pour une variable continue, ou comptage sans maximum pris pour une variable continue")], cout: "0 pt sur la nature" },
      { description: [t("Intervalle donné pour une variable discrète (ou valeurs isolées pour une variable continue)")], cout: "0 pt sur les valeurs" },
    ],
    reponsesAcceptees: [[t("Toute justification équivalente (« on compte » / « on mesure exactement »)")]],
  };
}

export function profil114(_e: E): ProfilInstance {
  return { casParticulier: null };
}

export const adaptateurEvaluation114: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Discrète ou continue ? — Évaluation",
  nomFichierBase: "discrete-ou-continue",
  genererInstance: genererExercice114,
  catalogueVariantes: CATALOGUE_114,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante114(id as Nature114),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee114,
  bareme,
  enoncePapier,
  profilInstance: profil114,
  groupesVerdict: [{ id: "groupe_nature", label: "Nature tirée au hasard (discrète ou continue)", variantes: ["discrete", "continue"] }],
};
