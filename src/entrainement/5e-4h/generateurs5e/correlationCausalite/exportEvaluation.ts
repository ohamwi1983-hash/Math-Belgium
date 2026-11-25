import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceCorrelationCausalite } from "./index";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCorrelationCausalite } from "./index";
import { CATALOGUE_COURT, CONSIGNE_PAPIER, consigne, correctionDetailleeCorrelationCausalite, enonce, frags, PHASES_CORRELATION, situationDe } from "../../ui5e/formatCorrelationCausalite";

/**
 * Adaptateur papier de `5gen80` « Corrélation ou causalité ? ». Énoncé = la situation rédigée (deux
 * grandeurs corrélées et une conclusion hâtive) + UNE consigne commune à toutes les situations (les
 * cinq types d'explication y sont nommés, aucun n'est suggéré) ; les deux écrans deviennent les
 * étapes a, b du corrigé. Le type (= variante) dit la réponse : groupe à verdict `groupe_explication`
 * (les cinq). Regroupement a), b), c) : consigne commune, la LIGNE est la situation (entrée `5gen80` de
 * `regroupementsPapier.ts`). Niveau et durée constants (deux étapes de raisonnement, méthode 1).
 */

type E = ExerciceCorrelationCausalite;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(enonce(e)), questions: PHASES_CORRELATION.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t(`${CATALOGUE_COURT[e.variante]} : `), ...fr(frags(situationDe(e).bonne))];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: fr(enonce(e)), questions: [{ consigne: [t(CONSIGNE_PAPIER)] }] }, etapesParQuestion: [["a", "b"]], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 2, etapesLecture: 0, methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t(`Type d'explication : ${CATALOGUE_COURT[e.variante].toLowerCase()}`)], points: 2 },
      { sousQuestion: "b", critere: [t(e.variante === "causeCommune" ? "Troisième grandeur nommée et justifiée : " : "Explication précise : "), ...fr(frags(situationDe(e).bonne))], points: 2 },
    ],
    erreursFrequentes: [
      { description: [t("« r est proche de 1, donc l'une cause l'autre »")], cout: "0 pt" },
      { description: [t("Troisième grandeur qui n'agit que sur une des deux grandeurs")], cout: "moitié des points de l'explication" },
    ],
    reponsesAcceptees: [[t("Toute formulation équivalente ; une autre explication raisonnable bien justifiée est acceptée sur l'étape b")]],
  };
}

export function profilCorrelationCausalite(_e: E): ProfilInstance {
  return { casParticulier: null };
}

export const adaptateurEvaluationCorrelationCausalite: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Corrélation ou causalité ? — Évaluation",
  nomFichierBase: "correlation-causalite",
  genererInstance: genererExerciceCorrelationCausalite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeCorrelationCausalite,
  bareme,
  enoncePapier,
  profilInstance: profilCorrelationCausalite,
  groupesVerdict: [{ id: "groupe_explication", label: "Situation (type d'explication tiré au hasard)", variantes: CATALOGUE_VARIANTES.map((c) => c.id) }],
};
