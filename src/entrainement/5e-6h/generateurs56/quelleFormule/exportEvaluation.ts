import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceQuelleFormule } from "./index";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceQuelleFormule } from "./index";
import { CONSIGNE_PAPIER, consigne, PHASES, reponse, situation } from "./format";
import { correctionDetailleeQuelleFormule } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen23` « Quelle formule ? ». Énoncé = la situation + UNE consigne (« Reconnais le
 * type de problème, la grandeur cherchée et la formule… Ne fais pas le calcul. ») ; regroupé a), b), c)
 * (entrée `56gen23` de `regroupementsPapier.ts`, ligne = la situation). Type = variante, tiré au neuvième
 * AVANT les nombres ; `groupe_type` (les neuf). Aucun `calcul` (rien à calculer), aucune `forme`.
 */

type E = ExerciceQuelleFormule;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [...fr(reponse(e, "famille")), t(" ; on cherche : "), t(fr(reponse(e, "grandeur"))[0]!.valeur.replace(/^./, (c) => c.toLowerCase())), t(" ; formule : "), ...fr(reponse(e, "formule")), t(".")];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: fr(situation(e)), questions: [{ consigne: [t(CONSIGNE_PAPIER)] }] }, etapesParQuestion: [["a", "b", "c"]], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Trois décisions (famille, grandeur, formule), méthode 1 (reconnaître parmi celles du cours), aucun nombre.
  return { ...etapesDuCorrige(correctionDetailleeQuelleFormule(e), []), methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Type de problème : "), ...fr(reponse(e, "famille")), t(", justifié par l'énoncé")], points: 1.25 },
      { sousQuestion: "b", critere: [t("Grandeur cherchée et données identifiées")], points: 1 },
      { sousQuestion: "c", critere: [t("Formule juste, transformée si nécessaire : "), ...fr(reponse(e, "formule"))], points: 1.75 },
    ],
    erreursFrequentes: [
      { description: [t("Intérêt simple et intérêts composés confondus")], cout: "0 pt sur le type et la formule" },
      { description: [t("Formule non transformée (grandeur cherchée non isolée)")], cout: "−0,75 pt" },
    ],
    reponsesAcceptees: [[t("Formule équivalente correctement transformée ; données citées dans un autre ordre")]],
  };
}

export function profilQuelleFormule(_e: E): ProfilInstance {
  return { casParticulier: null };
}

export const adaptateurEvaluationQuelleFormule56: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Quelle formule ? — Évaluation",
  nomFichierBase: "quelle-formule-finance",
  genererInstance: genererExerciceQuelleFormule,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeQuelleFormule,
  bareme,
  enoncePapier,
  profilInstance: profilQuelleFormule,
  groupesVerdict: [{ id: "groupe_type", label: "Situation (type de problème tiré au hasard)", variantes: CATALOGUE_VARIANTES.map((c) => c.id) }],
};
